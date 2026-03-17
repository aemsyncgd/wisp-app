import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/service-plans
 * List all service plans
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const plans = await prisma.servicePlan.findMany({
      where: includeInactive ? {} : { isActive: true },
      orderBy: { monthlyPrice: "asc" },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error("[API] Error fetching service plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch service plans" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/service-plans
 * Create a new service plan (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role === "MANAGER") {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      downloadSpeed,
      uploadSpeed,
      monthlyPrice,
      setupFee = 0,
      dataLimit,
    } = body;

    if (
      !name ||
      !downloadSpeed ||
      !uploadSpeed ||
      monthlyPrice === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Convert string speeds to numbers if necessary
    const plan = await prisma.servicePlan.create({
      data: {
        name,
        downloadSpeed: typeof downloadSpeed === "string" ? parseFloat(downloadSpeed) : downloadSpeed,
        uploadSpeed: typeof uploadSpeed === "string" ? parseFloat(uploadSpeed) : uploadSpeed,
        monthlyPrice: typeof monthlyPrice === "string" ? parseFloat(monthlyPrice) : monthlyPrice,
        setupFee: typeof setupFee === "string" ? parseFloat(setupFee) : setupFee,
        dataLimit: dataLimit ? (typeof dataLimit === "string" ? parseFloat(dataLimit) : dataLimit) : null,
        isActive: true,
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        adminId: (session.user as any).id,
        action: "create_service_plan",
        entityType: "ServicePlan",
        entityId: plan.id,
        changes: plan as any,
      },
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("[API] Error creating service plan:", error);
    return NextResponse.json(
      { error: "Failed to create service plan" },
      { status: 500 }
    );
  }
}
