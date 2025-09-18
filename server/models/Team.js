import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logoUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Team", teamSchema);