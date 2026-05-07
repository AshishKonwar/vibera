import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../src/theme/colors";
import AppHeader from "@/src/components/ui/AppHeader";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; 
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import { usePostsByUserId } from "@/src/hooks/usePosts";

type UserData = { id: string; name: string; email: string };

export default function Profile() {
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("user").then((raw) => {
      if (raw) setUserData(JSON.parse(raw));
    });
  }, []);

  const { data, isLoading } = usePostsByUserId(userData?.id ?? "");
  console.log("userData", data);
  const posts = data?.data ?? [];

  const handleLogout = async () => {
    await AsyncStorage.removeItem("auth_token");
    await AsyncStorage.removeItem("user");
    router.replace("/(auth)/signin");
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AppHeader
        onCreatePress={() => router.push("/(tabs)/create")}
        onNotificationPress={() => setShowLogoutDialog(true)}
      />

      <View style={{ alignItems: "center", padding: 20 }}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: COLORS.card,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 10,
          }}
        > 
          <Ionicons name="person" size={50} color={COLORS.subtext} />
        </View>

        <Text style={{ color: "white", fontSize: 18, fontWeight: "600" }}>
          {userData?.name ?? "..."}
        </Text>
        <Text style={{ color: COLORS.subtext, marginTop: 4, fontSize: 12 }}>
          Your Vibera Moments • {posts.length} posts
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item: any) => item.id}
          numColumns={3}
          contentContainerStyle={{ padding: 2 }}
          renderItem={({ item }: any) => (
            <TouchableOpacity
              style={{ width: "33.33%", aspectRatio: 1, padding: 1 }}
              onPress={() => {
                if (isNavigating) return;

                setIsNavigating(true);
                router.push(`/post/edit/${item.id}`);

                setTimeout(() => setIsNavigating(false), 1000);
              }}
            >
              {item.imageUrls?.[0] ? (
                <Image
                  source={{ uri: item.imageUrls[0] }}
                  style={{ width: "100%", height: "100%", borderRadius: 4 }}
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 4,
                    backgroundColor: COLORS.card,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MaterialCommunityIcons
                    name="image-off"
                    size={24}
                    color={COLORS.subtext}
                  />
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      )}

      <ConfirmDialog
        visible={showLogoutDialog}
        title="Logout"
        message="Are you sure you want to log out?"
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        confirmText="Logout"
      />
    </View>
  );
}
