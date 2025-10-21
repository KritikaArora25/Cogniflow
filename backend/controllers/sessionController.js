// controllers/studyController.js
import StudySession from "../models/Session.js";

export const addStudySession = async (req, res) => {
  const { subject, allowedSites } = req.body;
  const session = await StudySession.create({
    user: req.user._id,
    subject,
    allowedSites: allowedSites || [], // Ensure it's always an array
  });
  res.status(201).json(session);
};

export const getUserStudySessions = async (req, res) => {
  const sessions = await StudySession.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(sessions);
};

export const updateStudySessionDuration = async (req, res) => {
  const { duration, focusTime, distractedTime, status } = req.body;
  const session = await StudySession.findById(req.params.id);
  
  if (!session) return res.status(404).json({ message: "Session not found" });
  
  // Update multiple fields
  if (duration !== undefined) session.duration = duration;
  if (focusTime !== undefined) session.focusTime = focusTime;
  if (distractedTime !== undefined) session.distractedTime = distractedTime;
  if (status !== undefined) session.status = status;
  
  await session.save();
  res.json(session);
};

// ADD THIS NEW FUNCTION: Check if current tab is allowed
export const checkTabAllowed = async (req, res) => {
  const { currentUrl, sessionId } = req.body;
  
  const session = await StudySession.findOne({ 
    _id: sessionId, 
    user: req.user._id 
  });

  if (!session) {
    return res.status(404).json({ message: "Study session not found" });
  }

  // Check if current URL matches any allowed site
  const isAllowed = session.allowedSites.some(allowedSite => 
    currentUrl.includes(allowedSite)
  );

  res.json({ isAllowed });
};

export const getWeeklyFocus = async (req, res) => {
  const userId = req.user._id;
  const sessions = await StudySession.find({ user: userId });

  const weekly = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

  sessions.forEach((s) => {
    const day = s.createdAt.toLocaleDateString("en-US", { weekday: "short" });
    weekly[day] += s.duration / 60; // convert seconds to minutes
  });

  const weeklyData = Object.keys(weekly).map((day) => ({ day, streak: weekly[day] }));
  res.json(weeklyData);
};