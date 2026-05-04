import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../features/post/post.api";

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,

    onSuccess: (newPost) => {
      queryClient.setQueriesData(
        { queryKey: ["posts"] },
        (old: any) => {
          if (!old) return [newPost];

          if (Array.isArray(old)) {
            return [newPost, ...old];
          }

          if (old.posts && Array.isArray(old.posts)) {
            return {
              ...old,
              posts: [newPost, ...old.posts],
            };
          }

          return old;
        }
      );

      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },

    onError: (err) => {
      console.log("ERROR:", err);
    },
  });
};