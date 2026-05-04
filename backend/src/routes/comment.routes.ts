import { Router } from "express";
import {
  createComment,
  deleteComment,
  editComment,
  getComments,
  getReplies,
} from "../controllers/comment.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createComment);
router.get("/:postId", authMiddleware, getComments);
router.put("/", authMiddleware, editComment);
router.delete("/", authMiddleware, deleteComment);
router.get("/:commentId/replies", authMiddleware, getReplies);

export default router;