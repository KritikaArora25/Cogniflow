import React, { useState } from "react";
import { BookOpen, Laptop, X } from "lucide-react";
import { api } from "../utils/api";

const StudyModal = ({ onStart, onClose }) => {
  const [subject, setSubject] = useState("");
  const [sites, setSites] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subject.trim()) {
      alert("Please enter a subject.");
      return;
    }

    // Split allowed sites and remove empty strings
    const allowedSites = sites
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    setLoading(true);
    try {
      const { data } = await api.post("/study", {
        subject,
        allowedSites,
        duration: 0, // start new session with 0 seconds
      });

      onStart(data); // send new session to dashboard
    } catch (err) {
      console.error("Error starting study session:", err);
      alert(
        err.response?.data?.message || "Failed to start study session. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-lg relative transform transition hover:scale-105">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-500" /> Start Study Session
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Subject</label>
            <input
              type="text"
              placeholder="Mathematics"
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>

          {/* Allowed sites input */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Allowed Sites (comma-separated)
            </label>
            <div className="relative">
              <Laptop className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="stackoverflow.com, wikipedia.org"
                className="w-full p-3 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                value={sites}
                onChange={(e) => setSites(e.target.value)}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 text-white font-semibold rounded-xl shadow transition transform hover:scale-105 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-400 to-blue-500 hover:from-indigo-500 hover:to-blue-600"
            }`}
          >
            {loading ? "Starting..." : "Start"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudyModal;