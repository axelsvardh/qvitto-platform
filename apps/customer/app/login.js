import React, { useContext, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Svg, { Rect, Path } from "react-native-svg";
import { AuthContext } from "../context/AuthContext";
import { color, type } from "../theme/qvitto";

const PAD = 26;

// Fields are hairlines, not boxes: a label, the value, a rule underneath.
function Field({ label, value, onChangeText, secure, trailing, ...rest }) {
  return (
    <View style={{ paddingTop: 26 }}>
      <Text style={type.sectionLabel}>{label}</Text>
      <View
        style={{
          borderBottomWidth: 1,
          borderBottomColor: color.void,
          marginTop: 8,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          placeholderTextColor="#b8b4a8"
          selectionColor={color.void}
          style={{
            flex: 1,
            fontFamily: type.amountRow.fontFamily,
            fontSize: 15,
            color: color.void,
            paddingBottom: 10,
            paddingTop: 0,
          }}
          {...rest}
        />
        {trailing}
      </View>
    </View>
  );
}

function LockMark() {
  return (
    <Svg width={11} height={11} viewBox="0 0 12 12" fill="none">
      <Rect x={1.5} y={5} width={9} height={6} stroke={color.concrete} strokeWidth={1.2} />
      <Path d="M3.8 5V3.4a2.2 2.2 0 014.4 0V5" stroke={color.concrete} strokeWidth={1.2} />
    </Svg>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login, register } = useContext(AuthContext);

  const [mode, setMode] = useState("login"); // "login" | "new"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const isNew = mode === "new";

  const submit = async () => {
    if (busy) return;
    if (!email.trim() || !password || (isNew && !name.trim())) {
      setError("Fyll i alla fält.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (isNew) {
        await register(name.trim(), email.trim(), password);
      }
      await login(email.trim(), password);
      router.replace(isNew ? "/guide" : "/receipts");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          (isNew ? "Kontot kunde inte skapas." : "Fel e-post eller lösenord.")
      );
    } finally {
      setBusy(false);
    }
  };

  const Tab = ({ id, label }) => {
    const active = mode === id;
    return (
      <Pressable onPress={() => { setMode(id); setError(null); }} style={{ marginRight: 24 }}>
        <Text
          style={{
            fontFamily: type.meta.fontFamily,
            fontSize: 11,
            letterSpacing: 1.76,
            color: active ? color.void : color.concrete,
            paddingBottom: 11,
            borderBottomWidth: 2,
            borderBottomColor: active ? color.void : "transparent",
            marginBottom: -1,
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: color.bone }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: PAD, paddingTop: insets.top + 30 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontFamily: type.merchant.fontFamily, fontSize: 17, letterSpacing: 2.72, color: color.void }}>
          QVITTO
        </Text>

        <Text
          style={{
            fontFamily: type.merchant.fontFamily,
            fontSize: 56,
            lineHeight: 54,
            letterSpacing: -2.52,
            color: color.void,
            marginTop: 46,
          }}
        >
          {"Inga fler\npapper"}
        </Text>

        <View style={{ flexDirection: "row", marginTop: 38, borderBottomWidth: 1, borderBottomColor: color.hairline }}>
          <Tab id="login" label="LOGGA IN" />
          <Tab id="new" label="NYTT KONTO" />
        </View>

        {isNew && (
          <Field
            label="NAMN"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            placeholder="Elin Sandberg"
          />
        )}

        <Field
          label="E-POST"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          placeholder="elin.sandberg@mail.se"
        />

        <Field
          label="LÖSENORD"
          value={password}
          onChangeText={setPassword}
          secure={!showPassword}
          autoCapitalize="none"
          placeholder="••••••••••"
          trailing={
            <Pressable onPress={() => setShowPassword((s) => !s)} hitSlop={12} style={{ paddingBottom: 10 }}>
              <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 10, letterSpacing: 1.4, color: color.concrete }}>
                {showPassword ? "DÖLJ" : "VISA"}
              </Text>
            </Pressable>
          }
        />

        {error && (
          <Text
            style={{
              fontFamily: type.amountRow.fontFamily,
              fontSize: 13,
              color: color.stamp,
              marginTop: 20,
            }}
          >
            {error}
          </Text>
        )}

        <Pressable
          onPress={submit}
          disabled={busy}
          style={({ pressed }) => ({
            marginTop: 32,
            paddingVertical: 19,
            alignItems: "center",
            backgroundColor: pressed ? color.lime : color.void,
          })}
        >
          {({ pressed }) =>
            busy ? (
              <ActivityIndicator color={pressed ? color.void : color.bone} />
            ) : (
              <Text
                style={{
                  fontFamily: type.merchant.fontFamily,
                  fontSize: 13,
                  letterSpacing: 1.3,
                  color: pressed ? color.void : color.bone,
                }}
              >
                {isNew ? "SKAPA KONTO" : "LOGGA IN"}
              </Text>
            )
          }
        </Pressable>

        <Pressable style={{ marginTop: 18 }}>
          <Text
            style={{
              fontFamily: type.meta.fontFamily,
              fontSize: 11,
              letterSpacing: 1.1,
              color: color.concrete,
              textAlign: "center",
            }}
          >
            {isNew ? "GENOM ATT FORTSÄTTA GODKÄNNER DU VILLKOREN" : "GLÖMT LÖSENORDET?"}
          </Text>
        </Pressable>

        <View style={{ flex: 1, minHeight: 26 }} />

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            paddingBottom: Math.max(insets.bottom, 30),
          }}
        >
          <LockMark />
          <Text style={{ fontFamily: type.meta.fontFamily, fontSize: 10, letterSpacing: 1.2, color: color.concrete }}>
            BANKGRADS KRYPTERING · GDPR · DATA I EU
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
