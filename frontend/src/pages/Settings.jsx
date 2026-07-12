import React, { useEffect, useState } from "react";
import client from "../api/client";

export default function Settings() {
  const [config, setConfig] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [message, setMessage] = useState("");

  function loadAll() {
    client.get("/config").then((r) => setConfig(r.data.data));
    client.get("/master-data/departments").then((r) => setDepartments(r.data.data));
    client.get("/master-data/categories").then((r) => setCategories(r.data.data));
  }

  useEffect(loadAll, []);

  async function saveConfig(e) {
    e.preventDefault();
    try {
      const res = await client.put("/config", config);
      setConfig(res.data.data);
      setMessage("Configuration saved");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save");
    }
  }

  if (!config) return <p className="text-gray-500">Loading settings...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Settings and administration</h1>
      {message && <p className="text-sm text-eco-800 bg-eco-50 border border-eco-200 rounded px-3 py-2">{message}</p>}

      <form onSubmit={saveConfig} className="bg-white rounded-xl border p-4 max-w-xl space-y-4">
        <p className="text-sm font-medium">ESG configuration</p>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500">Environmental weight %</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={config.weights.environmental}
              onChange={(e) => setConfig({ ...config, weights: { ...config.weights, environmental: Number(e.target.value) } })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Social weight %</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={config.weights.social}
              onChange={(e) => setConfig({ ...config, weights: { ...config.weights, social: Number(e.target.value) } })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Governance weight %</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1.5 text-sm"
              value={config.weights.governance}
              onChange={(e) => setConfig({ ...config, weights: { ...config.weights, governance: Number(e.target.value) } })}
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.autoEmissionCalculation}
            onChange={(e) => setConfig({ ...config, autoEmissionCalculation: e.target.checked })}
          />
          Auto emission calculation from ERP records
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.evidenceRequirementDefault}
            onChange={(e) => setConfig({ ...config, evidenceRequirementDefault: e.target.checked })}
          />
          Require evidence for CSR approval by default
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.badgeAutoAward}
            onChange={(e) => setConfig({ ...config, badgeAutoAward: e.target.checked })}
          />
          Auto-award badges when unlock rules are met
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.notificationSettings.inApp}
            onChange={(e) => setConfig({ ...config, notificationSettings: { ...config.notificationSettings, inApp: e.target.checked } })}
          />
          In-app notifications enabled
        </label>

        <button className="bg-eco-600 text-white rounded px-4 py-2 text-sm">Save configuration</button>
      </form>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">Departments</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Code</th>
              <th className="py-2">Employees</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d._id} className="border-b last:border-0">
                <td className="py-2">{d.name}</td>
                <td className="py-2">{d.code}</td>
                <td className="py-2">{d.employeeCount}</td>
                <td className="py-2">{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">Categories</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Name</th>
              <th className="py-2">Type</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c._id} className="border-b last:border-0">
                <td className="py-2">{c.name}</td>
                <td className="py-2">{c.type}</td>
                <td className="py-2">{c.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
