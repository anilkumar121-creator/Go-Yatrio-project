"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Calendar, Layers, X, Clock } from "lucide-react";
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
import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import { Label } from "@/components/common/label";
import { Switch } from "@/components/common/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/select";
import { Card } from "@/components/common/card";

type Activity = {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  timing?: string;
  sortOrder?: number;
};

type ItineraryDay = {
  id?: string;
  dayNumber: number;
  sortOrder: number;
  title: string;
  description: string;
  city?: string;
  hotel?: string;
  meals?: string;
  transfers?: string;
  notes?: string;
  activities: Activity[];
};

type TourPackageOption = {
  id: string;
  title: string;
  slug: string;
  durationDays: number;
};

type ItineraryItem = {
  id: string;
  packageId: string;
  title: string;
  slug: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  package?: TourPackageOption;
  days: ItineraryDay[];
  createdAt: string;
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

export default function AdminItinerariesPage() {
  const [itineraries, setItineraries] = useState<ItineraryItem[]>([]);
  const [packages, setPackages] = useState<TourPackageOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [packageFilter, setPackageFilter] = useState("all");

  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingItinerary, setEditingItinerary] = useState<ItineraryItem | null>(null);

  // Form states for builder
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [itineraryTitle, setItineraryTitle] = useState("");
  const [itineraryDescription, setItineraryDescription] = useState("");
  const [isDefault, setIsDefault] = useState(true);
  const [days, setDays] = useState<ItineraryDay[]>([]);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ItineraryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPackages = useCallback(async () => {
    try {
      const data = await apiFetch("/api/packages?take=100");
      setPackages(data ?? []);
    } catch {
      // Fallback
    }
  }, []);

  const loadItineraries = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams({ take: "100" });
      if (packageFilter !== "all") params.set("packageId", packageFilter);

      const data = await apiFetch(`/api/admin/itineraries?${params.toString()}`);
      setItineraries(data ?? []);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load itineraries.");
    } finally {
      setIsLoading(false);
    }
  }, [packageFilter]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  useEffect(() => {
    loadItineraries();
  }, [loadItineraries]);

  const handleOpenCreate = () => {
    setEditingItinerary(null);
    setSelectedPackageId(packages[0]?.id ?? "");
    setItineraryTitle("");
    setItineraryDescription("");
    setIsDefault(true);
    setDays([
      {
        dayNumber: 1,
        sortOrder: 1,
        title: "Day 1 Arrival & Check-in",
        description: "Arrive at destination, airport/railway station transfer, hotel check-in and leisure time.",
        city: "",
        hotel: "",
        meals: "Dinner",
        transfers: "Private Transfer",
        notes: "",
        activities: [{ title: "Welcome & Check-in", timing: "Afternoon" }],
      },
    ]);
    setFormError(null);
    setBuilderOpen(true);
  };

  const handleOpenEdit = (item: ItineraryItem) => {
    setEditingItinerary(item);
    setSelectedPackageId(item.packageId);
    setItineraryTitle(item.title);
    setItineraryDescription(item.description ?? "");
    setIsDefault(item.isDefault);
    setDays(
      item.days.map((d) => ({
        id: d.id,
        dayNumber: d.dayNumber,
        sortOrder: d.sortOrder,
        title: d.title,
        description: d.description,
        city: d.city ?? "",
        hotel: d.hotel ?? "",
        meals: d.meals ?? "",
        transfers: d.transfers ?? "",
        notes: d.notes ?? "",
        activities: d.activities ?? [],
      }))
    );
    setFormError(null);
    setBuilderOpen(true);
  };

  // Day operations in Builder
  const handleAddDay = () => {
    const nextDayNum = days.length + 1;
    setDays([
      ...days,
      {
        dayNumber: nextDayNum,
        sortOrder: nextDayNum,
        title: `Day ${nextDayNum} Sightseeing & Experience`,
        description: "",
        city: "",
        hotel: "",
        meals: "Breakfast & Dinner",
        transfers: "Private Cab",
        notes: "",
        activities: [],
      },
    ]);
  };

  const handleRemoveDay = (index: number) => {
    if (days.length <= 1) {
      setFormError("An itinerary must have at least 1 day.");
      return;
    }
    const updated = days.filter((_, idx) => idx !== index).map((d, idx) => ({
      ...d,
      dayNumber: idx + 1,
      sortOrder: idx + 1,
    }));
    setDays(updated);
  };

  const handleMoveDay = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === days.length - 1)) {
      return;
    }
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...days];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Recalculate dayNumbers
    const reordered = updated.map((d, idx) => ({
      ...d,
      dayNumber: idx + 1,
      sortOrder: idx + 1,
    }));
    setDays(reordered);
  };

  const handleDayChange = (index: number, field: keyof ItineraryDay, value: unknown) => {
    const updated = [...days];
    updated[index] = { ...updated[index], [field]: value };
    setDays(updated);
  };

  // Activity operations within a day
  const handleAddActivity = (dayIndex: number) => {
    const updated = [...days];
    const currentActivities = updated[dayIndex].activities ?? [];
    updated[dayIndex].activities = [
      ...currentActivities,
      { title: "", description: "", location: "", timing: "", sortOrder: currentActivities.length + 1 },
    ];
    setDays(updated);
  };

  const handleActivityChange = (
    dayIndex: number,
    activityIndex: number,
    field: keyof Activity,
    value: string
  ) => {
    const updated = [...days];
    const acts = [...updated[dayIndex].activities];
    acts[activityIndex] = { ...acts[activityIndex], [field]: value };
    updated[dayIndex].activities = acts;
    setDays(updated);
  };

  const handleRemoveActivity = (dayIndex: number, activityIndex: number) => {
    const updated = [...days];
    updated[dayIndex].activities = updated[dayIndex].activities.filter((_, idx) => idx !== activityIndex);
    setDays(updated);
  };

  const handleSaveItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedPackageId) {
      setFormError("Please select a target Tour Package.");
      return;
    }
    if (!itineraryTitle.trim()) {
      setFormError("Itinerary title is required.");
      return;
    }
    if (days.length === 0) {
      setFormError("At least 1 day is required in the itinerary.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        packageId: selectedPackageId,
        title: itineraryTitle,
        description: itineraryDescription,
        isDefault,
        days: days.map((d, idx) => ({
          dayNumber: idx + 1,
          sortOrder: idx + 1,
          title: d.title,
          description: d.description,
          city: d.city,
          hotel: d.hotel,
          meals: d.meals,
          transfers: d.transfers,
          notes: d.notes,
          activities: d.activities.filter((a) => a.title.trim().length > 0),
        })),
      };

      if (editingItinerary) {
        await apiFetch(`/api/admin/itineraries/${editingItinerary.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/admin/itineraries", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setBuilderOpen(false);
      await loadItineraries();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save itinerary.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItinerary = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await apiFetch(`/api/admin/itineraries/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setDeleteTarget(null);
      await loadItineraries();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete itinerary.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredItineraries = itineraries.filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase()) ||
    (i.package?.title ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Dynamic Itinerary Builder"
          description="Build, reorder, and configure multi-day tour itineraries, activities, hotels, and meal plans."
          action={
            <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
              <Plus className="size-4" />
              Build New Itinerary
            </Button>
          }
        />

        {errorMessage ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search itineraries or packages..." />
          <div className="w-full tablet:w-72">
            <Select value={packageFilter} onValueChange={setPackageFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <LoadingState rows={5} />
        ) : filteredItineraries.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No itineraries found"
            description="Create your first multi-day itinerary linked to a tour package."
            actionLabel="Build New Itinerary"
            onAction={handleOpenCreate}
          />
        ) : (
          <DataTable
            data={filteredItineraries}
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "Itinerary Title",
                cell: (row) => (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{row.title}</span>
                      {row.isDefault ? <Badge variant="accent">Default</Badge> : null}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">/{row.slug}</span>
                  </div>
                ),
              },
              {
                header: "Linked Package",
                cell: (row) => (
                  <span className="font-medium text-foreground">{row.package?.title ?? "N/A"}</span>
                ),
              },
              {
                header: "Total Days",
                cell: (row) => (
                  <Badge variant="outline" className="font-mono">
                    {row.days.length} Days
                  </Badge>
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
                      title="Edit Itinerary in Builder"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(row)}
                      title="Delete Itinerary"
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

      {/* Dynamic Itinerary Builder Dialog */}
      <DialogPrimitive.Root open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed inset-x-4 top-10 z-50 max-h-[88vh] w-full max-w-5xl translate-x-0 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-2xl mx-auto my-auto inset-y-0">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <DialogPrimitive.Title className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Layers className="size-5 text-primary" />
                  {editingItinerary ? "Edit Itinerary Schedule" : "Dynamic Itinerary Builder"}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-xs text-muted-foreground">
                  Configure day-by-day schedules, activities, hotel stays, meals, transfers, and custom notes.
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

            <form onSubmit={handleSaveItinerary} className="mt-6 space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="itinerary-package">Linked Tour Package *</Label>
                  <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                    <SelectTrigger id="itinerary-package">
                      <SelectValue placeholder="Select Tour Package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.title} ({pkg.durationDays} Days)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="itinerary-title">Itinerary Schedule Name *</Label>
                  <Input
                    id="itinerary-title"
                    required
                    maxLength={140}
                    value={itineraryTitle}
                    onChange={(e) => setItineraryTitle(e.target.value)}
                    placeholder="e.g. Standard 5-Day Heritage Schedule"
                  />
                </div>

                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="itinerary-desc">Itinerary Overview (Optional)</Label>
                  <Textarea
                    id="itinerary-desc"
                    rows={2}
                    value={itineraryDescription}
                    onChange={(e) => setItineraryDescription(e.target.value)}
                    placeholder="Brief description of this itinerary layout..."
                  />
                </div>

                <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 p-3 tablet:col-span-2">
                  <Switch checked={isDefault} onCheckedChange={setIsDefault} aria-label="Default itinerary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Default Package Itinerary</p>
                    <p className="text-xs text-muted-foreground">
                      When checked, this schedule will display by default on public package pages.
                    </p>
                  </div>
                </div>
              </div>

              {/* Days List Header */}
              <div className="flex items-center justify-between border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="size-5 text-primary" />
                  Day-by-Day Timeline ({days.length} Days)
                </h3>
                <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={handleAddDay}>
                  <Plus className="size-4" />
                  Add Day
                </Button>
              </div>

              {/* Days Timeline Builder */}
              <div className="space-y-6">
                {days.map((day, dayIdx) => (
                  <Card key={dayIdx} className="p-5 border border-border relative bg-card shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-primary px-3 py-1 text-xs font-bold text-white font-mono">
                          Day {day.dayNumber}
                        </span>
                        <Input
                          value={day.title}
                          onChange={(e) => handleDayChange(dayIdx, "title", e.target.value)}
                          placeholder="Day Title (e.g. Arrival & Local Sightseeing)"
                          className="font-semibold text-sm max-w-md h-8"
                          required
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          disabled={dayIdx === 0}
                          onClick={() => handleMoveDay(dayIdx, "up")}
                          title="Move Day Up"
                        >
                          <ArrowUp className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          disabled={dayIdx === days.length - 1}
                          onClick={() => handleMoveDay(dayIdx, "down")}
                          title="Move Day Down"
                        >
                          <ArrowDown className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveDay(dayIdx)}
                          title="Remove Day"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                      <div className="space-y-1.5 tablet:col-span-2">
                        <Label className="text-xs">Day Summary & Description *</Label>
                        <Textarea
                          rows={2}
                          value={day.description}
                          onChange={(e) => handleDayChange(dayIdx, "description", e.target.value)}
                          placeholder="Detailed itinerary overview for this day..."
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">City / Destination</Label>
                        <Input
                          value={day.city}
                          onChange={(e) => handleDayChange(dayIdx, "city", e.target.value)}
                          placeholder="e.g. Srinagar / Munnar"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Hotel / Overnight Stay</Label>
                        <Input
                          value={day.hotel}
                          onChange={(e) => handleDayChange(dayIdx, "hotel", e.target.value)}
                          placeholder="e.g. Tea Valley Resort / Deluxe Houseboat"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Meal Inclusions</Label>
                        <Input
                          value={day.meals}
                          onChange={(e) => handleDayChange(dayIdx, "meals", e.target.value)}
                          placeholder="e.g. Breakfast & Dinner"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs">Transfer / Vehicle Information</Label>
                        <Input
                          value={day.transfers}
                          onChange={(e) => handleDayChange(dayIdx, "transfers", e.target.value)}
                          placeholder="e.g. Private AC Sedan Transfer"
                          className="h-8 text-xs"
                        />
                      </div>

                      <div className="space-y-1.5 tablet:col-span-2">
                        <Label className="text-xs">Special Notes / Guidelines</Label>
                        <Input
                          value={day.notes}
                          onChange={(e) => handleDayChange(dayIdx, "notes", e.target.value)}
                          placeholder="e.g. Check-in at 2 PM; Carry woolens"
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>

                    {/* Day Activities List */}
                    <div className="mt-4 pt-3 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                          <Clock className="size-3.5 text-primary" />
                          Day Activities ({day.activities?.length ?? 0})
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-primary hover:text-primary/80 p-0"
                          onClick={() => handleAddActivity(dayIdx)}
                        >
                          <Plus className="size-3" />
                          Add Activity
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {day.activities?.map((act, actIdx) => (
                          <div
                            key={actIdx}
                            className="flex flex-col gap-2 tablet:flex-row tablet:items-center rounded-md border border-border bg-muted/20 p-2 text-xs"
                          >
                            <Input
                              value={act.title}
                              onChange={(e) => handleActivityChange(dayIdx, actIdx, "title", e.target.value)}
                              placeholder="Activity Title (e.g. Shikara Ride)"
                              className="h-7 text-xs flex-1"
                            />
                            <Input
                              value={act.timing ?? ""}
                              onChange={(e) => handleActivityChange(dayIdx, actIdx, "timing", e.target.value)}
                              placeholder="Timing (e.g. Morning / 5 PM)"
                              className="h-7 text-xs w-full tablet:w-36"
                            />
                            <Input
                              value={act.location ?? ""}
                              onChange={(e) => handleActivityChange(dayIdx, actIdx, "location", e.target.value)}
                              placeholder="Location (optional)"
                              className="h-7 text-xs w-full tablet:w-36"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 shrink-0"
                              onClick={() => handleRemoveActivity(dayIdx, actIdx)}
                            >
                              <X className="size-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Builder Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setBuilderOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "Saving Schedule..." : editingItinerary ? "Save Schedule Changes" : "Save Complete Itinerary"}
                </Button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Delete Itinerary"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        isDestructive
        onConfirm={handleDeleteItinerary}
        onClose={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
