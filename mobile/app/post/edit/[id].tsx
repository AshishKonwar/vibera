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
import { Image } from "expo-image";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS } from "@/src/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePostById, useUpdatePost, useDeletePost } from "@/src/hooks/usePosts";
import { deletePostImage } from "@/src/features/post/post.api";
import { BlurView } from "expo-blur";
import ConfirmDialog from "@/src/components/ui/ConfirmDialog";
import { formatVibes } from "@/src/utils/formatVibes";
import { useLocationStore } from "@/src/store/locationStore";
import StatusDialog from "@/src/components/ui/StatusDialog";
import ImagePickerDialog from "@/src/components/ui/ImagePickerDialog";

type ExistingImage = { url: string; publicId: string };

export default function EditPostScreen() {
  const { id } = useLocalSearchParams();
  const postId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();

  const { data: post, isLoading } = usePostById(postId as string);
  const { mutateAsync: doUpdate, isPending } = useUpdatePost();
  const { mutateAsync: doDelete, isPending: isDeleting } = useDeletePost();
  const [showImageDialog, setShowImageDialog] = useState(false);

  const [dialog, setDialog] = useState({
  visible: false,
  message: "",
  variant: "error" as "error" | "success",
  });

  const pickedLocation = useLocationStore((s) => s.pickedLocation);
  const clearPickedLocation = useLocationStore((s) => s.clearPickedLocation);

  const [errors, setErrors] = useState({ title: "", location: "" });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [vibes, setVibes] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [address, setAddress] = useState("");
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [removedPublicIds, setRemovedPublicIds] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  useEffect(() => {
    clearPickedLocation();
  }, []);

  useEffect(() => {
    if (post) {
      setTitle(post.title ?? "");
      setDescription(post.description ?? "");
      setVibes(post.vibes ?? []);
      setLatitude(post.latitude ?? null);
      setLongitude(post.longitude ?? null);
      setAddress(post.address ?? "");
      const urls: string[] = post.imageUrls ?? [];
      const publicIds: string[] = post.imagePublicIds ?? [];
      setExistingImages(
        urls.map((url, i) => ({ url, publicId: publicIds[i] ?? "" }))
      );
    }
  }, [post]);

  useEffect(() => {
    if (pickedLocation) {
      setLatitude(pickedLocation.latitude);
      setLongitude(pickedLocation.longitude);
      setAddress(pickedLocation.address);
      clearPickedLocation();
    }
  }, [pickedLocation]);

  const toggleVibe = (vibe: string) => {
    setVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const openLocationPicker = () => {
    router.push("/(modals)/locationPicker");
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
          setDialog({
            visible: true,
            message: "Camera permission is required",
            variant: "error",
          });
          return;
        }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled)
      setNewImages((prev) => [...prev, result.assets[0].uri]);
  };

  const pickImages = async () => {
    const total = existingImages.length + newImages.length;
    const remaining = 6 - total;
    if (remaining <= 0) {
      setDialog({
        visible: true,
        message: "You can only have up to 6 images",
        variant: "error",
      });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      quality: 0.7,
      selectionLimit: remaining,
    });
    if (!result.canceled)
      setNewImages((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
  };

  const removeExistingImage = (publicId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
    setRemovedPublicIds((prev) => [...prev, publicId]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async () => {
    try {
      await doDelete(postId as string);

      setDialog({
        visible: true,
        message: "Post deleted successfully",
        variant: "success",
      });

      setTimeout(() => {
        router.back();
      }, 1000);

    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to delete post";

      setDialog({
        visible: true,
        message,
        variant: "error",
      });
    }
  };

  const handleSubmit = async () => {
    const e = { title: "", location: "" };
    if (!title.trim()) e.title = "Title is required";
    if (latitude == null || longitude == null) e.location = "Please pick a location";
    setErrors(e);
    if (e.title || e.location) return;

    try {
      for (const publicId of removedPublicIds) {
        await deletePostImage(postId as string, publicId);
      }
      await doUpdate({
        postId: postId as string,
        title,
        description,
        newImages,
        location:
          latitude != null && longitude != null
            ? { latitude, longitude, address }
            : null,
      });

      setDialog({
      visible: true,
      message: "Post updated successfully",
      variant: "success",
      });

      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || "Failed to update post";

      setDialog({
        visible: true,
        message,
        variant: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  const totalImages = existingImages.length + newImages.length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.grid}>
          {existingImages.map((img) => (
            <View key={img.publicId} style={styles.gridItem}>
              <Image source={{ uri: img.url }} style={styles.gridImage} />
              <Pressable
                style={styles.removeBtn}
                onPress={() => removeExistingImage(img.publicId)}
              >
                <MaterialCommunityIcons name="close" size={14} color="white" />
              </Pressable>
            </View>
          ))}

          {newImages.map((uri, index) => (
            <View key={`new-${index}`} style={styles.gridItem}>
              <Image source={{ uri }} style={styles.gridImage} />
              <Pressable
                style={styles.removeBtn}
                onPress={() => removeNewImage(index)}
              >
                <MaterialCommunityIcons name="close" size={14} color="white" />
              </Pressable>
            </View>
          ))}

          {totalImages < 6 && (
            <TouchableOpacity
              style={styles.addBox}
              onPress={() => setShowImageDialog(true)}
            >
              <MaterialCommunityIcons name="plus" size={20} color={COLORS.subtext} />
            </TouchableOpacity>
          )}
        </View>

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
          {vibes.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Vibes</Text>
              <View style={styles.vibesGrid}>
                {vibes.map((vibe) => (
                  <View key={vibe} style={[styles.vibeChip, styles.vibeChipSelected]}>
                    <Text style={[styles.vibeChipText, styles.vibeChipTextSelected]}>
                      {formatVibes(vibe)}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}
        <Text style={styles.sectionLabel}>Location</Text>
        <TouchableOpacity
          style={[styles.locationCard, errors.location ? { borderColor: "#ff4d4d" } : null]}
          onPress={() => { if (errors.location) setErrors((e) => ({ ...e, location: "" })); openLocationPicker(); }}
        >
          <MaterialCommunityIcons name="map-marker" size={20} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.locationAddress} numberOfLines={2}>
              {address || "No location set"}
            </Text>
            {latitude != null && longitude != null && (
              <Text style={styles.locationCoords}>
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </Text>
            )}
          </View>
          <MaterialCommunityIcons name="pencil-outline" size={18} color={COLORS.subtext} />
        </TouchableOpacity>
        {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => setShowDeleteDialog(true)}
          disabled={isDeleting}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ff4d4d" />
          <Text style={styles.deleteText}>
            {isDeleting ? "Deleting..." : "Delete Post"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSubmit}
          disabled={isPending}
        >
          <Text style={styles.saveText}>{isPending ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>

      <ConfirmDialog
        visible={showDeleteDialog}
        title="Delete Post"
        message="Are you sure you want to delete this post? This cannot be undone."
        confirmText="Delete"
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />

      {isPending && (
        <View style={styles.loaderWrapper}>
          <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.darkOverlay} />
          <View style={styles.loaderContent}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderText}>Saving...</Text>
          </View>
        </View>
      )}
      <StatusDialog
        visible={dialog.visible}
        message={dialog.message}
        variant={dialog.variant}
        onClose={() => setDialog((d) => ({ ...d, visible: false }))}
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
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
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
  sectionLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 20,
    marginBottom: 10,
  },
  vibesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  vibeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  vibeChipSelected: {
    backgroundColor: "rgba(111,53,186,0.2)",
    borderColor: COLORS.secondary,
  },
  vibeChipText: {
    color: COLORS.subtext,
    fontSize: 12,
    fontWeight: "500",
  },
  vibeChipTextSelected: {
    color: COLORS.secondary,
    fontWeight: "600",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  locationAddress: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "500",
  },
  locationCoords: {
    color: COLORS.subtext,
    fontSize: 11,
    marginTop: 2,
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
    paddingBottom: 60,
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
  cancelText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "500",
  },
  saveBtn: {
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
  saveText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
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
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
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
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ff4d4d",
  },
  deleteText: {
    color: "#ff4d4d",
    fontWeight: "600",
    fontSize: 15,
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
});