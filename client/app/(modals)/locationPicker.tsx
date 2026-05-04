import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/src/theme/colors";
import { useLocationStore } from "@/src/store/locationStore";

const GOOGLE_API_KEY = "AIzaSyBVnymdNLQ8Zodb1XivoQIFdfKSjaNvxqY";

export default function LocationPicker() {
  const [marker, setMarker] = useState<any>(null);
  const [address, setAddress] = useState<string>("");
  const [confirming, setConfirming] = useState(false);
  
  const [region, setRegion] = useState({
    latitude: 26.1445,
    longitude: 91.7362,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const mapRef = useRef<MapView>(null);
  const router = useRouter();

  const flyTo = (lat: number, lng: number) => {
    const newRegion = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 600);
  };

  const handleMapPress = async (e: any) => {
    const coords = e.nativeEvent.coordinate;
    setMarker(coords);
    setAddress("Loading...");

    const result = await Location.reverseGeocodeAsync(coords);
    const place = result[0];

    const fullAddress = [
      place?.name,
      place?.street,
      place?.district,
      place?.city,
      place?.region,
      place?.country,
    ]
      .filter(Boolean)
      .join(", ");

    setAddress(fullAddress || "Selected location");
  };

  const handlePlaceSelect = (data: any, details: any) => {
    if (!details) return;

    const { lat, lng } = details.geometry.location;

    setMarker({ latitude: lat, longitude: lng });
    setAddress(data.description);
    flyTo(lat, lng);
  };

  const handleCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;

    const result = await Location.reverseGeocodeAsync({ latitude, longitude });
    const place = result[0];

    const fullAddress = [
      place?.name,
      place?.street,
      place?.district,
      place?.city,
      place?.region,
      place?.country,
    ]
      .filter(Boolean)
      .join(", ");

    setMarker({ latitude, longitude });
    setAddress(fullAddress || "Current location");
    flyTo(latitude, longitude);
  };

 const setPickedLocation = useLocationStore((s) => s.setPickedLocation);

 const handleConfirm = () => {
  if (!marker) return;

  setPickedLocation({
    latitude: marker.latitude,
    longitude: marker.longitude,
    address: address,
  });
  router.back();
};

  return (
    <View style={{ flex: 1 }}>
      <MapView
        ref={mapRef}
        style={{ flex: 1 }}
        onPress={handleMapPress}
        initialRegion={region}
      >
        {marker && (
          <Marker coordinate={marker}>
            <Callout tooltip>
              <View style={styles.callout}>
                <Text style={styles.calloutText}>{address}</Text>
              </View>
            </Callout>
          </Marker>
        )}
      </MapView>

      <View style={styles.searchWrapper}>
        <GooglePlacesAutocomplete
          placeholder="Search location..."
          fetchDetails
          onPress={handlePlaceSelect}
          query={{
            key: GOOGLE_API_KEY,
            language: "en",
          }}
          styles={{
            container: { flex: 0 },
            textInput: styles.searchInput,
            listView: styles.searchDropdown,
            row: styles.searchRow,
            description: styles.searchDescription,
          }}
          enablePoweredByContainer={false}
          debounce={300}
        />

        <TouchableOpacity
          style={styles.currentLocationBtn}
          onPress={handleCurrentLocation}
        >
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={20}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {marker && (
        <View style={styles.addressBar}>
          <MaterialCommunityIcons
            name="map-marker"
            size={16}
            color={COLORS.primary}
          />
          <Text style={styles.addressText} numberOfLines={2}>
            {address}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.confirmBtn,
          (!marker || confirming) && styles.confirmBtnDisabled,
        ]}
        onPress={handleConfirm}
        disabled={!marker || address === "Loading..." || confirming}
      >
        {confirming ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <ActivityIndicator color="#fff" size="small" />
            <Text style={styles.confirmText}>Confirming...</Text>
          </View>
        ) : (
          <Text style={styles.confirmText}>Confirm Location</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchWrapper: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    zIndex: 10,
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    fontSize: 14,
    paddingHorizontal: 12,
    height: 44,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    color: "#333",
  },
  searchDropdown: {
    borderRadius: 10,
    marginTop: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  searchRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  searchDescription: {
    fontSize: 13,
    color: "#333",
  },
  currentLocationBtn: {
    backgroundColor: "#fff",
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  callout: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    maxWidth: 200,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  calloutText: {
    fontSize: 13,
    color: "#333",
  },
  addressBar: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  addressText: {
    fontSize: 13,
    color: "#333",
    flex: 1,
  },
  confirmBtn: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
});