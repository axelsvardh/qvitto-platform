# 002: Plan

## Today
- Nothing is deployed. CI (009, 010) runs on PRs and on `main`, but nothing happens after it.
- The API has no health endpoint. Its start script is just `node src/server.js`, with no migrations.
- `apps/customer/api/api.js` always uses the Metro LAN host or `localhost:4000`.
- `apps/customer/app.json` has no `name`, `slug` or `web` settings.
- Prisma has migrations for every model, so `prisma migrate deploy` can build an empty database from scratch.

## Changes

### API (`services/api`)
1. **`GET /health`** (public, no auth) returns `200 { status: "ok", commit }`. `commit` is Render's `RENDER_GIT_COMMIT`, so the deploy workflow can tell when the new version is live (AC3).
2. **`npm run start:staging`** runs `prisma migrate deploy && node src/server.js`, so every deploy migrates first.

### Customer app (`apps/customer`)
3. **`api.js`**: if `EXPO_PUBLIC_API_URL` is set, it's the base URL. Otherwise the LAN or localhost logic stays as it is today (AC5).
4. **`app.json`**: `"name": "Qvitto"` and `"slug": "qvitto-app"` (AC8). The slug matches the one EAS already derives from `package.json`, so the existing EAS project still matches. Also `"web": { "output": "single" }`, so the export is one page and every route loads it.
5. **`app.config.js`**: reads `app.json` and sets `experiments.baseUrl` from `EXPO_BASE_URL`, only when that's set. GitHub Pages serves the app under `/qvitto-platform/`, while local dev keeps `/`.
6. **`eas.json`**: the `preview` profile builds an Android APK, and gets `EXPO_PUBLIC_API_URL` pointing at staging once the Render service exists (AC9).

### Hosting, set up as code
7. **`render.yaml`** (a Render Blueprint) describes the staging API: Frankfurt region (data in the EU), free plan, `healthCheckPath: /health`, and `autoDeploy: false`, so Render never deploys by itself (AC2).
   - **Secrets:** `JWT_SECRET`, `POS_API_KEY` and `PSP_API_KEY` use `generateValue: true`. Render creates random values that never touch the repo and differ from local (AC6, AC7).
   - **Entered by Axel in Render:** `DATABASE_URL` (from Neon) and the optional Braintree, Stripe and Zettle sandbox keys are `sync: false`, so Render asks for them.
   - `ENABLE_DEV_ENDPOINTS` is `false`.

### Deploy workflow
8. **`.github/workflows/deploy-staging.yml`** starts when the `CI` workflow finishes on a push to `main`, and continues only if CI succeeded (AC1, AC2). It checks out exactly the commit CI tested.
   - **`api` job** (environment `staging`): calls the Render deploy hook (`secrets.RENDER_DEPLOY_HOOK_URL`) with `ref=<sha>`, then polls `<STAGING_API_URL>/health` until `commit` equals that SHA (up to 10 minutes).
   - **`web` job** (environment `github-pages`): `npx expo export --platform web` with `EXPO_PUBLIC_API_URL` from the repository variable `STAGING_API_URL` and `EXPO_BASE_URL=/qvitto-platform`. It copies `index.html` to `404.html`, so deep links load the app, then publishes with `actions/deploy-pages` (AC4).
   - **Before hosting exists:** if the hook secret or the API URL variable is missing, the job stops with a clear message instead of deploying something half-configured.
   - **Permissions:** only what each job needs (`pages: write` and `id-token: write` for Pages, `contents: read` otherwise).

## How the ACs are proven
- **AC3, AC5:** tests named after the AC. `GET /health` is in the API tests, and `EXPO_PUBLIC_API_URL` is in the customer app tests.
- **AC8:** a test that reads the Expo config.
- **AC1, AC2, AC4, AC9:** real runs, like 009. The first merge to `main` deploys, and a run with failing CI deploys nothing. The web URL logs in against staging, and an APK is built with the `preview` profile.
- **AC6, AC7:** reading `render.yaml` and the workflow. No secret values are in the repo, and Render generates its own.

## Axel's part (accounts; Claude can't create them)
1. **Neon:** a project in the EU (Frankfurt). Copy the direct connection string.
2. **Render:** connect GitHub as `axelsvardh`, then New → Blueprint → this repo. Paste `DATABASE_URL`. Copy the service URL and the deploy hook URL.
3. **GitHub:** the secret `RENDER_DEPLOY_HOOK_URL` in a `staging` environment, and `STAGING_API_URL` as a **repository** variable. The web job runs in the `github-pages` environment and can't see the `staging` environment's variables. The URL isn't secret.
4. **GitHub Pages:** Settings → Pages → Source: GitHub Actions.
5. **Ruleset:** add `API` to the required checks. This is left over from 010.

## Risks
- **Free Render sleeps after 15 minutes idle.** The first request then takes about 30–60 seconds. The health poll waits up to 10 minutes.
- **Migration drift:** if `schema.prisma` and the migrations disagree, the first deploy fails at `migrate deploy`. That's visible in the Render log and the health poll times out, so nothing breaks silently.
- **Web limitations:** some native parts (push notifications, card linking) won't work in the browser. That's fine, since the web build is for showing the UI.
