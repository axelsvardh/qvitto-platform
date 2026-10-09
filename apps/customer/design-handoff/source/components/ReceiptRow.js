import React from "react";
import { View, Text, Pressable } from "react-native";
import { color, space, type, categoryColor, formatAmount } from "../theme/qvitto";

const time = (iso) => {
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
};

// 62px tall, whole row is the target — clears the 44px minimum.
export default function ReceiptRow({ receipt, onPress }) {
  const category = (receipt.category || "Övrigt").toUpperCase();
  const stamp = receipt.purchasedAt || receipt.createdAt || receipt.date;
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: color.hairline }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        paddingVertical: space.row,
        paddingHorizontal: space.screen,
        borderTopWidth: 1,
        borderTopColor: color.hairline,
        backgroundColor: pressed ? color.pressed : "transparent",
      })}
    >
      <View style={{ width: 4, height: 34, backgroundColor: categoryColor(category) }} />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text numberOfLines={1} style={type.merchant}>
          {receipt.merchant}
        </Text>
        <Text style={[type.meta, { marginTop: 5 }]}>
          {category}{stamp ? ` · ${time(stamp)}` : ""}
        </Text>
      </View>
      <Text style={type.amountRow}>{formatAmount(receipt.amount)}</Text>
    </Pressable>
  );
}
