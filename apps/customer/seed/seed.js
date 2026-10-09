// Seeds the API with test receipts.
//   node seed/seed.js                      -> http://localhost:4000
//   API=http://192.168.0.105:4000 node seed/seed.js
//   TOKEN=<jwt> node seed/seed.js          -> if /api/transactions requires auth
//
// Your POST /api/transactions currently accepts { merchant, amount, currency }.
// The extra fields (category, purchasedAt, lineItems, vatAmount, returnDeadline...)
// are sent too — the API ignores what it does not know, and the screens degrade
// gracefully without them. Once the backend stores them, the same seed fills
// every field the detail view can show.

const fs = require("fs");
const path = require("path");

const API = process.env.API || "http://localhost:4000";
const TOKEN = process.env.TOKEN;

const receipts = JSON.parse(
  fs.readFileSync(path.join(__dirname, "receipts.json"), "utf8")
);

(async () => {
  let ok = 0;
  let failed = 0;
  for (const r of receipts) {
    const { id, ...body } = r;
    try {
      const res = await fetch(`${API}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
      ok++;
    } catch (err) {
      failed++;
      if (failed < 4) console.error(r.merchant, "->", err.message);
    }
  }
  console.log(`${ok} kvitton skapade, ${failed} misslyckades (av ${receipts.length})`);
})();
