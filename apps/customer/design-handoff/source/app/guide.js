import React, { useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import Svg, { Path } from "react-native-svg";
import { color, type } from "../theme/qvitto";

const PAD = 26;

// Three steps that explain, three that ask for something.
const STEPS = [
  {
    n: "01",
    kind: "tell",
    h: "BETALA SOM VANLIGT",
    b: "Kvittot ligger i appen innan du har lämnat kassan. Ingen app att öppna, ingen kod att visa, ingen fråga i kassan.",
    note: "I SNITT 4 SEKUNDER FRÅN BETALNING TILL KVITTO",
  },
  {
    n: "02",
    kind: "tell",
    h: "HITTA DET NÄR DU BEHÖVER DET",
    b: "Sök på butik, belopp eller en enskild vara. Öppet köp räknas ner åt dig, så du vet exakt hur många dagar du har kvar.",
    note: "ALLA KVITTON SPARAS I 7 ÅR",
  },
  {
    n: "03",
    kind: "tell",
    h: "PAPPER SOM ALDRIG TRYCKS",
    b: "Varje kvitto du inte får på papper är 3,2 gram koldioxid som aldrig blir av. Vi räknar dem åt dig.",
    note: "1 000 KVITTON ≈ 3,2 KG CO₂",
  },
  {
    n: "04",
    kind: "do",
    key: "bankid",
    h: "VERIFIERA MED BANKID",
    b: "Vi behöver veta att det är du. En signering, sen är kontot ditt.",
    cta: "ÖPPNA BANKID",
    done: "VERIFIERAD",
    skip: "GÖR DET SENARE",
    note: "PLACEHOLDER — BANKID KOPPLAS IN SENARE",
  },
  {
    n: "05",
    kind: "do",
    key: "card",
    h: "KOPPLA ETT KORT",
    b: "Det här är hela installationen. Välj kortet du handlar med och vi följer det — vi ser aldrig kortnummer eller inloggning.",
    cta: "KOPPLA KORT",
    done: "SWEDBANK ••4471 KOPPLAT",
    skip: "GÖR DET SENARE",
    note: "UTAN KORT KOMMER INGA KVITTON IN",
  },
  {
    n: "06",
    kind: "do",
    key: "push",
    h: "SLÅ PÅ NOTISER",
    b: "Du får en notis i sekunden köpet går igenom. Det är enda gången vi hör av oss.",
    cta: "TILLÅT NOTISER",
    done: "NOTISER PÅ",
    skip: "INTE NU",
    note: "INGA ERBJUDANDEN. INGA PÅMINNELSER.",
  },
];

const Check = () => (
  <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
    <Path d="M1 7.5l4 4L13 2" stroke={color.void} strokeWidth={2} />
  </Svg>
);

export default function GuideScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [i, setI] = useState(0);
  const [done, setDone] = useState({});

  const step = STEPS[i];
  const isDone = !!done[step.key];
  const last = i === STEPS.length - 1;

  const finish = async () => {
    await AsyncStorage.setItem("guideSeen", "1");
    router.replace("/receipts");
  };

  const next = () => (last ? finish() : setI(i + 1));
  const prev = () => setI(Math.max(0, i - 1));

  // Each ask step does its real work here. BankID and the card link are
  // placeholders until those integrations exist; notifications is real.
  const act = async () => {
    if (isDone) return next();
    try {
      if (step.key === "push") {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Notiser avstängda",
            "Du kan slå på dem när som helst under Konto → Notiser."
          );
          return next();
        }
      }
      if (step.key === "bankid") {
        // TODO: launch the BankID flow, then await the signing result.
      }
      if (step.key === "card") {
        // TODO: open the card-linking flow (Tink / Enable Banking / your provider).
      }
    } catch (err) {
      // Never block onboarding on an integration failing.
    }
    setDone((d) => ({ ...d, [step.key]: true }));
    setTimeout(() => setI((cur) => Math.min(STEPS.length - 1, cur + 1)), 550);
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.bone, paddingTop: insets.top }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: PAD,
          paddingTop: 14,
        }}
      >
        <Text style={{ fontFamily: type.merchant.fontFamily, fontSize: 15, letterSpacing: 2.4, color: color.void }}>
          QVITTO
        </Text>
        <Pressable onPress={finish} hitSlop={12}>
          <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 10, letterSpacing: 1.6, color: color.concrete }}>
            HOPPA ÖVER
          </Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: 5, paddingHorizontal: PAD, paddingTop: 22 }}>
        {STEPS.map((s, idx) => (
          <Pressable
            key={s.n}
            onPress={() => setI(idx)}
            style={{ flex: 1, height: 4, backgroundColor: idx <= i ? color.void : color.hairline }}
          />
        ))}
      </View>

      <View style={{ flex: 1, paddingHorizontal: PAD, minHeight: 0 }}>
        <Text
          style={{
            fontFamily: type.merchant.fontFamily,
            fontSize: 104,
            lineHeight: 85,
            letterSpacing: -6.24,
            color: color.hairline,
            marginTop: 30,
          }}
        >
          {step.n}
        </Text>
        <Text
          style={{
            fontFamily: type.merchant.fontFamily,
            fontSize: 32,
            lineHeight: 33,
            letterSpacing: -0.96,
            color: color.void,
            marginTop: -6,
          }}
        >
          {step.h}
        </Text>
        <Text
          style={{
            fontFamily: type.body ? "IBMPlexSans_400Regular" : undefined,
            fontSize: 15,
            lineHeight: 24,
            color: "#57564f",
            marginTop: 18,
            maxWidth: 300,
          }}
        >
          {step.b}
        </Text>

        <View style={{ flex: 1, minHeight: 16 }} />

        <View style={{ backgroundColor: color.void, paddingHorizontal: 18, paddingVertical: 15, marginBottom: 14 }}>
          <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 10, letterSpacing: 1.6, lineHeight: 17, color: color.bone }}>
            {step.note}
          </Text>
        </View>
      </View>

      {step.kind === "do" ? (
        <View style={{ paddingHorizontal: PAD, paddingBottom: Math.max(insets.bottom, 34) }}>
          <Pressable
            onPress={act}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 9,
              paddingVertical: 19,
              backgroundColor: isDone ? color.lime : color.void,
            }}
          >
            {isDone && <Check />}
            <Text
              style={{
                fontFamily: type.merchant.fontFamily,
                fontSize: 13,
                letterSpacing: 1.3,
                color: isDone ? color.void : color.bone,
              }}
            >
              {isDone ? step.done : step.cta}
            </Text>
          </Pressable>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
            <Pressable onPress={prev} hitSlop={10}>
              <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 11, letterSpacing: 1.32, color: color.concrete }}>
                ← TILLBAKA
              </Text>
            </Pressable>
            <Pressable onPress={next} hitSlop={10}>
              <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 11, letterSpacing: 1.32, color: color.concrete }}>
                {step.skip}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: PAD, paddingBottom: Math.max(insets.bottom, 34) }}>
          <Pressable
            onPress={prev}
            style={({ pressed }) => ({
              width: 56,
              borderWidth: 1,
              borderColor: color.void,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: pressed ? color.hairline : "transparent",
            })}
          >
            <Text style={{ fontFamily: type.amountRow.fontFamily, fontSize: 14, color: color.void }}>←</Text>
          </Pressable>
          <Pressable
            onPress={next}
            style={({ pressed }) => ({
              flex: 1,
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
                NÄSTA
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  );
}
