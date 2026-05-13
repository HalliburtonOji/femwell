import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_API_KEY'));

const PRICE_IDS = {
  plus: Deno.env.get('STRIPE_PLUS_PRICE_ID') || 'price_plus',
  pro: Deno.env.get('STRIPE_PRO_PRICE_ID') || 'price_pro',
};

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan, success_url, cancel_url, return_to } = await req.json();

  const priceId = PRICE_IDS[plan];
  if (!priceId) return Response.json({ error: 'Invalid plan' }, { status: 400 });

  // Allow callers (e.g. the Atelier paywall) to pass return_to: 'Horoscope'
  // so Stripe drops the user back on the right tab after checkout. We
  // whitelist the page key against pages.config to avoid open-redirect risk.
  const origin = req.headers.get('origin') || '';
  const WHITELIST = new Set(['Today', 'Horoscope', 'Lifestyle', 'Profile', 'Insights']);
  const safeReturn = WHITELIST.has(String(return_to || '')) ? String(return_to) : null;
  const computedSuccess = success_url
    || (safeReturn ? `${origin}/${safeReturn}?upgraded=1` : `${origin}/`);
  const computedCancel = cancel_url
    || (safeReturn ? `${origin}/${safeReturn}` : `${origin}/`);

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: computedSuccess,
    cancel_url: computedCancel,
    metadata: { user_id: user.id, user_email: user.email, plan },
    customer_email: user.email,
  });

  return Response.json({ url: session.url });
});
