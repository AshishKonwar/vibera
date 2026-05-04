import { Request, Response } from "express";
import { postService } from "../services/post.service";
import { AuthRequest } from "../interfaces/authInterface";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const { vibes } = req.query;

    const vibeArray = vibes
      ? (vibes as string)
          .split(",")
          .map(v => v.trim().toUpperCase())
      : [];

    const posts = await postService.getAllPosts(
      page,
      limit,
      vibeArray 
    );

    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await postService.getPostById(req.params.id as string);
    res.json(post);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  
    try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, description, latitude, longitude, address } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    if (latitude && (latitude < -90 || latitude > 90)) {
      throw new Error("Invalid latitude");
    }

    const files = req.files as Express.Multer.File[] | undefined;

    const post = await postService.createPost(
      title,
      description,
      req.user.id,
      files,
      latitude ? parseFloat(latitude) : undefined,
      longitude ? parseFloat(longitude) : undefined,
      address
    );

    res.status(201).json(post);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = await postService.deletePost(
      req.params.id as string,
      req.user.id
    );

    res.json(result);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const deletePostImage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { postId, imagePublicId } = req.body;

    const result = await postService.deletePostImage(
      postId,
      req.user.id,
      imagePublicId
    );

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const postId = req.params.id as string;
    const { title, description, latitude, longitude, address } = req.body;

    const files = req.files as Express.Multer.File[] | undefined;

    const updatedPost = await postService.updatePost(
      postId,
      req.user.id,
      title,
      description,
      files,
      latitude ? parseFloat(latitude) : undefined,
      longitude ? parseFloat(longitude) : undefined,
      address
    );

    res.json(updatedPost);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getPostsByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const posts = await postService.getPostsByUserId(userId, page, limit);
    res.json(posts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getNearbyPosts = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius, page = "1", limit = "10", vibes } = req.query;

    const preferredVibes = vibes
    ? (vibes as string).split(",").map(v => v.toUpperCase())
    : [];

    if (!lat || !lng) {
      return res.status(400).json({ message: "lat and lng are required" });
    }

    const userLat = parseFloat(lat as string);
    const userLng = parseFloat(lng as string);

    if (isNaN(userLat) || isNaN(userLng)) {
      return res.status(400).json({ message: "Invalid lat/lng values" });
    }

    const radiusKm = radius ? parseFloat(radius as string) : 5;

    const parsedPage = Math.max(parseInt(page as string, 10), 1);
    const parsedLimit = Math.min(
      Math.max(parseInt(limit as string, 10), 1),
      50
    );

    const result = await postService.getPostsNearMe(
      userLat,
      userLng,
      radiusKm,
      parsedPage,
      parsedLimit,
      preferredVibes
    );

    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};