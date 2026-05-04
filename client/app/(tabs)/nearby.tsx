import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useRef, useMemo } from "react";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import { useRouter } from "expo-router";
import { COLORS } from "../../src/theme/colors";
import AppHeader from "@/src/components/ui/AppHeader";
import PostCard from "@/src/components/post/PostCard";
import FilterDrawer from "@/src/components/ui/FilterDrawer";
import { useNearbyPosts } from "@/src/hooks/useNearbyPosts";

const { width } = Dimensions.get("window");
const RADIUS_OPTIONS = [1, 3, 5, 10];

const mapNearbyPost = (post: any) => ({
  id: post.id,
  imageUrls: post.imageUrls ?? [],
  caption: `${post.title ?? ""} — ${post.description ?? ""}`,
  user: { username: post.user?.name ?? "Unknown" },
  likesCount: post._count?.likes ?? 0,
  commentsCount: post._count?.comments ?? 0,
  isLiked: false,
  locationName: post.address
    ? `${post.address} · ${post.distance} km`
    : `${post.distance} km away`,
  vibes: post.vibes ?? [],
});

export default function Nearby() {
  const router = useRouter();

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [radius, setRadius] = useState(5);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [appliedVibes, setAppliedVibes] = useState<string[]>([]);
  const [showFilter, setShowFilter] = useState(false);
  const translateX = useRef(new Animated.Value(width)).current;

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError(true);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    })();
  }, []);

  const queryParams = userLocation
    ? { lat: userLocation.lat, lng: userLocation.lng, radius, vibes: appliedVibes }
    : null;

  const { data: result, isLoading } = useNearbyPosts(queryParams);
  console.log("these are the queryParams", queryParams, result);

  const rawPosts: any[] = result?.data ?? [];
  const posts = useMemo(() => rawPosts.map(mapNearbyPost), [rawPosts]);

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

  const mapHeader = useMemo(() => {
    if (!userLocation) return null;
    return (
      <View>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: userLocation.lat,
            longitude: userLocation.lng,
            latitudeDelta: radius * 0.018,
            longitudeDelta: radius * 0.018,
          }}
          showsUserLocation
          scrollEnabled={false}
          zoomEnabled={false}
          pitchEnabled={false}
          rotateEnabled={false}
        >
          {rawPosts
            .filter((p) => p.latitude && p.longitude)
            .map((p) => (
              <Marker
                key={p.id}
                coordinate={{ latitude: p.latitude, longitude: p.longitude }}
                title={p.title}
                description={`${p.distance} km away`}
                pinColor={COLORS.primary}
              />
            ))}
        </MapView>

        <View style={styles.radiusRow}>
          {RADIUS_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.chip, radius === r && styles.chipActive]}
              onPress={() => setRadius(r)}
            >
              <Text style={[styles.chipText, radius === r && styles.chipTextActive]}>
                {r} km
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {appliedVibes.length > 0 && (
          <Text style={styles.vibeNote}>
            {appliedVibes.length} vibe filter{appliedVibes.length > 1 ? "s" : ""} active
          </Text>
        )}

        <Text style={styles.sectionLabel}>
          {isLoading ? "Searching..." : `${posts.length} place${posts.length !== 1 ? "s" : ""} found`}
        </Text>
      </View>
    );
  }, [userLocation, radius, rawPosts, appliedVibes, isLoading, posts.length]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AppHeader
        onCreatePress={() => router.push("/(tabs)/create")}
        onNotificationPress={() => {}}
        onFilterPress={openDrawer}
      />

      {!userLocation && !locationError && (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={styles.locatingText}>Getting your location...</Text>
        </View>
      )}

      {locationError && (
        <View style={styles.centered}>
          <Text style={styles.errorText}>Location permission denied</Text>
          <Text style={styles.errorSub}>Enable location access to see posts near you.</Text>
        </View>
      )}

      {userLocation && (
        <FlatList
          data={isLoading ? [] : posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard post={item} onPress={() => router.push(`/post/${item.id}`)} />
          )}
          ListHeaderComponent={mapHeader}
          ListFooterComponent={
            isLoading ? (
              <View style={styles.listLoader}>
                <ActivityIndicator color={COLORS.primary} />
              </View>
            ) : null
          }
          ListEmptyComponent={
            !isLoading ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No posts within {radius} km</Text>
                <Text style={styles.emptySub}>Try increasing the radius or removing filters.</Text>
              </View>
            ) : null
          }
          contentContainerStyle={{ padding: 12, gap: 12 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {showFilter && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            onPress={closeDrawer}
            style={styles.backdrop}
          />
          <Animated.View
            style={[styles.drawer, { transform: [{ translateX }] }]}
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

const styles = StyleSheet.create({
  map: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  radiusRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.subtext,
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#fff",
  },
  vibeNote: {
    color: COLORS.secondary,
    fontSize: 12,
    marginBottom: 6,
  },
  sectionLabel: {
    color: COLORS.subtext,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  locatingText: {
    color: COLORS.subtext,
    fontSize: 14,
  },
  errorText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
  errorSub: {
    color: COLORS.subtext,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  listLoader: {
    paddingVertical: 24,
    alignItems: "center",
  },
  empty: {
    paddingVertical: 40,
    alignItems: "center",
    gap: 6,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "600",
  },
  emptySub: {
    color: COLORS.subtext,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: width * 0.75,
  },
});
