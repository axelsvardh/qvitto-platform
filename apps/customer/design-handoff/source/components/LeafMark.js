import React from "react";
import Svg, { Path } from "react-native-svg";

// Two-lobed leaf, drawn with the same 1.2px hairline as the rest of the iconography.
export default function LeafMark({ size = 11, tint = "#0E0E0D" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path
        d="M6 11V5.5M6 5.5C6 3 4 1 1 1c0 3 2 4.5 5 4.5zM6 6.2C6 4 7.8 2.2 10.5 2.2c0 2.7-1.8 4-4.5 4z"
        stroke={tint}
        strokeWidth={1.2}
      />
    </Svg>
  );
}
