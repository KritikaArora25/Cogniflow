// routes/study.js
import express from "express";
import {
  addStudySession,
  getUserStudySessions,
  updateStudySessionDuration,
  getWeeklyFocus,
} from "../controllers/sessionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addStudySession);
router.get("/", protect, getUserStudySessions);
router.get("/weekly", protect, getWeeklyFocus);
router.patch("/:id", protect, updateStudySessionDuration);

export default router;
