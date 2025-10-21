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
  ResponsiveContainer,
  ReferenceLine
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

    const rawData = Array.from(map.entries()).map(([name, seconds]) => ({
      name,
      value: seconds / 60,
      rawValue: seconds / 60 // Keep original value for tooltip
    }));

    // Calculate total for percentages
    const total = rawData.reduce((sum, item) => sum + item.value, 0);
    
    // Convert to percentages
    return rawData.map(item => ({
      ...item,
      value: total > 0 ? (item.value / total) * 100 : 0,
      percentage: total > 0 ? (item.value / total) * 100 : 0
    }));
  }, [studySessions]);

  // -------------------- Focus vs Distracted --------------------
  const deep = Number(userStats?.totalDeepFocus ?? 0);
  const distracted = Number(userStats?.totalDistracted ?? 0);
  const currentDeepMinutes = Number(currentFocusTime ?? 0) / 60;
  const currentDistractedMinutes = Number(currentDistractedTime ?? 0) / 60;

  const pieFocusData = useMemo(() => {
    const rawData = [
      { name: "Deep Focus", value: deep + currentDeepMinutes, rawValue: deep + currentDeepMinutes },
      { name: "Distracted", value: distracted + currentDistractedMinutes, rawValue: distracted + currentDistractedMinutes }
    ];

    // Calculate total for percentages
    const total = rawData.reduce((sum, item) => sum + item.value, 0);
    
    // Convert to percentages
    return rawData.map(item => ({
      ...item,
      value: total > 0 ? (item.value / total) * 100 : 0,
      percentage: total > 0 ? (item.value / total) * 100 : 0
    }));
  }, [deep, distracted, currentDeepMinutes, currentDistractedMinutes]);

  // -------------------- Weekly Focus Streak with Percentages --------------------
  const weeklyFocusDataWithPercentages = useMemo(() => {
    if (!weeklyFocusData.length) return [];

    // Find the maximum streak value for percentage calculation
    const maxStreak = Math.max(...weeklyFocusData.map(item => item.streak || 0));
    
    return weeklyFocusData.map(item => ({
      ...item,
      streak: item.streak || 0,
      percentage: maxStreak > 0 ? (item.streak / maxStreak) * 100 : 0,
      // For daily goal comparison (assuming 8 hours daily goal)
      dailyGoalPercentage: Math.min(((item.streak || 0) / (8 * 60)) * 100, 100)
    }));
  }, [weeklyFocusData]);

  const focusTotal = pieFocusData.reduce((acc, item) => acc + item.rawValue, 0);

  // Custom tooltip formatter to show percentages
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-semibold text-gray-800">{data.name || data.day}</p>
          <p className="text-gray-600">
            {data.percentage?.toFixed(1) || data.value?.toFixed(1)}%
          </p>
          {data.rawValue !== undefined && (
            <p className="text-gray-500 text-sm">
              ({data.rawValue.toFixed(1)} min)
            </p>
          )}
          {data.streak !== undefined && (
            <p className="text-gray-500 text-sm">
              {data.streak} minutes
            </p>
          )}
          {data.dailyGoalPercentage !== undefined && (
            <p className="text-green-500 text-sm">
              {data.dailyGoalPercentage.toFixed(1)}% of daily goal
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip specifically for weekly focus streak
  const WeeklyFocusTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-semibold text-gray-800">{data.day}</p>
          <p className="text-gray-600">
            Focus: {data.streak} minutes
          </p>
          <p className="text-green-500">
            {data.percentage.toFixed(1)}% of week's best
          </p>
          <p className="text-blue-500 text-sm">
            {data.dailyGoalPercentage.toFixed(1)}% of daily goal
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom label formatter for pie charts
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index
  }) => {
    if (!percent || percent < 0.05) return null; // Don't show label for very small slices

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom bar label for weekly focus
  const renderBarLabel = ({ x, y, width, value, index }) => {
    const data = weeklyFocusDataWithPercentages[index];
    if (!data || data.percentage < 10) return null; // Don't show label for very small bars
    
    return (
      <text 
        x={x + width / 2} 
        y={y - 5} 
        fill="#374151" 
        textAnchor="middle" 
        dominantBaseline="bottom"
        fontSize="10"
        fontWeight="bold"
      >
        {data.percentage.toFixed(0)}%
      </text>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 w-full max-w-6xl">

      {/* Study Duration by Subject */}
      {pieSubjectData.length > 0 && (
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Study Duration by Subject</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieSubjectData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {pieSubjectData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
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
                label={renderCustomizedLabel}
                labelLine={false}
              >
                <Cell key="cell-focus" fill="#6366F1" />
                <Cell key="cell-distracted" fill="#F43F5E" />
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Weekly Focus Streak */}
      <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Weekly Focus Streak</h3>
        {weeklyFocusDataWithPercentages.length === 0 ? (
          <div className="flex items-center justify-center h-56 text-gray-500">
            No weekly streak data yet.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyFocusDataWithPercentages}>
              <XAxis 
                dataKey="day" 
                tick={{ fill: "#374151", fontSize: 12 }} 
              />
              <YAxis 
                tick={{ fill: "#374151" }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<WeeklyFocusTooltip />} />
              <Legend />
              <Bar 
                dataKey="percentage" 
                fill="#10B981" 
                radius={[6,6,0,0]}
                label={renderBarLabel}
                name="% of Week's Best"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Daily Goal Progress (Optional additional chart) */}
      {weeklyFocusDataWithPercentages.length > 0 && (
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Daily Goal Progress</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyFocusDataWithPercentages}>
              <XAxis 
                dataKey="day" 
                tick={{ fill: "#374151", fontSize: 12 }} 
              />
              <YAxis 
                tick={{ fill: "#374151" }}
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, "Daily Goal"]}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="dailyGoalPercentage" 
                fill="#3B82F6" 
                radius={[6,6,0,0]}
                name="% of Daily Goal"
              />
              {/* Target line at 100% */}
              <ReferenceLine y={100} stroke="#EF4444" strokeDasharray="3 3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Charts;