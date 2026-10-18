# autosave-backup-ring-buffer

**Plan a bounded ring of recovery snapshots: deterministic slot reuse, explicit dropped keys, and rejection of clocks that went backwards.**

[![test](https://github.com/Kein-chronicle/autosave-backup-ring-buffer/actions/workflows/test.yml/badge.svg)](https://github.com/Kein-chronicle/autosave-backup-ring-buffer/actions/workflows/test.yml) ![license](https://img.shields.io/badge/license-MIT-blue.svg) ![dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)

## Why

Editors keep the last N autosaves. The mistake is deleting or overwriting the oldest before the new one is durable. This returns a plan - which fresh key to write and which entries to delete afterwards - and leaves the storage transaction to you.

## Install

**As a Claude Code skill** (Claude uses it when the task matches the skill description):

```sh
git clone https://github.com/Kein-chronicle/autosave-backup-ring-buffer.git ~/.claude/skills/backup-ring-plan
```

For a single project, clone into `<project>/.claude/skills/backup-ring-plan` instead, then start a new Claude Code session.

**As a library** (Node.js 22+, no dependencies):

```sh
npm install github:Kein-chronicle/autosave-backup-ring-buffer
```

or copy the one file you need: `scripts/backup.mjs` is self-contained.

**Requires:** Node.js 22+.

## Quick start

Run the quickstart:

```console
$ node examples/quickstart.mjs
t=1000  write -> backup-0  dropped: []  index: backup-0
t=2000  write -> backup-1  dropped: []  index: backup-1, backup-0
t=3000  write -> backup-2  dropped: []  index: backup-2, backup-1, backup-0
t=4000  write -> backup-3  dropped: ["backup-0"]  index: backup-3, backup-2, backup-1
t=5000  write -> backup-0  dropped: ["backup-1"]  index: backup-0, backup-3, backup-2
clock went backwards -> clock moved backwards
```

The output above is real: it is produced by the files in `examples/`.

## API

```js
import { planBackup } from 'autosave-backup-ring-buffer';

let index = [];                            // [{ key, savedAt }]
const plan = planBackup(index, 3, Date.now());   // keep 3 snapshots
// plan.key      -> a FRESH key to write ('backup-0', 'backup-1', ...; never an existing one)
// plan.entries  -> the new index, newest first
// plan.dropped  -> keys to delete AFTER the new snapshot and index are durable
index = plan.entries;
```

Throws on `keep` outside 1..1000, duplicate keys, non-finite times and a clock earlier than the newest snapshot. The ring can briefly hold `keep + 1` snapshots. `planBackup(entries, keep, now, { inPlace: true })` reuses the oldest slot instead (a fixed slot count): that overwrites in place and is not crash-safe, and with `keep = 1` it overwrites the only snapshot.

## Limits

- A plan only: store the snapshot and the index, then delete the `dropped` keys. No IndexedDB, encryption or filesystem code is included.
- Default mode needs up to `keep + 1` slots; `inPlace` mode saves a slot at the cost of crash safety.

## Related projects

These solve neighbouring problems; use them when they fit better.

- **logrotate, restic and borg retention policies**: file-backup retention; this is the in-app autosave case

## More from the same collection

Small, tested tools that grew out of running AI agents and game/app pipelines for months:

- [**pdf-page-range-parser**](https://github.com/Kein-chronicle/pdf-page-range-parser): Parse "1-3, 5, 8-" page selections into exact ranges without silently sorting or deduplicating, and reject anything ambiguous.
- [**pdf-annotation-rotation**](https://github.com/Kein-chronicle/pdf-annotation-rotation): Rotate PDF/canvas annotations (boxes, lines, ink, source masks) a quarter turn in display coordinates, without mutating the input.
- [**pdf-text-position-table-extract**](https://github.com/Kein-chronicle/pdf-text-position-table-extract): Rebuild a rectangular table from positioned text fragments (x, baseline, size, text), keeping empty cells in place.

## Development

```sh
node --test tests/run.mjs
```

The tests include inputs that are supposed to be rejected, so a green run also shows the checks can fail. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT. See [LICENSE](LICENSE).

If this saved you a debugging session, a star helps other people find it. Bug reports and failing test cases are even better.

<sub>Keywords: backup, autosave, retention, indexeddb, javascript, esm, local-first, zero-dependencies</sub>
