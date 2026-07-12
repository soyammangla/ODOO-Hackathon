import React, { useEffect, useState } from "react";
import client from "../api/client";
import MetricCard from "../components/MetricCard";

export default function Environmental() {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [factors, setFactors] = useState([]);
  const [summary, setSummary] = useState([]);
  const [form, setForm] = useState({ department: "", emissionFactorId: "", quantity: "", sourceType: "Manufacturing" });
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");

  function loadAll() {
    client.get("/carbon-transactions").then((r) => setTransactions(r.data.data));
    client.get("/carbon-transactions/summary/by-department").then((r) => setSummary(r.data.data));
    client.get("/master-data/environmental-goals").then((r) => setGoals(r.data.data));
    client.get("/master-data/emission-factors").then((r) => setFactors(r.data.data));
    client.get("/master-data/departments").then((r) => setDepartments(r.data.data));
  }

  useEffect(loadAll, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    try {
      await client.post("/carbon-transactions", { ...form, quantity: Number(form.quantity) });
      setForm({ department: "", emissionFactorId: "", quantity: "", sourceType: "Manufacturing" });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to record transaction");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Environmental</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary.map((s) => (
          <MetricCard key={s.department} label={s.department} value={`${Math.round(s.totalEmission)} kg`} sublabel="Carbon emitted" />
        ))}
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">Record a carbon transaction</p>
        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleCreate} className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500">Department</label>
            <select
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              required
            >
              <option value="">Select</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Source type</label>
            <select
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={form.sourceType}
              onChange={(e) => setForm({ ...form, sourceType: e.target.value })}
            >
              {["Purchase", "Manufacturing", "Expense", "Fleet"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Emission factor</label>
            <select
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={form.emissionFactorId}
              onChange={(e) => setForm({ ...form, emissionFactorId: e.target.value })}
              required
            >
              <option value="">Select</option>
              {factors.map((f) => (
                <option key={f._id} value={f._id}>{f.name} ({f.unit})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Quantity</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </div>
          <button className="bg-eco-600 text-white rounded px-4 py-1.5 text-sm col-span-2 md:col-span-1">
            Calculate + save
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">Sustainability goals</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Goal</th>
              <th className="py-2">Progress</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {goals.map((g) => (
              <tr key={g._id} className="border-b last:border-0">
                <td className="py-2">{g.title}</td>
                <td className="py-2">{g.currentValue} / {g.targetValue} {g.unit}</td>
                <td className="py-2">{g.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">Recent carbon transactions</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Department</th>
              <th className="py-2">Source</th>
              <th className="py-2">Quantity</th>
              <th className="py-2">Emission (kgCO2e)</th>
              <th className="py-2">Mode</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t._id} className="border-b last:border-0">
                <td className="py-2">{t.department?.name}</td>
                <td className="py-2">{t.sourceType}</td>
                <td className="py-2">{t.quantity} {t.unit}</td>
                <td className="py-2">{t.calculatedEmission}</td>
                <td className="py-2">{t.calculationMode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
