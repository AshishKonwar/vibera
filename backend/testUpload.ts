import dotenv from "dotenv";
dotenv.config();

import { uploadImageToCloudinary } from "./src/services/upload.service";

(async () => {
  try {
    const result = await uploadImageToCloudinary("uploads/test.jpg");
  } catch (error: any) {
    console.error("Cloudinary Error:", error);
  }
})();