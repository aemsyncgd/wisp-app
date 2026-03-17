"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, FileText, Wifi, BarChart3 } from "lucide-react";

interface CustomerData {
  name: string;
  email: string;
  status: string;
  services: any[];
  pendingAmount: number;
}

export default function CustomerDashboard() {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await fetch("/api/customer/profile");
        if (response.ok) {
          const data = await response.json();
          setCustomer(data);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">Unable to load customer data</p>
            <Link href="/customer/login">
              <Button>Login Again</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {customer.name}!</h1>
        <p className="text-gray-600 mt-2">Manage your internet service account</p>
      </div>

      {/* Status Alert */}
      {customer.status === "SUSPENDED" && (
        <Card className="mb-8 border-red-300 bg-red-50">
          <CardContent className="flex items-start gap-4 p-6">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900">Service Suspended</h3>
              <p className="text-red-800 text-sm mt-1">
                Your service has been suspended due to overdue payment. Please pay your pending invoice to restore your service.
              </p>
              <Link href="/customer/invoices">
                <Button className="mt-3 bg-red-600 hover:bg-red-700">
                  View Pending Invoice
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <Wifi className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{customer.status}</div>
            <p className="text-xs text-gray-600 mt-1">Current account status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Wifi className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customer.services.length}</div>
            <p className="text-xs text-gray-600 mt-1">Internet plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Amount Due</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${customer.pendingAmount.toFixed(2)}
            </div>
            <p className="text-xs text-gray-600 mt-1">Pending payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">View Details</div>
            <p className="text-xs text-gray-600 mt-1">Bandwidth usage</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Services */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Services</CardTitle>
          </CardHeader>
          <CardContent>
            {customer.services.length === 0 ? (
              <p className="text-gray-500 text-sm">No active services</p>
            ) : (
              <div className="space-y-4">
                {customer.services.map((service: any) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{service.plan}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {service.speed} Mbps - ${service.price}/month
                        </p>
                      </div>
                      <span className="text-xs font-semibold px-2 py-1 rounded bg-green-100 text-green-800">
                        ACTIVE
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/customer/invoices" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                View Invoices
              </Button>
            </Link>
            <Link href="/customer/support" className="block">
              <Button variant="outline" className="w-full justify-start">
                <AlertCircle className="w-4 h-4 mr-2" />
                Get Support
              </Button>
            </Link>
            <Link href="/customer/account" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Wifi className="w-4 h-4 mr-2" />
                Account Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
