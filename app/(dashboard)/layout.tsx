"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { UserProfile } from "@/components/user-profile";
import {
  LayoutGrid,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronDown,
  Bell,
  Upload,
} from "lucide-react";

const sidebarLinks = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutGrid,
  },
  {
    href: "/dashboard/documents",
    label: "My Documents",
    icon: FileText,
  },
  {
    href: "/dashboard/upload",
    label: "Upload Documents",
    icon: Upload,
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } border-r bg-card md:translate-x-0 w-64`}
      >
        <div className="flex h-full flex-col">
          {/* Sidebar Header */}
          <div className="border-b p-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo className="h-8 w-auto" />
            </Link>
          </div>

          {/* Sidebar Links */}
          <nav className="flex-1 space-y-1 p-4">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex flex-col ${isSidebarOpen ? "md:pl-64" : ""}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center gap-4 px-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted md:hidden"
            >
              {isSidebarOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle sidebar</span>
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-primary" />
                <span className="sr-only">Notifications</span>
              </button>
              <UserProfile />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="container mx-auto py-6 px-4 md:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
