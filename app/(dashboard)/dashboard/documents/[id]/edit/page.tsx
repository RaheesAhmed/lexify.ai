"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { createClient } from "@supabase/supabase-js";
import { AlertCircle, Save } from "lucide-react";
import { Toolbar } from "@/components/editor/toolbar";
import { CollaboratorsList } from "@/components/editor/collaborators-list";
import { JSONContent } from "@tiptap/core";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Collaborator {
  id: string;
  name: string | null;
  color: string;
  position: { from: number; to: number } | null;
}

interface PresenceState {
  presence_ref: string;
  id: string;
  name: string | null;
  color: string;
  position: { from: number; to: number } | null;
}

interface DocumentContent {
  type: "doc";
  content: Array<{
    type: string;
    content?: Array<any>;
    text?: string;
  }>;
}

const defaultContent: JSONContent = {
  type: "doc",
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "" }],
    },
  ],
};

export default function DocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [documentTitle, setDocumentTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userColor, setUserColor] = useState<string>("#000000");

  // Generate user color on mount
  useEffect(() => {
    const colors = [
      "#2563eb", // blue
      "#059669", // green
      "#dc2626", // red
      "#7c3aed", // purple
      "#ea580c", // orange
      "#0891b2", // cyan
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setUserColor(randomColor);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Collaboration.configure({
        document: defaultContent,
      }),
      CollaborationCursor.configure({
        provider: supabase,
        user: session?.user
          ? {
              name: session.user.name || "Anonymous",
              color: userColor,
            }
          : undefined,
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[500px]",
      },
    },
  });

  useEffect(() => {
    if (!session?.user?.id || !params.id || !editor || !userColor) return;

    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/documents/${params.id}`);
        if (!response.ok) throw new Error("Failed to fetch document");
        const data = await response.json();

        setDocumentTitle(data.title || "Untitled");
        editor.commands.setContent(
          data.content || { type: "doc", content: [{ type: "paragraph" }] }
        );

        // Subscribe to document changes
        const channel = supabase
          .channel(`document-${params.id}`)
          .on("presence", { event: "sync" }, () => {
            try {
              const state = channel.presenceState();
              const users = Object.values(state)
                .flat()
                .filter((user: any): user is PresenceState => {
                  return (
                    user &&
                    typeof user === "object" &&
                    "id" in user &&
                    "name" in user &&
                    "color" in user
                  );
                })
                .map((user) => ({
                  id: user.id,
                  name: user.name,
                  color: user.color,
                  position: user.position,
                }));
              setCollaborators(users);
            } catch (error) {
              console.error("Error processing presence state:", error);
            }
          })
          .on("presence", { event: "join" }, ({ key, newPresences }) => {
            try {
              const validPresences = (newPresences as any[]).filter(
                (user): user is PresenceState => {
                  return (
                    user &&
                    typeof user === "object" &&
                    "id" in user &&
                    "name" in user &&
                    "color" in user
                  );
                }
              );
              const newUsers = validPresences.map((user) => ({
                id: user.id,
                name: user.name,
                color: user.color,
                position: user.position,
              }));
              setCollaborators((prev) => [...prev, ...newUsers]);
            } catch (error) {
              console.error("Error processing join event:", error);
            }
          })
          .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
            try {
              const validPresences = (leftPresences as any[]).filter(
                (user): user is PresenceState => {
                  return (
                    user &&
                    typeof user === "object" &&
                    "id" in user &&
                    "name" in user &&
                    "color" in user
                  );
                }
              );
              setCollaborators((prev) =>
                prev.filter((p) => !validPresences.find((lp) => lp.id === p.id))
              );
            } catch (error) {
              console.error("Error processing leave event:", error);
            }
          })
          .subscribe(async (status) => {
            if (status === "SUBSCRIBED" && session?.user) {
              await channel.track({
                id: session.user.id,
                name: session.user.name,
                color: userColor,
                position: null,
              });
            }
          });

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error("Error fetching document:", error);
        setError("Failed to load document");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [session?.user, params.id, editor, userColor]);

  const handleSave = async () => {
    if (!editor || !session?.user?.id || !params?.id) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/documents/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: editor.getJSON(),
        }),
      });

      if (!response.ok) throw new Error("Failed to save document");

      // Broadcast the changes to other users
      await supabase.channel(`document-${params.id}`).send({
        type: "broadcast",
        event: "doc_update",
        payload: {
          content: editor.getJSON(),
          userId: session.user.id,
        },
      });

      setError(null);
    } catch (error) {
      console.error("Error saving document:", error);
      setError("Failed to save document");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !editor) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {documentTitle || "Untitled"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Collaborative document editor
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CollaboratorsList collaborators={collaborators} />
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="rounded-lg border bg-card">
        <Toolbar editor={editor} />
        <div className="p-4">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
