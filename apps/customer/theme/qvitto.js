// Qvitto light identity — design tokens.
// Radius is 0 everywhere and there are no shadows; that is intentional.

export const color = {
  bone: "#F4F1EA",
  void: "#0E0E0D",
  concrete: "#8A8880",
  concreteLight: "#c9c5b8",
  hairline: "#DEDACD",
  pressed: "#EAE6DC",
  lime: "#D7FF3E",
  stamp: "#FF3B1F",
};

// Category -> row accent bar. One flat ink per category: saturated but matte,
// like a printer's spot-colour set, so categories stay tellable apart on bone
// without any of them reading as a gradient or a status colour. Lime is still
// reserved for confirmation and never appears here.
export const categoryInk = {
  MAT: "#1F5F3A",
  CAFÉ: "#7A4A1E",
  TRANSPORT: "#1B4B8F",
  KLÄDER: color.stamp,
  DRYCK: "#6B2D5C",
  HÄLSA: "#0E8A8A",
  HEM: "#B07A00",
  ÖVRIGT: color.concrete,
  // Backend-enum categories (see categoryLabel below) that have no equivalent
  // in the original eight-category design vocabulary.
  SHOPPING: color.stamp,
  NÖJE: "#4A3B7A",
  RÄKNINGAR: "#4A5A6B",
};

const CATEGORY_COLOR = categoryInk;

export const categoryColor = (category) =>
  CATEGORY_COLOR[String(category || "").toUpperCase()] || color.concrete;

// The backend stores Receipt.category as an English Prisma enum
// (FOOD/GROCERIES/TRANSPORTATION/ENTERTAINMENT/HEALTH/SHOPPING/UTILITIES/OTHER);
// the feed displays Swedish labels. This is the single place that translates
// between the two, so every screen shows the same word for the same category.
const CATEGORY_LABEL = {
  FOOD: "MAT",
  GROCERIES: "MAT",
  TRANSPORTATION: "TRANSPORT",
  ENTERTAINMENT: "NÖJE",
  HEALTH: "HÄLSA",
  SHOPPING: "SHOPPING",
  UTILITIES: "RÄKNINGAR",
  OTHER: "ÖVRIGT",
};

export const categoryLabel = (raw) => {
  const key = String(raw || "").toUpperCase();
  return CATEGORY_LABEL[key] || key || "ÖVRIGT";
};

export const space = { screen: 22, row: 14, slab: 22, gap: 10 };

// Font families. These names match the @expo-google-fonts packages loaded in
// app/_layout.tsx — see repo/README-IMPLEMENTATION.md. If the fonts are not
// loaded the app still renders, just in the system face.
export const font = {
  display: "PlusJakartaSans_800ExtraBold",
  body: "IBMPlexSans_400Regular",
  mono: "JetBrainsMono_400Regular",
};

export const type = {
  screenTitle: {
    fontFamily: font.display,
    fontSize: 18,
    letterSpacing: -0.54,
    color: color.void,
  },
  merchant: {
    fontFamily: font.display,
    fontSize: 15,
    letterSpacing: -0.15,
    textTransform: "uppercase",
    color: color.void,
  },
  amountBig: {
    fontFamily: font.display,
    fontSize: 46,
    letterSpacing: -1.38,
    lineHeight: 46,
  },
  dayLabel: {
    fontFamily: font.display,
    fontSize: 12,
    letterSpacing: 1.92,
    color: color.void,
  },
  amountRow: { fontFamily: font.mono, fontSize: 15, color: color.void },
  meta: {
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 1,
    color: color.concrete,
  },
  sectionLabel: {
    fontFamily: font.mono,
    fontSize: 10,
    letterSpacing: 1.8,
    color: color.concrete,
  },
  tabLabel: { fontFamily: font.mono, fontSize: 9, letterSpacing: 1.26 },
};

// 4 892,50 — Swedish grouping, always two decimals.
export const formatAmount = (n) =>
  Number(n || 0).toLocaleString("sv-SE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// A thermal paper receipt costs roughly 3.2 g CO2e to produce — paper, coating,
// print and the trip to the store. Adjust in one place if the number is sourced
// differently later; the UI reads whatever this returns.
export const CO2_PER_RECEIPT_G = 3.2;

export const co2Saved = (receiptCount) => {
  const grams = (receiptCount || 0) * CO2_PER_RECEIPT_G;
  if (grams >= 1000)
    return `${(grams / 1000).toFixed(1).replace(".", ",")}KG CO₂`;
  return `${Math.round(grams)}G CO₂`;
};
