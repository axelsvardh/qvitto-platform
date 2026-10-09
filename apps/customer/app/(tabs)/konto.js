import React, { useContext, useMemo } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import useReceipts from "../../hooks/useReceipts";
import useCards from "../../hooks/useCards";
import ScreenHeader from "../../components/ScreenHeader";
import { color, space, type } from "../../theme/qvitto";

export default function KontoScreen() {
  const { user, logout } = useContext(AuthContext);
  const { receipts } = useReceipts();
  const { cards } = useCards();
  const router = useRouter();

  const name = user?.name || "Mitt konto";
  const email = user?.email || "—";

  const SettingRow = ({ label, value, danger, last, onPress }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: color.hairline,
        borderBottomWidth: last ? 1 : 0,
        borderBottomColor: color.hairline,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text
        style={{
          fontFamily: type.amountRow.fontFamily,
          fontSize: 13,
          color: danger ? color.stamp : color.void,
        }}
      >
        {label}
      </Text>
      <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 12, color: color.concrete }}>
        {value}
      </Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: color.bone }}>
      <ScreenHeader title="KONTO" />
      <ScrollView contentContainerStyle={{ padding: space.screen, paddingBottom: 30 }}>
        <View style={{ backgroundColor: color.void, padding: 20 }}>
          <Text style={[type.merchant, { fontSize: 24, color: color.bone, letterSpacing: -0.48 }]}>
            {name}
          </Text>
          <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 11, color: color.concrete, marginTop: 8 }}>
            {email}
          </Text>
          <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 11, color: color.concrete, marginTop: 4 }}>
            {receipts.length} KVITTON SPARADE
          </Text>
        </View>

        <Text style={[type.sectionLabel, { marginTop: 26 }]}>KOPPLADE KORT</Text>
        <View style={{ marginTop: 12 }}>
          {cards.map((c) => (
            <View
              key={c.id}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 15,
                borderTopWidth: 1,
                borderTopColor: color.hairline,
              }}
            >
              <Text style={{ fontFamily: type.amountRow.fontFamily, fontSize: 13, color: color.void }}>
                {c.label}
              </Text>
              <Text
                style={{
                  fontFamily: type.meta.fontFamily,
                  fontSize: 10,
                  backgroundColor: color.lime,
                  color: color.void,
                  paddingHorizontal: 7,
                  paddingVertical: 3,
                  overflow: "hidden",
                }}
              >
                AKTIVT
              </Text>
            </View>
          ))}
          <Pressable
            onPress={() => router.push("/koppla-kort")}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingVertical: 15,
              borderTopWidth: 1,
              borderTopColor: color.hairline,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text style={[type.merchant, { fontSize: 13 }]}>+ KOPPLA NYTT KORT</Text>
          </Pressable>
        </View>

        <Text style={[type.sectionLabel, { marginTop: 26 }]}>INSTÄLLNINGAR</Text>
        <View style={{ marginTop: 12 }}>
          <SettingRow label="Notiser" value="PÅ →" />
          <SettingRow label="Export till bokföring" value="→" />
          <SettingRow label="Datalagring" value="7 ÅR →" />
          <SettingRow
            label="Logga ut"
            value="→"
            danger
            last
            onPress={async () => {
              await logout();
              router.replace("/login");
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}
