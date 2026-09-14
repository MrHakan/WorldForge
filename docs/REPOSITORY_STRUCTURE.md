# Repository structure

WorldForge is a static, client-side browser application. The root is intentionally small: it contains the HTML entrypoint, project documentation, deployment configuration, source modules, and tests.

## Top-level layout

- index.html — GitHub Pages entrypoint; keeps the runtime bootstrap order explicit.
- src/app/ — application bootstrap, compatibility integration, release UI, and workspace navigation.
- src/core/ — foundational simulation engines, renderer, and core styles.
- src/features/<domain>/ — domain-owned engines, loaders, UI, wiki adapters, and feature CSS.
- src/rendering/ — cross-feature map overlays and derived visual renderers.
- src/styles/ — global and extension styles.
- tests/core/ — foundational simulation regression tests.
- tests/features/ — feature-level regression tests.
- tests/warfare/ — warfare lifecycle and strategic systems tests.
- docs/releases/ — version and release notes.
- docs/warfare/ — warfare lifecycle and commander documentation.
- .github/workflows/ — CI and Pages deployment workflows.

## Runtime path convention

This is a static site, so browser asset paths in index.html and dynamic loaders are root-relative (for example, src/features/city/city-engine.js). The script order in index.html remains the canonical initialization order.

Node-based tests run from the repository root and use the same root-relative src/ paths. Tests below tests/ use ../../src/ for CommonJS imports.

## Adding a feature

Keep a feature's runtime files together:

1. engine and state transitions;
2. optional loader and wiki adapter;
3. UI integration;
4. feature stylesheet;
5. regression tests under tests/features/ (or tests/warfare/ for warfare).

Put shared code in src/core/ only when more than one feature genuinely depends on it. Put cross-feature drawing code in src/rendering/, and avoid returning to a flat root namespace.
