import { View, Text, TouchableOpacity, Modal } from "react-native";
import { COLORS } from "../../theme/colors";

interface Props {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View
            style={{
                width: "85%",
                backgroundColor: COLORS.card,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                shadowColor: COLORS.glow,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 20,

                elevation: 10,
            }}
            >
          <Text
            style={{
              color: "white",
              fontSize: 18,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            {title}
          </Text>

          <Text style={{ color: COLORS.subtext, marginBottom: 20 }}>
            {message}
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <TouchableOpacity onPress={onCancel}>
              <Text style={{ color: COLORS.subtext }}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onConfirm}>
              <Text style={{ color: COLORS.primary, fontWeight: "600" }}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}