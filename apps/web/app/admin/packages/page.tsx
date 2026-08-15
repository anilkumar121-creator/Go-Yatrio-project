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
import { Price } from "@/components/common/price";

const mockPackages = [
  { id: "1", title: "Kashmir Paradise Escape", destination: "Srinagar & Gulmarg", duration: "5N / 6D", price: 18999, type: "DOMESTIC", status: "Active" },
  { id: "2", title: "Kerala Backwaters & Hills", destination: "Munnar & Alleppey", duration: "4N / 5D", price: 15499, type: "DOMESTIC", status: "Active" },
  { id: "3", title: "Royal Rajasthan Heritage", destination: "Jaipur & Udaipur", duration: "6N / 7D", price: 22500, type: "LUXURY", status: "Active" },
  { id: "4", title: "Goa Beach & Sun Holiday", destination: "North & South Goa", duration: "3N / 4D", price: 11999, type: "DOMESTIC", status: "Active" },
  { id: "5", title: "Odisha Golden Triangle & Culture", destination: "Puri & Konark", duration: "5N / 6D", price: 14999, type: "PILGRIMAGE", status: "Active" },
  { id: "6", title: "Andaman Island Paradise", destination: "Port Blair & Havelock", duration: "5N / 6D", price: 26999, type: "LUXURY", status: "Active" },
];

export default function AdminPackagesPage() {
  const [search, setSearch] = useState("");
  const [packageType, setPackageType] = useState("all");

  const filteredData = mockPackages.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) || p.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Tour Packages Management"
          description="Create and update all-inclusive travel packages, pricing, durations, and itineraries."
          action={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Add Tour Package
            </Button>
          }
        />

        <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search packages..." />
          <FilterBar
            filters={[
              {
                id: "type",
                label: "Package Type",
                value: packageType,
                onChange: setPackageType,
                options: [
                  { label: "All Types", value: "all" },
                  { label: "Domestic", value: "domestic" },
                  { label: "Luxury", value: "luxury" },
                  { label: "Pilgrimage", value: "pilgrimage" },
                ],
              },
            ]}
            onReset={() => {
              setSearch("");
              setPackageType("all");
            }}
          />
        </div>

        <DataTable
          data={filteredData}
          keyExtractor={(row) => row.id}
          columns={[
            { header: "Package Title", cell: (row) => <span className="font-semibold text-foreground">{row.title}</span> },
            { header: "Destination", accessorKey: "destination" },
            { header: "Duration", accessorKey: "duration", className: "text-muted-foreground" },
            { header: "Starting Price", cell: (row) => <Price amount={row.price} size="sm" /> },
            { header: "Category", cell: (row) => <Badge variant="outline">{row.type}</Badge> },
            {
              header: "Actions",
              cell: () => (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                    <Edit className="size-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </AdminLayout>
  );
}
