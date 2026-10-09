import React from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import useReceipts from "../../hooks/useReceipts";
import { color, space, type, formatAmount } from "../../theme/qvitto";

const fmtDateTime = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return d.toLocaleString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Days remaining, not a date — the countdown is the point.
const daysLeft = (iso) => {
  const d = new Date(iso);
  if (isNaN(d)) return null;
  const diff = Math.ceil((d - new Date()) / 86400000);
  return diff;
};

export default function ReceiptDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // No single-receipt endpoint on the backend yet — reuse the shared list so
  // this screen never disagrees with the feed about a receipt's shape.
  const { receipts, loading, error } = useReceipts();
  const receipt = receipts.find((r) => String(r.id) === String(id));

  const Back = (
    <Pressable
      onPress={() => router.back()}
      style={({ pressed }) => ({
        paddingHorizontal: space.screen,
        paddingTop: insets.top + 14,
        paddingBottom: 14,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={type.sectionLabel}>← TILLBAKA</Text>
    </Pressable>
  );

  if (loading || error || !receipt) {
    return (
      <View style={{ flex: 1, backgroundColor: color.bone }}>
        {Back}
        {loading ? (
          <ActivityIndicator color={color.void} style={{ marginTop: 40 }} />
        ) : (
          <Text
            style={{
              fontFamily: type.amountRow.fontFamily,
              fontSize: 13,
              color: color.stamp,
              paddingHorizontal: space.screen,
            }}
          >
            {error || "Kvittot kunde inte hämtas."}
          </Text>
        )}
      </View>
    );
  }

  const when = fmtDateTime(receipt.purchasedAt || receipt.createdAt || receipt.date);
  const items = receipt.lineItems || [];
  const left = receipt.returnDeadline ? daysLeft(receipt.returnDeadline) : null;

  return (
    <View style={{ flex: 1, backgroundColor: color.bone }}>
      {Back}
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.screen, paddingBottom: 40 }}>
        <Text
          style={{
            fontFamily: type.merchant.fontFamily,
            fontSize: 34,
            lineHeight: 35,
            letterSpacing: -0.68,
            textTransform: "uppercase",
            color: color.void,
          }}
        >
          {receipt.merchant}
        </Text>

        <View
          style={{
            backgroundColor: color.void,
            paddingHorizontal: 20,
            paddingVertical: 18,
            marginTop: 18,
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <Text style={[type.amountBig, { fontSize: 40, lineHeight: 40, color: color.bone }]}>
            {formatAmount(receipt.amount)}
          </Text>
          <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 12, color: color.concrete }}>
            {receipt.currency || "SEK"}
          </Text>
        </View>

        {items.length > 0 && (
          <>
            <Text style={[type.sectionLabel, { paddingTop: 24 }]}>RADER</Text>
            {items.map((it, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  gap: 14,
                  paddingVertical: 11,
                  borderBottomWidth: 1,
                  borderBottomColor: color.hairline,
                }}
              >
                <Text style={{ fontFamily: type.amountRow.fontFamily, fontSize: 13, color: color.void }}>
                  {it.name}
                </Text>
                <Text style={{ fontFamily: type.amountRow.fontFamily, fontSize: 13, color: color.concrete }}>
                  {formatAmount(it.price)}
                </Text>
              </View>
            ))}
          </>
        )}

        {(receipt.vatAmount != null || receipt.amountExVat != null) && (
          <View style={{ borderBottomWidth: 1, borderBottomColor: color.void, paddingBottom: 20 }}>
            {receipt.vatAmount != null && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 16 }}>
                <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 12, color: color.concrete }}>
                  MOMS
                </Text>
                <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 12, color: color.concrete }}>
                  {formatAmount(receipt.vatAmount)}
                </Text>
              </View>
            )}
            {receipt.amountExVat != null && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", paddingTop: 8 }}>
                <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 12, color: color.concrete }}>
                  BELOPP EXKL. MOMS
                </Text>
                <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 12, color: color.concrete }}>
                  {formatAmount(receipt.amountExVat)}
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ paddingTop: 20, gap: 4 }}>
          {receipt.storeAddress ? (
            <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 11, color: color.concrete }}>
              {receipt.storeAddress}
            </Text>
          ) : null}
          {when ? (
            <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 11, color: color.concrete }}>
              {when}
            </Text>
          ) : null}
          {receipt.paymentMethodLast4 ? (
            <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 11, color: color.concrete }}>
              Betalt med kort ••{receipt.paymentMethodLast4}
            </Text>
          ) : null}
        </View>

        {left != null && left >= 0 && (
          <View
            style={{
              marginTop: 24,
              backgroundColor: color.stamp,
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View>
              <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 10, letterSpacing: 1.8, color: color.bone }}>
                ÖPPET KÖP
              </Text>
              <Text style={[type.merchant, { fontSize: 22, marginTop: 6, color: color.bone }]}>
                {left} {left === 1 ? "DAG KVAR" : "DAGAR KVAR"}
              </Text>
            </View>
            <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 10, color: color.bone, textAlign: "right" }}>
              {new Date(receipt.returnDeadline)
                .toLocaleDateString("sv-SE", { day: "numeric", month: "short" })
                .toUpperCase()}
            </Text>
          </View>
        )}

        <View style={{ flexDirection: "row", gap: space.gap, marginTop: 12 }}>
          <Pressable
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 16,
              alignItems: "center",
              backgroundColor: pressed ? color.lime : color.void,
            })}
          >
            {({ pressed }) => (
              <Text
                style={[
                  type.merchant,
                  { fontSize: 12, letterSpacing: 0.96, color: pressed ? color.void : color.bone },
                ]}
              >
                DELA PDF
              </Text>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 15,
              alignItems: "center",
              borderWidth: 1,
              borderColor: color.void,
              backgroundColor: pressed ? color.hairline : "transparent",
            })}
          >
            <Text style={[type.merchant, { fontSize: 12, letterSpacing: 0.96 }]}>BOKFÖR</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}
