(() => {
  'use strict';

  if (typeof document === 'undefined' || window.__worldforgeWorkspaceNavigation) return;
  window.__worldforgeWorkspaceNavigation = true;

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const CATEGORIES = [
    { id: 'overview', label: 'Overview', pages: [['generator', 'Generator', ['generator-panel']], ['summary', 'Summary', ['summary-panel']], ['chronicle', 'Chronicle', ['history-panel', 'chronicle-panel']], ['charts', 'Charts', ['history-charts-panel']], ['continuity', 'Long-run History', ['endlessPanel', 'endless-panel']]] },
    { id: 'society', label: 'Society', pages: [['overview', 'Overview', ['society-overview-panel']], ['thrones', 'Thrones', ['thrones-panel']], ['people', 'People', ['people-panel']], ['dynasties', 'Dynasties', ['dynasty-panel']], ['households', 'Households', ['householdPanel', 'household-panel']]] },
    { id: 'realms', label: 'Realms', pages: [['diplomacy', 'Diplomacy', ['diplomacyPanel', 'diplomacy-panel']], ['kingdoms', 'Kingdoms', ['kingdoms-panel']], ['politics', 'Politics', ['politicsPanel', 'politics-panel']], ['order', 'World Order', ['worldOrderPanel', 'world-order-panel']], ['warfare', 'Warfare & Operations', ['warfareSupplySection', 'warfarePeaceSection', 'warfarePostWarSection', 'warfareCampaignPlanningSection', 'warfareStrategicAISection', 'warfareStrategicReservesSection', 'warfareBattlefieldHistorySection', 'warfareBattlefieldRelicsSection', 'warfareCommanderLegacySection', 'warfareOccupationPolicySection']], ['military', 'Armies & Fleets', ['militaryPanel', 'military-panel']], ['treasury', 'Public Finance', ['treasuryPanel', 'treasury-panel']]] },
    { id: 'places', label: 'Places & Cities', pages: [['settlements', 'Settlements', ['places-panel']], ['cities', 'Cities', ['cityOverviewPanel', 'city-overview-panel', 'city-explorer-panel', 'city-panel']], ['activity', 'Activity', ['cityActivitySection']], ['urban', 'Urban Evolution', ['urbanEvolutionSection']], ['infrastructure', 'Infrastructure & Services', ['urbanInfrastructureSection', 'municipalPanel', 'municipal-panel']], ['economy', 'Local Economy & Logistics', ['economyLogisticsSection']], ['housing', 'Housing', ['housingPanel', 'housing-panel']], ['workforce', 'Workforce', ['workforcePanel', 'workforce-panel']], ['emergency', 'Health & Food Security', ['emergencyPanel', 'emergency-panel', 'nutritionPanel', 'nutrition-panel']]] },
    { id: 'culture', label: 'Culture & Faith', pages: [['culture', 'Culture', ['culturePanel', 'culture-panel']], ['faith', 'Faith', ['religion-panel']], ['heritage', 'Heritage & Archaeology', ['heritageSection', 'heritage-panel', 'archaeologySection', 'archaeology-panel', 'artifactPanel', 'artifact-panel']], ['tourism', 'Tourism', ['tourismSection', 'tourism-panel']]] },
    { id: 'factions', label: 'Factions & Economy', pages: [['factions', 'Factions', ['factionPanel', 'faction-panel']], ['organizations', 'Organizations', ['organization-panel']], ['economy', 'Markets & Stocks', ['economy-panel', 'resourcePanel', 'resource-panel']], ['trade', 'Trade & Logistics', ['trade-panel']], ['crime', 'Crime', ['crime-panel', 'underworld-panel']], ['industry', 'Technology & Institutions', ['technologyPanel', 'technology-panel', 'institutionPanel', 'institution-panel']]] },
    { id: 'adventure', label: 'Adventure & Story', pages: [['adventure', 'Adventure', ['adventure-panel']], ['story', 'Story', ['story-panel']], ['quests', 'Quests', ['quest-panel']], ['sites', 'Sites', ['site-panel']], ['creator', 'Creator Studio', ['creatorSuite', 'creator-suite-panel']], ['canon', 'Living Canon', ['canonBridge', 'canon-bridge-panel']]] },
    { id: 'discovery', label: 'History & Discovery', pages: [['calendar', 'Calendar & Seasons', ['calendarClimatePanel', 'calendar-panel']], ['press', 'Chronicle Press', ['chroniclePressPanel', 'chronicle-press-panel']], ['knowledge', 'Knowledge & Evidence', ['knowledgePanel', 'knowledge-panel']]] },
    { id: 'worldbuilding', label: 'Worldbuilding', pages: [['atelier', 'Atelier', ['worldbuilding-panel', 'worldbuildingPanel']], ['encyclopedia', 'Encyclopedia', ['wiki-panel', 'encyclopedia-panel']], ['architecture', 'Architecture', ['architecture-panel']]] }
  ];
  const MODES = [['map', 'Map-heavy'], ['balanced', 'Balanced'], ['data', 'Data-heavy']];
  const categoryMarkers = [...new Set(CATEGORIES.flatMap(category => category.pages.flatMap(page => page[2])))];
  const categorySelectors = categoryMarkers.flatMap(marker => [`#${marker}`, `.${marker}`]);
  const nestedCategorySelector = categorySelectors.map(selector => `#worldbuildingPanel ${selector}`).join(',');
  const structureSubscriptions = new Set();

  const savedCategory = localStorage.getItem('worldforge.workspace.tab');
  let activeCategory = CATEGORIES.some(category => category.id === savedCategory) ? savedCategory : 'overview';
  let activePage = null;
  let mode = localStorage.getItem('worldforge.workspace.mode') || 'balanced';
  let raf = 0;
  let lastSubtabMarkup = null;
  let lastWorkspaceKey = null;
  let layoutRoot = null;
  let layoutObserver = null;

  function cat(id = activeCategory) {
    return CATEGORIES.find(category => category.id === id) || CATEGORIES[0];
  }

  function pageFor(element) {
    const key = `${element.id || ''} ${element.className || ''}`;
    for (const category of CATEGORIES) {
      for (const page of category.pages) {
        if (page[2].some(marker => key.includes(marker))) return { category: category.id, page: page[0] };
      }
    }
    return { category: 'overview', page: 'summary' };
  }

  function normalizeSelectors(selectors) {
    const values = Array.isArray(selectors) ? selectors : [selectors];
    return values.flatMap(value => String(value || '').split(',')).map(value => value.trim()).filter(Boolean);
  }

  function nodeMatches(node, selectors) {
    if (!node || node.nodeType !== 1) return false;
    return selectors.some(selector => {
      try {
        return Boolean(node.matches?.(selector) || node.querySelector?.(selector));
      } catch {
        return false;
      }
    });
  }

  function matchingNodes(records, selectors) {
    const matched = [];
    for (const record of records) {
      for (const node of [...record.addedNodes, ...record.removedNodes]) {
        if (nodeMatches(node, selectors)) matched.push(node);
      }
    }
    return matched;
  }

  function isRelevantMutation(record) {
    const nodes = [...record.addedNodes, ...record.removedNodes];
    return nodes.some(node => {
      if (!node || node.nodeType !== 1) return false;
      if (record.target === layoutRoot && node.classList?.contains('panel')) return true;
      if (nodeMatches(node, categorySelectors)) return true;
      return [...structureSubscriptions].some(subscription => nodeMatches(node, subscription.selectors));
    });
  }

  function handleLayoutMutations(records) {
    const relevantRecords = records.filter(isRelevantMutation);
    if (!relevantRecords.length) return;

    schedule();
    for (const subscription of structureSubscriptions) {
      const nodes = matchingNodes(relevantRecords, subscription.selectors);
      if (nodes.length) subscription.callback({ nodes, initial: false });
    }
  }

  function observeLayout() {
    const nextRoot = $('.layout');
    if (!nextRoot || nextRoot === layoutRoot || typeof MutationObserver === 'undefined') return;
    layoutObserver?.disconnect();
    layoutRoot = nextRoot;
    layoutObserver = new MutationObserver(handleLayoutMutations);
    layoutObserver.observe(layoutRoot, { childList: true, subtree: true });
  }

  function onStructureChange(selectors, callback) {
    if (typeof callback !== 'function') return () => {};
    const subscription = { selectors: normalizeSelectors(selectors), callback };
    structureSubscriptions.add(subscription);

    if (subscription.selectors.some(selector => $(selector))) {
      requestAnimationFrame(() => callback({ nodes: [], initial: true }));
    }

    return () => structureSubscriptions.delete(subscription);
  }

  function ensureNav() {
    if ($('#workspaceTabs')) return;
    const header = $('.topbar');
    if (!header) return;

    header.insertAdjacentHTML('afterend', `<nav id="workspaceTabs" class="workspace-tabs" aria-label="Workspace sections">${CATEGORIES.map(category => `<button type="button" data-workspace-tab="${category.id}" aria-pressed="false">${category.label}</button>`).join('')}<span class="workspace-spacer"></span><div class="workspace-view-modes" role="group" aria-label="Workspace layout">${MODES.map(item => `<button type="button" data-workspace-mode="${item[0]}" title="${item[1]}" aria-pressed="false">${item[1]}</button>`).join('')}</div></nav><nav id="workspaceSubtabs" class="workspace-subtabs" aria-label="Workspace pages"></nav>`);

    $('#workspaceTabs').onclick = event => {
      const tab = event.target.closest('[data-workspace-tab]');
      const view = event.target.closest('[data-workspace-mode]');
      if (tab) activateCategory(tab.dataset.workspaceTab);
      if (view) setMode(view.dataset.workspaceMode);
    };
    $('#workspaceSubtabs').onclick = event => {
      const button = event.target.closest('[data-workspace-page]');
      if (button) activatePage(button.dataset.workspacePage);
    };
  }

  function classify() {
    const layout = $('.layout');
    if (!layout) return;
    $$('.layout > .panel').forEach(panel => {
      if (panel.classList.contains('map-panel')) {
        panel.dataset.workspacePersistent = 'map';
        panel.hidden = false;
        return;
      }
      const location = pageFor(panel);
      panel.dataset.workspaceCategory = location.category;
      panel.dataset.workspacePage = location.page;
    });

    const worldbuilding = $('#worldbuildingPanel');
    if (worldbuilding) {
      const location = pageFor(worldbuilding);
      worldbuilding.dataset.workspaceCategory = location.category;
      worldbuilding.dataset.workspacePage = location.page;
    }

    $$(nestedCategorySelector).forEach(panel => {
      const location = pageFor(panel);
      panel.dataset.workspaceCategory = location.category;
      panel.dataset.workspacePage = location.page;
    });
  }

  function renderSubtabs() {
    const category = cat();
    activePage = localStorage.getItem(`worldforge.workspace.page.${category.id}`) || activePage || category.pages[0][0];
    if (!category.pages.some(page => page[0] === activePage)) activePage = category.pages[0][0];

    const host = $('#workspaceSubtabs');
    if (!host) return;
    const markup = category.pages.map(page => `<button type="button" data-workspace-page="${page[0]}" class="${page[0] === activePage ? 'active' : ''}" aria-pressed="${page[0] === activePage}">${page[1]}</button>`).join('');
    if (markup !== lastSubtabMarkup) {
      host.innerHTML = markup;
      lastSubtabMarkup = markup;
    }
  }

  function setPressed(button, pressed) {
    button.classList.toggle('active', pressed);
    button.setAttribute?.('aria-pressed', String(pressed));
  }

  function apply() {
    const root = document.documentElement;
    let needsResize = root.dataset.workspaceMode !== mode;
    if (needsResize) root.dataset.workspaceMode = mode;

    $$('[data-workspace-mode]').forEach(button => setPressed(button, button.dataset.workspaceMode === mode));
    $$('[data-workspace-tab]').forEach(button => setPressed(button, button.dataset.workspaceTab === activeCategory));
    $$('.layout > .panel').forEach(panel => {
      const hidden = panel.dataset.workspacePersistent !== 'map' && !(panel.dataset.workspaceCategory === activeCategory && panel.dataset.workspacePage === activePage);
      if (panel.hidden !== hidden) {
        panel.hidden = hidden;
        needsResize = true;
      }
    });

    const worldbuilding = $('#worldbuildingPanel');
    if (worldbuilding) {
      const hidden = !['worldbuilding', 'places', 'realms', 'culture'].includes(activeCategory);
      if (worldbuilding.hidden !== hidden) {
        worldbuilding.hidden = hidden;
        needsResize = true;
      }
    }

    $$('#worldbuildingPanel [data-workspace-category]').forEach(panel => {
      const hidden = !(panel.dataset.workspaceCategory === activeCategory && panel.dataset.workspacePage === activePage);
      if (panel.hidden !== hidden) {
        panel.hidden = hidden;
        needsResize = true;
      }
    });

    if (needsResize) requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));

    const workspaceKey = `${activeCategory}|${activePage}|${mode}`;
    if (workspaceKey !== lastWorkspaceKey) {
      lastWorkspaceKey = workspaceKey;
      window.dispatchEvent(new CustomEvent('worldforge:workspace-change', { detail: { category: activeCategory, page: activePage, mode } }));
    }
  }

  function setMode(id) {
    if (!MODES.some(item => item[0] === id)) id = 'balanced';
    mode = id;
    localStorage.setItem('worldforge.workspace.mode', id);
    apply();
  }

  function activateCategory(id) {
    if (!CATEGORIES.some(category => category.id === id)) id = 'overview';
    activeCategory = id;
    activePage = localStorage.getItem(`worldforge.workspace.page.${id}`) || cat(id).pages[0][0];
    localStorage.setItem('worldforge.workspace.tab', id);
    renderSubtabs();
    apply();
  }

  function activatePage(id) {
    const category = cat();
    if (!category.pages.some(page => page[0] === id)) id = category.pages[0][0];
    activePage = id;
    localStorage.setItem(`worldforge.workspace.page.${activeCategory}`, id);
    renderSubtabs();
    apply();
  }

  function refresh() {
    observeLayout();
    ensureNav();
    classify();
    renderSubtabs();
    apply();
  }

  function schedule() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      refresh();
    });
  }

  function isVisible(target) {
    const element = typeof target === 'string' ? $(target) : target;
    return Boolean(element && !document.hidden && !element.closest?.('[hidden]'));
  }

  observeLayout();
  document.addEventListener('DOMContentLoaded', refresh, { once: true });
  setTimeout(refresh, 250);
  setTimeout(refresh, 1400);

  window.WorldForgeWorkspaceNavigation = { categories: CATEGORIES, activateCategory, activatePage, setMode, refresh, onStructureChange, isVisible, resolvePanelPage: pageFor };
})();
