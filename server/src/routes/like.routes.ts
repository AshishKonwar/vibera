import { Router } from "express";
import {
  likePost,
  unlikePost,
  getLikesCount,
  hasUserLiked,
} from "../controllers/like.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, likePost);
router.delete("/:postId", authMiddleware, unlikePost);
router.get("/count/:postId", authMiddleware, getLikesCount);
router.get("/check", authMiddleware, hasUserLiked);

export default router;

