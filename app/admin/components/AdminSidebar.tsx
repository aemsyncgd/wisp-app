"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Wifi, 
  LayoutDashboard, 
  Users, 
  FileText, 
  CreditCard, 
  BarChart3, 
  MapPin, 
  Settings,
  LogOut 
} from "lucide-react";
import { signOut } from "next-auth/react";

const menuItems = [
  { icon: LayoutDashboard, text: "Dashboard", href: "/admin" },
  { icon: Users, text: "Customers", href: "/admin/customers" },
  { icon: FileText, text: "Invoices", href: "/admin/invoices" },
  { icon: CreditCard, text: "Payments", href: "/admin/payments" },
  { icon: BarChart3, text: "Analytics", href: "/admin/analytics" },
  { icon: MapPin, text: "Locations", href: "/admin/locations" },
  { icon: Settings, text: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-slate-900 text-white w-64 space-y-6 py-7 px-2 h-screen overflow-y-auto fixed left-0 top-0">
      <Link href="/admin" className="text-white flex items-center space-x-2 px-4">
        <Wifi className="w-8 h-8" />
        <span className="text-xl font-bold">WISP Manager</span>
      </Link>
      
      <nav className="space-y-1">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={index}
              href={item.href}
              className={`block py-2.5 px-4 rounded transition duration-200 flex items-center space-x-3 ${
                isActive
                  ? "bg-slate-700 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.text}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <button
          onClick={() => signOut({ redirectTo: "/admin/login" })}
          className="w-full flex items-center space-x-3 py-2 px-4 rounded text-slate-300 hover:bg-slate-800 hover:text-white transition"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
