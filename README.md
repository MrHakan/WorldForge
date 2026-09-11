# WorldForge

**Procedural World, Civilization & Story Simulation Studio** — a deterministic, fully client-side living-world sandbox for GitHub Pages.

**Live:** https://mrhakan.github.io/WorldForge/

## Current release — v2.1 Treasury, Taxes, Debt & War Finance

WorldForge is built as one causal simulation rather than a collection of unrelated generators. Geography shapes climate and resources; resources feed markets and institutions; institutions create strategic assets; wars create moving armies and fleets; and v2.1 makes those wars financially expensive. Taxes, customs, wages, naval maintenance, logistics, sovereign debt, interest, credit, coin debasement, inflation and default now feed back into prosperity, city prices and political stability.

The map was upgraded alongside v2.1 into a more useful strategic interface: zoom-aware realm and settlement labels, ports and institutional hubs, explicit road-based army supply paths, fiscal-stress markers, improved strategic hover information, and a dedicated **Fiscal** map mode.

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

## Causal simulation chain

```text
Seed / geography
 └─ Climate / weather / resources
     └─ Agriculture / extraction
         └─ Markets / stocks / prices / cargo
             └─ Institutions / industry / Great Works
                 ├─ food and civilian resilience
                 ├─ weapons / tools / ships
                 └─ research / health / logistics
                     └─ Armies / fleets / campaigns
                         ├─ wages and fleet maintenance
                         ├─ physical food and equipment supply
                         ├─ battles / attrition
                         ├─ sieges / blockades
                         └─ war expenditure
                             └─ Taxes / customs / treasury
                                 ├─ deficit
                                 ├─ war bonds / bank loans
                                 ├─ debt service / interest rates
                                 ├─ coin debasement / inflation
                                 └─ sovereign default
                                     └─ city prices / prosperity / stability
                                         └─ politics / history / knowledge / quests / Living Wiki
```

## v2.1 The Exchequer

Every realm has a persistent fiscal account. It records treasury cash, debt, tax and tariff policy, wartime surcharge, borrowing rate, inflation, debasement, coin value, credit score, money supply, annual revenue/expense, current war cost and default history.

### Revenue

Realm revenue is generated from the simulated economy rather than a fixed arbitrary stipend:

- population and prosperity support tax receipts;
- cross-border road trade supports customs/tariff income;
- settlement wealth contributes domain and administrative income;
- wartime states automatically apply a configurable wartime surcharge.

### Expenditure

Military operations now have a state-finance cost on top of the physical resources introduced in v2.0:

- field-army wages scale with actual deployed manpower;
- fleet maintenance scales with active hulls;
- poor supply efficiency creates extra logistics expense;
- civil administration continues to cost money during war;
- outstanding sovereign debt creates annual interest expense.

A realm can therefore be militarily strong and still lose a long war economically.

### Debt and credit

If treasury cash cannot cover expenditure, the state can issue persistent debt instruments. Wartime deficits create **war bonds**; other emergency shortfalls can create **bank loans**. Instruments keep their lender, original principal, outstanding principal, interest rate, issue year, maturity and repayment state.

Debt affects a realm's credit score and future borrowing rate. Sustained surpluses repay outstanding instruments. Heavy debt makes later borrowing progressively more expensive.

### Debasement, inflation and default

A heavily indebted deficit state can expand the money supply and debase its coinage. Inflation then reaches the wider simulation:

```text
War deficit
 → borrowing
 → rising debt service
 → weaker credit
 → higher interest rate
 → monetary finance / debasement
 → inflation
 → higher city price index
 → lower prosperity
 → political instability
```

If deficits persist while debt overwhelms annual revenue and credit collapses, the realm can enter **sovereign default**. Debt is restructured, coin value falls, inflation jumps and political stability receives a major shock. These are first-class History events rather than dashboard-only warnings.

### The Exchequer workspace

The v2.1 interface exposes:

- realm treasury cash and sovereign debt;
- annual fiscal balance;
- tax and tariff burden;
- wartime expenditure;
- credit score and borrowing rate;
- inflation and coin value;
- debt-to-revenue pressure;
- active war bonds and bank loans;
- fiscal-crisis event feed;
- standalone **Fiscal Ledger** JSON export.

Realm treasuries and individual debt instruments are also first-class Universal Encyclopedia articles with cross-links and chronology.

## Strategic map overhaul

The world map is being treated as the main simulation surface rather than a decorative image. v2.1 adds:

- **zoom-aware realm labels** at strategic scale;
- **zoom-aware settlement labels** with population at close zoom;
- collision-aware labels to reduce text overlap;
- **port symbols** for coastal settlements;
- **industrial / Great Work hub markers**;
- army supply lines following their actual settlement/road supply path rather than only a straight source line;
- operational route hints at close zoom;
- siege, blockade, army and fleet overlays inherited from v2.0;
- **fiscal-stress rings** around vulnerable capitals;
- a persistent strategic-map toolbar for Labels, Hubs, Supply and Fiscal Stress;
- improved settlement hover information with treasury/debt/inflation/credit, nearby armies and siege state;
- a dedicated **Fiscal map layer** that shades realm territory from stable credit to severe debt/inflation crisis;
- live zoom/map-unit readout.

Historical replay remains readable: present-only strategic overlays are suppressed when the user is viewing an old historical snapshot.

## v2.0 War Room

Active History wars can produce persistent Field Army and War Fleet entities. Armies have home settlements, map positions, operational targets, road routes, manpower, morale, readiness, equipment, food supply, supply origins and explicit supply paths. Fleets use shipyard-built hulls, provisions, ports and navigation/logistics capability.

Opposing forces that meet physically resolve deterministic battles. Armies reaching hostile settlements can begin persistent sieges that consume local food and damage prosperity/institutions. Fleets at hostile ports can establish blockades that deny inbound cargo. Successful operations push the same History war state and settlement ownership used everywhere else in WorldForge.

## Endless-world compatibility

WorldForge has no fixed gameplay-year ceiling in the v0.9+ simulation architecture. The engine uses an absolute clock with local epoch rebasing so older layers remain numerically stable. Recent detail is retained richly while old routine telemetry is compacted into archive blocks. Practical run length is still bounded by browser CPU/RAM and JavaScript numeric limits rather than being mathematically infinite.

Fiscal annual records use the same philosophy: current accounts and debt remain detailed while sufficiently old routine annual rows compact into 250-year archive summaries.

## Universal Encyclopedia

The encyclopedia can cross-link simulation entities including realms, settlements, people, houses, cultures, religions, organizations, sites, quests, dialogue, events, ancient eras, artifacts, technologies, commodities, markets, institutions, Great Works, armies, fleets, sieges, battles, realm treasuries and sovereign debt instruments.

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
wiki-engine.js               cross-linked encyclopedia
*-wiki-adapter.js            late-system encyclopedia integration
renderer.js                  base Canvas world renderer
map-enhancement.js           strategic labels, hubs and supply overlays
map-finance-layer.js         fiscal territory layer and hover intelligence
*-ui.js / *-loader.js        browser workspaces and compatibility bootstraps
```

## Testing and deployment

Every push to `main` runs JavaScript syntax validation plus the full deterministic regression chain from **v0.1 through v2.1** before GitHub Pages deployment.

The v2.1 regression suite verifies tax collection, explicit military expenditure, automatic wartime borrowing, war-bond creation, credit/interest feedback, inflation and coin-value pressure, sovereign default, city-price and political-stability feedback, Universal Encyclopedia integration, deterministic `4 years == 2 + 2 years` caller chunking, and save/export round-trips. The existing 12,500-year Endless Simulation regression remains part of the same gate.

Everything runs locally in the browser; generated worlds are not uploaded by the application.