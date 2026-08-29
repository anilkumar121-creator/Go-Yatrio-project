"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Mail,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { SearchBar } from "@/components/admin/search-bar";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { LoadingState } from "@/components/admin/loading-state";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select";
import { Input } from "@/components/common/input";

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
  assignedUser?: { id: string; name: string; email: string } | null;
  package?: { id: string; title: string } | null;
  hotel?: { id: string; name: string } | null;
  cab?: { id: string; vehicleName: string } | null;
  createdAt: string;
  _count?: { notes: number; activities: number; assignments: number };
};

type UserOption = { id: string; name: string; email: string };

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "QUALIFIED", label: "Qualified" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "WON", label: "Won" },
  { value: "LOST", label: "Lost" },
  { value: "CLOSED", label: "Closed" },
];

const priorityOptions = [
  { value: "all", label: "All Priority" },
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

const sourceOptions = [
  { value: "all", label: "All Sources" },
  { value: "WEBSITE", label: "Website" },
  { value: "PACKAGE_PAGE", label: "Package Page" },
  { value: "HOTEL_PAGE", label: "Hotel Page" },
  { value: "CAB_PAGE", label: "Cab Page" },
  { value: "CONTACT_FORM", label: "Contact Form" },
  { value: "BLOG_PAGE", label: "Blog Page" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "PHONE", label: "Phone" },
  { value: "EMAIL", label: "Email" },
  { value: "MANUAL", label: "Manual" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "TOUR_PACKAGE", label: "Tour Package" },
  { value: "HOTEL", label: "Hotel" },
  { value: "CAB", label: "Cab" },
  { value: "GENERAL", label: "General" },
  { value: "CUSTOM_TOUR", label: "Custom Tour" },
];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [users, setUsers] = useState<UserOption[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; inquiryNumber: string } | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

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

  const loadUsers = useCallback(async () => {
    try {
      const data = await apiFetch("/api/admin/users?take=200");
      setUsers(data ?? []);
    } catch {
      // ignore
    }
  }, []);

  const loadInquiries = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams({
        take: String(pageSize),
        skip: String((page - 1) * pageSize),
      });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (priorityFilter !== "all") params.set("priority", priorityFilter);
      if (sourceFilter !== "all") params.set("source", sourceFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (assignedFilter !== "all") params.set("assignedTo", assignedFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);

      const data = await apiFetch(`/api/admin/inquiries?${params.toString()}`);
      setInquiries(data.items ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load inquiries.");
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    pageSize,
    search,
    statusFilter,
    priorityFilter,
    sourceFilter,
    typeFilter,
    assignedFilter,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);
  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  const columns = [
    {
      header: "Inquiry #",
      accessorKey: "inquiryNumber" as const,
      cell: (row: Inquiry) => <span className="font-mono font-medium">{row.inquiryNumber}</span>,
    },
    {
      header: "Name",
      accessorKey: "name" as const,
      cell: (row: Inquiry) => <div className="font-medium">{row.name}</div>,
    },
    {
      header: "Email",
      accessorKey: "email" as const,
      cell: (row: Inquiry) => <span className="text-sm text-muted-foreground">{row.email}</span>,
    },
    {
      header: "Phone",
      accessorKey: "phone" as const,
      cell: (row: Inquiry) => <span className="text-sm text-muted-foreground">{row.phone}</span>,
    },
    {
      header: "Source",
      accessorKey: "source" as const,
      cell: (row: Inquiry) => {
        const labels: Record<string, string> = {
          WEBSITE: "Website",
          PACKAGE_PAGE: "Package",
          HOTEL_PAGE: "Hotel",
          CAB_PAGE: "Cab",
          CONTACT_FORM: "Contact",
          BLOG_PAGE: "Blog",
          WHATSAPP: "WhatsApp",
          PHONE: "Phone",
          EMAIL: "Email",
          MANUAL: "Manual",
        };
        return (
          <Badge variant="secondary" className="text-xs">
            {labels[row.source] || row.source}
          </Badge>
        );
      },
    },
    {
      header: "Type",
      accessorKey: "type" as const,
      cell: (row: Inquiry) => {
        const labels: Record<string, string> = {
          TOUR_PACKAGE: "Package",
          HOTEL: "Hotel",
          CAB: "Cab",
          GENERAL: "General",
          CUSTOM_TOUR: "Custom",
        };
        return (
          <Badge variant="outline" className="text-xs">
            {labels[row.type] || row.type}
          </Badge>
        );
      },
    },
    {
      header: "Status",
      accessorKey: "status" as const,
      cell: (row: Inquiry) => {
        const variants: Record<
          string,
          "default" | "secondary" | "error" | "outline" | "success" | "warning" | "info"
        > = {
          NEW: "default",
          CONTACTED: "info",
          FOLLOW_UP: "warning",
          QUALIFIED: "secondary",
          PROPOSAL_SENT: "secondary",
          NEGOTIATION: "warning",
          WON: "success",
          LOST: "error",
          CLOSED: "outline",
        };
        return (
          <Badge variant={variants[row.status] || "default"}>{row.status.replace("_", " ")}</Badge>
        );
      },
    },
    {
      header: "Priority",
      accessorKey: "priority" as const,
      cell: (row: Inquiry) => {
        const variants: Record<
          string,
          "default" | "secondary" | "error" | "outline" | "success" | "warning" | "info"
        > = { LOW: "outline", MEDIUM: "default", HIGH: "warning", URGENT: "error" };
        return (
          <Badge variant={variants[row.priority] || "default"} className="font-medium">
            {row.priority}
          </Badge>
        );
      },
    },
    {
      header: "Assigned To",
      accessorKey: "assignedTo" as const,
      cell: (row: Inquiry) =>
        row.assignedUser ? (
          <span className="text-sm">{row.assignedUser.name}</span>
        ) : (
          <span className="text-muted-foreground text-sm">Unassigned</span>
        ),
    },
    {
      header: "Created",
      accessorKey: "createdAt" as const,
      cell: (row: Inquiry) => (
        <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      header: "Actions",
      cell: (row: Inquiry) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/inquiries/${row.id}`}
            className="p-1.5 rounded hover:bg-muted"
            title="View"
          >
            <Eye className="size-4" />
          </Link>
          <Link
            href={`/admin/inquiries/${row.id}/edit`}
            className="p-1.5 rounded hover:bg-muted"
            title="Edit"
          >
            <Edit className="size-4" />
          </Link>
          <button
            onClick={() => setDeleteTarget({ id: row.id, inquiryNumber: row.inquiryNumber })}
            className="p-1.5 rounded hover:bg-muted text-destructive"
            title="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  return (
    <AdminLayout>
      <div className="flex-1 p-6 space-y-6">
        <PageHeader
          title="Inquiries"
          description="Manage and track all customer inquiries and leads."
          action={
            <Button asChild>
              <Link href="/admin/inquiries/create">
                <Plus className="size-4 mr-2" />
                New Inquiry
              </Link>
            </Button>
          }
        />

        <div className="flex flex-col gap-4">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, phone, inquiry #..."
          />
          <div className="flex flex-wrap gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {sourceOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={assignedFilter} onValueChange={setAssignedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Assigned To" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Assignees</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                placeholder="From"
                className="w-[140px]"
              />
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                placeholder="To"
                className="w-[140px]"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : errorMessage ? (
          <EmptyState icon={AlertTriangle} title="Error" description={errorMessage} />
        ) : inquiries.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No inquiries found"
            description="Try adjusting your filters or search terms."
          />
        ) : (
          <>
            <DataTable data={inquiries} columns={columns} keyExtractor={(row) => row.id} />
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages} — {total} inquiries
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        <ConfirmationModal
          isOpen={!!deleteTarget}
          title="Delete Inquiry"
          description={`Are you sure you want to delete inquiry "${deleteTarget?.inquiryNumber}"? This action cannot be undone.`}
          confirmLabel={deleting ? "Deleting..." : "Delete"}
          isDestructive
          onConfirm={async () => {
            if (!deleteTarget) return;
            setDeleting(true);
            try {
              await apiFetch(`/api/admin/inquiries/${deleteTarget.id}`, { method: "DELETE" });
              setDeleteTarget(null);
              loadInquiries();
            } catch (err: unknown) {
              alert(err instanceof Error ? err.message : "Failed to delete inquiry");
            } finally {
              setDeleting(false);
            }
          }}
          onClose={() => setDeleteTarget(null)}
        />
      </div>
    </AdminLayout>
  );
}
