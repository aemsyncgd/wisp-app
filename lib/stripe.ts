import Stripe from "stripe";
import { prisma } from "./prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

/**
 * Create a Stripe customer for a WISP customer
 */
export async function createStripeCustomer(customerId: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error("Customer not found");
    }

    const stripeCustomer = await stripe.customers.create({
      email: customer.email,
      name: `${customer.firstName} ${customer.lastName}`,
      phone: customer.phone || undefined,
      metadata: {
        wispCustomerId: customerId,
      },
    });

    return stripeCustomer;
  } catch (error) {
    console.error("[Stripe] Error creating customer:", error);
    throw error;
  }
}

/**
 * Create a payment intent for an invoice
 */
export async function createPaymentIntent(
  invoiceId: string,
  stripeCustomerId: string
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { customer: true },
    });

    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Amount in cents
    const amountInCents = Math.round(invoice.totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      customer: stripeCustomerId,
      metadata: {
        invoiceId: invoiceId,
        customerId: invoice.customerId,
      },
      description: invoice.description || `Invoice ${invoice.invoiceNumber}`,
    });

    return paymentIntent;
  } catch (error) {
    console.error("[Stripe] Error creating payment intent:", error);
    throw error;
  }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event) {
  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
        await handleRefund(event.data.object as Stripe.Charge);
        break;
      default:
        console.log(`[Stripe] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error("[Stripe] Error handling webhook:", error);
    throw error;
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const invoiceId = paymentIntent.metadata.invoiceId;
    const customerId = paymentIntent.metadata.customerId;

    if (!invoiceId) {
      console.warn("[Stripe] No invoiceId in payment intent metadata");
      return;
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        customerId,
        invoiceId,
        amount: (paymentIntent.amount / 100).toFixed(2) as any,
        paymentMethod: "CREDIT_CARD",
        transactionId: paymentIntent.id,
        status: "COMPLETED",
        processedDate: new Date(),
      },
    });

    // Update invoice status
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (invoice) {
      const totalPaid = invoice.payments.reduce(
        (sum, p) => sum + (p.status === "COMPLETED" ? p.amount : 0),
        paymentIntent.amount / 100
      );

      if (totalPaid >= invoice.totalAmount) {
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: {
            status: "PAID",
            paidDate: new Date(),
          },
        });
      }
    }

    console.log(
      `[Stripe] Payment succeeded for invoice ${invoiceId}: ${payment.id}`
    );
  } catch (error) {
    console.error("[Stripe] Error handling payment succeeded:", error);
    throw error;
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const invoiceId = paymentIntent.metadata.invoiceId;
    const customerId = paymentIntent.metadata.customerId;

    if (!invoiceId) {
      console.warn("[Stripe] No invoiceId in payment intent metadata");
      return;
    }

    // Create failed payment record
    await prisma.payment.create({
      data: {
        customerId,
        invoiceId,
        amount: (paymentIntent.amount / 100).toFixed(2) as any,
        paymentMethod: "CREDIT_CARD",
        transactionId: paymentIntent.id,
        status: "FAILED",
      },
    });

    console.log(
      `[Stripe] Payment failed for invoice ${invoiceId}: ${paymentIntent.last_payment_error?.message}`
    );
  } catch (error) {
    console.error("[Stripe] Error handling payment failed:", error);
    throw error;
  }
}

/**
 * Handle refund
 */
async function handleRefund(charge: Stripe.Charge) {
  try {
    // Find payment by transaction ID
    const payment = await prisma.payment.findFirst({
      where: { transactionId: charge.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "REFUNDED" },
      });

      console.log(`[Stripe] Refund processed for payment ${payment.id}`);
    }
  } catch (error) {
    console.error("[Stripe] Error handling refund:", error);
    throw error;
  }
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, secret);
}

export default stripe;
