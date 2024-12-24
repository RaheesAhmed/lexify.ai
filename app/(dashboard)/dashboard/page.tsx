"use client";

import { useState, useEffect } from "react";
import { FileText, AlertCircle } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

interface Document {
  id: string;
  name: string;
  status: string;
  lastUpdated: string;
  size: string;
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      const data = await response.json();
      setDocuments(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Failed to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      const data = await response.json();
      setDocuments((prev) => [
        {
          id: data.id,
          name: data.name,
          status: data.status,
          lastUpdated: "Just now",
          size: formatFileSize(file.size),
        },
        ...prev,
      ]);
      setError(null);
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
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

      {/* File Upload */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 text-lg font-medium">Upload Documents</h2>
        <FileUpload onUpload={handleUpload} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Documents List */}
      <div className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <h2 className="text-lg font-medium">Recent Documents</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <h3 className="font-medium">No documents yet</h3>
            <p className="text-sm text-muted-foreground">
              Upload your first document to get started
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {doc.size} • {doc.lastUpdated}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      doc.status === "Analyzed"
                        ? "bg-success/10 text-success"
                        : doc.status === "Processing"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
