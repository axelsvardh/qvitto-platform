// TEMPORARY (spec 009 T3): fails on purpose to prove CI goes red and no
// ready-for-review comment is posted. Reverted in the next commit.
test("fails on purpose", () => {
  expect(1).toBe(2);
});
