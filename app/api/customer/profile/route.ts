import { NextResponse } from "next/server";

// TODO: Implement customer session/auth
// For now, this is a placeholder that requires proper authentication implementation

export async function GET() {
  try {
    // TODO: Get customer from session
    // const session = await getCustomerSession(request);
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Placeholder response
    return NextResponse.json({
      name: "Demo Customer",
      email: "customer@example.com",
      status: "ACTIVE",
      services: [
        {
          id: "1",
          plan: "Plan 25Mbps",
          speed: 25,
          price: 49.99,
        },
      ],
      pendingAmount: 0,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}
