import { Response } from "express";
import { AuthRequest } from "../interfaces/authInterface";
import { notificationService } from "../services/notification.service";

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const data = await notificationService.getByUser(req.user.id);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const markNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await notificationService.markAllAsRead(req.user.id);

    res.json({ message: "Marked as read" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};