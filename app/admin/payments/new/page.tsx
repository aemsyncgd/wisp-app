"use client";

import AdminHeader from "../../components/AdminHeader";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  customer: {
    id: string;
    name: string;
  };
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = searchParams.get("invoice");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(invoiceId || "");

  const [formData, setFormData] = useState({
    customerId: "",
    invoiceId: invoiceId || "",
    amount: "",
    method: "stripe",
    notes: "",
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      const response = await fetch("/api/admin/customers");
      const data = await response.json();
      setCustomers(data);
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!selectedCustomer) {
        setInvoices([]);
        return;
      }

      const response = await fetch(
        `/api/admin/customers/${selectedCustomer}/invoices`
      );
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    };

    fetchInvoices();
  }, [selectedCustomer]);

  const handleCustomerChange = (value: string) => {
    setSelectedCustomer(value);
    setFormData((prev) => ({ ...prev, customerId: value, invoiceId: "" }));
    setSelectedInvoice("");
  };

  const handleInvoiceChange = (value: string) => {
    setSelectedInvoice(value);
    setFormData((prev) => ({ ...prev, invoiceId: value }));

    const invoice = invoices.find((inv) => inv.id === value);
    if (invoice) {
      setFormData((prev) => ({ ...prev, amount: invoice.amount.toString() }));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMethodChange = (value: string) => {
    setFormData((prev) => ({ ...prev, method: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: formData.customerId,
          invoiceId: formData.invoiceId || null,
          amount: parseFloat(formData.amount),
          method: formData.method,
          notes: formData.notes,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to record payment");
      }

      router.push("/admin/payments");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AdminHeader title="Record Payment" description="Add a new customer payment" />

      <div className="p-8">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Record Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <Field>
                <FieldLabel>Customer *</FieldLabel>
                <Select value={selectedCustomer} onValueChange={handleCustomerChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Invoice (Optional)</FieldLabel>
                <Select value={selectedInvoice} onValueChange={handleInvoiceChange}>
                  <SelectTrigger disabled={!selectedCustomer}>
                    <SelectValue placeholder="Select an invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.map((invoice) => (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber} - ${invoice.amount.toFixed(2)} (
                        {invoice.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Payment Amount *</FieldLabel>
                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Payment Method *</FieldLabel>
                <Select value={formData.method} onValueChange={handleMethodChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="mercadopago">MercadoPago</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Notes</FieldLabel>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes about this payment..."
                  rows={4}
                />
              </Field>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Recording..." : "Record Payment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
