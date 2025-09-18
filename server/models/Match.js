import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  roundType: { type: String, enum: ["knockout", "wildcard", "semifinal", "grandfinal"], required: true },
  players: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
  losers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
  
  // Match history for real-time updates
  history: [{
    action: { type: String, enum: ["created", "winner_selected", "completed"], required: true },
    timestamp: { type: Date, default: Date.now },
    winnerId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    loserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
    details: { type: String } // Additional details about the action
  }],
  
  // Real-time update tracking
  lastUpdated: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
  
  createdAt: { type: Date, default: Date.now }
});

// Add method to update match history
matchSchema.methods.addHistoryEntry = function(action, winnerId = null, loserIds = [], details = '') {
  this.history.push({
    action,
    timestamp: new Date(),
    winnerId,
    loserIds,
    details
  });
  this.lastUpdated = new Date();
  this.version += 1;
};

export default mongoose.model("Match", matchSchema);