import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/src/theme/colors";
import AppHeader from "@/src/components/ui/AppHeader";
import { useRouter } from "expo-router";
import MapView, { Marker } from "react-native-maps";
import { useLocationStore } from "@/src/store/locationStore";
import { useCreatePost } from "@/src/hooks/useCreatePost";
import { BlurView } from "expo-blur";
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import StatusDialog from "@/src/components/ui/StatusDialog";
import LocationPickerDialog from "@/src/components/ui/LocationPickerDialog";
import ImagePickerDialog from "@/src/components/ui/ImagePickerDialog";

export default function CreatePostScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<any>(null);
  const [errors, setErrors] = useState({ title: "", location: "", images: "" });
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);

  const { mutate: createPost, isPending } = useCreatePost();

  const [dialog, setDialog] = useState({
  visible: false,
  message: "",
  variant: "error" as "error" | "success",
  });

  const router = useRouter();

  const pickedLocation = useLocationStore((s) => s.pickedLocation);
  const clearPickedLocation = useLocationStore((s) => s.clearPickedLocation);

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      setDialog({
        visible: true,
        message: "Camera permission is required to take photos",
        variant: "error",
      });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });

    if (!result.canceled) {
      setImages((prev) => [...prev, result.assets[0].uri]);
      if (errors.images) setErrors((e) => ({ ...e, images: "" }));
    }
  };

  const pickImages = async () => {
    const remaining = 6 - images.length;

    if (remaining <= 0) {
        setDialog({
          visible: true,
          message: "You can only add up to 6 images",
          variant: "error",
        });
        return;
      }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: remaining,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
      if (errors.images) setErrors((e) => ({ ...e, images: "" }));
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    if (errors.images) setErrors((e) => ({ ...e, images: "" }));
  };

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return;

    const loc = await Location.getCurrentPositionAsync({});
    const address = await Location.reverseGeocodeAsync(loc.coords);

    const place = address[0];

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

    setLocation({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      address: fullAddress || "Current location",
    });
  };

    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
      const handleLogout = async () => {
      await AsyncStorage.removeItem("token");
      router.replace("/(auth)/signin");
    };

 const handleSubmit = () => {
  const e = { title: "", location: "", images: "" };

  if (!title.trim()) e.title = "Title is required";
  if (!location) e.location = "Please add a location";
  if (images.length === 0) e.images = "At least one image is required";

  setErrors(e);

  if (e.title || e.location || e.images) return;

  createPost(
    { title, description, images, location },
    {
      onSuccess: () => {
        clearPickedLocation();
        setImages([]);
        setTitle("");
        setDescription("");
        setLocation(null);
        setErrors({ title: "", location: "", images: "" });

        setDialog({
          visible: true,
          message: "Post created successfully!",
          variant: "success",
        });

        setTimeout(() => {
          setDialog((d) => ({ ...d, visible: false }));
          router.replace("/(tabs)");
        }, 2000);
      },

      onError: (err: any) => {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Failed to create post";

        setDialog({
          visible: true,
          message,
          variant: "error",
        });
      },
    }
  );
};

  useEffect(() => {
    if (pickedLocation) {
      setLocation(pickedLocation);
      clearPickedLocation();
    }
  }, [pickedLocation]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AppHeader
              onCreatePress={() => {}}
              onNotificationPress={() => setShowLogoutDialog(true)}
            />
      

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.grid}>
          {images.map((img, index) => (
            <View key={index} style={styles.gridItem}>
              <Image source={{ uri: img }} style={styles.gridImage} />

              <Pressable
                style={styles.removeBtn}
                onPress={() => removeImage(index)}
              >
                <MaterialCommunityIcons name="close" size={14} color="white" />
              </Pressable>
            </View>
          ))}

          <TouchableOpacity
            style={styles.addBox}
            onPress={() => setShowImageDialog(true)}
          >
            <MaterialCommunityIcons
              name="plus"
              size={26}
              color={COLORS.subtext}
            />
          </TouchableOpacity>
        </View>
        {errors.images ? (
            <Text style={styles.errorText}>{errors.images}</Text>
          ) : null}

        <TextInput
          placeholder="Title"
          placeholderTextColor={COLORS.subtext}
          style={[styles.input, errors.title ? styles.inputError : null]}
          value={title}
          onChangeText={(t) => { setTitle(t); if (errors.title) setErrors((e) => ({ ...e, title: "" })); }}
        />
        {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

        <TextInput
          placeholder="Describe your vibe..."
          placeholderTextColor={COLORS.subtext}
          style={[styles.input, styles.textArea]}
          multiline
          value={description}
          onChangeText={setDescription}
        />

        {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}

        <TouchableOpacity
          style={styles.location}
          onPress={() => {
            if (errors.location) setErrors((e) => ({ ...e, location: "" }));
            setShowLocationDialog(true);
          }}
        >          
        <MaterialCommunityIcons
            name="map-marker"
            size={18}
            color={COLORS.primary}
          />
          <Text style={styles.locationText}>
            {location?.address || "Add location"}
          </Text>
        </TouchableOpacity>

        {location && (
  <View style={styles.mapPreviewWrapper}>
    <View style={styles.mapCircle}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        region={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
              <Marker coordinate={location} />
            </MapView>
          </View>

          <Text style={styles.mapAddressText} numberOfLines={2}>
            {location.address}
          </Text>

          <TouchableOpacity
            style={styles.removeLocation}
            onPress={() => setLocation(null)}
          >
            <MaterialCommunityIcons name="close" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => {
            clearPickedLocation();
            setImages([]);
            setTitle("");
            setDescription("");
            setLocation(null);
            setErrors({ title: "", location: "", images: "" });

            router.replace("/(tabs)");
          }}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={handleSubmit}
          disabled={isPending}
        >
          <Text style={styles.postText}>Post</Text>
        </TouchableOpacity>
      </View>

      {isPending && (
          <View style={styles.loaderWrapper}>
            <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

            <View style={styles.loaderCard}>
              <View style={styles.loaderCircle}>
                <ActivityIndicator size="large" color="#fff" />
              </View>

              <Text style={styles.loaderTitle}>Sharing your vibe...</Text>
              <Text style={styles.loaderSub}>
                Uploading images & location
              </Text>
            </View>
          </View>
        )}
      <ConfirmDialog
            visible={showLogoutDialog}
            title="Logout"
            message="Are you sure you want to log out?"
            onCancel={() => setShowLogoutDialog(false)}
            onConfirm={handleLogout}
            confirmText="Logout"
          />
          <StatusDialog
            visible={dialog.visible}
            message={dialog.message}
            variant={dialog.variant}
            onClose={() => setDialog((d) => ({ ...d, visible: false }))}
          />
          <LocationPickerDialog
            visible={showLocationDialog}
            onClose={() => setShowLocationDialog(false)}
            onUseCurrent={() => {
              setShowLocationDialog(false);
              getLocation();
            }}
            onPickMap={() => {
              setShowLocationDialog(false);
              router.push("/(modals)/locationPicker");
            }}
          />
          <ImagePickerDialog
            visible={showImageDialog}
            onClose={() => setShowImageDialog(false)}
            onCamera={() => {
              setShowImageDialog(false);
              openCamera();
            }}
            onGallery={() => {
              setShowImageDialog(false);
              pickImages();
            }}
          />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    padding: 16,
    paddingBottom: 120,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  gridItem: {
    width: "30%",
    aspectRatio: 1,
  },

  gridImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },

  removeBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    padding: 3,
  },

  addBox: {
    width: "10%",
    height: "10%",
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },

  input: {
    marginTop: 15,
    backgroundColor: COLORS.card,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  location: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  locationText: {
    marginLeft: 6,
    fontSize: 12,
    color: COLORS.accent,
  },

  postText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  
  cancelText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "500",
  },

  mapPreviewWrapper: {
  marginTop: 16,
  alignItems: "center",
  position: "relative",
},

  mapCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.glow,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  mapAddressText: {
    marginTop: 10,
    fontSize: 12,
    color: COLORS.subtext,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  removeLocation: {
    position: "absolute",
    top: 0,
    right: "25%",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    padding: 4,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 10,
    flexDirection: "row",  
    gap: 10,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  floatingBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: COLORS.glow,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },

  loaderWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  loaderContent: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  loaderText: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 14,
  },

  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  inputError: {
    borderColor: "#ff4d4d",
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 11,
    marginTop: 4,
    marginLeft: 2,
  },
  loaderCard: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.glow,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },

  loaderCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  loaderTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },

  loaderSub: {
    color: COLORS.subtext,
    fontSize: 12,
    marginTop: 4,
  },
});