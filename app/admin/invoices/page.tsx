import AdminHeader from "../components/AdminHeader";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Download } from "lucide-react";

async function getInvoices() {
  return prisma.invoice.findMany({
    include: {
      customer: true,
      lineItems: true,
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-blue-100 text-blue-800";
      case "OVERDUE":
        return "bg-red-100 text-red-800";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices
    .filter((inv) => inv.status === "PENDING")
    .reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div>
      <AdminHeader title="Invoices" description="Manage customer invoices" />

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-3xl font-bold mt-2">${totalAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">{invoices.length} invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-3xl font-bold text-green-600 mt-2">${paidAmount.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">
                {invoices.filter((i) => i.status === "PAID").length} invoices
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Pending/Overdue</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                ${pendingAmount.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {invoices.filter((i) => i.status === "PENDING" || i.status === "OVERDUE").length} invoices
              </p>
            </CardContent>
          </Card>
        </div>

        {invoices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No invoices yet.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Invoice #
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {invoice.customer.name}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          ${invoice.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              invoice.status
                            )}`}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm space-x-2 flex">
                          <Link href={`/admin/invoices/${invoice.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
