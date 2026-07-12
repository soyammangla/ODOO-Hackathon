import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: "🏠" },
  { to: "/environmental", label: "Environmental", icon: "🌱" },
  { to: "/social", label: "Social", icon: "🤝" },
  { to: "/governance", label: "Governance", icon: "📋" },
  { to: "/gamification", label: "Gamification", icon: "🏆" },
  { to: "/reports", label: "Reports", icon: "📊" },
  { to: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-eco-900 text-white min-h-screen flex flex-col">
      <div className="px-5 py-5 border-b border-eco-800">
        <p className="text-lg font-semibold">EcoSphere</p>
        <p className="text-xs text-eco-100">ESG Management Platform</p>
      </div>
      <nav className="flex-1 py-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-2.5 text-sm ${
                isActive ? "bg-eco-800 text-white" : "text-eco-100 hover:bg-eco-800/60"
              }`
            }
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
