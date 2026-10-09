import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export default function usePushToken() {
  const [token, setToken] = useState(null);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  async function registerForPushNotifications() {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return;
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    setToken(token);
  }

  console.log("Expo push token:", token);

  return token;
}
