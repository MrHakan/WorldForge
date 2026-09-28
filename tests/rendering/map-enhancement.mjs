import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const mapWrap = { appendChild(element) { element.isConnected = true; } };
const scale = { textContent: '' };
let toolbar = null;
const document = {
  getElementById(id) {
    if (id === 'mapWrap') return mapWrap;
    if (id === 'strategicMapTools') return toolbar;
    if (id === 'strategicScale') return scale;
    return null;
  },
  createElement() {
    toolbar = {
      id: '',
      className: '',
      innerHTML: '',
      isConnected: false,
      querySelectorAll() { return []; }
    };
    return toolbar;
  }
};
const localStorage = { getItem() { return null; }, setItem() {} };
const strokeStyles = [];
const labels = [];
const context = {
  save() {},
  restore() {},
  translate() {},
  rotate() {},
  beginPath() {},
  arc() {},
  moveTo() {},
  lineTo() {},
  quadraticCurveTo() {},
  fillRect() {},
  stroke() { strokeStyles.push(this.strokeStyle); },
  strokeText() {},
  fillText(text) { labels.push(String(text)); },
  setLineDash() {}
};

class WorldRenderer {
  draw() { this.baseDrawCalls = (this.baseDrawCalls || 0) + 1; }
  setWorld(world) { this.world = world; }
}

const window = { WorldRenderer };
const source = fs.readFileSync('src/rendering/map-enhancement.js', 'utf8');
vm.runInNewContext(source, { window, document, localStorage, setTimeout() {} }, { filename: 'map-enhancement.js' });

function makeWorld() {
  const width = 40;
  const height = 20;
  const counters = { elevationReads: 0, facilityReads: 0 };
  const elevation = new Proxy(new Array(width * height).fill(.1), {
    get(target, property, receiver) {
      const key = String(property);
      if (Number.isInteger(Number(key)) && key === String(Number(key))) counters.elevationReads++;
      return Reflect.get(target, property, receiver);
    }
  });
  const settlements = Array.from({ length: 12 }, (_, id) => ({
    id,
    name: 'Settlement ' + id,
    x: 2 + id * 3,
    y: 3 + (id % 3) * 4,
    population: 100 + id,
    kingdomId: 0
  }));
  const facilities = new Proxy([
    { settlementId: 0, status: 'active', typeId: 'shipyard' },
    { settlementId: 1, status: 'inactive', typeId: 'shipyard' }
  ], {
    get(target, property, receiver) {
      const key = String(property);
      if (Number.isInteger(Number(key)) && key === String(Number(key))) counters.facilityReads++;
      return Reflect.get(target, property, receiver);
    }
  });
  return {
    counters,
    settings: { width, height, seaLevel: .5 },
    layers: { elevation },
    settlements,
    kingdoms: [{ id: 0, name: 'Test Realm', shortName: 'TEST', capitalId: 0 }],
    institutions: { facilities }
  };
}

function makeRenderer(world) {
  const renderer = Object.create(WorldRenderer.prototype);
  renderer.world = world;
  renderer.historyView = {
    isPresent: true,
    settlementKingdomIds: world.settlements.map(() => 0),
    settlementPopulation: world.settlements.map(settlement => settlement.population),
    realms: world.kingdoms
  };
  renderer.mode = 'political';
  renderer.camera = { x: .5, y: .5, zoom: 3 };
  renderer.canvas = { width: 1200, height: 900 };
  renderer.dpr = 1;
  renderer.ctx = context;
  renderer.worldToScreen = (x, y) => ({ x: x * 18, y: y * 18 });
  renderer.viewRealms = () => renderer.historyView?.realms || renderer.world?.kingdoms || [];
  renderer.realm = id => renderer.viewRealms().find(realm => realm.id === id) || null;
  return renderer;
}

const world = makeWorld();
const renderer = makeRenderer(world);
renderer.draw();

const readsAfterFirstDraw = world.counters.elevationReads;
const facilitiesAfterFirstDraw = world.counters.facilityReads;
assert.ok(readsAfterFirstDraw > 0, 'coastal markers should inspect terrain when a world is first drawn');
assert.equal(facilitiesAfterFirstDraw, world.institutions.facilities.length, 'facilities should be scanned once for a map draw');
assert.ok(strokeStyles.includes('rgba(121,203,221,.95)'), 'an active shipyard should receive the major port marker');
assert.ok(labels.includes('Settlement 0 · 100'), 'settlement labels should include current-view population');

renderer.camera.x = .52;
renderer.draw();
assert.equal(world.counters.elevationReads, readsAfterFirstDraw, 'terrain coast data should be reused during camera redraws');
assert.equal(world.counters.facilityReads - facilitiesAfterFirstDraw, world.institutions.facilities.length, 'facilities should not be rescanned for every settlement');
assert.equal(strokeStyles.filter(style => style === 'rgba(121,203,221,.95)').length, 2, 'shipyard markers should remain visible on redraw');

renderer.historyView = {
  ...renderer.historyView,
  settlementPopulation: [999, ...world.settlements.slice(1).map(settlement => settlement.population)]
};
renderer.draw();
assert.ok(labels.includes('Settlement 0 · 999'), 'a new history view should refresh cached settlement labels');
assert.equal(world.counters.elevationReads, readsAfterFirstDraw, 'history changes should not rebuild static terrain data');

const secondWorld = makeWorld();
renderer.world = secondWorld;
renderer.historyView = {
  isPresent: true,
  settlementKingdomIds: secondWorld.settlements.map(() => 0),
  settlementPopulation: secondWorld.settlements.map(settlement => settlement.population),
  realms: secondWorld.kingdoms
};
renderer.draw();
assert.ok(secondWorld.counters.elevationReads > 0, 'a different world should build its own terrain index');

console.log('map enhancement performance smoke passed');
