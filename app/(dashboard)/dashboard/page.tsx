"use client";

import { useState, useEffect } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { useSession } from "next-auth/react";
import { AlertCircle, FileText, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

interface Document {
  id: string;
  title: string;
  file_type: string;
  file_size: number;
  created_at: string;
  metadata: {
    originalName: string;
    uploadedAt: string;
    status: "PENDING" | "PROCESSING" | "ANALYZED" | "FAILED";
  };
}

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
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDocuments();
    }
  }, [session?.user?.id]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(
        `/api/documents?userId=${session?.user?.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

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

      // Refresh documents list after successful upload
      fetchDocuments();

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
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
            {loadingDocuments ? (
              <div className="flex items-center justify-center py-4">
                <Clock className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents yet</p>
            ) : (
              <div className="space-y-4">
                {documents.slice(0, 5).map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/dashboard/documents/${doc.id}`}
                    className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-lg bg-primary/10 p-2">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.file_type} • {formatDate(doc.created_at)} •{" "}
                          {formatFileSize(doc.file_size)}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {doc.metadata.status}
                    </div>
                  </Link>
                ))}
                {documents.length > 5 && (
                  <Link
                    href="/dashboard/documents"
                    className="block text-center text-sm text-primary hover:underline"
                  >
                    View all documents
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
