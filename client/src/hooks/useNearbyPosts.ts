import { useQuery } from "@tanstack/react-query";
import { getNearbyPosts } from  "../features/post/post.api";

export const useNearbyPosts = (params: any) =>
  useQuery({
    queryKey: ["nearby", params],
    queryFn: () => getNearbyPosts(params),
    enabled: !!params?.lat && !!params?.lng,
  });