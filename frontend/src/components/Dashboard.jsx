import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StatusCards from "./StatusCard";
import StudySession from "./StudySession";
import StudyModal from "./StudyModal";
import Charts from "./Charts";
import { api } from "../utils/api";

const Dashboard = ({ stats, logout }) => {
  // -------------------- STATES --------------------
  const [userStats, setUserStats] = useState(stats || {});
  const [studySessions, setStudySessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDistractedModal, setShowDistractedModal] = useState(false);

  const [status, setStatus] = useState("Inactive");
  const [deepThinking, setDeepThinking] = useState(false);
  const [currentFocusTime, setCurrentFocusTime] = useState(0);
  const [currentDistractedTime, setCurrentDistractedTime] = useState(0);
  const [focusStreak, setFocusStreak] = useState(userStats.focusStreak || 0);
  const [fatigueLevel, setFatigueLevel] = useState(userStats.fatigueLevel || 0);
  const [weeklyFocusData, setWeeklyFocusData] = useState([]);
  const [onBreak, setOnBreak] = useState(false);
  const [breakTime, setBreakTime] = useState(0);

  // -------------------- FETCH DATA --------------------
  const fetchData = async () => {
    try {
      const { data: userData } = await api.get("/auth/profile");
      setUserStats(userData);
      setFocusStreak(userData.focusStreak || 0);
      setFatigueLevel(userData.fatigueLevel || 0);

      const { data: sessions } = await api.get("/study");
      setStudySessions(sessions);

      const { data: weeklyData } = await api.get("/study/weekly");
      setWeeklyFocusData(weeklyData);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("Session expired. Please log in again.");
        logout();
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -------------------- IDLE DETECTION --------------------
  useEffect(() => {
    let idleTimer;
    const IDLE_LIMIT = 5 * 60 * 1000;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      if (status === "Active") {
        idleTimer = setTimeout(() => {
          const response = window.confirm("Are you still focusing deeply?");
          if (!response) setStatus("Distracted");
        }, IDLE_LIMIT);
      }
    };
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("click", resetIdleTimer);
    resetIdleTimer();
    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("click", resetIdleTimer);
    };
  }, [status]);

  // -------------------- TAB VISIBILITY --------------------
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && status === "Active") setStatus("Distracted");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status]);

  // -------------------- DASHBOARD TIMERS --------------------
  useEffect(() => {
    const interval = setInterval(() => {
      if (status === "Active") {
        setCurrentFocusTime(prev => prev + 1);

        if ((currentFocusTime + 1) % (25 * 60) === 0)
          setFocusStreak(prev => prev + 1);

        if ((currentFocusTime + 1) % (60 * 60) === 0)
          setFatigueLevel(prev => Math.min(prev + 5, 100));
      } else if (status === "Distracted") {
        setCurrentDistractedTime(prev => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [status, currentFocusTime]);

  // -------------------- SESSION SYNC --------------------
  useEffect(() => {
    const interval = setInterval(async () => {
      if (currentSession) {
        const updatedDuration = currentFocusTime + currentDistractedTime + 1;
        setCurrentSession(prev => ({ ...prev, duration: updatedDuration }));
        try {
          await api.patch(`/study/${currentSession._id}`, { duration: updatedDuration });
        } catch (err) {
          console.error("Error syncing session:", err);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentSession, currentFocusTime, currentDistractedTime]);

  // -------------------- DISTRACTED MODAL --------------------
  useEffect(() => setShowDistractedModal(status === "Distracted"), [status]);

  // -------------------- BREAK TIMER --------------------
  useEffect(() => {
    let breakInterval;
    if (onBreak) {
      breakInterval = setInterval(() => setBreakTime(prev => prev + 1), 1000);
    } else {
      setBreakTime(0);
    }
    return () => clearInterval(breakInterval);
  }, [onBreak]);

  // -------------------- HANDLERS --------------------
  const handleStartStudy = session => {
    setCurrentSession(session);
    setStatus("Active");
    setCurrentFocusTime(0);
    setCurrentDistractedTime(0);
    setShowModal(false);
  };

  const handleStopStudy = async () => {
    setStudySessions([...studySessions, currentSession]);
    setStatus("Inactive");
    setCurrentSession(null);
    try {
      const { data: weeklyData } = await api.get("/study/weekly");
      setWeeklyFocusData(weeklyData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartBreak = async () => {
    setOnBreak(true);
    setStatus("Inactive");
  };

  const handleEndBreak = async () => {
    setOnBreak(false);
    setFatigueLevel(0);
    setCurrentFocusTime(0);
    setCurrentDistractedTime(0);
    setStatus("Inactive");
    alert("Break finished! You’re refreshed and ready to start again.");
  };

  // -------------------- RENDER --------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-white p-6 font-sans">
      
      {/* Try this exact code */}
<nav className="flex flex-col sm:flex-row justify-between items-center mb-8 w-full gap-4 px-4">
  <div className="flex-1 overflow-visible min-w-[200px]">
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-purple-500 
                   tracking-tight p-1">
      Cogniflow
    </h1>
  </div>

  <button
    onClick={logout}
    className="flex-shrink-0 px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-700 
               transition shadow-lg"
  >
    Logout
  </button>
</nav>

      {/* Status Cards */}
      <StatusCards
        status={status}
        deepThinking={deepThinking}
        currentFocusTime={currentFocusTime}
        fatigueLevel={fatigueLevel}
        focusStreak={focusStreak}
      />

      {/* Study Session */}
      <div className="mb-8 flex justify-center">
        {currentSession ? (
          <StudySession session={currentSession} onStop={handleStopStudy} />
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className="px-8 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-semibold rounded-xl shadow hover:from-green-500 hover:to-emerald-600 transition transform hover:scale-105"
          >
            Start Study
          </button>
        )}
      </div>

      {showModal && <StudyModal onStart={handleStartStudy} onClose={() => setShowModal(false)} />}

      {showDistractedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-semibold mb-4">Distracted!</h2>
            <p className="mb-4">
              You were distracted for {Math.floor(currentDistractedTime / 60)} min {currentDistractedTime % 60}s
            </p>
            <button
              onClick={() => setStatus("Active")}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              Back to Focus
            </button>
          </div>
        </div>
      )}

      {/* Fatigue / Break Card */}
      <div className="mb-8 flex justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold mb-3 text-purple-700">
            {fatigueLevel >= 70 ? "Take a Break ☕" : "Productivity Tip 💡"}
          </h2>
          {fatigueLevel >= 70 ? (
            <>
              <p className="mb-2 text-gray-700">Your fatigue level is {fatigueLevel}%. Time to refresh!</p>
              <p className="mb-3 text-gray-600 italic">
                Break Time: {Math.floor(breakTime / 60)}:{String(breakTime % 60).padStart(2,"0")}
              </p>
              <button
                onClick={handleEndBreak}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                End Break & Start Fresh
              </button>
            </>
          ) : (
            <>
              <p className="mb-4 text-gray-700">
                Tip: Maintain focus by taking short pauses, stretching, or hydrating regularly.
              </p>
              <button
                disabled
                className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
              >
                Take Break
              </button>
            </>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="mb-8">
        <motion.h3
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-semibold text-gray-700 mb-4"
        >
          Focus Analytics 📊
        </motion.h3>
        <Charts
          studySessions={studySessions}
          userStats={userStats}
          weeklyFocusData={weeklyFocusData}
          currentFocusTime={currentFocusTime}
          currentDistractedTime={currentDistractedTime}
        />
      </div>
    </div>
  );
};

export default Dashboard;
