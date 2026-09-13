"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { Button } from "@/components/common/button";
import { Input } from "@/components/common/input";
import { Label } from "@/components/common/label";
import { Switch } from "@/components/common/switch";
import { Badge } from "@/components/common/badge";

type State = {
  id: string;
  name: string;
  code: string | null;
  isActive: boolean;
};

type City = {
  id: string;
  stateId: string;
  name: string;
  isActive: boolean;
  state?: State;
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

export default function AdminGeographyPage() {
  const [activeTab, setActiveTab] = useState<"states" | "cities">("states");

  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: "state" | "city";
    id: string | null;
  }>({
    isOpen: false,
    type: "state",
    id: null,
  });

  // Forms
  const [stateForm, setStateForm] = useState({ id: "", name: "", code: "", isActive: true });
  const [cityForm, setCityForm] = useState({ id: "", stateId: "", name: "", isActive: true });

  const loadStates = useCallback(async () => {
    try {
      const data = await apiFetch("/api/locations/states");
      setStates(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const loadCities = useCallback(async () => {
    try {
      const data = await apiFetch("/api/locations/cities");
      setCities(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadStates(), loadCities()]).finally(() => setLoading(false));
  }, [loadStates, loadCities]);

  // State actions
  const handleSaveState = async () => {
    try {
      if (stateForm.id) {
        await apiFetch(`/api/admin/locations/states/${stateForm.id}`, {
          method: "PUT",
          body: JSON.stringify(stateForm),
        });
      } else {
        await apiFetch(`/api/admin/locations/states`, {
          method: "POST",
          body: JSON.stringify(stateForm),
        });
      }
      setIsStateModalOpen(false);
      loadStates();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteState = async () => {
    if (!deleteModal.id) return;
    try {
      await apiFetch(`/api/admin/locations/states/${deleteModal.id}`, { method: "DELETE" });
      setDeleteModal({ isOpen: false, type: "state", id: null });
      loadStates();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message);
    }
  };

  // City actions
  const handleSaveCity = async () => {
    try {
      if (cityForm.id) {
        await apiFetch(`/api/admin/locations/cities/${cityForm.id}`, {
          method: "PUT",
          body: JSON.stringify(cityForm),
        });
      } else {
        await apiFetch(`/api/admin/locations/cities`, {
          method: "POST",
          body: JSON.stringify(cityForm),
        });
      }
      setIsCityModalOpen(false);
      loadCities();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleDeleteCity = async () => {
    if (!deleteModal.id) return;
    try {
      await apiFetch(`/api/admin/locations/cities/${deleteModal.id}`, { method: "DELETE" });
      setDeleteModal({ isOpen: false, type: "city", id: null });
      loadCities();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Geography Management"
        description="Manage states and operational cities for cab bookings."
      />

      <div className="flex items-center gap-2 mb-6">
        <Button
          onClick={() => {
            setStateForm({ id: "", name: "", code: "", isActive: true });
            setIsStateModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add State
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setCityForm({ id: "", stateId: "", name: "", isActive: true });
            setIsCityModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add City
        </Button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          className={`pb-2 px-4 ${activeTab === "states" ? "border-b-2 border-primary text-primary font-medium" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("states")}
        >
          States ({states.length})
        </button>
        <button
          className={`pb-2 px-4 ${activeTab === "cities" ? "border-b-2 border-primary text-primary font-medium" : "text-gray-500 hover:text-gray-700"}`}
          onClick={() => setActiveTab("cities")}
        >
          Cities ({cities.length})
        </button>
      </div>

      {!loading && activeTab === "states" && (
        <DataTable
          keyExtractor={(item) => item.id}
          columns={[
            { accessorKey: "name", header: "Name" },
            { accessorKey: "code", header: "Code" },
            {
              header: "Status",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cell: (item: any) => (
                <Badge variant={item.isActive ? "success" : "secondary"}>
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
              ),
            },
            {
              header: "Actions",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cell: (item: any) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setStateForm({
                        id: item.id,
                        name: item.name,
                        code: item.code || "",
                        isActive: item.isActive,
                      });
                      setIsStateModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteModal({ isOpen: true, type: "state", id: item.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={states}
        />
      )}

      {!loading && activeTab === "cities" && (
        <DataTable
          keyExtractor={(item) => item.id}
          columns={[
            { accessorKey: "name", header: "City Name" },
            {
              header: "State",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cell: (item: any) => item.state?.name || "-",
            },
            {
              header: "Status",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cell: (item: any) => (
                <Badge variant={item.isActive ? "success" : "secondary"}>
                  {item.isActive ? "Active" : "Inactive"}
                </Badge>
              ),
            },
            {
              header: "Actions",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              cell: (item: any) => (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCityForm({
                        id: item.id,
                        name: item.name,
                        stateId: item.stateId,
                        isActive: item.isActive,
                      });
                      setIsCityModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setDeleteModal({ isOpen: true, type: "city", id: item.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
          data={cities}
        />
      )}

      {/* State Modal */}
      <DialogPrimitive.Root open={isStateModalOpen} onOpenChange={setIsStateModalOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold mb-6">{stateForm.id ? "Edit State" : "Add State"}</h2>
            <div className="space-y-4">
              <div>
                <Label className="mb-1 block">Name</Label>
                <Input
                  value={stateForm.name}
                  onChange={(e) => setStateForm({ ...stateForm, name: e.target.value })}
                  placeholder="e.g. Gujarat"
                />
              </div>
              <div>
                <Label className="mb-1 block">Code (Optional)</Label>
                <Input
                  value={stateForm.code}
                  onChange={(e) => setStateForm({ ...stateForm, code: e.target.value })}
                  placeholder="e.g. GJ"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={stateForm.isActive}
                  onCheckedChange={(checked) => setStateForm({ ...stateForm, isActive: checked })}
                />
                <Label>Active Status</Label>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsStateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveState}>Save State</Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* City Modal */}
      <DialogPrimitive.Root open={isCityModalOpen} onOpenChange={setIsCityModalOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white p-6 shadow-xl border border-gray-100">
            <h2 className="text-xl font-bold mb-6">{cityForm.id ? "Edit City" : "Add City"}</h2>
            <div className="space-y-4">
              <div>
                <Label className="mb-1 block">State</Label>
                <select
                  className="w-full rounded-md border border-gray-300 p-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={cityForm.stateId}
                  onChange={(e) => setCityForm({ ...cityForm, stateId: e.target.value })}
                >
                  <option value="">Select a state</option>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="mb-1 block">City Name</Label>
                <Input
                  value={cityForm.name}
                  onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
                  placeholder="e.g. Ahmedabad"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={cityForm.isActive}
                  onCheckedChange={(checked) => setCityForm({ ...cityForm, isActive: checked })}
                />
                <Label>Active Status</Label>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCityModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCity}>Save City</Button>
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, type: "state", id: null })}
        onConfirm={deleteModal.type === "state" ? handleDeleteState : handleDeleteCity}
        title={`Delete ${deleteModal.type === "state" ? "State" : "City"}`}
        description={`Are you sure you want to delete this ${deleteModal.type}? This action cannot be undone.`}
      />
    </AdminLayout>
  );
}
