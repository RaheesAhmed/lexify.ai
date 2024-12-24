"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Toolbar } from "./toolbar";
import { useEffect } from "react";

interface EditorProps {
  content: string;
  onChange?: (content: string) => void;
  editable?: boolean;
}

export function Editor({ content, onChange, editable = true }: EditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full border rounded-lg">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="prose max-w-none p-4" />
    </div>
  );
}
