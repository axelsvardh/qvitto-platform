// Spec 010: API hardening before staging. One test per acceptance criterion.
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import bcrypt from "bcrypt";
import inject from "light-my-request";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// Every module does `new PrismaClient()`; they all get this one fake, so no
// database is needed.
const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() },
  transaction: { create: vi.fn() },
  receipt: { create: vi.fn() },
}));
vi.mock("@prisma/client", () => ({
  PrismaClient: class {
    constructor() {
      return db;
    }
  },
}));

const { createApp } = await import("../src/app.js");

// Sends a request straight into the app, without opening a port.
async function call(method, url, { body, headers } = {}) {
  const res = await inject(createApp(), { method, url, payload: body, headers });
  let json;
  try {
    json = res.json();
  } catch {
    json = undefined;
  }
  return { status: res.statusCode, body: json, text: res.payload };
}

const ENV = {
  JWT_SECRET: "test-jwt-secret",
  POS_API_KEY: "test-pos-key-for-tests",
  PSP_API_KEY: "test-psp-key-for-tests",
};
const ALL_KEYS = [...Object.keys(ENV), "BRAINTREE_CHARGE_API_KEY", "ENABLE_DEV_ENDPOINTS"];
let saved;

beforeEach(() => {
  saved = Object.fromEntries(ALL_KEYS.map((k) => [k, process.env[k]]));
  ALL_KEYS.forEach((k) => delete process.env[k]);
  Object.assign(process.env, ENV);
  vi.clearAllMocks();
});
afterEach(() => {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
});

test("AC1: GET /api/users no longer exists", async () => {
  db.user.findMany.mockResolvedValue([{ id: 1, email: "a@b.se", password: "hash" }]);

  const res = await call("GET", "/api/users");

  expect(res.status).toBe(404);
  expect(db.user.findMany).not.toHaveBeenCalled();
});

describe("AC2: no endpoint returns a password hash", () => {
  test("AC2: register returns only id, email and name", async () => {
    db.user.findUnique.mockResolvedValue(null);
    db.user.create.mockImplementation(async ({ data }) => ({ id: 7, bankConnectionId: null, ...data }));

    const res = await call("POST", "/api/register", {
      body: { name: "Elin", email: "elin@mail.se", password: "hemligt123" },
    });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 7, email: "elin@mail.se", name: "Elin" });
    expect(res.text).not.toMatch(/\$2[aby]\$/);
  });

  test("AC2: login returns only id, email and name", async () => {
    const hash = await bcrypt.hash("hemligt123", 4);
    db.user.findUnique.mockResolvedValue({ id: 7, email: "elin@mail.se", name: "Elin", password: hash });

    const res = await call("POST", "/api/login", {
      body: { email: "elin@mail.se", password: "hemligt123" },
    });

    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ id: 7, email: "elin@mail.se", name: "Elin" });
    expect(res.text).not.toContain(hash);
  });
});

describe("AC3: the server refuses to start without its core secrets", () => {
  const serverPath = fileURLToPath(new URL("../src/server.js", import.meta.url));
  // An empty folder, so dotenv finds no .env file to fill in the gap.
  const cwd = mkdtempSync(join(tmpdir(), "qvitto-api-"));

  test.each(Object.keys(ENV))("AC3: refuses to start without %s", (missing) => {
    const env = { ...process.env, ...ENV, PORT: "0" };
    delete env[missing];

    const run = spawnSync(process.execPath, [serverPath], { cwd, env, encoding: "utf8", timeout: 10000 });

    expect(run.status).toBe(1);
    expect(run.stderr).toContain(`Missing required env var: ${missing}`);
  });

  test("AC3: createApp() throws too, so nothing can build the app without them", () => {
    delete process.env.JWT_SECRET;
    expect(() => createApp()).toThrow("Missing required env var: JWT_SECRET");
  });

  test("AC3: a token signed with the old fallback secret is rejected", async () => {
    const jwt = (await import("jsonwebtoken")).default;
    const forged = jwt.sign({ userId: 1, email: "a@b.se" }, "supersecretkey");

    const res = await call("GET", "/api/transactions", {
      headers: { authorization: `Bearer ${forged}` },
    });

    expect(res.status).toBe(403);
  });
});

describe("AC4: Braintree charge endpoints are off without their key", () => {
  test.each(["/api/braintree/locations", "/api/braintree/charge"])(
    "AC4: %s answers 503 when BRAINTREE_CHARGE_API_KEY is unset",
    async (path) => {
      const res = await call("POST", path, {
        body: {},
        headers: { "x-api-key": "test-braintree-charge-key" },
      });
      expect(res.status).toBe(503);
    }
  );
});

describe("AC5: the bank webhook is a dev-only endpoint", () => {
  test("AC5: it doesn't exist unless ENABLE_DEV_ENDPOINTS=true", async () => {
    const res = await call("POST", "/api/bank/webhook", {
      body: { userId: 1, merchant: "ICA", amount: 10, currency: "SEK" },
    });

    expect(res.status).toBe(404);
    expect(db.transaction.create).not.toHaveBeenCalled();
  });

  test("AC5: with dev endpoints on, it needs the POS API key", async () => {
    process.env.ENABLE_DEV_ENDPOINTS = "true";

    const res = await call("POST", "/api/bank/webhook", {
      body: { userId: 1, merchant: "ICA", amount: 10, currency: "SEK" },
    });

    expect(res.status).toBe(401);
    expect(db.transaction.create).not.toHaveBeenCalled();
  });
});

describe("AC6: API key endpoints reject a missing or wrong key", () => {
  test.each([
    ["missing", undefined],
    ["wrong", "nope"],
    ["the old fallback", "test-pos-key"],
  ])("AC6: POST /api/pos/receipts with a %s key answers 401", async (_label, key) => {
    const res = await call("POST", "/api/pos/receipts", {
      body: {},
      headers: key ? { "x-api-key": key } : {},
    });

    expect(res.status).toBe(401);
  });

  test("AC6: POST /api/psp/webhook with the old fallback key answers 401", async () => {
    const res = await call("POST", "/api/psp/webhook", {
      body: {},
      headers: { "x-api-key": "test-psp-key" },
    });

    expect(res.status).toBe(401);
  });

  test("AC6: the right key gets through to the handler", async () => {
    const res = await call("POST", "/api/pos/receipts", {
      body: {},
      headers: { "x-api-key": ENV.POS_API_KEY },
    });

    expect([401, 503]).not.toContain(res.status);
  });
});
