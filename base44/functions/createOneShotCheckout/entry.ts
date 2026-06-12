// createOneShotCheckout:
// Wraps Stripe checkout for one-shot 'mode: payment' purchases from the
// Horoscope Paid Shelf. Three products:
//   - year_ahead     (£19  / 1900 pence)
//   - chart_atelier  (£29  / 2900 pence)
//   - choose_the_day (£55  / 5500 pence)
//
// Body: { product: 'year_ahead' | 'chart_atelier' | 'choose_the_day' }
// Returns:
//   - env price ID present →
//       { simulated: false, checkout_url, purchase_id }
//   - env price ID missing →
//       { simulated: true, message: "Coming soon — your interest has been logged.",
//         purchase_id, thank_you_url }
//
// Writes an OneShotPurchases row in either case so we can audit demand even
// before real Stripe keys land.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const PRODUCT_META: Record<string, { price_pence: number; label: string; envVar: string; turnaround: string }> = {
  year_ahead: {
    price_pence: 1900,
    label: 'Your Year Ahead',
    envVar: 'STRIPE_YEAR_AHEAD_PRICE_ID',
    turnaround: '24 hours',
  },
  chart_atelier: {
    price_pence: 2900,
    label: 'Birth Chart Atelier',
    envVar: 'STRIPE_CHART_ATELIER_PRICE_ID',
    turnaround: '48 hours',
  },
  choose_the_day: {
    price_pence: 5500,
    label: 'Choose The Day',
    envVar: 'STRIPE_CHOOSE_THE_DAY_PRICE_ID',
    turnaround: '7 days',
  },
};

// Timeout guard — an awaited platform/AI call that HANGS would wedge the function.
function withTimeout(p: Promise<any>, ms: number, label: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label}-timeout-${ms}ms`)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me().catch(() => null);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let body: any = {};
  try { body = await req.json(); }
  catch { return Response.json({ error: 'Bad JSON' }, { status: 400 }); }

  const product = String(body?.product || '');
  const meta = PRODUCT_META[product];
  if (!meta) {
    return Response.json({ error: 'Invalid product' }, { status: 400 });
  }

  const sb = base44.asServiceRole;
  const now = new Date().toISOString();
  const origin = req.headers.get('origin') || '';
  const thankYouUrl = `${origin}/OneShotThankYou?product=${encodeURIComponent(product)}`;

  const priceId = Deno.env.get(meta.envVar);

  // ── Simulated path ──────────────────────────────────────────────────────
  // No env price ID set yet. Log the interest as a OneShotPurchases row with
  // status: 'simulated' so the operator can see demand before flipping the
  // real Stripe keys on.
  if (!priceId) {
    let row: any = null;
    try {
      row = await withTimeout(sb.entities.OneShotPurchases.create({
        user_id: user.id,
        product,
        price_pence: meta.price_pence,
        status: 'simulated',
        created_at: now,
      }), 15000, 'stripe');
    } catch (err: any) {
      return Response.json({
        error: err?.message || 'Failed to log interest',
      }, { status: 500 });
    }
    return Response.json({
      simulated: true,
      message: 'Coming soon — your interest has been logged.',
      purchase_id: row?.id || null,
      thank_you_url: `${thankYouUrl}&simulated=1`,
    });
  }

  // ── Real Stripe path ────────────────────────────────────────────────────
  const stripeKey = Deno.env.get('STRIPE_API_KEY');
  if (!stripeKey) {
    return Response.json({
      error: 'STRIPE_API_KEY missing — cannot create real checkout.',
    }, { status: 500 });
  }
  const stripe = new Stripe(stripeKey);

  let session;
  try {
    session = await withTimeout(stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${thankYouUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/Horoscope`,
      metadata: {
        user_id: user.id,
        user_email: user.email,
        product,
        kind: 'one_shot',
      },
      customer_email: user.email,
    }), 15000, 'stripe');
  } catch (err: any) {
    return Response.json({
      error: err?.message || 'Stripe checkout creation failed',
    }, { status: 502 });
  }

  let row: any = null;
  try {
    row = await withTimeout(sb.entities.OneShotPurchases.create({
      user_id: user.id,
      product,
      price_pence: meta.price_pence,
      stripe_session_id: session.id,
      status: 'pending_payment',
      created_at: now,
    }), 15000, 'stripe');
  } catch (err: any) {
    // The Stripe session was created — let the user proceed; the webhook
    // will reconcile via the session_id metadata even without a row.
    return Response.json({
      simulated: false,
      checkout_url: session.url,
      purchase_id: null,
      warning: `OneShotPurchases.create failed: ${err?.message || 'unknown'}`,
    });
  }

  return Response.json({
    simulated: false,
    checkout_url: session.url,
    purchase_id: row?.id || null,
  });
});
