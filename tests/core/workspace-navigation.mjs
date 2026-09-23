import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

class FakeElement {
  constructor(id = '', className = '') {
    this.nodeType = 1;
    this.id = id;
    this.className = className;
    this.dataset = {};
    this.hidden = false;
    this.parentElement = null;
    this.classList = {
      contains: name => className.split(/\s+/).includes(name),
      toggle() {}
    };
    this.attributes = {};
    this._innerHTML = '';
    this.innerHTMLWrites = 0;
  }

  set innerHTML(value) {
    this._innerHTML = value;
    this.innerHTMLWrites += 1;
  }

  get innerHTML() {
    return this._innerHTML;
  }

  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  matches(selector) {
    return selector === `#${this.id}` || selector.split(',').some(part => part.trim() === `.${this.className}`);
  }

  querySelector() {
    return null;
  }

  insertAdjacentHTML() {}

  closest(selector) {
    if (selector === '[hidden]' && this.hidden) return this;
    return this.parentElement?.closest?.(selector) || null;
  }
}

const layout = new FakeElement('', 'layout');
const topbar = new FakeElement('', 'topbar');
const subtabs = new FakeElement('workspaceSubtabs');
const tabs = new FakeElement('workspaceTabs');
topbar.insertAdjacentHTML = () => {};
const selectors = new Map([
  ['.layout', layout],
  ['.topbar', topbar],
  ['#workspaceTabs', tabs],
  ['#workspaceSubtabs', subtabs]
]);
const events = [];
const frames = [];
let observerInstance;

const document = {
  hidden: false,
  documentElement: { dataset: {} },
  querySelector: selector => selectors.get(selector) || null,
  querySelectorAll: () => [],
  addEventListener() {}
};

class FakeMutationObserver {
  constructor(callback) {
    this.callback = callback;
    observerInstance = this;
  }

  observe(target, options) {
    this.target = target;
    this.options = options;
  }

  disconnect() {}
}

class FakeEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail;
  }
}

const window = {
  dispatchEvent: event => events.push(event),
  WorldForgeWorkspaceNavigation: null
};
const context = {
  document,
  window,
  localStorage: { getItem: () => null, setItem() {} },
  MutationObserver: FakeMutationObserver,
  Event: FakeEvent,
  CustomEvent: FakeEvent,
  requestAnimationFrame: callback => {
    frames.push(callback);
    return frames.length;
  },
  setTimeout() {}
};

vm.runInNewContext(fs.readFileSync('src/app/workspace-navigation.js', 'utf8'), context, { filename: 'workspace-navigation.js' });
const navigation = window.WorldForgeWorkspaceNavigation;

assert.ok(navigation, 'workspace navigation API should be available');
assert.equal(observerInstance.target, layout, 'the shared observer should watch only the application layout');
assert.equal(observerInstance.options.childList, true);
assert.equal(observerInstance.options.subtree, true);
assert.equal(observerInstance.target, document.querySelector('.layout'));

const moduleRoutes = [
  [new FakeElement('artifactPanel', 'artifact-panel'), 'culture', 'heritage'],
  [new FakeElement('calendarClimatePanel', 'calendar-panel'), 'discovery', 'calendar'],
  [new FakeElement('chroniclePressPanel', 'chronicle-press-panel'), 'discovery', 'press'],
  [new FakeElement('cityOverviewPanel', 'city-overview-panel'), 'places', 'cities'],
  [new FakeElement('creatorSuite', 'creator-suite-panel'), 'adventure', 'creator'],
  [new FakeElement('emergencyPanel', 'emergency-panel'), 'places', 'emergency'],
  [new FakeElement('militaryPanel', 'military-panel'), 'realms', 'military'],
  [new FakeElement('resourcePanel', 'resource-panel'), 'factions', 'economy'],
  [new FakeElement('treasuryPanel', 'treasury-panel'), 'realms', 'treasury'],
  [new FakeElement('warfarePeaceSection'), 'realms', 'warfare'],
  [new FakeElement('worldbuildingPanel', 'worldbuilding-panel'), 'worldbuilding', 'atelier']
];
for (const [panel, category, page] of moduleRoutes) {
  const route = navigation.resolvePanelPage(panel);
  assert.equal(route.category, category, `${panel.id} should appear under ${category}`);
  assert.equal(route.page, page, `${panel.id} should open the ${page} page`);
}

navigation.refresh();
const firstSubtabMarkup = subtabs.innerHTML;
assert.ok(firstSubtabMarkup.includes('data-workspace-page="generator"'));
assert.equal(subtabs.innerHTMLWrites, 1);
navigation.refresh();
assert.equal(subtabs.innerHTMLWrites, 1, 'unchanged subtabs should not be rebuilt');

while (frames.length) frames.shift()();
let structureCallbacks = 0;
navigation.onStructureChange('#upstreamPanel', () => { structureCallbacks += 1; });

const unrelatedNode = new FakeElement('tableBody');
observerInstance.callback([{ target: layout, addedNodes: [unrelatedNode], removedNodes: [] }]);
assert.equal(structureCallbacks, 0, 'unrelated content changes should be ignored');
assert.equal(frames.length, 0, 'unrelated content changes should not schedule navigation work');

const upstreamPanel = new FakeElement('upstreamPanel', 'panel');
observerInstance.callback([{ target: layout, addedNodes: [upstreamPanel], removedNodes: [] }]);
assert.equal(structureCallbacks, 1, 'subscribers should be notified when their upstream panel is inserted');
assert.equal(frames.length, 1, 'new panels should schedule one navigation refresh');

const page = new FakeElement('cityActivitySection');
observerInstance.callback([{ target: layout, addedNodes: [page], removedNodes: [] }]);
assert.equal(frames.length, 1, 'multiple structural changes in one frame should be coalesced');

console.log('workspace navigation lifecycle checks passed');
