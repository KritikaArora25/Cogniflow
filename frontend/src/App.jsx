import React, { useState } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./components/Dashboard";

function App() {
  const [user, setUser] = useState(null); // null = not logged in
  const [view, setView] = useState("login"); // "login" or "register"

  // Mock stats data for dashboard
  const stats = {
    totalDistracted: 10,
    totalDeepFocus: 25,
    focusStreak: 5,
    fatigueLevel: 40,
    focusTime: 180, // in minutes
  };

  // Handle login
  const handleLogin = (formData) => {
    if (!formData) return;
    const { email, password } = formData;
    console.log("Login:", email, password);

    // TODO: Call backend API, get token & user info
    setUser({ email });
  };

  // Handle register
  const handleRegister = (formData) => {
    if (!formData) return;
    const { name, email, password } = formData;
    console.log("Register:", name, email, password);

    // TODO: Call backend API, get token & user info
    setUser({ name, email });
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    setView("login");
  };

  // Toggle between login/register
  const toggleView = () => {
    setView(view === "login" ? "register" : "login");
  };

  // Render
  if (!user) {
    return view === "login" ? (
      <Login onLogin={handleLogin} toggleRegister={toggleView} />
    ) : (
      <Register onRegister={handleRegister} toggleLogin={toggleView} />
    );
  }

  return <Dashboard stats={stats} logout={handleLogout} />;
}

export default App;
