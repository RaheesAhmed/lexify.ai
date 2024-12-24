import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  created_at: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  replies: Array<{
    id: string;
    content: string;
    created_at: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
}

interface SelectedText {
  text: string;
  startIndex: number;
  endIndex: number;
}

export function useDocumentComments(documentId: string) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedText, setSelectedText] = useState<SelectedText | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/comments`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  // Add comment
  const addComment = async (comment: {
    content: string;
    startIndex: number;
    endIndex: number;
  }) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(comment),
      });

      if (!response.ok) throw new Error("Failed to add comment");

      const newComment = await response.json();
      setComments((prev) => [newComment, ...prev]);
      setSelectedText(null);
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Add reply
  const addReply = async (commentId: string, content: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to add reply");

      const newReply = await response.json();
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              replies: [...comment.replies, newReply],
            };
          }
          return comment;
        })
      );
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const text = range.toString().trim();

    if (text) {
      setSelectedText({
        text,
        startIndex: range.startOffset,
        endIndex: range.endOffset,
      });
    } else {
      setSelectedText(null);
    }
  }, []);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    document.addEventListener("mouseup", handleTextSelection);
    return () => {
      document.removeEventListener("mouseup", handleTextSelection);
    };
  }, [handleTextSelection]);

  return {
    comments,
    selectedText,
    loading,
    addComment,
    addReply,
  };
}
