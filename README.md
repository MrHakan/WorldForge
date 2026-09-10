# WorldForge

**Procedural World, Civilization & Story Simulation Studio** — a fully client-side worldbuilding simulation that runs on GitHub Pages.

**Live:** https://mrhakan.github.io/WorldForge/

## Current milestone — v0.4 Cities & Crime

WorldForge now combines four persistent deterministic layers:

1. **v0.1 World Generation** — terrain, climate, biomes, rivers, resources, settlements, kingdoms and roads.
2. **v0.2 History** — population, prosperity, migration, trade, diplomacy, wars, conquest, realm formation/collapse and historical replay.
3. **v0.3 Society** — notable people, families, houses, marriage, inheritance, rulers, heirs, claims and succession crises.
4. **v0.4 Cities & Crime** — procedural district layouts, local businesses, civic officials, unemployment, prices, guards, corruption, crime, gangs, territory, black markets and named underworld events.

The same seed and generator settings reproduce the same founding world. History, society and city simulation use year-keyed seeded randomness, so advancing centuries in one call or in multiple chunks reaches the same deterministic state.

## v0.4 systems

- Every settlement receives a persistent locality/city model
- Capital, city, town and village-specific district sets
- Coastal docks and river wards when geography supports them
- Deterministic district positions and local road graphs
- Market, residential, craft, government, temple, wealthy, low-income and outskirts districts
- 100+ generated businesses in a standard 45-settlement world
- Business sector, district, tier, owner and health
- Named magistrate, watch captain and merchant patron selected from v0.3 society NPCs
- Local population, prosperity, wealth and road trade integration
- Unemployment and price-index simulation
- Guard strength and public-order simulation
- Corruption and black-market indices
- Dynamic crime rate influenced by economy, war, guards, corruption and gang pressure
- Persistent organized-crime factions with names, leaders, members, influence, heat, treasury and specialties
- District territory ownership for gangs
- Smuggling and extortion activity
- Gang formation, succession and dissolution
- Rival factions and turf wars
- Watch crackdowns and arrest counts
- Named gang leaders and civic officials attached to shared history events
- City snapshots synchronized to the historical timeline
- Save/import/export includes city and underworld state in the `.worldforge.json` file

## UI

The GitHub Pages application now includes:

- City KPI dashboard
- Sortable City Explorer
- Procedural city-plan canvas with district blocks and streets
- Gang territory overlays on district plans
- District population, wealth and criminal-attraction inspection
- Local public-order/economy metrics
- Named civic power figures
- Active gang/faction ledger
- Business ledger with sector, district, owner and tier
- Crime-related filters in the shared World Chronicle
- Historical city/underworld replay through the same timeline used by politics and society

## Architecture

```text
engine.js          deterministic geography + base world state
history-engine.js  aggregate civilization/history simulation
society-engine.js  notable NPC + family + dynasty simulation
city-engine.js     locality + economy + law + organized-crime simulation
renderer.js        Canvas world/historical rendering
city-ui.js         v0.4 city explorer + integration adapter
app.js             browser UI orchestration
```

`WorldForgeCity.simulateYears()` is the v0.4 integrated orchestrator. It advances the captured v0.3 society/history simulation one deterministic year at a time and then processes the matching city year. This keeps the three evolving layers synchronized without changing the v0.1 geography contract.

## Version gates

- **v0.1 — World Generation:** passed
- **v0.2 — History:** passed
- **v0.3 — Society:** passed
- **v0.4 — Cities & Crime:** current
- **v0.5 — Adventure:** next — procedural dungeons, ruins, hideouts, loot and encounters derived from geography, cities and recorded history
- **v0.6 — Story Studio:** quest graph, dialogue tree and variables connected to persistent entities
- **v1.0 — WorldForge:** integrated world wiki, replay and authoring suite

## Testing and deployment

Pushes to `main` run JavaScript syntax checks and every deterministic regression suite before GitHub Pages deploys. v0.4 retains all v0.1–v0.3 tests and adds city-layout integrity, named-role links, long-run crime simulation, gang activity, historical replay, chunk-independence and save/export tests.
