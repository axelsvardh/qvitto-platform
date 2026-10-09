import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api/api";
import usePushToken from "../app/hooks/usePushToken";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenPush = usePushToken();

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) setUser({ token });
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (user && tokenPush) {
      api.post("/api/push-token", { token: tokenPush }).catch(console.log);
    }
  }, [user, tokenPush]);

  const register = async (name, email, password) =>
    api.post("/api/register", { name, email, password });

  const login = async (email, password) => {
    const res = await api.post("/api/login", { email, password });
    await AsyncStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
