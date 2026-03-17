import AdminHeader from "../../components/AdminHeader";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      lineItems: true,
      payments: true,
    },
  });
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const invoice = await getInvoice(params.id);

  if (!invoice) {
    notFound();
  }

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

  const paidAmount = invoice.payments.reduce((sum, p) => {
    return p.status === "COMPLETED" ? sum + p.amount : sum;
  }, 0);
  const remainingAmount = invoice.amount - paidAmount;

  return (
    <div>
      <AdminHeader title={`Invoice ${invoice.invoiceNumber}`} description="Invoice details" />

      <div className="p-8">
        <Link href="/admin/invoices">
          <Button variant="outline" className="mb-6 flex items-center space-x-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Invoice Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{invoice.invoiceNumber}</CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Created: {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 text-sm font-semibold rounded-full ${getStatusColor(
                    invoice.status
                  )}`}
                >
                  {invoice.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Bill To */}
              <div className="border-b pb-6">
                <h3 className="font-semibold mb-2">Bill To:</h3>
                <p className="text-sm font-medium">{invoice.customer.name}</p>
                <p className="text-sm text-gray-600">{invoice.customer.email}</p>
                <p className="text-sm text-gray-600">{invoice.customer.phone}</p>
                <p className="text-sm text-gray-600">{invoice.customer.address}</p>
                <p className="text-sm text-gray-600">
                  {invoice.customer.city}, {invoice.customer.state} {invoice.customer.zipCode}
                </p>
              </div>

              {/* Invoice Terms */}
              <div className="grid grid-cols-2 gap-6 border-b pb-6">
                <div>
                  <p className="text-sm text-gray-600">Due Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Invoice Date</p>
                  <p className="text-lg font-semibold">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="font-semibold mb-4">Line Items</h3>
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 text-gray-600">Description</th>
                      <th className="text-center py-2 text-gray-600">Qty</th>
                      <th className="text-right py-2 text-gray-600">Unit Price</th>
                      <th className="text-right py-2 text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">{item.description}</td>
                        <td className="text-center py-3">{item.quantity}</td>
                        <td className="text-right py-3 font-mono">
                          ${item.unitPrice.toFixed(2)}
                        </td>
                        <td className="text-right py-3 font-mono font-semibold">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span>Subtotal:</span>
                    <span className="font-mono">${invoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span>Paid:</span>
                    <span className="font-mono text-green-600">
                      -${paidAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Balance Due:</span>
                    <span className="font-mono">${remainingAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Amount Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Amount Due</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-orange-600">
                  ${remainingAmount.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            {/* Payment Information */}
            {invoice.payments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Payments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {invoice.payments.map((payment) => (
                    <div key={payment.id} className="text-sm border-b pb-3 last:border-b-0">
                      <div className="flex justify-between font-medium">
                        <span>{payment.method.toUpperCase()}</span>
                        <span>${payment.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 text-xs mt-1">
                        <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                        <span className={`px-2 py-1 rounded ${
                          payment.status === "COMPLETED"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {invoice.status !== "PAID" && (
                <Link href={`/admin/payments/new?invoice=${invoice.id}`}>
                  <Button className="w-full">Record Payment</Button>
                </Link>
              )}
              <Button variant="outline" className="w-full">
                Download PDF
              </Button>
              <Button variant="outline" className="w-full text-red-600 hover:bg-red-50">
                Cancel Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
