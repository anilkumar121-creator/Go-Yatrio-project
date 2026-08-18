"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { SearchBar } from "@/components/admin/search-bar";
import { FilterBar } from "@/components/admin/filter-bar";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { LoadingState } from "@/components/admin/loading-state";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import { Label } from "@/components/common/label";
import { Switch } from "@/components/common/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/select";
import { MediaLinkPanel } from "@/components/media/media-link-panel";

type Destination = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  state: string | null;
  country: string;
  featuredImage: string | null;
  galleryImages: string[];
  featured: boolean;
  status: "DRAFT" | "PUBLISHED";
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
};

type DestinationForm = {
  name: string;
  state: string;
  country: string;
  shortDescription: string;
  description: string;
  featuredImage: string;
  galleryImages: string;
  featured: boolean;
  status: "DRAFT" | "PUBLISHED";
  metaTitle: string;
  metaDescription: string;
};

const emptyForm: DestinationForm = {
  name: "",
  state: "",
  country: "India",
  shortDescription: "",
  description: "",
  featuredImage: "",
  galleryImages: "",
  featured: false,
  status: "DRAFT",
  metaTitle: "",
  metaDescription: "",
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
    throw new Error(data.message || "Request failed.");
  }

  return data.data;
}

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [formOpen, setFormOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);
  const [form, setForm] = useState<DestinationForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Destination | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDestinations = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams({
        take: String(pageSize),
        skip: String((page - 1) * pageSize),
      });

      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (countryFilter !== "all") params.set("country", countryFilter);

      const data = await apiFetch(`/api/admin/destinations?${params.toString()}`);
      setDestinations(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load destinations.");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, countryFilter, page]);

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  const openCreateForm = () => {
    setEditingDestination(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (destination: Destination) => {
    setEditingDestination(destination);
    setForm({
      name: destination.name,
      state: destination.state ?? "",
      country: destination.country,
      shortDescription: destination.shortDescription,
      description: destination.description,
      featuredImage: destination.featuredImage ?? "",
      galleryImages: (destination.galleryImages ?? []).join("\n"),
      featured: destination.featured,
      status: destination.status,
      metaTitle: destination.metaTitle ?? "",
      metaDescription: destination.metaDescription ?? "",
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        ...form,
        galleryImages: form.galleryImages
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
      };

      if (editingDestination) {
        await apiFetch(`/api/admin/destinations/${editingDestination.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/admin/destinations", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setFormOpen(false);
      loadDestinations();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save destination.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await apiFetch(`/api/admin/destinations/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      loadDestinations();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete destination.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (destination: Destination) => {
    try {
      await apiFetch(`/api/admin/destinations/${destination.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: destination.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
        }),
      });
      loadDestinations();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const toggleFeatured = async (destination: Destination) => {
    try {
      await apiFetch(`/api/admin/destinations/${destination.id}/featured`, {
        method: "PATCH",
        body: JSON.stringify({ featured: !destination.featured }),
      });
      loadDestinations();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update featured state.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Destinations Management"
          description="Create, edit, publish, and manage featured travel destinations."
          action={
            <Button size="sm" className="gap-1.5" onClick={openCreateForm}>
              <Plus className="size-4" />
              Add Destination
            </Button>
          }
        />

        {errorMessage ? (
          <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-foreground">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search destinations..." />
          <FilterBar
            filters={[
              {
                id: "status",
                label: "Status",
                value: statusFilter,
                onChange: (value) => {
                  setStatusFilter(value);
                  setPage(1);
                },
                options: [
                  { label: "All Status", value: "all" },
                  { label: "Published", value: "PUBLISHED" },
                  { label: "Draft", value: "DRAFT" },
                ],
              },
              {
                id: "country",
                label: "Country",
                value: countryFilter,
                onChange: (value) => {
                  setCountryFilter(value);
                  setPage(1);
                },
                options: [
                  { label: "All Countries", value: "all" },
                  { label: "India", value: "India" },
                ],
              },
            ]}
            onReset={() => {
              setSearch("");
              setStatusFilter("all");
              setCountryFilter("all");
              setPage(1);
            }}
          />
        </div>

        {isLoading ? (
          <LoadingState rows={5} />
        ) : destinations.length === 0 ? (
          <EmptyState
            title="No destinations found"
            description="Create your first destination to start publishing travel content."
            actionLabel="Add Destination"
            onAction={openCreateForm}
          />
        ) : (
          <>
            <DataTable
              data={destinations}
              keyExtractor={(row) => row.id}
              columns={[
                { header: "Name", cell: (row) => <span className="font-semibold text-foreground">{row.name}</span> },
                { header: "Country", accessorKey: "country" },
                {
                  header: "Status",
                  cell: (row) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => toggleStatus(row)}
                      title="Toggle status"
                    >
                      <Badge variant={row.status === "PUBLISHED" ? "success" : "muted"}>
                        {row.status}
                      </Badge>
                    </Button>
                  ),
                },
                {
                  header: "Featured",
                  cell: (row) => (
                    <Switch checked={row.featured} onCheckedChange={() => toggleFeatured(row)} aria-label="Toggle featured" />
                  ),
                },
                { header: "Created Date", cell: (row) => <span className="text-muted-foreground">{new Date(row.createdAt).toLocaleDateString()}</span> },
                {
                  header: "Actions",
                  cell: (row) => (
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                        <Link href={`/destinations/${row.slug}`} target="_blank">
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" onClick={() => openEditForm(row)}>
                        <Edit className="size-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-error hover:bg-error/10" onClick={() => setDeleteTarget(row)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />

            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages} ({total} destinations)
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Destination Create/Edit Form Modal */}
      <DialogPrimitive.Root open={formOpen} onOpenChange={setFormOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <DialogPrimitive.Title className="text-lg font-semibold">
                {editingDestination ? "Edit Destination" : "Add Destination"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close asChild>
                <Button size="icon" variant="ghost" aria-label="Close dialog">
                  <X className="size-5" aria-hidden="true" />
                </Button>
              </DialogPrimitive.Close>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError ? (
                <div className="rounded-lg border border-error/30 bg-error/10 p-3 text-sm">{formError}</div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="destination-name">Name *</Label>
                  <Input id="destination-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Goa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination-state">State / Region</Label>
                  <Input id="destination-state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="e.g. Goa" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination-country">Country</Label>
                  <Input id="destination-country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="India" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination-status">Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as "DRAFT" | "PUBLISHED" })}>
                    <SelectTrigger id="destination-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="destination-short">Short Description *</Label>
                  <Textarea id="destination-short" required maxLength={300} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="One or two sentence summary shown on cards." />
                </div>
                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="destination-description">Description *</Label>
                  <Textarea id="destination-description" required maxLength={5000} rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Full destination overview shown on the detail page." />
                </div>
                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="destination-image">Featured Image URL</Label>
                  <Input id="destination-image" type="url" value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="destination-gallery">Gallery Images (one URL per line)</Label>
                  <Textarea id="destination-gallery" rows={3} value={form.galleryImages} onChange={(e) => setForm({ ...form, galleryImages: e.target.value })} placeholder={"https://...\nhttps://..."} />
                </div>
                <div className="space-y-2 tablet:col-span-2">
                  <MediaLinkPanel module="DESTINATION" moduleId={editingDestination?.id} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination-meta-title">Meta Title</Label>
                  <Input id="destination-meta-title" maxLength={120} value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="SEO title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="destination-meta-description">Meta Description</Label>
                  <Input id="destination-meta-description" maxLength={180} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="SEO description" />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-3">
                <Switch checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: checked })} aria-label="Featured destination" />
                <div>
                  <p className="text-sm font-medium text-foreground">Featured Destination</p>
                  <p className="text-xs text-muted-foreground">Featured destinations appear prominently on the public website.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "Saving..." : editingDestination ? "Save Changes" : "Create Destination"}
                </Button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Destination"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        isDestructive
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
