# WorldForge

**Procedural World, Civilization & Story Simulation Studio** — a fully client-side worldbuilding simulation that runs on GitHub Pages.

**Live:** https://mrhakan.github.io/WorldForge/

## Current milestone — v0.3 Society

WorldForge now combines three persistent simulation layers:

1. **v0.1 World Generation** — deterministic terrain, climate, biomes, rivers, resources, settlements, kingdoms and roads.
2. **v0.2 History** — population, prosperity, migration, trade, diplomacy, alliances, wars, conquest, realm formation/collapse, historical snapshots and chronicle replay.
3. **v0.3 Society** — named notable people, families, dynastic houses, marriage, children, inheritance, careers, friendships/rivalries, rulers, heirs, claims and succession crises.

The same seed and generator settings reproduce the same founding world. Integrated history + society simulation uses year-keyed seeded randomness so advancing 300 years at once or in multiple chunks reaches the same deterministic state.

## v0.3 systems

- 50–220 living notable NPCs, with bounded simulation population
- Age, birth/death years, residence, realm, occupation, status, wealth and prestige
- Traits and personal ambitions
- Reciprocal spouse links, parents, children and immediate-family graph
- Friendship and rivalry networks
- Ruling, noble, landed and extinct dynastic houses
- House founders, heads, members and prestige
- Realm titles with ruler style and succession law
- Four succession models: absolute primogeniture, male-preference primogeniture, house seniority and council elective
- Dynamic heirs and ranked claimants
- Reign history and inheritance on death
- Succession crises that reduce realm stability
- Dynastic marriages that can improve inter-realm relations
- New realms automatically receive a new ruling dynasty
- Collapsed realms dissolve active titles
- Existing history events (war, peace, alliance, conquest, crisis) are enriched with named principal figures
- Society snapshots follow the history timeline for historical replay
- Save/import/export includes world, history and society in one `.worldforge.json` state

## UI

The GitHub Pages app includes the interactive world map and historical timeline from v0.2 plus:

- Society KPI dashboard
- Throne / ruler / heir / claimant cards
- Filterable notable-people table
- Person dossier with traits, ambition, wealth, prestige, spouse, friends and rivals
- Clickable immediate-family graph
- Dynasty / house ledger
- Society-aware chronicle filters and named historical figures
- Realm ledger linked to current/historical rulers

## Architecture

```text
engine.js          deterministic geography + base world state
history-engine.js  aggregate civilization/history simulation
society-engine.js  notable NPC + family + dynasty simulation
renderer.js        Canvas world/historical rendering
app.js             browser UI orchestration
```

`WorldForgeSociety.simulateYears()` is the v0.3 integrated orchestrator: history advances one deterministic year, society processes that same year, dynastic effects feed back into realm stability, and compact snapshots are retained for replay.

## Version gates

- **v0.1 — World Generation:** passed
- **v0.2 — History:** passed
- **v0.3 — Society:** current
- **v0.4 — Cities & Crime:** next — detailed city districts, local factions, gangs, corruption and black-market simulation tied to named NPCs
- **v0.5 — Adventure:** procedural dungeons, ruins, loot and encounters derived from world history
- **v0.6 — Story Studio:** quest graph, dialogue tree and variables connected to persistent entities
- **v1.0 — WorldForge:** integrated world wiki, replay and authoring suite

## Testing and deployment

Pushes to `main` run JavaScript syntax checks and all deterministic regression suites before GitHub Pages deploys. v0.3 CI keeps the v0.1 and v0.2 tests intact and adds long-run society, succession, event-linking, timeline and save/export checks.