import { planBackup } from '../scripts/backup.mjs';

// Keep 3 snapshots. Every save writes to a FRESH key; the keys in `dropped` are deleted only after the new snapshot and index are stored.
let index = [];
for (const now of [1000, 2000, 3000, 4000, 5000]) {
  const plan = planBackup(index, 3, now);
  index = plan.entries;
  console.log(`t=${now}  write -> ${plan.key.padEnd(9)} dropped: ${JSON.stringify(plan.dropped)}  index: ${index.map(e => e.key).join(', ')}`);
}
try { planBackup(index, 3, 100); } catch (e) { console.log('clock went backwards ->', e.message); }
