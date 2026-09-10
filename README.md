# WorldForge

**Procedural World, Civilization & Story Simulation Studio** — a fully client-side deterministic living-world sandbox for GitHub Pages.

**Live:** https://mrhakan.github.io/WorldForge/

## Current release — v1.7 Technology, Inventions & Knowledge Diffusion

WorldForge is a connected emergent-history machine. Geography drives climate; climate changes harvests and markets; societies create wars, faiths, institutions and stories; events leave behind physical objects and written records; and civilizations now **discover, adopt, steal, trade and continuously extend technology across an endless world clock**.

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
17. **v1.7 Hall of Discovery** — realm technology, research, adoption, trade/scholarship/espionage diffusion, technology-linked artifacts, printing-driven documentary circulation and open-ended procedural breakthroughs.

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
                             └─ Technology / invention / diffusion
                                 ├─ Agriculture / health / trade / stability
                                 ├─ Navigation / logistics / warfare / engineering
                                 ├─ Printing / scholarship / public knowledge
                                 └─ Artifacts / books / technical records
                                     ├─ Knowledge / rumours / public memory
                                     ├─ Ruins / expeditions / rediscovery
                                     └─ Quests / dialogue / authoring
                                         └─ Living Canon
                                             └─ Living Wiki / Chronicle Press
```

## v1.7 Hall of Discovery

Technology exists per realm rather than as a single global unlock list. Each realm maintains its own discoveries, adoption percentages, research progress, diffusion history and long-run innovation domains.

The foundational technology graph currently covers agriculture, masonry, writing, bronze and iron working, irrigation, engineered roads, currency, medicine, shipbuilding, siege engineering, banking, celestial navigation, universities, agronomic science, printing, scientific cartography, public sanitation, mechanical engineering and oceanic navigation.

### Research and diffusion

New knowledge can arrive through:

- independent research driven by prosperity, existing scholarship and institutions
- road/trade contact with more advanced realms
- scholarly transmission
- wartime contact and espionage
- long-run open innovation after the core technology graph matures

Adoption is gradual. Discovering a technology does not instantly give a realm its full effect; capabilities increase as practices spread through the society.

### Simulation feedback

Technology is connected to the same world state as the rest of the simulation. Adopted knowledge can influence food productivity, population resilience, realm stability, trade, military capability, navigation, engineering, research capacity, idea diffusion and artifact quality.

The **Printing Press** also connects directly to v1.4 and v1.6: a sufficiently adopted print culture can create new scholarly sources from circulating chronicles, maps and other written artifacts. This gives old evidence new geographic reach and can alter the public-memory classification of historical claims.

Higher metallurgy and engineering capability can improve the durability, condition and prestige of newly created historical artifacts. Major discoveries can themselves create technical codices, maps, inscriptions, prototypes and other traceable objects.

### Open-ended innovation

The finite foundational tree is not the end of technological history. Mature realms periodically generate deterministic procedural breakthroughs in domains such as agriculture, metallurgy, medicine, navigation, engineering, scholarship, finance, logistics and governance.

These appear as persistent **Synthesis levels** with diminishing returns. The mechanism means a world at Year 20,000 can still create new technical history instead of becoming permanently saturated after the last named technology.

Old detailed breakthrough records compact into 250-year archive blocks, preserving long-run trends without unbounded memory growth.

## v1.6 Treasury of Memory

Important events create persistent crowns, weapons, banners, relics, coins, treaties, chronicles, letters, maps, inscriptions, codices, charters, journals and ledgers. Objects track ownership, condition, authenticity, provenance, loss, rediscovery, circulation and links to historical claims. Rediscovered objects can become new material evidence and change what civilizations believe about the past.

## v1.5 Living Almanac

The calendar contains twelve named months and 365 days. Settlement climate is derived from geography and produces deterministic weather, harvest stress and celestial events. Climate feeds prosperity, population, city prices, crime pressure, trade and realm stability.

## Knowledge & public memory

Important events become objective claims, but realms learn about them through official records, witnesses, merchants, temples, tavern rumours, propaganda, inscriptions, scholarship, artifacts and now printed documentary circulation. Claims can be **confirmed, disputed, legendary, lost or unknown** depending on the selected realm's surviving evidence.

## Main workspaces

- interactive world and historical map layers
- historical timeline replay and endless absolute clock
- realm ledger, diplomacy and wars
- society, rulers, heirs, families and dynasties
- City Explorer and underworld simulation
- cultures, religions, organizations and factions
- procedural Dungeon Studio
- Quest Graph and Dialogue Tree editors
- Creator Studio and bidirectional Living Canon
- adaptive Living Wiki and themed HTML export
- Heraldry & Chronicle Press
- Knowledge & Rumours perspective workbench
- Living Almanac
- Treasury of Memory and museum catalogue export
- **Hall of Discovery**, realm technology comparison, diffusion ledger and Technology Chronicle export
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
wiki-engine.js               cross-linked encyclopedia
artifact-wiki-adapter.js     artifact encyclopedia integration
technology-wiki-adapter.js   technology and breakthrough encyclopedia integration
creator-suite-engine.js      authoring toolkit
canon-bridge-engine.js       authoring ↔ simulation bridge
living-wiki-engine.js        adaptive historical presentation
chronicle-press-engine.js    heraldry, era names and generated press
renderer.js                  map/historical Canvas rendering
```

Browser UI layers are split into matching `*-ui.js` and CSS modules. Later systems use compatibility/bootstrap loaders so WorldForge remains a static GitHub Pages application with no backend or build framework.

## Testing and deployment

Every push to `main` runs JavaScript syntax validation plus the complete regression chain from **v0.1 through v1.7** before GitHub Pages deployment. v1.7 tests cover deterministic chunk-independent technology progression, realm capabilities, discovery history, technology-linked artifacts, printing-driven knowledge sources, endless procedural breakthroughs, diminishing returns, wiki integration, archive compaction and save/export round-trips.

Everything runs locally in the browser; generated worlds are not uploaded by the application.