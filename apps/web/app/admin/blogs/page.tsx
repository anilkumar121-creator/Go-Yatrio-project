"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Edit, Trash2, FileText, X, Star, Eye, CalendarDays } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AdminLayout } from "@/components/admin/admin-layout";
import { PageHeader } from "@/components/admin/page-header";
import { SearchBar } from "@/components/admin/search-bar";
import { DataTable } from "@/components/admin/data-table";
import { ConfirmationModal } from "@/components/admin/confirmation-modal";
import { LoadingState } from "@/components/admin/loading-state";
import { EmptyState } from "@/components/admin/empty-state";
import { Button } from "@/components/common/button";
import { Badge } from "@/components/common/badge";
import { Input } from "@/components/common/input";
import { Textarea } from "@/components/common/textarea";
import { Label } from "@/components/common/label";
import { Switch } from "@/components/common/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/common/select";
import { Card } from "@/components/common/card";

type BlogAuthor = { id: string; name: string; slug: string; avatar: string | null };
type BlogCategory = { id: string; name: string; slug: string };
type BlogTag = { id: string; name: string; slug: string };
type DestinationOption = { id: string; name: string; slug: string };
type TourPackageOption = { id: string; title: string; slug: string };

type BlogItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentFormat: string;
  contentBlocks: unknown[] | null;
  faq: { question: string; answer: string }[] | null;
  featuredImage: string | null;
  galleryImages: string[];
  authorId: string | null;
  author: BlogAuthor | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  viewCount: number;
  readingTimeMinutes: number;
  publishedAt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  categories: BlogCategory[];
  tags: BlogTag[];
  destinations: DestinationOption[];
  packages: TourPackageOption[];
};

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  contentBlocksJson: string;
  faqJson: string;
  featuredImage: string;
  galleryImages: string;
  authorId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  featured: boolean;
  readingTimeMinutes: number;
  publishedAt: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  ogImage: string;
  categoryIds: string[];
  tagIds: string[];
  destinationIds: string[];
  packageIds: string[];
};

const emptyForm: BlogForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  contentBlocksJson: "",
  faqJson: "",
  featuredImage: "",
  galleryImages: "",
  authorId: "",
  status: "DRAFT",
  featured: false,
  readingTimeMinutes: 5,
  publishedAt: "",
  seoTitle: "",
  seoDescription: "",
  canonicalUrl: "",
  ogImage: "",
  categoryIds: [],
  tagIds: [],
  destinationIds: [],
  packageIds: [],
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

  if (!response.ok || !data.success) {
    throw new Error(data.message || data.error || "Request failed.");
  }

  return data.data;
}
export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [authors, setAuthors] = useState<BlogAuthor[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [packages, setPackages] = useState<TourPackageOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [form, setForm] = useState<BlogForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<BlogItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadLookups = useCallback(async () => {
    try {
      const [a, c, t, d, pkgs] = await Promise.all([
        apiFetch("/api/admin/blogs/authors"),
        apiFetch("/api/admin/blogs/categories"),
        apiFetch("/api/admin/blogs/tags"),
        apiFetch("/api/admin/destinations?take=100"),
        apiFetch("/api/admin/packages?take=100"),
      ]);
      setAuthors(a ?? []);
      setCategories(c ?? []);
      setTags(t ?? []);
      setDestinations(d ?? []);
      setPackages(pkgs ?? []);
    } catch {
      // Fallback
    }
  }, []);

  const loadBlogs = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams({ take: "100" });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);

      const data = await apiFetch(`/api/admin/blogs?${params.toString()}`);
      setBlogs(data ?? []);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to load blogs.");
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setForm({ ...emptyForm, authorId: authors[0]?.id ?? "" });
    setFormError(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (blog: BlogItem) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      contentBlocksJson: blog.contentBlocks ? JSON.stringify(blog.contentBlocks, null, 2) : "",
      faqJson: blog.faq ? JSON.stringify(blog.faq, null, 2) : "",
      featuredImage: blog.featuredImage ?? "",
      galleryImages: (blog.galleryImages ?? []).join("\n"),
      authorId: blog.authorId ?? "",
      status: blog.status,
      featured: blog.featured,
      readingTimeMinutes: blog.readingTimeMinutes,
      publishedAt: blog.publishedAt ? blog.publishedAt.slice(0, 10) : "",
      seoTitle: blog.seoTitle ?? "",
      seoDescription: blog.seoDescription ?? "",
      canonicalUrl: blog.canonicalUrl ?? "",
      ogImage: blog.ogImage ?? "",
      categoryIds: blog.categories.map((c) => c.id),
      tagIds: blog.tags.map((t) => t.id),
      destinationIds: blog.destinations.map((d) => d.id),
      packageIds: blog.packages.map((p) => p.id),
    });
    setFormError(null);
    setFormOpen(true);
  };

  const toggleId = (list: string[], id: string): string[] =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.title.trim() || !form.excerpt.trim()) {
      setFormError("Blog title and excerpt are required.");
      return;
    }

    setSaving(true);

    try {
      let contentBlocks: unknown[] | undefined;
      let faq: { question: string; answer: string }[] | undefined;

      const trimmedFaq = form.faqJson.trim();
      if (trimmedFaq) {
        try {
          const parsedFaq = JSON.parse(trimmedFaq);
          if (Array.isArray(parsedFaq)) {
            faq = parsedFaq;
          } else {
            throw new Error("FAQ must be a JSON array of { question, answer } objects.");
          }
        } catch (parseFaqErr) {
          setFormError(parseFaqErr instanceof Error ? parseFaqErr.message : "Invalid FAQ JSON.");
          setSaving(false);
          return;
        }
      }
      const trimmedBlocks = form.contentBlocksJson.trim();
      if (trimmedBlocks) {
        try {
          const parsed = JSON.parse(trimmedBlocks);
          if (Array.isArray(parsed)) {
            contentBlocks = parsed;
          } else {
            throw new Error("Content blocks must be a JSON array.");
          }
        } catch (parseErr) {
          setFormError(parseErr instanceof Error ? parseErr.message : "Invalid content blocks JSON.");
          setSaving(false);
          return;
        }
      }

      const galleryList = form.galleryImages
        .split("\n")
        .map((url) => url.trim())
        .filter((url) => url.length > 0);

      const payload = {
        title: form.title,
        slug: form.slug.trim() || undefined,
        excerpt: form.excerpt,
        content: form.content || form.excerpt,
        contentFormat: "JSON_BLOCKS",
        contentBlocks,
        faq,
        featuredImage: form.featuredImage.trim() || undefined,
        galleryImages: galleryList,
        authorId: form.authorId || undefined,
        status: form.status,
        featured: form.featured,
        readingTimeMinutes: form.readingTimeMinutes,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined,
        seoTitle: form.seoTitle.trim() || undefined,
        seoDescription: form.seoDescription.trim() || undefined,
        canonicalUrl: form.canonicalUrl.trim() || undefined,
        ogImage: form.ogImage.trim() || undefined,
        categoryIds: form.categoryIds,
        tagIds: form.tagIds,
        destinationIds: form.destinationIds,
        packageIds: form.packageIds,
      };

      if (editingBlog) {
        await apiFetch(`/api/admin/blogs/${editingBlog.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/admin/blogs", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setFormOpen(false);
      await loadBlogs();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to save blog.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlog = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await apiFetch(`/api/admin/blogs/${deleteTarget.id}`, {
        method: "DELETE",
      });
      setDeleteTarget(null);
      await loadBlogs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete blog.");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (blog: BlogItem, newStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED") => {
    try {
      await apiFetch(`/api/admin/blogs/${blog.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await loadBlogs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status.");
    }
  };

  const handleToggleFeatured = async (blog: BlogItem) => {
    try {
      await apiFetch(`/api/admin/blogs/${blog.id}/featured`, {
        method: "PATCH",
        body: JSON.stringify({ featured: !blog.featured }),
      });
      await loadBlogs();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update featured flag.");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <PageHeader
          title="Blog CMS & Content Marketing"
          description="Write, publish, and manage travel articles with authors, categories, tags, and SEO."
          action={
            <Button size="sm" className="gap-1.5" onClick={handleOpenCreate}>
              <Plus className="size-4" />
              Write New Blog
            </Button>
          }
        />

        {errorMessage ? (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
          <SearchBar value={search} onChange={setSearch} placeholder="Search articles..." />
          <div className="flex items-center gap-3">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {isLoading ? (
          <LoadingState rows={5} />
        ) : blogs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No blog articles found"
            description="Create your first travel article to start growing organic traffic."
            actionLabel="Write New Blog"
            onAction={handleOpenCreate}
          />
        ) : (
          <DataTable
            data={blogs}
            keyExtractor={(row) => row.id}
            columns={[
              {
                header: "Article Title",
                cell: (row) => (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{row.title}</span>
                      {row.featured ? <Badge variant="accent">Featured</Badge> : null}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">/{row.slug}</span>
                  </div>
                ),
              },
              {
                header: "Author",
                cell: (row) => (
                  <span className="font-medium text-foreground">{row.author?.name ?? "Unassigned"}</span>
                ),
              },
              {
                header: "Category / Tags",
                cell: (row) => (
                  <div className="flex flex-wrap gap-1">
                    {row.categories.map((c) => (
                      <Badge key={c.id} variant="secondary" className="text-[11px]">{c.name}</Badge>
                    ))}
                    {row.tags.slice(0, 2).map((t) => (
                      <Badge key={t.id} variant="outline" className="text-[11px]">{t.name}</Badge>
                    ))}
                  </div>
                ),
              },
              {
                header: "Stats",
                cell: (row) => (
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <span className="flex items-center gap-1"><Eye className="size-3 text-primary" /> {row.viewCount} views</span>
                    <span className="flex items-center gap-1"><CalendarDays className="size-3 text-primary" /> {row.readingTimeMinutes} min read</span>
                  </div>
                ),
              },
              {
                header: "Status",
                cell: (row) => (
                  <Select
                    value={row.status}
                    onValueChange={(val) => handleToggleStatus(row, val as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
                  >
                    <SelectTrigger className="h-8 w-28 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                ),
              },
              {
                header: "Actions",
                cell: (row) => (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(row)}
                      title="Edit Blog"
                    >
                      <Edit className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleToggleFeatured(row)}
                      title={row.featured ? "Unfeature Blog" : "Feature Blog"}
                    >
                      <Star className={row.featured ? "size-4 fill-amber-500 text-amber-500" : "size-4 text-muted-foreground"} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(row)}
                      title="Delete (Archive) Blog"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
        )}
      </div>
      {/* Blog Create / Edit Dialog */}
      <DialogPrimitive.Root open={formOpen} onOpenChange={setFormOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <DialogPrimitive.Content className="fixed inset-x-4 top-10 z-50 max-h-[88vh] w-full max-w-5xl translate-x-0 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-2xl mx-auto my-auto inset-y-0">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <DialogPrimitive.Title className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <FileText className="size-5 text-primary" />
                  {editingBlog ? "Edit Blog Article" : "Write New Blog Article"}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-xs text-muted-foreground">
                  Configure content, author, categories, tags, destinations, packages, and SEO metadata.
                </DialogPrimitive.Description>
              </div>
              <DialogPrimitive.Close className="rounded-sm opacity-70 hover:opacity-100">
                <X className="size-5 text-muted-foreground" />
              </DialogPrimitive.Close>
            </div>

            {formError ? (
              <div className="mt-4 rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                {formError}
              </div>
            ) : null}

            <form onSubmit={handleSaveBlog} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="blog-title">Article Title *</Label>
                  <Input
                    id="blog-title"
                    required
                    maxLength={200}
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. The Ultimate Guide to Kerala Backwaters"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-slug">Slug</Label>
                  <Input
                    id="blog-slug"
                    maxLength={220}
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated if empty"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-author">Author</Label>
                  <Select value={form.authorId} onValueChange={(value) => setForm({ ...form, authorId: value })}>
                    <SelectTrigger id="blog-author">
                      <SelectValue placeholder="Select Author" />
                    </SelectTrigger>
                    <SelectContent>
                      {authors.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-status">Status *</Label>
                  <Select
                    value={form.status}
                    onValueChange={(val) => setForm({ ...form, status: val as "DRAFT" | "PUBLISHED" | "ARCHIVED" })}
                  >
                    <SelectTrigger id="blog-status">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-date">Publish Date</Label>
                  <Input
                    id="blog-date"
                    type="date"
                    value={form.publishedAt}
                    onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-read">Reading Time (minutes)</Label>
                  <Input
                    id="blog-read"
                    type="number"
                    min={1}
                    value={form.readingTimeMinutes}
                    onChange={(e) => setForm({ ...form, readingTimeMinutes: Number(e.target.value) })}
                  />
                </div>

                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="blog-excerpt">Excerpt *</Label>
                  <Textarea
                    id="blog-excerpt"
                    required
                    maxLength={500}
                    rows={2}
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    placeholder="Short summary shown on cards and search results..."
                  />
                </div>

                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="blog-content">Article Body (Plain Text Snapshot)</Label>
                  <Textarea
                    id="blog-content"
                    rows={6}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Plain-text version used for excerpts and search. Advanced block content goes below (optional)."
                  />
                </div>

                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="blog-blocks">Advanced: Content Blocks (JSON array â€” optional)</Label>
                  <Textarea
                    id="blog-blocks"
                    rows={8}
                    className="font-mono text-xs"
                    value={form.contentBlocksJson}
                    onChange={(e) => setForm({ ...form, contentBlocksJson: e.target.value })}
                    placeholder={`[\n  { "type": "paragraph", "content": "Hello world" },\n  { "type": "image", "attrs": { "url": "https://...", "alt": "..." } }\n]`}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    TipTap / EditorJS / Lexical / Cloudinary-ready block format. Left empty to keep plain text only.
                  </p>
                </div>

                <div className="space-y-2 tablet:col-span-2">
                  <Label htmlFor="blog-faq">Advanced: FAQ (JSON array â€” optional)</Label>
                  <Textarea
                    id="blog-faq"
                    rows={4}
                    className="font-mono text-xs"
                    value={form.faqJson}
                    onChange={(e) => setForm({ ...form, faqJson: e.target.value })}
                    placeholder={`[\n  { "question": "What is the best time to visit?", "answer": "September to March." }\n]`}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Rendered as FAQPage JSON-LD schema for rich search results.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blog-image">Featured Image URL</Label>
                  <Input
                    id="blog-image"
                    type="url"
                    value={form.featuredImage}
                    onChange={(e) => setForm({ ...form, featuredImage: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blog-gallery">Gallery Images (One URL per line)</Label>
                  <Textarea
                    id="blog-gallery"
                    rows={2}
                    value={form.galleryImages}
                    onChange={(e) => setForm({ ...form, galleryImages: e.target.value })}
                    placeholder={"https://...\nhttps://..."}
                  />
                </div>

                {/* Category / Tag / Destination / Package Links */}
                <div className="space-y-2 tablet:col-span-2 border-t border-border pt-4">
                  <Label className="font-semibold">Categories</Label>
                  <div className="grid grid-cols-2 gap-2 tablet:grid-cols-3">
                    {categories.map((c) => (
                      <label key={c.id} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.categoryIds.includes(c.id)}
                          onChange={() => setForm((prev) => ({ ...prev, categoryIds: toggleId(prev.categoryIds, c.id) }))}
                          className="rounded border-border"
                        />
                        <span>{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 tablet:col-span-2 border-t border-border pt-4">
                  <Label className="font-semibold">Tags</Label>
                  <div className="grid grid-cols-2 gap-2 tablet:grid-cols-3">
                    {tags.map((t) => (
                      <label key={t.id} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.tagIds.includes(t.id)}
                          onChange={() => setForm((prev) => ({ ...prev, tagIds: toggleId(prev.tagIds, t.id) }))}
                          className="rounded border-border"
                        />
                        <span>{t.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 tablet:col-span-2 border-t border-border pt-4">
                  <Label className="font-semibold">Linked Destinations</Label>
                  <div className="grid grid-cols-2 gap-2 tablet:grid-cols-3">
                    {destinations.map((d) => (
                      <label key={d.id} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.destinationIds.includes(d.id)}
                          onChange={() => setForm((prev) => ({ ...prev, destinationIds: toggleId(prev.destinationIds, d.id) }))}
                          className="rounded border-border"
                        />
                        <span>{d.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 tablet:col-span-2 border-t border-border pt-4">
                  <Label className="font-semibold">Linked Tour Packages</Label>
                  <div className="grid grid-cols-1 gap-2 tablet:grid-cols-2">
                    {packages.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.packageIds.includes(p.id)}
                          onChange={() => setForm((prev) => ({ ...prev, packageIds: toggleId(prev.packageIds, p.id) }))}
                          className="rounded border-border"
                        />
                        <span>{p.title}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* SEO Fields */}
                <div className="space-y-2 tablet:col-span-2 border-t border-border pt-4">
                  <Label className="font-semibold">SEO Metadata</Label>
                  <div className="grid grid-cols-1 gap-3 tablet:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">SEO Title</Label>
                      <Input maxLength={160} value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} placeholder="SEO meta title" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">SEO Description</Label>
                      <Input maxLength={200} value={form.seoDescription} onChange={(e) => setForm({ ...form, seoDescription: e.target.value })} placeholder="SEO meta description" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Canonical URL</Label>
                      <Input value={form.canonicalUrl} onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })} placeholder="https://..." />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">OpenGraph Image</Label>
                      <Input value={form.ogImage} onChange={(e) => setForm({ ...form, ogImage: e.target.value })} placeholder="https://..." />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/30 p-3 tablet:col-span-2">
                  <div>
                    <p className="text-sm font-medium text-foreground">Featured Article</p>
                    <p className="text-xs text-muted-foreground">Featured articles appear in the blog hero and homepage highlights.</p>
                  </div>
                  <Switch checked={form.featured} onCheckedChange={(checked) => setForm({ ...form, featured: checked })} aria-label="Featured article" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? "Saving Article..." : editingBlog ? "Save Changes" : "Create Article"}
                </Button>
              </div>
            </form>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <ConfirmationModal
        isOpen={!!deleteTarget}
        title="Archive Blog"
        description={`Are you sure you want to archive "${deleteTarget?.title}"? It will be hidden from the public site.`}
        confirmLabel={deleting ? "Archiving..." : "Archive"}
        isDestructive
        onConfirm={handleDeleteBlog}
        onClose={() => setDeleteTarget(null)}
      />
    </AdminLayout>
  );
}
