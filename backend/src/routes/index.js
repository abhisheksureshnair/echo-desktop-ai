import * as extension from '../controllers/extension.controller.js';
import { sendJson } from '../utils/http.js';

const routes = new Map([
  ['GET /health', (_request, response) => sendJson(response, 200, { status: 'ok' })],
  ['GET /api/status', extension.status],
  ['POST /api/active', extension.active],
  ['POST /api/disconnect', extension.disconnect],
  ['POST /api/chat', extension.chat],
]);

export async function route(request, response) {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const handler = routes.get(`${request.method} ${pathname}`);

  if (!handler) {
    sendJson(response, 404, { error: 'Route not found.' });
    return;
  }

  try {
    await handler(request, response);
  } catch (error) {
    const isBadRequest = error instanceof SyntaxError || error.message === 'Request body is too large.';
    sendJson(response, isBadRequest ? 400 : 500, {
      error: isBadRequest ? error.message : 'Internal server error.',
    });
  }
}
