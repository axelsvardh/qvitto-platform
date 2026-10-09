import React from "react";
import { Tabs } from "expo-router";
import QvittoTabBar from "../../components/QvittoTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false, animation: "none" }}
      tabBar={(props) => <QvittoTabBar {...props} />}
    >
      <Tabs.Screen name="receipts" />
      <Tabs.Screen name="sok" />
      <Tabs.Screen name="oversikt" />
      <Tabs.Screen name="konto" />
    </Tabs>
  );
}
