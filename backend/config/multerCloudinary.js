// backend/config/multerCloudinary.js
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",              // folder in Cloudinary
    allowedFormats: ["jpg", "png", "jpeg"],  // only image types
  },
});

export const upload = multer({ storage });