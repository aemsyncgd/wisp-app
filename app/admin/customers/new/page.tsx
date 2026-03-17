import AdminHeader from "../../components/AdminHeader";
import CustomerForm from "../components/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div>
      <AdminHeader title="New Customer" description="Create a new customer account" />
      <div className="p-8">
        <CustomerForm />
      </div>
    </div>
  );
}
