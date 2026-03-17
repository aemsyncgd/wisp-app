import AdminHeader from "../components/AdminHeader";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, AlertTriangle } from "lucide-react";

async function getAnalyticsData() {
  const [customers, activeServices, totalRevenue, overdueAmount] = await Promise.all([
    prisma.customer.findMany(),
    prisma.customerService.findMany({ where: { status: "ACTIVE" } }),
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.invoice.aggregate({
      where: { status: "OVERDUE" },
      _sum: { amount: true },
    }),
  ]);

  // Calculate growth metrics
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);

  const newCustomersLastMonth = customers.filter(
    (c) => new Date(c.createdAt) > lastMonthDate
  ).length;

  return {
    totalCustomers: customers.length,
    activeCustomers: customers.filter((c) => c.status === "ACTIVE").length,
    suspendedCustomers: customers.filter((c) => c.status === "SUSPENDED").length,
    activeServices: activeServices.length,
    totalRevenue: totalRevenue._sum.amount || 0,
    overdueAmount: overdueAmount._sum.amount || 0,
    newCustomersLastMonth,
  };
}

export default async function AnalyticsDashboard() {
  const analytics = await getAnalyticsData();

  const metrics = [
    {
      title: "Total Customers",
      value: analytics.totalCustomers,
      subtext: `${analytics.newCustomersLastMonth} new this month`,
      icon: Users,
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Active Services",
      value: analytics.activeServices,
      subtext: "Currently connected",
      icon: TrendingUp,
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: `$${analytics.totalRevenue.toFixed(2)}`,
      subtext: "Payments received",
      icon: DollarSign,
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Overdue Amount",
      value: `$${analytics.overdueAmount.toFixed(2)}`,
      subtext: "Pending collection",
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  return (
    <div>
      <AdminHeader title="Analytics" description="Business metrics and insights" />

      <div className="p-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <div className={`${metric.bgColor} p-2 rounded-lg`}>
                    <Icon className={`h-4 w-4 ${metric.textColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  <p className="text-xs text-gray-500 mt-1">{metric.subtext}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Customer Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Active</span>
                    <span className="text-sm font-bold">{analytics.activeCustomers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{
                        width: `${
                          analytics.totalCustomers > 0
                            ? (analytics.activeCustomers / analytics.totalCustomers) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Suspended</span>
                    <span className="text-sm font-bold">{analytics.suspendedCustomers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full"
                      style={{
                        width: `${
                          analytics.totalCustomers > 0
                            ? (analytics.suspendedCustomers / analytics.totalCustomers) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Inactive</span>
                    <span className="text-sm font-bold">
                      {analytics.totalCustomers -
                        analytics.activeCustomers -
                        analytics.suspendedCustomers}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gray-600 h-2 rounded-full"
                      style={{
                        width: `${
                          analytics.totalCustomers > 0
                            ? (
                                (analytics.totalCustomers -
                                  analytics.activeCustomers -
                                  analytics.suspendedCustomers) /
                                analytics.totalCustomers
                              ) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Revenue Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Revenue Collected</p>
                  <p className="text-3xl font-bold text-emerald-600 mt-1">
                    ${analytics.totalRevenue.toFixed(2)}
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Overdue Amount</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    ${analytics.overdueAmount.toFixed(2)}
                  </p>
                </div>

                <div className="text-sm text-gray-600">
                  <p>
                    Collection Rate:{" "}
                    <span className="font-bold">
                      {analytics.totalRevenue > 0
                        ? (
                            (analytics.totalRevenue /
                              (analytics.totalRevenue + analytics.overdueAmount)) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Revenue Per Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                $
                {analytics.totalCustomers > 0
                  ? (analytics.totalRevenue / analytics.totalCustomers).toFixed(2)
                  : "0.00"}
              </p>
              <p className="text-xs text-gray-600 mt-2">Based on total revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Services Per Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {analytics.totalCustomers > 0
                  ? (analytics.activeServices / analytics.totalCustomers).toFixed(1)
                  : "0"}
              </p>
              <p className="text-xs text-gray-600 mt-2">Average services</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                +{analytics.newCustomersLastMonth}
              </p>
              <p className="text-xs text-gray-600 mt-2">New customers this month</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
