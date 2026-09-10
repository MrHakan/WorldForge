# WorldForge

**Procedural World, Civilization & Story Simulation Studio**

**Live:** https://mrhakan.github.io/WorldForge/

WorldForge is a deterministic, browser-based fantasy world simulation studio. A seed first creates geography, climate, rivers, settlements, kingdoms and roads; the v0.2 history engine then advances that same world through centuries of population change, migration, trade, diplomacy, war, territorial conquest and political fragmentation.

## Current milestone — v0.2 History

### v0.1 foundation retained

- Deterministic seeded world generation
- Elevation, temperature and moisture fields
- Climate-aware biome assignment
- Resource hints and river systems
- Settlement suitability and placement
- Cities, towns, villages and capitals
- Founding kingdoms and political territory
- Road graph
- Interactive political / biome / elevation / temperature / moisture map
- Local save/load plus `.worldforge.json` export/import

### v0.2 history systems

- Deterministic year-by-year simulation keyed from the world seed
- Population growth with carrying capacity
- Light road-based migration
- Settlement prosperity and wealth indices
- Realm treasury, stability, military strength and prestige
- Road trade volumes affected by prosperity, distance, diplomacy and war
- Pairwise realm diplomacy
- Alliances and alliance breakdown
- Wars, war score, exhaustion and peace settlements
- Settlement conquest and visible political-border changes
- Realm collapse when its last settlement is lost
- Low-stability splinter states / new realm formation
- Political crises, hard seasons and trade-boom events
- Five-year historical snapshots
- RLE-compressed political ownership snapshots
- Timeline replay of borders, populations, realm ownership and trade roads
- Population, prosperity and trade map modes
- World chronicle event feed
- Historical population and trade/conflict charts
- Realm ledger and settlement table that follow the selected historical year
- Save/export round-trip including the full history state

## Determinism contract

The geographical generator is deterministic for the same seed and world settings. History is also deterministic: the random stream for each simulated year is derived from the world seed and year, so advancing 300 years in one call or in multiple chunks produces the same present-state history fingerprint.

The v0.2 CI regression suite verifies this chunk-independence as well as snapshot replay, political RLE round-trips and save/export preservation.

## Historical state model

`history-engine.js` layers onto the v0.1 world rather than regenerating it:

```text
world
├── terrain / climate / biomes / rivers
├── settlements / kingdoms / roads
└── history
    ├── currentYear
    ├── realms[]
    ├── current
    │   ├── settlementPopulation[]
    │   ├── settlementWealth[]
    │   ├── settlementProsperity[]
    │   ├── settlementKingdomIds[]
    │   ├── political[]
    │   ├── relations{}
    │   ├── alliances[]
    │   ├── activeWarIds[]
    │   └── tradeVolumes[]
    ├── wars[]
    ├── events[]
    └── snapshots[]
```

Snapshots are stored every five simulated years by default. Political ownership is run-length encoded in each snapshot to keep long histories practical inside a browser save file.

## Version gates

- **v0.1 — World Generation:** complete
- **v0.2 — History:** current milestone
- **v0.3 — Society:** next gate; notable NPCs, households, occupations, relationships, families and dynasties
- **v0.4 — Cities & Crime**
- **v0.5 — Adventure / Dungeons**
- **v0.6 — Story Studio / Quests / Dialogue**
- **v1.0 — Integrated WorldForge**

Each milestone is tested and deployed to GitHub Pages before development proceeds to the next gate.

## Development

WorldForge deliberately remains a static application so it can be hosted directly on GitHub Pages.

```text
index.html
styles.css
history.css
engine.js
history-engine.js
renderer.js
app.js
tests/worldgen.mjs
tests/history.mjs
.github/workflows/pages.yml
```

No backend is required and generated worlds are not uploaded by the application.