// controllers/studyController.js
import StudySession from "../models/Session.js";

export const addStudySession = async (req, res) => {
  const { subject, allowedSites } = req.body;
  const session = await StudySession.create({
    user: req.user._id,
    subject,
    allowedSites,
  });
  res.status(201).json(session);
};

export const getUserStudySessions = async (req, res) => {
  const sessions = await StudySession.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(sessions);
};

export const updateStudySessionDuration = async (req, res) => {
  const { duration } = req.body;
  const session = await StudySession.findById(req.params.id);
  if (!session) return res.status(404).json({ message: "Session not found" });
  session.duration = duration;
  await session.save();
  res.json(session);
};


export const getWeeklyFocus = async (req, res) => {
  const userId = req.user._id; // use _id, not id
  const sessions = await StudySession.find({ user: userId });

  const weekly = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

  sessions.forEach((s) => {
    const day = s.createdAt.toLocaleDateString("en-US", { weekday: "short" });
    weekly[day] += s.duration / 60; // convert seconds to minutes
  });

  const weeklyData = Object.keys(weekly).map((day) => ({ day, streak: weekly[day] }));
  res.json(weeklyData);
};
