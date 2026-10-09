# Qvitto — current app, for mocking in Claude Design

Expo 54 / expo-router 6 / React Native 0.81. Swedish UI copy. This is a snapshot of what is
**implemented today**, not a proposal. `source/` holds the real code; this file says what it
renders and which parts are real vs placeholder.

Folder names are filesystem-safe: `source/app/tabs/` is `app/(tabs)/` and `source/app/kvitto/id.js`
is `app/kvitto/[id].js` in the repo. Import depths are unchanged.

## Look and rules (`source/theme/qvitto.js`)

Radius 0 everywhere, no shadows, no gradients. Lime is reserved for confirmation (CO₂ chip, "AKTIVT",
done states, pressed primary button) and is never a category colour.

| Token | Hex | Use |
|---|---|---|
| bone | #F4F1EA | screen background |
| void | #0E0E0D | text, slabs, primary buttons, active tab |
| concrete | #8A8880 | secondary text, labels |
| concreteLight | #c9c5b8 | |
| hairline | #DEDACD | dividers, tracks, big guide numerals |
| pressed | #EAE6DC | row pressed state |
| lime | #D7FF3E | confirmation only |
| stamp | #FF3B1F | errors, öppet köp, Kläder/Shopping |

Category inks (flat, matte): MAT #1F5F3A, CAFÉ #7A4A1E, TRANSPORT #1B4B8F, KLÄDER/SHOPPING #FF3B1F,
DRYCK #6B2D5C, HÄLSA #0E8A8A, HEM #B07A00, NÖJE #4A3B7A, RÄKNINGAR #4A5A6B, ÖVRIGT #8A8880.

Fonts: Plus Jakarta Sans ExtraBold (display, headings, merchant names, buttons), JetBrains Mono
(amounts, labels, meta), IBM Plex Sans (body paragraphs only). Labels are mono, 9–11px, wide
letter-spacing, uppercase. Screen padding 22px (login/guide/koppla-kort use 26px).

One-off colours: body text #57564f, input placeholder #b8b4a8.

## Navigation

```
/            -> redirects to /login (always, even with a saved token)
/login       -> new account: /guide   |  existing: /receipts
/guide       -> finish or "hoppa över": /receipts
(tabs)       -> /receipts  /sok  /oversikt  /konto   (custom tab bar)
/kvitto/<id> pushed over the tabs from any receipt row (no tab bar), back goes to previous screen
/koppla-kort pushed from Konto, back/done goes to /konto
```

Legacy and unreachable from the UI: `/register` (old default-RN styling) and `app/receipt/[id].js`
(empty file). Ignore both.

## Screens

### Login `/login`
Top to bottom: wordmark "QVITTO" (17px, tracked), headline "Inga fler / papper" (56px display),
tab switch LOGGA IN / NYTT KONTO (active = void text + 2px underline over a hairline), then
hairline fields (label above, value, 1px void rule, no boxes): NAMN (new account only), E-POST,
LÖSENORD (right-aligned VISA/DÖLJ toggle). Inline error in stamp red. Full-width void button
(LOGGA IN / SKAPA KONTO) that turns lime while pressed and shows a spinner while busy. Below it a
mono link: GLÖMT LÖSENORDET? (login) or GENOM ATT FORTSÄTTA GODKÄNNER DU VILLKOREN (new) — both
inert. Pinned to the bottom: lock icon + BANKGRADS KRYPTERING · GDPR · DATA I EU.
Errors: "Fyll i alla fält.", API message, "Fel e-post eller lösenord.", "Kontot kunde inte skapas."

### Guide `/guide` (first-time users, six steps)
Header: QVITTO left, HOPPA ÖVER right. Under it six progress segments (tappable; filled = visited).
Then a 104px hairline-grey step number, a 32px display heading, a 15px body paragraph, a black note
slab pinned above the buttons. Steps 01–03 explain (buttons: ← and NÄSTA). Steps 04–06 ask: a big
button that fills lime with a check and its done label, auto-advances after 550ms, plus a "TILLBAKA"
link and a skip link.

| # | Heading | Note slab | Ask button / done / skip |
|---|---|---|---|
| 01 | BETALA SOM VANLIGT | I SNITT 4 SEKUNDER FRÅN BETALNING TILL KVITTO | — |
| 02 | HITTA DET NÄR DU BEHÖVER DET | ALLA KVITTON SPARAS I 7 ÅR | — |
| 03 | PAPPER SOM ALDRIG TRYCKS | 1 000 KVITTON ≈ 3,2 KG CO₂ | — |
| 04 | VERIFIERA MED BANKID | PLACEHOLDER — BANKID KOPPLAS IN SENARE | ÖPPNA BANKID / VERIFIERAD / GÖR DET SENARE |
| 05 | KOPPLA ETT KORT | UTAN KORT KOMMER INGA KVITTON IN | KOPPLA KORT / SWEDBANK ••4471 KOPPLAT / GÖR DET SENARE |
| 06 | SLÅ PÅ NOTISER | INGA ERBJUDANDEN. INGA PÅMINNELSER. | TILLÅT NOTISER / NOTISER PÅ / INTE NU |

Full body copy is in `source/app/guide.js`. Step 06 really asks for notification permission.

### Kvitton `/receipts` (tab 1, the feed)
Header row: "QVITTO" (the small logo mark is commented out) and the month, e.g. AUG 2026.
Black full-bleed slab: label DENNA MÅNAD · N KVITTON, a lime chip with a leaf icon reading e.g.
`19G CO₂`, then the month total at 46px in bone with SEK. Below, receipts grouped by day, newest
first: day header (IDAG / IGÅR / "8 AUG", 12px display, tracked, followed by a 1px void rule) then
62px rows: 4×34 category-ink bar, merchant (display, uppercase) over `CATEGORY · HH:MM` (mono 10),
amount right in mono. Tap a row to open the receipt. Pull to refresh; polls every 5s.
Empty: "Ditt nästa köp hamnar här" / DU BEHÖVER INTE GÖRA NÅGOT. Error line in stamp red: "Kunde inte hämta dina kvitton."

### Sök `/sok` (tab 2)
Header SÖK. A boxed 1px void search field "Butik, belopp eller vara", then a rule.
Idle: SENASTE SÖKNINGAR chips (static demo: ica, över 500 kr, oktober), SNABBFILTER 2×2 cards:
ÖPPET KÖP (stamp-red fill, bone text), MAT, TRANSPORT, ÖVER 500 — each shows "N kvitton"; tapped card
fills void. Searching or filtering: "N TRÄFFAR · SUM SEK" then the same rows as the feed. Empty: INGA
KVITTON MATCHAR. Search matches merchant, amount and line-item names.

### Översikt `/oversikt` (tab 3)
Header ÖVERSIKT with the month right. Big total (46px, void) + SEK. Chip row: a black chip with bone
text `+12,3 % MOT FÖREGÅENDE MÅNAD` (only when last month has data) and a lime leaf chip `19G CO₂
TOTALT` (lifetime). PER KATEGORI: label left, amount right, a 10px hairline track with the
category-ink bar sized relative to the biggest category. Empty: INGET UTFALL DEN HÄR MÅNADEN.
MEST BESÖKTA: top three merchants as rows with "N ggr".

### Konto `/konto` (tab 4)
Header KONTO. Black slab: name (24px display, bone), email, `N KVITTON SPARADE`. KOPPLADE KORT: rows
`Swedbank ••4471` + lime AKTIVT chip, then "+ KOPPLA NYTT KORT" (opens /koppla-kort). INSTÄLLNINGAR
rows: Notiser PÅ →, Export till bokföring →, Datalagring 7 ÅR →, Logga ut → (stamp red). Only Logga ut
works; it signs out and goes to /login.

### Kvitto `/kvitto/<id>`
"← TILLBAKA", merchant at 34px uppercase, black slab with the amount (40px) and currency. Blocks that
only appear when data exists:
- RADER: line items, name left (mono 13), price right (concrete), hairline between.
- MOMS and BELOPP EXKL. MOMS, closed by a 1px void rule.
- Meta lines: store address, long date `10 september 2026 09:41`, "Betalt med kort ••4471".
- ÖPPET KÖP: stamp-red banner, label, `14 DAGAR KVAR` at 22px, deadline date right (`21 AUG.`).
Always: DELA PDF (void, lime on press) and BOKFÖR (outlined) — both inert.

### Koppla kort `/koppla-kort`
"← TILLBAKA", title "Koppla kort" (28px), one paragraph, a black note slab `PLACEHOLDER — INGEN RIKTIG
KORTHANTERING ÄN. KRÄVER EN PCI-CERTIFIERAD LEVERANTÖR SENARE.`, then hairline fields KORTNUMMER
(auto-spaced), GILTIG TILL (MM/ÅÅ), CVC (3 digits, 4 for Amex), inline stamp-red error and a void
KOPPLA KORT button. States: form → "VERIFIERAR KORT" with spinner (900ms) → done: lime circle with
check, `VISA ••4242 kopplat`, KVITTON BÖRJAR KOMMA IN AUTOMATISKT, KLART. Validation copy: "Kortnumret
verkar inte stämma.", "Utgångsdatumet är ogiltigt eller har passerat.", "CVC ska vara N siffror."

### Tab bar
Four equal cells with a 1px void top rule: KVITTON (torn receipt icon), SÖK (loupe), ÖVERSIKT (bars),
KONTO (person). Active cell inverts: void fill, bone icon and label. Labels mono 9px. Bottom
padding is a fixed 28px for the home indicator.

## Data the screens read (normalised in `source/hooks/useReceipts.js`)

```
{ id, merchant, amount, currency, purchasedAt, category (Swedish label), storeAddress,
  vatAmount, amountExVat, lineItems: [{ name, price }], paymentMethodLast4, returnDeadline }
```

The real API returns a transaction with a nested `receipt` (English category enum, `items` with
`itemName`/`totalPrice`, `vat`). Mapping: FOOD/GROCERIES → MAT, TRANSPORTATION → TRANSPORT,
ENTERTAINMENT → NÖJE, HEALTH → HÄLSA, SHOPPING → SHOPPING, UTILITIES → RÄKNINGAR, OTHER → ÖVRIGT.
`seed/receipts.json` has 26 sample receipts in the flat shape; its dates are anchored to 10 Aug 2026,
so for mocks use dates relative to "today" (IDAG / IGÅR depend on it).

Rules that change what a mock should show: CO₂ = receipts × 3.2 g (kg with comma above 1000 g);
month total sums the current calendar month; öppet köp = purchase + 14 days, only for KLÄDER, HEM,
SHOPPING; the delta chip needs last month's data.

## Not real yet (mock freely)

- BankID step, card step in the guide, and the whole card form: nothing talks to a bank or processor.
  Linked cards are stored locally; the two default cards are hard-coded.
- Öppet köp is an assumed 14-day rule, not merchant data. No per-receipt card number exists, so
  "Betalt med kort" never shows.
- Forgot password, terms, Dela PDF, Bokför, Notiser/Export/Datalagring rows, the recent-search
  chips: all inert.
- Line items currently never reach the app (backend query fix pending), so RADER is missing on live data.

## Open design questions

1. Guide step 05 and the old copy say "vi ser aldrig kortnummer", but Koppla kort now asks for the
   card number. One of them has to change.
2. `/` always redirects to /login, so a signed-in user sees the login screen on every cold start.
3. The feed header lost its logo mark; the brand logo PNGs are in `source/assets/` (teal Q + wordmark
   on white, plus a white-on-black version) and are not used in the app at all today.

## Suggested prompt for Claude Design

"Here is the current Qvitto app (SCREENS.md and source/). Build artboards for every screen and state
listed, using the exact tokens, then I will mock changes on top."
