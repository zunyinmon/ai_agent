const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const db = new Database(path.join(__dirname, 'cars.db'));
const port = Number(process.env.PORT) || 3000;

const server = http.createServer((request, response) => {
  if (request.url === '/api/cars') {
    const cars = db.prepare('SELECT id, make, color FROM cars').all();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify(cars));
    return;
  }

  const pages = {
    '/': 'index.html',
    '/index.html': 'index.html',
    '/about.html': 'about.html',
    '/contact.html': 'contact.html'
  };

  if (pages[request.url]) {
    const page = fs.readFileSync(path.join(__dirname, pages[request.url]));
    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(page);
    return;
  }

  response.writeHead(404, { 'Content-Type': 'text/plain' });
  response.end('Not found');
});

server.listen(port, () => {
  console.log(`Open http://localhost:${port}`);
});