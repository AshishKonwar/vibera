import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { useState, memo, useRef } from "react";
import PagerView from "react-native-pager-view";
import { Image } from "expo-image";
import { COLORS } from "../../theme/colors";
import { SPACING } from "../../theme/spacing";
import { formatVibes } from "@/src/utils/formatVibes";
import PostActions from "./PostActions";
import { useRouter } from "expo-router/build/exports";

interface PostCardProps {
  post: any;
  onLike?: (id: string) => void;
  onComment?: (id: string) => void;
  onPress?: () => void;
}

const { width } = Dimensions.get("window");

const PostCard = ({
  post,
  onPress,
}: PostCardProps) => {
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const router = useRouter();

  const lastTapRef = useRef(0);

  const handlePress = (id: string) => {
  const now = Date.now();
  if (now - lastTapRef.current < 1000) return; 
  lastTapRef.current = now;
  router.push(`/post/${id}`);
  };

  const openViewer = (index: number) => {
    setSelectedIndex(index);
    setViewerVisible(true);

    scaleAnim.setValue(0.8);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeViewer = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setViewerVisible(false);
    });
  };

  return (
    <>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <View style={styles.card}>
          
          <View style={styles.header}>
            {/* <View style={styles.avatar}>
                <MaterialCommunityIcons
                    name="account"
                    size={22}
                    color={COLORS.subtext}
                />
                </View> */}

            <View style={styles.headerText}>
                <Text style={styles.username}>
                {post.user?.username}
                </Text>

                <View style={styles.locationRow}>
                <Image
                    source={require("../../../assets/images/app_logo.png")} 
                    style={styles.locationIcon}
                    contentFit="contain"
                />

                <Text style={styles.meta}>
                    {post.locationName}
                </Text>
                </View>
            </View>
            </View>

          {post.imageUrls?.length > 0 && (
            <View style={styles.gridContainer}>
              {post.imageUrls.slice(0, 3).map((img: string, index: number) => {
                const remaining = post.imageUrls.length - 3;
                const isLast = index === 2 && remaining > 0;

                return (
                  <Pressable
                    key={index}
                    style={styles.gridItem}
                    onPress={() => openViewer(index)}
                  >
                    <Image
                      source={{ uri: img }}
                      style={styles.gridImage}
                      contentFit="cover"
                    />

                    {isLast && (
                      <View style={styles.moreOverlay}>
                        <Text style={styles.moreText}>+{remaining}</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          <View style={styles.actions}>

            <PostActions postId={post.id} />

            <TouchableOpacity onPress={() => handlePress(post.id)}>
              <Text style={styles.actionText}>
                💬 {post.commentsCount}
              </Text>
            </TouchableOpacity>
          </View>

          {post.vibes?.length > 0 && (
            <View style={styles.vibesContainer}>
              {post.vibes.map((vibe: string) => (
                <View key={vibe} style={styles.vibeChip}>
                  <Text style={styles.vibeText}>
                    {formatVibes(vibe)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* CAPTION */}
          <View style={styles.content}>
            <Text style={styles.description}>
              {post.caption}
            </Text>
          </View>

        </View>
      </TouchableOpacity>

      <Modal visible={viewerVisible} transparent>
        <Animated.View
          style={[
            styles.modalContainer,
            { opacity: opacityAnim },
          ]}
        >
          <Animated.View
            style={{
              flex: 1,
              transform: [{ scale: scaleAnim }],
            }}
          >
            <PagerView
              style={styles.fullscreenPager}
              initialPage={selectedIndex}
            >
              {post.imageUrls.map((img: string, index: number) => (
                <View key={index}>
                  <Image
                    source={{ uri: img }}
                    style={styles.fullscreenImage}
                    contentFit="contain"
                  />
                </View>
              ))}
            </PagerView>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={closeViewer}
            >
              <Text style={{ color: "white", fontSize: 22 }}>✕</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
};

export default memo(PostCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
    borderRadius: 12,
    overflow: "hidden",
  },

  header: {
    padding: SPACING.md,
  },

  avatar: {
  width: 40,
  height: 40,
  borderRadius: 100, 
  backgroundColor: "rgba(111,53,186,0.12)",
  justifyContent: "center",
  alignItems: "center",
  marginRight: 10,
    },

    headerText: {
    flex: 1,
    },

    username: {
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 5,
    },

    locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    },

    locationIcon: {
    width: 25,
    height: 15,
    marginRight: 4,
    },

    meta: {
    color: COLORS.subtext,
    fontSize: 12,
    },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: SPACING.md,
  },

  gridItem: {
    width: "33.33%",
    aspectRatio: 1,
    padding: 3,
  },

  gridImage: {
  width: "100%",
  height: "100%",
  borderRadius: 8,

  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 6,

  elevation: 6,
},

  actions: {
    flexDirection: "row",
    gap: 20,
    padding: SPACING.md,
  },

  actionText: {
    color: COLORS.text,
    fontSize: 14,
  },

  content: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },

  description: {
    color: COLORS.text,
    fontSize: 14,
  },

  vibesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
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

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },

  fullscreenPager: {
    flex: 1,
  },

  fullscreenImage: {
    width: width,
    height: "100%",
  },

  closeBtn: {
    position: "absolute",
    top: 50,
    right: 20,
  },
  moreOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(0,0,0,0.6)",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: 8,
},

moreText: {
  color: "#fff",
  fontSize: 18,
  fontWeight: "600",
},
});