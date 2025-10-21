// routes/study.js
import express from "express";
import {
  addStudySession,
  getUserStudySessions,
  updateStudySessionDuration,
  getWeeklyFocus,
  checkTabAllowed // ADD THIS IMPORT
} from "../controllers/sessionController.js"; // Make sure this path is correct
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, addStudySession);
router.get("/", protect, getUserStudySessions);
router.get("/weekly", protect, getWeeklyFocus);
router.patch("/:id", protect, updateStudySessionDuration);
router.post("/check-tab", protect, checkTabAllowed); // ADD THIS ROUTE

export default router;