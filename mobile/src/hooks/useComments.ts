import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComments,
  addComment,
  editComment,
  deleteComment,
  getReplies,
} from "../features/comment/comment.api";

export const useComments = (postId: string) =>
  useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getComments(postId),
    enabled: !!postId,
  });

export const useAddComment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: addComment,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["comments", vars.postId] });
      qc.invalidateQueries({ queryKey: ["post", vars.postId] });
      if (vars.parentId) {
        qc.invalidateQueries({ queryKey: ["replies", vars.parentId] });
      }
    },
  });
};

export const useEditComment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { commentId: string; content: string; postId: string; parentId?: string }) =>
      editComment({ commentId: vars.commentId, content: vars.content }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["comments", vars.postId] });
      if (vars.parentId) {
        qc.invalidateQueries({ queryKey: ["replies", vars.parentId] });
      }
    },
  });
};

export const useDeleteComment = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { commentId: string; postId: string }) =>
      deleteComment(vars.commentId),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["comments", vars.postId] });
      qc.invalidateQueries({ queryKey: ["post", vars.postId] });
    },
  });
};

export const useReplies = (commentId: string) =>
  useQuery({
    queryKey: ["replies", commentId],
    queryFn: () => getReplies(commentId),
    enabled: !!commentId,
    select: (data) => data.data,
  });