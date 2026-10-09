import React from "react";
import { View, Text } from "react-native";
import { color, space, type, formatAmount, co2Saved } from "../theme/qvitto";
import LeafMark from "./LeafMark";

// Full-bleed black slab carrying the month total. The lime chip is the only
// colour on the feed header — it reads as confirmation: every receipt here is
// a paper one that never got printed.
export default function MonthTotal({ total, count }) {
  return (
    <View style={{ marginTop: 18, backgroundColor: color.void, padding: space.slab }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <Text style={[type.sectionLabel, { flexShrink: 1 }]}>
          DENNA MÅNAD · {count} {count === 1 ? "KVITTO" : "KVITTON"}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            backgroundColor: color.lime,
            paddingHorizontal: 8,
            paddingVertical: 4,
          }}
        >
          <LeafMark size={11} tint={color.void} />
          <Text
            style={{
              fontFamily: type.meta.fontFamily,
              fontSize: 10,
              letterSpacing: 1,
              color: color.void,
            }}
          >
            {co2Saved(count)}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8, marginTop: 12 }}>
        <Text style={[type.amountBig, { color: color.bone }]}>{formatAmount(total)}</Text>
        <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 13, color: color.concrete }}>SEK</Text>
      </View>
    </View>
  );
}
