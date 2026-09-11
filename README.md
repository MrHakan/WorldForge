# WorldForge

**Procedural World, Civilization & Story Simulation Studio** — a fully client-side deterministic living-world sandbox for GitHub Pages.

**Live:** https://mrhakan.github.io/WorldForge/

## Current release — v1.9 Institutions, Industry & Great Works

WorldForge is a connected emergent-history machine. Geography drives climate; climate changes harvests; technology changes productivity; settlements produce and exchange physical commodities; institutions transform those materials into processed goods, knowledge, health, logistics and strategic assets; and Great Works can preserve — or catastrophically erase — parts of civilization's memory.

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
10. **v1.0 Creator Studio** — documents, map annotations, relationships, family trees, mood boards, stories and reader preview.
11. **v1.1 Living Canon Bridge** — authoring materializes into simulation entities while simulation generates canon material.
12. **v1.2 Living Wiki** — adaptive encyclopedia themes derived from the current historical age.
13. **v1.3 Heraldry & Chronicle Press** — realm heraldry, war banners, era names and generated historical newspapers.
14. **v1.4 Knowledge, Rumours & Lost History** — objective truth, public memory, propaganda, disputed history and rediscovery.
15. **v1.5 Living Almanac** — calendar, seasons, local weather, harvest pressure and celestial phenomena.
16. **v1.6 Treasury of Memory** — persistent artifacts, books, provenance, copying, loss, rediscovery and material evidence.
17. **v1.7 Hall of Discovery** — realm technology, adoption, diffusion, printing and endless procedural breakthroughs.
18. **v1.8 World Market** — physical commodity stocks, production, consumption, prices, shortages, road/sea cargo flows, famine and supply-chain feedback.
19. **v1.9 Civic Foundry** — persistent institutions, industrial transformation chains, granaries, libraries, universities, hospitals, museums, shipyards, strategic assets and material-built Great Works.

## Living world chain

```text
Seed / geography
 └─ Climate / calendar / weather
     └─ Agricultural & mineral suitability
         └─ Technology / production capability
             └─ Raw commodity production
                 └─ Local stocks / prices / supply chains
                     └─ Institutions & industrial facilities
                         ├─ Grain → Mill → Flour → Bakery → Bread
                         ├─ Timber → Sawmill → Lumber
                         ├─ Iron + Coal → Foundry → Steel
                         ├─ Steel + Lumber → Smithy → Tools / Weapons
                         ├─ Steel + Lumber → Shipyard → Ships
                         └─ Libraries / Universities / Hospitals / Museums
                             └─ Great Works
                                 ├─ Knowledge preservation / loss
                                 ├─ Artifact custody / loss
                                 ├─ Research / health / logistics
                                 └─ Strategic weapons / ships / tools
                                     └─ Politics / war / history / quests / wiki
```

## v1.9 Civic Foundry

Institutions are persistent simulation entities rather than UI decorations. Every settlement begins with civic infrastructure appropriate to its geography, population and resource base, and larger settlements can develop additional facilities as population and technology advance.

### Extraction, production and processing

The institutional economy extends the v1.8 World Market with processed goods:

- Flour
- Bread
- Lumber
- Steel
- Tools
- Weapons
- Ships
- Prepared Medicine
- Manuscripts

Facilities consume actual local stocks. A foundry cannot create steel without iron and coal; a shipyard cannot create hulls without lumber and steel; a bakery cannot create bread without flour and salt. Outputs remain persistent in the settlement market state and become inputs for later systems.

### Civic and knowledge institutions

The simulation includes managed farms, ranches, fisheries, lumber camps, mines, granaries, warehouses, market halls, mills, bakeries, sawmills, foundries, smithies and shipyards alongside hospitals, libraries, universities, museums, temple archives and observatories.

Their effects are causal:

- **Granaries** accumulate staple reserves during secure years and release them during shortages.
- **Warehouses and market halls** reduce local market stress.
- **Hospitals** consume physical inputs and improve settlement resilience.
- **Universities and observatories** add real research progress and realm innovation capacity.
- **Libraries and temple archives** preserve documentary Knowledge sources and strengthen archival survival.
- **Museums** place important artifacts into protected institutional collections.
- **Smithies and shipyards** create weapons and ships that are exposed as realm strategic assets for the military simulation layer.

### Great Works

Realms can commission multi-year projects whose construction consumes physical materials over time. The current Great Work catalog includes:

- Great Library
- Grand University
- Royal Hospital
- Imperial Shipyard
- National Museum
- Sacred Archive
- Great Observatory
- Great Granary

A Great Work is both a historical event and a persistent institution. Construction progress, supplied materials, settlement, realm, condition, collections and completion year survive save/export round-trips and appear as first-class Universal Encyclopedia articles.

### Destruction and historical memory

Institutions can be damaged by fire, crime and wartime destruction. Catastrophic destruction has real downstream consequences. If a library holding documentary evidence burns, its preserved sources are marked destroyed and removed from the live claim-evidence graph. A museum loss can scatter artifacts and alter their provenance.

This closes a major causal loop:

```text
Historical event
 → written evidence / artifact
 → archive or museum custody
 → centuries of preservation
 → war / fire / collapse
 → institution destroyed
 → evidence disappears
 → public history becomes weaker, disputed or lost
 → later archaeology can challenge it again
```

### Strategic assets

Institutions aggregate realm-level **weapons, ships, tools, research, health and logistics** capacity. These values intentionally form the handoff point for the next military/logistics layer, where armies and fleets can consume the same physical economy rather than using abstract combat points.

### Endless-world compatibility

Current facilities and collections remain detailed because they affect present simulation. Old annual institutional summaries compact into 250-year archive blocks. Great Works, surviving institutions and major destruction events remain persistent historical anchors while routine annual telemetry is bounded.

## v1.8 World Market

Every settlement owns a persistent market containing Grain, Rice, Fish, Livestock, Timber, Iron, Copper, Salt, Coal and Wine. Weather and technology affect production; road and maritime networks move physical cargo; shortages affect prices, food security, prosperity, crime and stability. The calibrated peacetime economy remains sustainable while drought, war, isolation and transport failure can still produce real famine.

## v1.7 Hall of Discovery

Technology exists per realm with gradual adoption, research, trade/scholarship/espionage diffusion and open-ended Synthesis breakthroughs. Printing spreads documentary evidence; metallurgy and engineering improve material culture; food, trade and navigation capabilities feed directly into the physical economy and institutions.

## Knowledge, artifacts and public memory

History can leave behind persistent books and artifacts; institutions can preserve those objects; wars and disasters can destroy their surviving evidence; rediscovery can alter public knowledge; and the Living Wiki presents that changing historical perspective.

## Main workspaces

- interactive world and historical map layers
- historical replay and endless absolute clock
- realms, diplomacy and wars
- society, rulers, families and dynasties
- cities, businesses, crime and underworld networks
- cultures, religions, factions and organizations
- dungeons, quests and dialogue
- Creator Studio and bidirectional Living Canon
- adaptive Living Wiki and Chronicle Press
- Knowledge & Rumours perspective workbench
- Living Almanac
- Treasury of Memory
- Hall of Discovery
- World Market with physical commodity stocks and supply-chain flows
- **Civic Foundry** with institutions, production chains, Great Works, realm strategic assets and Civic Ledger HTML export
- local save/load and `.worldforge.json` import/export

## Architecture

```text
engine.js                    founding geography
history-engine.js            civilization/history simulation
society-engine.js            notable NPCs, families and dynasties
city-engine.js               cities, economy, law and organized crime
culture-engine.js            culture and religion simulation
faction-engine.js            organizations and influence networks
adventure-engine.js          historical sites and dungeon graphs
story-engine.js              quests, dialogue and story variables
endless-engine.js            absolute clock, rebasing and compaction
calendar-engine.js           seasons, weather and celestial simulation
knowledge-engine.js          claims, sources, rumours and public memory
artifact-engine.js           persistent material culture and written works
technology-engine.js         research, adoption, diffusion and endless innovation
resource-engine.js           physical production, inventory, prices and cargo flows
institution-engine.js        institutions, industry, Great Works and strategic assets
wiki-engine.js               cross-linked encyclopedia
artifact-wiki-adapter.js     artifact encyclopedia integration
technology-wiki-adapter.js   technology encyclopedia integration
resource-wiki-adapter.js     commodity and settlement-market encyclopedia integration
institution-wiki-adapter.js  institution, processed-good and Great Work encyclopedia integration
creator-suite-engine.js      authoring toolkit
canon-bridge-engine.js       authoring ↔ simulation bridge
living-wiki-engine.js        adaptive historical presentation
chronicle-press-engine.js    heraldry, eras and generated press
renderer.js                  map/historical Canvas rendering
```

Browser UI layers are split into matching `*-ui.js` and CSS modules. Later systems use compatibility/bootstrap loaders so WorldForge remains a static GitHub Pages application with no backend or build framework.

## Testing and deployment

Every push to `main` runs JavaScript syntax validation plus the complete regression chain from **v0.1 through v1.9** before GitHub Pages deployment. v1.9 tests cover deterministic chunk-independent institution progression, physical processing chains, Great Work material construction, Universal Wiki integration, library-based Knowledge preservation and catastrophic evidence loss, strategic realm assets, bounded historical compaction and save/export round-trips.

Everything runs locally in the browser; generated worlds are not uploaded by the application.