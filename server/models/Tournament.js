import mongoose from "mongoose";

const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  
  // Knockout rounds structure
  knockoutRounds: [{
    roundNumber: { type: Number, required: true },
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Match" }],
    isCompleted: { type: Boolean, default: false }
  }],
  
  // Wildcard rounds structure
  wildcardRounds: [{
    roundNumber: { type: Number, required: true },
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Match" }],
    isCompleted: { type: Boolean, default: false }
  }],
  
  // Final matches
  semifinalMatches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Match" }],
  finalMatch: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
  secondPlaceMatch: { type: mongoose.Schema.Types.ObjectId, ref: "Match" },
  
  // Tournament state
  currentRound: { 
    type: String, 
    enum: ["not_started", "knockout", "wildcard", "semifinal", "grandfinal", "secondplace", "completed"], 
    default: "not_started" 
  },
  currentKnockoutRound: { type: Number, default: 1 },
  currentWildcardRound: { type: Number, default: 1 },
  isRoundComplete: { type: Boolean, default: false },
  
  // Tournament completion status
  knockoutComplete: { type: Boolean, default: false },
  wildcardComplete: { type: Boolean, default: false },
  
  // Store teams for next rounds (without starting them)
  nextKnockoutTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  nextWildcardTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  
  // Final structure
  knockoutFinalWinner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  knockoutFinalLoser: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  knockoutFinalWinners: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  knockoutFinalLosers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  wildcardFinalWinner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  
  // Real-time update tracking
  lastUpdated: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
  
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Tournament", tournamentSchema);