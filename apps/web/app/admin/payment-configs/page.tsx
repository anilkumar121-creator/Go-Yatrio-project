"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { DataTable } from "@/components/admin/data-table";

type PaymentConfig = {
  id: string;
  configName: string;
  advancePercent: string;
  module: string;
  isActive: boolean;
  isDefault: boolean;
};

export default function PaymentConfigsAdminPage() {
  const [data, setData] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const token = localStorage.getItem("goyatrio_token");
        const res = await fetch("/api/admin/payment-configs", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) setData(json.data);
      } catch (error) {
        console.error("Failed to fetch payment configs", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Payment Configurations"
          description="Manage advance payment rules and percentages"
        />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <DataTable
              columns={[
                { header: "Name", cell: (row) => row.configName },
                { header: "Module", cell: (row) => row.module },
                { header: "Advance %", cell: (row) => `${row.advancePercent}%` },
                { header: "Active", cell: (row) => (row.isActive ? "Yes" : "No") },
                { header: "Default", cell: (row) => (row.isDefault ? "Yes" : "No") },
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
