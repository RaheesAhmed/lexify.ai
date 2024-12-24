"use client";

import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Upload, AlertCircle } from "lucide-react";

export default function UploadPage() {
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        // TODO: Get actual user ID from auth context
        formData.append("userId", "user123");

        const response = await fetch("/api/documents", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to upload file");
        }

        // Update progress for each file
        setProgress((prev) => prev + 100 / files.length);
      }

      // Reset state after successful upload
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    } catch (error) {
      console.error("Upload error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload files. Please try again."
      );
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Upload Documents
        </h1>
        <p className="text-sm text-muted-foreground">
          Upload your legal documents for analysis. We support PDF and Word
          documents.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="rounded-xl border bg-card">
        <div className="border-b p-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            <h2 className="font-semibold">Upload Files</h2>
          </div>
        </div>
        <div className="p-4">
          <FileUpload
            onFilesSelected={handleFilesSelected}
            maxFiles={5}
            maxSize={10}
            accept={{
              "application/pdf": [".pdf"],
              "application/msword": [".doc"],
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                [".docx"],
            }}
            uploading={uploading}
            progress={progress}
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="font-medium">Upload Guidelines</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>• Maximum 5 files per upload</li>
          <li>• Maximum file size: 10MB</li>
          <li>• Supported formats: PDF, DOC, DOCX</li>
          <li>• Files are automatically scanned for viruses</li>
          <li>• All uploads are encrypted and secure</li>
        </ul>
      </div>
    </div>
  );
}
