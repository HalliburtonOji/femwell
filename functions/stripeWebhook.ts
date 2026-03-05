import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    return Response.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { user_id, plan } = session.metadata;

    const existing = await base44.asServiceRole.entities.Entitlements.filter({ user_id });
    if (existing.length > 0) {
      await base44.asServiceRole.entities.Entitlements.update(existing[0].id, { plan, user_id });
    } else {
      await base44.asServiceRole.entities.Entitlements.create({ user_id, plan });
    }
  }

  return Response.json({ received: true });
});