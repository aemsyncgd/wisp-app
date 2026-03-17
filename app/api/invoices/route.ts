import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/invoices
 * List all invoices with filtering
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: true,
          customerService: true,
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/invoices
 * Create a new invoice
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
      customerServiceId,
      amount,
      taxAmount = 0,
      description,
      dueDate,
    } = body;

    if (!customerId || !amount || !dueDate) {
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

    // Generate invoice number (YYYY-MM-DD-XXXXX format)
    const now = new Date();
    const date = now.toISOString().split("T")[0];
    const randomPart = Math.floor(Math.random() * 100000)
      .toString()
      .padStart(5, "0");
    const invoiceNumber = `${date}-${randomPart}`;

    const totalAmount = amount + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId,
        customerServiceId: customerServiceId || null,
        amount,
        taxAmount,
        totalAmount,
        description: description || `Service payment for ${customer.firstName} ${customer.lastName}`,
        issueDate: now,
        dueDate: new Date(dueDate),
        status: "PENDING",
      },
      include: {
        customer: true,
        payments: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as any).id,
        customerId,
        action: "create_invoice",
        entityType: "Invoice",
        entityId: invoice.id,
        changes: JSON.stringify(invoice),
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
