# Spec backlog

Specs are per **feature**, not per app. One spec can touch several parts. Each task in `tasks.md` has an area tag so the board can be filtered by area:
- `[api]`: services/api
- `[customer]`: apps/customer
- `[business]`: apps/business
- `[infra]`: CI, hosting

| # | Spec | Areas | Status |
|---|---|---|---|
| 001 | Business accounts and store access | api | Ready for review |
| 002 | Staging environment | infra, api, customer | Draft |
| 003 | Stay signed in | customer | Ready for review (first customer-app pilot) |
| 004 | Line items reach the app (RADER) | api, customer | Idea |
| 005 | Real card linking (Stripe SetupIntent), and fix the "vi ser aldrig kortnummer" copy conflict | api, customer | Idea |
| 006 | Forgot password | api, customer | Idea |
| 007 | Share receipt as PDF (DELA PDF) | customer | Idea |
| 008 | Business app shell and login | business | Waiting for business app design |
| 009 | CI and review notifications | infra | Ready for review |
| — | BankID, öppet köp from store data, export to bookkeeping | | Later |

Customer app reference for how it works today: `apps/customer/design-handoff/SCREENS.md`.
