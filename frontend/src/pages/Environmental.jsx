import React, { useEffect, useState } from "react";
import client from "../api/client";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const initialForm = { emissionFactor: "", activity: "", quantity: "", transactionDate: new Date().toISOString().slice(0, 10) };

export default function Environmental() {
  const [factors, setFactors] = useState([]);
  const [goals, setGoals] = useState([]);
  const [trend, setTrend] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [factorRes, goalRes, trendRes] = await Promise.all([
        client.get("/carbon-transactions/emission-factors"),
        client.get("/carbon-transactions/goals"),
        client.get("/carbon-transactions/trend"),
      ]);
      setFactors(factorRes.data.data);
      setGoals(goalRes.data.data);
      setTrend(trendRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load environmental data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const selectedFactor = factors.find((factor) => factor._id === form.emissionFactor);

  async function submitTransaction(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setResult(null);
    try {
      const response = await client.post("/carbon-transactions/transactions", {
        ...form,
        quantity: Number(form.quantity),
        unit: selectedFactor?.unit,
      });
      setResult(response.data.data);
      setForm({ ...initialForm, transactionDate: new Date().toISOString().slice(0, 10) });
      const trendResponse = await client.get("/carbon-transactions/trend");
      setTrend(trendResponse.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save carbon transaction");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-gray-500">Loading environmental data...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Environmental</h1>
        <p className="text-sm text-gray-500">Track carbon-producing activities and sustainability goals.</p>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={submitTransaction} className="bg-white rounded-xl border p-4 space-y-4">
          <div>
            <h2 className="text-sm font-medium">Record carbon transaction</h2>
            <p className="text-xs text-gray-500 mt-1">Emission is calculated automatically from the selected factor.</p>
          </div>
          <div>
            <label className="text-xs text-gray-600">Emission factor</label>
            <select required value={form.emissionFactor} onChange={(e) => setForm({ ...form, emissionFactor: e.target.value })} className="mt-1 w-full border rounded px-3 py-2 text-sm">
              <option value="">Select an emission factor</option>
              {factors.map((factor) => <option key={factor._id} value={factor._id}>{factor.name} ({factor.emissionFactor} kgCO2e/{factor.unit})</option>)}
            </select>
            {!factors.length && <p className="mt-1 text-xs text-amber-700">No active emission factors are available.</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Activity</label>
              <input required value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} className="mt-1 w-full border rounded px-3 py-2 text-sm" placeholder="e.g. Delivery fleet" />
            </div>
            <div>
              <label className="text-xs text-gray-600">Quantity {selectedFactor ? `(${selectedFactor.unit})` : ""}</label>
              <input required min="0" step="any" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-600">Transaction date</label>
            <input required type="date" value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} className="mt-1 w-full border rounded px-3 py-2 text-sm" />
          </div>
          <button disabled={submitting || !factors.length} className="bg-eco-600 text-white rounded px-4 py-2 text-sm disabled:opacity-60">
            {submitting ? "Saving..." : "Calculate and save"}
          </button>
          {result && <p className="text-sm text-eco-800 bg-eco-50 border border-eco-200 rounded px-3 py-2">Saved: {result.carbonEmission} kgCO2e.</p>}
        </form>

        <section className="bg-white rounded-xl border p-4">
          <h2 className="text-sm font-medium mb-3">Carbon emission trend</h2>
          {trend.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="period" fontSize={12} /><YAxis fontSize={12} /><Tooltip /><Line type="monotone" dataKey="carbonEmission" name="kgCO2e" stroke="#639922" strokeWidth={2} /></LineChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-sm text-gray-500">No carbon transactions yet. Add one to see the trend.</p>}
        </section>
      </div>

      <section className="bg-white rounded-xl border p-4">
        <h2 className="text-sm font-medium mb-3">Environmental goals</h2>
        {goals.length ? (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-gray-500 border-b"><th className="py-2">Title</th><th className="py-2">Target</th><th className="py-2">Current</th><th className="py-2">Deadline</th><th className="py-2">Status</th></tr></thead><tbody>
            {goals.map((goal) => <tr key={goal._id} className="border-b last:border-0"><td className="py-2">{goal.title}</td><td className="py-2">{goal.targetValue ?? goal.targetEmissionReduction ?? "—"} {goal.unit}</td><td className="py-2">{goal.currentValue ?? 0} {goal.unit}</td><td className="py-2">{goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "—"}</td><td className="py-2">{goal.status}</td></tr>)}
          </tbody></table></div>
        ) : <p className="text-sm text-gray-500">No environmental goals have been created.</p>}
      </section>
    </div>
  );
}
