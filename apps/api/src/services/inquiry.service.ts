import { prisma } from "../db.js";
import { notificationService } from "./notification.service.js";
import { InquirySource, InquiryType, InquiryStatusNew, InquiryPriority } from "@prisma/client";

export interface InquiryListQuery {
  search?: string;
  status?: InquiryStatusNew;
  priority?: InquiryPriority;
  source?: InquirySource;
  type?: InquiryType;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  take?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const inquiryService = {
  async list(query: InquiryListQuery = {}) {
    const {
      search,
      status,
      priority,
      source,
      type,
      assignedTo,
      dateFrom,
      dateTo,
      take = 50,
      skip = 0,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { inquiryNumber: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (source) where.source = source;
    if (type) where.type = type;
    if (assignedTo) where.assignedTo = assignedTo;

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      if (dateTo) (where.createdAt as Record<string, Date>).lte = new Date(dateTo);
    }

    const [items, total] = await Promise.all([
      prisma.inquiry.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take,
        include: {
          _count: { select: { notes: true, activities: true, assignments: true } },
        },
      }),
      prisma.inquiry.count({ where }),
    ]);

    return {
      items,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    };
  },

  async getById(id: string) {
    return prisma.inquiry.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: "desc" },
        },
        activities: {
          orderBy: { createdAt: "desc" },
        },
        assignments: {
          orderBy: { assignedAt: "desc" },
        },
      },
    });
  },

  async getByInquiryNumber(inquiryNumber: string) {
    return prisma.inquiry.findUnique({
      where: { inquiryNumber },
    });
  },

  async create(data: {
    name: string;
    email: string;
    phone: string;
    whatsapp?: string;
    country?: string;
    city?: string;
    adults?: number;
    children?: number;
    travelDate?: Date | string;
    budget?: number | string;
    message?: string;
    source?: InquirySource;
    type?: InquiryType;
    packageId?: string;
    hotelId?: string;
    cabId?: string;
  }) {
    const inquiryNumber = await this.generateInquiryNumber();

    const inquiry = await prisma.inquiry.create({
      data: {
        inquiryNumber,
        name: data.name,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp,
        country: data.country,
        city: data.city,
        adults: data.adults ?? 1,
        children: data.children ?? 0,
        travelDate: data.travelDate ? new Date(data.travelDate) : null,
        budget: data.budget ? Number(data.budget) : null,
        message: data.message,
        source: data.source ?? InquirySource.WEBSITE,
        type: data.type ?? InquiryType.GENERAL,
        status: InquiryStatusNew.NEW,
        priority: InquiryPriority.MEDIUM,
        packageId: data.packageId,
        hotelId: data.hotelId,
        cabId: data.cabId,
      },
    });

    await prisma.inquiryActivity.create({
      data: {
        inquiryId: inquiry.id,
        action: "INQUIRY_CREATED",
        newValue: `Inquiry created from ${data.source ?? "WEBSITE"}`,
        createdBy: "system",
      },
    });

    this.sendNewInquiryNotification(inquiry).catch(console.error);

    return inquiry;
  },

  async update(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string;
      whatsapp?: string;
      country?: string;
      city?: string;
      adults?: number;
      children?: number;
      travelDate?: Date | string;
      budget?: number | string;
      message?: string;
      source?: InquirySource;
      type?: InquiryType;
      status?: InquiryStatusNew;
      priority?: InquiryPriority;
      assignedTo?: string;
      packageId?: string;
      hotelId?: string;
      cabId?: string;
    }>,
    userId: string,
  ) {
    const oldInquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!oldInquiry) throw new Error("Inquiry not found");

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        whatsapp: data.whatsapp,
        country: data.country,
        city: data.city,
        adults: data.adults,
        children: data.children,
        travelDate: data.travelDate ? new Date(data.travelDate) : undefined,
        budget: data.budget ? Number(data.budget) : undefined,
        message: data.message,
        source: data.source,
        type: data.type,
        status: data.status,
        priority: data.priority,
        assignedTo: data.assignedTo,
        packageId: data.packageId,
        hotelId: data.hotelId,
        cabId: data.cabId,
      },
    });

    const changes: string[] = [];
    if (data.status && data.status !== oldInquiry.status) {
      changes.push(`status: ${oldInquiry.status} -> ${data.status}`);
      this.sendStatusChangeNotification(inquiry, oldInquiry.status, data.status).catch(
        console.error,
      );
    }
    if (data.priority && data.priority !== oldInquiry.priority) {
      changes.push(`priority: ${oldInquiry.priority} -> ${data.priority}`);
    }
    if (data.assignedTo && data.assignedTo !== oldInquiry.assignedTo) {
      changes.push(`assignedTo: ${oldInquiry.assignedTo ?? "none"} -> ${data.assignedTo}`);
    }

    if (changes.length > 0) {
      await prisma.inquiryActivity.create({
        data: {
          inquiryId: inquiry.id,
          action: "INQUIRY_UPDATED",
          newValue: changes.join(", "),
          createdBy: userId,
        },
      });
    }

    if (data.assignedTo && data.assignedTo !== oldInquiry.assignedTo) {
      await prisma.inquiryAssignment.create({
        data: {
          inquiryId: inquiry.id,
          assignedTo: data.assignedTo,
          assignedBy: userId,
        },
      });

      this.sendAssignmentNotification(inquiry, data.assignedTo).catch(console.error);
    }

    return inquiry;
  },

  async updateStatus(id: string, status: InquiryStatusNew, userId: string) {
    const oldInquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!oldInquiry) throw new Error("Inquiry not found");

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { status },
    });

    await prisma.inquiryActivity.create({
      data: {
        inquiryId: inquiry.id,
        action: "STATUS_CHANGED",
        oldValue: oldInquiry.status,
        newValue: status,
        createdBy: userId,
      },
    });

    this.sendStatusChangeNotification(inquiry, oldInquiry.status, status).catch(console.error);

    return inquiry;
  },

  async updatePriority(id: string, priority: InquiryPriority, userId: string) {
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { priority },
    });

    await prisma.inquiryActivity.create({
      data: {
        inquiryId: inquiry.id,
        action: "PRIORITY_CHANGED",
        newValue: priority,
        createdBy: userId,
      },
    });

    return inquiry;
  },

  async assign(id: string, assignedTo: string, assignedBy: string) {
    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: { assignedTo },
    });

    await prisma.inquiryAssignment.create({
      data: {
        inquiryId: inquiry.id,
        assignedTo,
        assignedBy,
      },
    });

    this.sendAssignmentNotification(inquiry, assignedTo).catch(console.error);

    return inquiry;
  },

  async addNote(inquiryId: string, note: string, createdBy: string) {
    const inquiry = await prisma.inquiry.findUnique({ where: { id: inquiryId } });
    if (!inquiry) throw new Error("Inquiry not found");

    const newNote = await prisma.inquiryNote.create({
      data: { inquiryId, note, createdBy },
    });

    await prisma.inquiryActivity.create({
      data: {
        inquiryId,
        action: "NOTE_ADDED",
        newValue: note,
        createdBy,
      },
    });

    return newNote;
  },

  async updateNote(noteId: string, note: string) {
    return prisma.inquiryNote.update({
      where: { id: noteId },
      data: { note },
    });
  },

  async deleteNote(noteId: string, createdBy?: string) {
    const note = await prisma.inquiryNote.findUnique({ where: { id: noteId } });
    if (!note) throw new Error("Note not found");

    await prisma.inquiryNote.delete({ where: { id: noteId } });

    await prisma.inquiryActivity.create({
      data: {
        inquiryId: note.inquiryId,
        action: "NOTE_DELETED",
        oldValue: note.note,
        createdBy: createdBy ?? "system",
      },
    });
  },

  async getActivities(inquiryId: string) {
    return prisma.inquiryActivity.findMany({
      where: { inquiryId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getNotes(inquiryId: string) {
    return prisma.inquiryNote.findMany({
      where: { inquiryId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getAssignments(inquiryId: string) {
    return prisma.inquiryAssignment.findMany({
      where: { inquiryId },
      orderBy: { assignedAt: "desc" },
    });
  },

  async getStats() {
    const [total, newCount, contacted, qualified, proposalSent, won, lost] = await Promise.all([
      prisma.inquiry.count(),
      prisma.inquiry.count({ where: { status: InquiryStatusNew.NEW } }),
      prisma.inquiry.count({ where: { status: InquiryStatusNew.CONTACTED } }),
      prisma.inquiry.count({ where: { status: InquiryStatusNew.QUALIFIED } }),
      prisma.inquiry.count({ where: { status: InquiryStatusNew.PROPOSAL_SENT } }),
      prisma.inquiry.count({ where: { status: InquiryStatusNew.WON } }),
      prisma.inquiry.count({ where: { status: InquiryStatusNew.LOST } }),
    ]);

    return { total, new: newCount, contacted, qualified, proposalSent, won, lost };
  },

  async getRecent(limit = 10) {
    return prisma.inquiry.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
  },

  async generateInquiryNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INQ-${year}`;
    const lastInquiry = await prisma.inquiry.findFirst({
      where: { inquiryNumber: { startsWith: prefix } },
      orderBy: { inquiryNumber: "desc" },
      select: { inquiryNumber: true },
    });

    let nextNumber = 1;
    if (lastInquiry) {
      const lastNum = parseInt(lastInquiry.inquiryNumber.replace(prefix, ""), 10);
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }

    return `${prefix}${String(nextNumber).padStart(4, "0")}`;
  },

  async sendNewInquiryNotification(inquiry: {
    id: string;
    inquiryNumber: string;
    name: string;
    email: string;
    source: string;
    type: string;
  }) {
    await notificationService.sendAdminNotification({
      inquiryId: inquiry.id,
      action: "created",
      newValue: `New ${inquiry.type} inquiry from ${inquiry.source}: ${inquiry.name} (${inquiry.email})`,
      to: "admin",
      message: `New inquiry ${inquiry.inquiryNumber} received from ${inquiry.name}`,
    });
  },

  async sendStatusChangeNotification(
    inquiry: { id: string; inquiryNumber: string; name: string },
    oldStatus: string,
    newStatus: string,
  ) {
    await notificationService.sendAdminNotification({
      inquiryId: inquiry.id,
      action: "status_changed",
      oldValue: oldStatus,
      newValue: newStatus,
      to: "admin",
      message: `Inquiry ${inquiry.inquiryNumber} status changed from ${oldStatus} to ${newStatus}`,
    });
  },

  async sendAssignmentNotification(
    inquiry: { id: string; inquiryNumber: string; name: string },
    assignedTo: string,
  ) {
    await notificationService.sendAdminNotification({
      inquiryId: inquiry.id,
      action: "assigned",
      newValue: `Assigned to user ${assignedTo}`,
      to: assignedTo,
      message: `Inquiry ${inquiry.inquiryNumber} has been assigned to you`,
    });
  },

  async delete(id: string) {
    return prisma.inquiry.delete({ where: { id } });
  },
};
