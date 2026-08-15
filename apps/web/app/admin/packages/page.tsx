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
import { Price } from "@/components/common/price";
import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import { Label } from "@/components/common/label";
import { Switch } from "@/components/common/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/select";

type DestinationOption = {
  id: string;
  name: string;
  country: string;
};

type TourPackage = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  destinationId: string;
  destination?: { name: string };
  durationDays: number;
  durationNights: number;
  priceFrom: number;
  currency: string;
  packageType: "DOMESTIC" | "INTERNATIONAL" | "LUXURY" | "ADVENTURE" | "PILGRIMAGE";
  inclusions: string[];
  exclusions: string[];
  featuredImage: string | null;
  galleryImages: string[];
  featured: boolean;
  status: "DRAFT" | "PUBLISHED";
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
};

type PackageForm = {
  title: string;
  destinationId: string;
  packageType: "DOMESTIC" | "INTERNATIONAL" | "LUXURY" | "ADVENTURE" | "PILGRIMAGE";
  durationDays: number;
  durationNights: number;
  priceFrom: number;
  shortDescription: string;
  description: string;
  inclusions: string;
  exclusions: string;
  featuredImage: string;
  galleryImages: string;
  featured: boolean;
  status: "DRAFT" | "PUBLISHED";
  metaTitle: string;
  metaDescription: string;
};

const emptyForm: PackageForm = {
  title: "",
  destinationId: "",
  packageType: "DOMESTIC",
  durationDays: 5,
  durationNights: 4,
  priceFrom: 15000,
  shortDescription: "",
  description: "",
  inclusions: "",
  exclusions: "",
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

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [formOpen, setFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<TourPackage | null>(null);
  const [form, setForm] = useState<PackageForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<TourPackage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDestinations = useCallback(async () => {
    try {
      const data = await apiFetch("/api/admin/destinations?take=100");
      setDestinations(data.data ?? []);
    } catch {
      // Fallback
    }
  }, []);

  const loadPackages = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams({
        take: String(pageSize),
        skip: String((page - 1) * pageSize),
      });

      if (search) params.set("search", search);
      if (typeFilter !== "all") params.set("packageType", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const data = await apiFetch(`/api/admin/packages?${params.toString()}`);
      setPackages(data.data ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load packages.");
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, statusFilter, page]);

  useEffect(() => {
    loadDestinations();
    loadPackages();
  }, [loadDestinations, loadPackages]);

  const openCreateForm = () => {
    setEditingPackage(null);
    setForm({
      ...emptyForm,
      destinationId: destinations[0]?.id ?? "",
    });
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (pkg: TourPackage) => {
    setEditingPackage(pkg);
    setForm({
      title: pkg.title,
      destinationId: pkg.destinationId,
      packageType: pkg.packageType,
      durationDays: pkg.durationDays,
      durationNights: pkg.durationNights,
      priceFrom: Number(pkg.priceFrom),
      shortDescription: pkg.shortDescription,
      description: pkg.description,
      inclusions: (pkg.inclusions ?? []).join("\n"),
      exclusions: (pkg.exclusions ?? []).join("\n"),
      featuredImage: pkg.featuredImage ?? "",
      galleryImages: (pkg.galleryImages ?? []).join("\n"),
      featured: pkg.featured,
      status: pkg.status,
      metaTitle: pkg.metaTitle ?? "",
      metaDescription: pkg.metaDescription ?? "",
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
        inclusions: form.inclusions
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        exclusions: form.exclusions
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        galleryImages: form.galleryImages
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
      };

      if (editingPackage) {
        await apiFetch(`/api/admin/packages/${editingPackage.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/admin/packages", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setFormOpen(false);
      loadPackages();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save package.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await apiFetch(`/api/admin/packages/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      loadPackages();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete package.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (pkg: TourPackage) => {
    try {
      await apiFetch(`/api/admin/packages/${pkg.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: pkg.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
        }),
      });
      loadPackages();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const toggleFeatured = async (pkg: TourPackage) => {
    try {
      await apiFetch(`/api/admin/packages/${pkg.id}/featured`, {
        method: "PATCH",
        body: JSON.stringify({ featured: !pkg.featured }),
      });
      loadPackages();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to update featured state.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Tour Packages Management"
          description="Create, edit, publish, and manage all-inclusive tour packages and pricing."
          action={
            <Button size="sm" className="gap-1.5" onClick={openCreateForm}>
              <Plus className="size-4" />
              Add Tour Package
            </Button>
          }
        />

        {errorMessage ? (
          <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-foreground">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search packages or destinations..." />
          <FilterBar
            filters={[
              {
                id: "type",
                label: "Package Type",
                value: typeFilter,
                onChange: (value) => {
                  setTypeFilter(value);
                  setPage(1);
                },
                options: [
                  { label: "All Types", value: "all" },
                  { label: "Domestic", value: "DOMESTIC" },
                  { label: "International", value: "INTERNATIONAL" },
                  { label: "Luxury", value: "LUXURY" },
                  { label: "Adventure", value: "ADVENTURE" },
                  { label: "Pilgrimage", value: "PILGRIMAGE" },
                ],
              },
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
            ]}
            onReset={() => {
              setSearch("");
              setTypeFilter("all");
              setStatusFilter("all");
              setPage(1);
            }}
          />
        </div>

        {isLoading ? (
          <LoadingState rows={5} />
        ) : packages.length === 0 ? (
          <EmptyState
            title="No packages found"
            description="Create your first tour package to offer travelers curated itineraries."
            actionLabel="Add Tour Package"
            onAction={openCreateForm}
          />
        ) : (
          <>
            <DataTable
              data={packages}
              keyExtractor={(row) => row.id}
              columns={[
                { header: "Package Title", cell: (row) => <span className="font-semibold text-foreground">{row.title}</span> },
                { header: "Destination", cell: (row) => <span>{row.destination?.name ?? "N/A"}</span> },
                { header: "Duration", cell: (row) => <span className="text-muted-foreground">{row.durationDays}D / {row.durationNights}N</span> },
                { header: "Starting Price", cell: (row) => <Price amount={Number(row.priceFrom)} size="sm" /> },
                { header: "Category", cell: (row) => <Badge variant="outline">{row.packageType}</Badge> },
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
                {
                  header: "Actions",
                  cell: (row) => (
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                        <Link href={`/packages/${row.slug}`} target="_blank">
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
                Page {page} of {totalPages} ({total} tour packages)
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

      {/* Package Form Modal */}
      <DialogPrimitive.Root open={formOpen} onOpenChange={setFormOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45" />
          <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <DialogPrimitive.Title className="text-lg font-semibold">
                {editingPackage ? "Edit Tour Package" : "Add Tour Package"}
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
                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="package-title">Package Title *</Label>
                  <Input id="package-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Kashmir Paradise Escape" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-destination">Destination *</Label>
                  <Select value={form.destinationId} onValueChange={(value) => setForm({ ...form, destinationId: value })}>
                    <SelectTrigger id="package-destination">
                      <SelectValue placeholder="Select destination" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinations.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} ({d.country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-type">Package Category *</Label>
                  <Select value={form.packageType} onValueChange={(value) => setForm({ ...form, packageType: value as PackageForm["packageType"] })}>
                    <SelectTrigger id="package-type">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOMESTIC">Domestic</SelectItem>
                      <SelectItem value="INTERNATIONAL">International</SelectItem>
                      <SelectItem value="LUXURY">Luxury</SelectItem>
                      <SelectItem value="ADVENTURE">Adventure</SelectItem>
                      <SelectItem value="PILGRIMAGE">Pilgrimage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-days">Duration Days *</Label>
                  <Input id="package-days" type="number" min={1} max={365} required value={form.durationDays} onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-nights">Duration Nights *</Label>
                  <Input id="package-nights" type="number" min={0} max={365} required value={form.durationNights} onChange={(e) => setForm({ ...form, durationNights: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-price">Starting Price (INR) *</Label>
                  <Input id="package-price" type="number" min={0} required value={form.priceFrom} onChange={(e) => setForm({ ...form, priceFrom: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-status">Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as "DRAFT" | "PUBLISHED" })}>
                    <SelectTrigger id="package-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="package-short">Short Description *</Label>
                  <Textarea id="package-short" required maxLength={300} value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} placeholder="One or two sentence summary for cards." />
                </div>
                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="package-description">Full Overview *</Label>
                  <Textarea id="package-description" required maxLength={6000} rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed package overview." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-inclusions">Inclusions (one per line)</Label>
                  <Textarea id="package-inclusions" rows={4} value={form.inclusions} onChange={(e) => setForm({ ...form, inclusions: e.target.value })} placeholder={"Breakfast & Dinner\nPrivate AC Cab\nHotel Stay"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-exclusions">Exclusions (one per line)</Label>
                  <Textarea id="package-exclusions" rows={4} value={form.exclusions} onChange={(e) => setForm({ ...form, exclusions: e.target.value })} placeholder={"Airfare / Train tickets\nPersonal Expenses\nTips & Monument Fees"} />
                </div>
                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="package-image">Featured Image URL</Label>
                  <Input id="package-image" type="url" value={form.featuredImage} onChange={(e) => setForm({ ...form, featuredImage: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="package-gallery">Gallery Images (one URL per line)</Label>
                  <Textarea id="package-gallery" rows={3} value={form.galleryImages} onChange={(e) => setForm({ ...form, galleryImages: e.target.value })} placeholder={"https://...\nhttps://..."} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-meta-title">Meta Title</Label>
                  <Input id="package-meta-title" maxLength={120} value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} placeholder="SEO Title" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-meta-description">Meta Description</Label>
                  <Input id="package-meta-description" maxLength={180} value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} placeholder="SEO Description" />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-3">
                <Switch checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: checked })} aria-label="Featured package" />
                <div>
                  <p className="text-sm font-medium text-foreground">Featured Package</p>
                  <p className="text-xs text-muted-foreground">Featured packages appear on the homepage and top package listings.</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "Saving..." : editingPackage ? "Save Changes" : "Create Tour Package"}
                </Button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Tour Package"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        isDestructive
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}