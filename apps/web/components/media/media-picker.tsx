"use client";

import { useCallback, useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, X, FileText, FileVideo } from "lucide-react";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { Input } from "@/components/common/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/select";

export type PickedMedia = {
  mediaId: string;
  role: string;
  sortOrder: number;
};

type MediaOption = {
  id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: "IMAGE" | "VIDEO" | "RAW";
  fileName: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
};

type MediaPickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (selection: PickedMedia[]) => void;
  initialRole?: "FEATURED" | "GALLERY" | "VIDEO" | "DOCUMENT";
  title?: string;
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

export function MediaPicker({
  open,
  onOpenChange,
  onPick,
  initialRole = "GALLERY",
  title = "Select Media",
}: MediaPickerProps) {
  const [items, setItems] = useState<MediaOption[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [role, setRole] = useState(initialRole);
  const [loading, setLoading] = useState(false);

  const loadMedia = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const data = await apiFetch(`/api/admin/media?${query}`);
      setItems(data?.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const params = new URLSearchParams({ take: "60" });
    if (search) params.set("search", search);
    if (typeFilter !== "all") params.set("type", typeFilter);
    loadMedia(params.toString());
  }, [open, search, typeFilter, loadMedia]);

  const handleConfirm = () => {
    if (!selectedId) return;
    const selected = items.find((m) => m.id === selectedId);
    if (!selected) return;

    onPick([
      {
        mediaId: selected.id,
        role,
        sortOrder: 0,
      },
    ]);
    onOpenChange(false);
    setSelectedId(null);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed inset-4 z-50 m-auto flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border p-4">
            <DialogPrimitive.Title className="text-lg font-semibold text-foreground">{title}</DialogPrimitive.Title>
            <DialogPrimitive.Close className="rounded-sm opacity-70 hover:opacity-100">
              <X className="size-5 text-muted-foreground" />
            </DialogPrimitive.Close>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col gap-2 border-b border-border p-4 tablet:flex-row tablet:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search media..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="IMAGE">Images</SelectItem>
                <SelectItem value="VIDEO">Videos</SelectItem>
                <SelectItem value="RAW">Documents</SelectItem>
              </SelectContent>
            </Select>
            <Select value={role} onValueChange={(value) => setRole(value as "FEATURED" | "GALLERY" | "VIDEO" | "DOCUMENT")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FEATURED">Featured</SelectItem>
                <SelectItem value="GALLERY">Gallery</SelectItem>
                <SelectItem value="VIDEO">Video</SelectItem>
                <SelectItem value="DOCUMENT">Document</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <p className="text-center text-sm text-muted-foreground">Loading media...</p>
            ) : items.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No media found.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3 desktop:grid-cols-4">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={`group relative overflow-hidden rounded-lg border bg-card text-left transition-all ${
                      selectedId === item.id ? "border-primary ring-2 ring-primary/40" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="relative aspect-square w-full">
                      {item.resourceType === "IMAGE" && item.secureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.secureUrl} alt={item.altText ?? item.fileName ?? ""} className="h-full w-full object-cover" />
                      ) : item.resourceType === "VIDEO" ? (
                        <div className="flex h-full w-full items-center justify-center bg-muted/60">
                          <FileVideo className="size-7 text-primary" />
                        </div>
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted/60">
                          <FileText className="size-7 text-primary" />
                        </div>
                      )}
                      <Badge variant="secondary" className="absolute left-1.5 top-1.5 text-[10px]">
                        {item.resourceType}
                      </Badge>
                    </div>
                    <div className="p-2">
                      <p className="truncate text-xs font-medium text-foreground">{item.fileName ?? item.publicId}</p>
                      <p className="truncate text-[10px] text-muted-foreground font-mono">{item.publicId}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-border p-4">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" size="sm" disabled={!selectedId} onClick={handleConfirm}>
              Select Media
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
