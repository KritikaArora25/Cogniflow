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

  // DYNAMIC allowed URLs - will be set when session starts
  const [allowedUrls, setAllowedUrls] = useState([]);

  // -------------------- EXTENSION COMMUNICATION --------------------
  useEffect(() => {
    const handleExtensionMessage = async (event) => {
      // Only process messages from our extension and when session is active
      if (event.data.type === 'CURRENT_TAB_INFO' && status === "Active") {
        const currentUrl = event.data.url;
        
        console.log('=== URL CHECK DEBUG ===');
        console.log('Current URL:', currentUrl);
        console.log('Allowed URLs:', allowedUrls);
        
        // BETTER MATCHING LOGIC
        const isAllowed = allowedUrls.some(allowedUrl => {
          // Remove http/https/www for better matching
          const cleanCurrentUrl = currentUrl.toLowerCase().replace(/https?:\/\/(www\.)?/, '');
          const cleanAllowedUrl = allowedUrl.toLowerCase().replace(/https?:\/\/(www\.)?/, '');
          
          console.log(`Comparing: "${cleanCurrentUrl}" WITH "${cleanAllowedUrl}"`);
          
          // Check if the domain matches
          const currentDomain = cleanCurrentUrl.split('/')[0];
          const allowedDomain = cleanAllowedUrl.split('/')[0];
          
          const matches = currentDomain.includes(allowedDomain) || allowedDomain.includes(currentDomain);
          console.log(`Match result: ${matches}`);
          
          return matches;
        });
        
        console.log('FINAL RESULT - Allowed?:', isAllowed);
        console.log('=== END DEBUG ===');
        
        if (!isAllowed) {
          console.log('🚨 EXTENSION: URL not allowed, setting status to Distracted');
          setStatus("Distracted");
        } else {
          console.log('✅ EXTENSION: URL allowed, keeping status Active');
          // If it's allowed, make sure we're not stuck in "Distracted" state
          if (status === "Distracted") {
            setStatus("Active");
          }
        }
      }
    };

    window.addEventListener('message', handleExtensionMessage);
    return () => window.removeEventListener('message', handleExtensionMessage);
  }, [status, allowedUrls]);

  // Tell extension when to start/stop monitoring
  useEffect(() => {
    if (status === "Active" && currentSession) {
      // Tell extension to start monitoring
      window.postMessage({
        type: 'START_SESSION'
      }, '*');
      console.log('Extension: Session started with allowed URLs:', allowedUrls);
    } else if (status === "Inactive") {
      // Tell extension to stop monitoring
      window.postMessage({
        type: 'STOP_SESSION'
      }, '*');
      console.log('Extension: Session stopped');
    }
  }, [status, currentSession, allowedUrls]);

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

  // -------------------- TAB VISIBILITY - COMMENTED OUT --------------------
  /*
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && status === "Active") setStatus("Distracted");
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [status]);
  */

  // -------------------- IDLE DETECTION - COMMENTED OUT --------------------
  
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
          await api.patch(`/study/${currentSession._id}`, { 
            duration: updatedDuration,
            focusTime: currentFocusTime,
            distractedTime: currentDistractedTime
          });
        } catch (err) {
          console.error("Error syncing session:", err);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentSession, currentFocusTime, currentDistractedTime]);

  // -------------------- DISTRACTED MODAL --------------------
  useEffect(() => {
    console.log('🎭 DISTRACTED MODAL: Status changed to:', status);
    setShowDistractedModal(status === "Distracted");
  }, [status]);

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
  const handleStartStudy = (sessionData) => {
    // Set dynamic allowed URLs from the session data
    const dynamicAllowedUrls = [
      window.location.hostname, // Always allow current study site
      ...(sessionData.allowedSites || []) // Add user's allowed sites
    ].filter(url => url && url.trim() !== ''); // Remove empty strings
    
    console.log('🚀 STARTING STUDY SESSION - DEBUG INFO:');
    console.log('Session Data:', sessionData);
    console.log('Current Website Hostname:', window.location.hostname);
    console.log('Final Allowed URLs:', dynamicAllowedUrls);
    
    setAllowedUrls(dynamicAllowedUrls);
    setCurrentSession(sessionData);
    setStatus("Active");
    setCurrentFocusTime(0);
    setCurrentDistractedTime(0);
    setShowModal(false);
  };

  const handleStopStudy = async () => {
    // Update final session data
    if (currentSession) {
      try {
        await api.patch(`/study/${currentSession._id}`, {
          duration: currentFocusTime + currentDistractedTime,
          focusTime: currentFocusTime,
          distractedTime: currentDistractedTime,
          status: 'completed'
        });
      } catch (err) {
        console.error("Error updating session:", err);
      }
    }

    setStudySessions(prev => [...prev, currentSession]);
    setStatus("Inactive");
    setCurrentSession(null);
    setAllowedUrls([]); // Clear allowed URLs when session ends
    
    try {
      const { data: weeklyData } = await api.get("/study/weekly");
      setWeeklyFocusData(weeklyData);
      await fetchData(); // Refresh all data
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
    alert("Break finished! You're refreshed and ready to start again.");
  };

  const handleBackToFocus = () => {
    console.log('🔄 USER: Clicked "Back to Focus"');
    
    setStatus("Active");
    // setCurrentDistractedTime(0);
  };

  // -------------------- RENDER --------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-white p-6 font-sans">
      
      {/* Header */}
      <nav className="flex flex-col sm:flex-row justify-between items-center mb-8 w-full gap-4 px-4">
        <div className="flex-1 overflow-visible min-w-[200px]">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-black 
                         tracking-tight p-1">
            Cogniflow
          </h1>
        </div>

        <button
          onClick={logout}
          className="flex-shrink-0 px-6 py-3 bg-black text-white rounded-xl hover:bg-black-700 
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
            className="px-8 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold rounded-xl shadow hover:from-gray-800 hover:to-gray-900 transition transform hover:scale-105"
          >
            Start Study
          </button>
        )}
      </div>

      {showModal && <StudyModal onStart={handleStartStudy} onClose={() => setShowModal(false)} />}

      {/* Distracted Modal */}
      {showDistractedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-semibold mb-4">🚨 Distracted!</h2>
            <p className="mb-4">
              You were distracted for {Math.floor(currentDistractedTime / 60)} min {currentDistractedTime % 60}s
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Get back to your study site!
            </p>
            <button
              onClick={handleBackToFocus}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
            >
              Back to Focus
            </button>
          </div>
        </div>
      )}

      {/* Allowed Websites Display */}
      {status === "Active" && allowedUrls.length > 0 && (
        <div className="mb-4 text-center">
          <div className="inline-flex flex-col items-center bg-white rounded-2xl px-6 py-4 shadow">
            <span className="text-sm font-medium text-gray-600 mb-2">
              ✅ Allowed Study Websites:
            </span>
            <div className="flex flex-wrap gap-2 justify-center">
              {allowedUrls.map((url, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-green-100 text-gray-800 text-sm rounded-full"
                >
                  {url}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Extension Status */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center bg-white rounded-full px-4 py-2 shadow">
          <div className={`w-3 h-3 rounded-full mr-2 ${status === "Active" ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <span className="text-sm text-gray-600">
            Extension: {status === "Active" ? 'Monitoring Tabs' : 'Standby'}
          </span>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-8">
        <motion.h3
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-[#040405] mb-4"
        >
          Focus Analytics
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