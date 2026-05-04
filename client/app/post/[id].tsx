import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Linking
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePostById } from "@/src/hooks/usePosts";
import { COLORS } from "@/src/theme/colors";
import { Image } from "expo-image";
import PagerView from "react-native-pager-view";
import PostActions from "@/src/components/post/PostActions";
import CommentList from "@/src/components/comment/CommentList";
import CommentInput, {
  CommentInputHandle,
} from "@/src/components/comment/CommentInput";
import CommentInputTrigger from "@/src/components/comment/CommentInputTrigger";
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRef, useState } from "react";
import { formatVibes } from "@/src/utils/formatVibes";
import { SPACING } from "@/src/theme/spacing";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

type ReplyTarget = { id: string; userName: string };

export default function PostDetails() {
  const { id } = useLocalSearchParams();
  console.log('PostDetails mounted, id =', id, 'typeof:', typeof id);
  const router = useRouter();

  const postId = Array.isArray(id) ? id[0] : id;

  const { data: post, isPending, isError } = usePostById(postId as string);

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const inputRef = useRef<CommentInputHandle>(null);

  const handleReply = (target: ReplyTarget) => {
    inputRef.current?.open(target);
  };

  const openComposer = () => {
    inputRef.current?.open(null);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/(auth)/signin");
  };

  const openInMaps = () => {
  if (!post?.latitude || !post?.longitude) return;

  const url = `https://www.google.com/maps/search/?api=1&query=${post.latitude},${post.longitude}`;

  Linking.openURL(url);
  };

  if (!postId || isPending) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: COLORS.subtext }}>Post not found</Text>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ListHeader = (
    <>
      {post.imageUrls?.length > 0 && (
        <View>
          <View style={styles.carousel}>
            <PagerView
              style={{ flex: 1 }}
              initialPage={0}
              onPageSelected={(e) => setActiveImageIndex(e.nativeEvent.position)}
            >
              {post.imageUrls.map((img: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: img }}
                  style={styles.image}
                  contentFit="cover"
                />
              ))}
            </PagerView>
          </View>

          {post.imageUrls.length > 1 && (
            <View style={styles.dotsContainer}>
              {post.imageUrls.map((_: string, index: number) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === activeImageIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username}>{post.user?.username}</Text>
          <TouchableOpacity onPress={openInMaps}>
            <Text style={styles.location}>
              📍 {post.address || "Unknown location"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <PostActions postId={post.id} />
          <Text style={styles.commentsCount}>
            💬 {post.comments?.length || 0}
          </Text>
        </View>

        {post.vibes?.length > 0 && (
          <View style={styles.vibesContainer}>
            {post.vibes.map((vibe: string) => (
              <View key={vibe} style={styles.vibeChip}>
                <Text style={styles.vibeText}>{formatVibes(vibe)}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.caption}>{post.description}</Text>
      </View>

      <View style={styles.divider} />

      <Text style={styles.commentsHeader}>Comments</Text>
    </>
  );

  return (
    <BottomSheetModalProvider>
      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >

        <CommentList
          postId={postId as string}
          ListHeaderComponent={ListHeader}
          onReply={handleReply}
        />

        <CommentInputTrigger onPress={openComposer} />

        <View style={styles.commentInputWrapper}>
          <CommentInput postId={postId as string} ref={inputRef} />
        </View> 

        <ConfirmDialog
          visible={showLogoutDialog}
          title="Logout"
          message="Are you sure you want to log out?"
          onCancel={() => setShowLogoutDialog(false)}
          onConfirm={handleLogout}
          confirmText="Logout"
        />
      </KeyboardAvoidingView>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loader: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  carousel: {
    height: 300,
    backgroundColor: COLORS.card,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  header: {
    marginBottom: 8,
  },
  username: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  location: {
    color: COLORS.subtext,
    fontSize: 11,
    marginTop: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 8,
  },
  commentsCount: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  vibesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  vibeChip: {
    backgroundColor: "rgba(111,53,186,0.15)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  vibeText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "500",
  },
  caption: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 6,
  },
  commentsHeader: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 4,
  },
  commentInputWrapper: {
    marginBottom: 24,
  },
  dotsContainer: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 6,
  paddingVertical: 10,
  backgroundColor: COLORS.background,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});