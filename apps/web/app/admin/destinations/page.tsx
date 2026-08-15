"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { SearchBar } from "@/components/admin/search-bar";
import { FilterBar } from "@/components/admin/filter-bar";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";

const mockDestinations = [
  { id: "1", name: "Kashmir", slug: "kashmir", state: "Jammu & Kashmir", country: "India", packagesCount: 12, isFeatured: true, status: "Active" },
  { id: "2", name: "Goa", slug: "goa", state: "Goa", country: "India", packagesCount: 8, isFeatured: true, status: "Active" },
  { id: "3", name: "Kerala", slug: "kerala", state: "Kerala", country: "India", packagesCount: 15, isFeatured: true, status: "Active" },
  { id: "4", name: "Rajasthan", slug: "rajasthan", state: "Rajasthan", country: "India", packagesCount: 10, isFeatured: true, status: "Active" },
  { id: "5", name: "Andaman", slug: "andaman", state: "Andaman & Nicobar", country: "India", packagesCount: 6, isFeatured: false, status: "Active" },
  { id: "6", name: "Odisha", slug: "odisha", state: "Odisha", country: "India", packagesCount: 7, isFeatured: true, status: "Active" },
];

export default function AdminDestinationsPage() {
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("all");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDest, setSelectedDest] = useState<string | null>(null);

  const filteredData = mockDestinations.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Destinations Management"
          description="Manage travel destinations, location details, featured status, and SEO metadata."
          action={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Add Destination
            </Button>
          }
        />

        <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search destinations..." />
          <FilterBar
            filters={[
              {
                id: "status",
                label: "Status",
                value: filterState,
                onChange: setFilterState,
                options: [
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ],
              },
            ]}
            onReset={() => {
              setSearch("");
              setFilterState("all");
            }}
          />
        </div>

        <DataTable
          data={filteredData}
          keyExtractor={(row) => row.id}
          columns={[
            { header: "Name", cell: (row) => <span className="font-semibold text-foreground">{row.name}</span> },
            { header: "Slug", accessorKey: "slug", className: "font-mono text-xs text-muted-foreground" },
            { header: "State / Region", accessorKey: "state" },
            { header: "Packages", cell: (row) => <span>{row.packagesCount} Active</span> },
            {
              header: "Featured",
              cell: (row) => (
                <Badge variant={row.isFeatured ? "accent" : "outline"}>
                  {row.isFeatured ? "Featured" : "Standard"}
                </Badge>
              ),
            },
            {
              header: "Actions",
              cell: (row) => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                    <Edit className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setSelectedDest(row.name);
                      setDeleteModalOpen(true);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ),
            },
          ]}
        />

        <ConfirmationModal
          isOpen={deleteModalOpen}
          title="Delete Destination"
          description={`Are you sure you want to delete ${selectedDest || "this destination"}? This action cannot be undone.`}
          confirmLabel="Delete"
          isDestructive
          onConfirm={() => setDeleteModalOpen(false)}
          onClose={() => setDeleteModalOpen(false)}
        />
      </div>
    </AdminLayout>
  );
}
