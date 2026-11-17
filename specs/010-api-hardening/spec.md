# 010: API hardening before staging

Status: READY FOR REVIEW (approved when the PR is merged)
Owner: Axel
Areas: api, infra

## Why
Spec 002 puts the API on a public URL. Today that would leak customer data and let anyone fake requests:
- `GET /api/users` has no auth and returns every customer, including their password hashes.
- `POST /api/register` returns the new user's password hash.
- `JWT_SECRET` falls back to `"supersecretkey"`, so anyone who reads this public repo can sign a valid customer token.
- The POS, PSP and Braintree charge keys fall back to `test-pos-key`, `test-psp-key` and `test-braintree-charge-key`, which are also in the repo.
- `POST /api/bank/webhook` has no auth at all. Anyone can create a transaction and a receipt for any customer and send them a push notification.

These break constitution §3. Spec 001 already planned the first four (its AC16, AC17 and T2), but 001 is waiting for the business app to be re-scoped. This spec takes just those fixes out of 001 so that 002 can go ahead.

## Goal
Nothing in the API leaks customer data or accepts a secret that's in the repo, so it's safe to run on a public URL.

## Out of scope
- Per-store API keys, business accounts, and the token change. Those stay in 001.
- Telling "unknown email" (404) apart from "wrong password" (401) on login. It lets someone check which emails have accounts, which is worth fixing but not a blocker. It gets its own ticket.
- Rate limiting.

## Acceptance criteria
- **AC1**: `GET /api/users` no longer exists and answers 404.
- **AC2**: No endpoint returns a password hash. `POST /api/register` returns only the new customer's `id`, `email` and `name`.
- **AC3**: Given `JWT_SECRET`, `POS_API_KEY` or `PSP_API_KEY` is not set, when the server starts, then it refuses to start and names the missing variable. There are no hard-coded fallbacks.
- **AC4**: The Braintree charge endpoints don't fall back either. If `BRAINTREE_CHARGE_API_KEY` is not set, they answer 503 to every request, so the server still runs without Braintree.
- **AC5**: `POST /api/bank/webhook` only exists when `ENABLE_DEV_ENDPOINTS=true`, like the other simulation endpoints, and then needs the POS API key. Otherwise it answers 404.
- **AC6**: An API key endpoint called with a missing or wrong `x-api-key` answers 401.
- **AC7**: CI runs the API tests, and the ready-for-review comment waits for them.

## Data
No new data. Less personal data is exposed: no password hashes, and no list of all customers.

## Open questions
1. **Optional integration secrets.** Constitution §3 says a missing secret stops the server. This spec only makes the core secrets (AC3) stop it. Braintree, Stripe and Zettle fail closed per request instead (AC4; Stripe and Zettle already answer 500 without their secrets), so staging can run without every provider configured. Is that an acceptable reading of §3?
