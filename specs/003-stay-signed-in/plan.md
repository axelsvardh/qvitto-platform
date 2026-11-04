# 003: Plan

## Today
- `app/index.js` always does `<Redirect href="/login" />`.
- `AuthContext` already reads the token on start (`loading`, `user`), but nothing uses it for routing.
- `api/api.js` adds the token to requests, but does nothing when the API rejects it.

## Changes
1. **`app/index.js`**: read `loading` and `user` from `AuthContext`. While `loading`, render a bone `View` (AC7). Then redirect to `/receipts` if `user` is set, otherwise to `/login` (AC1, AC2).
2. **`app/login.js`**: if `user` is already set, redirect to `/receipts` (AC5). Read the `reason=expired` query param and show the AC3 line above the fields, in mono 11px, concrete.
3. **`api/api.js`**: add a response interceptor. On 401/403 from any endpoint except `/api/login` and `/api/register`, call a registered `onUnauthorized` handler (AC3). Network errors (no response) don't trigger it (AC4).
4. **`context/AuthContext.js`**: register `onUnauthorized` and make it run `logout()` followed by `router.replace("/login?reason=expired")`. Use a guard flag so several failing requests at the same time only log out once.
5. **Logout (AC6)** already removes the token. The tests just need to cover it.

## Tests
- **Setup:** the customer app has no tests yet. Add `jest-expo` and `@testing-library/react-native`, plus an `npm test` script in `apps/customer`.
- **Mocks:** mock AsyncStorage (it ships a jest mock) and the axios instance.
- **Naming:** one test per AC, named `AC1: ...` and so on.

## Risks
- **Flash of the wrong screen:** expo-router can flash the old screen during a redirect. The bone placeholder in `index.js` covers this. If a flash still shows, move the check into `_layout.tsx` with Expo Router's protected routes (`Stack.Protected`).
