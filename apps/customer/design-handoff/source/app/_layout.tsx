import React from "react";
import { Slot } from "expo-router";
import { useFonts } from "expo-font";
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans";
import { IBMPlexSans_400Regular } from "@expo-google-fonts/ibm-plex-sans";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  const [fontsReady] = useFonts({
    PlusJakartaSans_800ExtraBold,
    IBMPlexSans_400Regular,
    JetBrainsMono_400Regular,
  });

  if (!fontsReady) return null;

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
