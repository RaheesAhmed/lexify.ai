"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Play,
  Clock,
  Shield,
  Scale,
  ArrowLeft,
  MessageSquare,
  X,
} from "lucide-react";
import { Editor } from "@/components/editor/editor";
import { CommentSidebar } from "@/components/documents/comment-sidebar";
import { useDocumentComments } from "@/lib/hooks/use-document-comments";
import { Button } from "@/components/ui/button";

interface DocumentData {
  id: string;
  name: string;
  content: string;
  status: string;
  lastUpdated: string;
  size: string;
  riskScore: number;
  clauses: Array<{
    id: number;
    type: string;
    content: string;
    risk: string;
    recommendation: string | null;
  }>;
  compliance: Array<{
    id: number;
    check: string;
    status: string;
    details: string;
  }>;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default function DocumentAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [content, setContent] = useState("");

  const {
    comments,
    selectedText,
    loading: commentsLoading,
    addComment,
    addReply,
  } = useDocumentComments(params.id as string);

  useEffect(() => {
    if (!params?.id) return;
    fetchDocument();
    // If document is processing, poll for updates
    if (documentData?.status === "Processing") {
      const interval = setInterval(fetchDocument, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [params?.id, documentData?.status]);

  const fetchDocument = async () => {
    if (!params?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }
      const data = await response.json();

      // Transform the data to match our interface
      const transformedData: DocumentData = {
        id: data.id,
        name: data.title || "Untitled",
        content: data.content,
        status: data.metadata?.status || "PENDING",
        lastUpdated: new Date(data.updated_at).toLocaleString(),
        size: formatFileSize(data.file_size),
        riskScore: data.analysis?.riskScore || 0,
        clauses: data.analysis?.clauses || [],
        compliance: data.analysis?.compliance || [],
      };

      setDocumentData(transformedData);
      setError(null);
    } catch (error) {
      console.error("Error fetching document:", error);
      setError("Failed to load document. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/documents/${params.id}`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to analyze document");
      }
      const data = await response.json();
      setDocumentData(data);
      setError(null);
    } catch (error) {
      console.error("Analysis error:", error);
      setError("Failed to analyze document. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-destructive";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const handleContentChange = async (newContent: string) => {
    setContent(newContent);
    try {
      const response = await fetch(`/api/documents/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newContent }),
      });

      if (!response.ok) throw new Error("Failed to update document");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 animate-spin" />
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <p>Document not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Document Header */}
      <div className="sticky top-0 z-40 border-b bg-background px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <h1 className="text-lg font-semibold">{documentData?.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowComments(!showComments)}
              className="h-8 w-8"
            >
              {showComments ? (
                <X className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || documentData?.status === "Processing"}
              size="sm"
            >
              {isAnalyzing || documentData?.status === "Processing" ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-4xl py-6">
            <Editor
              content={documentData?.content || ""}
              onChange={handleContentChange}
              editable={!isAnalyzing}
            />

            {/* Analysis Results */}
            <div className="mt-8 space-y-6">
              {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Document Info */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Document Info</h3>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm">{documentData.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {documentData.size} • {documentData.lastUpdated}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">Risk Score</h3>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-semibold">
                      {documentData.riskScore}%
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Overall Risk Level
                    </p>
                  </div>
                </div>
              </div>

              {/* Clauses Analysis */}
              {documentData?.clauses && documentData.clauses.length > 0 && (
                <div className="rounded-xl border bg-card">
                  <div className="border-b p-4">
                    <div className="flex items-center gap-2">
                      <Scale className="h-5 w-5" />
                      <h2 className="font-semibold">Key Clauses</h2>
                    </div>
                  </div>
                  <div className="divide-y">
                    {documentData.clauses.map((clause) => (
                      <div key={clause.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium">{clause.type}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {clause.content}
                            </p>
                            {clause.recommendation && (
                              <p
                                className={`mt-2 text-sm ${
                                  clause.risk === "high"
                                    ? "text-destructive"
                                    : "text-yellow-500"
                                }`}
                              >
                                Recommendation: {clause.recommendation}
                              </p>
                            )}
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getRiskColor(
                              clause.risk
                            )}`}
                          >
                            {clause.risk} risk
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compliance Checks */}
              {documentData?.compliance &&
                documentData.compliance.length > 0 && (
                  <div className="rounded-xl border bg-card">
                    <div className="border-b p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        <h2 className="font-semibold">Compliance Checks</h2>
                      </div>
                    </div>
                    <div className="divide-y">
                      {documentData.compliance.map((check) => (
                        <div
                          key={check.id}
                          className="flex items-center gap-4 p-4"
                        >
                          {getComplianceIcon(check.status)}
                          <div>
                            <h3 className="font-medium">{check.check}</h3>
                            <p className="text-sm text-muted-foreground">
                              {check.details}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Comment Sidebar */}
        {showComments && (
          <CommentSidebar
            documentId={params.id as string}
            comments={comments}
            selectedText={selectedText}
            onAddComment={addComment}
            onAddReply={addReply}
          />
        )}
      </div>
    </div>
  );
}
