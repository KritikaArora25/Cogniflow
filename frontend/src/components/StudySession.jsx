import React from "react";
import { BookOpen } from "lucide-react";

const StudySession = ({ session, onStop }) => (
  <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-lg">
    <BookOpen className="w-5 h-5 text-indigo-500" />
    <div className="flex-1">
      <p className="font-medium">{session.subject}</p>
      <p className="text-gray-500 text-sm">Duration: {(session.duration/60).toFixed(1)} min</p>
    </div>
    <button onClick={onStop} className="px-4 py-2 bg-red-500 text-white rounded-xl shadow hover:bg-red-600 transition">
      Stop
    </button>
  </div>
);

export default StudySession;
