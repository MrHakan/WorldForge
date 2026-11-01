# Current WorldForge Release

## v5.4.0 — WebGL Atlas

Terrain and settlement geometry now render through WebGL. Pan and zoom reuse persistent GPU buffers; terrain shading is evaluated per pixel instead of enlarging cached terrain images. Buildings retain sharp roof, masonry, door and window geometry at close zoom. Context restoration and a bounded Canvas fallback keep the map usable when a browser loses GPU access.

See [V5.4.md](V5.4.md) for release notes and validation.
