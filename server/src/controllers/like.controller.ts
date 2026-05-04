import { Request, Response } from "express";
import { likeService } from "../services/like.service";
import { AuthRequest } from "../interfaces/authInterface";

interface Params {
  postId: string;
}

export const likePost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({ message: "postId is required" });
    }

    const result = await likeService.likePost(req.user.id, postId);

    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const unlikePost = async ( req: AuthRequest & Request<Params>, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { postId } = req.params; 

    if (!postId) {
      return res.status(400).json({ message: "postId is required" });
    }

    const result = await likeService.unlikePost(req.user.id, postId);

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message }); 
  }
};

export const getLikesCount = async (req: Request, res: Response) => {
  try {
    const count = await likeService.getLikesCount(req.params.postId as string);
    res.json({ count });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const hasUserLiked = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.query;  

    const liked = await likeService.hasUserLiked(
      req.user?.id as string,
      postId as string
    );

    res.json({ liked });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};