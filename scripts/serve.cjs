const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const mime = {'.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.map': 'application/json'};
const server = http.createServer((request, response) => {
    let filename;
    try { filename = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname)); }
    catch { response.writeHead(400).end('Bad request'); return; }
    if (filename !== root && !filename.startsWith(root + path.sep)) { response.writeHead(403).end('Forbidden'); return; }
    if (filename === root) filename = path.join(root, 'index.html');
    fs.readFile(filename, (error, data) => {
        if (error) { response.writeHead(404).end('Not found'); return; }
        response.writeHead(200, {'Content-Type': mime[path.extname(filename)] || 'application/octet-stream', 'Cache-Control': 'no-store'});
        response.end(data);
    });
});
server.listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log(`Game running at http://localhost:${server.address().port}`));
