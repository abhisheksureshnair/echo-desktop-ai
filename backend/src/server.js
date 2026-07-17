import http from 'node:http';
import { config } from './config/env.js';
import { route } from './routes/index.js';
import { sendJson } from './utils/http.js';

const server = http.createServer(async (request, response) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.writeHead(204);
    response.end();
    return;
  }

  await route(request, response);
});

server.listen(config.port, config.host, () => {
  console.log(`Echo backend listening at http://${config.host}:${config.port} (${config.nodeEnv})`);
});

server.on('error', (error) => {
  console.error('Unable to start backend:', error.message);
  process.exitCode = 1;
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
