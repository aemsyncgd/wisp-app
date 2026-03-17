import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMikroTikInstance } from "@/lib/mikrotik";
import { NextRequest, NextResponse } from "next/server";
import { Router } from "@prisma/client";

/**
 * POST /api/customer-services
 * Create a new customer service (activate service with MikroTik)
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
      servicePlanId,
      pppUsername,
      pppPassword,
      routerId,
    } = body;

    if (!customerId || !servicePlanId || !pppUsername || !pppPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if customer exists
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Check if service plan exists
    const servicePlan = await prisma.servicePlan.findUnique({
      where: { id: servicePlanId },
    });

    if (!servicePlan) {
      return NextResponse.json(
        { error: "Service plan not found" },
        { status: 404 }
      );
    }

    // Get router for MikroTik API
    let router: Router | null = null;
    if (routerId) {
      router = await prisma.router.findUnique({
        where: { id: routerId },
      });
    }

    // Create MikroTik PPP user if router is configured
    if (router) {
      try {
        const mikrotik = getMikroTikInstance({
          ip: router.ipAddress,
          port: router.port,
          username: router.username,
          password: router.password,
        });

        await mikrotik.createPPPUser(pppUsername, pppPassword);
        console.log(`[Service] Created PPP user via MikroTik: ${pppUsername}`);
      } catch (error) {
        console.error("[Service] Failed to create MikroTik user:", error);
        return NextResponse.json(
          { error: "Failed to create service on router" },
          { status: 500 }
        );
      }
    }

    // Calculate renewal date
    const startDate = new Date();
    const renewalDate = new Date(startDate);
    renewalDate.setMonth(renewalDate.getMonth() + servicePlan.contractMonths);

    // Create customer service record
    const customerService = await prisma.customerService.create({
      data: {
        customerId,
        servicePlanId,
        pppUsername,
        pppPassword,
        status: "ACTIVE",
        startDate,
        renewalDate,
      },
      include: { servicePlan: true },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as any).id,
        action: "create_service",
        entityType: "CustomerService",
        entityId: customerService.id,
        changes: JSON.stringify(customerService),
      },
    });

    return NextResponse.json(customerService, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating customer service:", error);
    return NextResponse.json(
      { error: "Failed to create customer service" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/customer-services
 * List all customer services
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

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    const services = await prisma.customerService.findMany({
      where,
      include: {
        customer: true,
        servicePlan: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("[API] Error fetching customer services:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer services" },
      { status: 500 }
    );
  }
}
