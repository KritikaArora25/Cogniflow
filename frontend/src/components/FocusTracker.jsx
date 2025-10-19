// components/FocusTracker.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';

const FocusTracker = ({ onDistractedChange }) => {
  // --- Basic states ---
  const [lastActive, setLastActive] = useState(Date.now());
  const [isIdle, setIsIdle] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [thinking, setThinking] = useState(false);

  const [distractedStart, setDistractedStart] = useState(null);

  const idleThreshold = 5 * 60 * 1000; // 5 min
  const timeoutRef = useRef(null);

  // --- Cognitive Momentum & Fatigue ---
  const [currentFocusTime, setCurrentFocusTime] = useState(0); // ms
  const [focusStreak, setFocusStreak] = useState(0);
  const [fatigueLevel, setFatigueLevel] = useState(0);

  // --- Update activity ---
  const updateActivity = useCallback(() => {
    setLastActive(Date.now());

    if (distractedStart) {
      const duration = Date.now() - distractedStart;
      onDistractedChange(duration);
      setDistractedStart(null);
      console.log(`User was distracted for ${duration / 1000} sec`);
    }

    if (isIdle) {
      setIsIdle(false);
      setThinking(false);
      setShowPrompt(false);
    }
  }, [distractedStart, isIdle, onDistractedChange]);

  // --- Handle "Thinking" click ---
  const handleThinking = useCallback(() => {
    setThinking(true);
    setShowPrompt(false);
  }, []);

  // --- Check Idle ---
  const checkIdle = useCallback(() => {
    if (Date.now() - lastActive > idleThreshold) {
      setIsIdle(true);
      setShowPrompt(true);

      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          setShowPrompt(false);
          if (!thinking) {
            setDistractedStart(Date.now());
            console.log('User auto-marked as distracted');
          }
          timeoutRef.current = null;
        }, 30000); // 30 sec prompt timeout
      }
    } else {
      setIsIdle(false);
    }
  }, [lastActive, idleThreshold, thinking]);

  // --- Event Listeners for mouse/keyboard/scroll/click ---
  useEffect(() => {
    const events = ['mousemove', 'scroll', 'keydown', 'click'];
    events.forEach(event => window.addEventListener(event, updateActivity));
    const interval = setInterval(checkIdle, 10000); // every 10 sec

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(interval);
    };
  }, [updateActivity, checkIdle]);

  // --- Multi-tab / window detection ---
  useEffect(() => {
    const handleBlur = () => {
      if (!distractedStart) setDistractedStart(Date.now());
    };
    const handleFocus = () => {
      if (distractedStart) {
        const duration = Date.now() - distractedStart;
        onDistractedChange(duration);
        setDistractedStart(null);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') handleBlur();
      else handleFocus();
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [distractedStart, onDistractedChange]);

  // --- Deep Thinking Timer (increments every sec when thinking) ---
  useEffect(() => {
    let interval;
    if (thinking) {
      interval = setInterval(() => setCurrentFocusTime(prev => prev + 1000), 1000);
    }
    return () => clearInterval(interval);
  }, [thinking]);

  // --- Cognitive Momentum: detect streaks ---
  useEffect(() => {
    const FOCUS_INTERVAL = 25 * 60 * 1000; // 25 min
    if (currentFocusTime >= FOCUS_INTERVAL) {
      setFocusStreak(prev => prev + 1);
      setCurrentFocusTime(0);
      alert(`Congrats! Deep focus streak #${focusStreak + 1} completed`);
    }
  }, [currentFocusTime, focusStreak]);

  // --- Fatigue estimation ---
  useEffect(() => {
    const FATIGUE_THRESHOLD = 2 * 60 * 60 * 1000; // 2 hrs continuous focus
    if (currentFocusTime > FATIGUE_THRESHOLD) {
      setFatigueLevel(prev => Math.min(100, prev + 1));
    } else {
      setFatigueLevel(prev => Math.max(0, prev - 1));
    }
  }, [currentFocusTime]);

  return (
    <>
      {/* Thinking prompt */}
      {showPrompt && !thinking && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow-lg">
          <p className="mb-4">Are you still there?</p>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
            onClick={handleThinking}
          >
            Yes, I'm thinking
          </button>
        </div>
      )}

      {/* Debug / UI display */}
      <div className="mt-4 p-4 border rounded shadow">
        <p>Status: {isIdle ? 'Idle' : 'Active'}</p>
        <p>Deep Thinking: {thinking ? 'Yes' : 'No'}</p>
        <p>Current Focus Time: {(currentFocusTime / 60000).toFixed(1)} min</p>
        <p>Deep Work Streaks: {focusStreak}</p>
        <p>Fatigue Level: {fatigueLevel}%</p>
      </div>
    </>
  );
};

export default FocusTracker;
