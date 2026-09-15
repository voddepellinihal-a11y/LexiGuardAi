"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadDocument, useProcessDocument } from "@/hooks/useQueries";
import { Upload, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DocumentUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocument();
  const processMutation = useProcessDocument();
  const router = useRouter();

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        const result = await uploadMutation.mutateAsync(file);
        await processMutation.mutateAsync(result.id);
        router.push(`/documents/${result.id}`);
      } catch (err) {
        console.error("Upload failed:", err);
        setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [uploadMutation, processMutation, router]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
        dragActive
          ? "border-accent bg-accent/5"
          : "border-border hover:border-accent/50"
      }`}
    >
      {uploading ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 text-accent animate-spin" />
          <p className="text-text-secondary">Uploading and processing document...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Upload className="h-10 w-10 text-text-muted" />
          <div>
            <p className="text-lg font-medium text-text-primary">
              Upload a Legal Document
            </p>
            <p className="text-sm text-text-secondary mt-1">
              Drag and drop or click to upload PDF, DOCX, TXT, or images
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.png,.jpg,.jpeg,.tiff,.bmp"
            onChange={onFileSelect}
          />
          <Button
            type="button"
            className="btn-primary cursor-pointer"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            <FileText className="h-4 w-4 mr-2" />
            Select File
          </Button>
          <p className="text-xs text-text-muted">Maximum file size: 50MB</p>
          {error && (
            <p className="text-xs text-risk-high max-w-md" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
