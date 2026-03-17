import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
      include: { customerServices: true, invoices: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error fetching customer:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const oldCustomer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!oldCustomer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        documentId: body.documentId || null,
        status: body.status || "ACTIVE",
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        zipCode: body.zipCode || null,
        notes: body.notes || null,
        contactPerson: body.contactPerson || null,
      },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as any).id,
        customerId: customer.id,
        action: "update_customer",
        entityType: "Customer",
        entityId: customer.id,
        description: `Updated customer: ${customer.name}`,
        oldValues: JSON.stringify(oldCustomer),
        newValues: JSON.stringify(customer),
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return NextResponse.json(
      { error: "Failed to update customer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    // Delete customer (cascade delete will handle related records)
    await prisma.customer.delete({
      where: { id: params.id },
    });

    // Log audit trail
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as any).id,
        customerId: params.id,
        action: "delete_customer",
        entityType: "Customer",
        entityId: params.id,
        description: `Deleted customer: ${customer.name}`,
        oldValues: JSON.stringify(customer),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting customer:", error);
    return NextResponse.json(
      { error: "Failed to delete customer" },
      { status: 500 }
    );
  }
}
