"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";

type CabBooking = {
  id: string;
  bookingReference: string;
  customerName: string;
  customerPhone: string;
  pickupDate: string;
  status: string;
  calculatedFare: string;
};

export default function CabBookingsAdminPage() {
  const [data, setData] = useState<CabBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("goyatrio_token");
        const res = await fetch("/api/admin/cab-bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success !== false) {
          // Depending on API structure, it could be an array or json.data
          setData(Array.isArray(json) ? json : json.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch bookings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader title="Cab Bookings" description="Manage cab reservations and inquiries" />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <DataTable
              columns={[
                { header: "Reference", cell: (row) => row.bookingReference },
                { header: "Customer", cell: (row) => row.customerName },
                { header: "Phone", cell: (row) => row.customerPhone },
                {
                  header: "Travel Date",
                  cell: (row) => new Date(row.pickupDate).toLocaleDateString(),
                },
                { header: "Fare", cell: (row) => `₹${row.calculatedFare}` },
                { header: "Status", cell: (row) => row.status },
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
