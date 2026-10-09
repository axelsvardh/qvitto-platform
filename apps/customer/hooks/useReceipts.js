import { useCallback, useEffect, useState } from "react";
import api from "../api/api";
import { categoryLabel } from "../theme/qvitto";

// Öppet köp isn't in the backend yet — no per-merchant return policy exists
// to read. Until it does, assume a generic 14-day window for categories
// where returning a physical item is normal, and none for consumables,
// services, or anything we can't categorize. This is a stated assumption,
// not real merchant data — swap for a real returnDeadline field (or per-
// category/merchant days) the moment that data exists.
const RETURN_WINDOW_DAYS = { KLÄDER: 14, HEM: 14, SHOPPING: 14 };

function computeReturnDeadline(category, purchasedAt) {
  const days = RETURN_WINDOW_DAYS[category];
  const d = purchasedAt ? new Date(purchasedAt) : null;
  if (!days || !d || isNaN(d)) return null;
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// GET /api/transactions returns Transaction rows with the Receipt joined in
// as a nested `receipt` object (category, vat, items, storeAddress live
// there, not on the transaction) and the purchase date as `timestamp`. This
// flattens that shape into what the screens read.
function normalize(raw) {
  const receipt = raw.receipt || {};
  const vat = receipt.vat;
  const purchasedAt = raw.timestamp || raw.purchasedAt || raw.createdAt || raw.date;
  const category = categoryLabel(receipt.category ?? raw.category);
  return {
    id: raw.id,
    merchant: raw.merchant,
    amount: raw.amount,
    currency: raw.currency,
    purchasedAt,
    category,
    storeAddress: receipt.storeAddress ?? raw.storeAddress,
    vatAmount: vat ?? raw.vatAmount,
    amountExVat: vat != null ? Number(raw.amount) - Number(vat) : raw.amountExVat,
    lineItems: (receipt.items || raw.lineItems || []).map((it) => ({
      name: it.itemName ?? it.name,
      price: it.totalPrice ?? it.price,
    })),
    paymentMethodLast4: raw.paymentMethodLast4,
    returnDeadline: raw.returnDeadline || computeReturnDeadline(category, purchasedAt),
  };
}

// One place that talks to /api/transactions. Every screen uses this so the
// feed, search and overview can never disagree about the data.
export default function useReceipts({ poll = false } = {}) {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      const res = await api.get("/api/transactions");
      setReceipts(Array.isArray(res.data) ? res.data.map(normalize) : []);
      setError(null);
    } catch (err) {
      setError("Kunde inte hämta dina kvitton.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
    if (!poll) return;
    const id = setInterval(reload, 5000);
    return () => clearInterval(id);
  }, [reload, poll]);

  return { receipts, loading, error, reload };
}

export const stampOf = (r) => r?.purchasedAt || r?.createdAt || r?.date || null;

export const categoryOf = (r) => String(r?.category || "Övrigt").toUpperCase();
