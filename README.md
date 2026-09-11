# WorldForge

**Procedural World, Civilization & Story Simulation Studio** — a deterministic, fully client-side living-world sandbox designed for long-running simulation and GitHub Pages.

**Live:** https://mrhakan.github.io/WorldForge/

## Current release — v4.0 World Building & Pixel Civilization

WorldForge is one causal simulation rather than a collection of disconnected generators. Geography shapes climate and resources; resources feed markets and institutions; institutions create jobs and strategic assets; households and housing create demographic and urban pressure; municipal systems, emergencies, food security and politics feed social stability; diplomacy and military power shape the international order; and v4.0 projects that simulation into a deterministic visual civilization layer.

The v4.0 worldbuilding system creates a compact visual profile for every settlement from existing simulation state. Population, prosperity, trade, housing pressure, slums, municipal services, culture, geography, guard strength and realm importance determine settlement type, districts, structure composition, fortifications and visual identity.

Pixel previews are deterministic and derived rather than stored as heavyweight entities. The renderer uses crisp-edge SVG primitives and aggregate district/structure counts, allowing WorldForge to visualize cities, ports, fortresses, frontier settlements and villages without simulating every individual building as a persistent object.

## Current major systems

- deterministic procedural geography, terrain, climate, biomes, rivers, resources, settlements, realms and roads;
- long-running history with migration, trade, diplomacy, war, conquest, collapse and historical replay;
- people, houses, inheritance, rulers, heirs and succession crises;
- cities, districts, businesses, corruption, guards, gangs and crime;
- cultures, religions, languages, traditions, values and schisms;
- organizations, guilds, orders, cults, mercenaries, scholars and rebels;
- adventure sites, ruins, mines, crypts, caves, keeps and room graphs;
- branching quests, dialogue and story generation;
- endless simulation with epoch rebasing and deep-history compaction;
- Creator Studio and bidirectional Living Canon;
- adaptive Universal Encyclopedia / Living Wiki;
- heraldry, chronicles, era names and generated newspapers;
- knowledge, rumours, propaganda, evidence and lost history;
- calendar, seasons, weather and celestial phenomena;
- artifacts, books, provenance, copying, loss and rediscovery;
- technology, inventions, adoption and diffusion;
- agriculture, extraction, physical stocks, prices, cargo, shortages and supply chains;
- institutions, industry, universities, hospitals, museums, shipyards and Great Works;
- operational armies, fleets, logistics, battles, sieges and blockades;
- treasury, taxation, customs, debt, credit, inflation, debasement and sovereign default;
- workforce, professions, conscription, migration and refugees;
- households, social classes, demography and household economics;
- housing, land ownership, rents, construction, overcrowding and urban development;
- municipal infrastructure, public services, service inequality and municipal finance;
- public health, disease, fire and emergency response;
- food security, famine and humanitarian relief;
- politics, legitimacy, factions, unrest and internal instability;
- diplomacy, treaties, rivalries and international relations;
- great-power ranking, blocs, spheres of influence, balancing and world-order polarity;
- settlement worldbuilding, districts, structure archetypes and deterministic pixel previews.

## Version line

1. **v0.1 World Generation** — terrain, climate, biomes, rivers, resources, settlements, realms and roads.
2. **v0.2 History** — population, prosperity, migration, trade, diplomacy, alliances, war, conquest and collapse.
3. **v0.3 Society** — notable people, houses, marriage, inheritance, rulers, heirs and succession crises.
4. **v0.4 Cities & Crime** — districts, businesses, guards, corruption, gangs, territory and black markets.
5. **v0.5 Adventure** — history-derived ruins, mines, crypts, caves, keeps, room graphs, encounters and loot.
6. **v0.6 Story Studio** — branching quests, dialogue trees, variables and entity-bound story generation.
7. **v0.7 Cultures & Religions** — cultures, languages, traditions, values, conversion, holy sites and schisms.
8. **v0.8 Factions & Organizations** — guilds, orders, cults, mercenaries, political factions, scholars and rebels.
9. **v0.9 Endless Simulation Core** — absolute clock, epoch rebasing, bounded recent detail and deep-history compaction.
10. **v1.0 Creator Studio** — documents, annotations, relationships, family trees, mood boards, stories and reader preview.
11. **v1.1 Living Canon Bridge** — authoring materializes into simulation entities and simulation produces canon material.
12. **v1.2 Living Wiki** — adaptive encyclopedia presentation derived from the current historical age.
13. **v1.3 Heraldry & Chronicle Press** — heraldry, war banners, era names and generated newspapers.
14. **v1.4 Knowledge, Rumours & Lost History** — truth, public memory, propaganda, disputed claims and rediscovery.
15. **v1.5 Living Almanac** — calendar, seasons, local weather, harvest pressure and celestial phenomena.
16. **v1.6 Treasury of Memory** — artifacts, books, provenance, copying, loss, rediscovery and material evidence.
17. **v1.7 Hall of Discovery** — technology, adoption, diffusion, printing and procedural breakthroughs.
18. **v1.8 World Market** — physical stocks, production, consumption, prices, shortages, cargo, famine and supply chains.
19. **v1.9 Civic Foundry** — institutions, industrial chains, granaries, libraries, universities, hospitals, museums, shipyards and Great Works.
20. **v2.0 War Room** — moving armies and fleets, supply, attrition, battles, sieges, blockades and operational overlays.
21. **v2.1 The Exchequer** — taxation, customs, war spending, debt, credit, inflation, debasement and sovereign default.
22. **v2.2 The Labor Exchange** — demographic labor pools, professions, wages, skills, vacancies, conscription, migration and refugees.
23. **v2.3 Households & Social Classes** — household formation, class structure, income, poverty, literacy and demography.
24. **v2.4 Housing, Land & Urban Development** — tenure, land ownership, rents, construction, overcrowding and slum pressure.
25. **v2.5 Municipal Infrastructure & Public Services** — water, sanitation, roads, waste, fire protection, schools, healthcare, transit and lighting.
26. **v2.6 Health, Disease, Fire & Emergency Response** — aggregate disease pressure, emergencies, response capacity and urban fire consequences.
27. **v2.7 Food Security, Famine & Humanitarian Relief** — food stress, famine pressure and relief systems.
28. **v2.8 Politics & Unrest** — legitimacy, factions, political pressure and domestic instability.
29. **v2.9 Diplomacy & International Relations** — bilateral relations, treaties, rivalries and diplomatic state.
30. **v3.0 Geopolitical Blocs & World Orders** — great powers, blocs, spheres of influence, balancing, congresses and polarity.
31. **v4.0 World Building & Pixel Civilization** — simulation-driven settlement identities, districts, structures and deterministic pixel settlement previews.

## v4.0 World Building & Pixel Civilization

Every settlement receives a compact worldbuilding profile containing:

- settlement type;
- culture and biome visual style;
- wealth, defense and importance tiers;
- condition, service, housing and slum pressure;
- normalized districts;
- aggregate structure inventory;
- deterministic preview seed;
- visual identity text derived from simulation state.

### Settlement and district logic

WorldForge can visually distinguish capitals, port cities, fortress cities, frontier outposts, cities, towns, villages and hamlets. Existing City districts are reused where available and normalized into worldbuilding district archetypes. Smaller settlements receive deterministic fallback layouts rather than requiring a separate heavyweight urban simulation.

Current district archetypes include:

- Old Town;
- Residential;
- Market;
- Harbor;
- Temple;
- Military;
- Noble;
- Civic;
- Industrial;
- Slums;
- Outskirts.

### Structure archetypes

The first v4.0 registry provides reusable structures across housing, commerce, religion, industry, agriculture, civic infrastructure, defense and maritime activity. Examples include houses by wealth class, merchant houses, market stalls, warehouses, workshops, temples, civic halls, wells, granaries, farms, barracks, watchtowers, wall segments, gates, docks and shipyards.

Fortified settlements are guaranteed to expose visible defensive structures. Coastal and river settlements can gain harbor districts and maritime structures when their simulation state supports them.

### Pixel renderer

The current renderer produces deterministic SVG settlement previews using crisp-edge primitives. It draws district structure composition together with roads, waterways, coastlines and fortifications. The same world, year and settlement state produce the same preview.

The renderer is intentionally derived and lightweight:

- previews are not serialized into world saves;
- no persistent entity is created for every individual building;
- compact district and structure counts drive rendering;
- runtime indexes live in `WeakMap` caches outside serialized state.

### Worldbuilding Atelier

The browser UI adds a **Worldbuilding Atelier** with:

- settlement selection;
- deterministic pixel preview;
- visual identity and settlement metadata;
- district breakdown;
- structure inventory;
- JSON Worldbuilding Ledger export.

Worldbuilding is also integrated into the Universal Encyclopedia with article types for settlement worldbuilding, districts, structure archetypes and visual identity.

## Causal simulation chain

```text
Seed / geography
  → climate / weather / resources
  → agriculture / extraction / production
  → markets / stocks / prices / cargo
  → institutions / industry / Great Works
  → workforce / professions / wages / migration
  → households / social classes / demography
  → housing / land / rent / construction
  → municipal infrastructure / public services
  → health / emergencies / food security
  → politics / unrest
  → diplomacy / military / treasury
  → great powers / blocs / spheres / world order
  → settlement worldbuilding
  → districts / structures / pixel civilization
```

The later layers derive from earlier simulation state rather than replacing it. Visual worldbuilding therefore reflects the same population, economy, institutions, politics and history used elsewhere in WorldForge.

## Architecture

```text
engine.js                     founding geography
history-engine.js             civilization/history simulation
society-engine.js             people, houses and dynasties
city-engine.js                cities, economy, law and crime
culture-engine.js             culture and religion
faction-engine.js             organizations and influence
adventure-engine.js           historical sites and dungeon graphs
story-engine.js               quests and dialogue
endless-engine.js             absolute clock, rebasing and compaction
calendar-engine.js            seasons, weather and celestial simulation
knowledge-engine.js           claims, evidence, rumours and memory
artifact-engine.js            persistent material/written culture
technology-engine.js          research, adoption and diffusion
resource-engine.js            production, stocks, prices and cargo
institution-engine.js         institutions, industry and Great Works
military-engine.js            armies, fleets, supply, combat and siege
treasury-engine.js            taxes, spending, debt, credit and inflation
workforce-engine.js           demography, jobs, conscription and migration
household-engine.js           households, classes and demographic economy
housing-engine.js             housing, land, rent and urban development
municipal-engine.js           public infrastructure and municipal finance
emergency-engine.js           health, disease, fire and emergency response
nutrition-engine.js           food security, famine and relief
politics-engine.js            legitimacy, factions and unrest
diplomacy-engine.js           bilateral international relations
world-order-engine.js         great powers, blocs and world order
worldbuilding-engine.js       settlement worldbuilding profiles
structure-archetypes.js       reusable visual structure registry
pixel-structure-renderer.js   deterministic crisp-edge settlement renderer
worldbuilding-ui.js           Worldbuilding Atelier
worldbuilding-wiki-adapter.js Encyclopedia worldbuilding integration
*-ui.js / *-loader.js         browser workspaces and compatibility bootstraps
```

## Determinism and performance

WorldForge is designed for long-running deterministic worlds. New systems should preserve:

- deterministic output from the same seed and simulation path;
- caller chunking consistency such as `4 years == 2 + 2`;
- same-year idempotency where annual systems can be called more than once;
- bounded historical detail with archival compaction;
- compact aggregate state rather than unnecessary entity explosion;
- runtime-only indexes and caches outside saved world data.

v4.0 follows those rules by storing one compact worldbuilding profile per settlement plus bounded district/structure summaries while generating pixel previews on demand.

## Testing and deployment

GitHub Actions contains the historical deterministic regression chain for the original v0.1→v2.2 stack plus dedicated compatibility workflows for v2.3 through v4.0.

The v4.0 regression verifies settlement coverage, district/structure coverage, deterministic crisp-edge SVG output, Universal Encyclopedia integration, runtime-cache reuse, same-year idempotency, deterministic caller chunking, Workforce and World Order compatibility, save/export round trips, maritime harbor behavior and fortified-settlement visual invariants.

`main` is the deployment source for GitHub Pages. A release is considered complete only after the relevant dedicated workflow gates and the Pages validation/deployment succeed.

## Direction after v4.0

The next visual-development line focuses on deeper historical landscape and architecture rather than a parallel simulation. Planned work includes culture-specific architecture families, historical landmarks, ruins, abandoned settlements, battlefields, monuments, bridges, canals, lighthouses, fortified ports and a richer world → settlement → district visual zoom hierarchy.

Everything runs locally in the browser; generated worlds are not uploaded by the application.
