"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface Document {
  id: string;
  title: string;
  file_type: string;
  file_size: number;
  created_at: string;
  updated_at: string;
  metadata: {
    originalName: string;
    uploadedAt: string;
    status: "PENDING" | "PROCESSING" | "ANALYZED" | "FAILED";
  };
}

export default function DocumentsPage() {
  const { data: session } = useSession();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDocuments();
      // Set up polling for document status updates
      const interval = setInterval(fetchDocuments, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
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
      setDocuments(data.documents);
      setError(null);
    } catch (error) {
      console.error("Error fetching documents:", error);
      setError("Failed to load documents. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      !selectedStatus || doc.metadata?.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ANALYZED":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "PROCESSING":
        return <Clock className="h-4 w-4 text-primary animate-spin" />;
      case "FAILED":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 animate-spin" />
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            My Documents
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage your legal documents
          </p>
        </div>
        <Link
          href="/dashboard/upload"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
        >
          Upload Documents
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-md border border-input bg-background pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={selectedStatus || ""}
            onChange={(e) => setSelectedStatus(e.target.value || null)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Status</option>
            <option value="ANALYZED">Analyzed</option>
            <option value="PROCESSING">Processing</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="rounded-xl border bg-card">
        <div className="divide-y">
          {filteredDocuments.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No documents found
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <Link
                key={doc.id}
                href={`/dashboard/documents/${doc.id}`}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
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
                <div className="flex items-center gap-4">
                  {doc.metadata?.status && (
                    <div className="flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {getStatusIcon(doc.metadata.status)}
                      <span
                        className={
                          doc.metadata.status === "ANALYZED"
                            ? "text-success"
                            : doc.metadata.status === "PROCESSING"
                            ? "text-primary"
                            : "text-destructive"
                        }
                      >
                        {doc.metadata.status}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
