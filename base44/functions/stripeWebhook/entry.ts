import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));

const ONE_SHOT_PRODUCTS = new Set(['year_ahead', 'chart_atelier', 'choose_the_day']);
const ONE_SHOT_PDF_PRODUCTS = new Set(['year_ahead', 'chart_atelier']);

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
    const metadata = session.metadata || {};
    const { user_id, plan, product, kind } = metadata;

    // ── One-shot product completion (kind === 'one_shot') ───────────────
    if (kind === 'one_shot' && product && ONE_SHOT_PRODUCTS.has(String(product))) {
      try {
        const existing = await base44.asServiceRole.entities.OneShotPurchases.filter(
          { stripe_session_id: session.id }, undefined, 1,
        ).catch(() => []);
        const now = new Date().toISOString();
        const patch: any = {
          status: 'paid',
          paid_at: now,
        };
        if (session.payment_intent) {
          patch.stripe_payment_intent_id = String(session.payment_intent);
        }
        if (existing.length > 0) {
          await base44.asServiceRole.entities.OneShotPurchases.update(existing[0].id, patch);
        } else if (user_id) {
          // Webhook arrived before createOneShotCheckout's row write — create
          // a paid row directly from metadata so the operator can still see it.
          await base44.asServiceRole.entities.OneShotPurchases.create({
            user_id,
            product,
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent ? String(session.payment_intent) : undefined,
            status: 'paid',
            paid_at: now,
            created_at: now,
          });
        }
      } catch (err) {
        console.error('[stripeWebhook] OneShotPurchases update failed:', err?.message || err);
      }

      // For PDF products (year_ahead + chart_atelier), queue delivery via
      // the orchestrator phase 'deliverOneShot'. H3 implements the actual
      // PDF generator; for H2d we just queue the phase request — failures
      // here don't block the webhook acknowledgement.
      if (ONE_SHOT_PDF_PRODUCTS.has(String(product))) {
        try {
          await base44.asServiceRole.functions.invoke('pipelineOrchestrator', {});
          // The above invocation runs the daily pipeline. For an explicit
          // deliveryOneShot phase enqueue, the orchestrator inspects
          // OneShotPurchases status=paid rows on its own pass (H3 work).
        } catch (err) {
          console.error('[stripeWebhook] deliverOneShot enqueue failed:', err?.message || err);
        }
      }

      return Response.json({ received: true, kind: 'one_shot', product });
    }

    // ── Subscription completion (existing behaviour) ─────────────────────
    if (user_id && plan) {
      const existing = await base44.asServiceRole.entities.Entitlements.filter({ user_id });
      if (existing.length > 0) {
        await base44.asServiceRole.entities.Entitlements.update(existing[0].id, { plan, user_id });
      } else {
        await base44.asServiceRole.entities.Entitlements.create({ user_id, plan });
      }
    }
  }

  return Response.json({ received: true });
});
