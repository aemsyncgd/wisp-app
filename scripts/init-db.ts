/**
 * Database initialization script
 * Run with: npx ts-node scripts/init-db.ts
 * Creates the admin user and initial data
 */

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Starting database initialization...");

  try {
    // Create default admin user
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.admin.upsert({
      where: { email: "admin@wisp.local" },
      update: {},
      create: {
        email: "admin@wisp.local",
        password: adminPassword,
        name: "System Administrator",
        role: "admin",
        active: true,
      },
    });
    console.log("✓ Admin user created:", admin.email);

    // Create default service plans
    const plans = await Promise.all([
      prisma.servicePlan.upsert({
        where: { name: "Plan 10Mbps" },
        update: {},
        create: {
          name: "Plan 10Mbps",
          speed: 10,
          price: 29.99,
          description: "10 Mbps download / 2 Mbps upload",
          active: true,
        },
      }),
      prisma.servicePlan.upsert({
        where: { name: "Plan 25Mbps" },
        update: {},
        create: {
          name: "Plan 25Mbps",
          speed: 25,
          price: 49.99,
          description: "25 Mbps download / 5 Mbps upload",
          active: true,
        },
      }),
      prisma.servicePlan.upsert({
        where: { name: "Plan 50Mbps" },
        update: {},
        create: {
          name: "Plan 50Mbps",
          speed: 50,
          price: 79.99,
          description: "50 Mbps download / 10 Mbps upload",
          active: true,
        },
      }),
    ]);
    console.log("✓ Service plans created:", plans.length);

    // Create default router
    const router = await prisma.router.upsert({
      where: { ipAddress: "192.168.1.1" },
      update: {},
      create: {
        name: "Main Router",
        ipAddress: "192.168.1.1",
        port: 8728,
        username: "admin",
        password: "admin",
        location: "Server Room",
        active: true,
      },
    });
    console.log("✓ Router configured:", router.name);

    console.log("\n✓ Database initialization completed successfully!");
    console.log("\nDefault credentials:");
    console.log("  Email: admin@wisp.local");
    console.log("  Password: admin123");
    console.log("\n⚠️  Remember to change the default password in production!");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
