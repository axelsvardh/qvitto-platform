import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import useReceipts, { stampOf, categoryOf } from "../../hooks/useReceipts";
import ScreenHeader from "../../components/ScreenHeader";
import { color, space, type, categoryColor, formatAmount, co2Saved } from "../../theme/qvitto";
import LeafMark from "../../components/LeafMark";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAJ", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEC"];

const inMonth = (r, ref) => {
  const d = new Date(stampOf(r));
  return !isNaN(d) && d.getMonth() === ref.getMonth() && d.getFullYear() === ref.getFullYear();
};

export default function OversiktScreen() {
  const { receipts } = useReceipts();
  const now = new Date();

  const { total, delta, categories, merchants } = useMemo(() => {
    const thisMonth = receipts.filter((r) => inMonth(r, now));
    const prevRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = receipts.filter((r) => inMonth(r, prevRef));
    const sum = (l) => l.reduce((s, r) => s + Number(r.amount || 0), 0);
    const total = sum(thisMonth);
    const prev = sum(prevMonth);

    const byCat = {};
    thisMonth.forEach((r) => {
      const c = categoryOf(r);
      byCat[c] = (byCat[c] || 0) + Number(r.amount || 0);
    });
    const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
    const max = cats.length ? cats[0][1] : 1;

    const byMerchant = {};
    thisMonth.forEach((r) => {
      const m = r.merchant || "—";
      byMerchant[m] = (byMerchant[m] || 0) + 1;
    });

    return {
      total,
      // Share-of-max, so the biggest category always fills the track.
      delta: prev > 0 ? ((total - prev) / prev) * 100 : null,
      categories: cats.map(([name, amount]) => ({ name, amount, pct: (amount / max) * 100 })),
      merchants: Object.entries(byMerchant)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3),
    };
  }, [receipts]);

  return (
    <View style={{ flex: 1, backgroundColor: color.bone }}>
      <ScreenHeader title="ÖVERSIKT" right={`${MONTHS[now.getMonth()]} ${now.getFullYear()}`} />
      <ScrollView contentContainerStyle={{ padding: space.screen, paddingBottom: 30 }}>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
          <Text style={[type.amountBig, { color: color.void }]}>{formatAmount(total)}</Text>
          <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 13, color: color.concrete }}>
            SEK
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
          {delta != null && (
            <Text
              style={{
                fontFamily: type.meta.fontFamily,
                fontSize: 11,
                letterSpacing: 1.1,
                color: color.bone,
                backgroundColor: color.void,
                paddingHorizontal: 8,
                paddingVertical: 4,
                overflow: "hidden",
              }}
            >
              {delta > 0 ? "+" : "−"}
              {Math.abs(delta).toFixed(1).replace(".", ",")} % MOT FÖREGÅENDE MÅNAD
            </Text>
          )}
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
            <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 11, letterSpacing: 1, color: color.void }}>
              {co2Saved(receipts.length)} TOTALT
            </Text>
          </View>
        </View>

        <Text style={[type.sectionLabel, { marginTop: 30 }]}>PER KATEGORI</Text>
        <View style={{ marginTop: 16, gap: 16 }}>
          {categories.map((c) => (
            <View key={c.name}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 7,
                }}
              >
                <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 11, color: color.void }}>
                  {c.name}
                </Text>
                <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 11, color: color.void }}>
                  {formatAmount(c.amount)}
                </Text>
              </View>
              <View style={{ height: 10, backgroundColor: color.hairline }}>
                <View
                  style={{
                    width: `${c.pct}%`,
                    height: 10,
                    backgroundColor: categoryColor(c.name),
                  }}
                />
              </View>
            </View>
          ))}
          {!categories.length && (
            <Text style={[type.meta, { letterSpacing: 0.6 }]}>INGET UTFALL DEN HÄR MÅNADEN</Text>
          )}
        </View>

        <Text style={[type.sectionLabel, { marginTop: 34 }]}>MEST BESÖKTA</Text>
        <View style={{ marginTop: 12 }}>
          {merchants.map(([name, count]) => (
            <View
              key={name}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 13,
                borderTopWidth: 1,
                borderTopColor: color.hairline,
              }}
            >
              <Text style={[type.merchant, { fontSize: 14 }]}>{name}</Text>
              <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 12, color: color.concrete }}>
                {count} ggr
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
