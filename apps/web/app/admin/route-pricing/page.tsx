"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";

type RoutePricing = {
  id: string;
  origin: string;
  destination: string;
  categoryId: string;
  tripTypeId: string;
  tripType?: { label: string };
  basePrice: string;
  isActive: boolean;
  originCity?: { name: string; state?: { name: string } };
  destinationCity?: { name: string; state?: { name: string } };
};

export default function RoutePricingAdminPage() {
  const [data, setData] = useState<RoutePricing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutePricing = async () => {
      try {
        const token = localStorage.getItem("goyatrio_token");
        const res = await fetch("/api/admin/route-pricing", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error("Failed to fetch route pricing", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutePricing();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="Route Pricing" description="Manage point-to-point cab pricing" />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <DataTable
              columns={[
                {
                  header: "Origin",
                  cell: (row) =>
                    row.originCity
                      ? `${row.originCity.name} (${row.originCity.state?.name})`
                      : row.origin,
                },
                {
                  header: "Destination",
                  cell: (row) =>
                    row.destinationCity
                      ? `${row.destinationCity.name} (${row.destinationCity.state?.name})`
                      : row.destination,
                },
                { header: "Trip Type", cell: (row) => row.tripType?.label ?? "N/A" },
                { header: "Base Price", cell: (row) => `₹${row.basePrice}` },
                { header: "Active", cell: (row) => (row.isActive ? "Yes" : "No") },
              ]}
              data={data}
              keyExtractor={(row) => row.id}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
