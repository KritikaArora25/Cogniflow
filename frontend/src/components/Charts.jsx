import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = ["#6366F1", "#F43F5E", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];

const Charts = ({
  studySessions = [],
  userStats = {},
  weeklyFocusData = [],
  currentFocusTime = 0,
  currentDistractedTime = 0
}) => {

  // -------------------- Study by Subject (today only) --------------------
  const pieSubjectData = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const todays = studySessions.filter(s => {
      const created = s.createdAt ? new Date(s.createdAt) : null;
      return created && created >= startOfToday && created < endOfToday;
    });

    const map = new Map();
    todays.forEach(s => {
      const subject = s.subject || "Other";
      const prev = map.get(subject) || 0;
      map.set(subject, prev + (Number(s.duration) || 0));
    });

    return Array.from(map.entries()).map(([name, seconds]) => ({
      name,
      value: seconds / 60
    }));
  }, [studySessions]);

  // -------------------- Focus vs Distracted --------------------
  const deep = Number(userStats?.totalDeepFocus ?? 0);
  const distracted = Number(userStats?.totalDistracted ?? 0);
  const currentDeepMinutes = Number(currentFocusTime ?? 0) / 60;
  const currentDistractedMinutes = Number(currentDistractedTime ?? 0) / 60;

  const pieFocusData = useMemo(() => [
    { name: "Deep Focus", value: deep + currentDeepMinutes },
    { name: "Distracted", value: distracted + currentDistractedMinutes }
  ], [deep, distracted, currentDeepMinutes, currentDistractedMinutes]);

  const focusTotal = pieFocusData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 w-full max-w-6xl">

      {/* Study Duration by Subject */}
      {pieSubjectData.length > 0 && (
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Study Duration by Subject (min)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieSubjectData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={{ fill: "#374151", fontWeight: "bold" }}
              >
                {pieSubjectData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Focus vs Distracted */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Focus vs Distracted</h3>
        {focusTotal === 0 ? (
          <div className="flex items-center justify-center h-56 text-gray-500">
            No focus/distracted data yet. Start a session to track focus!
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieFocusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={{ fill: "#374151", fontWeight: "bold" }}
              >
                <Cell key="cell-focus" fill="#6366F1" />
                <Cell key="cell-distracted" fill="#F43F5E" />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Weekly Focus Streak */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Weekly Focus Streak</h3>
        {weeklyFocusData.length === 0 ? (
          <div className="flex items-center justify-center h-56 text-gray-500">
            No weekly streak data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyFocusData}>
              <XAxis dataKey="day" tick={{ fill: "#374151" }} />
              <YAxis tick={{ fill: "#374151" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                }}
              />
              <Legend />
              <Bar dataKey="streak" fill="#10B981" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Charts;
