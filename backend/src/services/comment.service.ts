import { prisma } from "../config/db";
import { notificationService } from "./notification.service";

export const commentService = {
  createComment: async (
    userId: string,
    postId: string,
    content: string,
    parentId?: string
  ) => {
    if (!userId || !postId || !content) {
      throw new Error("All fields are required");
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    const comment = await prisma.comment.create({
      data: {
        userId,
        postId,
        content,
        parentId: parentId || null,
      },
    });

    await notificationService.create(
            post.userId,
            "commented on your post",
            "COMMENT",
            userId 
          );
          
    return comment;
  },

  getCommentsByPost: async (postId: string) => {
  return prisma.comment.findMany({
    where: { postId, parentId: null }, 
    include: {
      user: {
        select: { id: true, name: true },
      },
      replies: {
        include: {
          user: {
            select: { id: true, name: true },
          },
          parent: {
            include: {
              user: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  },

  editComment: async (
  commentId: string,
  userId: string,
  content: string
) => {
  if (!commentId || !userId || !content) {
    throw new Error("All fields are required");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      post: true,
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== userId && comment.post.userId !== userId) {
    throw new Error("Unauthorized");
  }

  return prisma.comment.update({
    where: { id: commentId },
    data: { content, isEdited: true },
  });
  },

  deleteComment: async (commentId: string, userId: string) => {
  if (!commentId || !userId) {
    throw new Error("All fields are required");
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: true },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.userId !== userId && comment.post.userId !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.comment.deleteMany({ where: { parentId: commentId } });
  await prisma.comment.delete({ where: { id: commentId } });

  return { message: "Comment deleted successfully" };
  },

  getRepliesByComment: async (
  commentId: string,
  page: number = 1,
  limit: number = 5
  ) => {
  if (!commentId) {
    throw new Error("commentId is required");
  }

  const skip = (page - 1) * limit;

  const commentWhere = { parentId: commentId } as any;

  const [replies, total] = await Promise.all([
    prisma.comment.findMany({
      where: commentWhere,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      skip,
      take: limit,
    }),
    prisma.comment.count({
      where: commentWhere,
    }),
  ]);

  return {
    data: replies,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
  },
};