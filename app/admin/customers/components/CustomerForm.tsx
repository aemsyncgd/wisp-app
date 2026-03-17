"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Customer {
  id?: string;
  name: string;
  email: string;
  phone?: string | null;
  documentId?: string | null;
  status: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  notes?: string | null;
  contactPerson?: string | null;
}

interface CustomerFormProps {
  customer?: Customer;
  onSubmit?: (customer: Customer) => void;
}

export default function CustomerForm({ customer }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<Customer>(
    customer || {
      name: "",
      email: "",
      phone: "",
      documentId: "",
      status: "ACTIVE",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      notes: "",
      contactPerson: "",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const method = customer?.id ? "PUT" : "POST";
      const url = customer?.id
        ? `/api/admin/customers/${customer.id}`
        : "/api/admin/customers";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save customer");
      }

      router.push("/admin/customers");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{customer?.id ? "Edit Customer" : "New Customer"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Full Name *</FieldLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </Field>

            <Field>
              <FieldLabel>Email *</FieldLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </Field>

            <Field>
              <FieldLabel>Phone</FieldLabel>
              <Input
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </Field>

            <Field>
              <FieldLabel>Document ID</FieldLabel>
              <Input
                name="documentId"
                value={formData.documentId || ""}
                onChange={handleChange}
                placeholder="123456789"
              />
            </Field>

            <Field>
              <FieldLabel>Contact Person</FieldLabel>
              <Input
                name="contactPerson"
                value={formData.contactPerson || ""}
                onChange={handleChange}
                placeholder="Contact person name"
              />
            </Field>

            <Field>
              <FieldLabel>Status</FieldLabel>
              <Select value={formData.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="space-y-4">
            <Field>
              <FieldLabel>Address</FieldLabel>
              <Input
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                placeholder="123 Main St"
              />
            </Field>

            <div className="grid grid-cols-3 gap-4">
              <Field>
                <FieldLabel>City</FieldLabel>
                <Input
                  name="city"
                  value={formData.city || ""}
                  onChange={handleChange}
                  placeholder="New York"
                />
              </Field>

              <Field>
                <FieldLabel>State</FieldLabel>
                <Input
                  name="state"
                  value={formData.state || ""}
                  onChange={handleChange}
                  placeholder="NY"
                />
              </Field>

              <Field>
                <FieldLabel>ZIP Code</FieldLabel>
                <Input
                  name="zipCode"
                  value={formData.zipCode || ""}
                  onChange={handleChange}
                  placeholder="10001"
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>Notes</FieldLabel>
              <Textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                placeholder="Additional notes about this customer..."
                rows={4}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Customer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
