"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface SearchResult {
  id: string;
  title: string;
  content_preview: string;
  metadata: Record<string, any>;
  created_at: string;
  match_type: "title" | "content" | "metadata";
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery] = useDebounce(searchQuery, 500);

  const {
    data: results,
    isLoading,
    error,
  } = useQuery<SearchResult[]>({
    queryKey: ["search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const response = await fetch(
        `/api/documents/search?q=${encodeURIComponent(debouncedQuery)}`
      );
      if (!response.ok) {
        throw new Error("Search failed");
      }
      return response.json();
    },
    enabled: debouncedQuery.length > 0,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Search Documents</h1>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Search by title, content, or metadata..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xl"
          />
          <Button disabled={isLoading}>Search</Button>
        </div>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          An error occurred while searching. Please try again.
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && results && results.length === 0 && debouncedQuery && (
        <div className="text-gray-500">
          No documents found matching your search.
        </div>
      )}

      {results && results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => (
            <Link href={`/dashboard/documents/${result.id}`} key={result.id}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-xl">{result.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-2">{result.content_preview}</p>
                  <div className="flex gap-2">
                    <span className="text-sm text-blue-500">
                      Matched in {result.match_type}
                    </span>
                    <span className="text-sm text-gray-400">
                      {new Date(result.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
