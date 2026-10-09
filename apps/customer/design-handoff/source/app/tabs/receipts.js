import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MonthTotal from "../../components/MonthTotal";
import ReceiptRow from "../../components/ReceiptRow";
import useReceipts, { stampOf } from "../../hooks/useReceipts";
import { color, space, type } from "../../theme/qvitto";

const MONTHS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAJ",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OKT",
  "NOV",
  "DEC",
];
const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// "IDAG" / "IGÅR" for the last two days, then "3 NOV".
function dayLabel(date) {
  const now = new Date();
  const today = dayKey(now);
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  const key = dayKey(date);
  if (key === today) return "IDAG";
  if (key === dayKey(y)) return "IGÅR";
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

function groupByDay(list) {
  const buckets = new Map();
  list.forEach((r) => {
    const raw = r.purchasedAt || r.createdAt || r.date;
    const d = raw ? new Date(raw) : new Date();
    const key = dayKey(isNaN(d) ? new Date() : d);
    if (!buckets.has(key)) buckets.set(key, { date: d, data: [] });
    buckets.get(key).data.push(r);
  });
  return [...buckets.values()]
    .sort((a, b) => b.date - a.date)
    .map((b) => ({
      title: dayLabel(b.date),
      // Newest first within the day too — the API doesn't guarantee order.
      data: [...b.data].sort(
        (x, y) => new Date(stampOf(y)) - new Date(stampOf(x)),
      ),
    }));
}

export default function ReceiptsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { receipts, loading, error, reload } = useReceipts({ poll: true });
  const [refreshing, setRefreshing] = React.useState(false);

  const sections = useMemo(() => groupByDay(receipts), [receipts]);
  const monthTotal = useMemo(() => {
    const now = new Date();
    return receipts
      .filter((r) => {
        const d = new Date(r.purchasedAt || r.createdAt || r.date);
        return (
          !isNaN(d) &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, r) => sum + Number(r.amount || 0), 0);
  }, [receipts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const now = new Date();

  return (
    <View
      style={{ flex: 1, backgroundColor: color.bone, paddingTop: insets.top }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: space.screen,
          paddingTop: 14,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
          {/* <QvittoLogo size={19} /> */}
          <Text style={type.screenTitle}>QVITTO</Text>
        </View>
        <Text style={type.sectionLabel}>
          {MONTHS[now.getMonth()]} {now.getFullYear()}
        </Text>
      </View>

      <MonthTotal total={monthTotal} count={receipts.length} />

      {error && (
        <Text
          style={{
            fontFamily: type.amountRow.fontFamily,
            fontSize: 13,
            color: color.stamp,
            paddingHorizontal: space.screen,
            paddingTop: 16,
          }}
        >
          {error}
        </Text>
      )}

      {loading ? (
        <ActivityIndicator color={color.void} style={{ marginTop: 40 }} />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, i) => String(item.id ?? i)}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={color.void}
            />
          }
          contentContainerStyle={{ paddingBottom: 40 }}
          renderSectionHeader={({ section }) => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: space.screen,
                paddingTop: 24,
                paddingBottom: 6,
              }}
            >
              <Text style={type.dayLabel}>{section.title}</Text>
              <View
                style={{ flex: 1, height: 1, backgroundColor: color.void }}
              />
            </View>
          )}
          renderItem={({ item }) => (
            <ReceiptRow
              receipt={item}
              onPress={() => router.push(`/kvitto/${item.id}`)}
            />
          )}
          ListEmptyComponent={
            <View style={{ paddingHorizontal: space.screen, paddingTop: 40 }}>
              <Text
                style={[type.merchant, { fontSize: 22, letterSpacing: -0.4 }]}
              >
                Ditt nästa köp hamnar här
              </Text>
              <Text style={[type.meta, { marginTop: 10, letterSpacing: 0.6 }]}>
                DU BEHÖVER INTE GÖRA NÅGOT
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
