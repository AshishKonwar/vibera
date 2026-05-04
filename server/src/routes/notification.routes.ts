import { Router } from "express";
import {
  getNotifications,
  markNotificationsRead,
} from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authMiddleware, getNotifications);
router.patch("/notifications/read", authMiddleware, markNotificationsRead);

export default router;