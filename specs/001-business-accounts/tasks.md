# 001: Tasks

Tick these off in order. Each task is a small commit and names the ACs it covers. The PR is done when every AC has a passing test.

- [ ] **T1 Test setup:** split `app.js` / `server.js`, add Vitest and Supertest, a test DB script and an `npm test` script. Write one smoke test.
- [ ] **T2 Config and quick security fixes:** add `src/config.js` (JWT_SECRET required), remove the secret fallbacks, delete `GET /api/users`, add `toPublicUser()`. *(AC16, AC17)*
- [ ] **T3 Prisma schema and migration:** add the new models and enums, delete the test receipts, make `Receipt.storeId` required. *(data for all ACs)*
- [ ] **T4 Token audiences:** add `aud` to customer tokens, add `authenticateBusiness`, and make customer auth reject business tokens and vice versa. *(AC15)*
- [ ] **T5 Business signup and login.** *(AC1, AC2, AC3)*
- [ ] **T6 Admin activate-org script.** *(AC5)*
- [ ] **T7 Membership and store-access middleware, plus `/me`.** *(AC12, AC13, AC18, AC19)*
- [ ] **T8 Stores: create and list.** *(AC6, AC11 list part)*
- [ ] **T9 Store API keys:** create, list (prefix only) and revoke, plus the `requireStoreApiKey` middleware. *(AC7, AC8)*
- [ ] **T10 POS receipts with store keys:** use `req.store`, drop the global POS key, check that the organisation is active, recheck matching. *(AC4, AC9, AC10)*
- [ ] **T11 Invites:** create and accept, covering both a new user and an existing user. *(AC11)*
- [ ] **T12 Business receipt list with the `toBusinessReceipt()` serializer.** *(AC14)*
- [ ] **T13 `openapi.yaml`** for every endpoint touched in this spec.
- [ ] **T14 Docs:** update the `services/api` README (env vars, admin script, how to run the tests).
- [ ] **T15 Final check:** every AC1–AC19 has a test named after it, and `npm test` is green.
