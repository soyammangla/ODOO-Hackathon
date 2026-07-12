import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@ecosphere.com");
  const [password, setPassword] = useState("password123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-eco-900">
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-1">EcoSphere</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to your ESG dashboard</p>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <label className="text-sm text-gray-600">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4 mt-1"
          required
        />

        <label className="text-sm text-gray-600">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-6 mt-1"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-eco-600 text-white rounded py-2 font-medium hover:bg-eco-800 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Seeded logins: admin@ecosphere.com / manager@ecosphere.com / priya@ecosphere.com — password123
        </p>
      </form>
    </div>
  );
}
