import { View, Text, Image, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../src/theme/colors";

export default function Index() {
  const router = useRouter();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
         Animated.parallel([
            Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
            }),
            Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
            }),
        ]).start();

        const checkAuth = async () => {
            const token = await AsyncStorage.getItem("token");

            setTimeout(() => {
                if (token) {
                    router.replace("/(tabs)");
                } else {
                    router.replace("/(auth)/signin");
                }
                }, 3000);
        };

        checkAuth();
        }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Animated.View
        style={{
          alignItems: "center",
          opacity,
          transform: [{ scale }],
        }}
      >
        <Image
          source={require("../assets/images/app_logo.png")}
          style={{ width: 200, height: 70 }}
          resizeMode="contain"
        />
         <Image
          source={require("../assets/images/app_title.png")}
          style={{ width: 200, height: 70 }}
          resizeMode="contain"
        />
         <Image
          source={require("../assets/images/app_tagline.png")}
          style={{ width: 200, height: 70 }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}