import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { 
  createTournament, 
  getTournament, 
  getAllTournaments, 
  completeKnockoutRound, 
  completeWildcardRound, 
  startNextKnockoutRound,
  startNextWildcardRound,
  startGrandFinalRound,
  completeGrandFinalRound, 
  completeSecondPlaceRound, 
  reportMatchResult,
  getTournamentWithUpdates,
  deleteTournament 
} from "../controllers/tournamentController.js";

const router = express.Router();

router.post("/", adminAuth, createTournament);
router.get("/", getAllTournaments);
router.get("/:id", getTournament);
router.post("/:id/complete-knockout-round", adminAuth, completeKnockoutRound);
router.post("/:id/complete-wildcard-round", adminAuth, completeWildcardRound);
router.post("/:id/start-next-knockout-round", adminAuth, startNextKnockoutRound);
router.post("/:id/start-next-wildcard-round", adminAuth, startNextWildcardRound);
router.post("/:id/start-grand-final-round", adminAuth, startGrandFinalRound);
router.post("/:id/complete-grand-final-round", adminAuth, completeGrandFinalRound);
router.post("/:id/complete-second-place-round", adminAuth, completeSecondPlaceRound);
router.post("/:tournamentId/matches/:matchId/report-result", adminAuth, reportMatchResult);
router.get("/:id/updates", getTournamentWithUpdates);
router.delete("/:id", adminAuth, deleteTournament);

export default router;