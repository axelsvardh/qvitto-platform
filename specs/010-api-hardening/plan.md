# 010: Plan

## Today
- `src/server.js` builds the app and calls `app.listen` in the same file, so tests can't import the app without starting a server.
- `JWT_SECRET` is read in two places, `src/middleware/auth.js` and `src/api/auth.js`, and both have the `"supersecretkey"` fallback.
- `requireApiKey(envVarName, fallback)` in `src/middleware/apiKey.js` uses the fallback when the env var is missing.
- `GET /api/users` is defined inline in `server.js`.
- `registerUser` responds with the whole Prisma `user` row, including `password`.
- The API has no tests, and CI only checks the customer app.

## Changes
1. **`src/config.js`**: reads `JWT_SECRET`, `POS_API_KEY` and `PSP_API_KEY`, and throws `Missing required env var: <NAME>` if any is empty (AC3). Everything else imports secrets from here, not from `process.env`.
2. **`src/app.js`**: `createApp()` builds and returns the Express app with every route. **`src/server.js`** only loads dotenv and config, then calls `createApp().listen(PORT)`. Tests import `createApp` directly.
3. **Remove `GET /api/users`** (AC1).
4. **`toPublicUser(user)`** in `src/api/auth.js` returns `{ id, email, name }`. `registerUser` and `loginUser` both use it (AC2).
5. **`requireApiKey(envVarName)`**, with no fallback. It answers 503 when the env var is unset and 401 when the header is missing or wrong (AC4, AC6). Startup config guarantees the POS and PSP keys are set, so in practice 503 only happens for Braintree.
6. **`POST /api/bank/webhook`** moves into the `ENABLE_DEV_ENDPOINTS` block, behind `requireApiKey("POS_API_KEY")` (AC5).
7. **Tests**: `vitest` and `supertest` in `services/api`, plus an `npm test` script. Prisma is mocked with `vi.mock("@prisma/client")`, so the tests need no database. One test per AC, named `AC1: ...` and so on.
8. **CI**: an `api` job in `.github/workflows/ci.yml` that runs `npm test` in `services/api`, and `needs: [customer, api]` on `ready-for-review` (AC7).
9. **Docs**: list the required env vars in `services/api/README.md` and add a `.env.example` without real values.

## Risks
- **Local dev breaks until `.env` has the three secrets.** That's on purpose. `.env.example` and the error message say what to set.
- **Old tokens stop working** if a developer's local `JWT_SECRET` changes. The customer app then logs out cleanly, thanks to spec 003.
- **Postman collections and `scripts/` use the old fallback keys.** Update them to read the key from env, or document that they need `POS_API_KEY`.
