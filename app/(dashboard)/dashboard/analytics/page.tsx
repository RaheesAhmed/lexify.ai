"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Clock, AlertCircle } from "lucide-react";
import { MetricsCards } from "@/components/analytics/metrics-cards";
import { ProcessingTrends } from "@/components/analytics/processing-trends";

interface AnalyticsData {
  totalDocuments: number;
  activeUsers: number;
  completedAnalyses: number;
  processingRate: number;
  trendsData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      borderColor: string;
      backgroundColor: string;
    }[];
  };
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchAnalytics();
      // Refresh analytics every 5 minutes
      const interval = setInterval(fetchAnalytics, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [status, session?.user?.id]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/analytics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error) {
          throw new Error(errorData.error);
        }
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format");
      }

      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 animate-spin" />
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return null;
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          Overview of your document processing analytics
        </p>
      </div>

      <MetricsCards
        totalDocuments={analyticsData.totalDocuments}
        activeUsers={analyticsData.activeUsers}
        completedAnalyses={analyticsData.completedAnalyses}
        processingRate={analyticsData.processingRate}
      />

      <ProcessingTrends data={analyticsData.trendsData} />
    </div>
  );
}
