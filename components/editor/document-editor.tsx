import { useCallback, useEffect, useRef } from "react";
import { Editor as TiptapEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEditor } from "@tiptap/react";
import { EditorContent } from "@tiptap/react";
import Highlight from "@tiptap/extension-highlight";

interface EditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

export function Editor({ initialContent, onChange }: EditorProps) {
  const editorRef = useRef<TiptapEditor | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    if (editor) {
      editorRef.current = editor;
    }
  }, [editor]);

  const handleSelectionChange = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !editorRef.current) return;

    const range = selection.getRangeAt(0);
    const editorElement = editorRef.current.view.dom;

    // Only handle selections within the editor
    if (!editorElement.contains(range.commonAncestorContainer)) return;

    // Get the selected text and its position
    const text = range.toString().trim();
    if (!text) return;

    // Calculate the absolute offsets
    const start = getTextOffset(
      editorElement,
      range.startContainer,
      range.startOffset
    );
    const end = getTextOffset(
      editorElement,
      range.endContainer,
      range.endOffset
    );

    // Dispatch a custom event with the selection details
    const event = new CustomEvent("textSelected", {
      detail: {
        text,
        startIndex: start,
        endIndex: end,
      },
    });
    window.dispatchEvent(event);
  }, []);

  useEffect(() => {
    document.addEventListener("mouseup", handleSelectionChange);
    return () => {
      document.removeEventListener("mouseup", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  if (!editor) {
    return null;
  }

  return (
    <div className="min-h-[500px] w-full rounded-lg border bg-background p-4">
      <EditorContent editor={editor} />
    </div>
  );
}

// Helper function to calculate absolute text offset
function getTextOffset(root: Node, node: Node, offset: number): number {
  let absoluteOffset = 0;

  // Create a TreeWalker to iterate through all text nodes
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);

  let currentNode = walker.nextNode();
  while (currentNode) {
    if (currentNode === node) {
      return absoluteOffset + offset;
    }
    absoluteOffset += currentNode.textContent?.length || 0;
    currentNode = walker.nextNode();
  }

  return absoluteOffset;
}
