"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Wifi, FileText, DollarSign, TrendingUp, AlertCircle } from "lucide-react";

interface DashboardStats {
  totalCustomers: number;
  activeServices: number;
  totalRevenue: number;
  pendingInvoices: number;
  suspendedServices: number;
  overdueInvoices: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    activeServices: 0,
    totalRevenue: 0,
    pendingInvoices: 0,
    suspendedServices: 0,
    overdueInvoices: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch multiple endpoints
      const [customersRes, invoicesRes, paymentsRes] = await Promise.all([
        fetch("/api/customers?limit=1"),
        fetch("/api/invoices?limit=1"),
        fetch("/api/payments?limit=1"),
      ]);

      if (customersRes.ok && invoicesRes.ok && paymentsRes.ok) {
        const customersData = await customersRes.json();
        const invoicesData = await invoicesRes.json();
        const paymentsData = await paymentsRes.json();

        setStats({
          totalCustomers: customersData.pagination?.total || 0,
          activeServices: 0, // TODO: Fetch from API
          totalRevenue: 0, // TODO: Calculate from completed payments
          pendingInvoices: invoicesData.invoices?.filter(
            (inv: any) => inv.status === "PENDING"
          ).length || 0,
          suspendedServices: 0, // TODO: Fetch from API
          overdueInvoices: invoicesData.invoices?.filter(
            (inv: any) => inv.status === "OVERDUE"
          ).length || 0,
        });
      }
    } catch (error) {
      console.error("[Dashboard] Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      icon: Users,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      trend: "+2.5%",
    },
    {
      title: "Active Services",
      value: stats.activeServices,
      icon: Wifi,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      trend: "+1.2%",
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      trend: "+8.3%",
    },
    {
      title: "Pending Invoices",
      value: stats.pendingInvoices,
      icon: FileText,
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      trend: "Monitor",
    },
  ];

  const alertCards = [
    {
      title: "Suspended Services",
      value: stats.suspendedServices,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Overdue Invoices",
      value: stats.overdueInvoices,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Overview of your WISP management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-slate-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-5 h-5 ${card.iconColor}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {isLoading ? "..." : card.value}
                    </p>
                  </div>
                  <p className="text-xs text-green-600 font-medium">
                    {card.trend}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alertCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="border-slate-200 border-l-4 border-l-red-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    {card.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">
                  {isLoading ? "..." : card.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <Card className="border-slate-200 lg:col-span-2">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Last 24 hours overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "API Health", status: "Operational", color: "bg-green-500" },
                { name: "Database", status: "Operational", color: "bg-green-500" },
                { name: "MikroTik Router", status: "Connected", color: "bg-green-500" },
                { name: "Payment Gateway", status: "Active", color: "bg-green-500" },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-slate-900">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
              New Customer
            </button>
            <button className="w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition font-medium text-sm">
              Generate Invoices
            </button>
            <button className="w-full px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition font-medium text-sm">
              View Reports
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
