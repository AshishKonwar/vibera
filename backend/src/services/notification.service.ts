import { prisma } from "../config/db";
import { NotificationType } from "@prisma/client";

export const notificationService = {
  create: async (
    userId: string,
    message: string,
    type: NotificationType,
    actorId?: string
  ) => {
    if (!userId || !message || !type) return;

    return prisma.notification.create({
      data: {
        userId,
        message,
        type,
        actorId,
      },
    });
  },

  getByUser: async (userId: string) => {
    if (!userId) {
      throw new Error("userId is required");
    }

    return prisma.notification.findMany({
      where: { userId },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
          },
        },
      } as any,
      orderBy: { createdAt: "desc" },
    });
  },

    markAllAsRead: async (userId: string) => {
    return prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  },
};