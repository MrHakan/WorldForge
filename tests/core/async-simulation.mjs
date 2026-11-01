import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

global.window = global;
for (const file of ['src/core/engine.js', 'src/core/history-engine.js', 'src/core/society-engine.js', 'src/features/endless/endless-engine.js']) {
  vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
}
const E = WorldForgeEngine, H = WorldForgeHistory, S = WorldForgeSociety, X = WorldForgeEndless;
X.setBaseSimulator(S.simulateYears.bind(S));
const settings = { seed: 'ASYNC-LOCK-51', width: 120, height: 70, seaLevel: .53, age: 'mature', settlementTarget: 20, kingdomTarget: 4 };
const create = () => { const world = E.generateWorld(settings); X.initialize(world); return world; };
// requestAnimationFrame can stop entirely in hidden tabs; async simulation must not depend on it.
global.requestAnimationFrame = () => { throw new Error('Animation frame used for simulation scheduling'); };
const world = create();
const running = X.simulateYearsAsync(world, 6, { batchSize: 2 });
assert.equal(X.isRunning(world), true);
assert.equal(X.absoluteYear(world), 0, 'yield before the first year so controls can paint');
await assert.rejects(X.simulateYearsAsync(world, 3), /already running/);
assert.throws(() => X.simulateYears(world, 1), /already running/);
const restored = E.deserialize(E.serialize(world));
X.initialize(restored);
assert.equal(restored.endless.async.running, false, 'runtime locks must not survive save/import');
assert.equal(X.isRunning(world), true, 'initializing a save must not clear the live job');
const other = create();
await Promise.all([running, X.simulateYearsAsync(other, 6, { batchSize: 1 })]);
assert.equal(X.isRunning(world), false);
assert.equal(H.historyFingerprint(world), H.historyFingerprint(other), 'chunking must preserve history');
assert.equal(S.societyFingerprint(world), S.societyFingerprint(other), 'chunking must preserve society');
const cancelled = await X.simulateYearsAsync(world, 30, { onProgress() { X.cancel(world); } });
assert.equal(cancelled.done, 1, 'cancellation should stop at an annual boundary');
assert.equal(cancelled.cancelled, true);
const controller = new AbortController();
controller.abort();
const aborted = await X.simulateYearsAsync(world, 10, { signal: controller.signal });
assert.equal(aborted.done, 0);
assert.equal(aborted.cancelled, true);
await assert.rejects(X.simulateYearsAsync(world, 2, { onProgress() { throw new Error('progress failure'); } }), /progress failure/);
assert.equal(X.isRunning(world), false, 'errors release the runtime lock');
await X.simulateYearsAsync(world, 1);
assert.equal(world.endless.async.running, false);
let yields = 0;
global.scheduler = { yield() { yields++; return new Promise(resolve => setTimeout(resolve, 0)); } };
await X.simulateYearsAsync(world, 3, { batchSize: 1 });
assert.equal(yields, 3, 'use scheduler.yield when available');
console.log('Async ownership, cancellation, save recovery, yielding and determinism passed');


const rebased=create();rebased.history.snapshotInterval=7;rebased.history.currentYear=14;rebased.society.currentYear=14;rebased.endless.epochOffset=3000;
rebased.history.snapshots=[0,7,14].map(year=>({...structuredClone(rebased.history.snapshots[0]),year}));
X.maintenance(rebased);assert.ok(rebased.history.snapshots.some(s=>s.year===7),'recent replay must respect its local interval after epoch rebasing');
console.log('Custom replay intervals survive epoch offsets');
