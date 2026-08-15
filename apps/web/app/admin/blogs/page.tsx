"use client";

import { useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { SearchBar } from "@/components/admin/search-bar";
import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";

const mockBlogs = [
  { id: "1", title: "Top 10 Hidden Gems in Kashmir You Must Visit", author: "GoYatrio Editorial", publishedAt: "2026-08-10", isPublished: true },
  { id: "2", title: "The Ultimate Guide to Kerala Backwater Houseboats", author: "Ananya Travel Column", publishedAt: "2026-08-08", isPublished: true },
  { id: "3", title: "Best Time to Plan a Golden Triangle Trip to Rajasthan", author: "GoYatrio Team", publishedAt: "2026-08-01", isPublished: true },
  { id: "4", title: "5 Tips for Packing Lightweight on Mountain Treks", author: "Vikram Adventure", publishedAt: "Draft", isPublished: false },
];

export default function AdminBlogsPage() {
  const [search, setSearch] = useState("");

  const filteredData = mockBlogs.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Blog Articles & Content"
          description="Write, publish, and manage travel articles, destination guides, and SEO blog posts."
          action={
            <Button size="sm" className="gap-1.5">
              <Plus className="size-4" />
              Write New Blog
            </Button>
          }
        />

        <SearchBar value={search} onChange={setSearch} placeholder="Search blog articles..." />

        <DataTable
          data={filteredData}
          keyExtractor={(row) => row.id}
          columns={[
            { header: "Article Title", cell: (row) => <span className="font-semibold text-foreground">{row.title}</span> },
            { header: "Author", accessorKey: "author" },
            { header: "Published Date", accessorKey: "publishedAt", className: "text-muted-foreground" },
            {
              header: "Status",
              cell: (row) => (
                <Badge variant={row.isPublished ? "accent" : "outline"}>
                  {row.isPublished ? "Published" : "Draft"}
                </Badge>
              ),
            },
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
