(() => {
  'use strict';

  if (typeof window === 'undefined' || !window.WorldRenderer || window.__worldforgeStrategicMap) return;
  window.__worldforgeStrategicMap = true;

  const Renderer = window.WorldRenderer;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const EMPTY_VIEW = Object.freeze({});
  const worldIndexes = new WeakMap();
  const INDUSTRY_TYPES = new Set(['foundry', 'smithy', 'university']);
  let toolbarElement = null;
  let scaleElement = null;

  const preferences = { labels: true, hubs: true, supply: true, finance: true };
  try {
    Object.assign(preferences, JSON.parse(localStorage.getItem('worldforge-map-v21') || '{}'));
  } catch {}

  function savePreferences() {
    try {
      localStorage.setItem('worldforge-map-v21', JSON.stringify(preferences));
    } catch {}
  }

  function ensureToolbar() {
    if (toolbarElement && toolbarElement.isConnected !== false) return;

    toolbarElement = document.getElementById('strategicMapTools');
    if (toolbarElement) {
      scaleElement = document.getElementById('strategicScale');
      return;
    }

    const wrap = document.getElementById('mapWrap');
    if (!wrap) return;

    const bar = document.createElement('div');
    bar.id = 'strategicMapTools';
    bar.className = 'strategic-map-tools';
    bar.innerHTML = '<span>STRATEGIC MAP</span>'
      + [['labels', 'Labels'], ['hubs', 'Hubs'], ['supply', 'Supply'], ['finance', 'Fiscal stress']]
        .map(([key, label]) => '<label><input type="checkbox" data-map-pref="' + key + '" '
          + (preferences[key] ? 'checked' : '') + '>' + label + '</label>')
        .join('')
      + '<b id="strategicScale">—</b>';

    wrap.appendChild(bar);
    toolbarElement = bar;
    scaleElement = document.getElementById('strategicScale');

    bar.querySelectorAll('[data-map-pref]').forEach(input => {
      input.onchange = () => {
        preferences[input.dataset.mapPref] = input.checked;
        savePreferences();
        const renderer = window.worldRenderer || window.renderer;
        if (renderer && renderer.draw) renderer.draw();
      };
    });
  }

  function owner(renderer, settlement) {
    return renderer.historyView?.settlementKingdomIds?.[settlement.id] ?? settlement.kingdomId;
  }

  function population(renderer, settlement) {
    return Number(renderer.historyView?.settlementPopulation?.[settlement.id] ?? settlement.population ?? 0);
  }

  function isCoastal(world, settlement) {
    const width = world.settings.width;
    const height = world.settings.height;
    const seaLevel = world.settings.seaLevel;
    const centerX = Math.round(settlement.x);
    const centerY = Math.round(settlement.y);

    for (let offsetY = -2; offsetY <= 2; offsetY++) {
      for (let offsetX = -2; offsetX <= 2; offsetX++) {
        if (!offsetX && !offsetY) continue;
        const y = centerY + offsetY;
        if (y < 0 || y >= height) continue;
        const x = (centerX + offsetX + width) % width;
        if (Number(world.layers.elevation[y * width + x]) < seaLevel) return true;
      }
    }
    return false;
  }

  function createWorldIndex(world) {
    return {
      elevation: world.layers?.elevation,
      settlements: world.settlements,
      width: world.settings.width,
      height: world.settings.height,
      seaLevel: world.settings.seaLevel,
      coastalIds: null,
      viewKey: null,
      viewData: null
    };
  }

  function worldIndex(world) {
    let index = worldIndexes.get(world);
    if (!index
      || index.elevation !== world.layers?.elevation
      || index.settlements !== world.settlements
      || index.width !== world.settings.width
      || index.height !== world.settings.height
      || index.seaLevel !== world.settings.seaLevel) {
      index = createWorldIndex(world);
      worldIndexes.set(world, index);
    }
    return index;
  }

  function coastalIds(world, index) {
    if (!index.coastalIds) {
      index.coastalIds = new Set();
      for (const settlement of world.settlements || []) {
        if (isCoastal(world, settlement)) index.coastalIds.add(settlement.id);
      }
    }
    return index.coastalIds;
  }

  function viewData(renderer, index) {
    const key = renderer.historyView || EMPTY_VIEW;
    if (index.viewKey !== key) {
      index.viewKey = key;
      index.viewData = { capitalIds: null, rankedSettlements: null, realmLabels: null };
    }
    return index.viewData;
  }

  function capitalIds(renderer, data) {
    if (!data.capitalIds) {
      data.capitalIds = new Set((renderer.viewRealms?.() || [])
        .map(realm => realm.capitalId)
        .filter(id => id != null));
    }
    return data.capitalIds;
  }

  function rankedSettlements(renderer, data) {
    if (!data.rankedSettlements) {
      const capitals = capitalIds(renderer, data);
      data.rankedSettlements = (renderer.world.settlements || [])
        .map(settlement => ({
          settlement,
          population: population(renderer, settlement),
          capital: capitals.has(settlement.id)
        }))
        .sort((a, b) => Number(b.capital) - Number(a.capital) || b.population - a.population);
    }
    return data.rankedSettlements;
  }

  function realmLabelPositions(renderer, data) {
    if (data.realmLabels) return data.realmLabels;

    const world = renderer.world;
    const groups = new Map();
    for (const settlement of world.settlements || []) {
      const realmId = owner(renderer, settlement);
      if (realmId == null) continue;

      let group = groups.get(realmId);
      if (!group) {
        group = { samples: [], weight: 0 };
        groups.set(realmId, group);
      }
      const weight = Math.max(1, Math.sqrt(population(renderer, settlement)));
      group.samples.push({ settlement, weight });
      group.weight += weight;
    }

    data.realmLabels = [];
    for (const [realmId, group] of groups) {
      if (!group.samples.length) continue;

      const base = group.samples[0].settlement;
      let weightedX = 0;
      let weightedY = 0;
      let totalWeight = 0;

      for (const sample of group.samples) {
        let dx = sample.settlement.x - base.x;
        const width = world.settings.width;
        if (dx > width / 2) dx -= width;
        if (dx < -width / 2) dx += width;
        weightedX += (base.x + dx) * sample.weight;
        weightedY += sample.settlement.y * sample.weight;
        totalWeight += sample.weight;
      }

      const x = ((weightedX / totalWeight) % world.settings.width + world.settings.width) % world.settings.width;
      data.realmLabels.push({ realmId, x, y: weightedY / totalWeight });
    }
    return data.realmLabels;
  }

  function drawLabel(ctx, label, x, y, size = 10, weight = 700, fill = 'rgba(246,241,219,.9)') {
    ctx.save();
    ctx.font = weight + ' ' + size + 'px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(2, size * .28);
    ctx.strokeStyle = 'rgba(5,9,7,.84)';
    ctx.strokeText(label, x, y);
    ctx.fillStyle = fill;
    ctx.fillText(label, x, y);
    ctx.restore();
  }

  function realmFor(renderer, id) {
    return renderer.realm?.(id) || renderer.world?.kingdoms?.[id] || null;
  }

  function drawRealmLabels(renderer, data) {
    if (!preferences.labels || !['political', 'population', 'prosperity', 'trade'].includes(renderer.mode)) return;

    const zoom = renderer.camera?.zoom || 1;
    if (zoom > 3.7) return;

    for (const label of realmLabelPositions(renderer, data)) {
      const position = renderer.worldToScreen(label.x + .5, label.y + .5);
      if (position.y < 20 || position.y > renderer.canvas.height / (renderer.dpr || 1) - 20) continue;

      const realm = realmFor(renderer, label.realmId);
      if (!realm) continue;
      const size = clamp(12 + (2.8 - zoom) * 2, 10, 17);
      drawLabel(
        renderer.ctx,
        String(realm.shortName || realm.name || ('Realm ' + label.realmId)).toUpperCase(),
        position.x,
        position.y,
        size,
        800,
        'rgba(245,235,197,.68)'
      );
    }
  }

  function drawSettlementDetails(renderer, data) {
    if (!preferences.labels) return;

    const zoom = renderer.camera?.zoom || 1;
    if (zoom < 1.45) return;

    const width = renderer.canvas.width / (renderer.dpr || 1);
    const height = renderer.canvas.height / (renderer.dpr || 1);
    const rows = rankedSettlements(renderer, data);
    const limit = zoom > 4 ? rows.length : zoom > 2.5 ? Math.min(rows.length, 34) : Math.min(rows.length, 16);
    const boxes = [];

    for (const row of rows.slice(0, limit)) {
      const settlement = row.settlement;
      const position = renderer.worldToScreen(settlement.x + .5, settlement.y + .5);
      if (position.x < 10 || position.x > width - 10 || position.y < 10 || position.y > height - 10) continue;

      const label = settlement.name + (zoom > 2.6 ? ' · ' + Math.round(row.population).toLocaleString() : '');
      const boxWidth = Math.min(180, Math.max(45, label.length * 5.4));
      const box = { x: position.x - boxWidth / 2, y: position.y + 9, width: boxWidth, height: 14 };
      if (boxes.some(other => !(box.x + box.width < other.x
        || other.x + other.width < box.x
        || box.y + box.height < other.y
        || other.y + other.height < box.y))) continue;

      boxes.push(box);
      drawLabel(
        renderer.ctx,
        label,
        position.x,
        position.y + 16,
        row.capital ? 10 : 9,
        row.capital ? 800 : 650,
        row.capital ? 'rgba(255,238,177,.96)' : 'rgba(231,226,205,.88)'
      );
    }
  }

  function drawPort(ctx, position, major = false) {
    ctx.save();
    ctx.translate(position.x, position.y);
    ctx.strokeStyle = major ? 'rgba(121,203,221,.95)' : 'rgba(121,184,203,.72)';
    ctx.lineWidth = major ? 1.7 : 1.2;
    ctx.beginPath();
    ctx.arc(0, 0, major ? 5 : 3.7, 0, Math.PI * 2);
    ctx.moveTo(0, -7);
    ctx.lineTo(0, 7);
    ctx.moveTo(-4, 3);
    ctx.quadraticCurveTo(0, 8, 4, 3);
    ctx.stroke();
    ctx.restore();
  }

  function facilityIndicators(world) {
    const bySettlement = new Map();
    for (const facility of world.institutions?.facilities || []) {
      if (facility.status !== 'active') continue;

      let indicators = bySettlement.get(facility.settlementId);
      if (!indicators) {
        indicators = { shipyard: false, industry: false, greatWork: false };
        bySettlement.set(facility.settlementId, indicators);
      }
      if (facility.typeId === 'shipyard') indicators.shipyard = true;
      if (INDUSTRY_TYPES.has(facility.typeId)) indicators.industry = true;
      if (facility.greatWorkId) indicators.greatWork = true;
    }
    return bySettlement;
  }

  function drawHubs(renderer, index) {
    if (!preferences.hubs
      || (renderer.historyView && !renderer.historyView.isPresent)
      || (renderer.camera?.zoom || 1) < 1.8) return;

    const facilities = facilityIndicators(renderer.world);
    const coastal = coastalIds(renderer.world, index);
    for (const settlement of renderer.world.settlements || []) {
      const indicators = facilities.get(settlement.id);
      const shipyard = !!indicators?.shipyard;
      const industry = !!indicators?.industry;
      const greatWork = !!indicators?.greatWork;
      const isCoastalSettlement = coastal.has(settlement.id);
      if (!shipyard && !industry && !greatWork && !isCoastalSettlement) continue;

      const position = renderer.worldToScreen(settlement.x + .5, settlement.y + .5);
      if (isCoastalSettlement) drawPort(renderer.ctx, { x: position.x + 8, y: position.y - 7 }, shipyard);

      if ((renderer.camera?.zoom || 1) > 2.4 && (industry || greatWork)) {
        renderer.ctx.save();
        renderer.ctx.translate(position.x - 8, position.y - 8);
        renderer.ctx.rotate(Math.PI / 4);
        renderer.ctx.fillStyle = greatWork ? 'rgba(236,199,98,.9)' : 'rgba(183,173,139,.65)';
        const size = greatWork ? 4 : 3;
        renderer.ctx.fillRect(-size, -size, size * 2, size * 2);
        renderer.ctx.restore();
      }
    }
  }

  function drawPolyline(renderer, points, style, width, dash = []) {
    if (points.length < 2) return;
    const ctx = renderer.ctx;
    const canvasWidth = renderer.canvas.width / (renderer.dpr || 1);
    ctx.save();
    ctx.strokeStyle = style;
    ctx.lineWidth = width;
    ctx.setLineDash(dash);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();

    let previous = null;
    for (const point of points) {
      const position = renderer.worldToScreen(point.x, point.y);
      if (!previous || Math.abs(position.x - previous.x) > canvasWidth * .65) ctx.moveTo(position.x, position.y);
      else ctx.lineTo(position.x, position.y);
      previous = position;
    }

    ctx.stroke();
    ctx.restore();
  }

  function drawSupplyNetwork(renderer) {
    if (!preferences.supply
      || (renderer.historyView && !renderer.historyView.isPresent)
      || !renderer.world.military) return;

    const world = renderer.world;
    const zoom = renderer.camera?.zoom || 1;
    if (zoom < 1.15) return;

    for (const army of world.military.armies || []) {
      if (army.status !== 'active') continue;

      const supplyNodes = (army.supplyPath || [])
        .map(id => world.settlements?.[id])
        .filter(Boolean)
        .map(settlement => ({ x: settlement.x + .5, y: settlement.y + .5 }));
      supplyNodes.push({ x: army.x, y: army.y });
      if (supplyNodes.length > 1) {
        drawPolyline(
          renderer,
          supplyNodes,
          'rgba(225,198,117,' + (.18 + Number(army.supply || 0) * .3) + ')',
          zoom > 2 ? 1.7 : 1.2,
          [5, 4]
        );
      }

      const path = (army.path || [])
        .map(id => world.settlements?.[id])
        .filter(Boolean)
        .map(settlement => ({ x: settlement.x + .5, y: settlement.y + .5 }));
      if (path.length > 1 && zoom > 2.1) {
        drawPolyline(renderer, [{ x: army.x, y: army.y }, ...path], 'rgba(190,102,79,.22)', 1, [2, 5]);
      }
    }
  }

  function drawFiscalStress(renderer) {
    if (!preferences.finance
      || (renderer.historyView && !renderer.historyView.isPresent)
      || !renderer.world.treasury
      || !['political', 'prosperity', 'trade'].includes(renderer.mode)) return;

    for (const realm of renderer.world.treasury.realms || []) {
      const risk = Math.max(
        Number(realm.inflation || 0) * 2,
        1 - Number(realm.credit || 100) / 100,
        Math.min(1, realm.debt / Math.max(1, realm.lastRevenue || 1) / 10)
      );
      if (risk < .35) continue;

      const metadata = renderer.world.history?.realms?.[realm.realmId];
      const settlement = renderer.world.settlements?.[metadata?.capitalId];
      if (!settlement) continue;

      const position = renderer.worldToScreen(settlement.x + .5, settlement.y + .5);
      const radius = 12 + risk * 16;
      const ctx = renderer.ctx;
      ctx.save();
      ctx.strokeStyle = 'rgba(' + (risk > .7 ? '213,91,68' : '218,165,71') + ',' + (.18 + risk * .35) + ')';
      ctx.lineWidth = 1.2 + risk * 1.8;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawScale(renderer) {
    if (!scaleElement) scaleElement = document.getElementById('strategicScale');
    if (!scaleElement || !renderer.world) return;

    const zoom = renderer.camera?.zoom || 1;
    const canvasWidth = renderer.canvas.width / (renderer.dpr || 1);
    const canvasHeight = renderer.canvas.height / (renderer.dpr || 1);
    const scale = Math.min(
      canvasWidth / renderer.world.settings.width,
      canvasHeight / renderer.world.settings.height
    ) * zoom;
    const units = Math.max(1, Math.round(95 / Math.max(.01, scale)));
    const label = Math.round(zoom * 100) + '% · ~' + units + ' map units';
    if (scaleElement.textContent !== label) scaleElement.textContent = label;
  }

  const baseDraw = Renderer.prototype.draw;
  Renderer.prototype.draw = function () {
    baseDraw.call(this);
    if (!this.world) return;

    ensureToolbar();
    const index = worldIndex(this.world);
    const data = viewData(this, index);
    drawFiscalStress(this);
    drawSupplyNetwork(this);
    drawHubs(this, index);
    drawRealmLabels(this, data);
    drawSettlementDetails(this, data);
    drawScale(this);
  };

  const baseSetWorld = Renderer.prototype.setWorld;
  Renderer.prototype.setWorld = function (world) {
    const result = baseSetWorld.call(this, world);
    setTimeout(() => this.draw(), 0);
    return result;
  };

  ensureToolbar();
  const activeRenderer = window.worldRenderer || window.renderer;
  if (activeRenderer?.draw) activeRenderer.draw();
})();