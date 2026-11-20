// Spec 002: staging environment. API-side acceptance criteria.
import inject from "light-my-request";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

vi.mock("@prisma/client", () => ({
  PrismaClient: class {},
}));

const { createApp } = await import("../src/app.js");

const ENV = { JWT_SECRET: "test-jwt-secret", POS_API_KEY: "test-pos", PSP_API_KEY: "test-psp" };
let saved;

beforeEach(() => {
  saved = { ...process.env };
  Object.assign(process.env, ENV);
  delete process.env.RENDER_GIT_COMMIT;
});
afterEach(() => {
  process.env = saved;
});

test("AC3: GET /health answers 200 without auth", async () => {
  const res = await inject(createApp(), { method: "GET", url: "/health" });

  expect(res.statusCode).toBe(200);
  expect(res.json()).toEqual({ status: "ok", commit: null });
});

test("AC3: GET /health reports the deployed commit", async () => {
  process.env.RENDER_GIT_COMMIT = "4351495abc";

  const res = await inject(createApp(), { method: "GET", url: "/health" });

  expect(res.json().commit).toBe("4351495abc");
});
