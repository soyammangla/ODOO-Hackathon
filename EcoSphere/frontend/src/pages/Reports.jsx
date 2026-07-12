import React, { useState } from "react";
import client from "../api/client";

const REPORT_TYPES = [
  { key: "environmental", label: "Environmental report" },
  { key: "social", label: "Social report" },
  { key: "governance", label: "Governance report" },
  { key: "summary", label: "ESG summary report" },
];

export default function Reports() {
  const [module, setModule] = useState("environmental");
  const [format, setFormat] = useState("pdf");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  async function download() {
    const endpointMap = {
      environmental: "/reports/environmental",
      social: "/reports/social",
      governance: "/reports/governance",
      summary: "/reports/esg-summary",
    };
    const params = new URLSearchParams({ format });
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    const res = await client.get(`${endpointMap[module]}?${params.toString()}`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${module}-report.${format === "excel" ? "xlsx" : format}`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Reports</h1>

      <div className="bg-white rounded-xl border p-4 max-w-xl">
        <p className="text-sm font-medium mb-3">Custom report builder</p>

        <label className="text-xs text-gray-500">Report type</label>
        <select className="w-full border rounded px-2 py-1.5 text-sm mb-3" value={module} onChange={(e) => setModule(e.target.value)}>
          {REPORT_TYPES.map((r) => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500">From date</label>
            <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500">To date</label>
            <input type="date" className="w-full border rounded px-2 py-1.5 text-sm" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>

        <label className="text-xs text-gray-500">Export format</label>
        <select className="w-full border rounded px-2 py-1.5 text-sm mb-4" value={format} onChange={(e) => setFormat(e.target.value)}>
          <option value="pdf">PDF</option>
          <option value="excel">Excel</option>
          <option value="csv">CSV</option>
        </select>

        <button onClick={download} className="bg-eco-600 text-white rounded px-4 py-2 text-sm w-full">
          Generate and download
        </button>
      </div>
    </div>
  );
}
