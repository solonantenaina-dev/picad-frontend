"use client";

import type React from "react";

import { useState, useRef } from "react";
import { FileText, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileChange?: (file: File | null) => void;
  acceptedTypes?: string[];
}

export function FileUpload({
  onFileChange,
  acceptedTypes = [".pdf"],
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(extension)) {
      setError(`Seuls les fichiers ${acceptedTypes.join(", ")} sont acceptés`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
      onFileChange?.(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    onFileChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">
        Pièces jointes
      </label>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
            isDragging
              ? "border-green-600 bg-green-50"
              : "border-border hover:border-green-600 hover:bg-muted/50"
          )}
        >
          <div className="flex h-12 w-12 items-center justify-center">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <Upload className="h-4 w-4 text-muted-foreground -ml-2 -mt-4" />
          </div>
          <span className="text-sm text-muted-foreground">
            Importer une pièce jointe
          </span>
          <span className="text-xs text-muted-foreground">
            (PDF uniquement)
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-sm font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(1)} Ko
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="rounded-full p-1 hover:bg-muted transition-colors"
            aria-label="Supprimer le fichier"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
