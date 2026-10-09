import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { color, space, type } from "../theme/qvitto";

export default function ScreenHeader({ title, right }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "baseline",
        justifyContent: "space-between",
        paddingHorizontal: space.screen,
        paddingTop: insets.top + 14,
        backgroundColor: color.bone,
      }}
    >
      <Text style={type.screenTitle}>{title}</Text>
      {right ? <Text style={type.sectionLabel}>{right}</Text> : null}
    </View>
  );
}
