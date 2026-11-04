import React, { createContext, useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import api, { setOnUnauthorized } from "../api/api";
import usePushToken from "../app/hooks/usePushToken";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const tokenPush = usePushToken();
  // Several requests can fail with 401 at once (feed poll, cards, push token);
  // only the first one logs out and navigates.
  const loggingOut = useRef(false);

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
    loggingOut.current = false;
    setUser(res.data.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setUser(null);
  };

  useEffect(() => {
    setOnUnauthorized(async () => {
      if (loggingOut.current) return;
      loggingOut.current = true;
      await AsyncStorage.removeItem("token");
      setUser(null);
      router.replace("/login?reason=expired");
    });
    return () => setOnUnauthorized(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
