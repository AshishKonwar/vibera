import { api } from "../../services/api";

interface GetPostsParams {
  page?: number;
  limit?: number;
  vibes?: string[]; 
}

interface CreatePostParams {
  title: string;
  description: string;
  images: string[];
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  } | null;
}

export const createPost = async ({
  title,
  description,
  images,
  location,
}: CreatePostParams) => {
  try {
    const formData = new FormData();

    formData.append("title", title.trim());
    formData.append("description", description.trim());

    if (location) {
      formData.append("latitude", String(location.latitude));
      formData.append("longitude", String(location.longitude));
      formData.append("address", location.address);
    }

    images.forEach((uri, i) => {
      formData.append("images", {
        uri,
        name: `image-${i}.jpg`,
        type: "image/jpeg",
      } as any);
    });

    const res = await api.post("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  } catch (error: any) {
    console.error("Error creating post:", error);
    throw error?.response?.data || error;
  }
};

export const getPosts = async (params?: GetPostsParams) => {
  try {
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", String(params.page));
    if (params?.limit) queryParams.append("limit", String(params.limit));

    if (params?.vibes && params.vibes.length > 0) {
      queryParams.append("vibes", params.vibes.join(","));
    }

    const url = `/posts${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

    const res = await api.get(url);

    return res.data as { data: any[]; meta: { total: number; page: number; limit: number; totalPages: number } };
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

export const getPostById = async (postId: string) => {
  const res = await api.get(`/posts/${postId}`);
  return res.data;
};

export const deletePost = async (postId: string) => {
  const res = await api.delete(`/posts/${postId}`);
  return res.data;
};

export const getPostsByUserId = async (
  userId: string,
  page = 1,
  limit = 10
) => {
  const res = await api.get(`/posts/user/${userId}`, { params: { page, limit } });
  return res.data;
};

export const updatePost = async ({
  postId,
  title,
  description,
  newImages,
  location,
}: {
  postId: string;
  title: string;
  description: string;
  newImages: string[];
  location?: { latitude: number; longitude: number; address: string } | null;
}) => {
  const formData = new FormData();
  formData.append("title", title.trim());
  formData.append("description", description.trim());
  if (location) {
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    formData.append("address", location.address);
  }
  newImages.forEach((uri, i) => {
    formData.append("images", { uri, name: `image-${i}.jpg`, type: "image/jpeg" } as any);
  });
  const res = await api.put(`/posts/${postId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deletePostImage = async (postId: string, imagePublicId: string) => {
  const res = await api.delete("/posts/image", {
    data: { postId, imagePublicId },
  });
  return res.data;
};

export const getNearbyPosts = async (params: {
  lat: number;
  lng: number;
  radius?: number;
  vibes?: string[];
}) => {
  const query = new URLSearchParams({
    lat: String(params.lat),
    lng: String(params.lng),
    radius: String(params.radius || 5),
    vibes: params.vibes?.join(",") || "",
  });

  const res = await api.get(`/posts/nearby?${query}`);
  return res.data;
};