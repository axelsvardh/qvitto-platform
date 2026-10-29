# Qvitto platform: instructions for Claude

Qvitto is a Swedish digital receipt platform. A customer pays by card in a store, Qvitto matches the store's receipt to the payment, and the receipt shows up in the customer app. Businesses (stores that issue receipts) get their own app.

## Repo layout
- `apps/customer`: customer app (Expo 54, expo-router 6). Swedish UI. `design-handoff/SCREENS.md` describes every screen as it works today.
- `apps/business`: business app (empty, waiting for design).
- `services/api`: Express 5, Prisma 6, PostgreSQL. Plain JS (ESM) for now.
- `packages/shared`: shared types and design tokens (empty).
- `specs/`: source of truth. Read `constitution.md` and `glossary.md` before any work. `BACKLOG.md` lists all specs.

## How we work (spec-driven)
0. Tickets live on the [Qvitto board](https://github.com/users/axelsvardh/projects/1), one issue per spec. "Next ticket" means the top card in **Ready** (highest priority first). Move a card to **In progress** when starting and to **In review** when the PR is open with green CI. A new spec gets a new issue on the board and a row in `specs/BACKLOG.md`.
1. No spec, no PR. Every change comes from `specs/NNN-name/` (`spec.md`, `plan.md`, `tasks.md`).
2. Work through `tasks.md` in order and tick tasks off in the same PR.
3. Every acceptance criterion gets a test named after it (`AC3: ...`).
4. Only open a PR when lint and all tests pass locally. CI must be green too.
5. One PR per spec. The title is `NNN: <spec title>`, the body links the issue (`Closes #N`) and lists the ACs with how each is tested.
6. Claude opens PRs as **axelsvardh**, so GitHub can't request a review; CI's ready-for-review mention notifies Axel instead. Never merge a PR yourself.
7. If the spec and the code disagree, stop and ask. Don't silently change the spec.

## Conventions
- Code, specs and commits are in English. UI copy is in Swedish.
- Commit messages: `type(area): message`, e.g. `feat(customer): stay signed in`.
- Never commit `.env` or secrets. Never add hard-coded fallback secrets.
- Use the GitHub account **axelsvardh** (personal) for everything in this repo, never a work account.

## Commands
- Install: `npm install` from the repo root (npm workspaces).
- API: `npm run api` · Customer app: `npm run customer`
