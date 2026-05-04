import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../theme/colors";

interface Props {
  onCreatePress?: () => void;
  onNotificationPress?: () => void;
  onFilterPress?: () => void;
}

export default function AppHeader({
  onCreatePress,
  onNotificationPress,
  onFilterPress,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={onCreatePress}>
        <Ionicons name="add-circle-outline" size={28} color={COLORS.text} />
      </TouchableOpacity>

      <Image
        source={require("../../../assets/images/app_title.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.rightContainer}>
        {onFilterPress && (
          <TouchableOpacity onPress={onFilterPress}>
            <Ionicons name="options-outline" size={26} color={COLORS.text} />
          </TouchableOpacity>
        )}

        {!onFilterPress && onNotificationPress && (
          <TouchableOpacity onPress={onNotificationPress}>
            <Ionicons name="log-out-outline" size={26} color={COLORS.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    height: 80,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  rightContainer: {
    flexDirection: "row",
    gap: 16,
  },
  logo: {
    height: 30,
    width: 121,
    marginTop: 30,
  },
});