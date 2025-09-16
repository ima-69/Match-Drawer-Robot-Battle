// server/models/Team.js
import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  logoUrl: {
    type: String, // Cloudinary URL
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

const Team = mongoose.model("Team", teamSchema);

export default Team;