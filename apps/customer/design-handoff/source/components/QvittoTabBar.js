import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";
import { color, type } from "../theme/qvitto";

const Icon = ({ name, tint }) => (
  <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
    {name === "kvitton" && (
      <>
        <Path
          d="M3 1h14v18l-2.33-1.6L12.33 19 10 17.4 7.67 19l-2.34-1.6L3 19V1z"
          stroke={tint}
          strokeWidth={1.6}
        />
        <Path d="M6.5 6.5h7M6.5 10.5h7" stroke={tint} strokeWidth={1.6} />
      </>
    )}
    {name === "sok" && (
      <>
        <Circle cx={8.5} cy={8.5} r={6.5} stroke={tint} strokeWidth={1.6} />
        <Path d="M13.5 13.5L19 19" stroke={tint} strokeWidth={1.6} />
      </>
    )}
    {name === "oversikt" && (
      <Path
        d="M2 18V9M8 18V2M14 18v-6M19.5 18H0.5"
        stroke={tint}
        strokeWidth={1.6}
      />
    )}
    {name === "konto" && (
      <Path
        d="M5 1h10v8H5V1zM1 19v-3.5C1 13 4 12 10 12s9 1 9 3.5V19"
        stroke={tint}
        strokeWidth={1.6}
      />
    )}
  </Svg>
);

const LABELS = {
  receipts: { icon: "kvitton", label: "KVITTON" },
  sok: { icon: "sok", label: "SÖK" },
  oversikt: { icon: "oversikt", label: "ÖVERSIKT" },
  konto: { icon: "konto", label: "KONTO" },
};

// Active state is an inversion, not a tint: the cell fills black and the icon
// and label go bone. No indicator line, no scale, no colour.
export default function QvittoTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: color.void,
        backgroundColor: color.bone,
        // paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
      {state.routes.map((route, i) => {
        const meta = LABELS[route.name];
        if (!meta) return null;
        const active = state.index === i;
        const tint = active ? color.bone : color.void;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={{
              flex: 1,
              alignItems: "center",
              gap: 7,
              paddingTop: 14,
              paddingBottom: 28,
              backgroundColor: active ? color.void : "transparent",
            }}
          >
            <Icon name={meta.icon} tint={tint} />
            <Text style={[type.tabLabel, { color: tint }]}>{meta.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
