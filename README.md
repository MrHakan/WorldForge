# WorldForge

**Procedural World, Civilization & Story Simulation Studio** — a fully client-side deterministic living-world sandbox for GitHub Pages.

**Live:** https://mrhakan.github.io/WorldForge/

## Current release — v1.8 Resources, Agriculture & Supply Chains

WorldForge is a connected emergent-history machine. Geography drives climate; climate changes harvests; technology changes productivity and transport; settlements physically produce, consume, stock and exchange commodities; shortages alter prices, prosperity, crime and stability; and those pressures feed back into history, knowledge, artifacts, quests and the Living Wiki.

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

## Living world chain

```text
Seed / geography
 └─ Climate / calendar / weather
     └─ Agricultural & mineral suitability
         └─ Technology / production capability
             └─ Commodity production
                 └─ Local inventories & consumption
                     └─ Prices / shortages / surpluses
                         └─ Road & maritime supply chains
                             └─ Food security / market stress
                                 └─ Prosperity / crime / migration / stability
                                     └─ Politics / war / history
                                         └─ Artifacts / knowledge / quests / wiki
```

## v1.8 World Market

Every settlement now owns a persistent market rather than inheriting a purely abstract economy. The initial commodity catalog contains:

- Grain
- Rice
- Fish
- Livestock
- Timber
- Iron
- Copper
- Salt
- Coal
- Wine

Each commodity tracks local inventory, production, consumption, imports, exports, shortage and price. Production potential is derived from the settlement's biome, moisture, temperature, elevation, coast/river access and founding resource deposits.

### Agriculture and climate

Grain, rice, livestock and wine respond to the Living Almanac. Crop yield, drought, flood and other weather pressure alter actual output before local consumption is applied. Food security is then calculated from remaining physical reserves across staple commodities.

A bad harvest therefore follows a causal chain:

```text
Drought
 → Grain/Rice output falls
 → Local stock declines
 → Coverage falls below demand
 → Price rises
 → Food security drops
 → Market stress rises
 → Prosperity and stability weaken
 → Unemployment/crime pressure rises
 → Severe cases become famine history
```

### Technology and production

v1.7 technology is part of the same calculation. Food technologies improve agricultural production; engineering and metallurgy improve extraction; navigation and trade capabilities increase transport capacity. This means technological divergence now produces real economic divergence between civilizations.

### Supply chains

Roads act as cargo edges. A shipment occurs when one market has usable surplus while a connected market has enough shortage or price pressure. Cargo is physically removed from the exporter and added to the importer, with transport loss.

Coastal settlements can also exchange goods by sea once participating realms possess sufficient navigation capability. War reduces cross-realm transport capacity; city crime also lowers overland logistics efficiency.

The live flow ledger records commodity, origin, destination, quantity, price gap, method and year. Shortages and strong surplus exports can become historical **commodity_shortage**, **famine** and **trade_boom** events.

### Endless-world compatibility

Current markets remain detailed because their stocks affect the next simulation step. Historical annual economic summaries use the same bounded-history strategy as climate, artifacts and technology: old detailed years compact into 250-year archive blocks. Recent cargo flows and shocks are capped while long-run aggregate trends survive.

## v1.7 Hall of Discovery

Technology exists per realm with gradual adoption, research, trade/scholarship/espionage diffusion and open-ended Synthesis breakthroughs. Printing spreads documentary evidence; metallurgy and engineering improve material culture; food, trade and navigation capabilities now feed directly into the v1.8 physical economy.

## Knowledge, artifacts and public memory

History can leave behind persistent books and artifacts; rediscovery can alter public knowledge; printing can spread surviving evidence; and economic crises now become objective events that can later be remembered, disputed, propagandized or forgotten.

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
- **World Market** with commodity board, local market inspection, supply-chain flows, shortage chronicle and Economic Ledger HTML export
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
wiki-engine.js               cross-linked encyclopedia
artifact-wiki-adapter.js     artifact encyclopedia integration
technology-wiki-adapter.js   technology encyclopedia integration
resource-wiki-adapter.js     commodity and settlement-market encyclopedia integration
creator-suite-engine.js      authoring toolkit
canon-bridge-engine.js       authoring ↔ simulation bridge
living-wiki-engine.js        adaptive historical presentation
chronicle-press-engine.js    heraldry, eras and generated press
renderer.js                  map/historical Canvas rendering
```

Browser UI layers are split into matching `*-ui.js` and CSS modules. Later systems use compatibility/bootstrap loaders so WorldForge remains a static GitHub Pages application with no backend or build framework.

## Testing and deployment

Every push to `main` runs JavaScript syntax validation plus the complete regression chain from **v0.1 through v1.8** before GitHub Pages deployment. v1.8 tests cover deterministic chunk-independent economic simulation, commodity stock/price validity, road cargo flow, physical famine generation, Wiki integration, historical compaction and save/export round-trips.

Everything runs locally in the browser; generated worlds are not uploaded by the application.