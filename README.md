# WorldForge

**Procedural World, Civilization & Story Simulation Studio** — a fully client-side deterministic worldbuilding sandbox that runs on GitHub Pages.

**Live:** https://mrhakan.github.io/WorldForge/

## WorldForge v1.0

WorldForge now integrates the full planned simulation stack:

1. **v0.1 World Generation** — elevation, temperature, moisture, biomes, rivers, resources, settlements, kingdoms, roads and political geography.
2. **v0.2 History** — population, prosperity, migration, trade, diplomacy, alliances, wars, conquest, realm formation/collapse and historical replay.
3. **v0.3 Society** — named notable people, families, dynastic houses, marriages, children, inheritance, occupations, friendships, rivalries, rulers, heirs, claims and succession crises.
4. **v0.4 Cities & Crime** — procedural city districts, local businesses, civic officials, unemployment, prices, guards, corruption, gangs, territory, black markets and crime events.
5. **v0.5 Adventure** — history-derived ruins, mines, crypts, caves, keeps and gang hideouts with procedural room graphs, encounters, traps, secrets, loot, danger and expedition history.
6. **v0.6 Story Studio** — branching quest graphs, conditional dialogue trees, persistent story variables, custom quests/nodes and entity-bound story generation.
7. **v1.0 Encyclopedia & Authoring Hub** — a searchable cross-linked world wiki, entity chronology, historical replay-aware articles, bookmarks, personal notes, authored world notes and Markdown encyclopedia export.

The same seed and generator settings reproduce the same founding world. Every evolving simulation layer uses deterministic year-keyed randomness, and the regression suite verifies chunk independence where applicable.

## Integrated world model

```text
Seed
 └─ Planet / terrain / climate
     └─ Settlements / realms / roads
         └─ Population / economy / diplomacy / wars
             └─ People / families / dynasties / succession
                 └─ Cities / districts / businesses / crime / gangs
                     └─ Ruins / dungeons / encounters / loot
                         └─ Quests / dialogue / world-state variables
                             └─ Searchable World Encyclopedia
```

## Main workspaces

- Interactive political, population, prosperity, trade, biome, elevation, temperature and moisture maps
- Historical timeline replay with persistent snapshots
- Realm ledger, diplomacy and conflict browser
- Society dashboard, throne view, notable-person dossier and family graph
- Dynasty / house ledger
- Procedural City Explorer with district plan, local economy, officials and gang territory
- Underworld dashboard with criminal factions, heat, influence and black markets
- Procedural Dungeon Studio with historical origins, room graphs, encounters, traps, secrets and loot
- Quest Graph Editor with custom nodes and persistent conditions/effects
- Dialogue Tree Studio with conditional choices and live variable preview
- World-state variable editor
- Global Encyclopedia search across realms, settlements, people, houses, cities, gangs, sites, quests, dialogues and events
- Cross-linked entity relationships and entity-specific chronology
- Historical encyclopedia views that follow the main timeline
- Bookmarks, article notes and authored world notes
- Markdown encyclopedia export
- Local save/load and `.worldforge.json` import/export

## Architecture

```text
engine.js             deterministic geography + founding world
history-engine.js     aggregate civilization/history simulation
society-engine.js     notable NPC + family + dynasty simulation
city-engine.js        city + economy + law + organized crime
adventure-engine.js   history-derived sites + dungeon graphs
story-engine.js       quests + dialogue + story variables
wiki-engine.js        derived encyclopedia + cross-link graph
renderer.js           world/historical Canvas rendering
city-ui.js            city workspace + v0.4 integration adapter
worldforge-v1-ui.js   v1 adventure/story/wiki workspaces + integration adapter
app.js                core browser UI orchestration
```

The browser simulation chain at v1.0 advances History → Society → Cities → Adventure → Story. The encyclopedia is derived from that synchronized state and therefore needs no separate simulation clock.

## Deterministic gates

- **v0.1 — World Generation:** passed
- **v0.2 — History:** passed
- **v0.3 — Society:** passed
- **v0.4 — Cities & Crime:** passed
- **v0.5 — Adventure:** passed
- **v0.6 — Story Studio:** passed
- **v1.0 — Integrated WorldForge:** current release

## Testing and deployment

Every push to `main` is validated before GitHub Pages deployment. The workflow runs JavaScript syntax checks plus the complete versioned regression suite: world generation, history, society, cities/crime, adventure, story and v1 encyclopedia integration. Tests cover deterministic long-run simulation, graph integrity, entity links, historical replay, save/export round-trips and encyclopedia cross-link validity.

Everything runs locally in the browser; generated worlds are not uploaded by the application.