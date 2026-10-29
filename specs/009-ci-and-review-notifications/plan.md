# 009: Plan

## Today
- No `.github/` folder. Nothing runs on GitHub.
- `apps/customer` has `npm run lint` (`expo lint`) and `npm test` (jest-expo, from spec 003).
- `services/api` has no tests or lint.
- The root `package-lock.json` exists (from spec 003), so `npm ci` works.

## Changes
1. **`.github/workflows/ci.yml`**, one workflow named `CI`:
   - **Triggers:** `pull_request` (opened, synchronize, reopened, ready_for_review) on any base branch, so stacked PRs are checked too, and `push` to `main` (AC1, AC5).
   - **`customer` job:** checkout, Node 24 with the npm cache, `npm ci`, `npm run lint` and `npm test -- --ci` in `apps/customer` (AC1, AC2). Lint warnings don't fail the job; errors do.
   - **`ready-for-review` job:** `needs: customer`, so it only runs when that job passed (AC4). It skips drafts and pushes (AC4, AC5). It runs `gh pr comment` with `@${{ github.repository_owner }}` and the short head SHA (AC3).
   - **Permissions:** `contents: read` for the whole workflow, plus `pull-requests: write` only on the comment job (AC6).
   - **Concurrency:** one run per PR. A new push cancels the old run, so a stale green never posts.
2. **Why a mention:** GitHub doesn't notify you about your own actions, and Claude acts as `axelsvardh`. The comment comes from `github-actions[bot]`, so the @mention counts as someone else mentioning Axel. The GitHub app pushes "Direct mentions" by default.
3. **When a new job is added** (API tests from spec 001, for example), add it to `ready-for-review`'s `needs`.

## How the ACs are proven
This PR is the test (see the open question in spec.md). Each AC is checked on this PR's own runs, and the PR description links them:
- **AC1, AC3:** the first push runs `CI`, it goes green, the comment appears, and Axel confirms the push reached his phone.
- **AC2, AC4:** a temporary commit with a failing test makes `CI` red with no comment. It's then reverted.
- **AC5:** the run after merging to `main`. This one is checked after merge.
- **AC6:** read the workflow file.

## Manual follow-up (not code)
Once CI has been green for a few PRs: GitHub → Settings → Branches → protect `main`, require the `CI / Customer app` check, and require a PR before merging.

## Risks
- **The mention may not reach the phone.** Axel's GitHub app settings could have mentions turned off. If they're on and it still doesn't arrive, fall back to a separate bot account for Claude, so review requests notify natively.
- **Comment noise.** There's one comment per green push. That's fine at the pilot's pace. If it gets noisy, edit a single comment instead.
