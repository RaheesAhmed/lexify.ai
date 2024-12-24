"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  className?: string;
}

export function FileUpload({
  onUpload,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  },
  className,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);

      // Validate file size
      const file = acceptedFiles[0];
      if (file.size > maxSize) {
        setError(`File size must be less than ${formatFileSize(maxSize)}`);
        return;
      }

      setFiles([file]);

      try {
        setUploading(true);
        await onUpload(file);
        setFiles([]);
      } catch (error) {
        console.error("Upload error:", error);
        setError("Failed to upload file. Please try again.");
      } finally {
        setUploading(false);
      }
    },
    [maxSize, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "relative rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors",
          isDragActive && "border-primary/50 bg-primary/5",
          error && "border-destructive/50 bg-destructive/5"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Upload
            className={cn(
              "h-8 w-8",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )}
          />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive ? "Drop the file here" : "Drag & drop file here"}
            </p>
            <p className="text-xs text-muted-foreground">
              or click to select file
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            PDF or Word documents up to {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-lg border bg-card p-3"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="rounded-full p-1 hover:bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Upload progress */}
      {uploading && (
        <div className="flex items-center gap-2">
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-progress rounded-full bg-primary" />
          </div>
          <p className="text-xs text-muted-foreground">Uploading...</p>
        </div>
      )}
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// Add this to your globals.css
// @keyframes progress {
//   0% { transform: translateX(-100%); }
//   50% { transform: translateX(100%); }
//   100% { transform: translateX(-100%); }
// }
