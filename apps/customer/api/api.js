import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { Platform } from "react-native";

const BACKEND_PORT = 4000;

// On a physical device "localhost" means the device itself, not the machine
// running the backend. Metro already knows the dev machine's LAN address (it
// used it to serve this very JS bundle to the device) — reuse that instead of
// a hardcoded IP that breaks on every network change. Only present in dev.
function resolveBaseURL() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.hostUri;
  const lanHost = hostUri?.split(":")?.[0];
  if (lanHost && Platform.OS !== "web") return `http://${lanHost}:${BACKEND_PORT}`;
  return `http://localhost:${BACKEND_PORT}`;
}

const api = axios.create({
  baseURL: resolveBaseURL(),
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
