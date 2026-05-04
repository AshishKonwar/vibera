import { Request, Response } from "express";
import { commentService } from "../services/comment.service";
import { AuthRequest } from "../interfaces/authInterface";

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { postId, content, parentId } = req.body;

    const comment = await commentService.createComment(
    req.user?.id as string,
    postId,
    content,
    parentId
  );

    res.status(201).json(comment);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const comments = await commentService.getCommentsByPost(
      req.params.postId as string
    );

    res.json(comments);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const editComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { commentId, content } = req.body;

    const result = await commentService.editComment(
      commentId,
      req.user.id,
      content
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { commentId } = req.body;

    const result = await commentService.deleteComment(
      commentId,
      req.user.id
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getReplies = async (req: Request, res: Response) => {
  try {
    const commentId = req.params.commentId as string;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const replies = await commentService.getRepliesByComment(
      commentId,
      page,
      limit
    );

    res.json(replies);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};