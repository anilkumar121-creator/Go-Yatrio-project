"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { SearchBar } from "@/components/admin/search-bar";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/common/button";
import { Price } from "@/components/common/price";
import { Badge } from "@/components/common/badge";

const mockCabs = [
  { id: "1", vehicleName: "Toyota Innova Crysta", type: "SUV", capacity: "7 Passengers", pricePerKm: 18, dailyRate: 3500, status: "Available" },
  { id: "2", vehicleName: "Maruti Dzire Sedan", type: "SEDAN", capacity: "4 Passengers", pricePerKm: 12, dailyRate: 2200, status: "Available" },
  { id: "3", vehicleName: "Force Tempo Traveller 12 Seater", type: "TEMPO_TRAVELLER", capacity: "12 Passengers", pricePerKm: 26, dailyRate: 5500, status: "Available" },
  { id: "4", vehicleName: "Urbania Luxury Traveller 17 Seater", type: "LUXURY", capacity: "17 Passengers", pricePerKm: 34, dailyRate: 8500, status: "Available" },
];

export default function AdminCabsPage() {
  const [search, setSearch] = useState("");

  const filteredData = mockCabs.filter((c) =>
    c.vehicleName.toLowerCase().includes(search.toLowerCase()) || c.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Cab Fleet & Rentals"
          description="Manage vehicle inventory, seating capacities, per-kilometer pricing, and outstation rental rates."
          action={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Add Vehicle
            </Button>
          }
        />

        <SearchBar value={search} onChange={setSearch} placeholder="Search vehicles or types..." />

        <DataTable
          data={filteredData}
          keyExtractor={(row) => row.id}
          columns={[
            { header: "Vehicle Name", cell: (row) => <span className="font-semibold text-foreground">{row.vehicleName}</span> },
            { header: "Type", cell: (row) => <Badge variant="outline">{row.type}</Badge> },
            { header: "Capacity", accessorKey: "capacity", className: "text-muted-foreground" },
            { header: "Daily Rental From", cell: (row) => <Price amount={row.dailyRate} size="sm" /> },
            { header: "Status", cell: (row) => <Badge variant="accent">{row.status}</Badge> },
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
