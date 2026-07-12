import React, { createContext, useContext, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("ecosphere_user");
    return stored ? JSON.parse(stored) : null;
  });

  async function login(email, password) {
    const res = await client.post("/auth/login", { email, password });
    const data = res.data.data;
    localStorage.setItem("ecosphere_token", data.token);
    localStorage.setItem("ecosphere_user", JSON.stringify(data));
    setUser(data);
    return data;
  }

  async function register(payload) {
    const res = await client.post("/auth/register", payload);
    const data = res.data.data;
    localStorage.setItem("ecosphere_token", data.token);
    localStorage.setItem("ecosphere_user", JSON.stringify(data));
    setUser(data);
    return data;
  }

  function logout() {
    localStorage.removeItem("ecosphere_token");
    localStorage.removeItem("ecosphere_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
