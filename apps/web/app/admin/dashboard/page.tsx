"use client";

import { MapPin, Compass, Hotel, Car, FileText, MessageSquare, Plus, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { StatsCard } from "@/components/admin/stats-card";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";

const mockStats = [
  { title: "Total Destinations", value: "24", icon: MapPin, trend: "+3 this month", trendDirection: "up" as const },
  { title: "Total Packages", value: "58", icon: Compass, trend: "+8 this month", trendDirection: "up" as const },
  { title: "Total Hotels", value: "42", icon: Hotel, trend: "+5 this month", trendDirection: "up" as const },
  { title: "Total Cabs", value: "18", icon: Car, trend: "Active fleet", trendDirection: "neutral" as const },
  { title: "Total Blogs", value: "31", icon: FileText, trend: "+2 published", trendDirection: "up" as const },
  { title: "Total Inquiries", value: "148", icon: MessageSquare, trend: "+22 new", trendDirection: "up" as const },
];

const mockRecentInquiries = [
  { id: "INQ-1001", name: "Ananya Sharma", service: "Tour Package (Kashmir)", phone: "+91 9876543210", date: "2026-08-14", status: "NEW" },
  { id: "INQ-1002", name: "Rahul Verma", service: "Hotel Booking (Kerala)", phone: "+91 9876543211", date: "2026-08-14", status: "CONTACTED" },
  { id: "INQ-1003", name: "Rajesh Mohanty", service: "Cab Booking (Tempo Traveller)", phone: "+91 9876543212", date: "2026-08-13", status: "IN_PROGRESS" },
  { id: "INQ-1004", name: "Priya Sundaram", service: "Tour Package (Rajasthan)", phone: "+91 9876543213", date: "2026-08-12", status: "CONVERTED" },
  { id: "INQ-1005", name: "Vikram Singh", service: "Outstation Cab (Shimla)", phone: "+91 9876543214", date: "2026-08-11", status: "CLOSED" },
];

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="space-y-8">
        <PageHeader
          title="Dashboard Overview"
          description="Welcome back, Administrator. Here is a summary of GoYatrio operations."
          action={
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/admin/packages">
                <Plus className="size-4" />
                Add New Package
              </Link>
            </Button>
          }
        />

        {/* Statistic Cards */}
        <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 desktop:grid-cols-3">
          {mockStats.map((stat, idx) => (
            <StatsCard
              key={idx}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              trendDirection={stat.trendDirection}
            />
          ))}
        </div>

        {/* Recent Inquiries Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Customer Inquiries</h2>
            <Button asChild variant="outline" size="sm" className="text-xs gap-1">
              <Link href="/admin/inquiries">
                View All Inquiries
                <ArrowUpRight className="size-3.5" />
              </Link>
            </Button>
          </div>

          <DataTable
            data={mockRecentInquiries}
            keyExtractor={(row) => row.id}
            columns={[
              { header: "Inquiry ID", accessorKey: "id", className: "font-mono font-medium text-xs" },
              { header: "Customer Name", accessorKey: "name", className: "font-medium" },
              { header: "Requested Service", accessorKey: "service" },
              { header: "Phone", accessorKey: "phone", className: "text-muted-foreground" },
              { header: "Date Received", accessorKey: "date", className: "text-muted-foreground" },
              {
                header: "Status",
                cell: (row) => (
                  <Badge
                    variant={
                      row.status === "NEW"
                        ? "accent"
                        : row.status === "CONVERTED"
                          ? "success"
                          : row.status === "IN_PROGRESS"
                            ? "info"
                            : "muted"
                    }
                  >
                    {row.status}
                  </Badge>
                ),
              },
            ]}
          />
        </div>
      </div>
    </AdminLayout>
  );
}