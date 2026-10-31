import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, relative, isAbsolute, sep, extname } from 'node:path';
import { pathToFileURL } from 'node:url';

export function createPagesServer(directory, prefix = '/WorldForge/') {
  const root = resolve(directory);
  return http.createServer(async (request, response) => {
    try {
      const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (path === '/' || path === prefix.slice(0, -1)) { response.writeHead(302, { Location: prefix }); response.end(); return; }
      if (!path.startsWith(prefix)) { response.writeHead(404); response.end('Not found'); return; }
      const file = resolve(root, path.slice(prefix.length) || 'index.html');
      const local = relative(root, file);
      if (isAbsolute(local) || local === '..' || local.startsWith(`..${sep}`) || (!local.startsWith(`src${sep}`) && !['index.html', 'release.json', 'LICENSE'].includes(local))) {
        response.writeHead(404); response.end('Not found'); return;
      }
      const data = await readFile(file);
      const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }[extname(file)] || 'text/plain';
      response.writeHead(200, { 'Content-Type': `${type}; charset=utf-8`, 'Cache-Control': 'no-store' }); response.end(data);
    } catch { response.writeHead(404); response.end('Not found'); }
  });
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const server = createPagesServer(resolve(import.meta.dirname, '..'));
  const port = Number(process.env.PORT) || 4173;
  server.listen(port, '127.0.0.1', () => console.log(`WorldForge: http://127.0.0.1:${port}/WorldForge/`));
}
