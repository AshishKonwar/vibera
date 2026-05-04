import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS } from "../../src/theme/colors";
import { loginUser } from "../../src/features/auth/auth.api";
import { setToken } from "../../src/features/auth/auth.store";
import StatusDialog from "@/src/components/ui/StatusDialog";

export default function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const [dialog, setDialog] = useState({
  visible: false,
  message: "",
  variant: "error" as "error" | "success",
});

  const validate = () => {
    const e = { email: "", password: "" };
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return !e.email && !e.password;
  };

 const handleLogin = async () => {
  if (!validate()) return;

  try {
    setLoading(true);

    const res = await loginUser(email, password);

    const token = res.token;
    await setToken(token);
    await AsyncStorage.setItem("user", JSON.stringify(res.user));

    setDialog({
      visible: true,
      message: "Login successful",
      variant: "success",
    });

    setTimeout(() => {
      router.replace("/(tabs)");
    }, 1000);

  } catch (err: any) {
    const message =
      err.response?.data?.message || err.message || "Login failed";

    setDialog({
      visible: true,
      message,
      variant: "error",
    });

  } finally {
    setLoading(false);
  }
};

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
          Welcome 
        </Text>
        <Text style={{ color: COLORS.subtext, marginTop: 6, fontSize: 14 }}>
          Sign in to continue
        </Text>

        <View style={{ marginTop: 28 }}>
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
          onPress={handleLogin}
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
              Sign In
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup")}
          style={{ marginTop: 24 }}
        >
          <Text
            style={{
              color: COLORS.subtext,
              textAlign: "center",
              fontSize: 13,
            }}
          >
            Don&apos;t have an account?{" "}
            <Text style={{ color: COLORS.secondary, fontWeight: "600" }}>
              Sign Up
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
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