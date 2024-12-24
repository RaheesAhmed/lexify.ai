"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { LazyLoading } from "@/components/ui/lazy-loading";
import type { User } from "next-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Dynamically import form components
const UserProfileForm = dynamic(
  () =>
    import("@/components/settings/user-profile-form").then(
      (mod) => mod.UserProfileForm
    ),
  {
    loading: () => (
      <div className="space-y-6" aria-label="Loading user profile form">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2" aria-hidden="true">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
            </div>
          ))}
          <div className="h-10 w-32 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

const TeamManagement = dynamic(
  () =>
    import("@/components/settings/team-management").then(
      (mod) => mod.TeamManagement
    ),
  {
    loading: () => (
      <div className="space-y-8" aria-label="Loading team management">
        <div className="space-y-4" aria-hidden="true">
          <div className="h-6 w-40 animate-pulse rounded bg-muted" />
          <div className="h-[200px] animate-pulse rounded-md bg-muted" />
        </div>
      </div>
    ),
    ssr: false,
  }
);

export default function SettingsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  if (status === "loading") {
    return (
      <div
        className="flex h-[50vh] items-center justify-center"
        role="status"
        aria-label="Loading settings"
      >
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  const user = session?.user as User | undefined;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and team preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList aria-label="Settings sections">
          <TabsTrigger value="profile">User Profile</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
        </TabsList>

        <TabsContent
          value="profile"
          className="space-y-6"
          role="tabpanel"
          aria-label="User profile settings"
        >
          <div className="rounded-lg border p-6">
            <LazyLoading>
              <UserProfileForm user={user} />
            </LazyLoading>
          </div>
        </TabsContent>

        <TabsContent
          value="team"
          className="space-y-6"
          role="tabpanel"
          aria-label="Team management settings"
        >
          <div className="rounded-lg border p-6">
            <LazyLoading>
              <TeamManagement userId={user?.id} />
            </LazyLoading>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
