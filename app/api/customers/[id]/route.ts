import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/customers/[id]
 * Get a specific customer
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

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: {
        addresses: true,
        customerServices: { include: { servicePlan: true } },
        invoices: true,
        payments: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("[API] Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/customers/[id]
 * Update a customer
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
    const {
      firstName,
      lastName,
      email,
      phone,
      taxId,
      businessName,
      accountStatus,
    } = body;

    const oldCustomer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!oldCustomer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(taxId !== undefined && { taxId }),
        ...(businessName !== undefined && { businessName }),
        ...(accountStatus && { accountStatus }),
      },
      include: {
        addresses: true,
        customerServices: { include: { servicePlan: true } },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as any).id,
        action: "update_customer",
        entityType: "Customer",
        entityId: params.id,
        changes: JSON.stringify({
          before: oldCustomer,
          after: updatedCustomer,
        }),
      },
    });

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error("[API] Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customers/[id]
 * Delete a customer
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

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    await prisma.customer.delete({
      where: { id: params.id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as any).id,
        action: "delete_customer",
        entityType: "Customer",
        entityId: params.id,
        changes: JSON.stringify(customer),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
