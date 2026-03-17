"use client";

import { useState } from "react";
import { Bell, Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";

interface AdminHeaderProps {
  title: string;
  description?: string;
}

export default function AdminHeader({ title, description }: AdminHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100">
              <Bell className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-sm font-semibold">
                {session?.user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <span className="text-sm text-gray-700">{session?.user?.email || "Admin"}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
