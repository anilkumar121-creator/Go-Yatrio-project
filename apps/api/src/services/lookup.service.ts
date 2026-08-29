import { prisma } from "../db.js";

export const lookupService = {
  listGroups(query: { search?: string; take?: number; skip?: number } = {}) {
    const { search, take = 100, skip = 0 } = query;

    return prisma.lookupGroup.findMany({
      where: search
        ? {
            OR: [
              { key: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
            ],
          }
        : {},
      orderBy: { name: "asc" },
      include: {
        _count: { select: { items: true } },
      },
      skip,
      take,
    });
  },

  getGroupByKey(key: string) {
    return prisma.lookupGroup.findUnique({
      where: { key },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  },

  createGroup(data: { key: string; name: string; description?: string }) {
    return prisma.lookupGroup.create({ data });
  },

  updateGroup(id: string, data: { key?: string; name?: string; description?: string }) {
    return prisma.lookupGroup.update({ where: { id }, data });
  },

  removeGroup(id: string) {
    return prisma.lookupGroup.delete({ where: { id } });
  },

  listItems(
    query: {
      groupId?: string;
      search?: string;
      isActive?: boolean;
      take?: number;
      skip?: number;
    } = {},
  ) {
    const { groupId, search, isActive, take = 200, skip = 0 } = query;

    return prisma.lookupItem.findMany({
      where: {
        ...(groupId ? { groupId } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(search
          ? {
              OR: [
                { label: { contains: search, mode: "insensitive" } },
                { value: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      include: { group: { select: { id: true, key: true, name: true } } },
      skip,
      take,
    });
  },

  createItem(data: {
    groupId: string;
    label: string;
    value: string;
    description?: string;
    icon?: string;
    color?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    return prisma.lookupItem.create({ data });
  },

  updateItem(
    id: string,
    data: Partial<{
      label: string;
      value: string;
      description: string;
      icon: string;
      color: string;
      sortOrder: number;
      isActive: boolean;
    }>,
  ) {
    return prisma.lookupItem.update({ where: { id }, data });
  },

  removeItem(id: string) {
    return prisma.lookupItem.delete({ where: { id } });
  },

  setItemStatus(id: string, isActive: boolean) {
    return prisma.lookupItem.update({ where: { id }, data: { isActive } });
  },

  setItemOrder(id: string, sortOrder: number) {
    return prisma.lookupItem.update({ where: { id }, data: { sortOrder } });
  },
};
