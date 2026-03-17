import AdminHeader from "../components/AdminHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Wifi, Database, Lock } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <AdminHeader title="Settings" description="System configuration and management" />

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Stats */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-green-50">
                  <Database className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Database</p>
                  <p className="text-lg font-semibold">Connected</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <Wifi className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">MikroTik API</p>
                  <p className="text-lg font-semibold">Configured</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-purple-50">
                  <Lock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Authentication</p>
                  <p className="text-lg font-semibold">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Setup email for invoices and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Email configuration is not yet implemented. This will be used for sending invoices,
                  payment reminders, and service notifications.
                </p>
              </div>
              <Button variant="outline" className="w-full">
                Configure Email Settings
              </Button>
            </CardContent>
          </Card>

          {/* Stripe Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway</CardTitle>
              <CardDescription>Configure Stripe and payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  Add your Stripe API keys to enable online payment processing. You can also configure
                  alternative payment methods like MercadoPago or PayPal.
                </p>
              </div>
              <Button variant="outline" className="w-full">
                Configure Payments
              </Button>
            </CardContent>
          </Card>

          {/* MikroTik Router Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>MikroTik Routers</CardTitle>
              <CardDescription>Manage your RouterOS devices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Configure your MikroTik routers for automated user and queue management.
              </p>
              <Button variant="outline" className="w-full">
                Manage Routers
              </Button>
            </CardContent>
          </Card>

          {/* Service Plans Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Service Plans</CardTitle>
              <CardDescription>Create and manage internet service plans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Configure different internet speed tiers and pricing for your customers.
              </p>
              <Button variant="outline" className="w-full">
                Manage Service Plans
              </Button>
            </CardContent>
          </Card>

          {/* Cron Jobs Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Jobs</CardTitle>
              <CardDescription>Configure automated billing and tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Daily Invoice Generation</span>
                  <span className="text-green-600 font-semibold">00:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Overdue Payment Processing</span>
                  <span className="text-green-600 font-semibold">06:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Reminders</span>
                  <span className="text-green-600 font-semibold">08:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Bandwidth Sync</span>
                  <span className="text-green-600 font-semibold">Every 5 min</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Backup Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Backup & Export</CardTitle>
              <CardDescription>Backup your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Create backups of your customer data and configuration settings.
              </p>
              <Button variant="outline" className="w-full">
                Create Backup
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
