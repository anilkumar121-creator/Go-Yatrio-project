"use client";

import { useCallback, useEffect, useState } from "react";
import { Globe, Plus, Edit, Trash2, X, Check, Search, ExternalLink } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { LoadingState } from "@/components/admin/loading-state";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import { Label } from "@/components/common/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select";

export type SeoItem = {
  id: string;
  pageType: string;
  entityType: string | null;
  entityId: string | null;
  title: string;
  description: string;
  canonicalUrl: string | null;
  ogImage: string | null;
  robots: string | null;
  createdAt: string;
  updatedAt: string;
};

type SeoForm = {
  pageType: string;
  entityType: string;
  entityId: string;
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage: string;
  robots: string;
};

const defaultPages = [
  { value: "homepage", label: "Homepage (/)" },
  { value: "packages", label: "Tour Packages (/packages)" },
  { value: "destinations", label: "Destinations (/destinations)" },
  { value: "hotels", label: "Hotels (/hotels)" },
  { value: "cabs", label: "Cab Services (/cabs)" },
  { value: "blogs", label: "Travel Blog (/blogs)" },
  { value: "itineraries", label: "Itinerary Builder (/itineraries)" },
  { value: "contact", label: "Contact Us (/contact)" },
];

const emptyForm: SeoForm = {
  pageType: "homepage",
  entityType: "",
  entityId: "",
  title: "",
  description: "",
  canonicalUrl: "",
  ogImage: "",
  robots: "index, follow",
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
      ...options.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || "Request failed");
  }
  return data;
}

export default function AdminSeoPage() {
  const [items, setItems] = useState<SeoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<SeoForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SeoItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch("/api/admin/seo-metadata");
      setItems(res.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load SEO metadata");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleOpenCreate = (presetPageType?: string) => {
    setForm({
      ...emptyForm,
      pageType: presetPageType || "homepage",
      title: "",
      description: "",
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (item: SeoItem) => {
    setForm({
      pageType: item.pageType,
      entityType: item.entityType ?? "",
      entityId: item.entityId ?? "",
      title: item.title,
      description: item.description,
      canonicalUrl: item.canonicalUrl ?? "",
      ogImage: item.ogImage ?? "",
      robots: item.robots ?? "index, follow",
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.pageType.trim() || !form.title.trim() || !form.description.trim()) {
      setFormError("Page Type, Title, and Description are required.");
      return;
    }

    setSaving(true);
    try {
      await apiFetch("/api/admin/seo-metadata", {
        method: "POST",
        body: JSON.stringify({
          pageType: form.pageType.trim(),
          entityType: form.entityType.trim() || null,
          entityId: form.entityId.trim() || null,
          title: form.title.trim(),
          description: form.description.trim(),
          canonicalUrl: form.canonicalUrl.trim() || null,
          ogImage: form.ogImage.trim() || null,
          robots: form.robots.trim() || "index, follow",
        }),
      });

      setFormOpen(false);
      await loadItems();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save SEO metadata.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/api/admin/seo-metadata/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setDeleteTarget(null);
      await loadItems();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete SEO metadata.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredItems = items.filter(
    (item) =>
      item.pageType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="SEO Settings & Page Metadata"
          description="Manage search engine titles, descriptions, canonical URLs, OG social cards, and indexing robots instructions across all key platform pages."
          action={
            <Button onClick={() => handleOpenCreate()} size="sm" className="gap-2">
              <Plus className="size-4" />
              Add SEO Entry
            </Button>
          }
        />

        {/* Quick presets strip */}
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Quick Page Presets
          </p>
          <div className="flex flex-wrap gap-2">
            {defaultPages.map((page) => {
              const existing = items.find((i) => i.pageType === page.value && !i.entityType);
              return (
                <button
                  key={page.value}
                  type="button"
                  onClick={() =>
                    existing ? handleOpenEdit(existing) : handleOpenCreate(page.value)
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                    existing
                      ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                      : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {existing ? <Check className="size-3" /> : <Plus className="size-3" />}
                  {page.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by page or title..."
            className="pl-9"
          />
        </div>

        {/* Content list */}
        {loading ? (
          <LoadingState rows={4} />
        ) : error ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        ) : filteredItems.length === 0 ? (
          <EmptyState
            title="No SEO Metadata configured"
            description="Start customizing search engine titles, descriptions, and OpenGraph tags to maximize organic visibility."
            actionLabel="Add First SEO Entry"
            onAction={() => handleOpenCreate()}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card p-5 shadow-xs transition-shadow hover:shadow-md flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-mono font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                      <Globe className="size-3" />
                      {item.pageType}
                    </span>
                    <Badge variant={item.robots?.includes("noindex") ? "error" : "outline"}>
                      {item.robots || "index, follow"}
                    </Badge>
                  </div>

                  {/* Google Search Result Preview */}
                  <div className="rounded-lg border border-border/80 bg-background/50 p-3 space-y-1">
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      goyatrio.com › {item.pageType}
                      <ExternalLink className="size-2.5 opacity-60" />
                    </p>
                    <h3 className="text-sm font-semibold text-primary line-clamp-1 hover:underline cursor-pointer">
                      {item.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                  </div>

                  {item.ogImage && (
                    <div className="text-xs text-muted-foreground truncate">
                      <span className="font-semibold text-foreground">OG Image:</span>{" "}
                      {item.ogImage}
                    </div>
                  )}
                  {item.canonicalUrl && (
                    <div className="text-xs text-muted-foreground truncate">
                      <span className="font-semibold text-foreground">Canonical:</span>{" "}
                      {item.canonicalUrl}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Updated {new Date(item.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(item)}
                      className="h-8 gap-1 text-xs"
                    >
                      <Edit className="size-3.5" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteTarget(item)}
                      className="h-8 gap-1 text-xs"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upsert Dialog */}
        <DialogPrimitive.Root open={formOpen} onOpenChange={setFormOpen}>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs animate-in fade-in" />
            <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto translate-x-[-50%] translate-y-[-50%] rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in-0 zoom-in-95">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <DialogPrimitive.Title className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Globe className="size-5 text-primary" />
                  Configure SEO Metadata
                </DialogPrimitive.Title>
                <DialogPrimitive.Close asChild>
                  <Button variant="ghost" size="sm" className="size-8 p-0">
                    <X className="size-4" />
                  </Button>
                </DialogPrimitive.Close>
              </div>

              {formError && (
                <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSave} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pageType">Page Identifier / Target *</Label>
                    <Select
                      value={form.pageType}
                      onValueChange={(val) => setForm({ ...form, pageType: val })}
                    >
                      <SelectTrigger id="pageType">
                        <SelectValue placeholder="Select standard page or custom" />
                      </SelectTrigger>
                      <SelectContent>
                        {defaultPages.map((page) => (
                          <SelectItem key={page.value} value={page.value}>
                            {page.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="robots">Robots Indexing Directive</Label>
                    <Select
                      value={form.robots}
                      onValueChange={(val) => setForm({ ...form, robots: val })}
                    >
                      <SelectTrigger id="robots">
                        <SelectValue placeholder="Select robots rule" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="index, follow">Index, Follow (Recommended)</SelectItem>
                        <SelectItem value="noindex, follow">Noindex, Follow</SelectItem>
                        <SelectItem value="index, nofollow">Index, Nofollow</SelectItem>
                        <SelectItem value="noindex, nofollow">
                          Noindex, Nofollow (Blocked)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seo-title">Meta Title *</Label>
                    <span
                      className={`text-xs ${
                        form.title.length >= 50 && form.title.length <= 60
                          ? "text-emerald-500 font-semibold"
                          : form.title.length > 60
                            ? "text-amber-500 font-semibold"
                            : "text-muted-foreground"
                      }`}
                    >
                      {form.title.length} / 60 recommended (max 160)
                    </span>
                  </div>
                  <Input
                    id="seo-title"
                    required
                    maxLength={160}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Best Tour Packages in India | GoYatrio"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seo-description">Meta Description *</Label>
                    <span
                      className={`text-xs ${
                        form.description.length >= 140 && form.description.length <= 160
                          ? "text-emerald-500 font-semibold"
                          : form.description.length > 160
                            ? "text-amber-500 font-semibold"
                            : "text-muted-foreground"
                      }`}
                    >
                      {form.description.length} / 160 recommended (max 300)
                    </span>
                  </div>
                  <Textarea
                    id="seo-description"
                    required
                    maxLength={300}
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Provide a compelling 150-160 character summary that entices travelers to click..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="canonicalUrl">Canonical URL Override</Label>
                    <Input
                      id="canonicalUrl"
                      maxLength={1000}
                      value={form.canonicalUrl}
                      onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                      placeholder="https://goyatrio.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ogImage">OpenGraph Image URL</Label>
                    <Input
                      id="ogImage"
                      maxLength={1000}
                      value={form.ogImage}
                      onChange={(e) => setForm({ ...form, ogImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                </div>

                {/* Google snippet preview box */}
                <div className="rounded-lg border border-border/80 bg-muted/20 p-4 space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Live SERP Snippet Preview
                  </p>
                  <p className="text-[12px] text-muted-foreground">
                    https://goyatrio.com › {form.pageType || "page"}
                  </p>
                  <h4 className="text-base font-semibold text-primary hover:underline line-clamp-1 cursor-pointer">
                    {form.title || "Your Page Title Will Appear Here"}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {form.description ||
                      "Your meta description will appear here in search engine results snippets..."}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={saving}>
                    {saving ? "Saving..." : "Save SEO Metadata"}
                  </Button>
                </div>
              </form>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>

        <ConfirmationModal
          isOpen={!!deleteTarget}
          title="Delete SEO Entry"
          description={`Are you sure you want to delete the SEO configuration for "${deleteTarget?.pageType}"? Fallback metadata will be used instead.`}
          confirmLabel={deleting ? "Deleting..." : "Delete"}
          isDestructive
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      </div>
    </AdminLayout>
  );
}
