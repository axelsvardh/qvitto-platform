# 002: Staging environment

Status: DRAFT (hosting choices below need Axel's OK)
Owner: Axel
Depends on: 001. The backend must not be public until `GET /api/users` and the default secrets are gone.

## Why
Today everything only runs on Axel's laptop. We want a "live" version we can open from any device, show to pilot stores, and point payment-provider sandboxes at. PSP webhooks need a public URL, so localhost can't receive them.

## Goal
Merging to `main` automatically updates a staging version of Qvitto:
- A web URL where the customer app (web build) can be opened, and later the business app and websites too.
- A public staging API with its own database.
- Phones running the app can point at the staging API.

## Constraints
- **GitHub Pages only serves static files.** It can host the web builds and the websites, but it can't run the Express API or Postgres. Those need a small server host and a managed database.
- **GitHub Pages on a private repo needs a paid GitHub plan.** If `qvitto-platform` stays private on a free account, the static sites should go on another free static host instead (Cloudflare Pages, Netlify or Vercel).
- **Staging never holds real customer data.** It only uses sandbox or test keys for Stripe, Zettle and Braintree.

## Proposed setup (for the pilot, as cheap as possible)
| Part | Proposal | Notes |
|---|---|---|
| Web (customer web build, later business app and sites) | GitHub Pages if the repo is public or you have GitHub Pro; otherwise Cloudflare Pages | `npx expo export --platform web` gives static files. |
| API (`services/api`) | Render or Railway | Free or low-cost tiers. A free instance sleeps when idle, so the first request after a break is slow. That's fine for staging. |
| Database | Neon or Supabase (free Postgres) | A separate database from local, migrated with `prisma migrate deploy` on each deploy. |
| Mobile | EAS Update "staging" channel / internal builds | Points the app at the staging API through `EXPO_PUBLIC_API_URL`. |
| Deploys | GitHub Actions on merge to `main` | It runs the tests first and doesn't deploy if they fail. |

## Acceptance criteria
- **AC1**: Given a merge to `main` with green tests, then the staging API and web build update automatically within about 10 minutes.
- **AC2**: Given a merge with failing tests, then nothing is deployed.
- **AC3**: The staging API answers on HTTPS at a fixed URL, and `GET /health` returns 200.
- **AC4**: Opening the staging web URL shows the customer app talking to the staging API, not localhost.
- **AC5**: The app reads its API URL from `EXPO_PUBLIC_API_URL`. Without it, it falls back to today's local behaviour.
- **AC6**: Secrets live only in the hosting provider and GitHub secrets, never in the repo.
- **AC7**: Staging and local use different databases and different `JWT_SECRET`s.

## Open questions
1. **Repo visibility:** should `qvitto-platform` stay private? That decides GitHub Pages vs Cloudflare Pages.
2. **Budget:** free tiers only, or a few euros a month for an API that doesn't sleep?
3. **Customer app on web:** some parts, like Stripe card linking, may not work in a browser. Is the web build mainly for showing the UI, with real testing done on phones?
