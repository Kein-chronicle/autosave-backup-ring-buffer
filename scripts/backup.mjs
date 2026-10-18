/**
 * Plan the next autosave of a bounded recovery ring. Pure function: it returns a plan, it touches no storage.
 *
 * planBackup(entries, keep, now, {inPlace = false})
 *   entries  [{key, savedAt}]  the current index
 *   keep     how many snapshots to retain AFTER this one (1..1000)
 *   now      current time (ms); must not be earlier than the newest snapshot
 * returns {key, entries, dropped}
 *   key      where to write the new snapshot
 *   entries  the new index, newest first
 *   dropped  keys to delete AFTER the new snapshot and the new index are durable
 *
 * Default (inPlace: false) always writes to a FRESH key, so the old snapshots stay intact until the new one is safely stored: crash-safe, but a ring
 * can briefly hold keep + 1 snapshots. inPlace: true reuses the slot of the oldest snapshot instead (a fixed number of slots), which overwrites it
 * in place and is NOT crash-safe; with keep = 1 it overwrites the only snapshot there is.
 */
export function planBackup(entries,keep,now,{inPlace=false}={}) {
  if(!Array.isArray(entries)||!Number.isInteger(keep)||keep<1||keep>1000||!Number.isFinite(now))throw new TypeError('invalid backup policy');
  if(entries.some(e=>!e||typeof e.key!=='string'||!e.key||!Number.isFinite(e.savedAt))||new Set(entries.map(e=>e.key)).size!==entries.length)throw new TypeError('invalid backup index');
  const sorted=[...entries].sort((a,b)=>b.savedAt-a.savedAt||a.key.localeCompare(b.key));
  if(sorted.length && now<sorted[0].savedAt)throw new RangeError('clock moved backwards');
  const retained=sorted.slice(0,keep-1),used=new Set(entries.map(e=>e.key));
  let key=inPlace?sorted[keep-1]?.key:undefined;
  if(key===undefined){let i=0;while(used.has(`backup-${i}`))i++;key=`backup-${i}`;}
  const next=[{key,savedAt:now},...retained];
  return {key,entries:next,dropped:sorted.filter(e=>!next.some(n=>n.key===e.key)).map(e=>e.key)};
}
