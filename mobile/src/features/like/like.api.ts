import { api } from "@/src/services/api";

export const likePost = async (postId: string) => {
  return api.post("/likes", { postId });
};

export const unlikePost = async (postId: string) => {
  return api.delete(`/likes/${postId}`);
};

export const getLikesCount = async (postId: string) => {

  try {
    const res = await api.get(`/likes/count/${postId}`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
};

export const checkLiked = async (postId: string) => {
  const res = await api.get(`/likes/check?postId=${postId}`);
  return res.data;
};