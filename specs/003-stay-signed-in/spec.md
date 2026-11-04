# 003: Stay signed in

Status: READY FOR REVIEW (approved when the PR is merged)
Owner: Axel
Areas: customer

## Why
`/` always redirects to `/login`, so a signed-in customer sees the login screen every time they open the app, even though their token is saved. For an app whose whole point is "you don't have to do anything", that's the wrong first impression. (SCREENS.md, open design question 2.)

It's also the smallest real feature in the backlog, so it's a good first run of the full loop: spec, tasks, Claude PR, review on your phone.

## Goal
Opening the app takes a signed-in customer straight to Kvitton. Only customers who aren't signed in, or whose session has expired, see Login.

## Out of scope
- Refresh tokens or longer sessions. The token still lasts 7 days, and after that you log in again.
- Biometric unlock (Face ID).
- Changing the Login or Guide screens' design.

## Acceptance criteria
- **AC1**: Given a saved token that the API accepts, when the app cold-starts, then Kvitton opens and the Login screen is never shown, not even for a moment.
- **AC2**: Given no saved token, when the app starts, then Login opens.
- **AC3**: Given a saved token that the API rejects (401 or 403, e.g. expired, or an old token after spec 001's token change), when any request is made, then the token is removed, the app goes to Login, and Login shows the line "Du har loggats ut. Logga in igen." in concrete (not stamp red, since it's not the user's error).
- **AC4**: Given a saved token and no internet, when the app starts, then Kvitton opens with its existing error line "Kunde inte hämta dina kvitton." The customer is not logged out because of a network error.
- **AC5**: Given a signed-in customer, when the app navigates to `/login` (e.g. a deep link), then it redirects to Kvitton.
- **AC6**: Given a signed-in customer, when they tap Logga ut, then the token is removed and the next cold start opens Login.
- **AC7**: While the app checks for a saved token at start-up, it shows a plain bone screen, with no flicker between screens.

## Data
No new data. It reads the existing `token` key in AsyncStorage.

## Open questions
None. The copy in AC3 is a proposal, so change it in the PR review if you want other wording.
