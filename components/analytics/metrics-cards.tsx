import { FileText, Users, CheckCircle, TrendingUp } from "lucide-react";

interface MetricsCardsProps {
  totalDocuments: number;
  activeUsers: number;
  completedAnalyses: number;
  processingRate: number;
}

export function MetricsCards({
  totalDocuments,
  activeUsers,
  completedAnalyses,
  processingRate,
}: MetricsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Total Documents</h3>
        </div>
        <p className="mt-4 text-2xl font-bold">{totalDocuments}</p>
        <p className="text-xs text-muted-foreground">Documents uploaded</p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Active Users</h3>
        </div>
        <p className="mt-4 text-2xl font-bold">{activeUsers}</p>
        <p className="text-xs text-muted-foreground">Users this month</p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Completed Analyses</h3>
        </div>
        <p className="mt-4 text-2xl font-bold">{completedAnalyses}</p>
        <p className="text-xs text-muted-foreground">Documents analyzed</p>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Processing Rate</h3>
        </div>
        <p className="mt-4 text-2xl font-bold">{processingRate}%</p>
        <p className="text-xs text-muted-foreground">Success rate</p>
      </div>
    </div>
  );
}
