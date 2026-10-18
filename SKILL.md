---
name: backup-ring-plan
description: Plan bounded backup retention with deterministic slot reuse and explicit dropped keys. Use when rotating local recovery snapshots.
---

# backup-ring-plan

1. Confirm the input contract below; preserve source data.
2. Import the functions in `scripts/backup.mjs`. Node.js 22+ or modern browser ES modules; no external dependencies.
3. Run `node --test tests/run.mjs` from this skill folder; test assertions are executable usage examples.
4. Show validation errors to the caller. Never translate a rejected operation into an empty successful result.
5. Apply the returned plan only through the host application's storage or rendering boundary.

## Contract and limits

The function returns a plan only. By default it writes to a fresh key (so old snapshots survive until the new one is stored) and lists `dropped` keys to delete afterwards; commit snapshot and index in one storage transaction, then delete. `inPlace: true` reuses the oldest slot instead, which overwrites in place and is not crash-safe (with `keep = 1` it overwrites the only snapshot). Rejects backward clocks and duplicate keys. Does not implement IndexedDB, encryption or filesystem writes.

## Verification

Copy this complete folder to install it. Test both normal input and rejection cases with `node --test tests/run.mjs`. No private repository, API key or service is needed.
