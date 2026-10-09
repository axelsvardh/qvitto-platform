import React from "react";
import { View } from "react-native";
import { color } from "../theme/qvitto";

// The mark: a square outline with a bar crossing the lower-right corner.
// Built from Views so the app does not need react-native-svg.
export default function QvittoLogo({ size = 19, tint = color.void }) {
  const stroke = Math.max(1.5, size * 0.087);
  const box = size * 0.5;
  return (
    <View style={{ width: size, height: size }}>
      <View
        style={{
          position: "absolute",
          left: size * 0.167,
          top: size * 0.167,
          width: box,
          height: box,
          borderWidth: stroke,
          borderColor: tint,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: size * 0.47,
          top: size * 0.6,
          width: size * 0.53,
          height: stroke,
          backgroundColor: tint,
          transform: [{ rotate: "45deg" }],
        }}
      />
    </View>
  );
}
