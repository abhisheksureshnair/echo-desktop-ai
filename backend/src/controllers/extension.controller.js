import { buildChatReply } from '../services/chat.service.js';
import { disconnectExtension, getExtensionStatus, setActiveTab } from '../services/extension.service.js';
import { readJson, sendJson } from '../utils/http.js';

export function status(_request, response) {
  sendJson(response, 200, getExtensionStatus());
}

export async function active(request, response) {
  const { url, title } = await readJson(request);
  const extension = setActiveTab({ url, title });
  sendJson(response, 200, { status: 'ok', extension });
}

export function disconnect(_request, response) {
  const extension = disconnectExtension();
  sendJson(response, 200, { status: 'ok', extension });
}

export async function chat(request, response) {
  const { prompt, title, url } = await readJson(request);
  if (typeof prompt !== 'string' || !prompt.trim()) {
    sendJson(response, 400, { error: 'A non-empty "prompt" is required.' });
    return;
  }

  setActiveTab({ url, title });
  sendJson(response, 200, { status: 'ok', reply: buildChatReply(prompt, title, url) });
}
