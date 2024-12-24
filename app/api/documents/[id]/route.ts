import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = context.params;

    const document = await prisma.document.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!document) {
      return new NextResponse("Document not found", { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error("[DOCUMENT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = context.params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const document = await prisma.document.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        content,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error("[DOCUMENT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
