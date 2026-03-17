import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { BillingService } from "@/lib/billing-service";

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

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        customerId: body.customerId,
        invoiceId: body.invoiceId || null,
        amount: body.amount,
        method: body.method,
        status: body.method === "cash" ? "COMPLETED" : "PENDING",
        notes: body.notes || null,
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
        description: `Recorded payment of $${payment.amount} from ${customer.name}`,
        newValues: JSON.stringify(payment),
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
