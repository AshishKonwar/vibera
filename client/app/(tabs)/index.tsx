import {
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useMemo, useRef, useState } from "react";
import PostCard from "../../src/components/post/PostCard";
import { useInfinitePosts } from "../../src/hooks/usePosts";
import { mapPost } from "../../src/features/post/post.mapper";
import { COLORS } from "../../src/theme/colors";
import AppHeader from "@/src/components/ui/AppHeader";
import FilterDrawer from "../../src/components/ui/FilterDrawer";
import { useRouter } from "expo-router";

const { width } = Dimensions.get("window");

export default function Home() {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [appliedVibes, setAppliedVibes] = useState<string[]>([]);

  const router = useRouter();
  const translateX = useRef(new Animated.Value(width)).current;
  const lastTapRef = useRef(0);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfinitePosts(appliedVibes);

  console.log("pages:", data?.pages);
console.log("first page:", data?.pages?.[0]);

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.data.map(mapPost)) ?? [],
    [data]
  );

  console.log("posts:", posts);


  const handlePress = (id: string) => {
    const now = Date.now();
    if (now - lastTapRef.current < 1000) return;
    lastTapRef.current = now;
    router.push(`/post/${id}`);
  };

  const openDrawer = () => {
    setShowFilter(true);
    Animated.timing(translateX, { toValue: 0, duration: 300, useNativeDriver: true }).start();
  };

  const closeDrawer = () => {
    Animated.timing(translateX, { toValue: width, duration: 250, useNativeDriver: true }).start(
      () => setShowFilter(false)
    );
  };

  const applyFilters = () => {
    setAppliedVibes([...selectedVibes]);
    closeDrawer();
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AppHeader
        onCreatePress={() => router.push("/(tabs)/create")}
        onNotificationPress={() => {}}
        onFilterPress={openDrawer}
      />

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard post={item} onPress={() => handlePress(item.id)} />
          )}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={{ paddingVertical: 20, alignItems: "center" }}>
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : null
          }
        />
      )}

      {showFilter && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeDrawer}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
            }}
          />
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: width * 0.75,
              transform: [{ translateX }],
            }}
          >
            <FilterDrawer
              selectedVibes={selectedVibes}
              setSelectedVibes={setSelectedVibes}
              applyFilters={applyFilters}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
}
