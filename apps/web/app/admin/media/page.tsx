"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Upload,
  Trash2,
  RefreshCw,
  Copy,
  Eye,
  LayoutGrid,
  List,
  FileVideo,
  FileText,
  File as FileIcon,
  X,
} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { SearchBar } from "@/components/admin/search-bar";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { LoadingState } from "@/components/admin/loading-state";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/select";

type MediaItem = {
  id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: "IMAGE" | "VIDEO" | "RAW";
  mimeType: string | null;
  format: string | null;
  folder: string | null;
  fileName: string | null;
  width: number | null;
  height: number | null;
  size: number | null;
  durationSeconds: number | null;
  altText: string | null;
  caption: string | null;
  tags: string[];
  createdBy: string | null;
  status: "ACTIVE" | "ARCHIVED";
  usageCount: number;
  createdAt: string;
  updatedAt: string;
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

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes === undefined) return "Ã¢â‚¬â€";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | null): string {
  if (!value) return "Ã¢â‚¬â€";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

function isVideo(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}

function isDocument(mimeType: string): boolean {
  return (
    mimeType.startsWith("application/") ||
    mimeType === "text/plain" ||
    mimeType === "text/csv"
  );
}
export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [folderFilter, setFolderFilter] = useState("all");

  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<MediaItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadFolder, setUploadFolder] = useState("goyatrio/general");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);
  const [isDragActive, setIsDragActive] = useState(false);

  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacing, setReplacing] = useState(false);

  const loadedFolders = Array.from(new Set(media.map((m) => m.folder).filter(Boolean) as string[]));

  const loadMedia = useCallback(async (query: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiFetch(`/api/admin/media?${query}`);
      setMedia(data?.data ?? []);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load media.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams({ take: "100" });
    if (search) params.set("search", search);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (folderFilter !== "all") params.set("folder", folderFilter);

    loadMedia(params.toString());
  }, [search, typeFilter, statusFilter, folderFilter, loadMedia]);

  const runUpload = async (file: File, folder: string, existingId?: string) => {
    const dataUri = await fileToDataUri(file);
    const payload = {
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      dataUri,
      folder: folder || "goyatrio/general",
    };

    if (existingId) {
      const updated = await apiFetch(`/api/admin/media/${existingId}/replace`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      return updated;
    }

    return apiFetch("/api/admin/media/upload", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  };

  const handleFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    setUploading(true);
    setUploadProgress(5);
    setUploadError(null);

    try {
      for (let i = 0; i < list.length; i++) {
        await runUpload(list[i], uploadFolder);
        setUploadProgress(Math.round(((i + 1) / list.length) * 90));
      }
      setUploadProgress(100);
      const params = new URLSearchParams({ take: "100" });
      if (search) params.set("search", search);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      loadMedia(params.toString());
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 400);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current += 1;
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      setIsDragActive(false);
    }
  };

  const handleCopyUrl = async (item: MediaItem) => {
    try {
      await navigator.clipboard.writeText(item.secureUrl ?? item.url);
    } catch {
      // Clipboard may be blocked; a toast is handled by the UI text swap below.
    }
  };

  const handleReplace = async () => {
    if (!replaceTarget || !replaceFile) return;
    setReplacing(true);

    try {
      await runUpload(replaceFile, replaceTarget.folder ?? "goyatrio/general", replaceTarget.id);
      setReplaceTarget(null);
      setReplaceFile(null);
      const params = new URLSearchParams({ take: "100" });
      if (search) params.set("search", search);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      loadMedia(params.toString());
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Replace failed.");
    } finally {
      setReplacing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await apiFetch(`/api/admin/media/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      if (selected?.id === deleteTarget.id) setSelected(null);
      if (preview?.id === deleteTarget.id) setPreview(null);
      const params = new URLSearchParams({ take: "100" });
      if (search) params.set("search", search);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      loadMedia(params.toString());
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete media.");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Media Library"
          description="Upload, organize, replace, and reuse Cloudinary images, videos, and documents."
          action={
            <Button size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-4" />
              Upload Media
            </Button>
          }
        />

        {errorMessage ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        {/* Upload Panel (Drag & Drop) */}
        <div
          onDragEnter={handleDragEnter}
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragActive ? "border-primary bg-primary/5" : "border-border bg-muted/20"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <Upload className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-2 text-sm font-medium text-foreground">
            Drag & drop files here, or{" "}
            <button type="button" className="text-primary font-semibold underline" onClick={() => fileInputRef.current?.click()}>
              browse
            </button>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Images (Ã¢â€°Â¤10 MB), videos (Ã¢â€°Â¤100 MB), documents (PDF / Word / Excel / PPT Ã¢â€°Â¤10 MB)
          </p>

          {uploading ? (
            <div className="mx-auto mt-4 max-w-sm space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Uploading... {uploadProgress}%</p>
            </div>
          ) : null}

          <div className="mx-auto mt-3 flex max-w-sm items-center gap-2">
            <label htmlFor="media-upload-folder" className="shrink-0 text-xs font-medium text-muted-foreground">
              Folder
            </label>
            <input
              id="media-upload-folder"
              type="text"
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              placeholder="goyatrio/general"
              className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs text-foreground"
            />
          </div>

          {uploadError ? <p className="mt-2 text-xs text-destructive">{uploadError}</p> : null}
        </div>

        {/* Search, Filters, View Toggle */}
        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by filename, publicId, alt text, tags..." />
          <div className="flex items-center gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="IMAGE">Images</SelectItem>
                <SelectItem value="VIDEO">Videos</SelectItem>
                <SelectItem value="RAW">Documents</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={folderFilter} onValueChange={setFolderFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {loadedFolders.map((folder) => (
                  <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center rounded-md border border-border">
              <Button
                type="button"
                size="sm"
                variant={view === "grid" ? "secondary" : "ghost"}
                className="rounded-l-md rounded-r-none h-9 px-3"
                onClick={() => setView("grid")}
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant={view === "table" ? "secondary" : "ghost"}
                className="rounded-r-md rounded-l-none h-9 px-3 border-l border-border"
                onClick={() => setView("table")}
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>
        </div>
        {isLoading ? (
          <LoadingState rows={6} />
        ) : media.length === 0 ? (
          <EmptyState
            icon={FileIcon}
            title="No media found"
            description="Upload images, videos, or documents to build your reusable media library."
            actionLabel="Upload Media"
            onAction={() => fileInputRef.current?.click()}
          />
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 gap-4 tablet:grid-cols-3 desktop:grid-cols-4">
            {media.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg border border-border bg-card shadow-sm"
              >
                <div className="relative aspect-square w-full cursor-pointer" onClick={() => setSelected(item)}>
                  {mediaThumb(item)}
                  {item.resourceType === "VIDEO" ? (
                    <span className="absolute left-2 top-2"><FileVideo className="size-4 text-white" /></span>
                  ) : null}
                  {item.resourceType === "RAW" ? (
                    <span className="absolute left-2 top-2"><FileText className="size-4 text-white" /></span>
                  ) : null}
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-foreground">{item.fileName ?? item.publicId}</p>
                  <p className="truncate text-[11px] text-muted-foreground font-mono">{item.publicId}</p>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{item.resourceType === "IMAGE" && item.width ? `${item.width}Ãƒâ€”${item.height}` : item.format}</span>
                    <span>{formatBytes(item.size)}</span>
                  </div>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-end gap-1 bg-black/60 p-1.5 backdrop-blur-sm transition-transform group-hover:translate-y-0">
                  <ThumbAction onClick={() => setPreview(item)} title="Preview"><Eye className="size-3.5" /></ThumbAction>
                  <ThumbAction onClick={() => handleCopyUrl(item)} title="Copy URL"><Copy className="size-3.5" /></ThumbAction>
                  <ThumbAction onClick={() => setReplaceTarget(item)} title="Replace"><RefreshCw className="size-3.5" /></ThumbAction>
                  <ThumbAction onClick={() => setDeleteTarget(item)} title="Delete"><Trash2 className="size-3.5" /></ThumbAction>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DataTable
            data={media}
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "Preview",
                cell: (row) => (
                  <div className="h-10 w-10 overflow-hidden rounded-md border border-border bg-muted">
                    {row.resourceType === "IMAGE" && row.secureUrl ? (
                      <img src={row.secureUrl} alt={row.altText ?? row.fileName ?? ""} className="h-full w-full object-cover" />
                    ) : row.resourceType === "VIDEO" ? (
                      <FileVideo className="mx-auto mt-2 size-4 text-primary" />
                    ) : (
                      <FileText className="mx-auto mt-2 size-4 text-primary" />
                    )}
                  </div>
                ),
              },
              { header: "Name", cell: (row) => <span className="font-medium text-foreground">{row.fileName ?? row.publicId}</span> },
              { header: "Type", cell: (row) => <Badge variant="secondary" className="text-[11px]">{row.resourceType}</Badge> },
              { header: "Folder", cell: (row) => <span className="font-mono text-xs text-muted-foreground">{row.folder ?? "Ã¢â‚¬â€"}</span> },
              {
                header: "Dimensions",
                cell: (row) => (
                  <span className="text-xs text-muted-foreground">
                    {row.width && row.height ? `${row.width} Ã— ${row.height}` : "â€”"}
                  </span>
                ),
              },
              { header: "Size", cell: (row) => <span className="text-xs text-muted-foreground">{formatBytes(row.size)}</span> },
              { header: "Usage", cell: (row) => <Badge variant="outline" className="text-[11px]">{row.usageCount}</Badge> },
              {
                header: "Status",
                cell: (row) => (
                  <Badge variant={row.status === "ACTIVE" ? "success" : "outline"} className="text-[11px]">
                    {row.status}
                  </Badge>
                ),
              },
              { header: "Updated", cell: (row) => <span className="text-xs text-muted-foreground">{formatDate(row.updatedAt)}</span> },
              {
                header: "Actions",
                cell: (row) => (
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPreview(row)} title="Preview">
                      <Eye className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleCopyUrl(row)} title="Copy URL">
                      <Copy className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setReplaceTarget(row)} title="Replace">
                      <RefreshCw className="size-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(row)} title="Delete">
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
      {/* Details Drawer */}
      <DialogPrimitive.Root open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto border-l border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">Media Details</DialogPrimitive.Title>
              <DialogPrimitive.Close className="rounded-sm opacity-70 hover:opacity-100">
                <X className="size-5 text-muted-foreground" />
              </DialogPrimitive.Close>
            </div>

            {selected ? (
              <div className="mt-5 space-y-4">
                <div className="overflow-hidden rounded-lg border border-border">
                  {selected.resourceType === "IMAGE" && selected.secureUrl ? (
                    <img src={selected.secureUrl} alt={selected.altText ?? selected.fileName ?? ""} className="w-full object-cover" />
                  ) : selected.resourceType === "VIDEO" && selected.secureUrl ? (
                    <video src={selected.secureUrl} controls className="w-full" />
                  ) : (
                    <div className="flex items-center justify-center bg-muted p-8">
                      <FileText className="size-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <DetailRow label="File Name" value={selected.fileName ?? "Ã¢â‚¬â€"} />
                <DetailRow label="Public ID" value={selected.publicId} mono />
                <DetailRow label="Type" value={selected.resourceType} />
                <DetailRow label="MIME Type" value={selected.mimeType ?? "Ã¢â‚¬â€"} />
                <DetailRow label="Format" value={selected.format ?? "Ã¢â‚¬â€"} />
                <DetailRow label="Folder" value={selected.folder ?? "Ã¢â‚¬â€"} mono />
                <DetailRow label="Dimensions" value={selected.width ? `${selected.width} Ãƒâ€” ${selected.height}` : "Ã¢â‚¬â€"} />
                <DetailRow label="Size" value={formatBytes(selected.size)} />
                <DetailRow label="Duration" value={selected.durationSeconds ? `${selected.durationSeconds}s` : "Ã¢â‚¬â€"} />
                <DetailRow label="Alt Text" value={selected.altText ?? "Ã¢â‚¬â€"} />
                <DetailRow label="Usage Count" value={String(selected.usageCount)} />
                <DetailRow label="Created" value={formatDate(selected.createdAt)} />
                <DetailRow label="Updated" value={formatDate(selected.updatedAt)} />

                {selected.tags.length > 0 ? (
                  <div>
                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selected.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[11px]">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="flex gap-2 border-t border-border pt-4">
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => setPreview(selected)}>
                    <Eye className="size-3.5" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => handleCopyUrl(selected)}>
                    <Copy className="size-3.5" />
                    Copy URL
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => { setReplaceTarget(selected); setSelected(null); }}>
                    <RefreshCw className="size-3.5" />
                    Replace
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-destructive hover:bg-destructive/10"
                    onClick={() => { setDeleteTarget(selected); setSelected(null); }}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      {/* Preview Lightbox */}
      <DialogPrimitive.Root open={!!preview} onOpenChange={(open) => { if (!open) setPreview(null); }}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed inset-4 z-[60] m-auto flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-3">
              <p className="truncate text-sm font-semibold text-foreground">{preview?.fileName ?? preview?.publicId}</p>
              <DialogPrimitive.Close className="rounded-sm opacity-70 hover:opacity-100">
                <X className="size-5 text-muted-foreground" />
              </DialogPrimitive.Close>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto bg-black/40 p-4">
              {preview?.resourceType === "IMAGE" && preview.secureUrl ? (
                <img src={preview.secureUrl} alt={preview.altText ?? preview.fileName ?? ""} className="max-h-[75vh] w-auto object-contain" />
              ) : preview?.resourceType === "VIDEO" && preview.secureUrl ? (
                <video src={preview.secureUrl} controls className="max-h-[75vh] w-full" />
              ) : preview?.secureUrl ? (
                <a href={preview.secureUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-white underline">
                  <FileText className="size-5" />
                  Open document
                </a>
              ) : null}
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Replace Dialog */}
      <DialogPrimitive.Root open={!!replaceTarget} onOpenChange={(open) => { if (!open) { setReplaceTarget(null); setReplaceFile(null); } }}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed inset-x-4 top-24 z-50 m-auto w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">Replace Media</DialogPrimitive.Title>
              <DialogPrimitive.Close className="rounded-sm opacity-70 hover:opacity-100">
                <X className="size-5 text-muted-foreground" />
              </DialogPrimitive.Close>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Replace <strong className="text-foreground">{replaceTarget?.fileName ?? replaceTarget?.publicId}</strong> with a new file (same public ID is preserved).
            </p>
            <input
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              className="mt-4 block w-full text-xs"
              onChange={(e) => setReplaceFile(e.target.files?.[0] ?? null)}
            />
            <div className="mx-auto mt-3 flex max-w-sm items-center gap-2">
            <label htmlFor="media-upload-folder" className="shrink-0 text-xs font-medium text-muted-foreground">
              Folder
            </label>
            <input
              id="media-upload-folder"
              type="text"
              value={uploadFolder}
              onChange={(e) => setUploadFolder(e.target.value)}
              placeholder="goyatrio/general"
              className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs text-foreground"
            />
          </div>

          {uploadError ? <p className="mt-2 text-xs text-destructive">{uploadError}</p> : null}
            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="outline" size="sm" onClick={() => { setReplaceTarget(null); setReplaceFile(null); }}>
                Cancel
              </Button>
              <Button type="button" size="sm" disabled={!replaceFile || replacing} onClick={handleReplace}>
                {replacing ? "Replacing..." : "Replace File"}
              </Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Media"
        description={`Are you sure you want to delete "${deleteTarget?.fileName ?? deleteTarget?.publicId}"? Cloudinary asset and metadata will be removed.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        isDestructive
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className={`text-right text-foreground ${mono ? "font-mono" : "font-medium"}`}>{value}</span>
    </div>
  );
}

function ThumbAction({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="flex h-8 w-8 items-center justify-center rounded-md text-white hover:bg-white/20"
    >
      {children}
    </button>
  );
}

function mediaThumb(item: MediaItem) {
  if (item.resourceType === "IMAGE" && item.secureUrl) {
    return (
      <img
        src={item.secureUrl}
        alt={item.altText ?? item.fileName ?? ""}
        className="h-full w-full object-cover"
      />
    );
  }
  if (item.resourceType === "VIDEO" && item.secureUrl) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-muted/60">
        <FileVideo className="size-8 text-primary" />
        <span className="mt-1 text-[10px] text-muted-foreground">{isVideo(item.mimeType ?? "") ? (item.mimeType ?? "").split("/")[1] : "video"}</span>
      </div>
    );
  }
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-muted/60">
      <FileText className="size-8 text-primary" />
      <span className="mt-1 text-[10px] text-muted-foreground">{item.format ?? (isDocument(item.mimeType ?? "") ? "document" : "raw")}</span>
    </div>
  );
}
