"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2, ListChecks, X, ChevronUp, ChevronDown } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select";

type LookupGroup = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { items: number };
};

type LookupItem = {
  id: string;
  groupId: string;
  label: string;
  value: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  group?: { id: string; key: string; name: string } | null;
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
const emptyGroupForm = { key: "", name: "", description: "" };
const emptyItemForm = {
  groupId: "",
  label: "",
  value: "",
  description: "",
  icon: "",
  color: "",
  sortOrder: 0,
  isActive: true,
};

export default function AdminLookupsPage() {
  const [tab, setTab] = useState<"groups" | "items">("groups");
  const [groups, setGroups] = useState<LookupGroup[]>([]);
  const [items, setItems] = useState<LookupItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  const [groupFormOpen, setGroupFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<LookupGroup | null>(null);
  const [groupForm, setGroupForm] = useState(emptyGroupForm);
  const [savingGroup, setSavingGroup] = useState(false);

  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LookupItem | null>(null);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [savingItem, setSavingItem] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    label: string;
    kind: "group" | "item";
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadGroups = useCallback(async (q: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await apiFetch(`/api/admin/lookups/groups?${q}`);
      setGroups(data ?? []);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load lookup groups.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadItems = useCallback(async (q: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await apiFetch(`/api/admin/lookups/items?${q}`);
      setItems(data ?? []);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load lookup items.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "groups") {
      const params = new URLSearchParams({ take: "200" });
      if (search) params.set("search", search);
      loadGroups(params.toString());
    } else {
      const params = new URLSearchParams({ take: "500" });
      if (search) params.set("search", search);
      if (groupFilter !== "all") params.set("groupId", groupFilter);
      if (activeFilter !== "all") params.set("isActive", activeFilter);
      loadItems(params.toString());
    }
  }, [tab, search, groupFilter, activeFilter, loadGroups, loadItems]);

  const openCreateGroup = () => {
    setEditingGroup(null);
    setGroupForm(emptyGroupForm);
    setGroupFormOpen(true);
  };

  const openEditGroup = (group: LookupGroup) => {
    setEditingGroup(group);
    setGroupForm({ key: group.key, name: group.name, description: group.description ?? "" });
    setGroupFormOpen(true);
  };

  const saveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGroup(true);
    setErrorMessage(null);
    try {
      const payload = {
        key: groupForm.key,
        name: groupForm.name,
        description: groupForm.description || undefined,
      };
      if (editingGroup) {
        await apiFetch(`/api/admin/lookups/groups/${editingGroup.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/admin/lookups/groups", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setGroupFormOpen(false);
      await loadGroups(new URLSearchParams({ take: "200" }).toString());
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save group.");
    } finally {
      setSavingGroup(false);
    }
  };

  const openCreateItem = () => {
    setEditingItem(null);
    setItemForm({
      ...emptyItemForm,
      groupId: groupFilter !== "all" ? groupFilter : (groups[0]?.id ?? ""),
    });
    setItemFormOpen(true);
  };

  const openEditItem = (item: LookupItem) => {
    setEditingItem(item);
    setItemForm({
      groupId: item.groupId,
      label: item.label,
      value: item.value,
      description: item.description ?? "",
      icon: item.icon ?? "",
      color: item.color ?? "",
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setItemFormOpen(true);
  };

  const saveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingItem(true);
    setErrorMessage(null);
    try {
      const payload = {
        groupId: itemForm.groupId,
        label: itemForm.label,
        value: itemForm.value,
        description: itemForm.description || undefined,
        icon: itemForm.icon || undefined,
        color: itemForm.color || undefined,
        sortOrder: itemForm.sortOrder,
        isActive: itemForm.isActive,
      };
      if (editingItem) {
        await apiFetch(`/api/admin/lookups/items/${editingItem.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/admin/lookups/items", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setItemFormOpen(false);
      const params = new URLSearchParams({ take: "500" });
      if (groupFilter !== "all") params.set("groupId", groupFilter);
      await loadItems(params.toString());
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save item.");
    } finally {
      setSavingItem(false);
    }
  };

  const toggleItemStatus = async (item: LookupItem) => {
    try {
      await apiFetch(`/api/admin/lookups/items/${item.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      const params = new URLSearchParams({ take: "500" });
      if (groupFilter !== "all") params.set("groupId", groupFilter);
      await loadItems(params.toString());
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const moveItem = async (item: LookupItem, direction: "up" | "down") => {
    const sorted = [...items].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((i) => i.id === item.id);
    const target = direction === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= sorted.length) return;
    const swapWith = sorted[target];
    try {
      await apiFetch(`/api/admin/lookups/items/${item.id}/order`, {
        method: "PATCH",
        body: JSON.stringify({ sortOrder: swapWith.sortOrder }),
      });
      await apiFetch(`/api/admin/lookups/items/${swapWith.id}/order`, {
        method: "PATCH",
        body: JSON.stringify({ sortOrder: item.sortOrder }),
      });
      const params = new URLSearchParams({ take: "500" });
      if (groupFilter !== "all") params.set("groupId", groupFilter);
      await loadItems(params.toString());
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to reorder.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(
        deleteTarget.kind === "group"
          ? `/api/admin/lookups/groups/${deleteTarget.id}`
          : `/api/admin/lookups/items/${deleteTarget.id}`,
        { method: "DELETE" },
      );
      setDeleteTarget(null);
      if (deleteTarget.kind === "group") {
        await loadGroups(new URLSearchParams({ take: "200" }).toString());
      } else {
        const params = new URLSearchParams({ take: "500" });
        if (groupFilter !== "all") params.set("groupId", groupFilter);
        await loadItems(params.toString());
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };
  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Lookup Tables & Configuration"
          description="Manage configurable option lists across the platform without code changes."
          action={
            <Button
              size="sm"
              className="gap-1.5"
              onClick={tab === "groups" ? openCreateGroup : openCreateItem}
            >
              <Plus className="size-4" />
              {tab === "groups" ? "New Group" : "New Item"}
            </Button>
          }
        />

        {errorMessage ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("groups")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === "groups" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              Groups
            </button>
            <button
              type="button"
              onClick={() => setTab("items")}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${tab === "items" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              Items
            </button>
          </div>

          <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={tab === "groups" ? "Search groups..." : "Search items..."}
            />
            {tab === "items" ? (
              <>
                <Select value={groupFilter} onValueChange={setGroupFilter}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Groups</SelectItem>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </>
            ) : null}
          </div>
        </div>

        {isLoading ? (
          <LoadingState rows={6} />
        ) : tab === "groups" ? (
          groups.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No lookup groups"
              description="Create your first lookup group."
              actionLabel="New Group"
              onAction={openCreateGroup}
            />
          ) : (
            <DataTable
              data={groups}
              keyExtractor={(row) => row.id}
              columns={[
                {
                  header: "Key",
                  cell: (row) => (
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {row.key}
                    </span>
                  ),
                },
                {
                  header: "Name",
                  cell: (row) => <span className="font-medium text-foreground">{row.name}</span>,
                },
                {
                  header: "Description",
                  cell: (row) => (
                    <span className="text-xs text-muted-foreground">{row.description ?? "—"}</span>
                  ),
                },
                {
                  header: "Items",
                  cell: (row) => (
                    <Badge variant="outline" className="text-[11px]">
                      {row._count?.items ?? 0}
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
                        className="h-8 w-8 p-0"
                        onClick={() => openEditGroup(row)}
                        title="Edit"
                      >
                        <Edit className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setDeleteTarget({ id: row.id, label: row.name, kind: "group" })
                        }
                        title="Delete"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ),
                },
              ]}
            />
          )
        ) : items.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No lookup items"
            description="Create your first lookup item."
            actionLabel="New Item"
            onAction={openCreateItem}
          />
        ) : (
          <DataTable
            data={items}
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "Label",
                cell: (row) => <span className="font-medium text-foreground">{row.label}</span>,
              },
              {
                header: "Value",
                cell: (row) => (
                  <span className="font-mono text-xs text-muted-foreground">{row.value}</span>
                ),
              },
              {
                header: "Group",
                cell: (row) => (
                  <Badge variant="secondary" className="text-[11px]">
                    {row.group?.name ?? row.groupId}
                  </Badge>
                ),
              },
              {
                header: "Order",
                cell: (row) => (
                  <span className="font-mono text-xs text-muted-foreground">{row.sortOrder}</span>
                ),
              },
              {
                header: "Icon / Color",
                cell: (row) => (
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {row.icon ?? row.color ?? "—"}
                  </span>
                ),
              },
              {
                header: "Status",
                cell: (row) => (
                  <Switch
                    checked={row.isActive}
                    onCheckedChange={() => toggleItemStatus(row)}
                    aria-label="Active"
                  />
                ),
              },
              {
                header: "Sort",
                cell: (row) => (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => moveItem(row, "up")}
                      title="Move Up"
                    >
                      <ChevronUp className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => moveItem(row, "down")}
                      title="Move Down"
                    >
                      <ChevronDown className="size-3.5" />
                    </Button>
                  </div>
                ),
              },
              {
                header: "Actions",
                cell: (row) => (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openEditItem(row)}
                      title="Edit"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() =>
                        setDeleteTarget({ id: row.id, label: row.label, kind: "item" })
                      }
                      title="Delete"
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
      {/* Group Dialog */}
      <DialogPrimitive.Root open={groupFormOpen} onOpenChange={setGroupFormOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed inset-x-4 top-24 z-50 m-auto w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                {editingGroup ? "Edit Group" : "Create Group"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close className="rounded-sm opacity-70 hover:opacity-100">
                <X className="size-5 text-muted-foreground" />
              </DialogPrimitive.Close>
            </div>
            <form onSubmit={saveGroup} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Key *</Label>
                <Input
                  required
                  maxLength={80}
                  value={groupForm.key}
                  onChange={(e) =>
                    setGroupForm({ ...groupForm, key: e.target.value.toUpperCase() })
                  }
                  placeholder="PACKAGE_TYPE"
                  className="font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Name *</Label>
                <Input
                  required
                  maxLength={140}
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  placeholder="Package Types"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea
                  rows={2}
                  maxLength={500}
                  value={groupForm.description}
                  onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGroupFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={savingGroup}>
                  {savingGroup ? "Saving..." : "Save Group"}
                </Button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Item Dialog */}
      <DialogPrimitive.Root open={itemFormOpen} onOpenChange={setItemFormOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed inset-x-4 top-24 z-50 m-auto w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <DialogPrimitive.Title className="text-lg font-semibold text-foreground">
                {editingItem ? "Edit Item" : "Create Item"}
              </DialogPrimitive.Title>
              <DialogPrimitive.Close className="rounded-sm opacity-70 hover:opacity-100">
                <X className="size-5 text-muted-foreground" />
              </DialogPrimitive.Close>
            </div>
            <form onSubmit={saveItem} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Group *</Label>
                <Select
                  value={itemForm.groupId}
                  onValueChange={(value) => setItemForm({ ...itemForm, groupId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Label *</Label>
                  <Input
                    required
                    maxLength={140}
                    value={itemForm.label}
                    onChange={(e) => setItemForm({ ...itemForm, label: e.target.value })}
                    placeholder="Luxury"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Value *</Label>
                  <Input
                    required
                    maxLength={140}
                    value={itemForm.value}
                    onChange={(e) => setItemForm({ ...itemForm, value: e.target.value })}
                    placeholder="LUXURY"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea
                  rows={2}
                  maxLength={500}
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Icon</Label>
                  <Input
                    maxLength={60}
                    value={itemForm.icon}
                    onChange={(e) => setItemForm({ ...itemForm, icon: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Color</Label>
                  <Input
                    maxLength={40}
                    value={itemForm.color}
                    onChange={(e) => setItemForm({ ...itemForm, color: e.target.value })}
                    placeholder="#ff0000"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 items-end gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Sort Order</Label>
                  <Input
                    type="number"
                    min={0}
                    value={itemForm.sortOrder}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, sortOrder: Number(e.target.value) })
                    }
                  />
                </div>
                <label className="flex items-center gap-2 pb-1 text-xs text-foreground">
                  <Switch
                    checked={itemForm.isActive}
                    onCheckedChange={(checked) => setItemForm({ ...itemForm, isActive: checked })}
                    aria-label="Active"
                  />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setItemFormOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={savingItem}>
                  {savingItem ? "Saving..." : "Save Item"}
                </Button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.kind === "group" ? "Delete Group" : "Delete Item"}
        description={`Are you sure you want to delete "${deleteTarget?.label}"?`}
        confirmLabel={deleting ? "Deleting..." : "Delete"}
        isDestructive
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
