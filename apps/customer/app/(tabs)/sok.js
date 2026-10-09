import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, FlatList } from "react-native";
import { useRouter } from "expo-router";
import useReceipts, { categoryOf } from "../../hooks/useReceipts";
import ScreenHeader from "../../components/ScreenHeader";
import ReceiptRow from "../../components/ReceiptRow";
import { color, space, type, formatAmount } from "../../theme/qvitto";

const RECENT = ["ica", "över 500 kr", "oktober"];

export default function SokScreen() {
  const router = useRouter();
  const { receipts } = useReceipts();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState(null);

  const counts = useMemo(() => {
    const byCat = {};
    receipts.forEach((r) => {
      const c = categoryOf(r);
      byCat[c] = (byCat[c] || 0) + 1;
    });
    return {
      RETUR: receipts.filter((r) => r.returnDeadline).length,
      MAT: byCat.MAT || 0,
      TRANSPORT: byCat.TRANSPORT || 0,
      STOR: receipts.filter((r) => Number(r.amount) > 500).length,
    };
  }, [receipts]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = receipts;
    if (filter === "RETUR") list = list.filter((r) => r.returnDeadline);
    if (filter === "MAT" || filter === "TRANSPORT") list = list.filter((r) => categoryOf(r) === filter);
    if (filter === "STOR") list = list.filter((r) => Number(r.amount) > 500);
    if (!q) return filter ? list : [];
    return list.filter(
      (r) =>
        String(r.merchant || "").toLowerCase().includes(q) ||
        String(r.amount || "").includes(q) ||
        (r.lineItems || []).some((it) => String(it.name || "").toLowerCase().includes(q))
    );
  }, [receipts, query, filter]);

  const showResults = query.trim().length > 0 || filter;

  const Chip = ({ label, onPress }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        borderWidth: 1,
        borderColor: color.void,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: pressed ? color.void : "transparent",
      })}
    >
      {({ pressed }) => (
        <Text
          style={{
            fontFamily: type.meta.fontFamily,
            fontSize: 11,
            color: pressed ? color.bone : color.void,
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );

  const FilterCard = ({ id, title, count, accent }) => {
    const active = filter === id;
    return (
      <Pressable
        onPress={() => setFilter(active ? null : id)}
        style={({ pressed }) => ({
          flexBasis: "48%",
          flexGrow: 1,
          padding: 16,
          borderWidth: accent ? 0 : 1,
          borderColor: color.void,
          backgroundColor: accent
            ? color.stamp
            : active
            ? color.void
            : pressed
            ? color.hairline
            : "transparent",
        })}
      >
        <Text
          style={[
            type.merchant,
            { fontSize: 14, color: accent || active ? color.bone : color.void },
          ]}
        >
          {title}
        </Text>
        <Text
          style={[
            type.meta,
            { marginTop: 6, color: accent ? color.bone : active ? color.concrete : color.concrete },
          ]}
        >
          {count} {count === 1 ? "kvitto" : "kvitton"}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.bone }}>
      <ScreenHeader title="SÖK" />

      <View
        style={{
          paddingHorizontal: space.screen,
          paddingTop: 18,
          paddingBottom: 22,
          borderBottomWidth: 1,
          borderBottomColor: color.void,
        }}
      >
        <View
          style={{
            borderWidth: 1,
            borderColor: color.void,
            paddingHorizontal: 16,
            paddingVertical: 4,
          }}
        >
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Butik, belopp eller vara"
            placeholderTextColor={color.concrete}
            style={{
              fontFamily: type.amountRow.fontFamily,
              fontSize: 13,
              color: color.void,
              paddingVertical: 10,
            }}
          />
        </View>
      </View>

      {showResults ? (
        <FlatList
          data={results}
          keyExtractor={(item, i) => String(item.id ?? i)}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListHeaderComponent={
            <Text style={[type.sectionLabel, { paddingHorizontal: space.screen, paddingVertical: 18 }]}>
              {results.length} TRÄFFAR
              {results.length
                ? ` · ${formatAmount(results.reduce((s, r) => s + Number(r.amount || 0), 0))} SEK`
                : ""}
            </Text>
          }
          renderItem={({ item }) => (
            <ReceiptRow receipt={item} onPress={() => router.push(`/kvitto/${item.id}`)} />
          )}
          ListEmptyComponent={
            <Text style={[type.meta, { paddingHorizontal: space.screen, letterSpacing: 0.6 }]}>
              INGA KVITTON MATCHAR
            </Text>
          }
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: space.screen }}>
          <Text style={type.sectionLabel}>SENASTE SÖKNINGAR</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {RECENT.map((r) => (
              <Chip key={r} label={r} onPress={() => setQuery(r.replace(/[^a-zåäö0-9 ]/gi, ""))} />
            ))}
          </View>

          <Text style={[type.sectionLabel, { marginTop: 32 }]}>SNABBFILTER</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            <FilterCard id="RETUR" title="Öppet köp" count={counts.RETUR} accent />
            <FilterCard id="MAT" title="Mat" count={counts.MAT} />
            <FilterCard id="TRANSPORT" title="Transport" count={counts.TRANSPORT} />
            <FilterCard id="STOR" title="Över 500" count={counts.STOR} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}
