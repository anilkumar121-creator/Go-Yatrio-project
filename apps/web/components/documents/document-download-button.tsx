"use client";

import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/common/button";
import { useState } from "react";

interface DocumentDownloadButtonProps {
  url: string;
  filename: string;
  token?: string;
  label: string;
  variant?: "primary" | "outline" | "secondary" | "ghost" | "link";
  size?: "md" | "sm" | "lg" | "icon";
}

export function DocumentDownloadButton({
  url,
  filename,
  token,
  label,
  variant = "outline",
  size = "sm",
}: DocumentDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(url, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!res.ok) {
        let msg = "Failed to download document.";
        try {
          const data = await res.json();
          if (data.message) msg = data.message;
        } catch {
          // ignore parsing error
        }
        throw new Error(msg);
      }

      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      const e = err as Error;
      setError(e.message || "An error occurred during download.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1 items-end">
      <Button
        variant={variant}
        size={size}
        onClick={handleDownload}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        {label}
      </Button>
      {error && <p className="text-xs text-error mt-1 max-w-[200px] text-right">{error}</p>}
    </div>
  );
}
