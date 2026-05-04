import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  likePost,
  unlikePost,
  getLikesCount,
  checkLiked,
} from "../features/like/like.api";

export const useLikesCount = (postId: string) =>
  useQuery({
    queryKey: ["likes", postId],
    queryFn: () => getLikesCount(postId),
    enabled: !!postId,
  });

export const useHasLiked = (postId: string) =>
  useQuery({
    queryKey: ["liked", postId],
    queryFn: () => checkLiked(postId),
    enabled: !!postId,
    select: (data) => data?.liked ?? false,
  });

export const useToggleLike = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, liked }: any) =>
        liked ? unlikePost(postId) : likePost(postId),

    onSuccess: (data, { postId }) => {

        qc.invalidateQueries({ queryKey: ["likes", postId] });
        qc.invalidateQueries({ queryKey: ["liked", postId] });
        qc.invalidateQueries({ queryKey: ["posts"] });
        },
        
        onError: (error: any) => {
        console.log("LIKE ERROR:", error?.response?.data?.message ?? error?.message ?? error);
}
  });
};