import { createContext, useContext, useState, useEffect } from 'react';
import { me as fetchMe, login as doLogin, logout as doLogout, register as doRegister } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email, password) {
    const data = await doLogin(email, password);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password, role) {
    const data = await doRegister(name, email, password, role);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await doLogout();
    setUser(null);
  }

  async function refreshUser() {
    const data = await fetchMe();
    if (data.user) setUser(data.user);
    return data.user;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, refreshUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}