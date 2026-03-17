import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMikroTikInstance } from "@/lib/mikrotik";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/customer-services/[id]/suspend
 * Suspend a customer service
 */
export async function POST(
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

    const service = await prisma.customerService.findUnique({
      where: { id: params.id },
      include: { customer: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    if (service.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Service is already suspended" },
        { status: 400 }
      );
    }

    // Get customer's address to find router
    const address = await prisma.address.findFirst({
      where: { customerId: service.customerId },
      include: { router: true },
    });

    // Suspend on MikroTik if router is configured
    if (address?.router) {
      try {
        const mikrotik = getMikroTikInstance({
          ip: address.router.ipAddress,
          port: address.router.port,
          username: address.router.username,
          password: address.router.password,
        });

        await mikrotik.disablePPPUser(service.pppUsername);
        console.log(`[Service] Suspended PPP user: ${service.pppUsername}`);
      } catch (error) {
        console.error("[Service] Failed to suspend MikroTik user:", error);
        return NextResponse.json(
          { error: "Failed to suspend service on router" },
          { status: 500 }
        );
      }
    }

    // Update service status
    const updatedService = await prisma.customerService.update({
      where: { id: params.id },
      data: { status: "SUSPENDED" },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as any).id,
        customerId: service.customerId,
        action: "suspend_service",
        entityType: "CustomerService",
        entityId: params.id,
        changes: JSON.stringify({ status: "SUSPENDED" }),
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("[API] Error suspending service:", error);
    return NextResponse.json(
      { error: "Failed to suspend service" },
      { status: 500 }
    );
  }
}
