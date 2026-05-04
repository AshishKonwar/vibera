import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/src/theme/colors";

type Variant = "success" | "error";

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  variant?: Variant;
  onClose: () => void;
};

export default function StatusDialog({
  visible,
  title,
  message,
  variant = "error",
  onClose,
}: Props) {
  const isSuccess = variant === "success";

  const iconName = isSuccess ? "check-circle" : "alert-circle";
  const iconColor = isSuccess ? COLORS.secondary : "#ff4d4d";
  const bgColor = isSuccess
    ? "rgba(111,53,186,0.18)"
    : "rgba(255,77,77,0.15)";

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
            <MaterialCommunityIcons
              name={iconName}
              size={40}
              color={iconColor}
            />
          </View>

          <Text style={styles.title}>
            {title || (isSuccess ? "Success" : "Something went wrong")}
          </Text>

          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Okay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 320,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.glow,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  message: {
    color: COLORS.subtext,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 18,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});