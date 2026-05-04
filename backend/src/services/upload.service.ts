import cloudinary from "../config/cloudinary";

export const uploadImageToCloudinary = async (filePath: string) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "hangout-app",
    });

    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error: any) {
    throw new Error(error?.message || "Image upload failed");
  }
};