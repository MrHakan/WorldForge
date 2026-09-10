(() => {
'use strict';
// The v1 UI is kept in a dedicated module so the version-gated engines remain independently testable.
// document.write is intentional here: it keeps loading synchronous, ensuring renderer hooks install before app.js for GitHub Pages.
document.write('<script src="worldforge-v1-ui.js"><\/script>');
})();