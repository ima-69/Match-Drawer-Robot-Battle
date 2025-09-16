// server/models/Match.js
import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  roundType: {
    type: String,
    enum: ["knockout", "wildcard", "semifinal", "grandfinal"],
    required: true
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    }
  ],
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team"
  },
  losers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    }
  ],
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Match = mongoose.model("Match", matchSchema);

export default Match;