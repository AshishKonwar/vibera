import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { COLORS } from "@/src/theme/colors";

type CommentInputTriggerProps = {
  onPress: () => void;
};

export default function CommentInputTrigger({
  onPress,
}: CommentInputTriggerProps) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.pill}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.placeholder}>Add a comment...</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  pill: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  placeholder: {
    color: COLORS.subtext,
    fontSize: 13,
  },
});