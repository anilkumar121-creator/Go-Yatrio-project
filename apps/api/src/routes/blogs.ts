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

export const blogsRouter = Router();

// Public Blog Routes (static single-segment routes must precede /:slug)
blogsRouter.get("/", listBlogs);
blogsRouter.get("/featured", getFeaturedBlogs);
blogsRouter.get("/categories", getBlogCategories);
blogsRouter.get("/tags", getBlogTags);
blogsRouter.get("/authors", getBlogAuthors);
blogsRouter.get("/:slug", getBlogBySlug);
blogsRouter.get("/:slug/related", getRelatedBlogs);
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
