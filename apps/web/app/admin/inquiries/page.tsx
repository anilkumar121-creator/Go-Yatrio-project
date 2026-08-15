"use client";

import { useState } from "react";
import { Eye } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { SearchBar } from "@/components/admin/search-bar";
import { FilterBar } from "@/components/admin/filter-bar";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";

const mockInquiries = [
  { id: "INQ-1001", name: "Ananya Sharma", email: "ananya@example.com", phone: "+91 9876543210", service: "Tour Package (Kashmir)", travelers: "4 Travelers", date: "2026-08-14", status: "NEW" },
  { id: "INQ-1002", name: "Rahul Verma", email: "rahul@example.com", phone: "+91 9876543211", service: "Hotel Booking (Kerala)", travelers: "2 Couples", date: "2026-08-14", status: "CONTACTED" },
  { id: "INQ-1003", name: "Rajesh Mohanty", email: "rajesh@example.com", phone: "+91 9876543212", service: "Cab Booking (Tempo Traveller)", travelers: "12 Travelers", date: "2026-08-13", status: "IN_PROGRESS" },
  { id: "INQ-1004", name: "Priya Sundaram", email: "priya@example.com", phone: "+91 9876543213", service: "Tour Package (Rajasthan)", travelers: "2 Travelers", date: "2026-08-12", status: "CONVERTED" },
  { id: "INQ-1005", name: "Vikram Singh", email: "vikram@example.com", phone: "+91 9876543214", service: "Outstation Cab (Shimla)", travelers: "3 Travelers", date: "2026-08-11", status: "CLOSED" },
];

export default function AdminInquiriesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = mockInquiries.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) || i.service.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Customer Inquiries & Leads"
          description="Track incoming tour package inquiries, cab bookings, hotel quotes, and customer leads."
        />

        <div className="flex flex-col gap-4 tablet:flex-row tablet:items-center tablet:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search customer name or service..." />
          <FilterBar
            filters={[
              {
                id: "status",
                label: "Inquiry Status",
                value: statusFilter,
                onChange: setStatusFilter,
                options: [
                  { label: "All Inquiries", value: "all" },
                  { label: "New Leads", value: "new" },
                  { label: "Contacted", value: "contacted" },
                  { label: "Converted", value: "converted" },
                ],
              },
            ]}
            onReset={() => {
              setSearch("");
              setStatusFilter("all");
            }}
          />
        </div>

        <DataTable
          data={filteredData}
          keyExtractor={(row) => row.id}
          columns={[
            { header: "ID", accessorKey: "id", className: "font-mono text-xs font-semibold" },
            { header: "Customer", cell: (row) => <div><p className="font-semibold text-foreground">{row.name}</p><p className="text-xs text-muted-foreground">{row.email}</p></div> },
            { header: "Phone", accessorKey: "phone" },
            { header: "Service Requested", accessorKey: "service" },
            { header: "Travelers", accessorKey: "travelers", className: "text-muted-foreground" },
            {
              header: "Status",
              cell: (row) => (
                <Badge variant={row.status === "NEW" ? "accent" : row.status === "CONVERTED" ? "success" : "info"}>
                  {row.status}
                </Badge>
              ),
            },
            {
              header: "Actions",
              cell: () => (
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                  <Eye className="size-3.5" />
                  View Lead
                </Button>
              ),
            },
          ]}
        />
      </div>
    </AdminLayout>
  );
}