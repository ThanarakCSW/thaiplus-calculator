import { test } from "node:test";
import assert from "node:assert/strict";
import { bangkokDate, freshDraft, restoreDraft } from "./draft.ts";

test("draft restores exactly on the same Bangkok day", () => {
  const draft = { ...freshDraft("2026-09-30"), balance: "50.25", purchase: "500." };
  assert.deepEqual(restoreDraft(JSON.stringify(draft), "2026-09-30"), { draft, newDay: false });
});

test("Thai midnight clears yesterday's draft and restores the daily allowance", () => {
  assert.equal(bangkokDate(new Date("2026-09-30T16:59:59Z")), "2026-09-30");
  assert.equal(bangkokDate(new Date("2026-09-30T17:00:00Z")), "2026-10-01");
  const previous = { ...freshDraft("2026-09-30"), balance: "0", purchase: "500" };
  assert.deepEqual(restoreDraft(JSON.stringify(previous), "2026-10-01"), { draft: freshDraft("2026-10-01"), newDay: true });
});

test("corrupt, unsupported and malformed storage cannot break the calculator", () => {
  for (const raw of [null, "broken-json", "null", "[]", '{"version":9}', JSON.stringify({ ...freshDraft("2026-09-30"), purchase: 500 }), JSON.stringify({ ...freshDraft("2026-09-30"), balance: "0".repeat(33) })]) {
    assert.deepEqual(restoreDraft(raw, "2026-09-30"), { draft: freshDraft("2026-09-30"), newDay: false });
  }
});
