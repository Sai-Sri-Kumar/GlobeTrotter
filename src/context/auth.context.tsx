import { createContext, useContext, useEffect, useState } from "react";
import { registerUser, loginUser, getMe } from "../tanstack/auth.api";

const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then((res) => setUser(res?.user ?? null))
      .finally(() => setLoading(false));
  }, []);

  const register = async (data: any) => {
    const res = await registerUser(data);
    setUser(res.user);
  };

  const login = async (data: any) => {
    const res = await loginUser(data);
    setUser(res.user);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
