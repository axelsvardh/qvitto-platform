// Checks that the test setup itself works: a real component renders.
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";

test("renders a screen header", () => {
  render(
    <SafeAreaProvider
      initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}
    >
      <ScreenHeader title="KONTO" />
    </SafeAreaProvider>
  );
  expect(screen.getByText("KONTO")).toBeTruthy();
});
