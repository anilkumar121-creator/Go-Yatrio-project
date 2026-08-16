"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2, Building2, Star, MapPin, X } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/select";
import { Card } from "@/components/common/card";

type DestinationOption = {
  id: string;
  name: string;
  country: string;
};

type RoomTypeForm = {
  id?: string;
  roomName: string;
  roomDescription: string;
  maxGuests: number;
  bedType: string;
  roomSize: string;
  priceFrom: number;
  active: boolean;
};

type HotelImageForm = {
  id?: string;
  imageUrl: string;
  altText: string;
  sortOrder: number;
};

type HotelItem = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  destinationId: string;
  destination?: { name: string };
  address: string;
  city: string;
  state: string | null;
  country: string;
  hotelCategory: "BUDGET" | "STANDARD" | "PREMIUM" | "LUXURY";
  starRating: number;
  featured: boolean;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  amenities: { id: string; name: string }[];
  roomTypes: RoomTypeForm[];
  images: HotelImageForm[];
  createdAt: string;
};

type HotelForm = {
  name: string;
  slug: string;
  destinationId: string;
  shortDescription: string;
  fullDescription: string;
  address: string;
  city: string;
  state: string;
  country: string;
  hotelCategory: "BUDGET" | "STANDARD" | "PREMIUM" | "LUXURY";
  starRating: number;
  featured: boolean;
  status: "DRAFT" | "ACTIVE" | "INACTIVE";
  amenities: string[];
  images: string;
  roomTypes: RoomTypeForm[];
};

const emptyForm: HotelForm = {
  name: "",
  slug: "",
  destinationId: "",
  shortDescription: "",
  fullDescription: "",
  address: "",
  city: "",
  state: "",
  country: "India",
  hotelCategory: "STANDARD",
  starRating: 3,
  featured: false,
  status: "DRAFT",
  amenities: ["Free High-Speed Wi-Fi", "Multi-Cuisine Restaurant", "24/7 Room Service"],
  images: "",
  roomTypes: [
    {
      roomName: "Deluxe AC Room",
      roomDescription: "Comfortable air-conditioned room with modern amenities.",
      maxGuests: 2,
      bedType: "King Bed",
      roomSize: "280 sq ft",
      priceFrom: 3500,
      active: true,
    },
  ],
};

const defaultAmenityOptions = [
  "Free High-Speed Wi-Fi",
  "Swimming Pool",
  "Ayurveda & Wellness Spa",
  "Multi-Cuisine Restaurant",
  "Fitness Center / Gym",
  "24/7 Room Service",
  "Free Airport Transfer",
  "Beach Access",
  "Valet Parking",
  "Conference & Event Hall",
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
export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState<HotelItem[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelItem | null>(null);
  const [form, setForm] = useState<HotelForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<HotelItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadDestinations = useCallback(async () => {
    try {
      const data = await apiFetch("/api/admin/destinations?take=100");
      setDestinations(data ?? []);
    } catch {
      // Fallback
    }
  }, []);

  const loadHotels = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams({ take: "100" });
      if (search) params.set("search", search);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);

      const data = await apiFetch(`/api/admin/hotels?${params.toString()}`);
      setHotels(data ?? []);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load hotels.");
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    loadDestinations();
  }, [loadDestinations]);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  const handleOpenCreate = () => {
    setEditingHotel(null);
    setForm({
      ...emptyForm,
      destinationId: destinations[0]?.id ?? "",
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (hotel: HotelItem) => {
    setEditingHotel(hotel);
    setForm({
      name: hotel.name,
      slug: hotel.slug,
      destinationId: hotel.destinationId,
      shortDescription: hotel.shortDescription,
      fullDescription: hotel.fullDescription,
      address: hotel.address,
      city: hotel.city,
      state: hotel.state ?? "",
      country: hotel.country,
      hotelCategory: hotel.hotelCategory,
      starRating: hotel.starRating,
      featured: hotel.featured,
      status: hotel.status,
      amenities: hotel.amenities.map((a) => a.name),
      images: hotel.images.map((i) => i.imageUrl).join("\n"),
      roomTypes: hotel.roomTypes.map((r) => ({
        id: r.id,
        roomName: r.roomName,
        roomDescription: r.roomDescription,
        maxGuests: r.maxGuests,
        bedType: r.bedType,
        roomSize: r.roomSize ?? "",
        priceFrom: Number(r.priceFrom),
        active: r.active,
      })),
    });
    setFormError(null);
    setFormOpen(true);
  };
  const handleToggleAmenity = (name: string) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(name)
        ? prev.amenities.filter((a) => a !== name)
        : [...prev.amenities, name],
    }));
  };

  const handleAddRoomType = () => {
    setForm((prev) => ({
      ...prev,
      roomTypes: [
        ...prev.roomTypes,
        {
          roomName: "Executive Suite",
          roomDescription: "Spacious suite with king bed and seating area.",
          maxGuests: 2,
          bedType: "King Bed",
          roomSize: "350 sq ft",
          priceFrom: 5000,
          active: true,
        },
      ],
    }));
  };

  const handleRemoveRoomType = (index: number) => {
    setForm((prev) => ({
      ...prev,
      roomTypes: prev.roomTypes.filter((_, idx) => idx !== index),
    }));
  };

  const handleRoomChange = (index: number, field: keyof RoomTypeForm, value: unknown) => {
    setForm((prev) => {
      const updatedRooms = [...prev.roomTypes];
      updatedRooms[index] = { ...updatedRooms[index], [field]: value };
      return { ...prev, roomTypes: updatedRooms };
    });
  };

  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim() || !form.destinationId || !form.address || !form.city) {
      setFormError("Hotel Name, Destination, City, and Address are required.");
      return;
    }

    setSaving(true);

    try {
      const imageList = form.images
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0)
        .map((imageUrl, sortOrder) => ({ imageUrl, altText: form.name, sortOrder: sortOrder + 1 }));

      const payload = {
        name: form.name,
        slug: form.slug.trim() || undefined,
        destinationId: form.destinationId,
        shortDescription: form.shortDescription,
        fullDescription: form.fullDescription,
        address: form.address,
        city: form.city,
        state: form.state || undefined,
        country: form.country || "India",
        hotelCategory: form.hotelCategory,
        starRating: form.starRating,
        featured: form.featured,
        status: form.status,
        amenities: form.amenities,
        images: imageList,
        roomTypes: form.roomTypes,
      };

      if (editingHotel) {
        await apiFetch(`/api/admin/hotels/${editingHotel.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/admin/hotels", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setFormOpen(false);
      await loadHotels();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save hotel.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteHotel = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await apiFetch(`/api/admin/hotels/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setDeleteTarget(null);
      await loadHotels();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete hotel.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (hotel: HotelItem, newStatus: "ACTIVE" | "INACTIVE" | "DRAFT") => {
    try {
      await apiFetch(`/api/admin/hotels/${hotel.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await loadHotels();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    }
  };
  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Hotel Inventory & Booking Management"
          description="Manage partner hotels, room categories, pricing, amenities, gallery images, and status."
          action={
            <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
              <Plus className="size-4" />
              Add New Hotel
            </Button>
          }
        />

        {errorMessage ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search hotels, cities, destinations..." />
          <div className="flex items-center gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="BUDGET">Budget</SelectItem>
                <SelectItem value="STANDARD">Standard</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
                <SelectItem value="LUXURY">Luxury</SelectItem>
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
        ) : hotels.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No hotels found"
            description="Add your first partner hotel to manage rooms, amenities, and inquiries."
            actionLabel="Add New Hotel"
            onAction={handleOpenCreate}
          />
        ) : (
          <DataTable
            data={hotels}
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "Hotel Name",
                cell: (row) => (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{row.name}</span>
                      {row.featured ? <Badge variant="accent">Featured</Badge> : null}
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3 text-primary" />
                      {row.city}, {row.destination?.name ?? "India"}
                    </span>
                  </div>
                ),
              },
              {
                header: "Category & Rating",
                cell: (row) => (
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">
                      {row.hotelCategory}
                    </Badge>
                    <div className="flex items-center text-amber-500 text-xs">
                      {Array.from({ length: row.starRating }).map((_, idx) => (
                        <Star key={idx} className="size-3 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                header: "Price From",
                cell: (row) => {
                  const minPrice = row.roomTypes[0]?.priceFrom ?? 0;
                  return minPrice ? <Price amount={Number(minPrice)} size="sm" /> : <span className="text-xs text-muted-foreground">N/A</span>;
                },
              },
              {
                header: "Status",
                cell: (row) => (
                  <Select
                    value={row.status}
                    onValueChange={(val) => handleToggleStatus(row, val as "ACTIVE" | "INACTIVE" | "DRAFT")}
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
                      title="Edit Hotel"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(row)}
                      title="Delete Hotel"
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
      {/* Hotel Create / Edit Dialog */}
      <DialogPrimitive.Root open={formOpen} onOpenChange={setFormOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed inset-x-4 top-10 z-50 max-h-[88vh] w-full max-w-4xl translate-x-0 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-2xl mx-auto my-auto inset-y-0">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <DialogPrimitive.Title className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Building2 className="size-5 text-primary" />
                  {editingHotel ? "Edit Hotel Details" : "Create New Partner Hotel"}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-xs text-muted-foreground">
                  Configure hotel profile, address, star rating, room types, amenities, and gallery images.
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

            <form onSubmit={handleSaveHotel} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hotel-name">Hotel Name *</Label>
                  <Input
                    id="hotel-name"
                    required
                    maxLength={140}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Tea Valley Resort"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hotel-dest">Destination *</Label>
                  <Select
                    value={form.destinationId}
                    onValueChange={(value) => setForm({ ...form, destinationId: value })}
                  >
                    <SelectTrigger id="hotel-dest">
                      <SelectValue placeholder="Select Destination" />
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
                  <Label htmlFor="hotel-category">Hotel Category *</Label>
                  <Select
                    value={form.hotelCategory}
                    onValueChange={(val) =>
                      setForm({ ...form, hotelCategory: val as "BUDGET" | "STANDARD" | "PREMIUM" | "LUXURY" })
                    }
                  >
                    <SelectTrigger id="hotel-category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUDGET">Budget</SelectItem>
                      <SelectItem value="STANDARD">Standard</SelectItem>
                      <SelectItem value="PREMIUM">Premium</SelectItem>
                      <SelectItem value="LUXURY">Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hotel-star">Star Rating *</Label>
                  <Select
                    value={String(form.starRating)}
                    onValueChange={(val) => setForm({ ...form, starRating: Number(val) })}
                  >
                    <SelectTrigger id="hotel-star">
                      <SelectValue placeholder="Star Rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Star</SelectItem>
                      <SelectItem value="2">2 Star</SelectItem>
                      <SelectItem value="3">3 Star</SelectItem>
                      <SelectItem value="4">4 Star</SelectItem>
                      <SelectItem value="5">5 Star Luxury</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hotel-city">City *</Label>
                  <Input
                    id="hotel-city"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Munnar / Goa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hotel-address">Full Address *</Label>
                  <Input
                    id="hotel-address"
                    required
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Street, Landmark, Pin Code"
                  />
                </div>
                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="hotel-short">Short Description *</Label>
                  <Textarea
                    id="hotel-short"
                    required
                    maxLength={300}
                    rows={2}
                    value={form.shortDescription}
                    onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                    placeholder="Summary for hotel card listing..."
                  />
                </div>

                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="hotel-full">Full Hotel Overview *</Label>
                  <Textarea
                    id="hotel-full"
                    required
                    rows={4}
                    value={form.fullDescription}
                    onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                    placeholder="Detailed hotel overview, ambience, dining, location..."
                  />
                </div>

                {/* Amenities Selection */}
                <div className="space-y-2 tablet:col-span-2 border-t border-border pt-4">
                  <Label className="font-semibold">Hotel Amenities</Label>
                  <div className="grid grid-cols-2 gap-2 tablet:grid-cols-3">
                    {defaultAmenityOptions.map((am) => (
                      <label key={am} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
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

                {/* Room Types Builder */}
                <div className="space-y-4 tablet:col-span-2 border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-semibold text-base">Room Categories ({form.roomTypes.length})</Label>
                    <Button type="button" size="sm" variant="outline" onClick={handleAddRoomType} className="gap-1">
                      <Plus className="size-3.5" />
                      Add Room Category
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {form.roomTypes.map((room, roomIdx) => (
                      <Card key={roomIdx} className="p-4 border border-border bg-muted/20 relative">
                        <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
                          <span className="text-xs font-bold text-primary font-mono">Room Category #{roomIdx + 1}</span>
                          {form.roomTypes.length > 1 ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveRoomType(roomIdx)}
                            >
                              <X className="size-3.5" />
                            </Button>
                          ) : null}
                        </div>

                        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-3">
                          <div className="space-y-1 tablet:col-span-2">
                            <Label className="text-xs">Room Name *</Label>
                            <Input
                              value={room.roomName}
                              onChange={(e) => handleRoomChange(roomIdx, "roomName", e.target.value)}
                              placeholder="e.g. Executive Cottage"
                              className="h-8 text-xs"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Price From (₹/night) *</Label>
                            <Input
                              type="number"
                              value={room.priceFrom}
                              onChange={(e) => handleRoomChange(roomIdx, "priceFrom", Number(e.target.value))}
                              className="h-8 text-xs font-mono"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Bed Type</Label>
                            <Input
                              value={room.bedType}
                              onChange={(e) => handleRoomChange(roomIdx, "bedType", e.target.value)}
                              placeholder="e.g. King Bed"
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Max Guests</Label>
                            <Input
                              type="number"
                              value={room.maxGuests}
                              onChange={(e) => handleRoomChange(roomIdx, "maxGuests", Number(e.target.value))}
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs">Room Size</Label>
                            <Input
                              value={room.roomSize}
                              onChange={(e) => handleRoomChange(roomIdx, "roomSize", e.target.value)}
                              placeholder="e.g. 380 sq ft"
                              className="h-8 text-xs"
                            />
                          </div>

                          <div className="space-y-1 tablet:col-span-3">
                            <Label className="text-xs">Room Description</Label>
                            <Input
                              value={room.roomDescription}
                              onChange={(e) => handleRoomChange(roomIdx, "roomDescription", e.target.value)}
                              placeholder="Short room highlights..."
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
                {/* Gallery Images */}
                <div className="space-y-2 tablet:col-span-2 border-t border-border pt-4">
                  <Label htmlFor="hotel-images">Gallery Images (One URL per line)</Label>
                  <Textarea
                    id="hotel-images"
                    rows={3}
                    value={form.images}
                    onChange={(e) => setForm({ ...form, images: e.target.value })}
                    placeholder={"https://images.unsplash.com/...\nhttps://images.unsplash.com/..."}
                  />
                </div>

                <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-3 tablet:col-span-2">
                  <Switch
                    checked={form.featured}
                    onCheckedChange={(checked) => setForm({ ...form, featured: checked })}
                    aria-label="Featured hotel"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">Featured Hotel</p>
                    <p className="text-xs text-muted-foreground">
                      Featured hotels appear on top hotel listings and homepage highlights.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "Saving Hotel..." : editingHotel ? "Save Changes" : "Create Partner Hotel"}
                </Button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Hotel"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        isDestructive
        onConfirm={handleDeleteHotel}
        onClose={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
