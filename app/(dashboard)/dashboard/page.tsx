"use client";

import { FileText, BarChart3, Users, Clock } from "lucide-react";

const stats = [
  {
    name: "Total Documents",
    value: "2,345",
    change: "+12.3%",
    icon: FileText,
  },
  {
    name: "Analysis Completed",
    value: "1,876",
    change: "+8.2%",
    icon: BarChart3,
  },
  {
    name: "Team Members",
    value: "12",
    change: "+2",
    icon: Users,
  },
  {
    name: "Avg. Processing Time",
    value: "2.4m",
    change: "-18.5%",
    icon: Clock,
  },
];

const recentDocuments = [
  {
    id: 1,
    name: "Contract Agreement.pdf",
    status: "Analyzed",
    date: "2 hours ago",
    type: "Contract",
  },
  {
    id: 2,
    name: "Legal Brief - Case 123.docx",
    status: "Processing",
    date: "5 hours ago",
    type: "Brief",
  },
  {
    id: 3,
    name: "NDA - Company XYZ.pdf",
    status: "Analyzed",
    date: "1 day ago",
    type: "NDA",
  },
  {
    id: 4,
    name: "Patent Application.pdf",
    status: "Queued",
    date: "1 day ago",
    type: "Patent",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <span className="text-sm font-medium text-success">
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Documents */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Recent Documents</h2>
        </div>
        <div className="divide-y">
          {recentDocuments.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-6 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.type} • {doc.date}
                  </p>
                </div>
              </div>
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
      </div>
    </div>
  );
}
