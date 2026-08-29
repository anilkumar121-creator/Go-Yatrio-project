"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Plus, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { StatsCard } from "@/components/admin/stats-card";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { Card } from "@/components/common/card";
import { LoadingState } from "@/components/admin/loading-state";

type Inquiry = {
  id: string;
  inquiryNumber: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  type: string;
  status: string;
  priority: string;
  assignedTo: string | null;
  package?: { title: string } | null;
  hotel?: { name: string } | null;
  cab?: { vehicleName: string } | null;
  createdAt: string;
};

type DashboardStats = {
  totalInquiries: number;
  newInquiries: number;
  contactedInquiries: number;
  qualifiedInquiries: number;
  wonInquiries: number;
  lostInquiries: number;
  recentInquiries: Inquiry[];
};

function getToken() {
  return typeof window !== "undefined" ? localStorage.getItem("goyatrio_token") : null;
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const data = await response.json();
  if (!response.ok || !data.success)
    throw new Error(data.message || data.error || "Request failed.");
  return data.data;
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsData, recentData] = await Promise.all([
          apiFetch("/api/admin/inquiries/stats"),
          apiFetch("/api/admin/inquiries/recent?limit=5"),
        ]);
        setStats({
          totalInquiries: statsData.total ?? 0,
          newInquiries: statsData.new ?? 0,
          contactedInquiries: statsData.contacted ?? 0,
          qualifiedInquiries: statsData.qualified ?? 0,
          wonInquiries: statsData.won ?? 0,
          lostInquiries: statsData.lost ?? 0,
          recentInquiries: recentData ?? [],
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const getServiceLabel = (inquiry: Inquiry): string => {
    if (inquiry.package) return `Tour Package (${inquiry.package.title})`;
    if (inquiry.hotel) return `Hotel (${inquiry.hotel.name})`;
    if (inquiry.cab) return `Cab (${inquiry.cab.vehicleName})`;
    return inquiry.type;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <PageHeader
            title="Dashboard Overview"
            description="Welcome back, Administrator. Here is a summary of GoYatrio operations."
          />
          <LoadingState />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <PageHeader
            title="Dashboard Overview"
            description="Welcome back, Administrator. Here is a summary of GoYatrio operations."
          />
          <Card className="p-6 text-center text-destructive">{error}</Card>
        </div>
      </AdminLayout>
    );
  }

  const statsCards = stats
    ? [
        {
          title: "Total Inquiries",
          value: String(stats.totalInquiries),
          icon: MessageSquare,
          trend: `${stats.newInquiries} new`,
          trendDirection: "up" as const,
        },
        {
          title: "New",
          value: String(stats.newInquiries),
          icon: MessageSquare,
          trend: "Requires attention",
          trendDirection: "up" as const,
        },
        {
          title: "Contacted",
          value: String(stats.contactedInquiries),
          icon: MessageSquare,
          trend: "In progress",
          trendDirection: "neutral" as const,
        },
        {
          title: "Qualified",
          value: String(stats.qualifiedInquiries),
          icon: MessageSquare,
          trend: "Hot leads",
          trendDirection: "up" as const,
        },
        {
          title: "Won",
          value: String(stats.wonInquiries),
          icon: MessageSquare,
          trend: "Converted",
          trendDirection: "up" as const,
          className: "border-l-4 border-l-green-500",
        },
        {
          title: "Lost",
          value: String(stats.lostInquiries),
          icon: MessageSquare,
          trend: "Closed",
          trendDirection: "down" as const,
          className: "border-l-4 border-l-red-500",
        },
      ]
    : [];

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
          {statsCards.map((stat, idx) => (
            <StatsCard
              key={idx}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
              trendDirection={stat.trendDirection}
              className={stat.className}
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

          {stats?.recentInquiries.length ? (
            <DataTable
              data={stats.recentInquiries}
              keyExtractor={(row) => row.id}
              columns={[
                {
                  header: "Inquiry ID",
                  accessorKey: "inquiryNumber",
                  className: "font-mono font-medium text-xs",
                },
                { header: "Customer Name", accessorKey: "name", className: "font-medium" },
                { header: "Requested Service", cell: (row) => getServiceLabel(row) },
                { header: "Phone", accessorKey: "phone", className: "text-muted-foreground" },
                {
                  header: "Date Received",
                  cell: (row) =>
                    new Date(row.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }),
                  className: "text-muted-foreground",
                },
                {
                  header: "Status",
                  cell: (row) => (
                    <Badge
                      variant={
                        row.status === "NEW"
                          ? "default"
                          : row.status === "WON"
                            ? "success"
                            : row.status === "LOST"
                              ? "error"
                              : row.status === "PROPOSAL_SENT" || row.status === "NEGOTIATION"
                                ? "warning"
                                : "secondary"
                      }
                    >
                      {row.status.replace("_", " ")}
                    </Badge>
                  ),
                },
              ]}
            />
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              No recent inquiries found.
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
