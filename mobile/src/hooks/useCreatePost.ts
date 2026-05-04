import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../features/post/post.api";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["userPosts"] });
    },

    onError: (err) => {
      console.log("ERROR:", err);
    },
  });
};