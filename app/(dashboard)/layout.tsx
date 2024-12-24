import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import {
  Search,
  LayoutDashboard,
  FileText,
  LogOut,
  BarChart3,
  Settings,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header
        className="sticky top-0 z-40 border-b bg-background"
        role="banner"
      >
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex gap-6 md:gap-10">
            <Link
              href="/"
              className="hidden items-center space-x-2 md:flex"
              aria-label="Go to homepage"
            >
              <span className="hidden font-bold sm:inline-block">
                Lexify.ai
              </span>
            </Link>
          </div>
          <SignOutButton />
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside
          className="hidden w-[200px] flex-col md:flex"
          role="navigation"
          aria-label="Main navigation"
        >
          <nav className="grid items-start gap-2">
            <Link
              href="/dashboard"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label="Dashboard"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboard/analytics"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label="Analytics"
            >
              <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Analytics</span>
            </Link>
            <Link
              href="/dashboard/documents"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label="Documents"
            >
              <FileText className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Documents</span>
            </Link>
            <Link
              href="/dashboard/search"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label="Search documents"
            >
              <Search className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Search</span>
            </Link>
            <div className="my-2 h-px bg-border" role="separator" />
            <Link
              href="/settings"
              className="group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label="Settings"
            >
              <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Settings</span>
            </Link>
          </nav>
        </aside>
        <main
          className="flex w-full flex-1 flex-col overflow-hidden"
          role="main"
          id="main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
