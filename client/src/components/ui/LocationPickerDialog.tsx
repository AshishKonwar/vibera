import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/src/theme/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  onUseCurrent: () => void;
  onPickMap: () => void;
};

export default function LocationPickerDialog({
  visible,
  onClose,
  onUseCurrent,
  onPickMap,
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select Location</Text>

          <TouchableOpacity style={styles.option} onPress={onUseCurrent}>
            <MaterialCommunityIcons name="crosshairs-gps" size={18} color={COLORS.primary} />
            <Text style={styles.optionText}>Use Current Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={onPickMap}>
            <MaterialCommunityIcons name="map" size={18} color={COLORS.primary} />
            <Text style={styles.optionText}>Pick from Map</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
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
    width: "100%",
    maxWidth: 320,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
  },
  optionText: {
    color: COLORS.text,
    fontSize: 14,
  },
  cancelBtn: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cancelText: {
    color: COLORS.subtext,
  },
});