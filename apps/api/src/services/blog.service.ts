import { prisma, BlogStatus, BlogContentFormat } from "@goyatrio/database";

type BlogCreateInput = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  contentFormat?: BlogContentFormat;
  contentBlocks?: unknown[];
  faq?: { question: string; answer: string }[];
  featuredImage?: string;
  featuredImagePublicId?: string;
  galleryImages?: string[];
  authorId?: string;
  status?: BlogStatus;
  featured?: boolean;
  readingTimeMinutes?: number;
  viewCount?: number;
  publishedAt?: Date;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  categoryIds?: string[];
  tagIds?: string[];
  destinationIds?: string[];
  packageIds?: string[];
};

type BlogUpdateInput = Partial<BlogCreateInput>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function generateUniqueBlogSlug(title: string, excludeId?: string) {
  const base = slugify(title) || "blog";
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.blog.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || (excludeId && existing.id === excludeId)) {
      return candidate;
    }

    candidate = `${base}-${counter}`;
    counter++;
  }
}

function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

const blogIncludes = {
  author: { select: { id: true, name: true, slug: true, avatar: true, role: true, bio: true } },
  categories: { select: { id: true, name: true, slug: true } },
  tags: { select: { id: true, name: true, slug: true } },
  destinations: { select: { id: true, name: true, slug: true } },
  packages: {
    select: { id: true, title: true, slug: true, durationDays: true, priceFrom: true },
  },
} as const;

export const blogService = {
  list: async (query: {
    take?: number;
    skip?: number;
    search?: string;
    status?: BlogStatus;
    categorySlug?: string;
    tagSlug?: string;
    destinationSlug?: string;
    packageId?: string;
    featuredOnly?: boolean;
    sort?: "newest" | "oldest" | "most_viewed";
  } = {}) => {
    const {
      take = 50,
      skip = 0,
      search,
      status,
      categorySlug,
      tagSlug,
      destinationSlug,
      packageId,
      featuredOnly = false,
      sort = "newest",
    } = query;

    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (featuredOnly) where.featured = true;
    if (categorySlug) where.categories = { some: { slug: categorySlug } };
    if (tagSlug) where.tags = { some: { slug: tagSlug } };
    if (destinationSlug) where.destinations = { some: { slug: destinationSlug } };
    if (packageId) where.packages = { some: { id: packageId } };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy: Record<string, "asc" | "desc">[] = [{ publishedAt: "desc" }, { createdAt: "desc" }];
    if (sort === "oldest") orderBy = [{ publishedAt: "asc" }];
    if (sort === "most_viewed") orderBy = [{ viewCount: "desc" }];

    const [total, items] = await Promise.all([
      prisma.blog.count({ where }),
      prisma.blog.findMany({
        where,
        skip,
        take,
        orderBy,
        include: blogIncludes,
      }),
    ]);

    return { total, items };
  },

  listFeatured: async (take = 6) => {
    return prisma.blog.findMany({
      where: { status: BlogStatus.PUBLISHED, featured: true },
      take,
      orderBy: [{ publishedAt: "desc" }],
      include: blogIncludes,
    });
  },

  listCategories: async () => {
    return prisma.blogCategory.findMany({ orderBy: { name: "asc" } });
  },

  listTags: async () => {
    return prisma.blogTag.findMany({ orderBy: { name: "asc" } });
  },

  listAuthors: async () => {
    return prisma.blogAuthor.findMany({ orderBy: { name: "asc" } });
  },

  getBySlug: async (slug: string) => {
    return prisma.blog.findFirst({
      where: { OR: [{ id: slug }, { slug }] },
      include: blogIncludes,
    });
  },

  get: async (id: string) => {
    return prisma.blog.findUnique({
      where: { id },
      include: blogIncludes,
    });
  },

  related: async (blogId: string, take = 3) => {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { id: true, tags: { select: { id: true } } },
    });

    if (!blog) return [];

    const tagIds = blog.tags.map((t) => t.id);

    return prisma.blog.findMany({
      where: {
        id: { not: blogId },
        status: BlogStatus.PUBLISHED,
        ...(tagIds.length > 0 ? { tags: { some: { id: { in: tagIds } } } } : {}),
      },
      take,
      orderBy: [{ publishedAt: "desc" }],
      include: blogIncludes,
    });
  },

  incrementView: async (id: string) => {
    return prisma.blog.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  },

  create: async (data: BlogCreateInput) => {
    const slug = data.slug ? slugify(data.slug) : await generateUniqueBlogSlug(data.title);
    const status = data.status ?? BlogStatus.DRAFT;
    const readingTimeMinutes = data.readingTimeMinutes ?? estimateReadingTime(data.content);

    return prisma.blog.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        contentFormat: data.contentFormat ?? BlogContentFormat.JSON_BLOCKS,
        contentBlocks: data.contentBlocks === undefined ? undefined : (data.contentBlocks as never),
        faq: data.faq === undefined ? undefined : (data.faq as never),
        featuredImage: data.featuredImage,
        featuredImagePublicId: data.featuredImagePublicId,
        galleryImages: data.galleryImages ?? [],
        authorId: data.authorId ?? null,
        status,
        featured: data.featured ?? false,
        readingTimeMinutes,
        viewCount: data.viewCount ?? 0,
        publishedAt: data.publishedAt ?? (status === BlogStatus.PUBLISHED ? new Date() : null),
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        canonicalUrl: data.canonicalUrl,
        ogImage: data.ogImage,
        categories: data.categoryIds && data.categoryIds.length > 0
          ? { connect: data.categoryIds.map((id) => ({ id })) }
          : undefined,
        tags: data.tagIds && data.tagIds.length > 0
          ? { connect: data.tagIds.map((id) => ({ id })) }
          : undefined,
        destinations: data.destinationIds && data.destinationIds.length > 0
          ? { connect: data.destinationIds.map((id) => ({ id })) }
          : undefined,
        packages: data.packageIds && data.packageIds.length > 0
          ? { connect: data.packageIds.map((id) => ({ id })) }
          : undefined,
      },
      include: blogIncludes,
    });
  },

  update: async (id: string, data: BlogUpdateInput) => {
    let slug: string | undefined = undefined;
    if (data.slug || data.title) {
      slug = await generateUniqueBlogSlug(data.slug ?? data.title ?? "blog", id);
    }

    const status = data.status;
    const publishedAt =
      status === BlogStatus.PUBLISHED
        ? data.publishedAt ?? new Date()
        : status === BlogStatus.DRAFT || status === BlogStatus.ARCHIVED
          ? null
          : data.publishedAt;

    return prisma.blog.update({
      where: { id },
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        contentFormat: data.contentFormat,
        contentBlocks: data.contentBlocks === undefined ? undefined : (data.contentBlocks as never),
        faq: data.faq === undefined ? undefined : (data.faq as never),
        featuredImage: data.featuredImage,
        featuredImagePublicId: data.featuredImagePublicId,
        galleryImages: data.galleryImages,
        authorId: data.authorId ?? null,
        status: data.status,
        featured: data.featured,
        readingTimeMinutes: data.readingTimeMinutes,
        publishedAt,
        seoTitle: data.seoTitle,
        seoDescription: data.seoDescription,
        canonicalUrl: data.canonicalUrl,
        ogImage: data.ogImage,
        categories: data.categoryIds ? { set: data.categoryIds.map((cid) => ({ id: cid })) } : undefined,
        tags: data.tagIds ? { set: data.tagIds.map((tid) => ({ id: tid })) } : undefined,
        destinations: data.destinationIds ? { set: data.destinationIds.map((did) => ({ id: did })) } : undefined,
        packages: data.packageIds ? { set: data.packageIds.map((pid) => ({ id: pid })) } : undefined,
      },
      include: blogIncludes,
    });
  },

  updateStatus: async (id: string, status: BlogStatus) => {
    return prisma.blog.update({
      where: { id },
      data: {
        status,
        publishedAt: status === BlogStatus.PUBLISHED ? new Date() : null,
      },
    });
  },

  updateFeatured: async (id: string, featured: boolean) => {
    return prisma.blog.update({ where: { id }, data: { featured } });
  },

  remove: async (id: string) => {
    return prisma.blog.update({
      where: { id },
      data: { status: BlogStatus.ARCHIVED },
    });
  },

  createCategory: (data: { name: string; slug?: string; description?: string }) => {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);
    return prisma.blogCategory.create({ data: { name: data.name, slug, description: data.description } });
  },

  updateCategory: (id: string, data: { name?: string; slug?: string; description?: string }) => {
    return prisma.blogCategory.update({ where: { id }, data });
  },

  removeCategory: (id: string) => {
    return prisma.blogCategory.delete({ where: { id } });
  },

  createTag: (data: { name: string; slug?: string }) => {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);
    return prisma.blogTag.create({ data: { name: data.name, slug } });
  },

  updateTag: (id: string, data: { name?: string; slug?: string }) => {
    return prisma.blogTag.update({ where: { id }, data });
  },

  removeTag: (id: string) => {
    return prisma.blogTag.delete({ where: { id } });
  },

  createAuthor: (data: { name: string; slug?: string; bio?: string; avatar?: string; role?: string; email?: string }) => {
    const slug = data.slug ? slugify(data.slug) : slugify(data.name);
    return prisma.blogAuthor.create({ data: { ...data, slug } });
  },

  updateAuthor: (id: string, data: { name?: string; slug?: string; bio?: string; avatar?: string; role?: string; email?: string }) => {
    return prisma.blogAuthor.update({ where: { id }, data });
  },

  removeAuthor: (id: string) => {
    return prisma.blogAuthor.delete({ where: { id } });
  },
};
