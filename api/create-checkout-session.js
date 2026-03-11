// api/create-checkout-session.js
// Vercel Serverless Function — creates a Stripe Checkout session.
//
// TODO: wire up when Stripe account is ready.
// 1. npm install stripe
// 2. Add to Vercel env vars:
//    STRIPE_SECRET_KEY=sk_live_...
//    STRIPE_PREMIUM_PRICE_ID=price_...  (฿99/month recurring price)
//    NEXT_PUBLIC_SITE_URL=https://testtube-rho.vercel.app
//
// 3. Uncomment the Stripe block below and remove the placeholder response.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // const { userId } = req.body;
  // if (!userId) return res.status(400).json({ error: "userId required" });

  // ── Stripe (uncomment when ready) ──────────────────────────────────────────
  // const Stripe = require("stripe");
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  //
  // const session = await stripe.checkout.sessions.create({
  //   mode: "subscription",
  //   payment_method_types: ["card", "promptpay"],
  //   line_items: [{ price: process.env.STRIPE_PREMIUM_PRICE_ID, quantity: 1 }],
  //   success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?success=1`,
  //   cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
  //   metadata: { userId },
  //   // Collect Thai address for tax purposes (optional)
  //   // billing_address_collection: "required",
  // });
  //
  // return res.status(200).json({ url: session.url });
  // ───────────────────────────────────────────────────────────────────────────

  // Placeholder — remove when Stripe is wired up
  return res.status(503).json({ error: "Payment processing not yet configured." });
}
