# WorldForge

**Procedural World, Civilization & Story Simulation Studio** — a fully client-side deterministic living-world sandbox for GitHub Pages.

**Live:** https://mrhakan.github.io/WorldForge/

## Current release — v1.4 Knowledge, Rumours & Lost History

WorldForge has grown from a procedural map generator into a connected emergent-history machine. The simulation now distinguishes **objective world state** from **what different realms believe happened**.

### Version line

1. **v0.1 World Generation** — terrain, climate, biomes, rivers, resources, settlements, realms and roads.
2. **v0.2 History** — population, prosperity, migration, trade, diplomacy, alliances, war, conquest and realm collapse.
3. **v0.3 Society** — notable NPCs, families, houses, marriage, inheritance, rulers, heirs and succession crises.
4. **v0.4 Cities & Crime** — districts, businesses, officials, unemployment, guards, corruption, gangs, territory and black markets.
5. **v0.5 Adventure** — history-derived ruins, mines, crypts, caves, keeps, procedural room graphs, encounters, traps, secrets and loot.
6. **v0.6 Story Studio** — branching quest graphs, dialogue trees, persistent variables and entity-bound story generation.
7. **v0.7 Cultures & Religions** — cultures, languages, traditions, values, conversions, holy sites and schisms.
8. **v0.8 Factions & Organizations** — guilds, orders, cults, mercenary companies, political factions, scholar societies and rebel leagues.
9. **v0.9 Endless Simulation Core** — absolute world clock, epoch rebasing, bounded recent detail and deep-history compaction.
10. **v1.0 Creator Studio** — world documents/cards, map annotations, relationships, family trees, mood boards, Quill-style stories, workshop tools and reader preview.
11. **v1.1 Living Canon Bridge** — authoring can materialize into simulation entities; simulation events automatically generate cards, timeline entries, map notes and story hooks.
12. **v1.2 Living Wiki** — adaptive encyclopedia themes derived from war, prosperity, religion, crime, scholarship and deep world age; standalone themed HTML export.
13. **v1.3 Heraldry & Chronicle Press** — deterministic realm heraldry, war banners, dynamic historical era names, themed map frames and automatic newspapers/chronicles.
14. **v1.4 Knowledge, Rumours & Lost History** — source provenance, witnesses, merchant letters, temple records, tavern rumours, propaganda, inscriptions, realm-specific public memory, disputed history, legends, forgotten events and investigation quests.

## Living world chain

```text
Seed
 └─ Planet / terrain / climate
     └─ Settlements / realms / roads
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

## v1.4 epistemic model

Every important historical event can create a **claim** representing objective simulation truth. The public does not read that truth directly. It receives information through persistent source traditions:

- official state records
- witness accounts
- merchant letters
- temple chronicles
- tavern rumours
- partisan propaganda
- durable inscriptions
- later scholarly compilations

Each source has reliability, geographic origin, political bias, polarity, archival durability and propagation speed. Knowledge spreads through the settlement road network, so two realms can have different awareness and confidence about the same event.

A claim may be classified from a selected realm's perspective as:

- **Confirmed** — multiple sufficiently independent sources agree.
- **Disputed** — credible evidence conflicts or partisan narratives compete.
- **Legendary** — the story survives but strong source diversity has decayed.
- **Lost** — public awareness has effectively disappeared.
- **Unknown** — the selected audience has not meaningfully received the claim.

The **GM Truth Lens** can reveal the objective simulation event beside the public narrative. Disputed, legendary and lost claims can also be promoted into Creator Studio investigation quests.

### Endless-memory compatibility

Knowledge does not retain unlimited detailed source graphs forever. Old claims are compacted into 250-year deep-memory archive blocks after the configured retention horizon. Major events remain summarized, and discovered ruins can trigger later rediscovery records. This keeps the epistemic layer compatible with the endless simulation architecture instead of growing linearly with world age.

## Main workspaces

- interactive political, population, prosperity, trade, biome, elevation, temperature and moisture maps
- historical timeline replay
- realm ledger, diplomacy and wars
- society dashboard, rulers, heirs, claims, families and dynasties
- procedural City Explorer and underworld simulation
- culture, religion and organization workspaces
- procedural Dungeon Studio
- Quest Graph and Dialogue Tree editors
- Creator Studio documents, map annotations, relationship graphs, mood boards and Quill stories
- bidirectional Living Canon bridge
- adaptive Living Wiki with themed standalone HTML export
- Heraldry & Chronicle Press with generated historical newspapers
- Knowledge & Rumours workbench with realm-perspective public memory and perspective-codex export
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

Every push to `main` runs JavaScript syntax validation plus the complete regression chain from **v0.1 through v1.4** before GitHub Pages deployment. Tests cover deterministic world generation, history, society, cities/crime, adventure, story, culture/religion, factions, endless simulation, authoring, bidirectional canon, adaptive wiki themes, heraldry/press, epistemic source propagation, knowledge compaction and save/export round-trips.

Everything runs locally in the browser; generated worlds are not uploaded by the application.