# WorldForge

**Procedural World, Civilization & Story Simulation Studio**

Live site: https://mrhakan.github.io/WorldForge/

## Current milestone

### v0.1 — World Generation

WorldForge currently generates a deterministic founding world from a seed and exposes it through an interactive browser map.

Implemented systems:

- Seeded deterministic procedural generation
- Elevation, temperature and moisture layers
- Climate-aware biome classification
- Ocean / deep-ocean separation
- Resource hints
- River generation with downhill routing
- Settlement suitability scoring
- Cities, towns, villages and capitals
- Founding kingdoms with political territory
- Road graph between settlements and capitals
- Interactive map with pan / zoom
- Political, biome, elevation, temperature and moisture map modes
- Settlement hover details and focus
- Kingdom ledger and settlement table
- Local save/load
- `.worldforge.json` import/export
- Versioned world-state schema
- Deterministic regression tests in GitHub Actions
- GitHub Pages deployment

## Version gate

Development is intentionally milestone-gated.

- **v0.1 — World Generation** ✅
- **v0.2 — History** — population, economy, diplomacy, war, timeline
- **v0.3 — Society** — notable NPCs, families, dynasties, succession
- **v0.4 — Cities & Crime** — city districts, gangs, crime economy
- **v0.5 — Adventure** — historical ruins, dungeons, enemies, loot
- **v0.6 — Story Studio** — quest graph, dialogue tree, variables/conditions
- **v1.0 — WorldForge** — integrated simulation, encyclopedia, replay, complete persistence

The next version is not started until the current milestone passes its generation, state-contract, serialization and deployment checks.

## World-state contract

v0.1 exports a stable schema containing:

```text
schemaVersion
engineVersion
settings
name
epoch
layers
  elevation
  temperature
  moisture
  biome
  resources
  political
rivers
settlements
kingdoms
roads
summary
```

Future simulation systems are intended to layer data onto this state instead of regenerating terrain.

## Architecture

The first milestone is deliberately dependency-light:

```text
index.html      UI shell
styles.css      responsive interface
engine.js       deterministic world-generation engine
renderer.js     interactive canvas map
app.js          UI/state orchestration
tests/          headless deterministic regression tests
.github/        Pages CI/deployment
```

The simulation engine is UI-independent and runs under Node in CI. Later milestones can move history simulation into a Web Worker without changing the v0.1 world-state contract.

## Generation notes

Settlement positions are not uniformly random. Site suitability considers temperature comfort, moisture, coast access, river access, terrain and local resource hints. Kingdom capitals are selected from strong, geographically separated settlements. Political territory is derived from capital proximity with deterministic local variation, while roads connect settlements within each realm.

## Development

No build step is required for v0.1. Open `index.html` through a local web server or deploy through GitHub Pages.

Pushes to `main` run JavaScript syntax checks, static-asset checks, deterministic world-generation regression tests, JSON round-trip/state-contract tests, and GitHub Pages deployment.

## Status

Early development project. Generated worlds are fictional and intended for creative simulation, worldbuilding and game-design experimentation.