import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/invoices/[id]
 * Get a specific invoice
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        customerService: { include: { servicePlan: true } },
        payments: true,
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[API] Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/invoices/[id]
 * Update invoice (status, due date, etc)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, dueDate, description } = body;

    const oldInvoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    });

    if (!oldInvoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (description) updateData.description = description;

    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: updateData,
      include: {
        customer: true,
        payments: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as any).id,
        customerId: oldInvoice.customerId,
        action: "update_invoice",
        entityType: "Invoice",
        entityId: params.id,
        changes: JSON.stringify({
          before: oldInvoice,
          after: updatedInvoice,
        }),
      },
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("[API] Error updating invoice:", error);
    return NextResponse.json(
      { error: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invoices/[id]
 * Cancel/Delete an invoice
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Instead of deleting, mark as cancelled
    const updatedInvoice = await prisma.invoice.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as any).id,
        customerId: invoice.customerId,
        action: "cancel_invoice",
        entityType: "Invoice",
        entityId: params.id,
        changes: JSON.stringify({ status: "CANCELLED" }),
      },
    });

    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error("[API] Error cancelling invoice:", error);
    return NextResponse.json(
      { error: "Failed to cancel invoice" },
      { status: 500 }
    );
  }
}
