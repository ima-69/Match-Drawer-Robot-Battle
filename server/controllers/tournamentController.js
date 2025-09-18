import Tournament from "../models/Tournament.js";
import Match from "../models/Match.js";
import Team from "../models/Team.js";

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getNextPowerOfTwo(n) {
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

export const createTournament = async (req, res) => {
  try {
    const { name, selectedTeamIds } = req.body;
    
    let teams;
    if (selectedTeamIds && selectedTeamIds.length > 0) {
      teams = await Team.find({ _id: { $in: selectedTeamIds } });
    } else {
      teams = await Team.find();
    }
    
    if (teams.length < 2) return res.status(400).json({ error: "Need at least 2 teams" });

    teams = shuffle([...teams]);
    
    // Create first knockout round
    const knockoutMatches = await createKnockoutRound(teams, 1);

    const tournament = new Tournament({
      name,
      teams: teams.map(t => t._id),
      knockoutRounds: [{
        roundNumber: 1,
        matches: knockoutMatches.map(m => m._id),
        isCompleted: false
      }],
      currentRound: "knockout",
      currentKnockoutRound: 1,
      isRoundComplete: false
    });
    await tournament.save();

    res.status(201).json({ 
      message: "Tournament created successfully", 
      tournamentId: tournament._id, 
      matches: knockoutMatches,
      totalTeams: teams.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper function to create knockout round matches
async function createKnockoutRound(teams, roundNumber) {
  const matches = [];
  const shuffledTeams = shuffle([...teams]);
  
  console.log(`Creating Knockout Round ${roundNumber} with ${teams.length} teams`);
  
  // Handle odd number of teams
  if (shuffledTeams.length % 2 !== 0) {
    // Randomly select one team to advance directly
    const randomIndex = Math.floor(Math.random() * shuffledTeams.length);
    const byeTeam = shuffledTeams.splice(randomIndex, 1)[0];
    
    const byeMatch = new Match({
      roundType: "knockout",
      players: [byeTeam._id],
      winner: byeTeam._id,
      status: "completed"
    });
    
    // Add history entry for bye
    byeMatch.addHistoryEntry("created", null, [], `Bye - Team ${byeTeam.name} advances directly`);
    byeMatch.addHistoryEntry("winner_selected", byeTeam._id, [], `Team ${byeTeam.name} wins by bye`);
    byeMatch.addHistoryEntry("completed", byeTeam._id, [], `Match completed - Bye`);
    
    await byeMatch.save();
    matches.push(byeMatch);
    
    console.log(`Team ${byeTeam.name} gets a bye and advances directly`);
  }
  
  // Create matches for remaining teams
  for (let i = 0; i < shuffledTeams.length; i += 2) {
    const match = new Match({
      roundType: "knockout",
      players: [shuffledTeams[i]._id, shuffledTeams[i + 1]._id]
    });
    
    // Add history entry for match creation
    match.addHistoryEntry("created", null, [], `Match created between ${shuffledTeams[i].name} and ${shuffledTeams[i + 1].name}`);
    
    await match.save();
    matches.push(match);
  }
  
  return matches;
}

// Helper function to create wildcard round matches
async function createWildcardRound(teams, roundNumber) {
  const matches = [];
  const shuffledTeams = shuffle([...teams]);
  
  console.log(`Creating Wildcard Round ${roundNumber} with ${teams.length} teams`);
  
  // Handle teams that can't make 3-team matches
  while (shuffledTeams.length > 0) {
    if (shuffledTeams.length === 1) {
      // 1 team left - advance directly
      const byeTeam = shuffledTeams.shift();
      const byeMatch = new Match({
        roundType: "wildcard",
        players: [byeTeam._id],
        winner: byeTeam._id,
        status: "completed"
      });
      
      // Add history entry for bye
      byeMatch.addHistoryEntry("created", null, [], `Bye - Team ${byeTeam.name} advances directly`);
      byeMatch.addHistoryEntry("winner_selected", byeTeam._id, [], `Team ${byeTeam.name} wins by bye`);
      byeMatch.addHistoryEntry("completed", byeTeam._id, [], `Match completed - Bye`);
      
      await byeMatch.save();
      matches.push(byeMatch);
      console.log(`Team ${byeTeam.name} advances directly from wildcard`);
    } else if (shuffledTeams.length === 2) {
      // 2 teams left - create 2-team match
      const match = new Match({
        roundType: "wildcard",
        players: [shuffledTeams[0]._id, shuffledTeams[1]._id]
      });
      
      // Add history entry for match creation
      match.addHistoryEntry("created", null, [], `Wildcard match created between ${shuffledTeams[0].name} and ${shuffledTeams[1].name}`);
      
      await match.save();
      matches.push(match);
      shuffledTeams.splice(0, 2);
    } else {
      // 3 or more teams - create 3-team match
      const match = new Match({
        roundType: "wildcard",
        players: [shuffledTeams[0]._id, shuffledTeams[1]._id, shuffledTeams[2]._id]
      });
      
      // Add history entry for match creation
      match.addHistoryEntry("created", null, [], `Wildcard match created between ${shuffledTeams[0].name}, ${shuffledTeams[1].name}, and ${shuffledTeams[2].name}`);
      
      await match.save();
      matches.push(match);
      shuffledTeams.splice(0, 3);
    }
  }
  
  return matches;
}

export const completeKnockoutRound = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Completing knockout round for tournament: ${id}`);
    
    const tournament = await Tournament.findById(id).populate('teams');
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    if (tournament.currentRound !== "knockout") {
      return res.status(400).json({ error: "Tournament is not in knockout round" });
    }

    const currentRound = tournament.knockoutRounds[tournament.currentKnockoutRound - 1];
    if (!currentRound) {
      return res.status(400).json({ error: "No current knockout round found" });
    }

    const matches = await Match.find({ _id: { $in: currentRound.matches } });
    
    // Check if all matches are completed
    const allCompleted = matches.every(match => match.status === "completed");
    if (!allCompleted) {
      return res.status(400).json({ error: "All matches in current round must be completed" });
    }

    // Mark current round as completed
    currentRound.isCompleted = true;
    
    // Get winners and losers
    const winners = matches
      .filter(match => match.winner)
      .map(match => match.winner);
    
    const losers = matches
      .filter(match => match.players.length > 1)
      .flatMap(match => match.losers || []);

    console.log(`Knockout Round ${tournament.currentKnockoutRound} completed. Winners: ${winners.length}, Losers: ${losers.length}`);

    // Check if this is the final knockout round (2 teams)
    if (winners.length === 2) {
      console.log("Final knockout round completed - storing results");
      tournament.knockoutComplete = true;
      
      // Store knockout final winners and losers
      tournament.knockoutFinalWinners = winners; // Store both winners
      tournament.knockoutFinalLosers = losers; // Store both losers
      
      // For backward compatibility, also store individual winner/loser
      tournament.knockoutFinalWinner = winners[0];
      tournament.knockoutFinalLoser = losers[0];
      
      // Check if we need to create the final wildcard round
      if (tournament.nextWildcardTeams && tournament.nextWildcardTeams.length === 3) {
        console.log("Creating final wildcard round with 3 teams");
        const finalWildcardMatches = await createWildcardRound(tournament.nextWildcardTeams, tournament.currentWildcardRound);
        
        tournament.wildcardRounds.push({
          roundNumber: tournament.currentWildcardRound,
          matches: finalWildcardMatches.map(m => m._id),
          isCompleted: false
        });
        
        tournament.nextWildcardTeams = []; // Clear stored teams since we created the round
        
        console.log(`Created final wildcard round with ${finalWildcardMatches.length} matches`);
        console.log(`Teams in final wildcard: ${finalWildcardMatches.map(m => m.players.map(p => p.name || p._id)).flat()}`);
      }
      
      // Switch to wildcard round to complete final wildcard round
      tournament.currentRound = "wildcard";
      tournament.isRoundComplete = false;
      
      console.log(`Knockout final winners: ${winners.length}, Knockout final losers: ${losers.length}`);
      console.log(`Stored knockoutFinalWinners: ${tournament.knockoutFinalWinners?.length || 0}, knockoutFinalLosers: ${tournament.knockoutFinalLosers?.length || 0}`);
      console.log(`Switching to wildcard round to complete final wildcard round`);
    } else {
      // Store winners for next knockout round (don't start it yet)
      tournament.nextKnockoutTeams = winners;
      
      // Add losers to next wildcard round (progressive system)
      if (losers.length > 0) {
        tournament.nextWildcardTeams = [...(tournament.nextWildcardTeams || []), ...losers];
        console.log(`Added ${losers.length} knockout losers to next wildcard round`);
        console.log(`Total teams for next wildcard round: ${tournament.nextWildcardTeams.length}`);
      }
      
      // Switch to wildcard round and create first wildcard round if it doesn't exist
      tournament.currentRound = "wildcard";
      tournament.isRoundComplete = false;
      
      // Create first wildcard round if it doesn't exist
      if (tournament.wildcardRounds.length === 0 && tournament.nextWildcardTeams.length > 0) {
        console.log(`Creating first wildcard round with ${tournament.nextWildcardTeams.length} teams`);
        const wildcardMatches = await createWildcardRound(tournament.nextWildcardTeams, 1);
        
        tournament.wildcardRounds = [{
          roundNumber: 1,
          matches: wildcardMatches.map(m => m._id),
          isCompleted: false
        }];
        
        tournament.currentWildcardRound = 1;
        tournament.nextWildcardTeams = []; // Clear stored teams since we created the round
        
        console.log(`Created first wildcard round with ${wildcardMatches.length} matches`);
        console.log(`Wildcard round matches:`, wildcardMatches.map(m => ({ id: m._id, players: m.players })));
      } else {
        console.log(`Wildcard round already exists or no teams to create round. Wildcard rounds: ${tournament.wildcardRounds.length}, Next wildcard teams: ${tournament.nextWildcardTeams.length}`);
      }
      
      console.log(`Stored ${winners.length} teams for next knockout round`);
      console.log(`Stored ${losers.length} losers for next wildcard round`);
    }

    await tournament.save();
    console.log("Knockout round completed successfully");
    res.json({ message: "Knockout round completed successfully", tournament });
  } catch (err) {
    console.error("Error completing knockout round:", err);
    res.status(500).json({ error: err.message });
  }
};

export const completeWildcardRound = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Completing wildcard round for tournament: ${id}`);
    
    const tournament = await Tournament.findById(id).populate('teams');
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    if (tournament.currentRound !== "wildcard") {
      return res.status(400).json({ error: "Tournament is not in wildcard round" });
    }

    const currentRound = tournament.wildcardRounds[tournament.currentWildcardRound - 1];
    if (!currentRound) {
      return res.status(400).json({ error: "No current wildcard round found" });
    }

    const matches = await Match.find({ _id: { $in: currentRound.matches } });
    
    // Check if all matches are completed
    const allCompleted = matches.every(match => match.status === "completed");
    if (!allCompleted) {
      return res.status(400).json({ error: "All matches in current round must be completed" });
    }

    // Mark current round as completed
    currentRound.isCompleted = true;
    
    // Get winners
    const winners = matches
      .filter(match => match.winner)
      .map(match => match.winner);

    console.log(`Wildcard Round ${tournament.currentWildcardRound} completed. Winners: ${winners.length}`);
    console.log(`Tournament state - knockoutFinalWinners: ${tournament.knockoutFinalWinners?.length || 0}, knockoutFinalLosers: ${tournament.knockoutFinalLosers?.length || 0}`);

    // Check if this is the final wildcard round (3 teams) or second wildcard round (1 winner)
    if (winners.length === 3) {
      console.log("Final wildcard round completed - storing results");
      
      // Store wildcard final winner (we'll select one from the 3)
      tournament.wildcardFinalWinner = winners[0]; // For now, take first one
      
      // Check if we have knockout final losers to create second wildcard round
      if (tournament.knockoutFinalLosers && tournament.knockoutFinalLosers.length === 2) {
        console.log("Creating second wildcard round with wildcard winner + 2 knockout losers");
        
        // Create second wildcard round: wildcard winner + 2 knockout losers
        const secondWildcardTeams = [tournament.wildcardFinalWinner, ...tournament.knockoutFinalLosers];
        const secondWildcardMatches = await createWildcardRound(secondWildcardTeams, tournament.currentWildcardRound + 1);
        
        tournament.wildcardRounds.push({
          roundNumber: tournament.currentWildcardRound + 1,
          matches: secondWildcardMatches.map(m => m._id),
          isCompleted: false
        });
        
        tournament.currentWildcardRound = tournament.currentWildcardRound + 1;
        tournament.wildcardComplete = false; // Not complete yet, need second wildcard round
        
        console.log(`Created second wildcard round with ${secondWildcardMatches.length} matches`);
        console.log(`Teams in second wildcard: ${secondWildcardTeams.map(t => t.name || t._id)}`);
      } else if (tournament.knockoutFinalWinners && tournament.knockoutFinalWinners.length === 2) {
        // We have knockout final winners but no losers yet - this shouldn't happen in the new structure
        console.log("ERROR: We have knockout final winners but no losers. This indicates a logic error.");
        tournament.wildcardComplete = true;
        tournament.currentRound = "grandfinal";
        tournament.isRoundComplete = false;
        
        console.log(`Switching to grand final with existing knockout winners`);
      } else {
        // No knockout final losers yet, this is the first final wildcard round
        console.log("No knockout final losers found. This might be the first final wildcard round.");
        console.log(`knockoutFinalLosers: ${tournament.knockoutFinalLosers}, knockoutFinalWinners: ${tournament.knockoutFinalWinners}`);
        
        tournament.wildcardComplete = true;
        
        // Switch to knockout round to complete final knockout round
        tournament.currentRound = "knockout";
        tournament.isRoundComplete = false;
        
        console.log(`First final wildcard round completed. Waiting for knockout final losers.`);
      }
      
      console.log(`Wildcard final winner: ${winners[0]}`);
    } else if (winners.length === 1 && tournament.knockoutFinalWinners) {
      // This is the second wildcard round completion - we have the final wildcard winner
      console.log("Second wildcard round completed - final wildcard winner determined");
      tournament.wildcardComplete = true;
      
      // Update the final wildcard winner
      tournament.wildcardFinalWinner = winners[0];
      
      // Switch to grand final
      tournament.currentRound = "grandfinal";
      tournament.isRoundComplete = false;
      
      console.log(`Final wildcard winner: ${winners[0]}`);
      console.log(`Switching to grand final: 2 knockout winners will compete`);
    } else {
      // Store winners for next wildcard round (don't start it yet)
      tournament.nextWildcardTeams = winners;
      
      // Switch back to knockout round
      tournament.currentRound = "knockout";
      tournament.isRoundComplete = false;
      
      console.log(`Stored ${winners.length} wildcard winners for next wildcard round`);
      console.log(`Total teams stored for next wildcard round: ${tournament.nextWildcardTeams.length}`);
    }

    await tournament.save();
    console.log("Wildcard round completed successfully");
    res.json({ message: "Wildcard round completed successfully", tournament });
  } catch (err) {
    console.error("Error completing wildcard round:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getTournament = async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('teams')
      .populate('nextKnockoutTeams')
      .populate('nextWildcardTeams')
      .populate('knockoutFinalWinner')
      .populate('knockoutFinalLoser')
      .populate('knockoutFinalWinners')
      .populate('knockoutFinalLosers')
      .populate('wildcardFinalWinner')
      .populate({
        path: 'knockoutRounds.matches',
        populate: { path: 'players' }
      })
      .populate({
        path: 'wildcardRounds.matches',
        populate: { path: 'players' }
      })
      .populate({
        path: 'semifinalMatches',
        populate: { path: 'players' }
      })
      .populate({
        path: 'finalMatch',
        populate: { path: 'players' }
      })
      .populate({
        path: 'secondPlaceMatch',
        populate: { path: 'players' }
      });
    
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }
    
    res.json(tournament);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().populate('teams');
    res.json(tournaments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Start next knockout round
export const startNextKnockoutRound = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Starting next knockout round for tournament: ${id}`);
    
    const tournament = await Tournament.findById(id).populate('teams');
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    if (tournament.currentRound !== "knockout") {
      return res.status(400).json({ error: "Tournament is not in knockout round" });
    }

    if (!tournament.nextKnockoutTeams || tournament.nextKnockoutTeams.length === 0) {
      return res.status(400).json({ error: "No teams available for next knockout round" });
    }

    // Create next knockout round
    const nextRoundNumber = tournament.currentKnockoutRound + 1;
    const nextRoundMatches = await createKnockoutRound(tournament.nextKnockoutTeams, nextRoundNumber);
    
    tournament.knockoutRounds.push({
      roundNumber: nextRoundNumber,
      matches: nextRoundMatches.map(m => m._id),
      isCompleted: false
    });
    
    tournament.currentKnockoutRound = nextRoundNumber;
    tournament.nextKnockoutTeams = []; // Clear stored teams
    tournament.isRoundComplete = false;

    await tournament.save();
    console.log(`Started knockout round ${nextRoundNumber} with ${nextRoundMatches.length} matches`);
    res.json({ message: `Knockout round ${nextRoundNumber} started successfully`, tournament });
  } catch (err) {
    console.error("Error starting next knockout round:", err);
    res.status(500).json({ error: err.message });
  }
};

// Start next wildcard round
export const startNextWildcardRound = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Starting next wildcard round for tournament: ${id}`);
    
    const tournament = await Tournament.findById(id).populate('teams');
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    if (tournament.currentRound !== "wildcard") {
      return res.status(400).json({ error: "Tournament is not in wildcard round" });
    }

    if (!tournament.nextWildcardTeams || tournament.nextWildcardTeams.length === 0) {
      return res.status(400).json({ error: "No teams available for next wildcard round" });
    }

    // Create next wildcard round
    const nextRoundNumber = tournament.currentWildcardRound + 1;
    const nextRoundMatches = await createWildcardRound(tournament.nextWildcardTeams, nextRoundNumber);
    
    tournament.wildcardRounds.push({
      roundNumber: nextRoundNumber,
      matches: nextRoundMatches.map(m => m._id),
      isCompleted: false
    });
    
    tournament.currentWildcardRound = nextRoundNumber;
    tournament.nextWildcardTeams = []; // Clear stored teams
    tournament.isRoundComplete = false;

    await tournament.save();
    console.log(`Started wildcard round ${nextRoundNumber} with ${nextRoundMatches.length} matches`);
    res.json({ message: `Wildcard round ${nextRoundNumber} started successfully`, tournament });
  } catch (err) {
    console.error("Error starting next wildcard round:", err);
    res.status(500).json({ error: err.message });
  }
};

export const completeGrandFinalRound = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Completing grand final round for tournament: ${id}`);
    
    const tournament = await Tournament.findById(id).populate('teams');
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    if (tournament.currentRound !== "grandfinal") {
      return res.status(400).json({ error: "Tournament is not in grand final round" });
    }

    const matches = await Match.find({ _id: { $in: tournament.finalMatch ? [tournament.finalMatch] : [] } });
    
    // Check if all matches are completed
    const allCompleted = matches.every(match => match.status === "completed");
    if (!allCompleted) {
      return res.status(400).json({ error: "All matches in current round must be completed" });
    }

    // Get winners
    const winners = matches
      .filter(match => match.winner)
      .map(match => match.winner);

    console.log(`Grand final completed. Winners: ${winners.length}`);

    if (winners.length === 1) {
      // Create 2nd place match between knockout final loser and wildcard final winner
      console.log("Creating 2nd place match between knockout final loser and wildcard final winner");
      
      const secondPlaceMatch = new Match({
        roundType: "secondplace",
        players: [tournament.knockoutFinalLoser, tournament.wildcardFinalWinner]
      });
      await secondPlaceMatch.save();
      
      tournament.secondPlaceMatch = secondPlaceMatch._id;
      tournament.currentRound = "secondplace";
      tournament.isRoundComplete = false;
      
      console.log(`2nd place match: Knockout final loser vs Wildcard final winner`);
      console.log(`Knockout final loser: ${tournament.knockoutFinalLoser}, Wildcard final winner: ${tournament.wildcardFinalWinner}`);
    } else {
      return res.status(400).json({ error: "Grand final should have exactly 1 winner" });
    }

    await tournament.save();
    console.log("Grand final round completed successfully");
    res.json({ message: "Grand final round completed successfully", tournament });
  } catch (err) {
    console.error("Error completing grand final round:", err);
    res.status(500).json({ error: err.message });
  }
};

// Complete second place match
export const completeSecondPlaceRound = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Completing second place match for tournament: ${id}`);
    
    const tournament = await Tournament.findById(id).populate('teams');
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    if (tournament.currentRound !== "secondplace") {
      return res.status(400).json({ error: "Tournament is not in second place round" });
    }

    const match = await Match.findById(tournament.secondPlaceMatch);
    if (!match) {
      return res.status(400).json({ error: "Second place match not found" });
    }

    if (match.status !== "completed") {
      return res.status(400).json({ error: "Second place match must be completed" });
    }

    // Tournament is now complete
    tournament.currentRound = "completed";
    tournament.isRoundComplete = true;

    await tournament.save();
    console.log("Second place match completed - Tournament finished!");
    res.json({ message: "Tournament completed successfully", tournament });
  } catch (err) {
    console.error("Error completing second place match:", err);
    res.status(500).json({ error: err.message });
  }
};

// Start grand final round
export const startGrandFinalRound = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Starting grand final round for tournament: ${id}`);
    
    const tournament = await Tournament.findById(id).populate('teams');
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    if (tournament.currentRound !== "grandfinal") {
      return res.status(400).json({ error: "Tournament is not in grand final round" });
    }

    if (!tournament.knockoutFinalWinner) {
      return res.status(400).json({ error: "Missing knockout final winner" });
    }

    // Create grand final match between the 2 knockout final winners
    const grandFinalMatch = new Match({
      roundType: "grandfinal",
      players: tournament.knockoutFinalWinners || [tournament.knockoutFinalWinner, tournament.knockoutFinalWinner]
    });
    await grandFinalMatch.save();
    
    tournament.finalMatch = grandFinalMatch._id;
    tournament.isRoundComplete = false;

    await tournament.save();
    console.log(`Started grand final match: 2 knockout winners competing`);
    res.json({ message: "Grand final round started successfully", tournament });
  } catch (err) {
    console.error("Error starting grand final round:", err);
    res.status(500).json({ error: err.message });
  }
};

export const completeFinalRound = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Completing final round for tournament: ${id}`);
    
    const tournament = await Tournament.findById(id).populate('teams');
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }

    if (tournament.currentRound !== "grandfinal") {
      return res.status(400).json({ error: "Tournament is not in final round" });
    }

    const finalMatch = await Match.findById(tournament.finalMatch);
    if (!finalMatch) {
      return res.status(400).json({ error: "Final match not found" });
    }

    if (finalMatch.status !== "completed") {
      return res.status(400).json({ error: "Final match must be completed first" });
    }

    // Tournament is complete
    tournament.currentRound = "completed";
    tournament.isRoundComplete = true;
    
    await tournament.save();
    console.log("Tournament completed successfully");
    console.log(`Tournament champion: ${finalMatch.winner}`);
    res.json({ message: "Tournament completed successfully", tournament });
  } catch (err) {
    console.error("Error completing final round:", err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function to get wildcard winners
async function getWildcardWinners(tournament) {
  if (tournament.wildcardRounds.length === 0) {
    return [];
  }
  
  const lastWildcardRound = tournament.wildcardRounds[tournament.wildcardRounds.length - 1];
  const matches = await Match.find({ _id: { $in: lastWildcardRound.matches } });
  
  return matches
    .filter(match => match.winner)
    .map(match => match.winner);
}

// Report match result with history tracking
export const reportMatchResult = async (req, res) => {
  try {
    const { tournamentId, matchId } = req.params;
    const { winnerId } = req.body;
    
    console.log(`Reporting match result: Tournament ${tournamentId}, Match ${matchId}, Winner ${winnerId}`);
    
    const match = await Match.findById(matchId).populate('players');
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    
    // Validate winner is in the match
    const winner = match.players.find(player => player._id.toString() === winnerId);
    if (!winner) {
      return res.status(400).json({ error: "Winner must be one of the match participants" });
    }
    
    // Set winner and losers
    match.winner = winnerId;
    match.losers = match.players
      .filter(player => player._id.toString() !== winnerId)
      .map(player => player._id);
    
    // Add history entry for winner selection
    match.addHistoryEntry("winner_selected", winnerId, match.losers, `Winner selected: ${winner.name}`);
    
    // Mark as completed
    match.status = "completed";
    match.addHistoryEntry("completed", winnerId, match.losers, `Match completed - ${winner.name} wins`);
    
    await match.save();
    
    // Update tournament version for real-time tracking
    const tournament = await Tournament.findById(tournamentId);
    if (tournament) {
      tournament.lastUpdated = new Date();
      tournament.version += 1;
      await tournament.save();
    }
    
    console.log(`Match result reported: ${winner.name} wins`);
    res.json({ 
      message: "Match result reported successfully", 
      match: await Match.findById(matchId).populate('players winner losers'),
      tournamentVersion: tournament?.version
    });
  } catch (err) {
    console.error("Error reporting match result:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get tournament with real-time updates
export const getTournamentWithUpdates = async (req, res) => {
  try {
    const { id } = req.params;
    const { version } = req.query;
    
    const tournament = await Tournament.findById(id)
      .populate('teams')
      .populate('nextKnockoutTeams')
      .populate('nextWildcardTeams')
      .populate('knockoutFinalWinner')
      .populate('knockoutFinalLoser')
      .populate('wildcardFinalWinner')
      .populate({
        path: 'knockoutRounds.matches',
        populate: { 
          path: 'players winner losers',
          options: { sort: { 'history.timestamp': -1 } }
        }
      })
      .populate({
        path: 'wildcardRounds.matches',
        populate: { 
          path: 'players winner losers',
          options: { sort: { 'history.timestamp': -1 } }
        }
      })
      .populate({
        path: 'semifinalMatches',
        populate: { 
          path: 'players winner losers',
          options: { sort: { 'history.timestamp': -1 } }
        }
      })
      .populate({
        path: 'finalMatch',
        populate: { 
          path: 'players winner losers',
          options: { sort: { 'history.timestamp': -1 } }
        }
      });
    
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }
    
    // Check if client has latest version
    const clientVersion = parseInt(version) || 0;
    const hasUpdates = tournament.version > clientVersion;
    
    res.json({
      tournament,
      hasUpdates,
      currentVersion: tournament.version,
      lastUpdated: tournament.lastUpdated
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const tournament = await Tournament.findByIdAndDelete(id);
    if (!tournament) {
      return res.status(404).json({ error: "Tournament not found" });
    }
    
    // Delete all associated matches
    const allMatchIds = [
      ...tournament.knockoutRounds.flatMap(r => r.matches),
      ...tournament.wildcardRounds.flatMap(r => r.matches),
      ...tournament.semifinalMatches,
      tournament.finalMatch
    ].filter(Boolean);
    
    await Match.deleteMany({ _id: { $in: allMatchIds } });
    
    res.json({ message: "Tournament deleted successfully", tournamentId: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};