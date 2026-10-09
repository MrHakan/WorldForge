import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class FakeElement {
  constructor(id) {
    this.id = id;
    this.listeners = [];
    this.dataset = {};
    this.classList = { contains: name => name === 'worldbuilding-scene-controls' && id === 'controls' };
    this.previousElementSibling = null;
    this.removed = false;
  }

  addEventListener(type, handler, options) {
    this.listeners.push({ type, handler, signal: options?.signal });
  }

  insertAdjacentHTML() {
    this.previousElementSibling = new FakeElement('controls');
  }

  remove() {
    this.removed = true;
  }

  querySelector() {
    return null;
  }

  querySelectorAll() {
    return [];
  }
}

let preview = new FakeElement('worldbuildingPreview');
let districtHost = new FakeElement('worldbuildingDistricts');
const settlement = new FakeElement('worldbuildingSettlement');
const document = {
  querySelector(selector) {
    return ({
      '#worldbuildingPreview': preview,
      '#worldbuildingDistricts': districtHost,
      '#worldbuildingSettlement': settlement
    })[selector] || null;
  }
};

const observers = [];
class FakeMutationObserver {
  constructor(callback) {
    this.callback = callback;
    this.targets = [];
    this.disconnected = false;
    observers.push(this);
  }

  observe(target) {
    this.targets.push(target);
  }

  disconnect() {
    this.disconnected = true;
  }
}

let subscription;
const window = {
  WorldForgeWorldbuilding: { settlementView: () => null },
  WorldForgePixelRenderer: {},
  WorldForgeWorldbuildingUI: { state: { world: null, settlement: null } },
  WorldForgeWorkspaceNavigation: {
    onStructureChange(selectors, callback) {
      subscription = { selectors, callback };
    }
  }
};

vm.runInNewContext(
  fs.readFileSync('src/features/worldbuilding/district-inspector.js', 'utf8'),
  { window, document, MutationObserver: FakeMutationObserver, AbortController, setTimeout: callback => callback() },
  { filename: 'district-inspector.js' }
);

assert.ok(subscription, 'district inspector should subscribe to workspace structure changes');
assert.match(subscription.selectors, /#worldbuildingDistricts/, 'card host replacements must trigger remount');
assert.match(subscription.selectors, /#worldbuildingPreview/, 'preview replacements must trigger remount');
assert.equal(preview.listeners.length, 2, 'initial preview listeners should be installed');
assert.equal(districtHost.listeners.length, 3, 'initial district card listeners should be installed');
assert.equal(observers.length, 1);

const oldHost = districtHost;
const oldPreview = preview;
const oldControls = preview.previousElementSibling;
districtHost = new FakeElement('worldbuildingDistricts');
subscription.callback();

assert.equal(observers.length, 2, 'replacing only the card host must remount');
assert.equal(observers[0].disconnected, true, 'old observer must disconnect');
assert.equal(oldControls.removed, true, 'old controls must be removed');
assert.ok(oldHost.listeners.every(listener => listener.signal.aborted), 'old card listeners must be aborted');
assert.ok(oldPreview.listeners.slice(0, 2).every(listener => listener.signal.aborted), 'old preview listeners must be aborted');
assert.equal(districtHost.listeners.length, 3, 'replacement card host must receive listeners');
assert.ok(districtHost.listeners.every(listener => !listener.signal.aborted));
assert.equal(settlement.listeners.length, 2, 'settlement change handler should be rebound once');

subscription.callback();
assert.equal(observers.length, 2, 'unchanged preview and host must not remount');
assert.equal(districtHost.listeners.length, 3, 'unchanged host must not accumulate handlers');

const previousHost = districtHost;
preview = new FakeElement('worldbuildingPreview');
subscription.callback();
assert.equal(observers.length, 3, 'preview replacement must still remount');
assert.ok(previousHost.listeners.every(listener => listener.signal.aborted), 'previous host listeners must be cleaned up');
assert.equal(preview.listeners.length, 2, 'new preview must receive listeners');
console.log('District inspector host and preview remount regression tests passed.');
