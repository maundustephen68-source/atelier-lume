import Stripe from "stripe";
import { config } from "./config";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-06-20",
});

// Creates a Stripe-hosted Checkout Session. The client is redirected to
// Stripe's own page to enter card details - no card data ever reaches our
// server or database. On success Stripe redirects back and, separately,
// fires a webhook we verify and use as the source of truth (see
// app/api/webhooks/stripe/route.ts) rather than trusting the redirect alone.
export async function createCheckoutSession(params: {
  bookingId: string;
  amount: number; // in the currency's smallest unit (cents)
  serviceName: string;
  clientEmail: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: params.clientEmail,
    line_items: [
      {
        price_data: {
          currency: config.currency,
          product_data: { name: `Booking - ${params.serviceName}` },
          unit_amount: Math.round(params.amount),
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: params.bookingId },
    // Idempotency: reuse the same key if a client retries session creation
    // for the same held booking, so we never spin up two competing sessions.
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
  }, {
    idempotencyKey: `checkout-${params.bookingId}`,
  });
}
