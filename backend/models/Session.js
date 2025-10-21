// models/StudySession.js - Optional enhancement
import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject: { type: String, required: true },
  allowedSites: [String],
  duration: { type: Number, default: 0 }, // total seconds
  focusTime: { type: Number, default: 0 }, // seconds actually focused
  distractedTime: { type: Number, default: 0 }, // seconds distracted
  status: { type: String, enum: ["active", "completed"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("StudySession", studySessionSchema);