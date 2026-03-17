import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentIntent, createStripeCustomer } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/payments/create-intent
 * Create a Stripe payment intent for an invoice
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { error: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // Verify invoice exists and belongs to current user (if customer) or is admin
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId: string;

    // Check if customer already has a Stripe ID (stored in metadata or a new field)
    const stripeCustomer = await createStripeCustomer(invoice.customerId);
    stripeCustomerId = stripeCustomer.id;

    // Create payment intent
    const paymentIntent = await createPaymentIntent(invoiceId, stripeCustomerId);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    });
  } catch (error) {
    console.error("[API] Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
