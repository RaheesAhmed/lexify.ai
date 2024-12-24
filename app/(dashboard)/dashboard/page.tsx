"use client";

import { useState, useEffect } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useSession } from "next-auth/react";
import { AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";

export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Debug session data
  useEffect(() => {
    console.log("Session status:", status);
    console.log("Session data:", session);
  }, [session, status]);

  const handleFilesSelected = async (files: File[]) => {
    if (!session?.user) {
      setError("Please sign in to upload documents");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      for (const file of files) {
        console.log("Uploading file:", file.name, "Type:", file.type);

        const formData = new FormData();
        formData.append("file", file);
        // Get the actual user ID from the session
        formData.append("userId", session.user.id);

        console.log("Making request with userId:", session.user.id);

        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("Upload response:", data);

        if (!response.ok) {
          throw new Error(data.error || "Failed to upload file");
        }

        // Update progress for each file
        setProgress((prev) => prev + 100 / files.length);
      }

      // Reset state after successful upload
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to upload files"
      );
      setUploading(false);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Upload and manage your legal documents
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Upload Card */}
        <div className="col-span-1 rounded-xl border bg-card">
          <div className="border-b p-4">
            <h2 className="font-semibold">Quick Upload</h2>
          </div>
          <div className="p-4">
            <FileUpload
              onFilesSelected={handleFilesSelected}
              maxFiles={1}
              maxSize={10}
              accept={{
                "application/pdf": [".pdf"],
                "application/msword": [".doc"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  [".docx"],
              }}
              uploading={uploading}
              progress={progress}
            />
          </div>
        </div>

        {/* Recent Documents Card */}
        <div className="col-span-2 rounded-xl border bg-card">
          <div className="border-b p-4">
            <h2 className="font-semibold">Recent Documents</h2>
          </div>
          <div className="p-4">
            {/* TODO: Add recent documents list */}
            <p className="text-sm text-muted-foreground">No documents yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
