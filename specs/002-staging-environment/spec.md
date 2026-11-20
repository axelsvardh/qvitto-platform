# 002: Staging environment

Status: READY FOR REVIEW (open questions answered 2026-11-04, approved when the PR is merged)
Owner: Axel
Areas: infra, api, customer
Depends on: 010. The API must not be public until `GET /api/users`, the password-hash responses and the fallback secrets are gone. (This used to say 001. Those fixes moved to 010, so 001 no longer blocks staging.)

## Why
Today everything only runs on Axel's laptop. We want a "live" version we can open from any device, show to pilot stores, and point payment-provider sandboxes at. PSP webhooks need a public URL, so localhost can't receive them.

## Goal
Merging to `main` automatically updates a staging version of Qvitto:
- A web URL where the customer app's web build can be opened, mainly to show the UI.
- A public staging API with its own database.
- Phones running the app can point at the staging API.

## Out of scope
- **TestFlight.** It needs an Apple Developer account, which we don't have yet. That's ticket 011.
- **The websites** (landing page, customer and business sites). They'll reuse this deploy pipeline in their own spec.
- **Making every feature work in a browser.** The web build is for showing the UI. Real testing, like card linking, happens on phones.

## Decisions (answers from 2026-11-04)
| Question | Answer |
|---|---|
| Repo visibility | It stays **public**, so GitHub Pages is free. |
| Budget | **Free tiers only.** A sleeping API (slow first request) is fine for staging. |
| What the web build is for | **Showing the UI** to pilot stores. |
| Phones | No Apple Developer account yet, so no TestFlight (see 011). iPhone: a development build installed from Xcode with a free Apple ID, which has to be reinstalled every 7 days. Android: an installable APK from EAS Build (free). |

## Setup
| Part | Choice | Notes |
|---|---|---|
| Customer web build | GitHub Pages | `npx expo export --platform web` gives static files. |
| API (`services/api`) | Render free tier (Railway as a backup) | It sleeps when idle, so the first request after a break is slow. |
| Database | Neon free Postgres | A separate database from local, migrated with `prisma migrate deploy` on each deploy. |
| Phones | A development build (iOS) and an EAS preview APK (Android) | Both read the staging API from `EXPO_PUBLIC_API_URL`. |
| Deploys | GitHub Actions on merge to `main` | It reuses the `CI` checks from 009 and doesn't deploy if they fail. |

## Acceptance criteria
- **AC1**: Given a merge to `main` with green checks, then the staging API and web build update automatically within about 10 minutes.
- **AC2**: Given a merge with failing checks, then nothing is deployed.
- **AC3**: The staging API answers on HTTPS at a fixed URL, and `GET /health` returns 200.
- **AC4**: Opening the staging web URL shows the customer app, and its login talks to the staging API, not localhost.
- **AC5**: The app reads its API URL from `EXPO_PUBLIC_API_URL`. Without it, it falls back to today's local behaviour.
- **AC6**: Secrets live only in the hosting provider and GitHub secrets, never in the repo.
- **AC7**: Staging and local use different databases and different `JWT_SECRET`s.
- **AC8**: `app.json` has the display name "Qvitto" and a `slug`, so EAS builds get a proper name.
- **AC9**: An Android preview APK pointed at staging can be built with `eas build --profile preview --platform android`.

## Open questions
None. Hosting accounts (Render, Neon) are created by Axel when the ticket starts. Claude can't create accounts.
