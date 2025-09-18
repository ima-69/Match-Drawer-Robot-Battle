import express from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { reportMatchResult } from "../controllers/matchController.js";

const router = express.Router();

router.patch("/:tournamentId/:matchId", adminAuth, reportMatchResult);

export default router;