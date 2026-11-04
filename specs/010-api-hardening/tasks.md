# 010: Tasks

- [x] **T1 `[api]` Test setup:** vitest, light-my-request, `npm test` in `services/api`, with Prisma mocked. Split `createApp()` (in `src/app.js`) from `server.js`.
- [x] **T2 `[api]` Startup config:** `src/config.js` requires `JWT_SECRET`, `POS_API_KEY` and `PSP_API_KEY`, and every fallback is removed. *(AC3)*
- [x] **T3 `[api]` Remove the leaks:** delete `GET /api/users` and return `toPublicUser()` from register and login. *(AC1, AC2)*
- [x] **T4 `[api]` API keys without fallbacks:** `requireApiKey` answers 503 when unset and 401 when wrong. The bank webhook goes behind `ENABLE_DEV_ENDPOINTS` and the POS key. *(AC4, AC5, AC6)*
- [x] **T5 `[infra]` CI:** an `api` job, and `ready-for-review` waits for it. After merge, Axel adds the `API` check to the `Protect main` ruleset (Settings → Rules). *(AC7)*
- [x] **T6 `[api]` Docs:** the README env list and `.env` template, and Postman and scripts updated to the new keys.
