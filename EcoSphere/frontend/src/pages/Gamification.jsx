import React, { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Gamification() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [message, setMessage] = useState("");

  function loadAll() {
    client.get("/challenges").then((r) => setChallenges(r.data.data));
    client.get("/challenges/leaderboard/top").then((r) => setLeaderboard(r.data.data));
    client.get("/master-data/rewards").then((r) => setRewards(r.data.data));
  }

  useEffect(loadAll, []);

  async function join(challengeId) {
    await client.post(`/challenges/${challengeId}/join`);
    setMessage("Joined challenge!");
    loadAll();
  }

  async function redeem(rewardId) {
    try {
      const res = await client.post(`/rewards/${rewardId}/redeem`);
      setMessage(`Redeemed! Remaining points: ${res.data.remainingPoints}`);
      loadAll();
    } catch (err) {
      setMessage(err.response?.data?.message || "Redemption failed");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Gamification</h1>
      {message && <p className="text-sm text-eco-800 bg-eco-50 border border-eco-200 rounded px-3 py-2">{message}</p>}

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">Active challenges</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {challenges.map((c) => (
            <div key={c._id} className="border rounded-lg p-3">
              <p className="font-medium text-sm">{c.title}</p>
              <p className="text-xs text-gray-500 mb-2">{c.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span>{c.xp} XP · {c.difficulty}</span>
                <span className="text-gray-400">{c.status}</span>
              </div>
              {c.status === "Active" && (
                <button onClick={() => join(c._id)} className="mt-2 text-eco-600 text-xs border rounded px-2 py-1">
                  Join challenge
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">Leaderboard</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Rank</th>
              <th className="py-2">Employee</th>
              <th className="py-2">XP</th>
              <th className="py-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((u, idx) => (
              <tr key={u._id} className="border-b last:border-0">
                <td className="py-2">{idx + 1}</td>
                <td className="py-2">{u.name}</td>
                <td className="py-2">{u.xp}</td>
                <td className="py-2">{u.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">Rewards catalog (your balance: {user?.points ?? 0} pts)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rewards.map((r) => (
            <div key={r._id} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-xs text-gray-500">{r.pointsRequired} pts · {r.stock} in stock</p>
              </div>
              <button onClick={() => redeem(r._id)} className="text-eco-600 text-xs border rounded px-2 py-1">
                Redeem
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
