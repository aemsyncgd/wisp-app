/**
 * Billing Service
 * Handles invoice generation, payment tracking, and suspension logic
 */

import { prisma } from "./prisma";
import { getMikroTikInstance } from "./mikrotik";

export class BillingService {
  /**
   * Generate invoices for all active customers with services
   * Called daily via cron job
   */
  static async generateDailyInvoices() {
    console.log("[Billing] Starting daily invoice generation...");

    try {
      const today = new Date();
      const month = today.toLocaleString("default", { month: "numeric" });
      const year = today.getFullYear();

      // Get all active customers with services
      const customers = await prisma.customer.findMany({
        where: { status: "ACTIVE" },
        include: {
          customerServices: {
            where: { status: "ACTIVE" },
            include: { servicePlan: true },
          },
        },
      });

      let invoicesCreated = 0;

      for (const customer of customers) {
        if (customer.customerServices.length === 0) continue;

        // Calculate total amount
        const totalAmount = customer.customerServices.reduce((sum, service) => {
          return sum + service.monthlyPrice;
        }, 0);

        // Generate invoice number (YYYY-MM-CUST-SEQ)
        const invoiceNumber = `${year}-${month.padStart(2, "0")}-${customer.id.substring(0, 8)}-001`;

        // Check if invoice already exists
        const existing = await prisma.invoice.findUnique({
          where: { invoiceNumber },
        });

        if (existing) continue;

        // Create invoice with line items
        const dueDate = new Date(today);
        dueDate.setDate(dueDate.getDate() + 30); // 30 days payment term

        const invoice = await prisma.invoice.create({
          data: {
            customerId: customer.id,
            invoiceNumber,
            amount: totalAmount,
            dueDate,
            status: "PENDING",
            lineItems: {
              createMany: {
                data: customer.customerServices.map((service) => ({
                  description: `${service.servicePlan.name} - Monthly Service (${service.servicePlan.speed} Mbps)`,
                  quantity: 1,
                  unitPrice: service.monthlyPrice,
                  total: service.monthlyPrice,
                })),
              },
            },
          },
        });

        console.log(`[Billing] Invoice created for ${customer.name}: ${invoiceNumber}`);
        invoicesCreated++;
      }

      console.log(`[Billing] Invoice generation completed: ${invoicesCreated} invoices created`);
      return invoicesCreated;
    } catch (error) {
      console.error("[Billing] Error generating invoices:", error);
      throw error;
    }
  }

  /**
   * Process overdue invoices and suspend services
   */
  static async processOverdueInvoices() {
    console.log("[Billing] Processing overdue invoices...");

    try {
      const today = new Date();
      const overdueLimit = new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000); // 15 days overdue

      // Find overdue invoices
      const overdueInvoices = await prisma.invoice.findMany({
        where: {
          status: "PENDING",
          dueDate: { lt: overdueLimit },
        },
        include: {
          customer: {
            include: {
              customerServices: true,
            },
          },
        },
      });

      const mikrotik = getMikroTikInstance();
      let suspensionCount = 0;

      for (const invoice of overdueInvoices) {
        // Update invoice status
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: "OVERDUE" },
        });

        // Suspend customer services
        for (const service of invoice.customer.customerServices) {
          if (service.status === "ACTIVE") {
            // Disable PPP user on MikroTik
            if (service.pppUsername) {
              try {
                await mikrotik.disablePPPUser(service.pppUsername);
              } catch (error) {
                console.error(
                  `[MikroTik] Error disabling user ${service.pppUsername}:`,
                  error
                );
              }
            }

            // Add to SUSPENDED address list
            if (service.customerId) {
              try {
                await prisma.addressList.create({
                  data: {
                    customerId: service.customerId,
                    type: "SUSPENDED",
                    ipAddress: "0.0.0.0/32", // Placeholder
                    description: "Suspended due to overdue payment",
                  },
                });
              } catch (error) {
                console.error("[Database] Error adding to suspended list:", error);
              }
            }

            // Update service status
            await prisma.customerService.update({
              where: { id: service.id },
              data: {
                status: "SUSPENDED",
                suspensionDate: today,
              },
            });

            suspensionCount++;
          }
        }

        // Update customer status
        await prisma.customer.update({
          where: { id: invoice.customer.id },
          data: { status: "SUSPENDED" },
        });

        console.log(
          `[Billing] Suspended customer ${invoice.customer.name} due to overdue invoice`
        );
      }

      console.log(`[Billing] Overdue processing completed: ${suspensionCount} services suspended`);
      return suspensionCount;
    } catch (error) {
      console.error("[Billing] Error processing overdue invoices:", error);
      throw error;
    }
  }

  /**
   * Mark invoice as paid
   */
  static async markInvoiceAsPaid(invoiceId: string, paymentAmount: number) {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: { customer: true },
      });

      if (!invoice) {
        throw new Error("Invoice not found");
      }

      if (paymentAmount < invoice.amount) {
        throw new Error("Payment amount is less than invoice amount");
      }

      // Update invoice status
      const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: "PAID",
          paidDate: new Date(),
        },
      });

      // If customer was suspended, reactivate services
      if (invoice.customer.status === "SUSPENDED") {
        const customerServices = await prisma.customerService.findMany({
          where: {
            customerId: invoice.customer.id,
            status: "SUSPENDED",
          },
        });

        const mikrotik = getMikroTikInstance();

        for (const service of customerServices) {
          // Re-enable PPP user
          if (service.pppUsername) {
            try {
              await mikrotik.enablePPPUser(service.pppUsername);
            } catch (error) {
              console.error(
                `[MikroTik] Error enabling user ${service.pppUsername}:`,
                error
              );
            }
          }

          // Update service status
          await prisma.customerService.update({
            where: { id: service.id },
            data: { status: "ACTIVE", suspensionDate: null },
          });
        }

        // Update customer status back to ACTIVE
        await prisma.customer.update({
          where: { id: invoice.customer.id },
          data: { status: "ACTIVE" },
        });

        console.log(
          `[Billing] Reactivated services for ${invoice.customer.name}`
        );
      }

      return updatedInvoice;
    } catch (error) {
      console.error("[Billing] Error marking invoice as paid:", error);
      throw error;
    }
  }

  /**
   * Get invoice with details
   */
  static async getInvoice(invoiceId: string) {
    return prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        lineItems: true,
        payments: true,
      },
    });
  }

  /**
   * Get customer invoices
   */
  static async getCustomerInvoices(customerId: string) {
    return prisma.invoice.findMany({
      where: { customerId },
      include: { lineItems: true, payments: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
