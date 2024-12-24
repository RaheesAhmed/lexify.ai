import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, eachDayOfInterval, format } from "date-fns";

interface DailyCount {
  created_at: Date;
  updated_at: Date;
  _count: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          totalDocuments: 0,
          activeUsers: 0,
          completedAnalyses: 0,
          processingRate: 0,
          trendsData: {
            labels: [],
            datasets: [],
          },
        },
        { status: 401 }
      );
    }

    // Get total documents for the user
    const totalDocuments = await prisma.document
      .count({
        where: {
          userId: session.user.id,
        },
      })
      .catch(() => 0);

    // Get active users (users who have uploaded documents this month)
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());
    const activeUsers = await prisma.user
      .count({
        where: {
          documents: {
            some: {
              created_at: {
                gte: startDate,
                lte: endDate,
              },
            },
          },
        },
      })
      .catch(() => 0);

    // Get completed analyses for the user
    const completedAnalyses = await prisma.document
      .count({
        where: {
          userId: session.user.id,
          metadata: {
            not: null,
            path: ["status"],
            equals: "ANALYZED",
          },
        },
      })
      .catch(() => 0);

    // Calculate processing rate for the user
    const totalProcessed = await prisma.document
      .count({
        where: {
          userId: session.user.id,
          metadata: {
            not: null,
            path: ["status"],
            in: ["ANALYZED", "FAILED"],
          },
        },
      })
      .catch(() => 0);

    const processingRate =
      totalProcessed > 0
        ? Math.round((completedAnalyses / totalProcessed) * 100)
        : 100;

    // Get processing trends (last 30 days) for the user
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get daily uploads
    const dailyUploads = await prisma.document
      .groupBy({
        by: ["created_at"],
        where: {
          userId: session.user.id,
          created_at: {
            gte: thirtyDaysAgo,
          },
        },
        _count: true,
      })
      .catch(() => [] as DailyCount[]);

    // Get daily completed analyses
    const dailyAnalyses = await prisma.document
      .groupBy({
        by: ["updated_at"],
        where: {
          userId: session.user.id,
          metadata: {
            not: null,
            path: ["status"],
            equals: "ANALYZED",
          },
          updated_at: {
            gte: thirtyDaysAgo,
          },
        },
        _count: true,
      })
      .catch(() => [] as DailyCount[]);

    // Generate labels for all days
    const days = eachDayOfInterval({
      start: thirtyDaysAgo,
      end: new Date(),
    });

    const labels = days.map((day) => format(day, "MMM d"));

    // Map uploads data
    const uploadData = days.map((day) => {
      const found = dailyUploads.find(
        (doc: DailyCount) =>
          format(new Date(doc.created_at), "yyyy-MM-dd") ===
          format(day, "yyyy-MM-dd")
      );
      return found ? found._count : 0;
    });

    // Map analyses data
    const analysisData = days.map((day) => {
      const found = dailyAnalyses.find(
        (doc: DailyCount) =>
          format(new Date(doc.updated_at), "yyyy-MM-dd") ===
          format(day, "yyyy-MM-dd")
      );
      return found ? found._count : 0;
    });

    const trendsData = {
      labels,
      datasets: [
        {
          label: "Uploads",
          data: uploadData,
          borderColor: "rgb(37, 99, 235)",
          backgroundColor: "rgba(37, 99, 235, 0.5)",
        },
        {
          label: "Completed Analyses",
          data: analysisData,
          borderColor: "rgb(5, 150, 105)",
          backgroundColor: "rgba(5, 150, 105, 0.5)",
        },
      ],
    };

    return NextResponse.json({
      totalDocuments,
      activeUsers,
      completedAnalyses,
      processingRate,
      trendsData,
    });
  } catch (error) {
    console.error("[ANALYTICS_GET]", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
        totalDocuments: 0,
        activeUsers: 0,
        completedAnalyses: 0,
        processingRate: 0,
        trendsData: {
          labels: [],
          datasets: [],
        },
      },
      { status: 500 }
    );
  }
}
