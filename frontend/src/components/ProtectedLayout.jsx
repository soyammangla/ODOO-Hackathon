import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function ProtectedLayout() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gray-50">
        <Navbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
