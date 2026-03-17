import AdminHeader from "./components/AdminHeader";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, FileText, AlertCircle } from "lucide-react";

async function getDashboardStats() {
  const [totalCustomers, activeServices, pendingInvoices, overdueInvoices] = await Promise.all([
    prisma.customer.count(),
    prisma.customerService.count({ where: { status: "ACTIVE" } }),
    prisma.invoice.count({ where: { status: "PENDING" } }),
    prisma.invoice.count({ where: { status: "OVERDUE" } }),
  ]);

  return { totalCustomers, activeServices, pendingInvoices, overdueInvoices };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Active Services",
      value: stats.activeServices,
      icon: FileText,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Pending Invoices",
      value: stats.pendingInvoices,
      icon: CreditCard,
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      title: "Overdue Invoices",
      value: stats.overdueInvoices,
      icon: AlertCircle,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  return (
    <div>
      <AdminHeader
        title="Dashboard"
        description="Welcome to WISP Management System"
      />
      
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-4 w-4 ${stat.textColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stat.title.toLowerCase()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                No recent data available. Create customers to see activity here.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                No recent data available. Process payments to see activity here.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
