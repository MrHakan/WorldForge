(() => {
  'use strict';

  if (typeof document === 'undefined' || window.__worldforgeDistrictInspector) return;

  const Worldbuilding = window.WorldForgeWorldbuilding;
  const Renderer = window.WorldForgePixelRenderer;
  const UI = window.WorldForgeWorldbuildingUI;
  if (!Worldbuilding || !Renderer || !UI) return;
  window.__worldforgeDistrictInspector = true;

  const ZOOM = 2.45;
  const state = { focusedDistrictId: null, settlementId: null, preview: null, observer: null, controls: null, activeCardId: null };
  const slug = value => String(value || 'worldforge').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'worldforge';
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

  function profile() {
    const world = UI.state.world;
    if (!world || UI.state.settlement == null) return null;
    return Worldbuilding.settlementView(world, Number(UI.state.settlement));
  }

  function focusedDistrict(currentProfile) {
    if (!currentProfile || state.focusedDistrictId == null) return null;
    return currentProfile.districts.find(district => String(district.id) === String(state.focusedDistrictId)) || null;
  }

  function syncCards() {
    const currentProfile = profile();
    const host = document.querySelector('#worldbuildingDistricts');
    if (!currentProfile || !host) return;

    const currentSettlementId = String(currentProfile.settlementId);
    if (state.settlementId !== null && state.settlementId !== currentSettlementId) {
      state.focusedDistrictId = null;
      state.activeCardId = null;
    }
    state.settlementId = currentSettlementId;

    const cards = [...host.querySelectorAll('article')];
    const availableIds = new Set(currentProfile.districts.map(district => String(district.id)));
    if (!availableIds.has(String(state.activeCardId))) {
      state.activeCardId = state.focusedDistrictId != null && availableIds.has(String(state.focusedDistrictId))
        ? String(state.focusedDistrictId)
        : String(currentProfile.districts[0]?.id ?? '');
    }
    currentProfile.districts.forEach((district, index) => {
      const card = cards[index];
      if (!card) return;
      const districtId = String(district.id);
      const selected = districtId === String(state.focusedDistrictId);
      card.dataset.districtId = districtId;
      card.classList.add('worldbuilding-district-card');
      card.classList.toggle('is-selected', selected);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', districtId === String(state.activeCardId) ? '0' : '-1');
      card.setAttribute('aria-pressed', String(selected));
      card.setAttribute('aria-label', `Open ${district.name} district view`);
    });
  }

  function renderBreadcrumbs() {
    const currentProfile = profile();
    const nav = document.querySelector('#worldbuildingSceneBreadcrumbs');
    if (!currentProfile || !nav) return;
    const district = focusedDistrict(currentProfile);
    nav.innerHTML = `<button type="button" data-scene-action="world">World map</button><span aria-hidden="true">›</span>${district
      ? `<button type="button" data-scene-action="settlement">${escapeHtml(currentProfile.name)}</button><span aria-hidden="true">›</span><span aria-current="page">${escapeHtml(district.name)}</span>`
      : `<span aria-current="page">${escapeHtml(currentProfile.name)}</span>`}`;
  }

  function renderFocusedPreview() {
    const currentProfile = profile();
    const preview = document.querySelector('#worldbuildingPreview');
    if (!currentProfile || !preview) return;
    const district = focusedDistrict(currentProfile);
    const existing = preview.querySelector('svg');

    if (!district) {
      if (existing?.hasAttribute('data-worldforge-focus-district')) preview.innerHTML = Renderer.renderSettlement(currentProfile, { width: 760, height: 460 });
      return;
    }

    if (existing?.getAttribute('data-worldforge-focus-district') === String(district.id)
      && existing.getAttribute('data-worldforge-focus-zoom') === String(ZOOM)) return;

    preview.innerHTML = Renderer.renderSettlement(currentProfile, {
      width: 760,
      height: 460,
      focusDistrictId: district.id,
      zoom: ZOOM
    });
  }

  function refresh() {
    syncCards();
    renderBreadcrumbs();
    renderFocusedPreview();
  }

  function focusPreviewDistrict(id) {
    requestAnimationFrame(() => {
      const target = [...document.querySelectorAll('#worldbuildingPreview svg [data-district-id]')]
        .find(item => String(item.getAttribute('data-district-id')) === String(id));
      target?.focus();
    });
  }

  function focusDistrict(id, { preservePreviewFocus = false } = {}) {
    const currentProfile = profile();
    const district = currentProfile?.districts.find(item => String(item.id) === String(id));
    if (!district) return;
    state.focusedDistrictId = String(district.id);
    state.activeCardId = String(district.id);
    state.settlementId = String(currentProfile.settlementId);
    refresh();
    if (preservePreviewFocus) focusPreviewDistrict(district.id);
  }

  function returnToSettlement({ focusDistrictId = null } = {}) {
    state.focusedDistrictId = null;
    refresh();
    if (focusDistrictId != null) focusPreviewDistrict(focusDistrictId);
  }

  function moveCardFocus(card, key) {
    const cards = [...card.parentElement.querySelectorAll('[data-district-id]')];
    const index = cards.indexOf(card);
    if (index < 0 || cards.length < 2) return false;
    const targetIndex = key === 'Home' ? 0
      : key === 'End' ? cards.length - 1
        : (index + (['ArrowRight', 'ArrowDown'].includes(key) ? 1 : -1) + cards.length) % cards.length;
    const target = cards[targetIndex];
    if (!target) return false;
    state.activeCardId = target.dataset.districtId;
    cards.forEach(item => item.setAttribute('tabindex', item === target ? '0' : '-1'));
    target.focus();
    return true;
  }

  function showWorldMap() {
    window.WorldForgeWorkspaceNavigation?.activateCategory('places');
    window.WorldForgeWorkspaceNavigation?.activatePage('settlements');
    document.querySelector('.layout > .map-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function downloadSvg() {
    const currentProfile = profile();
    const svg = document.querySelector('#worldbuildingPreview svg');
    if (!currentProfile || !svg) return;

    const district = focusedDistrict(currentProfile);
    const copy = svg.cloneNode(true);
    copy.setAttribute('width', '1520');
    copy.setAttribute('height', '920');
    const contents = new XMLSerializer().serializeToString(copy);
    const blob = new Blob([contents], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `worldforge-${slug(currentProfile.name)}${district ? `-${slug(district.name)}` : ''}.svg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function mount() {
    const preview = document.querySelector('#worldbuildingPreview');
    const districtHost = document.querySelector('#worldbuildingDistricts');
    if (!preview || !districtHost || preview === state.preview) return;

    state.observer?.disconnect();
    state.controls?.remove();
    state.preview = preview;
    preview.insertAdjacentHTML('beforebegin', `<div class="worldbuilding-scene-controls"><nav id="worldbuildingSceneBreadcrumbs" class="worldbuilding-scene-breadcrumbs" aria-label="Preview location"></nav><button type="button" class="worldbuilding-scene-export" data-scene-action="export">Download scene SVG</button></div>`);
    const controls = preview.previousElementSibling;
    if (!controls?.classList.contains('worldbuilding-scene-controls')) return;
    state.controls = controls;

    controls.onclick = event => {
      const action = event.target.closest('[data-scene-action]')?.dataset.sceneAction;
      if (action === 'world') showWorldMap();
      if (action === 'settlement') returnToSettlement();
      if (action === 'export') downloadSvg();
    };

    preview.addEventListener('click', event => {
      const district = event.target.closest('svg [data-district-id]');
      if (district) focusDistrict(district.getAttribute('data-district-id'));
    });
    preview.addEventListener('keydown', event => {
      if (event.key === 'Escape' && state.focusedDistrictId != null) {
        event.preventDefault();
        returnToSettlement({ focusDistrictId: state.focusedDistrictId });
        return;
      }
      const district = event.target.closest('svg [data-district-id]');
      if (!district || !['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      focusDistrict(district.getAttribute('data-district-id'), { preservePreviewFocus: true });
    });

    districtHost.addEventListener('focusin', event => {
      const card = event.target.closest('[data-district-id]');
      if (!card || !districtHost.contains(card)) return;
      state.activeCardId = card.dataset.districtId;
      [...districtHost.querySelectorAll('[data-district-id]')]
        .forEach(item => item.setAttribute('tabindex', item === card ? '0' : '-1'));
    });
    districtHost.addEventListener('click', event => {
      const card = event.target.closest('[data-district-id]');
      if (card) focusDistrict(card.dataset.districtId);
    });
    districtHost.addEventListener('keydown', event => {
      const card = event.target.closest('[data-district-id]');
      if (!card) return;
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) {
        if (moveCardFocus(card, event.key)) event.preventDefault();
        return;
      }
      if (event.key === 'Escape' && String(card.dataset.districtId) === String(state.focusedDistrictId)) {
        event.preventDefault();
        returnToSettlement();
        card.focus();
        return;
      }
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      focusDistrict(card.dataset.districtId);
    });

    document.querySelector('#worldbuildingSettlement')?.addEventListener('change', () => {
      state.focusedDistrictId = null;
      state.activeCardId = null;
      state.settlementId = null;
      requestAnimationFrame(refresh);
    });

    state.observer = new MutationObserver(refresh);
    state.observer.observe(preview, { childList: true });
    state.observer.observe(districtHost, { childList: true });
    refresh();
  }

  window.WorldForgeDistrictInspector = { focusDistrict, returnToSettlement, downloadSvg, refresh };
  window.WorldForgeWorkspaceNavigation?.onStructureChange('#worldbuildingPanel', mount);
  setTimeout(mount, 100);
})();
