import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const customers = await prisma.customer.findMany({
      include: { customerServices: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      { error: "Failed to fetch customers" },
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

    const customer = await prisma.customer.create({
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
        action: "create_customer",
        entityType: "Customer",
        entityId: customer.id,
        description: `Created new customer: ${customer.name}`,
        newValues: JSON.stringify(customer),
      },
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Error creating customer:", error);
    return NextResponse.json(
      { error: "Failed to create customer" },
      { status: 500 }
    );
  }
}
