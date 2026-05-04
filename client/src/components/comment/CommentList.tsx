import { FlatList } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useComments } from "@/src/hooks/useComments";
import CommentItem from "./CommentItem";

type ReplyTarget = { id: string; userName: string };

type CommentListProps = {
  postId: string;
  onReply?: (target: ReplyTarget) => void;
  ListHeaderComponent?: any;
  ListFooterComponent?: any;
};

export default function CommentList({
  postId,
  onReply,
  ListHeaderComponent,
  ListFooterComponent,
}: CommentListProps) {
  const { data = [] } = useComments(postId);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("user").then((raw) => {
      if (raw) setCurrentUserId(JSON.parse(raw).id);
    });
  }, []);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CommentItem comment={item} onReply={onReply} currentUserId={currentUserId} postId={postId} />
      )}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 12 }}
    />
  );
}
