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

const mockHotels = [
  { id: "1", name: "Kashmir Grand Palace Hotel", destination: "Srinagar", category: "5 Star Luxury", priceFrom: 8500, status: "Active" },
  { id: "2", name: "Alleppey Houseboat Retreat", destination: "Alleppey", category: "Boutique Resort", priceFrom: 6500, status: "Active" },
  { id: "3", name: "Jaipur Heritage Haveli", destination: "Jaipur", category: "Heritage 4 Star", priceFrom: 5200, status: "Active" },
  { id: "4", name: "Goa Beachfront Resort", destination: "Calangute, Goa", category: "4 Star Resort", priceFrom: 4800, status: "Active" },
];

export default function AdminHotelsPage() {
  const [search, setSearch] = useState("");

  const filteredData = mockHotels.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) || h.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Hotels & Accommodation"
          description="Manage partnered hotels, resorts, houseboats, star ratings, and seasonal night rates."
          action={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Add Hotel Property
            </Button>
          }
        />

        <SearchBar value={search} onChange={setSearch} placeholder="Search hotels or destinations..." />

        <DataTable
          data={filteredData}
          keyExtractor={(row) => row.id}
          columns={[
            { header: "Hotel Name", cell: (row) => <span className="font-semibold text-foreground">{row.name}</span> },
            { header: "Location", accessorKey: "destination" },
            { header: "Category", cell: (row) => <Badge variant="outline">{row.category}</Badge> },
            { header: "Nightly Rate From", cell: (row) => <Price amount={row.priceFrom} size="sm" /> },
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
