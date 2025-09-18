import express from "express";
import upload from "../utils/multer.js";
import { adminAuth } from "../middleware/adminAuth.js";
import { createTeam, getTeams, deleteTeam } from "../controllers/teamController.js";

const router = express.Router();

router.post("/", adminAuth, upload.single("logo"), createTeam);
router.get("/", getTeams);
router.delete("/:id", adminAuth, deleteTeam);

export default router;