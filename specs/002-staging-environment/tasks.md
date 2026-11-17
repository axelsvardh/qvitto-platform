# 002: Tasks

- [x] **T1 `[api]` Health and migrations:** `GET /health` with the deployed commit, and `start:staging` runs `prisma migrate deploy` first. *(AC3)*
- [x] **T2 `[customer]` API URL from env:** `EXPO_PUBLIC_API_URL` overrides the local logic. *(AC5)*
- [x] **T3 `[customer]` App config:** name, slug and single-page web output in `app.json`, and `baseUrl` from `EXPO_BASE_URL` in `app.config.js`. *(AC8)*
- [x] **T4 `[infra]` Render Blueprint:** `render.yaml` with generated secrets, Frankfurt, free plan, health check and no auto-deploy. *(AC6, AC7)*
- [x] **T5 `[infra]` Deploy workflow:** after green CI on `main`, deploy the API via hook and wait for `/health`, and build and publish the web build to Pages. *(AC1, AC2, AC4)*
- [ ] **T6 `[infra]` Axel sets up the accounts:** Neon, the Render Blueprint, the GitHub `staging` environment, Pages, and the `API` required check.
- [ ] **T7 `[customer]` Android preview:** the `preview` profile in `eas.json` points at staging and builds an APK. *(AC9)*
- [ ] **T8 `[infra]` Prove it:** the first deploy after merge, a run where failing CI deploys nothing, login on the web URL, and the APK talking to staging. *(AC1, AC2, AC4, AC9)*
