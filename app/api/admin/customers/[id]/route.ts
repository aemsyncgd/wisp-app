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

    // Split name into firstName and lastName
    const nameParts = (body.name || (oldCustomer.firstName + " " + oldCustomer.lastName)).split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : " ";

    const customer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        firstName,
        lastName,
        email: body.email,
        phone: body.phone || null,
        taxId: body.documentId || null,
        accountStatus: body.status || "ACTIVE",
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
        changes: { old: oldCustomer, new: customer } as any,
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
        changes: customer as any,
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
