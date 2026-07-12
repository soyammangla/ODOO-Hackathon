import React, { useEffect, useState } from "react";
import client from "../api/client";
import MetricCard from "../components/MetricCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get("/dashboard")
      .then((res) => setData(res.data.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading dashboard...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const chartData = (data.departmentScores || []).map((s) => ({
    name: s.department?.name || "Unknown",
    Environmental: s.environmentalScore,
    Social: s.socialScore,
    Governance: s.governanceScore,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Organization dashboard</h1>
        <p className="text-sm text-gray-500">Period: {data.period}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Overall ESG score" value={data.overallESGScore} />
        <MetricCard label="Open compliance issues" value={data.openComplianceIssues} />
        <MetricCard label="Total carbon emission" value={`${Math.round(data.totalCarbonEmission)} kg`} />
        <MetricCard label="Active challenges" value={data.activeChallenges} />
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">Department ESG scores</p>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="Environmental" fill="#639922" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Social" fill="#378ADD" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Governance" fill="#7F77DD" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">Top performers</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Employee</th>
              <th className="py-2">XP</th>
              <th className="py-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {(data.topPerformers || []).map((u) => (
              <tr key={u._id} className="border-b last:border-0">
                <td className="py-2">{u.name}</td>
                <td className="py-2">{u.xp}</td>
                <td className="py-2">{u.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
