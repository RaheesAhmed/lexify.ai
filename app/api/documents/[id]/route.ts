import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const params = context.params;
    const id = params.id;

    const document = await prisma.document.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        analysis: true,
      },
    });

    if (!document) {
      return new Response(JSON.stringify({ error: "Document not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(document), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch document" }), {
      status: 500,
    });
  }
}

// Add support for PATCH method to update document
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const params = context.params;
    const id = params.id;
    const body = await request.json();

    const document = await prisma.document.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: body,
    });

    return new Response(JSON.stringify(document), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error updating document:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update document" }),
      { status: 500 }
    );
  }
}
