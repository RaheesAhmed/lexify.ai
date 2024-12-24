"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Editor } from "@/components/editor/editor";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DocumentPage() {
  const params = useParams();
  const { toast } = useToast();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDocument = async () => {
      if (!params?.id) return;

      try {
        const response = await fetch(`/api/documents/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch document");
        const data = await response.json();
        setContent(data.content || "");
      } catch (error) {
        console.error("Error fetching document:", error);
        toast({
          title: "Error",
          description: "Failed to load document",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [params?.id, toast]);

  const handleSave = async () => {
    if (!content || !params?.id) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/documents/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to save document");

      toast({
        title: "Success",
        description: "Document saved successfully",
      });
    } catch (error) {
      console.error("Error saving document:", error);
      toast({
        title: "Error",
        description: "Failed to save document",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading || content === null) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
      <Editor content={content} onChange={setContent} editable={!saving} />
    </div>
  );
}
