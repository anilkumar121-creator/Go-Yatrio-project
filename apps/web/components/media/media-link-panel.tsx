"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageIcon, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { MediaPicker, type PickedMedia } from "@/components/media/media-picker";

type LinkedMedia = {
  id: string;
  mediaId: string;
  role: string;
  sortOrder: number;
  media?: {
    id: string;
    publicId: string;
    secureUrl: string;
    altText: string | null;
    resourceType: string;
  } | null;
};

type MediaLinkPanelProps = {
  module: "DESTINATION" | "PACKAGE" | "HOTEL" | "CAB" | "BLOG" | "HOMEPAGE";
  moduleId?: string;
};

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("goyatrio_token") : null;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error || "Request failed.");
  }

  return data.data;
}

export function MediaLinkPanel({ module, moduleId }: MediaLinkPanelProps) {
  const [links, setLinks] = useState<LinkedMedia[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const loadLinks = useCallback(async () => {
    if (!moduleId) {
      setLinks([]);
      return;
    }

    try {
      const data = await apiFetch(`/api/admin/media/links/list?module=${module}&moduleId=${moduleId}`);
      setLinks(data ?? []);
    } catch {
      setLinks([]);
    }
  }, [module, moduleId]);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const handlePick = async (selection: PickedMedia[]) => {
    if (!moduleId || selection.length === 0) return;

    try {
      await apiFetch("/api/admin/media/links", {
        method: "POST",
        body: JSON.stringify({
          mediaId: selection[0].mediaId,
          module,
          moduleId,
          role: selection[0].role,
          sortOrder: selection[0].sortOrder,
        }),
      });
      setPickerOpen(false);
      await loadLinks();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to attach media.");
    }
  };

  const handleRemove = async (linkId: string) => {
    try {
      await apiFetch(`/api/admin/media/links/${linkId}`, { method: "DELETE" });
      await loadLinks();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to detach media.");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-foreground">Media Library</p>
        <Button type="button" size="sm" variant="outline" className="gap-1" disabled={!moduleId} onClick={() => setPickerOpen(true)}>
          <Plus className="size-3.5" />
          Select from Library
        </Button>
      </div>

      {!moduleId ? (
        <p className="text-xs text-muted-foreground">Save the record first to attach media.</p>
      ) : links.length === 0 ? (
        <p className="text-xs text-muted-foreground">No media attached yet.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <div key={link.id} className="flex items-center gap-2 rounded-md border border-border bg-muted/20 p-1.5 pr-2">
              {link.media?.secureUrl && link.media.resourceType === "IMAGE" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={link.media.secureUrl} alt={link.media.altText ?? ""} className="h-10 w-10 rounded object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                  <ImageIcon className="size-4 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="max-w-[10rem] truncate text-xs font-medium text-foreground">{link.media?.publicId ?? link.mediaId}</p>
                <Badge variant="outline" className="mt-0.5 text-[10px]">{link.role}</Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                onClick={() => handleRemove(link.id)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} onPick={handlePick} />
    </div>
  );
}
