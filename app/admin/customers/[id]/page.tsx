import AdminHeader from "../../components/AdminHeader";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit2, ArrowLeft } from "lucide-react";

async function getCustomer(id: string) {
  return prisma.customer.findUnique({
    where: { id },
    include: {
      customerServices: {
        include: {
          servicePlan: true,
          bandwidthLogs: {
            take: 10,
            orderBy: { timestamp: "desc" },
          },
        },
      },
      invoices: {
        take: 10,
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export default async function CustomerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = await getCustomer(params.id);

  if (!customer) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "SUSPENDED":
        return "bg-red-100 text-red-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <AdminHeader title={customer.name} description="Customer details and services" />
      
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/admin/customers">
            <Button variant="outline" className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          </Link>
          <Link href={`/admin/customers/${customer.id}/edit`}>
            <Button className="flex items-center space-x-2">
              <Edit2 className="w-4 h-4" />
              <span>Edit</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Customer Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <div className="mt-1">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                    {customer.status}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-sm font-medium mt-1">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-sm font-medium mt-1">{customer.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Document ID</p>
                <p className="text-sm font-medium mt-1">{customer.documentId || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-sm font-medium mt-1">
                  {customer.address && customer.city
                    ? `${customer.address}, ${customer.city} ${customer.state || ""} ${customer.zipCode || ""}`
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Services & Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Services ({customer.customerServices.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.customerServices.length === 0 ? (
                  <p className="text-gray-500 text-sm">No services yet</p>
                ) : (
                  <div className="space-y-4">
                    {customer.customerServices.map((service) => (
                      <div key={service.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{service.servicePlan.name}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {service.servicePlan.speed} Mbps - ${service.monthlyPrice}/month
                            </p>
                            <p className="text-xs text-gray-600 mt-2">
                              Username: {service.pppUsername || "-"}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(service.status)}`}>
                            {service.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Invoices ({customer.invoices.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.invoices.length === 0 ? (
                  <p className="text-gray-500 text-sm">No invoices yet</p>
                ) : (
                  <div className="space-y-2">
                    {customer.invoices.map((invoice) => (
                      <div key={invoice.id} className="flex justify-between items-center py-2 border-b text-sm">
                        <div>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${invoice.amount.toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 rounded font-semibold ${
                            invoice.status === "PAID"
                              ? "bg-green-100 text-green-800"
                              : invoice.status === "OVERDUE"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
