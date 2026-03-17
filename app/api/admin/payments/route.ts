import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { BillingService } from "@/lib/billing-service";
import { PaymentMethod } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payments = await prisma.payment.findMany({
      include: {
        customer: true,
        invoice: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: body.customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Map string method to PaymentMethod enum
    const methodMap: Record<string, PaymentMethod> = {
      "cash": PaymentMethod.CASH,
      "credit_card": PaymentMethod.CREDIT_CARD,
      "debit_card": PaymentMethod.DEBIT_CARD,
      "bank_transfer": PaymentMethod.BANK_TRANSFER,
      "paypal": PaymentMethod.PAYPAL,
      "mercado_pago": PaymentMethod.MERCADO_PAGO,
    };
    
    const paymentMethod = methodMap[body.method?.toLowerCase()] || PaymentMethod.CASH;

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        customerId: body.customerId,
        invoiceId: body.invoiceId || null,
        amount: body.amount,
        paymentMethod: paymentMethod,
        status: paymentMethod === PaymentMethod.CASH ? "COMPLETED" : "PENDING",
        reference: body.notes || null, // Using reference field for notes
      },
    });

    // If payment is completed and linked to invoice, mark invoice as paid
    if (payment.status === "COMPLETED" && payment.invoiceId) {
      try {
        await BillingService.markInvoiceAsPaid(payment.invoiceId, payment.amount);
      } catch (error) {
        console.error("Error marking invoice as paid:", error);
      }
    }

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as any).id,
        customerId: customer.id,
        action: "record_payment",
        entityType: "Payment",
        entityId: payment.id,
        changes: payment as any,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
