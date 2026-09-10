# WorldForge

**Procedural World, Civilization & Story Simulation Studio** — a fully client-side deterministic living-world sandbox for GitHub Pages.

**Live:** https://mrhakan.github.io/WorldForge/

## Current release — v1.5 Calendar, Seasons, Weather & Celestial System

WorldForge is a connected emergent-history machine: geography drives climate, climate affects harvests and prices, those pressures feed society and politics, and the resulting events become history, rumours, canon, quests and adaptive wiki material.

### Version line

1. **v0.1 World Generation** — terrain, climate baselines, biomes, rivers, resources, settlements, realms and roads.
2. **v0.2 History** — population, prosperity, migration, trade, diplomacy, alliances, war, conquest and realm collapse.
3. **v0.3 Society** — notable NPCs, families, houses, marriage, inheritance, rulers, heirs and succession crises.
4. **v0.4 Cities & Crime** — districts, businesses, officials, unemployment, guards, corruption, gangs, territory and black markets.
5. **v0.5 Adventure** — history-derived ruins, mines, crypts, caves, keeps, procedural room graphs, encounters, traps, secrets and loot.
6. **v0.6 Story Studio** — branching quest graphs, dialogue trees, persistent variables and entity-bound story generation.
7. **v0.7 Cultures & Religions** — cultures, languages, traditions, values, conversions, holy sites and schisms.
8. **v0.8 Factions & Organizations** — guilds, orders, cults, mercenary companies, political factions, scholar societies and rebel leagues.
9. **v0.9 Endless Simulation Core** — absolute world clock, epoch rebasing, bounded recent detail and deep-history compaction.
10. **v1.0 Creator Studio** — cards/documents, map annotations, relationships, family trees, mood boards, Quill-style stories, workshop tools and reader preview.
11. **v1.1 Living Canon Bridge** — authoring can materialize into simulation entities; simulation events create cards, timeline entries, map notes and story hooks.
12. **v1.2 Living Wiki** — adaptive encyclopedia themes derived from war, prosperity, religion, crime, scholarship and deep world age; standalone themed HTML export.
13. **v1.3 Heraldry & Chronicle Press** — deterministic realm heraldry, war banners, dynamic era names, themed map frames and automatic newspapers/chronicles.
14. **v1.4 Knowledge, Rumours & Lost History** — source provenance, witnesses, merchant letters, temple records, tavern rumours, propaganda, inscriptions, realm-specific public memory, disputed history, legends and investigation quests.
15. **v1.5 Living Almanac** — custom 365-day calendar, hemispheric seasons, latitude/elevation/biome-driven local climate, monthly weather, daylight, harvest yield, drought/flood/storm/winter/heat events, moon phases, eclipses, comets, auroras and climate-to-economy feedback.

## Living world chain

```text
Seed
 └─ Planet / terrain / climate baselines
     └─ Calendar / seasons / weather / harvests
         └─ Settlements / realms / roads / markets
             └─ Population / economy / diplomacy / wars
                 └─ People / families / dynasties / succession
                     └─ Cultures / religions / organizations
                         └─ Cities / crime / hidden economies
                             └─ Ruins / dungeons / expeditions / loot
                                 └─ Quests / dialogue / authoring
                                     └─ Living Canon
                                         └─ Living Wiki / Chronicle Press
                                             └─ Knowledge / rumours / lost history
```

## v1.5 Living Almanac

The calendar uses twelve named months and 365 days. Each settlement receives a persistent climate profile derived from latitude, elevation, biome, moisture, temperature, river proximity and coastal exposure. Monthly weather is deterministic from world seed + absolute year + settlement + month, so reopening or replaying the same world produces the same almanac.

Annual climate state includes temperature and precipitation anomalies, crop yield, food stress and local extreme-weather indices. Severe conditions become actual history events: droughts, floods, great storms, harsh winters, heatwaves and exceptional harvests. The celestial model adds moon phase/illumination, daylight length, solar eclipses, great comets and auroras.

Climate is part of the simulation loop rather than presentation only. Harvest stress can reduce settlement prosperity and population, raise city prices and unemployment, increase crime pressure, reduce trade and weaken realm stability. Eclipses and comets can also nudge religious fervor. The next simulated year therefore starts from a world already changed by the previous year's weather.

The Living Almanac UI offers settlement and date selection, a twelve-month climate view, a celestial docket, climate chronicle and standalone HTML almanac export.

### Endless-world compatibility

Detailed climate summaries use a rolling retention window. Older annual weather is compacted into 250-year climate archive blocks rather than accumulating forever. The climate engine uses absolute years and the original world seed, so epoch rebasing does not repeat weather cycles or random streams. Endless Core delegates normal and asynchronous long-run simulation through the climate wrapper, preserving the same feedback model during +10,000-year runs.

## Knowledge & public memory

Important historical events can become objective claims, but realms learn about them through official records, witnesses, merchant letters, temple chronicles, tavern rumours, propaganda, inscriptions and scholarship. A claim can be **confirmed, disputed, legendary, lost or unknown** depending on the selected realm's surviving evidence. The GM Truth Lens reveals objective simulation truth; uncertain claims can become investigation quests.

## Main workspaces

- interactive world and historical map layers
- historical timeline replay and endless absolute clock
- realm ledger, diplomacy and wars
- society, rulers, heirs, families and dynasties
- procedural City Explorer and underworld simulation
- culture, religion, organization and faction workspaces
- procedural Dungeon Studio
- Quest Graph and Dialogue Tree editors
- Creator Studio documents, map annotations, relationship graphs, mood boards and Quill stories
- bidirectional Living Canon bridge
- adaptive Living Wiki and themed standalone HTML export
- Heraldry & Chronicle Press with generated historical newspapers
- Knowledge & Rumours perspective workbench
- Living Almanac with local seasonal weather and celestial events
- local save/load and `.worldforge.json` import/export

## Architecture

```text
engine.js                    founding geography
history-engine.js            aggregate civilization/history simulation
society-engine.js            notable NPCs, families and dynasties
city-engine.js               cities, economy, law and organized crime
culture-engine.js            culture and religion simulation
faction-engine.js            organizations and influence networks
adventure-engine.js          historical sites and dungeon graphs
story-engine.js              quests, dialogue and story variables
endless-engine.js            absolute clock, rebasing and compaction
calendar-engine.js           seasons, local climate, weather and celestial simulation
wiki-engine.js               cross-linked encyclopedia
creator-suite-engine.js      authoring toolkit
canon-bridge-engine.js       authoring ↔ simulation bridge
living-wiki-engine.js        adaptive historical presentation
chronicle-press-engine.js    heraldry, era names and generated press
knowledge-engine.js          claims, sources, rumours and public memory
renderer.js                  map/historical Canvas rendering
```

Browser UI layers are split into matching `*-ui.js` and CSS modules. Compatibility adapters bridge later systems into the original static app without requiring a backend or build step.

## Testing and deployment

Every push to `main` runs JavaScript syntax validation plus the complete regression chain from **v0.1 through v1.5** before GitHub Pages deployment. Tests cover deterministic generation, history, society, cities/crime, adventure, story, culture/religion, factions, endless simulation, authoring, canon, adaptive wiki themes, heraldry/press, knowledge propagation, climate feedback, calendar/celestial behavior, compaction and save/export round-trips.

Everything runs locally in the browser; generated worlds are not uploaded by the application.