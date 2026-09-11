# WorldForge

**Procedural World, Civilization & Story Simulation Studio** — a fully client-side deterministic living-world sandbox for GitHub Pages.

**Live:** https://mrhakan.github.io/WorldForge/

## Current release — v2.0 Armies, Fleets, Sieges & Military Logistics

WorldForge is a connected emergent-history machine. Geography drives climate; climate changes harvests; technology changes production and transport; settlements exchange physical commodities; institutions transform those resources into food, weapons, ships and logistics; and wars now materialize into moving armies, fleets, supply lines, battles, sieges and blockades whose consequences feed back into markets, settlements, institutions, history and the Living Wiki.

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
20. **v2.0 War Room** — physical field armies and fleets, operational movement, food/equipment supply, attrition, battles, sieges, blockades, settlement capture and military map overlays.

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
                         ├─ Steel + Lumber → Smithy → Weapons
                         └─ Steel + Lumber → Shipyard → Ships
                             └─ Realm logistics / strategic assets
                                 └─ Armies & fleets
                                     ├─ Food / weapons / ship consumption
                                     ├─ Roads / ports / supply lines
                                     ├─ Battles / attrition / morale
                                     ├─ Sieges / settlement capture
                                     └─ Naval battles / blockades
                                         └─ Market shortages / institution damage / population loss
                                             └─ Politics / history / knowledge / quests / Living Wiki
```

## v2.0 War Room

History wars are no longer only abstract score changes. Every active war can produce persistent operational forces for its belligerents. The military layer mirrors the existing History war state instead of replacing it, so strategic outcomes remain part of the same timeline, diplomacy and historical record.

### Field armies

Armies have persistent identity and state:

- realm and war
- home settlement and current map position
- operational target and road route
- manpower
- morale and readiness
- equipment quality
- food supply level
- explicit supply origin and supply path
- supply distance
- casualties, battles and sieges

Armies draw **Grain and Livestock** from friendly markets and use processed **Weapons** produced by the Civic Foundry. Long or broken supply lines reduce supply efficiency. Undersupplied armies suffer real attrition and lose morale/readiness rather than receiving a decorative penalty.

### Fleets and naval warfare

Coastal realms with shipbuilding capacity can field persistent war fleets. Fleets consume provisions, use physical **Ships** produced by shipyards, move toward enemy coastal objectives, fight naval battles and lose hulls.

Navigation technology and realm logistics improve operational reach. A fleet without a viable friendly port or provisions gradually loses readiness.

### Battles

Opposing armies and fleets that physically meet on the operational map resolve deterministic battles. Combat strength combines force size, morale, readiness, equipment, realm military capability, technology and supply.

Battle outcomes create first-class historical events and adjust the same war score used by the History engine. Losses persist on the force entity and in the campaign record.

### Sieges

When a field army reaches an enemy settlement it can establish a persistent siege. Siege pressure:

- consumes or denies local food reserves
- lowers food security and food-days
- raises market stress
- creates military casualties
- can damage local institutions
- eventually allows an operational settlement capture

A successful siege changes the settlement's realm ownership, political map cells, population and prosperity and records the conquest in the original History war.

### Blockades

War fleets at enemy coastal settlements can establish blockades. Blockade strength depends on the attacking fleet and any defending naval force. A blockade physically removes part of inbound/import-dependent cargo from the local market, increases market stress and reduces food security.

This closes the maritime logistics loop:

```text
Enemy fleet reaches port
 → blockade established
 → imported cargo denied
 → grain / strategic stocks fall
 → prices and market stress rise
 → food security falls
 → siege / unrest / economic pressure increases
 → war score and history respond
```

### Operational map overlay

The normal WorldForge map can now show live military state:

- moving army markers
- moving fleet markers
- army supply lines
- operational target lines
- siege rings
- blockade arcs
- force-size labels at higher zoom
- low-supply indicators

Historical replay remains readable: the live operations overlay is suppressed when viewing a non-present historical snapshot.

### The War Room

The v2.0 workspace provides:

- campaign selector
- campaign war-score and operation summaries
- active/retired field armies
- fleets and hull losses
- manpower, morale, readiness and supply
- realm weapons/ships/logistics overview
- active and historical sieges
- blockades and cargo-denial totals
- recent land and naval battles
- map-overlay toggle
- standalone **Campaign Ledger HTML export**

Armies, fleets, sieges and battles are also first-class Universal Encyclopedia article types with chronology and cross-links to realms and settlements.

### Endless-world compatibility

Operational entities remain detailed while they can affect the current simulation. Annual military telemetry compacts into 250-year archive blocks after the detailed retention window, and old battle/siege/blockade ledgers are bounded. Major History events and campaign consequences remain available through the existing deep-history architecture.

## v1.9 Civic Foundry

Institutions are persistent simulation entities. Raw World Market commodities become processed Flour, Bread, Lumber, Steel, Tools, Weapons, Ships, Prepared Medicine and Manuscripts. Granaries buffer food shocks; universities research technology; libraries preserve documentary evidence; museums protect artifacts; and shipyards/smithies create the physical strategic assets now consumed by v2.0 warfare.

Great Works include the Great Library, Grand University, Royal Hospital, Imperial Shipyard, National Museum, Sacred Archive, Great Observatory and Great Granary. Catastrophic institutional destruction can erase preserved Knowledge evidence or scatter artifacts.

## v1.8 World Market

Every settlement owns a persistent market containing Grain, Rice, Fish, Livestock, Timber, Iron, Copper, Salt, Coal and Wine. Weather and technology affect production; road and maritime networks move physical cargo; shortages affect prices, food security, prosperity, crime and stability.

## Knowledge, artifacts and public memory

History can leave behind persistent books and artifacts; institutions can preserve those objects; wars and sieges can destroy their surviving evidence; rediscovery can alter public knowledge; and the Living Wiki presents that changing historical perspective.

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
- Civic Foundry with institutions, production chains and Great Works
- **War Room** with moving armies/fleets, supply lines, battles, sieges, blockades and Campaign Ledger export
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
military-engine.js           armies, fleets, supply, combat, sieges and blockades
wiki-engine.js               cross-linked encyclopedia
artifact-wiki-adapter.js     artifact encyclopedia integration
technology-wiki-adapter.js   technology encyclopedia integration
resource-wiki-adapter.js     commodity and settlement-market encyclopedia integration
institution-wiki-adapter.js  institution, processed-good and Great Work encyclopedia integration
military-wiki-adapter.js     army, fleet, siege and battle encyclopedia integration
creator-suite-engine.js      authoring toolkit
canon-bridge-engine.js       authoring ↔ simulation bridge
living-wiki-engine.js        adaptive historical presentation
chronicle-press-engine.js    heraldry, eras and generated press
renderer.js                  map/historical Canvas rendering
```

Browser UI layers are split into matching `*-ui.js` and CSS modules. Later systems use compatibility/bootstrap loaders so WorldForge remains a static GitHub Pages application with no backend or build framework.

## Testing and deployment

Every push to `main` runs JavaScript syntax validation plus the complete regression chain from **v0.1 through v2.0** before GitHub Pages deployment. v2.0 tests cover physical force creation, real food/equipment consumption, map movement, explicit supply paths, deterministic field and naval combat, siege creation, blockade cargo denial, Universal Encyclopedia integration, caller-chunk determinism and save/export round-trips.

The endless-core suite continues to exercise a **12,500-year** boundary run with epoch rebasing and bounded archival history.

Everything runs locally in the browser; generated worlds are not uploaded by the application.