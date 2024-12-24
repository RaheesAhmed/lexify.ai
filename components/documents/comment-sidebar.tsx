import { useState } from "react";
import { useSession } from "next-auth/react";
import type { Comment, Reply, User } from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Send } from "lucide-react";

interface CommentWithUser extends Omit<Comment, "created_at" | "updated_at"> {
  created_at: string;
  updated_at: string;
  user: Pick<User, "id" | "name" | "image">;
  replies: (Omit<Reply, "created_at" | "updated_at"> & {
    created_at: string;
    updated_at: string;
    user: Pick<User, "id" | "name" | "image">;
  })[];
}

interface CommentSidebarProps {
  documentId: string;
  comments: CommentWithUser[];
  onAddComment: (comment: {
    content: string;
    startIndex: number;
    endIndex: number;
  }) => void;
  onAddReply: (commentId: string, content: string) => void;
  selectedText: { text: string; startIndex: number; endIndex: number } | null;
}

export function CommentSidebar({
  documentId,
  comments,
  onAddComment,
  onAddReply,
  selectedText,
}: CommentSidebarProps) {
  const { data: session } = useSession();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleAddComment = () => {
    if (!selectedText || !newComment.trim()) return;

    onAddComment({
      content: newComment,
      startIndex: selectedText.startIndex,
      endIndex: selectedText.endIndex,
    });
    setNewComment("");
  };

  const handleAddReply = (commentId: string) => {
    if (!replyContent.trim()) return;

    onAddReply(commentId, replyContent);
    setReplyContent("");
    setReplyingTo(null);
  };

  return (
    <div className="w-80 border-l border-border bg-background p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Comments</h2>
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
      </div>

      {selectedText && (
        <div className="mb-4 space-y-2">
          <div className="rounded-md bg-muted p-2 text-sm">
            "{selectedText.text}"
          </div>
          <div className="space-y-2">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="w-full"
            >
              Add Comment
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-2">
            <div className="flex items-start space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={comment.user.image || undefined} />
                <AvatarFallback>
                  {comment.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {comment.user.name || "Anonymous"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-sm">{comment.content}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                >
                  Reply
                </Button>
              </div>
            </div>

            {comment.replies.length > 0 && (
              <div className="ml-8 space-y-2">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex items-start space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={reply.user.image || undefined} />
                      <AvatarFallback>
                        {reply.user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {reply.user.name || "Anonymous"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(reply.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {replyingTo === comment.id && (
              <div className="ml-8 space-y-2">
                <div className="flex space-x-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="flex-1 min-h-[60px]"
                  />
                  <Button
                    size="icon"
                    onClick={() => handleAddReply(comment.id)}
                    disabled={!replyContent.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
