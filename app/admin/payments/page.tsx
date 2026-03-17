import AdminHeader from "../components/AdminHeader";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Eye } from "lucide-react";

async function getPayments() {
  return prisma.payment.findMany({
    include: {
      customer: true,
      invoice: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function PaymentsPage() {
  const payments = await getPayments();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-blue-100 text-blue-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalProcessed = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <AdminHeader title="Payments" description="Manage customer payments" />

      <div className="p-8">
        <div className="grid grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Total Processed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${totalProcessed.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {payments.filter((p) => p.status === "COMPLETED").length} payments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                ${totalPending.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {payments.filter((p) => p.status === "PENDING").length} payments
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="text-3xl font-bold mt-2">${(totalProcessed + totalPending).toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">{payments.length} transactions</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
          <Link href="/admin/payments/new">
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
            </Button>
          </Link>
        </div>

        {payments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No payments recorded yet.</p>
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
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Method
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
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {payment.customer.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {payment.invoice?.invoiceNumber || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">
                          ${payment.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {payment.method.toUpperCase()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
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
