# Warfare Lifecycle & Simulation Hook Registry

WorldForge now separates annual warfare simulation from presentation refreshes and from module load order.

## Authoritative execution model
- `warfare-hooks.js` captures the base Warfare & Supply `initialize` and `simulateWarfareYear` functions immediately after the core engine loads.
- Annual mutating systems are registered as deterministic ordered hooks.
- After all warfare modules load, `WorldForgeWarfareHooks.activate()` restores the captured base simulation boundary and installs one dispatcher.
- Legacy per-module `initialize` / `simulateWarfareYear` monkey patches have been removed from the warfare modules themselves; the registry is now the sole annual orchestration boundary.
- `initialize()` prepares state only. Annual hooks run after a real `simulateWarfareYear` pass.
- The dispatcher advances at most once for a given simulation year unless an explicit manual force run is requested.

## Hook order
1. Mobilization
2. Military pathfinding
3. Naval warfare
4. Diplomacy / hostility reconciliation
5. Post-war recovery
6. War goals & peace
7. Strategic AI
8. Commanders
9. Commander legacies
10. Battlefield history
11. Battlefield relics
12. Relic collections
13. Strategic reserves
14. Campaign planning
15. Occupation policy
16. Excavation projects
17. Relic journeys
18. National memory

The order is explicit and stable instead of being an accidental consequence of nested monkey patches.

## Presentation rules
- UI render functions are read-only and may not call `apply*` simulation functions.
- Resize, visibility, map-layer toggles and selection changes cannot advance simulation state.
- Occupation resistance, collaboration, control and `yearsOccupied` evolve at most once per simulation year.
- `warfare-lifecycle.js` remains as a compatibility facade and delegates to the hook registry; it no longer wraps `simulateWarfareYear`.
- Summary and city-view adapters remain module-local because they are read-only query enrichment, not annual simulation progression.

## Regression guarantees
- Warfare feature modules are forbidden from reassigning `Warfare.initialize` or `Warfare.simulateWarfareYear`.
- Hooks execute by `(order, id)` deterministically.
- A repeated same-year simulation does not re-run annual hooks.
- Advancing to a new year runs the hook chain exactly once.
- Historical warfare extensions are loaded centrally by `worldbuilding-loader.js`; relic collections no longer bootstrap scripts as a side effect.
- `tests/warfare-legacy-wrapper-source.test.js` statically guards the cleaned module set against lifecycle monkey-patch regressions.
