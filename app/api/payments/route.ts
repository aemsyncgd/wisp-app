import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/payments
 * List all payments with filtering
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");
    const invoiceId = searchParams.get("invoiceId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;
    if (invoiceId) where.invoiceId = invoiceId;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          invoice: true,
          customerService: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.count({ where }),
    ]);

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] Error fetching payments:", error);
    return NextResponse.json(
      { error: "Failed to fetch payments" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments
 * Record a new payment
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
    const {
      customerId,
      invoiceId,
      customerServiceId,
      amount,
      paymentMethod,
      transactionId,
      reference,
      status = "COMPLETED",
    } = body;

    if (!customerId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // If invoice ID is provided, verify it exists and belongs to customer
    if (invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice || invoice.customerId !== customerId) {
        return NextResponse.json(
          { error: "Invoice not found or does not belong to customer" },
          { status: 404 }
        );
      }
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        customerId,
        invoiceId: invoiceId || null,
        customerServiceId: customerServiceId || null,
        amount,
        paymentMethod,
        transactionId: transactionId || null,
        reference: reference || null,
        status,
        processedDate: status === "COMPLETED" ? new Date() : null,
      },
      include: {
        customer: true,
        invoice: true,
      },
    });

    // If payment is completed and has an invoice, update invoice status
    if (status === "COMPLETED" && invoiceId) {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { payments: true },
      });

      if (invoice) {
        const totalPaid = invoice.payments.reduce(
          (sum, p) => sum + (p.status === "COMPLETED" ? p.amount : 0),
          amount
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
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as any).id,
        customerId,
        action: "create_payment",
        entityType: "Payment",
        entityId: payment.id,
        changes: JSON.stringify(payment),
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating payment:", error);
    return NextResponse.json(
      { error: "Failed to create payment" },
      { status: 500 }
    );
  }
}
