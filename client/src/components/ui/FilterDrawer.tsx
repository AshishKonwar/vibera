import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { COLORS } from "../../theme/colors";

const VIBES = [
  "DATING",
  "FRIENDS",
  "FAMILY",
  "SOLO",
  "STREET_FOOD",
  "BUDGET_EATS",
  "PREMIUM_DINING",
  "LOCAL_AUTHENTIC",
  "MUSIC",
  "QUIET",
  "ROMANTIC",
  "LATE_NIGHT",
  "SIGHTSEEING",
  "INSTAGRAM_WORTHY",
  "NATURE",
  "CITY_VIEW",
  "HIDDEN_GEM",
  "UNDER_100",
  "STUDENT_FRIENDLY",
  "QUICK_BITE",
];

interface FilterDrawerProps {
  selectedVibes: string[];
  setSelectedVibes: React.Dispatch<React.SetStateAction<string[]>>;
  applyFilters: () => void;
}

const formatVibe = (vibe: string) =>
  vibe
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function FilterDrawer({
  selectedVibes,
  setSelectedVibes,
  applyFilters,
}: FilterDrawerProps) {
  const toggleVibe = (vibe: string) => {
    if (selectedVibes.includes(vibe)) {
      setSelectedVibes(selectedVibes.filter(v => v !== vibe));
    } else {
      setSelectedVibes([...selectedVibes, vibe]);
    }
  };

  return (
  <View style={{ flex: 1, backgroundColor: "transparent" }}>
    
    <View
      style={{
        flex: 1,
        margin: 12,
        marginTop: 40,
        borderRadius: 16,
        backgroundColor: "rgba(26,26,26,0.9)",
        overflow: "hidden",
      }}
    >
      
      <Text
        style={{
          color: "white",
          fontSize: 18,
          padding: 16,
        }}
      >
        Filters
      </Text>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
      >
        {VIBES.map(vibe => (
          <TouchableOpacity
                key={vibe}
                onPress={() => toggleVibe(vibe)}
                style={{
                    padding: 10,
                    marginBottom: 10,
                    backgroundColor: selectedVibes.includes(vibe)
                    ? COLORS.primary
                    : "transparent",
                    borderRadius: 100,
                    borderWidth: 1,
                    borderColor: selectedVibes.includes(vibe)
                    ? COLORS.primary
                    : "rgba(255,255,255,0.2)",
                }}
                >
                <Text style={{ color: "white" }}>{formatVibe(vibe)}</Text>
                </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ padding: 16 }}>
        <TouchableOpacity
          onPress={applyFilters}
          style={{
            backgroundColor: COLORS.primary,
            padding: 14,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Apply Filters
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  </View>
);
}