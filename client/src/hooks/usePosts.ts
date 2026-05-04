import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deletePost, getPostById, getPosts, getPostsByUserId, updatePost } from "../features/post/post.api";
import { mapPost } from "../features/post/post.mapper";

export const useInfinitePosts = (vibes: string[] = []) => {
  return useInfiniteQuery({
    queryKey: ["posts", vibes],
    queryFn: ({ pageParam }) =>
      getPosts({ page: pageParam as number, limit: 5, vibes }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
  });
};


export const usePostById = (postId: string) =>
  useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId),
    enabled: !!postId,
  });

export const usePostsByUserId = (userId: string) =>
  useQuery({
    queryKey: ["userPosts", userId],
    queryFn: () => getPostsByUserId(userId),
    enabled: !!userId,
  });

export const useUpdatePost = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePost,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["userPosts"] });
      qc.invalidateQueries({ queryKey: ["post", vars.postId] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
};

export const useDeletePost = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onSuccess: (_, postId) => {
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["userPosts"] });
      qc.removeQueries({ queryKey: ["post", postId] });
    },
  });
};