import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface DocumentSearchResult {
  id: string;
  title: string;
  content_preview: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(request: Request) {
  try {
    // Get session to check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get search query from URL
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Perform full-text search using Supabase
    const { data: documents, error } = await supabase
      .from("documents")
      .select("id, title, content_preview, metadata, created_at")
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { error: "Failed to perform search" },
        { status: 500 }
      );
    }

    // Process and return results
    const results = (documents as DocumentSearchResult[]).map((doc) => ({
      id: doc.id,
      title: doc.title,
      content_preview: doc.content_preview || "",
      metadata: doc.metadata || {},
      created_at: doc.created_at,
      match_type: determineMatchType(doc, query),
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "An error occurred during search" },
      { status: 500 }
    );
  }
}

function determineMatchType(
  doc: DocumentSearchResult,
  query: string
): "title" | "content" | "metadata" {
  const lowerQuery = query.toLowerCase();
  if (doc.title.toLowerCase().includes(lowerQuery)) {
    return "title";
  }
  if (doc.content_preview?.toLowerCase().includes(lowerQuery)) {
    return "content";
  }
  return "metadata";
}
