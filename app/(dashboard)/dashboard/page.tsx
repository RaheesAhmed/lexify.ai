"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFilesSelected = async (files: File[]) => {
    if (!session?.user?.id) return;

    setUploading(true);
    setProgress(0);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", session.user.id);

        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to upload file");
        }

        // Update progress for each file
        setProgress((prev) => prev + 100 / files.length);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Upload and manage your legal documents
        </p>
      </div>

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
