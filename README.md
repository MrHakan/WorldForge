# WorldForge

**Procedural World, Civilization & Story Simulation Studio** — a fully client-side deterministic living-world sandbox for GitHub Pages.

**Live:** https://mrhakan.github.io/WorldForge/

## Current release — v1.6 Artifacts, Books & Written Works

WorldForge is a connected emergent-history machine. Geography drives climate; climate changes harvests and markets; societies create wars, faiths, institutions and stories; and those events can now leave behind **physical objects and written records with their own multi-century histories**.

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
15. **v1.5 Living Almanac** — custom 365-day calendar, hemispheric seasons, local climate, monthly weather, daylight, harvest yield, extreme weather, moon phases, eclipses, comets, auroras and climate-to-economy feedback.
16. **v1.6 Treasury of Memory** — persistent crowns, weapons, banners, relics, coins, treaties, chronicles, letters, maps, inscriptions, codices, charters, journals and ledgers with custody, copying, loss, rediscovery, authenticity and evidentiary history.

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
                             └─ Ruins / dungeons / expeditions
                                 └─ Artifacts / books / provenance
                                     ├─ Knowledge / rumours / public memory
                                     └─ Quests / dialogue / authoring
                                         └─ Living Canon
                                             └─ Living Wiki / Chronicle Press
```

## v1.6 Treasury of Memory

Important simulation events can create persistent historical objects. A war may leave behind a ceremonial weapon, banner, journal or chronicle; a peace can create a treaty; a realm foundation can create a charter or crown; a schism can produce a codex, inscription or relic; an expedition can create a journal or survey map.

Artifacts are not static loot entries. Every detailed object tracks:

- creation year, origin, creator, culture and faith context
- owner and custody state
- prestige, material, condition, durability and authenticity
- possible forgery status
- event/entity references
- complete recent provenance trail
- associated objective knowledge claims
- loss site and later rediscovery
- circulation realms and copy count for written works

### Custody and rediscovery

Objects can move between people, realms, settlements, organizations and adventure sites. A bearer can die and pass an object back into institutional custody; conflict can turn objects into trophies; old objects can disappear into ruins; discovered sites can later return them to the world.

Rediscovering an object creates a real historical event and can add a new **material-evidence source** to the Knowledge & Rumours engine. This means archaeology can change what a civilization believes about its own past instead of merely adding flavor text.

```text
Historical event
      ↓
Artifact / written work
      ↓
Ownership / copying / inheritance
      ↓
Loss or political upheaval
      ↓
Ruin / hidden archive
      ↓
Rediscovery
      ↓
New material evidence
      ↓
Public-memory classification changes
      ↓
Wiki / investigation quest / canon consequences
```

Written works can spread through copying. Important circulation thresholds create additional documentary traditions in the knowledge graph, while authenticity and provenance affect how credible the record is.

### Endless-world compatibility

WorldForge does not keep every disposable object at full fidelity forever. Old low-prestige lost or destroyed artifacts are compacted into 250-year archive summaries when the detailed-object budget is exceeded. Important/high-prestige objects remain individually traceable. The result is a persistent material history without linear memory growth over endless-world runs.

## v1.5 Living Almanac

The calendar contains twelve named months and 365 days. Every settlement receives a deterministic climate profile derived from latitude, elevation, biome, moisture, temperature, river proximity and coastal exposure. Severe weather affects harvests, prosperity, prices, population, trade, crime pressure and realm stability, while celestial events can influence religious fervor.

Detailed climate history also uses a rolling retention window and ancient archive summaries so long-run simulation remains bounded.

## Knowledge & public memory

Important events become objective claims, but realms learn about them through official records, witnesses, merchant letters, temple chronicles, tavern rumours, propaganda, inscriptions, scholarship and now **surviving artifacts/written works**. Claims can be **confirmed, disputed, legendary, lost or unknown** depending on the selected realm's evidence. The GM Truth Lens reveals objective simulation truth; uncertain claims can become investigation quests.

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
- **Treasury of Memory** with artifact search, evidence, provenance and museum-catalogue export
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
artifact-engine.js           persistent material culture and written works
wiki-engine.js               cross-linked encyclopedia
artifact-wiki-adapter.js     artifact encyclopedia/provenance integration
creator-suite-engine.js      authoring toolkit
canon-bridge-engine.js       authoring ↔ simulation bridge
living-wiki-engine.js        adaptive historical presentation
chronicle-press-engine.js    heraldry, era names and generated press
knowledge-engine.js          claims, sources, rumours and public memory
renderer.js                  map/historical Canvas rendering
```

Browser UI layers are split into matching `*-ui.js` and CSS modules. Later systems are loaded through compatibility/bootstrap layers so the project remains a static GitHub Pages application with no backend or build framework.

## Testing and deployment

Every push to `main` runs JavaScript syntax validation plus the complete regression chain from **v0.1 through v1.6** before GitHub Pages deployment. Tests cover deterministic generation, history, society, cities/crime, adventure, story, culture/religion, factions, endless simulation, authoring, canon, adaptive wiki themes, heraldry/press, public-memory propagation, climate feedback, calendar/celestial behavior, artifact creation, ownership, loss, rediscovery, knowledge evidence, provenance, bounded compaction and save/export round-trips.

Everything runs locally in the browser; generated worlds are not uploaded by the application.