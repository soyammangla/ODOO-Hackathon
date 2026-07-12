import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <div className="text-sm text-right">
          <p className="font-medium">{user?.name}</p>
          <p className="text-xs text-gray-500">
            {user?.xp ?? 0} XP · {user?.points ?? 0} pts
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="text-sm border rounded px-3 py-1.5 hover:bg-gray-50"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
