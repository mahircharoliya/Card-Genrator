import { hashPassword, comparePasswords, signToken } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { GraphQLContext } from "@/lib/context";

function requireAuth(context: GraphQLContext) {
  if (!context.user) throw new Error("Authentication required");
  return context.user;
}

function requireAdmin(context: GraphQLContext) {
  const user = requireAuth(context);
  if (user.role !== "ADMIN") throw new Error("Admin access required");
  return user;
}

export const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const user = requireAuth(context);
      return context.prisma.user.findUnique({
        where: { id: user.id },
        include: { businessProfile: true },
      });
    },

    users: async (_: unknown, { page = 1, limit = 20, search }: { page?: number; limit?: number; search?: string }, context: GraphQLContext) => {
      requireAdmin(context);
      const skip = (page - 1) * limit;
      return context.prisma.user.findMany({
        where: search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        include: { businessProfile: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      });
    },

    user: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      requireAdmin(context);
      return context.prisma.user.findUnique({
        where: { id },
        include: { businessProfile: true, downloads: { include: { card: true }, take: 10 } },
      });
    },

    categories: async (_: unknown, { includeHidden = false }: { includeHidden?: boolean }, context: GraphQLContext) => {
      const where = includeHidden ? {} : { isVisible: true };
      const categories = await context.prisma.festivalCategory.findMany({
        where,
        include: { cards: { where: { status: "PUBLISHED" }, take: 5 } },
        orderBy: { order: "asc" },
      });
      return categories.map((cat: typeof categories[0]) => ({ ...cat, cardCount: cat.cards.length }));
    },

    category: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      return context.prisma.festivalCategory.findUnique({
        where: { id },
        include: { cards: true },
      });
    },

    festivalCards: async (
      _: unknown,
      { categoryId, status, search, filter, page = 1, limit = 12 }: { categoryId?: string; status?: string; search?: string; filter?: string; page?: number; limit?: number },
      context: GraphQLContext
    ) => {
      const skip = (page - 1) * limit;
      const where: Record<string, unknown> = {};

      if (categoryId) where.categoryId = categoryId;
      if (status) where.status = status;
      else if (!context.user?.role || context.user.role !== "ADMIN") where.status = "PUBLISHED";
      if (search) where.title = { contains: search, mode: "insensitive" };
      if (filter === "trending") where.isTrending = true;
      if (filter === "featured") where.isFeatured = true;

      let orderBy: Record<string, string> = { createdAt: "desc" };
      if (filter === "popular") orderBy = { downloadCount: "desc" };

      return context.prisma.festivalCard.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy,
      });
    },

    festivalCard: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      return context.prisma.festivalCard.findUnique({
        where: { id },
        include: { category: true },
      });
    },

    dashboardStats: async (_: unknown, __: unknown, context: GraphQLContext) => {
      requireAdmin(context);
      const [totalUsers, totalCards, totalDownloads, totalCategories, recentUsers, recentCards] =
        await Promise.all([
          context.prisma.user.count({ where: { role: "USER" } }),
          context.prisma.festivalCard.count(),
          context.prisma.downloadHistory.count(),
          context.prisma.festivalCategory.count(),
          context.prisma.user.findMany({
            where: { role: "USER" },
            take: 5,
            orderBy: { createdAt: "desc" },
          }),
          context.prisma.festivalCard.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            include: { category: true },
          }),
        ]);

      return { totalUsers, totalCards, totalDownloads, totalCategories, recentUsers, recentCards };
    },

    myDownloads: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const user = requireAuth(context);
      return context.prisma.downloadHistory.findMany({
        where: { userId: user.id },
        include: { card: { include: { category: true } } },
        orderBy: { createdAt: "desc" },
      });
    },

    myBusinessProfile: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const user = requireAuth(context);
      return context.prisma.businessProfile.findUnique({ where: { userId: user.id } });
    },
  },

  Mutation: {
    register: async (_: unknown, { input }: { input: { email: string; password: string; name: string } }, context: GraphQLContext) => {
      const existing = await context.prisma.user.findUnique({ where: { email: input.email } });
      if (existing) throw new Error("Email already registered");

      const hashed = await hashPassword(input.password);
      const user = await context.prisma.user.create({
        data: { email: input.email, password: hashed, name: input.name, role: "USER" },
      });

      const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
      return { token, user };
    },

    login: async (_: unknown, { input }: { input: { email: string; password: string } }, context: GraphQLContext) => {
      const user = await context.prisma.user.findUnique({ where: { email: input.email } });
      if (!user) throw new Error("Invalid credentials");

      const valid = await comparePasswords(input.password, user.password);
      if (!valid) throw new Error("Invalid credentials");

      if (user.status === "SUSPENDED") throw new Error("Account suspended");

      const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });
      return { token, user };
    },

    createCategory: async (_: unknown, { input }: { input: Record<string, unknown> }, context: GraphQLContext) => {
      requireAdmin(context);
      const slug = slugify(input.name as string);
      return context.prisma.festivalCategory.create({
        data: { ...input, slug, name: input.name as string },
      });
    },

    updateCategory: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, context: GraphQLContext) => {
      requireAdmin(context);
      const slug = slugify(input.name as string);
      return context.prisma.festivalCategory.update({
        where: { id },
        data: { ...input, slug, name: input.name as string },
      });
    },

    deleteCategory: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      requireAdmin(context);
      await context.prisma.festivalCategory.delete({ where: { id } });
      return { success: true, message: "Category deleted" };
    },

    toggleCategoryVisibility: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      requireAdmin(context);
      const cat = await context.prisma.festivalCategory.findUnique({ where: { id } });
      if (!cat) throw new Error("Category not found");
      return context.prisma.festivalCategory.update({
        where: { id },
        data: { isVisible: !cat.isVisible },
      });
    },

    createFestivalCard: async (_: unknown, { input }: { input: Record<string, unknown> }, context: GraphQLContext) => {
      requireAdmin(context);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return context.prisma.festivalCard.create({ data: input as any, include: { category: true } });
    },

    updateFestivalCard: async (_: unknown, { id, input }: { id: string; input: Record<string, unknown> }, context: GraphQLContext) => {
      requireAdmin(context);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return context.prisma.festivalCard.update({ where: { id }, data: input as any, include: { category: true } });
    },

    deleteFestivalCard: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      requireAdmin(context);
      await context.prisma.festivalCard.delete({ where: { id } });
      return { success: true, message: "Card deleted" };
    },

    publishFestivalCard: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      requireAdmin(context);
      return context.prisma.festivalCard.update({
        where: { id },
        data: { status: "PUBLISHED" },
        include: { category: true },
      });
    },

    unpublishFestivalCard: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      requireAdmin(context);
      return context.prisma.festivalCard.update({
        where: { id },
        data: { status: "DRAFT" },
        include: { category: true },
      });
    },

    saveBusinessProfile: async (_: unknown, { input }: { input: Record<string, unknown> }, context: GraphQLContext) => {
      const user = requireAuth(context);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return context.prisma.businessProfile.upsert({ where: { userId: user.id }, update: input as any, create: { userId: user.id, ...(input as object) } });
    },

    recordDownload: async (_: unknown, { cardId, format }: { cardId: string; format: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      const [download] = await Promise.all([
        context.prisma.downloadHistory.create({
          data: { userId: user.id, cardId, format },
          include: { card: true },
        }),
        context.prisma.festivalCard.update({
          where: { id: cardId },
          data: { downloadCount: { increment: 1 } },
        }),
      ]);
      return download;
    },

    updateUserStatus: async (_: unknown, { id, status }: { id: string; status: string }, context: GraphQLContext) => {
      requireAdmin(context);
      return context.prisma.user.update({
        where: { id },
        data: { status: status as "ACTIVE" | "SUSPENDED" },
      });
    },

    deleteUser: async (_: unknown, { id }: { id: string }, context: GraphQLContext) => {
      requireAdmin(context);
      await context.prisma.user.delete({ where: { id } });
      return { success: true, message: "User deleted" };
    },

    updateProfile: async (_: unknown, { name, profileImage }: { name?: string; profileImage?: string }, context: GraphQLContext) => {
      const user = requireAuth(context);
      return context.prisma.user.update({
        where: { id: user.id },
        data: { ...(name && { name }), ...(profileImage && { profileImage }) },
        include: { businessProfile: true },
      });
    },
  },
};
