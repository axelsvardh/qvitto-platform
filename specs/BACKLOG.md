# Spec backlog

Specs are per **feature**, not per app. One spec can touch several parts. Each task in `tasks.md` has an area tag, and each issue has the matching label (`app:*` for what users see, `area:*` for the rest):
- `[customer]` (`app:customer`): the customer app (`apps/customer`) on iOS, Android, and its web build
- `[business]` (`app:business`): the business app (`apps/business`)
- `[web]` (`app:web`): the websites on GitHub Pages: landing page, customer site and business site (no folder yet)
- `[api]` (`area:api`): `services/api`
- `[infra]` (`area:infra`): CI, hosting

**Status and priority live on the [Qvitto board](https://github.com/users/axelsvardh/projects/1).** Every spec is an issue there. This file only lists which number belongs to which spec.

| # | Spec | Issue |
|---|---|---|
| 001 | Business accounts and store access | #5 |
| 002 | Staging environment | #6 |
| 003 | Stay signed in | #1 |
| 004 | Line items reach the app (RADER) | #7 |
| 005 | Real card linking (Stripe SetupIntent), and fix the "vi ser aldrig kortnummer" copy conflict | #8 |
| 006 | Forgot password | #9 |
| 007 | Share receipt as PDF (DELA PDF) | #10 |
| 008 | Business app shell and login | #11 |
| 009 | CI and review notifications | #3 |
| 010 | API hardening before staging | #13 |
| 011 | TestFlight builds for the customer app (needs an Apple Developer account) | #12 |
| — | Later: BankID, öppet köp from store data, export to bookkeeping | — |

## Board columns
- **Idea:** a line here, no spec yet.
- **Spec draft:** spec being written, or it has open questions.
- **Ready:** spec approved. Claude takes the top card.
- **In progress:** Claude is working on it.
- **In review:** PR open, CI green, waiting for Axel.
- **Done:** merged.

Priority is the `Priority` field (P1–P3), then the card order within a column. Areas are the `app:*` and `area:*` labels.

Customer app reference for how it works today: `apps/customer/design-handoff/SCREENS.md`.
