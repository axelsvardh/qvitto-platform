import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "linkedCards";

const DEFAULT_CARDS = [
  { id: "swedbank-4471", label: "Swedbank ••4471", active: true },
  { id: "revolut-0192", label: "Revolut ••0192", active: true },
];

// No card-linking endpoint exists yet, so linked cards live in AsyncStorage.
// TODO: once the backend has a real endpoint, swap the body of addCard() (and
// the initial load below) for API calls — every screen already reads through
// this hook, so nothing else needs to change.
export default function useCards() {
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setCards(JSON.parse(raw));
      } catch (err) {
        // Keep the defaults if storage is unreadable.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Only ever takes { brand, last4 } — display data, never the raw card
  // number/expiry/CVC. The card-entry screen discards those right after
  // deriving brand+last4; this hook must never be handed the real values.
  const addCard = useCallback(async ({ brand, last4 }) => {
    const card = { id: `${brand}-${last4}-${Date.now()}`, label: `${brand} ••${last4}`, active: true };
    setCards((cur) => {
      const next = [...cur, card];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    return card;
  }, []);

  return { cards, loading, addCard };
}
