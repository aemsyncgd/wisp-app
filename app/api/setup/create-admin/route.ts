import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/**
 * POST /api/setup/create-admin
 * Create the first admin user (only works if no admins exist)
 * This is a one-time setup endpoint
 */
export async function POST(request: NextRequest) {
  try {
    // Check if any admins already exist
    const adminCount = await prisma.admin.count();

    if (adminCount > 0) {
      return NextResponse.json(
        { error: "Admin already exists. This endpoint can only be used once." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Missing required fields: email, password, name" },
        { status: 400 }
      );
    }

    // Validate password strength (min 8 characters)
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "SUPER_ADMIN",
        active: true,
      },
    });

    console.log(`[Setup] Created super admin: ${email}`);

    return NextResponse.json(
      {
        message: "Super admin created successfully",
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin" },
      { status: 500 }
    );
  }
}
