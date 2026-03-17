import { prisma } from "./prisma";
import cron from "node-cron";

/**
 * Billing Automation Service
 * Handles:
 * - Daily invoice generation for active services
 * - Overdue invoice handling and service suspension
 * - Payment reminders
 */

/**
 * Generate invoices for all active services
 * Should be run daily (typically at midnight)
 */
export async function generateDailyInvoices() {
  try {
    console.log("[Billing] Starting daily invoice generation...");

    // Get all active customer services
    const activeServices = await prisma.customerService.findMany({
      where: { status: "ACTIVE" },
      include: {
        customer: true,
        servicePlan: true,
      },
    });

    let invoicesCreated = 0;
    const now = new Date();

    for (const service of activeServices) {
      // Check if we need to generate an invoice
      const lastBilling = service.lastBillingDate || service.startDate;
      const daysSinceLastBilling = Math.floor(
        (now.getTime() - lastBilling.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Generate monthly invoice (every 30 days)
      if (daysSinceLastBilling >= 30) {
        const dueDate = new Date(now);
        dueDate.setDate(dueDate.getDate() + 15); // Due in 15 days

        const invoice = await prisma.invoice.create({
          data: {
            invoiceNumber: `AUTO-${now.getTime()}-${service.id.substring(0, 8)}`,
            customerId: service.customerId,
            customerServiceId: service.id,
            amount: service.servicePlan.monthlyPrice,
            taxAmount: 0,
            totalAmount: service.servicePlan.monthlyPrice,
            description: `Monthly service: ${service.servicePlan.name}`,
            issueDate: now,
            dueDate,
            status: "PENDING",
          },
        });

        // Update last billing date
        await prisma.customerService.update({
          where: { id: service.id },
          data: { lastBillingDate: now },
        });

        invoicesCreated++;
        console.log(
          `[Billing] Created invoice ${invoice.invoiceNumber} for service ${service.id}`
        );
      }
    }

    console.log(`[Billing] Daily invoice generation complete. Created: ${invoicesCreated}`);
    return invoicesCreated;
  } catch (error) {
    console.error("[Billing] Error in generateDailyInvoices:", error);
    throw error;
  }
}

/**
 * Check for overdue invoices and suspend services
 * Should be run daily
 */
export async function handleOverdueInvoices() {
  try {
    console.log("[Billing] Checking for overdue invoices...");

    const now = new Date();
    const suspendedCount = { total: 0, services: [] as string[] };

    // Find overdue invoices (past due date)
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: "PENDING",
        dueDate: { lt: now },
      },
      include: {
        customerService: true,
      },
    });

    for (const invoice of overdueInvoices) {
      // Mark invoice as overdue
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: "OVERDUE" },
      });

      // Suspend the service if it has one
      if (invoice.customerService && invoice.customerService.status === "ACTIVE") {
        await prisma.customerService.update({
          where: { id: invoice.customerService.id },
          data: { status: "SUSPENDED" },
        });

        suspendedCount.total++;
        suspendedCount.services.push(invoice.customerService.id);

        console.log(
          `[Billing] Suspended service ${invoice.customerService.id} due to overdue invoice`
        );
      }
    }

    console.log(
      `[Billing] Overdue invoice check complete. Suspended: ${suspendedCount.total}`
    );
    return suspendedCount;
  } catch (error) {
    console.error("[Billing] Error in handleOverdueInvoices:", error);
    throw error;
  }
}

/**
 * Send payment reminders for invoices due soon
 * Should be run daily (typically in the morning)
 */
export async function sendPaymentReminders() {
  try {
    console.log("[Billing] Checking for invoices due soon...");

    const now = new Date();
    const daysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

    // Find invoices due in next 3 days
    const upcomingDue = await prisma.invoice.findMany({
      where: {
        status: "PENDING",
        dueDate: {
          gte: now,
          lte: daysFromNow,
        },
      },
      include: {
        customer: true,
      },
    });

    console.log(`[Billing] Found ${upcomingDue.length} invoices due soon`);

    // TODO: Implement email sending here
    // This would integrate with your email service (SendGrid, Resend, etc.)

    for (const invoice of upcomingDue) {
      console.log(
        `[Billing] Reminder due: Invoice ${invoice.invoiceNumber} for ${invoice.customer.email} (Due: ${invoice.dueDate})`
      );
      // await sendReminderEmail(invoice);
    }

    return upcomingDue.length;
  } catch (error) {
    console.error("[Billing] Error in sendPaymentReminders:", error);
    throw error;
  }
}

/**
 * Initialize cron jobs for billing automation
 */
export function initializeBillingCrons() {
  console.log("[Billing] Initializing cron jobs...");

  // Run daily invoice generation at 2 AM
  cron.schedule("0 2 * * *", async () => {
    try {
      await generateDailyInvoices();
    } catch (error) {
      console.error("[Billing Cron] Error in generateDailyInvoices:", error);
    }
  });

  // Check for overdue invoices at 3 AM
  cron.schedule("0 3 * * *", async () => {
    try {
      await handleOverdueInvoices();
    } catch (error) {
      console.error("[Billing Cron] Error in handleOverdueInvoices:", error);
    }
  });

  // Send payment reminders at 9 AM
  cron.schedule("0 9 * * *", async () => {
    try {
      await sendPaymentReminders();
    } catch (error) {
      console.error("[Billing Cron] Error in sendPaymentReminders:", error);
    }
  });

  console.log("[Billing] Cron jobs initialized successfully");
}

export default {
  generateDailyInvoices,
  handleOverdueInvoices,
  sendPaymentReminders,
  initializeBillingCrons,
};
