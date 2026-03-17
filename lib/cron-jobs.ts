/**
 * Scheduled Cron Jobs for WISP Manager
 * Handles automated billing, invoice generation, and service suspension
 */

import cron from "node-cron";
import { BillingService } from "./billing-service";

let jobsInitialized = false;

export function initializeCronJobs() {
  if (jobsInitialized) {
    console.log("[Cron] Jobs already initialized");
    return;
  }

  console.log("[Cron] Initializing scheduled jobs...");

  /**
   * Generate invoices daily at 00:00 (midnight)
   * Generates invoices for all active customers with active services
   */
  cron.schedule("0 0 * * *", async () => {
    console.log("[Cron] Running daily invoice generation...");
    try {
      const count = await BillingService.generateDailyInvoices();
      console.log(`[Cron] ✓ Invoice generation completed: ${count} invoices`);
    } catch (error) {
      console.error("[Cron] ✗ Error in invoice generation:", error);
    }
  });

  /**
   * Process overdue invoices daily at 06:00 (6 AM)
   * Suspends services for customers with overdue invoices (15+ days)
   */
  cron.schedule("0 6 * * *", async () => {
    console.log("[Cron] Running overdue invoice processing...");
    try {
      const count = await BillingService.processOverdueInvoices();
      console.log(`[Cron] ✓ Overdue processing completed: ${count} services suspended`);
    } catch (error) {
      console.error("[Cron] ✗ Error in overdue processing:", error);
    }
  });

  /**
   * Send payment reminders daily at 08:00 (8 AM)
   * Sends reminder emails for pending and overdue invoices
   */
  cron.schedule("0 8 * * *", async () => {
    console.log("[Cron] Running payment reminder job...");
    // TODO: Implement email reminder logic
    console.log("[Cron] Payment reminders sent (TODO: implement)");
  });

  /**
   * Sync bandwidth statistics every 5 minutes
   * Pulls bandwidth data from MikroTik routers
   */
  cron.schedule("*/5 * * * *", async () => {
    console.log("[Cron] Running bandwidth sync...");
    // TODO: Implement bandwidth sync from MikroTik
    console.log("[Cron] Bandwidth data synced (TODO: implement)");
  });

  jobsInitialized = true;
  console.log("[Cron] ✓ All scheduled jobs initialized");
}

export function stopCronJobs() {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  jobsInitialized = false;
  console.log("[Cron] All scheduled jobs stopped");
}
