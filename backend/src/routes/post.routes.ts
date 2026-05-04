import { Router } from "express";
import {
  getPosts,
  getPostById,
  getPostsByUserId,
  createPost,
  deletePost,
  deletePostImage,
  updatePost,
  getNearbyPosts,
} from "../controllers/post.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/", getPosts);
router.get("/nearby", getNearbyPosts);             
router.get("/user/:userId", getPostsByUserId);

router.get("/:id", getPostById);

router.post("/", authMiddleware, upload.array("images", 5), createPost);
router.delete("/image", authMiddleware, deletePostImage);   
router.delete("/:id", authMiddleware, deletePost);
router.put("/:id", authMiddleware, upload.array("images", 5), updatePost);

export default router;
