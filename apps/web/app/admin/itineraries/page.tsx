"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { SearchBar } from "@/components/admin/search-bar";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/common/button";

const mockItineraries = [
  { id: "1", packageName: "Kashmir Paradise Escape", dayNumber: 1, title: "Arrival in Srinagar & Dal Lake Shikara Ride", accommodation: "Luxury Houseboat", meals: "Dinner" },
  { id: "2", packageName: "Kashmir Paradise Escape", dayNumber: 2, title: "Srinagar to Gulmarg Gondola Ride Excursion", accommodation: "Gulmarg Alpine Resort", meals: "Breakfast & Dinner" },
  { id: "3", packageName: "Kerala Backwaters & Hills", dayNumber: 1, title: "Arrival in Cochin & Transfer to Munnar", accommodation: "Tea Valley Resort", meals: "Dinner" },
  { id: "4", packageName: "Kerala Backwaters & Hills", dayNumber: 2, title: "Munnar Sightseeing & Spice Plantation Tour", accommodation: "Tea Valley Resort", meals: "Breakfast" },
];

export default function AdminItinerariesPage() {
  const [search, setSearch] = useState("");

  const filteredData = mockItineraries.filter((i) =>
    i.packageName.toLowerCase().includes(search.toLowerCase()) || i.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Itineraries Management"
          description="Manage day-by-day itinerary schedules, activities, accommodations, and meal plans for tour packages."
          action={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Add Itinerary Day
            </Button>
          }
        />

        <SearchBar value={search} onChange={setSearch} placeholder="Search itineraries..." />

        <DataTable
          data={filteredData}
          keyExtractor={(row) => row.id}
          columns={[
            { header: "Package Name", cell: (row) => <span className="font-semibold text-foreground">{row.packageName}</span> },
            { header: "Day #", cell: (row) => <span className="font-mono font-medium">Day {row.dayNumber}</span> },
            { header: "Title & Highlights", accessorKey: "title" },
            { header: "Accommodation", accessorKey: "accommodation", className: "text-muted-foreground" },
            { header: "Meals Plan", accessorKey: "meals", className: "text-muted-foreground" },
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
