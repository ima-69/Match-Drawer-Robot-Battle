import Match from "../models/Match.js";
import Tournament from "../models/Tournament.js";

export const reportMatchResult = async (req, res) => {
  try {
    const { tournamentId, matchId } = req.params;
    const { winnerId } = req.body;

    let match = await Match.findById(matchId).populate("players");
    if (!match) return res.status(404).json({ error: "Match not found" });

    if (match.status === "completed") {
      return res.status(400).json({ error: "Already completed" });
    }

    if (!match.players.find(p => p._id.toString() === winnerId)) {
      return res.status(400).json({ error: "Winner must be in this match" });
    }

    const losers = match.players.filter(p => p._id.toString() !== winnerId);
    match.winner = winnerId;
    match.losers = losers.map(l => l._id);
    match.status = "completed";
    await match.save();

    // Check if current round is complete
    await checkRoundCompletion(tournamentId, match);

    res.json({ message: "Match updated", match });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function checkRoundCompletion(tournamentId, completedMatch) {
  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) return;

  let currentRoundMatches = [];
  
  if (tournament.currentRound === "knockout") {
    const currentRound = tournament.knockoutRounds[tournament.currentKnockoutRound - 1];
    currentRoundMatches = await Match.find({ _id: { $in: currentRound.matches } });
  } else if (tournament.currentRound === "wildcard") {
    const currentRound = tournament.wildcardRounds[tournament.currentWildcardRound - 1];
    currentRoundMatches = await Match.find({ _id: { $in: currentRound.matches } });
  } else if (tournament.currentRound === "semifinal") {
    currentRoundMatches = await Match.find({ _id: { $in: tournament.semifinalMatches } });
  }

  // Check if all matches in current round are completed
  const allCompleted = currentRoundMatches.every(match => match.status === "completed");
  
  if (allCompleted) {
    tournament.isRoundComplete = true;
    await tournament.save();
  }
}