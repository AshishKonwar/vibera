import { Post } from "./post.types";

export const mapPost = (post: Post) => {
  return {
    id: post.id,

    imageUrls: post.imageUrls,

    caption: `${post.title} - ${post.description}`,

    user: {
      username: post.user.name,
    },

    likesCount: post._count.likes,
    commentsCount: post._count.comments,

    isLiked: false,

    locationName: post.title,

    vibes: post.vibes
  };
};