# Qvitto constitution

Rules that apply to every feature, app and PR. A spec may not break these. Changing one needs its own PR and an explicit OK from Axel.

## 1. Spec first
- No spec, no PR. Every feature starts as `specs/NNN-name/spec.md` and is approved before any code is written.
- Every acceptance criterion in a spec becomes at least one automated test.
- If the code and the spec disagree, the spec wins. Fix the code, or change the spec in the same PR and say why.

## 2. Who sees what
- A customer sees only their own receipts, transactions and cards.
- A business sees only receipts issued by its own stores, plus their match status. It never sees the customer's name, email, card details or other receipts.
- A staff member sees only the stores they have been given access to.
- If a record belongs to someone else, the API answers as if it doesn't exist (404), so we never confirm that it does.
- Customer accounts and business accounts are separate. A customer token never works on business endpoints, and a business token never works on customer endpoints.

## 3. Security
- Every endpoint needs authentication, except ones a spec explicitly marks as public.
- No hard-coded fallback secrets (JWT secret, API keys). If a secret is missing, the server refuses to start.
- API keys are per store, stored hashed, shown once, and can be revoked.
- Never return password hashes or secrets from any endpoint.

## 4. Money and matching
- New code stores money as integer öre (SEK x 100), never as a float. Every amount carries an ISO currency code.
- A wrong match is worse than no match. When matching is ambiguous, the receipt stays unmatched and is flagged. It is never guessed.

## 5. Data and GDPR
- Collect only what a feature needs. Each spec lists the personal data it touches.
- How long data is kept gets decided in its own spec (both GDPR and Swedish bookkeeping rules apply). Until then, nothing is auto-deleted.

## 6. Product
- The pilot is 1–3 small Swedish stores. Choose the simple solution that works for them over a general one.
- UI text is Swedish first. Code, specs and commit messages are in English.
- All four surfaces (customer app, business app, customer site, business site) use the shared design tokens from the light identity.
- Business features are for stores that issue receipts (merchants). Companies that collect receipts for bookkeeping are a possible future feature. Don't build for it yet, but don't make choices that block it either.

## 7. Stack
- API: Node, Express, Prisma, PostgreSQL in `services/api`.
- Apps: Expo / React Native in `apps/*`.
- New code is TypeScript where the package supports it.
- The API contract (OpenAPI) is the source of truth for request and response shapes. Types in `packages/shared` are generated from it.
