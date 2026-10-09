import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Path } from "react-native-svg";
import useCards from "../hooks/useCards";
import { color, type } from "../theme/qvitto";

const PAD = 26;

const Check = () => (
  <Svg width={16} height={16} viewBox="0 0 14 14" fill="none">
    <Path d="M1 7.5l4 4L13 2" stroke={color.void} strokeWidth={2} />
  </Svg>
);

const digitsOnly = (s) => s.replace(/\D/g, "");

const formatCardNumber = (s) =>
  digitsOnly(s).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (s) => {
  const d = digitsOnly(s).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

// Brand by IIN prefix — cosmetic only (used for the label in Konto).
function brandOf(number) {
  if (/^4/.test(number)) return "VISA";
  if (/^(5[1-5]|2[2-7])/.test(number)) return "MASTERCARD";
  if (/^3[47]/.test(number)) return "AMEX";
  return "KORT";
}

// Standard mod-10 check — catches typos, not fraud.
function luhnValid(number) {
  let sum = 0;
  let alt = false;
  for (let i = number.length - 1; i >= 0; i--) {
    let n = parseInt(number[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return number.length >= 12 && sum % 10 === 0;
}

function expiryValid(mmYY) {
  const m = mmYY.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const expiryEnd = new Date(year, month, 0, 23, 59, 59);
  return expiryEnd >= now;
}

// Hairline field, matching app/login.js.
function Field({ label, value, onChangeText, keyboardType, maxLength, placeholder }) {
  return (
    <View style={{ paddingTop: 22 }}>
      <Text style={type.sectionLabel}>{label}</Text>
      <View style={{ borderBottomWidth: 1, borderBottomColor: color.void, marginTop: 8 }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          maxLength={maxLength}
          placeholder={placeholder}
          placeholderTextColor="#b8b4a8"
          selectionColor={color.void}
          style={{
            fontFamily: type.amountRow.fontFamily,
            fontSize: 15,
            color: color.void,
            paddingBottom: 10,
            paddingTop: 0,
          }}
        />
      </View>
    </View>
  );
}

export default function KopplaKortScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addCard } = useCards();
  const [stage, setStage] = useState("form"); // "form" | "connecting" | "done"
  const [number, setNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState(null);
  const [linked, setLinked] = useState(null); // { brand, last4 } — the only part we keep

  const digits = digitsOnly(number);
  const cvvLen = brandOf(digits) === "AMEX" ? 4 : 3;

  const submit = async () => {
    if (!luhnValid(digits)) return setError("Kortnumret verkar inte stämma.");
    if (!expiryValid(expiry)) return setError("Utgångsdatumet är ogiltigt eller har passerat.");
    if (digitsOnly(cvv).length !== cvvLen) return setError(`CVC ska vara ${cvvLen} siffror.`);
    setError(null);

    const brand = brandOf(digits);
    const last4 = digits.slice(-4);
    setStage("connecting");

    // TODO: this is where the real integration goes. Once there's a backend,
    // the raw card number/expiry/CVC should go straight to a PCI-compliant
    // processor's SDK (e.g. Stripe's card element / SetupIntent) over TLS —
    // never to our own server or storage. We only ever keep brand + last4
    // for display; the rest is discarded below and never persisted.
    await new Promise((resolve) => setTimeout(resolve, 900));
    await addCard({ brand, last4 });
    setNumber("");
    setExpiry("");
    setCvv("");
    setLinked({ brand, last4 });
    setStage("done");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: color.bone }}
    >
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <Pressable
          onPress={() => router.replace("/konto")}
          hitSlop={12}
          style={({ pressed }) => ({ paddingHorizontal: PAD, paddingTop: 14, paddingBottom: 14, opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={type.sectionLabel}>← TILLBAKA</Text>
        </Pressable>

        {stage === "form" && (
          <ScrollView contentContainerStyle={{ paddingHorizontal: PAD, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            <Text
              style={{
                fontFamily: type.merchant.fontFamily,
                fontSize: 28,
                lineHeight: 30,
                letterSpacing: -0.56,
                color: color.void,
                marginTop: 10,
              }}
            >
              Koppla kort
            </Text>
            <Text
              style={{
                fontFamily: "IBMPlexSans_400Regular",
                fontSize: 15,
                lineHeight: 24,
                color: "#57564f",
                marginTop: 14,
                maxWidth: 340,
              }}
            >
              Ange kortuppgifterna nedan. Vi följer kortet för att se vilka köp som görs på det.
            </Text>

            <View style={{ backgroundColor: color.void, paddingHorizontal: 18, paddingVertical: 15, marginTop: 22 }}>
              <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 10, letterSpacing: 1.6, lineHeight: 17, color: color.bone }}>
                PLACEHOLDER — INGEN RIKTIG KORTHANTERING ÄN. KRÄVER EN PCI-CERTIFIERAD LEVERANTÖR SENARE.
              </Text>
            </View>

            <Field
              label="KORTNUMMER"
              value={number}
              onChangeText={(v) => setNumber(formatCardNumber(v))}
              keyboardType="number-pad"
              maxLength={23}
              placeholder="4242 4242 4242 4242"
            />
            <View style={{ flexDirection: "row", gap: 16 }}>
              <View style={{ flex: 1 }}>
                <Field
                  label="GILTIG TILL"
                  value={expiry}
                  onChangeText={(v) => setExpiry(formatExpiry(v))}
                  keyboardType="number-pad"
                  maxLength={5}
                  placeholder="MM/ÅÅ"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Field
                  label="CVC"
                  value={cvv}
                  onChangeText={(v) => setCvv(digitsOnly(v).slice(0, 4))}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="123"
                />
              </View>
            </View>

            {error && (
              <Text style={{ fontFamily: type.amountRow.fontFamily, fontSize: 13, color: color.stamp, marginTop: 20 }}>
                {error}
              </Text>
            )}

            <Pressable
              onPress={submit}
              style={({ pressed }) => ({
                marginTop: 32,
                paddingVertical: 19,
                alignItems: "center",
                backgroundColor: pressed ? color.lime : color.void,
              })}
            >
              {({ pressed }) => (
                <Text
                  style={{
                    fontFamily: type.merchant.fontFamily,
                    fontSize: 13,
                    letterSpacing: 1.3,
                    color: pressed ? color.void : color.bone,
                  }}
                >
                  KOPPLA KORT
                </Text>
              )}
            </Pressable>
          </ScrollView>
        )}

        {stage === "connecting" && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: PAD }}>
            <ActivityIndicator color={color.void} />
            <Text style={[type.sectionLabel, { marginTop: 18, textAlign: "center" }]}>VERIFIERAR KORT</Text>
          </View>
        )}

        {stage === "done" && (
          <View style={{ flex: 1, paddingHorizontal: PAD }}>
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: color.lime,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Check />
              </View>
              <Text style={[type.merchant, { fontSize: 20, marginTop: 18, textAlign: "center" }]}>
                {linked?.brand} ••{linked?.last4} kopplat
              </Text>
              <Text style={[type.meta, { marginTop: 8, textAlign: "center" }]}>
                KVITTON BÖRJAR KOMMA IN AUTOMATISKT
              </Text>
            </View>
            <Pressable
              onPress={() => router.replace("/konto")}
              style={({ pressed }) => ({
                marginBottom: Math.max(insets.bottom, 30),
                paddingVertical: 19,
                alignItems: "center",
                backgroundColor: pressed ? color.lime : color.void,
              })}
            >
              {({ pressed }) => (
                <Text
                  style={{
                    fontFamily: type.merchant.fontFamily,
                    fontSize: 13,
                    letterSpacing: 1.3,
                    color: pressed ? color.void : color.bone,
                  }}
                >
                  KLART
                </Text>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
