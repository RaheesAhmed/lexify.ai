"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
} from "lucide-react";

interface DocumentData {
  name: string;
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
  const [documentData, setDocumentData] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
        name: data.title || "Untitled",
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
    <div className="space-y-6">
      {/* Document Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </button>
          <h1 className="text-2xl font-semibold tracking-tight">
            Document Analysis
          </h1>
          <p className="text-sm text-muted-foreground">
            View detailed analysis results and risk assessment
          </p>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || documentData.status === "Processing"}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isAnalyzing || documentData.status === "Processing" ? (
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
        </button>
      </div>

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
            <p className="text-2xl font-semibold">{documentData.riskScore}%</p>
            <p className="text-xs text-muted-foreground">Overall Risk Level</p>
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
      {documentData?.compliance && documentData.compliance.length > 0 && (
        <div className="rounded-xl border bg-card">
          <div className="border-b p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              <h2 className="font-semibold">Compliance Checks</h2>
            </div>
          </div>
          <div className="divide-y">
            {documentData.compliance.map((check) => (
              <div key={check.id} className="flex items-center gap-4 p-4">
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
  );
}
