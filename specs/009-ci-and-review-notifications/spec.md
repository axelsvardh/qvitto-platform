# 009: CI and review notifications

Status: READY FOR REVIEW (approved when the PR is merged)
Owner: Axel
Areas: infra

## Why
Nothing runs the tests except the laptop that wrote the code. CLAUDE.md says a PR needs green CI, but there is no CI. Claude also opens PRs as `axelsvardh`, so GitHub sees Axel as the author and never tells him a PR is waiting. He has to go and look.

## Goal
Every PR runs lint and tests on GitHub. When they pass, Axel gets a push on his phone through the GitHub app saying the PR is ready for review.

## Out of scope
- Deploying anything. That's spec 002, which will reuse these checks.
- API tests. The API has none yet. Its job is added when spec 001 brings the first tests.
- Branch protection rules. They're a repo setting, not code. Turn them on by hand once CI is trusted (see Plan).
- A separate bot account for Claude. It's only needed if the mention below doesn't reach the phone.

## Acceptance criteria
- **AC1**: Given a PR (or a new push to one), then a `CI` workflow runs lint and the tests for the customer app.
- **AC2**: Given a lint error or a failing test, then the `CI` check is red and the PR shows it as failing.
- **AC3**: Given a non-draft PR whose checks all pass, then `github-actions[bot]` comments on the PR mentioning the repo owner (`@axelsvardh`) with the commit it checked, and the GitHub app sends Axel a push.
- **AC4**: Given failing checks, or a draft PR, then no ready-for-review comment is posted.
- **AC5**: Given a push to `main`, then the same checks run. No comment is posted.
- **AC6**: The workflow uses only the built-in `GITHUB_TOKEN` with the least permissions it needs. No secrets are added to the repo.

## Data
No personal data. The comment contains a GitHub username and a commit SHA.

## Open questions
1. **Tests for infra ACs.** Constitution §1 says every AC becomes an automated test. Here the "test" is the workflow running on real PRs. The plan proves each AC with a recorded run on this PR instead of a unit test. Is that acceptable for infra specs, or should the constitution get an infra exception?
