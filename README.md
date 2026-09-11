# WorldForge

**Procedural World, Civilization & Story Simulation Studio** — a deterministic, fully client-side living-world sandbox for GitHub Pages.

**Live:** https://mrhakan.github.io/WorldForge/

## Current release — v2.2 Population Classes, Workforce, Professions & Conscription

WorldForge is built as one causal simulation rather than a collection of unrelated generators. Geography shapes climate and resources; resources feed markets and institutions; institutions create jobs and strategic assets; wars raise moving armies and fleets; the Exchequer pays for them; and v2.2 now makes the population itself the labor source behind farms, mines, foundries, ports, hospitals, libraries, armies and migration.

The workforce layer divides settlement populations into children, working-age residents, elders, labor-force participants, employed workers, unemployed workers and mobilized manpower. Real occupations are generated from local geography, resources, institutions, trade, urbanization, war and technology. Conscription removes people from civilian employment, vacancies raise labor pressure, and unemployment, sieges, food stress, recruitment pressure and fiscal crises can physically move people between settlements as labor migrants or refugees.

The map was expanded alongside the system with dedicated **Workforce** and **Migration** layers, recruitment-pressure rings, specialist-job hubs, migration/refugee arrows and workforce-aware settlement tooltips.

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
20. **v2.0 War Room** — moving armies and fleets, supply, attrition, battles, sieges, blockades and operational map overlays.
21. **v2.1 The Exchequer + Strategic Map** — taxation, customs, war spending, debt, interest, credit, debasement, inflation, sovereign default and cartographic overhaul.
22. **v2.2 The Labor Exchange + Population Map** — demographic labor pools, 76 professions, wages, skills, vacancies, institution staffing, conscription, migration, refugees and workforce cartography.

## Causal simulation chain

```text
Seed / geography
 └─ Climate / weather / resources
     └─ Agriculture / extraction
         └─ Markets / stocks / prices / cargo
             └─ Institutions / industry / Great Works
                 └─ Job demand / skills / wages / vacancies
                     └─ Population labor force
                         ├─ civilian employment
                         ├─ specialist occupations
                         ├─ unemployment
                         └─ conscription / mobilization
                             ├─ farms / mines / workshops lose workers
                             ├─ staffing pressure changes production
                             ├─ armies consume manpower and wages
                             └─ migration / refugees
                                 └─ settlement population shifts
                                     └─ markets / prices / taxes / military capacity
                                         └─ politics / history / knowledge / quests / Living Wiki
```

## v2.2 The Labor Exchange

### Population and labor accounting

Every settlement now tracks a demographic labor structure:

- total population;
- children;
- working-age population;
- elders;
- labor-force participation;
- employed civilians;
- unemployed residents;
- mobilized / conscripted manpower;
- open vacancies;
- wage and skill indices;
- recruitment and migration pressure.

Labor demand is not a fixed percentage of population. It is generated from local conditions: settlement size and prosperity, rural or urban character, coast access, natural-resource suitability, ports and trade, capital status, active wars, technology and the physical institutions present in that settlement.

### 76 real and contextual professions

The initial profession registry contains 76 concrete occupations across agriculture, extraction, food processing, crafts, industry, maritime work, transport, logistics, military support, public service, finance, commerce, health, knowledge, religion, education, engineering and administration.

Examples include **Field Farmer, Paddy Farmer, Shepherd, Cattle Herder, Fisher, Logger, Iron Miner, Coal Miner, Miller, Baker, Foundry Worker, Blacksmith, Armorer, Weaponsmith, Carpenter, Stone Mason, Dockworker, Shipwright, Merchant Sailor, Wagoner, Warehouse Keeper, City Guard, Merchant, Banker, Healer, Scribe, Scholar, Priest and Civil Engineer**.

World context can also create more distinctive specialist or rare occupations, including:

- **Harbor Pilot** — appears only in sufficiently developed coastal settlements;
- **Ship Chandler** — supplies vessels with stores and provisions;
- **Ship Caulker, Ropemaker and Sailmaker** — specialist shipyard trades;
- **Lighthouse Keeper** — coastal navigation specialist;
- **Caravan Master** — organizes long-distance overland trade;
- **Military Quartermaster** — supports active armies and their supply chains;
- **Siege Engineer** — depends on wartime demand and engineering capability;
- **Army Surgeon** — combines wartime demand with hospital infrastructure;
- **Customs Inspector** — tied to ports and trade taxation;
- **Moneyer** — capital-based specialist responsible for coinage;
- **Archivist, Bookbinder and Manuscript Illuminator** — tied to libraries and archives;
- **Cartographer and Astronomer** — tied to universities / observatories;
- **Museum Curator and Relic Keeper** — tied to collections and sacred institutions;
- **Fire Watch** — an urban safety occupation.

These professions are simulation data, not cosmetic labels. They have skill and wage levels, local worker counts, vacancies and environmental/institutional requirements.

### Institution staffing and production

Facilities receive a live `workforceFactor`, actual worker count and staffing gap from the local labor market. A settlement that loses workers to war, emigration or demographic pressure can therefore leave farms, foundries, hospitals, shipyards or archives understaffed.

The workforce layer is deliberately compatible with the v1.9 production engine: it does not replace its resource rules, but supplies the staffing state needed for progressively deeper production effects.

### Conscription

Active military manpower is mapped back onto each realm's civilian labor force. Mobilization is distributed spatially across settlements rather than appearing from nowhere, with rural areas carrying somewhat more levy pressure.

```text
War begins
 → armies require manpower
 → people are mobilized from settlement labor pools
 → civilian labor availability falls
 → vacancies / wage pressure rise
 → institutions and productive sectors face staffing pressure
 → households may migrate
 → tax and production capacity can weaken
```

The labor system therefore closes the population side of the military economy introduced in v2.0 and v2.1.

### Migration and refugees

Population movement is now explicit between settlement endpoints. Unemployment, conscription, food insecurity, crime, fiscal strain and siege conditions create outward pressure; vacancies, prosperity and safety attract workers.

Movements physically subtract population from the origin settlement and add it to the destination. The workforce-only migration step conserves total population. Cross-realm and siege-driven movements can become **refugee flows** and produce historical events.

### Detailed professions for notable people

Existing Society NPC occupations remain intact for compatibility, but living notable people can also receive a contextual `notableProfession` and `professionId`. A generic historical “Scholar” may therefore become an Astronomer, Cartographer or Archivist if that person's settlement actually supports the profession.

### The Labor Exchange workspace

The new interface includes:

- world labor-force, employment and unemployment totals;
- mobilized manpower and recruitment rate;
- vacancy and specialist counts;
- settlement labor-market cards;
- children / working-age / elder demographic breakdowns;
- wages and skill state;
- sector summaries;
- searchable/filterable profession registry;
- specialist and rare-job listings;
- migration and refugee feed;
- standalone **Workforce Ledger** JSON export.

`Profession`, `Labor Market` and `Migration` are first-class Universal Encyclopedia article types with links to settlements, realms and related occupations.

## v2.2 workforce and population map

The map receives another simulation-oriented pass:

- a dedicated **Workforce** territory layer, shading realm labor stress from green through yellow to red;
- a dedicated **Migration** layer;
- directional labor-migration arrows;
- distinct refugee-flow arrows;
- arrow thickness based on people moved;
- recruitment-pressure rings around settlements;
- high-zoom levy labels;
- employment / specialist hub rings;
- rare-specialist markers;
- persistent toolbar toggles for **Jobs**, **Migration flows** and **Recruitment**;
- settlement tooltips with employed population, unemployment, vacancies, mobilized manpower and leading professions.

These additions sit on top of the v2.1 strategic-map features for realm labels, ports, institutions, fiscal stress and military supply lines. Present-only labor and military overlays remain hidden during historical replay.

## v2.1 The Exchequer

Every realm has a persistent fiscal account recording treasury cash, debt, tax and tariff policy, wartime surcharge, borrowing rate, inflation, debasement, coin value, credit score, money supply, annual revenue/expense, current war cost and default history.

Revenue is tied to population, prosperity, trade and customs. Field-army wages, fleet maintenance, logistics and sovereign interest create expenditure. Deficits can generate war bonds or bank loans, high debt weakens credit and raises borrowing costs, and severe fiscal stress can lead to debasement, inflation and sovereign default. Those shocks feed city prices, prosperity and political stability.

## v2.0 War Room

Active History wars can produce persistent Field Army and War Fleet entities. Armies have home settlements, map positions, operational targets, road routes, manpower, morale, readiness, equipment, food supply, supply origins and explicit supply paths. Fleets use shipyard-built hulls, provisions, ports and navigation/logistics capability.

Opposing forces that meet physically resolve deterministic battles. Armies reaching hostile settlements can begin persistent sieges that consume local food and damage prosperity/institutions. Fleets at hostile ports can establish blockades that deny inbound cargo. Successful operations push the same History war state and settlement ownership used everywhere else in WorldForge.

## Endless-world compatibility

WorldForge has no fixed gameplay-year ceiling in the v0.9+ architecture. The absolute clock uses local epoch rebasing while routine historical telemetry is compacted into archive blocks. Workforce annual rows follow the same principle: current labor markets remain detailed while sufficiently old annual labor statistics compact into 250-year archive summaries.

## Universal Encyclopedia

The encyclopedia can now cross-link realms, settlements, people, houses, cultures, religions, organizations, sites, quests, events, artifacts, technologies, commodities, markets, institutions, Great Works, armies, fleets, sieges, battles, treasuries, sovereign debt instruments, professions, labor markets and population movements.

## Architecture

```text
engine.js                    founding geography
history-engine.js            civilization/history simulation
society-engine.js            people, houses and dynasties
city-engine.js               cities, economy, law and crime
culture-engine.js            culture and religion
faction-engine.js            organizations and influence
adventure-engine.js          historical sites and dungeon graphs
story-engine.js              quests and dialogue
endless-engine.js            absolute clock, rebasing and compaction
calendar-engine.js           seasons, weather and celestial simulation
knowledge-engine.js          claims, evidence, rumours and memory
artifact-engine.js           persistent material/written culture
technology-engine.js         research, adoption and diffusion
resource-engine.js           production, stocks, prices and cargo
institution-engine.js        institutions, industry and Great Works
military-engine.js           armies, fleets, supply, combat and siege
treasury-engine.js           taxes, spending, debt, credit and inflation
workforce-engine.js          demography, jobs, conscription and migration
workforce-calibration.js     labor-demand balance and calibrated migration
wiki-engine.js               cross-linked encyclopedia
workforce-wiki-adapter.js    professions, labor markets and migration articles
renderer.js                  base Canvas world renderer
map-enhancement.js           strategic labels, hubs and supply overlays
map-finance-layer.js         fiscal territory layer and hover intelligence
workforce-map-layer.js       labor stress, recruitment and migration overlays
*-ui.js / *-loader.js        browser workspaces and compatibility bootstraps
```

## Testing and deployment

Every push to `main` runs JavaScript syntax validation plus the full deterministic regression chain from **v0.1 through v2.2** before GitHub Pages deployment.

The v2.2 regression verifies the 76-profession catalog and rare specialist jobs, settlement labor-market coverage, real mobilization from civilian labor pools, institution staffing factors, detailed professions on Society notables, agriculture/industry/knowledge employment, Universal Encyclopedia integration, population-conserving workforce migration, calibrated employment, deterministic `4 years == 2 + 2 years` caller chunking and save/export round-trips.

During release calibration an early technically valid model produced roughly 60% unemployment and no useful vacancy-driven migration. That balance was rejected rather than shipped. The final wartime regression fixture settles at about **2.8% unemployment**, **5.9% labor-force mobilization**, **4,407 open positions** and active refugee/labor movement, while preserving deterministic simulation behavior.

The existing 12,500-year Endless Simulation regression remains part of the same gate.

Everything runs locally in the browser; generated worlds are not uploaded by the application.