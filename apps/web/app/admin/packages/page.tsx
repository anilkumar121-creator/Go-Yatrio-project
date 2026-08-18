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
import { Card } from "@/components/common/card";
import { MediaLinkPanel } from "@/components/media/media-link-panel";

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
  discountedPrice: number | null;
  currency: string;
  packageType: "DOMESTIC" | "INTERNATIONAL" | "LUXURY" | "ADVENTURE" | "PILGRIMAGE";
  inclusions: string[];
  exclusions: string[];
  featuredImage: string | null;
  galleryImages: string[];
  featured: boolean;
  status: "DRAFT" | "PUBLISHED";
  availability: "AVAILABLE" | "LIMITED_SEATS" | "SOLD_OUT" | "UPCOMING";
  availableSeats: number;
  priceValidFrom: string | null;
  priceValidTo: string | null;
  seasonalPrices: { id?: string; label: string; priceFrom: number; discountedPrice: number | null; displayOrder: number; startDate: string; endDate: string; active: boolean }[];
  offers: { id?: string; label: string; badge: string; discountedPrice: number | null; priority: number; startDate: string; endDate: string; featured: boolean; active: boolean }[];
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
  discountedPrice: string;
  availability: "AVAILABLE" | "LIMITED_SEATS" | "SOLD_OUT" | "UPCOMING";
  availableSeats: number;
  priceValidFrom: string;
  priceValidTo: string;
  seasonalPrices: { id?: string; label: string; priceFrom: string; discountedPrice: string; displayOrder: number; startDate: string; endDate: string; active: boolean }[];
  offers: { id?: string; label: string; badge: string; discountedPrice: string; priority: number; startDate: string; endDate: string; featured: boolean; active: boolean }[];
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
  discountedPrice: "",
  availability: "AVAILABLE",
  availableSeats: 0,
  priceValidFrom: "",
  priceValidTo: "",
  seasonalPrices: [],
  offers: [],
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
      discountedPrice: pkg.discountedPrice ? String(pkg.discountedPrice) : "",
      availability: pkg.availability ?? "AVAILABLE",
      availableSeats: pkg.availableSeats ?? 0,
      priceValidFrom: pkg.priceValidFrom ? pkg.priceValidFrom.slice(0, 10) : "",
      priceValidTo: pkg.priceValidTo ? pkg.priceValidTo.slice(0, 10) : "",
      seasonalPrices: (pkg.seasonalPrices ?? []).map((s) => ({
        id: s.id,
        label: s.label,
        priceFrom: String(s.priceFrom),
        discountedPrice: s.discountedPrice ? String(s.discountedPrice) : "",
        displayOrder: s.displayOrder ?? 0,
        startDate: (s.startDate ?? "").slice(0, 10),
        endDate: (s.endDate ?? "").slice(0, 10),
        active: s.active ?? true,
      })),
      offers: (pkg.offers ?? []).map((o) => ({
        id: o.id,
        label: o.label,
        badge: o.badge ?? "",
        discountedPrice: o.discountedPrice ? String(o.discountedPrice) : "",
        priority: o.priority ?? 0,
        startDate: (o.startDate ?? "").slice(0, 10),
        endDate: (o.endDate ?? "").slice(0, 10),
        featured: o.featured ?? false,
        active: o.active ?? true,
      })),
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
      const toNumber = (value: string): number | undefined =>
        value.trim() === "" ? undefined : Number(value);

      const payload = {
        title: form.title,
        slug: undefined as string | undefined,
        destinationId: form.destinationId,
        packageType: form.packageType,
        durationDays: form.durationDays,
        durationNights: form.durationNights,
        priceFrom: form.priceFrom,
        discountedPrice: toNumber(form.discountedPrice),
        availability: form.availability,
        availableSeats: form.availableSeats,
        priceValidFrom: form.priceValidFrom ? new Date(form.priceValidFrom).toISOString() : undefined,
        priceValidTo: form.priceValidTo ? new Date(form.priceValidTo).toISOString() : undefined,
        seasonalPrices: form.seasonalPrices.map((s) => ({
          id: s.id,
          label: s.label,
          priceFrom: Number(s.priceFrom),
          discountedPrice: toNumber(s.discountedPrice),
          displayOrder: s.displayOrder,
          startDate: new Date(s.startDate).toISOString(),
          endDate: new Date(s.endDate).toISOString(),
          active: s.active,
        })),
        offers: form.offers.map((o) => ({
          id: o.id,
          label: o.label,
          badge: o.badge.trim() ? o.badge : undefined,
          discountedPrice: toNumber(o.discountedPrice),
          priority: o.priority,
          startDate: new Date(o.startDate).toISOString(),
          endDate: new Date(o.endDate).toISOString(),
          featured: o.featured,
          active: o.active,
        })),
        shortDescription: form.shortDescription,
        description: form.description,
        inclusions: form.inclusions
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        exclusions: form.exclusions
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        featuredImage: form.featuredImage,
        galleryImages: form.galleryImages
          .split("\n")
          .map((url) => url.trim())
          .filter(Boolean),
        featured: form.featured,
        status: form.status,
        metaTitle: form.metaTitle,
        metaDescription: form.metaDescription,
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
                { header: "Starting Price", cell: (row) => (
                  <div>
                    {row.discountedPrice && Number(row.discountedPrice) < Number(row.priceFrom) ? (
                      <Price amount={Number(row.discountedPrice)} size="sm" />
                    ) : (
                      <Price amount={Number(row.priceFrom)} size="sm" />
                    )}
                    <span className="block text-[11px] text-muted-foreground">{row.availability ?? "AVAILABLE"}</span>
                  </div>
                ) },
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
                  <Label htmlFor="package-discount">Discount Price (INR)</Label>
                  <Input id="package-discount" type="number" min={0} value={form.discountedPrice} onChange={(e) => setForm({ ...form, discountedPrice: e.target.value })} placeholder="Optional base discount" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-availability">Availability</Label>
                  <Select
                    value={form.availability}
                    onValueChange={(value) => setForm({ ...form, availability: value as "AVAILABLE" | "LIMITED_SEATS" | "SOLD_OUT" | "UPCOMING" })}
                  >
                    <SelectTrigger id="package-availability">
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Available</SelectItem>
                      <SelectItem value="LIMITED_SEATS">Limited Seats</SelectItem>
                      <SelectItem value="SOLD_OUT">Sold Out</SelectItem>
                      <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-seats">Available Seats</Label>
                  <Input id="package-seats" type="number" min={0} value={form.availableSeats} onChange={(e) => setForm({ ...form, availableSeats: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-valid-from">Price Valid From</Label>
                  <Input id="package-valid-from" type="date" value={form.priceValidFrom} onChange={(e) => setForm({ ...form, priceValidFrom: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package-valid-to">Price Valid To</Label>
                  <Input id="package-valid-to" type="date" value={form.priceValidTo} onChange={(e) => setForm({ ...form, priceValidTo: e.target.value })} />
                </div>

                {/* Seasonal Pricing Repeater */}
                <div className="space-y-3 tablet:col-span-2 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Seasonal Prices ({form.seasonalPrices.length})</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setForm({
                          ...form,
                          seasonalPrices: [
                            ...form.seasonalPrices,
                            { label: "", priceFrom: "", discountedPrice: "", displayOrder: form.seasonalPrices.length, startDate: "", endDate: "", active: true },
                          ],
                        })
                      }
                      className="gap-1"
                    >
                      <Plus className="size-3.5" />
                      Add Seasonal Price
                    </Button>
                  </div>
                  {form.seasonalPrices.map((sPrice, idx) => (
                    <Card key={idx} className="p-3 border border-border bg-muted/20">
                      <div className="grid grid-cols-1 gap-2 tablet:grid-cols-6">
                        <Input
                          className="h-8 text-xs"
                          placeholder="Label (e.g. Summer)"
                          value={sPrice.label}
                          onChange={(e) => {
                            const list = [...form.seasonalPrices];
                            list[idx] = { ...list[idx], label: e.target.value };
                            setForm({ ...form, seasonalPrices: list });
                          }}
                        />
                        <Input
                          className="h-8 text-xs"
                          type="number"
                          placeholder="Price From"
                          value={sPrice.priceFrom}
                          onChange={(e) => {
                            const list = [...form.seasonalPrices];
                            list[idx] = { ...list[idx], priceFrom: e.target.value };
                            setForm({ ...form, seasonalPrices: list });
                          }}
                        />
                        <Input
                          className="h-8 text-xs"
                          type="number"
                          placeholder="Discount"
                          value={sPrice.discountedPrice}
                          onChange={(e) => {
                            const list = [...form.seasonalPrices];
                            list[idx] = { ...list[idx], discountedPrice: e.target.value };
                            setForm({ ...form, seasonalPrices: list });
                          }}
                        />
                        <Input
                          className="h-8 text-xs"
                          type="date"
                          value={sPrice.startDate}
                          onChange={(e) => {
                            const list = [...form.seasonalPrices];
                            list[idx] = { ...list[idx], startDate: e.target.value };
                            setForm({ ...form, seasonalPrices: list });
                          }}
                        />
                        <Input
                          className="h-8 text-xs"
                          type="date"
                          value={sPrice.endDate}
                          onChange={(e) => {
                            const list = [...form.seasonalPrices];
                            list[idx] = { ...list[idx], endDate: e.target.value };
                            setForm({ ...form, seasonalPrices: list });
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={sPrice.active}
                            onCheckedChange={(checked) => {
                              const list = [...form.seasonalPrices];
                              list[idx] = { ...list[idx], active: checked };
                              setForm({ ...form, seasonalPrices: list });
                            }}
                            aria-label="Active seasonal price"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => setForm({ ...form, seasonalPrices: form.seasonalPrices.filter((_, i) => i !== idx) })}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Offers Repeater */}
                <div className="space-y-3 tablet:col-span-2 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold">Offers ({form.offers.length})</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setForm({
                          ...form,
                          offers: [
                            ...form.offers,
                            { label: "", badge: "", discountedPrice: "", priority: 0, startDate: "", endDate: "", featured: false, active: true },
                          ],
                        })
                      }
                      className="gap-1"
                    >
                      <Plus className="size-3.5" />
                      Add Offer
                    </Button>
                  </div>
                  {form.offers.map((offer, idx) => (
                    <Card key={idx} className="p-3 border border-border bg-muted/20">
                      <div className="grid grid-cols-1 gap-2 tablet:grid-cols-4">
                        <Input
                          className="h-8 text-xs"
                          placeholder="Label (e.g. Early Bird)"
                          value={offer.label}
                          onChange={(e) => {
                            const list = [...form.offers];
                            list[idx] = { ...list[idx], label: e.target.value };
                            setForm({ ...form, offers: list });
                          }}
                        />
                        <Input
                          className="h-8 text-xs"
                          placeholder="Badge (e.g. Early Bird)"
                          value={offer.badge}
                          onChange={(e) => {
                            const list = [...form.offers];
                            list[idx] = { ...list[idx], badge: e.target.value };
                            setForm({ ...form, offers: list });
                          }}
                        />
                        <Input
                          className="h-8 text-xs"
                          type="number"
                          placeholder="Offer Price"
                          value={offer.discountedPrice}
                          onChange={(e) => {
                            const list = [...form.offers];
                            list[idx] = { ...list[idx], discountedPrice: e.target.value };
                            setForm({ ...form, offers: list });
                          }}
                        />
                        <Input
                          className="h-8 text-xs"
                          type="number"
                          placeholder="Priority"
                          value={offer.priority}
                          onChange={(e) => {
                            const list = [...form.offers];
                            list[idx] = { ...list[idx], priority: Number(e.target.value) };
                            setForm({ ...form, offers: list });
                          }}
                        />
                        <Input
                          className="h-8 text-xs"
                          type="date"
                          value={offer.startDate}
                          onChange={(e) => {
                            const list = [...form.offers];
                            list[idx] = { ...list[idx], startDate: e.target.value };
                            setForm({ ...form, offers: list });
                          }}
                        />
                        <Input
                          className="h-8 text-xs"
                          type="date"
                          value={offer.endDate}
                          onChange={(e) => {
                            const list = [...form.offers];
                            list[idx] = { ...list[idx], endDate: e.target.value };
                            setForm({ ...form, offers: list });
                          }}
                        />
                        <label className="flex items-center gap-2 text-xs text-foreground">
                          <Switch
                            checked={offer.active}
                            onCheckedChange={(checked) => {
                              const list = [...form.offers];
                              list[idx] = { ...list[idx], active: checked };
                              setForm({ ...form, offers: list });
                            }}
                            aria-label="Active offer"
                          />
                          Active
                        </label>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 text-xs text-foreground">
                            <Switch
                              checked={offer.featured}
                              onCheckedChange={(checked) => {
                                const list = [...form.offers];
                                list[idx] = { ...list[idx], featured: checked };
                                setForm({ ...form, offers: list });
                              }}
                              aria-label="Featured offer"
                            />
                            Featured
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => setForm({ ...form, offers: form.offers.filter((_, i) => i !== idx) })}
                          >
                            <X className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
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
                <div className="space-y-2 tablet:col-span-2">
                  <MediaLinkPanel module="PACKAGE" moduleId={editingPackage?.id} />
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
