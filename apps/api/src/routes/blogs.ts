import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.js";
import {
  adminCreateAuthor,
  adminCreateCategory,
  adminCreateTag,
  adminDeleteAuthor,
  deleteBlog,
  adminDeleteCategory,
  adminDeleteTag,
  adminGetBlog,
  adminListBlogs,
  adminUpdateAuthor,
  updateBlog,
  adminUpdateCategory,
  adminUpdateTag,
  createBlog,
  getBlogAuthors,
  getBlogBySlug,
  getBlogCategories,
  getBlogTags,
  getFeaturedBlogs,
  getRelatedBlogs,
  incrementBlogView,
  listBlogs,
  updateBlogFeatured,
  updateBlogStatus,
} from "../controllers/blog.controller.js";

import { publicCacheControl } from "../middleware/cache-control.js";

export const blogsRouter = Router();

// Public Blog Routes (static single-segment routes must precede /:slug)
blogsRouter.get("/", publicCacheControl(300, 600), listBlogs);
blogsRouter.get("/featured", publicCacheControl(300, 600), getFeaturedBlogs);
blogsRouter.get("/categories", publicCacheControl(600, 1200), getBlogCategories);
blogsRouter.get("/tags", publicCacheControl(600, 1200), getBlogTags);
blogsRouter.get("/authors", publicCacheControl(600, 1200), getBlogAuthors);
blogsRouter.get("/:slug", publicCacheControl(300, 600), getBlogBySlug);
blogsRouter.get("/:slug/related", publicCacheControl(300, 600), getRelatedBlogs);
blogsRouter.post("/:slug/view", incrementBlogView);

// Admin Blog Routes
export const adminBlogsRouter = Router();
adminBlogsRouter.use(authenticate, requireAdmin);

adminBlogsRouter.get("/", adminListBlogs);
adminBlogsRouter.get("/categories", getBlogCategories);
adminBlogsRouter.get("/tags", getBlogTags);
adminBlogsRouter.get("/authors", getBlogAuthors);
adminBlogsRouter.get("/:id", adminGetBlog);
adminBlogsRouter.post("/", createBlog);
adminBlogsRouter.put("/:id", updateBlog);
adminBlogsRouter.delete("/:id", deleteBlog);
adminBlogsRouter.patch("/:id/status", updateBlogStatus);
adminBlogsRouter.patch("/:id/featured", updateBlogFeatured);

// Admin: Categories / Tags / Authors
adminBlogsRouter.post("/categories", adminCreateCategory);
adminBlogsRouter.put("/categories/:id", adminUpdateCategory);
adminBlogsRouter.delete("/categories/:id", adminDeleteCategory);
adminBlogsRouter.post("/tags", adminCreateTag);
adminBlogsRouter.put("/tags/:id", adminUpdateTag);
adminBlogsRouter.delete("/tags/:id", adminDeleteTag);
adminBlogsRouter.post("/authors", adminCreateAuthor);
adminBlogsRouter.put("/authors/:id", adminUpdateAuthor);
adminBlogsRouter.delete("/authors/:id", adminDeleteAuthor);
