import React, { useEffect, useState } from "react";
import client from "../api/client";

export default function Governance() {
  const [policies, setPolicies] = useState([]);
  const [audits, setAudits] = useState([]);
  const [issues, setIssues] = useState([]);

  function loadAll() {
    client.get("/governance/policies/acknowledgements/mine").then((r) => setPolicies(r.data.data));
    client.get("/governance/audits").then((r) => setAudits(r.data.data));
    client.get("/governance/compliance-issues").then((r) => setIssues(r.data.data));
  }

  useEffect(loadAll, []);

  async function acknowledge(policyId) {
    await client.put(`/governance/policies/${policyId}/acknowledge`);
    loadAll();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Governance</h1>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">My policy acknowledgements</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Policy</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p._id} className="border-b last:border-0">
                <td className="py-2">{p.policy?.title}</td>
                <td className="py-2">{p.status}</td>
                <td className="py-2">
                  {p.status !== "Acknowledged" && (
                    <button onClick={() => acknowledge(p.policy._id)} className="text-eco-600 text-xs border rounded px-2 py-1">
                      Acknowledge
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">Audits</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Title</th>
              <th className="py-2">Department</th>
              <th className="py-2">Scheduled</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {audits.map((a) => (
              <tr key={a._id} className="border-b last:border-0">
                <td className="py-2">{a.title}</td>
                <td className="py-2">{a.department?.name}</td>
                <td className="py-2">{new Date(a.scheduledDate).toLocaleDateString()}</td>
                <td className="py-2">{a.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border p-4">
        <p className="text-sm font-medium mb-3">Compliance issues</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Description</th>
              <th className="py-2">Severity</th>
              <th className="py-2">Owner</th>
              <th className="py-2">Due date</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((i) => (
              <tr key={i._id} className="border-b last:border-0">
                <td className="py-2">{i.description}</td>
                <td className="py-2">{i.severity}</td>
                <td className="py-2">{i.owner?.name}</td>
                <td className="py-2">{new Date(i.dueDate).toLocaleDateString()}</td>
                <td className="py-2">{i.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
