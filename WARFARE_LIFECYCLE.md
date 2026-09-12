# Warfare Lifecycle Hardening

This milestone separates annual warfare simulation from presentation refreshes.

## Rules
- UI render functions must be read-only and may not call `apply*` simulation functions.
- Occupation resistance, collaboration, control and `yearsOccupied` evolve at most once per simulation year.
- `warfare-lifecycle.js` provides one explicit annual orchestration entry point for strategic AI, commanders, reserves, campaigns, occupation, battlefield history, relics and relic collections.
- Repeated visibility, resize or panel refresh events must not advance simulation state.
- Behavioral regression verifies same-year occupation idempotency and static read-only presentation contracts.

## Follow-up
The remaining legacy monkey-patch wrappers around `initialize` and `simulateWarfareYear` should eventually be collapsed into explicit lifecycle hooks once all dependent modules have migration coverage.
