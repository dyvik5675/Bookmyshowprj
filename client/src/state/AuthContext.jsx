import { createContext, useContext, useMemo, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("bms_user");
    return saved ? JSON.parse(saved) : null;
  });

  async function login(email, password) {
    const data = await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    sessionStorage.setItem("bms_token", data.token);
    sessionStorage.setItem("bms_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  async function register(name, email, password) {
    const data = await api("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });

    sessionStorage.setItem("bms_token", data.token);
    sessionStorage.setItem("bms_user", JSON.stringify(data.user));
    setUser(data.user);
  }

  function logout() {
    sessionStorage.removeItem("bms_token");
    sessionStorage.removeItem("bms_user");
    setUser(null);
  }

  const value = useMemo(() => ({ user, login, register, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
