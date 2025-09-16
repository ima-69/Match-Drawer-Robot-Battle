// server/models/Tournament.js
import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    }
  ],
  knockoutMatches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match"
    }
  ],
  wildcardMatches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match"
    }
  ],
  semifinalMatches: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match"
    }
  ],
  finalMatch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match"
  },
  currentRound: {
    type: String,
    enum: ["not_started", "knockout", "wildcard", "semifinal", "grandfinal", "completed"],
    default: "not_started"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Tournament = mongoose.model("Tournament", tournamentSchema);

export default Tournament;