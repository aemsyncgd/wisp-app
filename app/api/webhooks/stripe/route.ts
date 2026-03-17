import { NextRequest, NextResponse } from "next/server";
import { verifyStripeSignature, handleStripeWebhook } from "@/lib/stripe";

/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("stripe-signature") || "";
    const body = await request.text();

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("[Webhook] STRIPE_WEBHOOK_SECRET not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    // Verify the signature
    const event = verifyStripeSignature(body, signature, webhookSecret);

    // Handle the event
    await handleStripeWebhook(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing Stripe webhook:", error);

    if (error instanceof Error && error.message.includes("timestamp outside")) {
      return NextResponse.json(
        { error: "Request timestamp too old" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
