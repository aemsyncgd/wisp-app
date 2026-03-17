import AdminHeader from "../../../components/AdminHeader";
import CustomerForm from "../../components/CustomerForm";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

async function getCustomer(id: string) {
  return prisma.customer.findUnique({
    where: { id },
  });
}

export default async function EditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  const customer = await getCustomer(params.id);

  if (!customer) {
    notFound();
  }

  return (
    <div>
      <AdminHeader title={`Edit ${customer.name}`} description="Update customer information" />
      <div className="p-8">
        <CustomerForm customer={customer} />
      </div>
    </div>
  );
}
