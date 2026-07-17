export function buildChatReply(prompt = '', title = '', url = '') {
  const text = String(prompt).toLowerCase();
  const pageTitle = title || 'this page';

  if (text.includes('summarize') || text.includes('summary')) {
    const host = safeHostname(url);
    return `I can summarize ${pageTitle}${host ? ` from ${host}` : ''}. Send the page text or connect an AI provider to generate a full summary.`;
  }
  if (text.includes('explain')) return `Tell me which part of "${pageTitle}" you'd like explained, and I'll break it down.`;
  if (text.includes('translate')) return 'Send the text and your target language, and I’ll translate it.';
  return `I received: "${prompt}". How can I help with ${pageTitle}?`;
}

function safeHostname(value) {
  try {
    return new URL(value).hostname;
  } catch {
    return '';
  }
}
