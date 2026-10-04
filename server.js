/**
 * Dawakhana.com - Simple Local Static Web Server
 * Zero dependencies, built with standard Node.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let cleanUrl = req.url.split('?')[0];
    if (cleanUrl === '/' || cleanUrl === '') {
        cleanUrl = '/index.html';
    }

    const safePath = path.normalize(path.join(__dirname, cleanUrl));
    if (!safePath.startsWith(__dirname)) {
        res.writeHead(403);
        return res.end('Access denied');
    }

    fs.stat(safePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end(`
                <div style="font-family: sans-serif; text-align: center; padding: 50px;">
                    <h2>404 - Page Not Found</h2>
                    <p>The page <code>${cleanUrl}</code> was not found.</p>
                    <a href="/index.html" style="color: #176B63; font-weight: bold;">Return to Dawakhana.com Homepage</a>
                </div>
            `);
        }

        const ext = path.extname(safePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(safePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  🏥 Dawakhana.com Website Server Running!`);
    console.log(`  👉 Local URL: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
});
