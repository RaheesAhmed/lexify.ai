import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: {
    id: string;
  };
}

// Get all comments for a document
export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = context.params;

    const comments = await prisma.comment.findMany({
      where: {
        documentId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            created_at: "asc",
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error("[COMMENTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Create a new comment
export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = context.params;
    const body = await request.json();
    const { content, startIndex, endIndex } = body;

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    if (typeof startIndex !== "number" || typeof endIndex !== "number") {
      return new NextResponse("Invalid selection range", { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        startIndex,
        endIndex,
        userId: session.user.id,
        documentId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error("[COMMENT_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
