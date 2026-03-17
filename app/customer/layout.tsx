import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WISP Customer Portal",
  description: "Manage your internet service account",
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-900 text-white p-6 hidden md:flex flex-col">
        <h1 className="text-xl font-bold mb-8">WISP Portal</h1>
        <nav className="space-y-2 flex-1">
          <a
            href="/customer/dashboard"
            className="block py-2 px-4 rounded hover:bg-blue-800"
          >
            Dashboard
          </a>
          <a
            href="/customer/invoices"
            className="block py-2 px-4 rounded hover:bg-blue-800"
          >
            Invoices
          </a>
          <a
            href="/customer/services"
            className="block py-2 px-4 rounded hover:bg-blue-800"
          >
            My Services
          </a>
          <a
            href="/customer/support"
            className="block py-2 px-4 rounded hover:bg-blue-800"
          >
            Support
          </a>
        </nav>
        <a
          href="/customer/login"
          className="block py-2 px-4 rounded bg-blue-700 hover:bg-blue-600 text-center"
        >
          Logout
        </a>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4">
          <h2 className="text-xl font-semibold text-gray-900">Customer Portal</h2>
        </header>
        <main className="flex-1 overflow-y-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
