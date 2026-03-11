// api/stripe-webhook.js
// Vercel Serverless Function — handles Stripe webhook events.
//
// TODO: wire up when Stripe account is ready.
// 1. Add to Vercel env vars:
//    STRIPE_SECRET_KEY=sk_live_...
//    STRIPE_WEBHOOK_SECRET=whsec_...  (from Stripe dashboard → Webhooks)
//    SUPABASE_URL=https://xxx.supabase.co
//    SUPABASE_SERVICE_ROLE_KEY=eyJ...  (service role — bypasses RLS)
//
// 2. In Stripe dashboard → Webhooks, add endpoint:
//    https://testtube-rho.vercel.app/api/stripe-webhook
//    Events to listen for:
//      checkout.session.completed
//      customer.subscription.updated
//      customer.subscription.deleted
//
// 3. Uncomment the Stripe block below and remove the placeholder response.

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── Stripe (uncomment when ready) ──────────────────────────────────────────
  // const Stripe = require("stripe");
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  // const { createClient } = require("@supabase/supabase-js");
  // const supabaseAdmin = createClient(
  //   process.env.SUPABASE_URL,
  //   process.env.SUPABASE_SERVICE_ROLE_KEY
  // );
  //
  // // Verify webhook signature
  // const chunks = [];
  // for await (const chunk of req) chunks.push(chunk);
  // const rawBody = Buffer.concat(chunks);
  // let event;
  // try {
  //   event = stripe.webhooks.constructEvent(
  //     rawBody,
  //     req.headers["stripe-signature"],
  //     process.env.STRIPE_WEBHOOK_SECRET
  //   );
  // } catch (err) {
  //   return res.status(400).json({ error: `Webhook error: ${err.message}` });
  // }
  //
  // // Handle events
  // switch (event.type) {
  //
  //   case "checkout.session.completed": {
  //     const session = event.data.object;
  //     const userId = session.metadata?.userId;
  //     if (!userId) break;
  //     // Link Stripe customer to profile
  //     await supabaseAdmin
  //       .from("profiles")
  //       .update({
  //         stripe_customer_id: session.customer,
  //         subscription_status: "premium",
  //         subscription_expires_at: null, // managed by subscription events
  //       })
  //       .eq("id", userId);
  //     break;
  //   }
  //
  //   case "customer.subscription.updated": {
  //     const sub = event.data.object;
  //     const status = sub.status === "active" ? "premium" : "free";
  //     const expiresAt = sub.current_period_end
  //       ? new Date(sub.current_period_end * 1000).toISOString()
  //       : null;
  //     await supabaseAdmin
  //       .from("profiles")
  //       .update({ subscription_status: status, subscription_expires_at: expiresAt })
  //       .eq("stripe_customer_id", sub.customer);
  //     break;
  //   }
  //
  //   case "customer.subscription.deleted": {
  //     const sub = event.data.object;
  //     await supabaseAdmin
  //       .from("profiles")
  //       .update({ subscription_status: "cancelled", subscription_expires_at: new Date().toISOString() })
  //       .eq("stripe_customer_id", sub.customer);
  //     break;
  //   }
  //
  //   default:
  //     break;
  // }
  //
  // return res.status(200).json({ received: true });
  // ───────────────────────────────────────────────────────────────────────────

  // Placeholder
  return res.status(200).json({ received: true });
}
