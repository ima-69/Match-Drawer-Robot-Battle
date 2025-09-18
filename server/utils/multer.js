import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "tournament_teams",
    allowed_formats: ["jpg", "jpeg", "png"]
  },
});

const upload = multer({ storage });
export default upload;