import React, { useState } from "react";
import { User, Lock } from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const Login = ({ onLogin, toggleRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE}/auth/login`, {
        email: username,  // assuming backend uses 'email' as login field
        password,
      });

      // Save token to localStorage
      localStorage.setItem("token", data.token);

      // Notify parent (App) that user logged in
      onLogin({ name: data.name, email: data.email });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md transform transition hover:scale-105">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute top-4 left-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Email"
              className="w-full p-4 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute top-4 left-3 w-5 h-5 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-4 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-blue-400 to-indigo-500 text-white font-semibold rounded-xl shadow hover:from-blue-500 hover:to-indigo-600 transition transform hover:scale-105"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500">
          Don’t have an account?{" "}
          <span
            className="text-blue-500 font-medium hover:underline cursor-pointer"
            onClick={toggleRegister}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
