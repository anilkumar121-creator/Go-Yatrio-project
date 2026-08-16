import type { Request, Response } from "express";
import { BlogStatus } from "@goyatrio/database";
import { blogService } from "../services/blog.service.js";
import {
  blogAuthorCreateSchema,
  blogAuthorUpdateSchema,
  blogCategoryCreateSchema,
  blogCategoryUpdateSchema,
  blogCreateSchema,
  blogStatusSchema,
  blogTagCreateSchema,
  blogTagUpdateSchema,
  blogUpdateSchema,
} from "../validators/schemas.js";

function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] ?? "";
  return param ?? "";
}

// Public
export async function listBlogs(req: Request, res: Response) {
  const take = Number(req.query.take) || 20;
  const skip = Number(req.query.skip) || 0;
  const search = req.query.search as string | undefined;
  const categorySlug = req.query.category as string | undefined;
  const tagSlug = req.query.tag as string | undefined;
  const destinationSlug = req.query.destination as string | undefined;
  const packageId = req.query.packageId as string | undefined;
  const sort = req.query.sort as "newest" | "oldest" | "most_viewed" | undefined;

  const result = await blogService.list({
    take,
    skip,
    search,
    categorySlug,
    tagSlug,
    destinationSlug,
    packageId,
    status: BlogStatus.PUBLISHED,
    sort,
  });

  res.json({
    success: true,
    data: result.items,
    meta: { total: result.total, take, skip },
  });
}

export async function getFeaturedBlogs(req: Request, res: Response) {
  const take = Number(req.query.take) || 6;
  const items = await blogService.listFeatured(take);
  res.json({ success: true, data: items });
}

export async function getBlogCategories(_req: Request, res: Response) {
  const items = await blogService.listCategories();
  res.json({ success: true, data: items });
}

export async function getBlogTags(_req: Request, res: Response) {
  const items = await blogService.listTags();
  res.json({ success: true, data: items });
}

export async function getBlogAuthors(_req: Request, res: Response) {
  const items = await blogService.listAuthors();
  res.json({ success: true, data: items });
}

export async function getBlogBySlug(req: Request, res: Response) {
  const slug = getParam(req.params.slug);
  const blog = await blogService.getBySlug(slug);

  if (!blog) {
    res.status(404).json({ success: false, error: "Blog not found" });
    return;
  }

  if (blog.status !== BlogStatus.PUBLISHED) {
    res.status(404).json({ success: false, error: "Blog not found" });
    return;
  }

  res.json({ success: true, data: blog });
}

export async function getRelatedBlogs(req: Request, res: Response) {
  const slug = getParam(req.params.slug);
  const blog = await blogService.getBySlug(slug);

  if (!blog) {
    res.status(404).json({ success: false, error: "Blog not found" });
    return;
  }

  const items = await blogService.related(blog.id);
  res.json({ success: true, data: items });
}

export async function incrementBlogView(req: Request, res: Response) {
  const slug = getParam(req.params.slug);
  const blog = await blogService.getBySlug(slug);

  if (!blog) {
    res.status(404).json({ success: false, error: "Blog not found" });
    return;
  }

  await blogService.incrementView(blog.id);
  res.json({ success: true });
}

// Admin
export async function adminListBlogs(req: Request, res: Response) {
  const take = Number(req.query.take) || 50;
  const skip = Number(req.query.skip) || 0;
  const search = req.query.search as string | undefined;
  const status = req.query.status as BlogStatus | undefined;
  const categorySlug = req.query.category as string | undefined;

  const result = await blogService.list({ take, skip, search, status, categorySlug });

  res.json({
    success: true,
    data: result.items,
    meta: { total: result.total, take, skip },
  });
}

export async function adminGetBlog(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const blog = await blogService.get(id);

  if (!blog) {
    res.status(404).json({ success: false, error: "Blog not found" });
    return;
  }

  res.json({ success: true, data: blog });
}

export async function createBlog(req: Request, res: Response) {
  const validated = blogCreateSchema.parse(req.body);
  const created = await blogService.create(validated);

  res.status(201).json({ success: true, message: "Blog created successfully", data: created });
}

export async function updateBlog(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = blogUpdateSchema.parse(req.body);

  const existing = await blogService.get(id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Blog not found" });
    return;
  }

  const updated = await blogService.update(id, validated);

  res.json({ success: true, message: "Blog updated successfully", data: updated });
}

export async function deleteBlog(req: Request, res: Response) {
  const id = getParam(req.params.id);

  const existing = await blogService.get(id);
  if (!existing) {
    res.status(404).json({ success: false, error: "Blog not found" });
    return;
  }

  await blogService.remove(id);

  res.json({ success: true, message: "Blog archived successfully" });
}

export async function updateBlogStatus(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = blogStatusSchema.parse(req.body);

  const updated = await blogService.updateStatus(id, validated.status);

  res.json({ success: true, message: `Blog status updated to ${validated.status}`, data: updated });
}

export async function updateBlogFeatured(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const featured = req.body.featured === true;

  const updated = await blogService.updateFeatured(id, featured);

  res.json({ success: true, message: "Blog featured flag updated", data: updated });
}

// Admin: Categories / Tags / Authors
export async function adminCreateCategory(req: Request, res: Response) {
  const validated = blogCategoryCreateSchema.parse(req.body);
  const created = await blogService.createCategory(validated);
  res.status(201).json({ success: true, message: "Category created", data: created });
}

export async function adminUpdateCategory(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = blogCategoryUpdateSchema.parse(req.body);
  const updated = await blogService.updateCategory(id, validated);
  res.json({ success: true, data: updated });
}

export async function adminDeleteCategory(req: Request, res: Response) {
  const id = getParam(req.params.id);
  await blogService.removeCategory(id);
  res.json({ success: true, message: "Category deleted" });
}

export async function adminCreateTag(req: Request, res: Response) {
  const validated = blogTagCreateSchema.parse(req.body);
  const created = await blogService.createTag(validated);
  res.status(201).json({ success: true, message: "Tag created", data: created });
}

export async function adminUpdateTag(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = blogTagUpdateSchema.parse(req.body);
  const updated = await blogService.updateTag(id, validated);
  res.json({ success: true, data: updated });
}

export async function adminDeleteTag(req: Request, res: Response) {
  const id = getParam(req.params.id);
  await blogService.removeTag(id);
  res.json({ success: true, message: "Tag deleted" });
}

export async function adminCreateAuthor(req: Request, res: Response) {
  const validated = blogAuthorCreateSchema.parse(req.body);
  const created = await blogService.createAuthor(validated);
  res.status(201).json({ success: true, message: "Author created", data: created });
}

export async function adminUpdateAuthor(req: Request, res: Response) {
  const id = getParam(req.params.id);
  const validated = blogAuthorUpdateSchema.parse(req.body);
  const updated = await blogService.updateAuthor(id, validated);
  res.json({ success: true, data: updated });
}

export async function adminDeleteAuthor(req: Request, res: Response) {
  const id = getParam(req.params.id);
  await blogService.removeAuthor(id);
  res.json({ success: true, message: "Author deleted" });
}
