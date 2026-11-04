import React, { useContext } from "react";
import { View } from "react-native";
import { Redirect } from "expo-router";
import { AuthContext } from "../context/AuthContext";
import { color } from "../theme/qvitto";

export default function Index() {
  const { user, loading } = useContext(AuthContext);

  // Plain bone while the saved token is read, so neither Login nor Kvitton
  // flashes before we know which one to show.
  if (loading) {
    return <View testID="startup-placeholder" style={{ flex: 1, backgroundColor: color.bone }} />;
  }

  return <Redirect href={user ? "/receipts" : "/login"} />;
}
