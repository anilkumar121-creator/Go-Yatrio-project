"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2, Car, Users, Star, MapPin, Fuel, X, Snowflake } from "lucide-react";
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
import { Price } from "@/components/common/price";
import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import { Label } from "@/components/common/label";
import { Switch } from "@/components/common/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select";
import { MediaPicker, type PickedMedia } from "@/components/media/media-picker";
import { useLookups } from "@/lib/use-lookups";

type DestinationOption = {
  id: string;
  name: string;
  country: string;
};

type VehicleItem = {
  id: string;
  vehicleName: string;
  slug: string;
  vehicleType: string;
  description: string;
  capacity: number;
  luggageCapacity: number;
  ac: boolean;
  fuelType: "PETROL" | "DIESEL" | "CNG" | "ELECTRIC";
  driverAllowance: number;
  baseFare: number;
  extraKmCharge: number;
  nightCharge: number;
  priceFrom: number;
  currency: string;
  image: string | null;
  galleryImages: string[];
  tripTypes: string[];
  featured: boolean;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  isActive: boolean;
  destinationId: string | null;
  destination?: { name: string };
  serviceLocations?: { cityId: string; city?: { name: string; state?: { name: string } } }[];
  amenities: { id: string; name: string }[];
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
};

type VehicleForm = {
  vehicleName: string;
  slug: string;
  vehicleType: string;
  description: string;
  capacity: number;
  luggageCapacity: number;
  ac: boolean;
  fuelType: string;
  driverAllowance: number;
  baseFare: number;
  extraKmCharge: number;
  nightCharge: number;
  priceFrom: number;
  image: string;
  galleryImages: string;
  tripTypes: string[];
  featured: boolean;
  status: string;
  destinationId: string;
  serviceCityIds: string[];
  amenities: string[];
  metaTitle: string;
  metaDescription: string;
};

const emptyForm: VehicleForm = {
  vehicleName: "",
  slug: "",
  vehicleType: "SEDAN",
  description: "",
  capacity: 4,
  luggageCapacity: 2,
  ac: true,
  fuelType: "DIESEL",
  driverAllowance: 300,
  baseFare: 200,
  extraKmCharge: 12,
  nightCharge: 150,
  priceFrom: 2000,
  image: "",
  galleryImages: "",
  tripTypes: ["LOCAL", "AIRPORT_TRANSFER"],
  featured: false,
  status: "DRAFT",
  destinationId: "",
  serviceCityIds: [],
  amenities: ["Air Conditioning", "Music System / Bluetooth", "USB Charging Points"],
  metaTitle: "",
  metaDescription: "",
};

const defaultAmenityOptions = [
  "Air Conditioning",
  "Music System / Bluetooth",
  "USB Charging Points",
  "Pushback Recliner Seats",
  "Reading Lights",
  "Large Luggage Space",
  "Sunroof",
  "GPS Navigation",
  "Clean & Sanitized Interior",
];

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
export default function AdminCabsPage() {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string; state?: { name: string } }[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleItem | null>(null);
  const [form, setForm] = useState<VehicleForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<VehicleItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"primary" | "gallery">("primary");

  const { options: cabLookupOptions } = useLookups(["VEHICLE_TYPE", "FUEL_TYPE", "CAB_TRIP_TYPE"], {
    VEHICLE_TYPE: [
      "HATCHBACK",
      "SEDAN",
      "SUV",
      "LUXURY_SUV",
      "TEMPO_TRAVELLER",
      "MINI_BUS",
      "BUS",
      "LUXURY",
    ],
    FUEL_TYPE: ["PETROL", "DIESEL", "CNG", "ELECTRIC"],
    CAB_TRIP_TYPE: [
      "LOCAL",
      "AIRPORT_TRANSFER",
      "RAILWAY_TRANSFER",
      "OUTSTATION",
      "ONE_WAY",
      "ROUND_TRIP",
      "MULTI_DAY",
    ],
  });

  const loadDestinations = useCallback(async () => {
    try {
      const data = await apiFetch("/api/admin/destinations?take=100");
      setDestinations(Array.isArray(data) ? data : (data?.data ?? []));
    } catch {
      // Fallback
    }
  }, []);

  const loadCities = useCallback(async () => {
    try {
      const data = await apiFetch("/api/locations/cities?activeOnly=true");
      setCities(Array.isArray(data) ? data : (data?.data ?? []));
    } catch {
      // Fallback
    }
  }, []);

  const loadVehicles = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams({ take: "100" });
      if (search) params.set("search", search);
      if (typeFilter !== "all") params.set("vehicleType", typeFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const data = await apiFetch(`/api/admin/cabs?${params.toString()}`);
      setVehicles(Array.isArray(data) ? data : (data?.data ?? []));
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load cabs.");
    } finally {
      setIsLoading(false);
    }
  }, [search, typeFilter, statusFilter]);

  useEffect(() => {
    loadDestinations();
    loadCities();
  }, [loadDestinations, loadCities]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const handleOpenCreate = () => {
    setEditingVehicle(null);
    setForm({ ...emptyForm, destinationId: destinations[0]?.id ?? "" });
    setFormError(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (cab: VehicleItem) => {
    setEditingVehicle(cab);
    setForm({
      vehicleName: cab.vehicleName,
      slug: cab.slug,
      vehicleType: cab.vehicleType,
      description: cab.description,
      capacity: cab.capacity,
      luggageCapacity: cab.luggageCapacity,
      ac: cab.ac,
      fuelType: cab.fuelType,
      driverAllowance: Number(cab.driverAllowance),
      baseFare: Number(cab.baseFare),
      extraKmCharge: Number(cab.extraKmCharge),
      nightCharge: Number(cab.nightCharge),
      priceFrom: Number(cab.priceFrom),
      image: cab.image ?? "",
      galleryImages: (cab.galleryImages ?? []).join("\n"),
      tripTypes: cab.tripTypes ?? [],
      featured: cab.featured,
      status: cab.status,
      destinationId: cab.destinationId ?? "",
      serviceCityIds: cab.serviceLocations?.map((loc) => loc.cityId) ?? [],
      amenities: cab.amenities.map((a) => a.name),
      metaTitle: cab.metaTitle ?? "",
      metaDescription: cab.metaDescription ?? "",
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleToggleTripType = (value: string) => {
    setForm((prev) => ({
      ...prev,
      tripTypes: prev.tripTypes.includes(value)
        ? prev.tripTypes.filter((t) => t !== value)
        : [...prev.tripTypes, value],
    }));
  };

  const handleToggleAmenity = (name: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(name)
        ? prev.amenities.filter((a) => a !== name)
        : [...prev.amenities, name],
    }));
  };

  const handleMediaPick = (selection: PickedMedia[]) => {
    if (selection.length === 0) return;
    const picked = selection[0];
    if (!picked.secureUrl) return;

    if (mediaPickerTarget === "primary") {
      setForm((prev) => ({ ...prev, image: picked.secureUrl! }));
    } else {
      setForm((prev) => {
        const existing = prev.galleryImages ? prev.galleryImages.split("\n").filter(Boolean) : [];
        if (!existing.includes(picked.secureUrl!)) {
          existing.push(picked.secureUrl!);
        }
        return { ...prev, galleryImages: existing.join("\n") };
      });
    }
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.vehicleName.trim() || !form.description.trim() || form.priceFrom <= 0) {
      setFormError("Vehicle Name, Description, and Price From are required.");
      return;
    }

    setSaving(true);

    try {
      const galleryList = form.galleryImages
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const payload = {
        vehicleName: form.vehicleName,
        slug: form.slug.trim() || undefined,
        vehicleType: form.vehicleType,
        description: form.description,
        capacity: form.capacity,
        luggageCapacity: form.luggageCapacity,
        ac: form.ac,
        fuelType: form.fuelType,
        driverAllowance: form.driverAllowance,
        baseFare: form.baseFare,
        extraKmCharge: form.extraKmCharge,
        nightCharge: form.nightCharge,
        priceFrom: form.priceFrom,
        image: form.image.trim() || undefined,
        galleryImages: galleryList,
        tripTypes: form.tripTypes,
        featured: form.featured,
        status: form.status,
        destinationId: form.destinationId || undefined,
        serviceCityIds: form.serviceCityIds,
        amenities: form.amenities,
        metaTitle: form.metaTitle || undefined,
        metaDescription: form.metaDescription || undefined,
      };

      if (editingVehicle) {
        await apiFetch(`/api/admin/cabs/${editingVehicle.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/admin/cabs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setFormOpen(false);
      await loadVehicles();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save cab.");
    } finally {
      setSaving(false);
    }
  };
  const handleDeleteVehicle = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await apiFetch(`/api/admin/cabs/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setDeleteTarget(null);
      await loadVehicles();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete cab.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (
    cab: VehicleItem,
    newStatus: "ACTIVE" | "INACTIVE" | "DRAFT",
  ) => {
    try {
      await apiFetch(`/api/admin/cabs/${cab.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await loadVehicles();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const handleToggleFeatured = async (cab: VehicleItem) => {
    try {
      await apiFetch(`/api/admin/cabs/${cab.id}/featured`, {
        method: "PATCH",
        body: JSON.stringify({ featured: !cab.featured }),
      });
      await loadVehicles();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update featured flag.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Cab Fleet & Rental Management"
          description="Manage vehicle inventory, seating capacities, trip types, per-kilometer pricing, and rental rates."
          action={
            <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
              <Plus className="size-4" />
              Add New Cab
            </Button>
          }
        />

        {errorMessage ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search cabs, types, destinations..."
          />
          <div className="flex items-center gap-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Vehicle Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {(cabLookupOptions.VEHICLE_TYPE ?? []).map((vt) => (
                  <SelectItem key={vt.value} value={vt.value}>
                    {vt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {isLoading ? (
          <LoadingState rows={5} />
        ) : vehicles.length === 0 ? (
          <EmptyState
            icon={Car}
            title="No cabs found"
            description="Add your first vehicle to manage cab pricing, trip types, and inquiries."
            actionLabel="Add New Cab"
            onAction={handleOpenCreate}
          />
        ) : (
          <DataTable
            data={vehicles}
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "Vehicle Name",
                cell: (row) => (
                  <div className="flex items-center gap-3">
                    {row.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.image}
                        alt={row.vehicleName}
                        className="h-10 w-14 rounded-md object-cover border border-border"
                      />
                    ) : (
                      <div className="flex h-10 w-14 items-center justify-center rounded-md border border-border bg-muted">
                        <Car className="size-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{row.vehicleName}</span>
                        {row.featured ? <Badge variant="accent">Featured</Badge> : null}
                        {row.ac ? <Snowflake className="size-3.5 text-sky-500" /> : null}
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="size-3 text-primary" />
                        {row.serviceLocations?.length
                          ? `${row.serviceLocations.length} Locations`
                          : "Global (No City)"}{" "}
                        &middot; /{row.slug}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                header: "Type & Capacity",
                cell: (row) => (
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">
                      {row.vehicleType}
                    </Badge>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3 text-primary" />
                        {row.capacity} seats
                      </span>
                      <span className="flex items-center gap-1">
                        <Fuel className="size-3 text-primary" />
                        {row.fuelType}
                      </span>
                    </div>
                  </div>
                ),
              },
              {
                header: "Price From / KM",
                cell: (row) => (
                  <div>
                    <Price amount={Number(row.priceFrom)} size="sm" />
                    <span className="block text-[11px] text-muted-foreground">
                      ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹{Number(row.extraKmCharge)}/km extra
                    </span>
                  </div>
                ),
              },
              {
                header: "Status",
                cell: (row) => (
                  <Select
                    value={row.status}
                    onValueChange={(val) =>
                      handleToggleStatus(row, val as "ACTIVE" | "INACTIVE" | "DRAFT")
                    }
                  >
                    <SelectTrigger className="h-8 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                ),
              },
              {
                header: "Actions",
                cell: (row) => (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(row)}
                      title="Edit Cab"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleToggleFeatured(row)}
                      title={row.featured ? "Unfeature Cab" : "Feature Cab"}
                    >
                      <Star
                        className={
                          row.featured
                            ? "size-4 fill-amber-500 text-amber-500"
                            : "size-4 text-muted-foreground"
                        }
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(row)}
                      title="Delete Cab"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
      {/* Cab Create / Edit Dialog */}
      <DialogPrimitive.Root open={formOpen} onOpenChange={setFormOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed inset-x-4 top-10 z-50 max-h-[88vh] w-full max-w-4xl translate-x-0 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-2xl mx-auto my-auto inset-y-0">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <DialogPrimitive.Title className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Car className="size-5 text-primary" />
                  {editingVehicle ? "Edit Cab Details" : "Create New Cab / Vehicle"}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-xs text-muted-foreground">
                  Configure vehicle profile, seating, trip types, pricing, features, and gallery
                  images.
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close className="rounded-sm opacity-70 hover:opacity-100">
                <X className="size-5 text-muted-foreground" />
              </DialogPrimitive.Close>
            </div>

            {formError ? (
              <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            <form onSubmit={handleSaveVehicle} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cab-name">Vehicle Name *</Label>
                  <Input
                    id="cab-name"
                    required
                    maxLength={140}
                    value={form.vehicleName}
                    onChange={(e) => setForm({ ...form, vehicleName: e.target.value })}
                    placeholder="e.g. Toyota Innova Crysta"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cab-type">Vehicle Type *</Label>
                  <Select
                    value={form.vehicleType}
                    onValueChange={(value) => setForm({ ...form, vehicleType: value })}
                  >
                    <SelectTrigger id="cab-type">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(cabLookupOptions.VEHICLE_TYPE ?? []).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cab-dest">Destination (Optional)</Label>
                  <Select
                    value={form.destinationId}
                    onValueChange={(value) => setForm({ ...form, destinationId: value })}
                  >
                    <SelectTrigger id="cab-dest">
                      <SelectValue placeholder="All Destinations" />
                    </SelectTrigger>
                    <SelectContent>
                      {destinations.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-1 tablet:col-span-2">
                  <Label>Service Cities (Locations)</Label>
                  <div className="grid grid-cols-2 gap-2 rounded-md border border-input p-3 max-h-40 overflow-y-auto">
                    {cities.map((city) => (
                      <label key={city.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          className="rounded border-input text-primary focus:ring-primary"
                          checked={form.serviceCityIds.includes(city.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setForm({
                                ...form,
                                serviceCityIds: [...form.serviceCityIds, city.id],
                              });
                            } else {
                              setForm({
                                ...form,
                                serviceCityIds: form.serviceCityIds.filter((id) => id !== city.id),
                              });
                            }
                          }}
                        />
                        <span className="text-muted-foreground">
                          {city.name} {city.state ? `(${city.state.name})` : ""}
                        </span>
                      </label>
                    ))}
                    {cities.length === 0 && (
                      <span className="text-xs text-muted-foreground italic col-span-2">
                        No active cities found. Add them in Admin &gt; Geography.
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cab-fuel">Fuel Type *</Label>
                  <Select
                    value={form.fuelType}
                    onValueChange={(value) => setForm({ ...form, fuelType: value })}
                  >
                    <SelectTrigger id="cab-fuel">
                      <SelectValue placeholder="Select Fuel" />
                    </SelectTrigger>
                    <SelectContent>
                      {(cabLookupOptions.FUEL_TYPE ?? []).map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cab-capacity">Seating Capacity *</Label>
                  <Input
                    id="cab-capacity"
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={form.capacity}
                    onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cab-luggage">Luggage Capacity (bags)</Label>
                  <Input
                    id="cab-luggage"
                    type="number"
                    min={0}
                    value={form.luggageCapacity}
                    onChange={(e) => setForm({ ...form, luggageCapacity: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cab-price">
                    Base Price From (ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹) *
                  </Label>
                  <Input
                    id="cab-price"
                    type="number"
                    min={0}
                    required
                    value={form.priceFrom}
                    onChange={(e) => setForm({ ...form, priceFrom: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cab-base-fare">
                    Base Fare (ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹)
                  </Label>
                  <Input
                    id="cab-base-fare"
                    type="number"
                    min={0}
                    value={form.baseFare}
                    onChange={(e) => setForm({ ...form, baseFare: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cab-extra">
                    Extra KM Charge (ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹/km)
                  </Label>
                  <Input
                    id="cab-extra"
                    type="number"
                    min={0}
                    value={form.extraKmCharge}
                    onChange={(e) => setForm({ ...form, extraKmCharge: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cab-night">Night Charge (ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹)</Label>
                  <Input
                    id="cab-night"
                    type="number"
                    min={0}
                    value={form.nightCharge}
                    onChange={(e) => setForm({ ...form, nightCharge: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cab-driver">
                    Driver Allowance (ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¹/day)
                  </Label>
                  <Input
                    id="cab-driver"
                    type="number"
                    min={0}
                    value={form.driverAllowance}
                    onChange={(e) => setForm({ ...form, driverAllowance: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cab-slug">Slug</Label>
                  <Input
                    id="cab-slug"
                    maxLength={200}
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated if empty"
                  />
                </div>

                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="cab-desc">Vehicle Description *</Label>
                  <Textarea
                    id="cab-desc"
                    required
                    maxLength={6000}
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Detailed cab description, ideal use cases..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Primary Vehicle Image</Label>
                  <div className="flex items-center gap-3">
                    {form.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.image}
                        alt="Cover Preview"
                        className="h-16 w-24 object-cover rounded-md border border-border bg-muted"
                      />
                    ) : (
                      <div className="flex h-16 w-24 items-center justify-center rounded-md border border-dashed border-border bg-muted">
                        <span className="text-xs text-muted-foreground">No Image</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setMediaPickerTarget("primary");
                          setIsMediaPickerOpen(true);
                        }}
                      >
                        Select from Media Library
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive hover:text-destructive h-auto p-0 justify-start"
                        onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                        disabled={!form.image}
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 tablet:col-span-2">
                  <Label>Gallery Images</Label>
                  <div className="flex flex-col gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-fit"
                      onClick={() => {
                        setMediaPickerTarget("gallery");
                        setIsMediaPickerOpen(true);
                      }}
                    >
                      Add Gallery Image
                    </Button>
                    {form.galleryImages ? (
                      <div className="grid grid-cols-3 tablet:grid-cols-5 gap-3">
                        {form.galleryImages
                          .split("\n")
                          .filter(Boolean)
                          .map((url, i) => (
                            <div
                              key={i}
                              className="relative group aspect-square rounded-md border border-border overflow-hidden bg-muted"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={url}
                                alt={`Gallery ${i}`}
                                className="h-full w-full object-cover"
                              />
                              <button
                                type="button"
                                className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  setForm((prev) => {
                                    const list = prev.galleryImages.split("\n").filter(Boolean);
                                    list.splice(i, 1);
                                    return { ...prev, galleryImages: list.join("\n") };
                                  });
                                }}
                              >
                                <X className="size-3" />
                              </button>
                            </div>
                          ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Air Conditioning + Featured toggles */}
                <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Air Conditioning</p>
                    <p className="text-xs text-muted-foreground">Vehicle includes AC.</p>
                  </div>
                  <Switch
                    checked={form.ac}
                    onCheckedChange={(checked) => setForm({ ...form, ac: checked })}
                    aria-label="AC"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Featured Cab</p>
                    <p className="text-xs text-muted-foreground">
                      Featured cabs appear on top listings.
                    </p>
                  </div>
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                    aria-label="Featured cab"
                  />
                </div>

                {/* Trip Types */}
                <div className="space-y-2 tablet:col-span-2 border-t border-border pt-4">
                  <Label className="font-semibold">Available Trip Types</Label>
                  <div className="grid grid-cols-2 gap-2 tablet:grid-cols-3">
                    {(cabLookupOptions.CAB_TRIP_TYPE ?? []).map((trip) => (
                      <label
                        key={trip.value}
                        className="flex items-center gap-2 text-xs text-foreground cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.tripTypes.includes(trip.value)}
                          onChange={() => handleToggleTripType(trip.value)}
                          className="rounded border-border"
                        />
                        <span>{trip.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-2 tablet:col-span-2 border-t border-border pt-4">
                  <Label className="font-semibold">Vehicle Features / Amenities</Label>
                  <div className="grid grid-cols-2 gap-2 tablet:grid-cols-3">
                    {defaultAmenityOptions.map((am) => (
                      <label
                        key={am}
                        className="flex items-center gap-2 text-xs text-foreground cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={form.amenities.includes(am)}
                          onChange={() => handleToggleAmenity(am)}
                          className="rounded border-border"
                        />
                        <span>{am}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* SEO Configuration */}
                <div className="space-y-4 tablet:col-span-2 border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-foreground">SEO Metadata Overrides</h3>
                  <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cab-meta-title">
                        SEO Meta Title (Recommended 50–60 chars)
                      </Label>
                      <Input
                        id="cab-meta-title"
                        maxLength={120}
                        value={form.metaTitle}
                        onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                        placeholder="SEO Title Override"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cab-meta-description">
                        SEO Meta Description (Recommended 140–160 chars)
                      </Label>
                      <Input
                        id="cab-meta-description"
                        maxLength={180}
                        value={form.metaDescription}
                        onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                        placeholder="SEO Description Override"
                      />
                    </div>
                  </div>
                </div>
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
                  {saving ? "Saving Cab..." : editingVehicle ? "Save Changes" : "Create Cab"}
                </Button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Cab"
        description={`Are you sure you want to delete "${deleteTarget?.vehicleName}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        isDestructive
        onConfirm={handleDeleteVehicle}
        onClose={() => setDeleteTarget(null)}
      />

      <MediaPicker
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        onPick={handleMediaPick}
        title={
          mediaPickerTarget === "primary" ? "Select Primary Vehicle Image" : "Select Gallery Image"
        }
      />
    </AdminLayout>
  );
}
