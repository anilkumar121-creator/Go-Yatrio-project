"use client";

import { useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { SearchBar } from "@/components/admin/search-bar";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";

const mockMedia = [
  { id: "1", publicId: "goyatrio/hero-kashmir-banner", format: "JPEG", dimensions: "1920 x 1080", size: "480 KB", createdAt: "2026-08-12" },
  { id: "2", publicId: "goyatrio/kerala-houseboat-thumb", format: "WEBP", dimensions: "800 x 600", size: "120 KB", createdAt: "2026-08-10" },
  { id: "3", publicId: "goyatrio/rajasthan-fort-hero", format: "PNG", dimensions: "1200 x 800", size: "890 KB", createdAt: "2026-08-05" },
];

export default function AdminMediaPage() {
  const [search, setSearch] = useState("");

  const filteredData = mockMedia.filter((m) =>
    m.publicId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Media Library"
          description="Upload and organize Cloudinary images, resort photos, package banners, and promotional assets."
          action={
            <Button size="sm" className="gap-1.5">
              <Upload className="size-4" />
              Upload Image
            </Button>
          }
        />

        <SearchBar value={search} onChange={setSearch} placeholder="Search media assets..." />

        <DataTable
          data={filteredData}
          keyExtractor={(row) => row.id}
          columns={[
            { header: "Public ID / Path", cell: (row) => <span className="font-mono text-xs font-semibold text-foreground">{row.publicId}</span> },
            { header: "Format", cell: (row) => <Badge variant="outline">{row.format}</Badge> },
            { header: "Dimensions", accessorKey: "dimensions", className: "text-muted-foreground" },
            { header: "File Size", accessorKey: "size", className: "text-muted-foreground" },
            { header: "Uploaded On", accessorKey: "createdAt", className: "text-muted-foreground" },
            {
              header: "Actions",
              cell: () => (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-4" />
                </Button>
              ),
            },
          ]}
        />
      </div>
    </AdminLayout>
  );
}
