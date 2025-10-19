// models/StudySession.js
import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject: { type: String, required: true },
  allowedSites: [String],
  duration: { type: Number, default: 0 }, // seconds
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("StudySession", studySessionSchema);
