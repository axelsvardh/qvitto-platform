# 009: Tasks

- [x] **T1 `[infra]` CI workflow:** a `customer` job running lint and tests on PRs and on pushes to `main`. *(AC1, AC2, AC5, AC6)*
- [x] **T2 `[infra]` Ready-for-review mention:** a comment job that needs `customer`, skips drafts and pushes, and mentions the repo owner. *(AC3, AC4, AC6)*
- [x] **T3 `[infra]` Prove it on this PR:** a green run with the comment, Axel confirms the phone push, and a temporary failing commit shows red with no comment, then is reverted. *(AC1–AC4)*
- [ ] **T4 `[infra]` After merge:** check that the `main` run is green with no comment. *(AC5)*
