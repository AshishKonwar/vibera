import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Modal,
  Animated,
  Easing,
  StyleSheet,
} from "react-native";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "../../src/theme/colors";
import { registerUser } from "../../src/features/auth/auth.api";
import { setToken } from "../../src/features/auth/auth.store";
import StatusDialog from "@/src/components/ui/StatusDialog";

export default function SignUp() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });

  const [dialog, setDialog] = useState({
  visible: false,
  message: "",
  variant: "error" as "error" | "success",
  });

  const validate = () => {
    const e = { name: "", email: "", password: "" };
    if (!name.trim()) e.name = "Name is required";
    else if (name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return !e.name && !e.email && !e.password;
  };

  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      setLoading(true);

      const res = await registerUser(name, email, password);
      const token = res.token;

      await setToken(token);

      setDialog({
        visible: true,
        message: "Account created successfully!",
        variant: "success",
      });

      setTimeout(() => {
        router.replace("/(auth)/signin");
      }, 1500);

    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Registration failed";

      setDialog({
        visible: true,
        message,
        variant: "error",
      });

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showSuccess) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        router.replace("/(auth)/signin");
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 24,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          <Image
            source={require("../../assets/images/app_logo.png")}
            style={{ width: 200, height: 70 }}
            resizeMode="contain"
          />
          <Image
            source={require("../../assets/images/app_title.png")}
            style={{ width: 200, height: 40 }}
            resizeMode="contain"
          />
          <Image
            source={require("../../assets/images/app_tagline.png")}
            style={{ width: 200, height: 20 }}
            resizeMode="contain"
          />
        </View>

        <Text
          style={{
            color: COLORS.text,
            fontSize: 26,
            fontWeight: "600",
          }}
        >
          Create Account
        </Text>
        <Text style={{ color: COLORS.subtext, marginTop: 6, fontSize: 14 }}>
          Join the vibe community
        </Text>

        <View style={{ marginTop: 28 }}>
          <TextInput
            placeholder="Name"
            placeholderTextColor={COLORS.subtext}
            value={name}
            onChangeText={(t) => { setName(t); if (errors.name) setErrors((e) => ({ ...e, name: "" })); }}
            autoCapitalize="words"
            style={{
              backgroundColor: COLORS.card,
              padding: 14,
              borderRadius: 12,
              color: COLORS.text,
              borderWidth: 1,
              borderColor: errors.name ? "#ff4d4d" : COLORS.border,
            }}
          />
          {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

          <TextInput
            placeholder="Email"
            placeholderTextColor={COLORS.subtext}
            value={email}
            onChangeText={(t) => { setEmail(t); if (errors.email) setErrors((e) => ({ ...e, email: "" })); }}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              backgroundColor: COLORS.card,
              padding: 14,
              borderRadius: 12,
              color: COLORS.text,
              borderWidth: 1,
              borderColor: errors.email ? "#ff4d4d" : COLORS.border,
              marginTop: 12,
            }}
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          <TextInput
            placeholder="Password"
            placeholderTextColor={COLORS.subtext}
            secureTextEntry
            value={password}
            onChangeText={(t) => { setPassword(t); if (errors.password) setErrors((e) => ({ ...e, password: "" })); }}
            style={{
              backgroundColor: COLORS.card,
              padding: 14,
              borderRadius: 12,
              color: COLORS.text,
              borderWidth: 1,
              borderColor: errors.password ? "#ff4d4d" : COLORS.border,
              marginTop: 12,
            }}
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          style={{
            backgroundColor: COLORS.primary,
            padding: 16,
            borderRadius: 12,
            marginTop: 24,
            alignItems: "center",
            shadowColor: COLORS.glow,
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "600", fontSize: 15 }}>
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 24 }}
        >
          <Text
            style={{
              color: COLORS.subtext,
              textAlign: "center",
              fontSize: 13,
            }}
          >
            Already have an account?{" "}
            <Text style={{ color: COLORS.secondary, fontWeight: "600" }}>
              Sign In
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success modal */}
      <Modal transparent visible={showSuccess} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
            padding: 24,
          }}
        >
          <Animated.View
            style={{
              backgroundColor: COLORS.card,
              borderRadius: 20,
              paddingVertical: 32,
              paddingHorizontal: 28,
              alignItems: "center",
              borderWidth: 1,
              borderColor: COLORS.border,
              width: "100%",
              maxWidth: 320,
              shadowColor: COLORS.glow,
              shadowOpacity: 0.4,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 0 },
              elevation: 10,
              transform: [{ scale }],
              opacity,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "rgba(111,53,186,0.18)",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 18,
                borderWidth: 2,
                borderColor: COLORS.secondary,
              }}
            >
              <MaterialCommunityIcons
                name="check"
                size={40}
                color={COLORS.secondary}
              />
            </View>

            <Text
              style={{
                color: COLORS.text,
                fontSize: 20,
                fontWeight: "600",
                marginBottom: 6,
              }}
            >
              Account Created
            </Text>
            <Text
              style={{
                color: COLORS.subtext,
                fontSize: 13,
                textAlign: "center",
                lineHeight: 18,
              }}
            >
              Welcome to the community. Redirecting you to sign in...
            </Text>

            <ActivityIndicator
              color={COLORS.primary}
              style={{ marginTop: 18 }}
            />
          </Animated.View>
        </View>
      </Modal>
      <StatusDialog
      visible={dialog.visible}
      message={dialog.message}
      variant={dialog.variant}
      onClose={() => setDialog((d) => ({ ...d, visible: false }))}
    />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  errorText: {
    color: "#ff4d4d",
    fontSize: 11,
    marginTop: 4,
    marginLeft: 2,
  },
});