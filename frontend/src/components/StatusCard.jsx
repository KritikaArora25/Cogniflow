import React from "react";
import { Activity, Brain, Clock, Flame, Zap } from "lucide-react";

const StatusCard = ({ status, deepThinking, currentFocusTime, fatigueLevel, focusStreak }) => {
  const statusColor =
    status === "Active"
      ? "from-green-300/70 to-emerald-300/70"
      : status === "Distracted"
      ? "from-red-300/70 to-rose-300/70"
      : "from-blue-300/70 to-indigo-300/70";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 w-full max-w-6xl">
      <div className={`p-5 rounded-2xl shadow-lg text-gray-800 bg-gradient-to-r ${statusColor} backdrop-blur-md transition-all duration-500`}>
        <div className="flex items-center gap-3"><Activity className="w-6 h-6 text-gray-700" /><h2 className="font-medium">Status</h2></div>
        <p className="mt-2 text-2xl font-bold">{status}</p>
      </div>

      <div className="p-5 rounded-2xl shadow-lg text-gray-800 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3"><Brain className="w-6 h-6 text-purple-600" /><h2 className="font-medium">Deep Thinking</h2></div>
        <p className="mt-2 text-2xl font-bold">{deepThinking ? "Yes" : "No"}</p>
      </div>

      <div className="p-5 rounded-2xl shadow-lg text-gray-800 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3"><Clock className="w-6 h-6 text-blue-500" /><h2 className="font-medium">Focus Time</h2></div>
        <p className="mt-2 text-2xl font-bold">{(currentFocusTime / 60).toFixed(1)} min</p>
      </div>

      <div className="p-5 rounded-2xl shadow-lg text-gray-800 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3"><Flame className="w-6 h-6 text-yellow-500" /><h2 className="font-medium">Focus Streak</h2></div>
        <p className="mt-2 text-2xl font-bold">{focusStreak}</p>
      </div>

      <div className="p-5 rounded-2xl shadow-lg text-gray-800 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-3"><Zap className="w-6 h-6 text-pink-500" /><h2 className="font-medium">Fatigue Level</h2></div>
        <p className="mt-2 text-2xl font-bold">{fatigueLevel}%</p>
      </div>
    </div>
  );
};

export default StatusCard;
