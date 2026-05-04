import { prisma } from "../config/db";
import { generateVibesFromDescription } from "../utils/AIhelper";
import { getDistanceInKm } from "../utils/getDistanceInKm";
import { uploadImageToCloudinary } from "./upload.service";
import fs from "fs/promises";
import { Vibe } from "@prisma/client";

export const postService = {
  createPost: async (
    title: string,
    description: string,
    userId: string,
    files?: Express.Multer.File[],
    latitude?: number,
    longitude?: number,
    address?: string
  ) => {
    if (!title || !description || !userId) {
      throw new Error("All fields are required");
    }

    let imageUrls: string[] = [];
    let imagePublicIds: string[] = [];

    let vibes: string[] = [];

    try {
      vibes = await generateVibesFromDescription(description);
    } catch (e) {
      console.error("AI tagging failed:", e);
    }

    const allowedVibes = [
      "DATING","FRIENDS","FAMILY","SOLO",
      "STREET_FOOD","BUDGET_EATS","PREMIUM_DINING","LOCAL_AUTHENTIC",
      "MUSIC","QUIET","ROMANTIC","LATE_NIGHT",
      "SIGHTSEEING","INSTAGRAM_WORTHY","NATURE","CITY_VIEW",
      "HIDDEN_GEM","UNDER_100","STUDENT_FRIENDLY","QUICK_BITE"
    ];

    const safeVibes = vibes.filter(v => allowedVibes.includes(v));

    if (files && files.length > 0) {
      for (const file of files) {
        const uploaded = await uploadImageToCloudinary(file.path);

        if (!uploaded) {
          throw new Error("Image upload failed");
        }

        imageUrls.push(uploaded.url);
        imagePublicIds.push(uploaded.public_id);

        await fs.unlink(file.path);
      }
    }

    return prisma.post.create({
      data: {
        title,
        description,
        userId,
        imageUrls,        
        imagePublicIds,  
        latitude: latitude || null,
        longitude: longitude || null,
        address: address || null,
        vibes: safeVibes as Vibe[], 
      },
    });
  },

  getAllPosts: async (
  page: number = 1,
  limit: number = 10,
  vibes: string[] = []
  ) => {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (vibes.length > 0) {
      where.vibes = {
        hasSome: vibes, 
      };
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where, 
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true },
          },
          _count: {
            select: { likes: true, comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getPostById: async (id: string) => {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: true,
        comments: {
          include: { user: true },
        },
        likes: true,
      },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  },

  deletePost: async (postId: string, userId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      userId: true,
      imagePublicIds: true,
    },
  });

  if (!post) throw new Error("Post not found");
  if (post.userId !== userId) throw new Error("Unauthorized");

  if (post.imagePublicIds?.length) {
    const cloudinary = (await import("../config/cloudinary")).default;

    await Promise.all(
      post.imagePublicIds.map((publicId) =>
        cloudinary.uploader.destroy(publicId)
      )
    );
  }

  await prisma.$transaction([
    prisma.like.deleteMany({
      where: { postId },
    }),

    prisma.comment.deleteMany({
      where: { postId },
    }),

    prisma.post.delete({
      where: { id: postId },
    }),
  ]);

  return { message: "Post deleted" };
},

    deletePostImage: async (
      postId: string,
      userId: string,
      imagePublicId: string
    ) => {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      if (post.userId !== userId) {
        throw new Error("Unauthorized");
      }

      if (!post.imagePublicIds.includes(imagePublicId)) {
        throw new Error("Image not found in post");
      }

      const cloudinary = (await import("../config/cloudinary")).default;

      await cloudinary.uploader.destroy(imagePublicId);

      const updatedImagePublicIds = post.imagePublicIds.filter(
        (id) => id !== imagePublicId
      );

      const updatedImageUrls = post.imageUrls.filter(
        (_, index) => post.imagePublicIds[index] !== imagePublicId
      );

      return prisma.post.update({
        where: { id: postId },
        data: {
          imagePublicIds: updatedImagePublicIds,
          imageUrls: updatedImageUrls,
        },
      });
    },

  updatePost: async (
  postId: string,
  userId: string,
  title?: string,
  description?: string,
  files?: Express.Multer.File[],
  latitude?: number,
  longitude?: number,
  address?: string
  ) => {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.userId !== userId) {
    throw new Error("Unauthorized");
  }

  let imageUrls = [...post.imageUrls];
  let imagePublicIds = [...post.imagePublicIds];

  if (files && files.length > 0) {
    for (const file of files) {
      const uploaded = await uploadImageToCloudinary(file.path);

      if (!uploaded) {
        throw new Error("Image upload failed");
      }

      imageUrls.push(uploaded.url);
      imagePublicIds.push(uploaded.public_id);

      await fs.unlink(file.path);
    }
  }

  let vibes = post.vibes;

  if (description && description !== post.description) {
    try {
      const generatedVibes = await generateVibesFromDescription(description);

      const allowedVibes = [
        "DATING","FRIENDS","FAMILY","SOLO",
        "STREET_FOOD","BUDGET_EATS","PREMIUM_DINING","LOCAL_AUTHENTIC",
        "MUSIC","QUIET","ROMANTIC","LATE_NIGHT",
        "SIGHTSEEING","INSTAGRAM_WORTHY","NATURE","CITY_VIEW",
        "HIDDEN_GEM","UNDER_100","STUDENT_FRIENDLY","QUICK_BITE"
      ];

      vibes = generatedVibes.filter(v => allowedVibes.includes(v));

    } catch (e) {
      console.error("AI vibe update failed:", e);
    }
  }

  return prisma.post.update({
    where: { id: postId },
    data: {
      title: title ?? post.title,
      description: description ?? post.description,
      imageUrls,
      imagePublicIds,
      vibes,
      ...(latitude !== undefined && { latitude }),
      ...(longitude !== undefined && { longitude }),
      ...(address !== undefined && { address }),
    },
  });
},

  getPostsByUserId: async (
    userId: string,
    page: number = 1,
    limit: number = 10
  ) => {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where: { userId },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true },
          },
          _count: {
            select: { likes: true, comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.post.count({ where: { userId } }),
    ]);

    return {
      data: posts,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getPostsNearMe: async (
  userLat: number,
  userLng: number,
  radiusKm: number = 5,
  page: number = 1,
  limit: number = 10,
  userPreferredVibes: string[] = []
) => {
  const posts = await prisma.post.findMany({
    where: {
    latitude: { not: null },
    longitude: { not: null },
    ...(userPreferredVibes.length > 0 && {
      vibes: { hasSome: userPreferredVibes as Vibe[] },
    }),
  },
    include: {
      user: {
        select: { id: true, name: true },
      },
      _count: {
        select: { likes: true, comments: true },
      },
    },
  });


  const enriched = posts.map((post) => {
    const distance = getDistanceInKm(
      userLat,
      userLng,
      post.latitude!,
      post.longitude!
    );

    if (distance > radiusKm) return null;

    const vibeMatchScore = post.vibes
      ? post.vibes.filter((v) => userPreferredVibes.includes(v)).length
      : 0;

    const score =
      post._count.likes * 2 +
      post._count.comments * 1.5 +
      vibeMatchScore * 3 -
      distance * 1.2;

    return {
      ...post,
      distance: Number(distance.toFixed(2)),
      score: Number(score.toFixed(2)),
    };
  }).filter(Boolean);

  enriched.sort((a: any, b: any) => b.score - a.score);

  const total = enriched.length;
  const start = (page - 1) * limit;
  const data = enriched.slice(start, start + limit);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
}
};