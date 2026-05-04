import { TouchableOpacity, Text } from "react-native";
import { useToggleLike, useLikesCount, useHasLiked } from "@/src/hooks/useLikes";
import { COLORS } from "@/src/theme/colors";

export default function PostActions({ postId }: any) {

  const { data: likesCount } = useLikesCount(postId);
  const { data: liked } = useHasLiked(postId);

  const { mutate } = useToggleLike();

  return (
    <TouchableOpacity
      onPress={() =>
        mutate({
          postId,
          liked,
        })
      }
    >
        <Text style={{ color: COLORS.subtext }}>
        {liked ? "❤️" : "🤍"} {likesCount?.count ?? 0}
        </Text>    
        </TouchableOpacity>
  );
}