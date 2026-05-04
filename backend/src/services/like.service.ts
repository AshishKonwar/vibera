import { prisma } from "../config/db";
import { notificationService } from "./notification.service";

export const likeService = {
  likePost: async (userId: string, postId: string) => {
    if (!userId || !postId) {
      throw new Error("userId and postId are required");
    }

    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      const like = await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });

      notificationService.create(
        post.userId,
        "liked your post",
        "LIKE",
        userId
      ).catch((err) => console.error("Notification creation failed:", err));

      return like;
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new Error("You already liked this post");
      }

      throw error;
    }
  },

  unlikePost: async (userId: string, postId: string) => {
    if (!userId || !postId) {
      throw new Error("userId and postId are required");
    }

    try {
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });

      return { message: "Unliked successfully" };
    } catch (error) {
      throw new Error("Like not found or already removed");
    }
  },
  
  getLikesCount: async (postId: string) => {
    if (!postId) {
      throw new Error("postId is required");
    }

    return prisma.like.count({
      where: { postId },
    });
  },

  hasUserLiked: async (userId: string, postId: string) => {
    if (!userId || !postId) {
      throw new Error("userId and postId are required");
    }

    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    return !!like;
  },

  getLikesForPost: async (postId: string) => {
    return prisma.like.findMany({
      where: { postId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },
};