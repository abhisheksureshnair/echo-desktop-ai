/* =============================================================
   FlowSync AI — Content Script
   Injects a full-height AI sidebar INSIDE the browser page DOM.
   The page content is pushed left; the sidebar fills the right.
   ============================================================= */

(function () {
  'use strict';

  const SIDEBAR_ID   = 'flowsync-ai-sidebar';
  const TRIGGER_ID   = 'flowsync-ai-trigger';
  const ELECTRON_URL = 'http://localhost:7890'; // Electron local API
  const SIDEBAR_W    = 380;

  // Prevent double-injection
  if (document.getElementById(SIDEBAR_ID)) {
    toggleSidebar(); return;
  }

  // ── State ───────────────────────────────────────────────────
  let isOpen     = false;
  let messages   = [];
  let isTyping   = false;
  let msgIdCount = 0;
  let layoutMode = localStorage.getItem('echo-layout-mode') || 'parallel';
  let isSettingsOpen = false;
  let models = JSON.parse(localStorage.getItem('echo-extension-models')) || [
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', provider: 'google' },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai' },
    { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic' }
  ];
  let activeModelId = localStorage.getItem('echo-extension-active-model-id') || 'gemini-3.5-flash';


  // ── Inject CSS into page ────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    /* Parallel layout styling */
    html.echo-layout-parallel, body.echo-layout-parallel {
      width: calc(100% - ${SIDEBAR_W}px) !important;
      max-width: calc(100% - ${SIDEBAR_W}px) !important;
      margin-right: ${SIDEBAR_W}px !important;
      position: relative !important;
      box-sizing: border-box !important;
      transition: width 0.32s cubic-bezier(0.16,1,0.3,1), margin-right 0.32s cubic-bezier(0.16,1,0.3,1);
    }
    
    /* Constraint for top-level wrappers to prevent clipping and align text */
    html.echo-layout-parallel body > div,
    html.echo-layout-parallel body > header,
    html.echo-layout-parallel body > main,
    html.echo-layout-parallel body > section,
    html.echo-layout-parallel [class*="container"],
    html.echo-layout-parallel [class*="wrapper"],
    html.echo-layout-parallel [class*="content"] {
      max-width: 100% !important;
    }

    /* Keep headers, top-bars and navigation menus from sliding under the Echo sidebar */
    html.echo-layout-parallel header,
    html.echo-layout-parallel nav,
    html.echo-layout-parallel [class*="header"],
    html.echo-layout-parallel [class*="Header"],
    html.echo-layout-parallel [class*="nav"],
    html.echo-layout-parallel [class*="Nav"],
    html.echo-layout-parallel [class*="topbar"],
    html.echo-layout-parallel [class*="navbar"] {
      max-width: calc(100vw - ${SIDEBAR_W}px) !important;
      right: ${SIDEBAR_W}px !important;
      width: auto !important;
    }
    
    /* Overlay layout styling */
    html.echo-layout-overlay, body.echo-layout-overlay {
      width: 100% !important;
      max-width: 100% !important;
      margin-right: 0 !important;
      position: static !important;
      box-sizing: border-box !important;
      transition: width 0.32s cubic-bezier(0.16,1,0.3,1), margin-right 0.32s cubic-bezier(0.16,1,0.3,1);
    }

    /* ── Trigger tab on the right edge ── */
    #${TRIGGER_ID} {
      position: fixed;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2147483646;
      cursor: pointer;
      width: 32px;
      height: 72px;
      background: linear-gradient(180deg, #1a2540 0%, #0b1220 100%);
      border: 1px solid rgba(91,140,255,0.3);
      border-right: none;
      border-radius: 10px 0 0 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: -4px 0 20px rgba(0,0,0,0.5);
      transition: all 0.2s ease;
    }
    #${TRIGGER_ID}:hover {
      width: 36px;
      background: linear-gradient(180deg, #1e2d50 0%, #0f1830 100%);
      border-color: rgba(91,140,255,0.6);
    }
    #${TRIGGER_ID} .fs-trigger-dot {
      width: 6px; height: 6px;
      border-radius: 50%;
      background: #5B8CFF;
      box-shadow: 0 0 6px #5B8CFF;
      animation: fs-glow 2s ease-in-out infinite;
    }
    #${TRIGGER_ID} .fs-trigger-label {
      font-size: 8px;
      font-weight: 700;
      color: #5B8CFF;
      letter-spacing: 0.08em;
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      text-transform: uppercase;
    }

    /* ── Main sidebar panel ── */
    #${SIDEBAR_ID} {
      position: fixed;
      top: 0; right: 0; bottom: 0;
      width: ${SIDEBAR_W}px;
      z-index: 2147483647;
      display: flex;
      flex-direction: column;
      background: rgba(11, 18, 32, 0.97);
      backdrop-filter: blur(40px) saturate(180%);
      -webkit-backdrop-filter: blur(40px) saturate(180%);
      border-left: 1px solid rgba(91,140,255,0.15);
      box-shadow: -8px 0 40px rgba(0,0,0,0.6);
      transform: translateX(${SIDEBAR_W}px);
      transition: transform 0.32s cubic-bezier(0.16,1,0.3,1);
      font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif;
    }
    .echo-cursor-grid-bg {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }
    .echo-cursor-grid-canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    #${SIDEBAR_ID}.open {
      transform: translateX(0);
    }

    /* Header */
    .fs-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      background: rgba(20,26,40,0.8);
      flex-shrink: 0;
      user-select: none;
    }
    .fs-header-left { display: flex; align-items: center; gap: 10px; }
    .fs-logo {
      width: 26px; height: 26px; border-radius: 50%;
      background: radial-gradient(circle, rgba(91,140,255,0.3) 0%, rgba(91,140,255,0.05) 100%);
      border: 1px solid rgba(91,140,255,0.4);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .fs-logo svg { width: 14px; height: 14px; }
    .fs-titles { display: flex; flex-direction: column; gap: 1px; }
    .fs-title {
      font-size: 12px; font-weight: 700;
      color: #FFFFFF; letter-spacing: -0.01em;
    }
    .fs-subtitle {
      font-size: 9px; font-weight: 600;
      color: #5B8CFF; letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .fs-live-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #22C55E; box-shadow: 0 0 5px #22C55E;
      animation: fs-glow 2s ease-in-out infinite;
    }
    .fs-close-btn {
      width: 26px; height: 26px; border-radius: 6px;
      border: none; background: rgba(255,255,255,0.05);
      color: #7E8799; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
      font-size: 16px; line-height: 1;
    }
    .fs-close-btn:hover { background: rgba(255,255,255,0.1); color: #FFF; }

    .fs-layout-btn {
      width: 26px; height: 26px; border-radius: 6px;
      border: none; background: rgba(255,255,255,0.05);
      color: #7E8799; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.15s;
    }
    .fs-layout-btn:hover { background: rgba(255,255,255,0.1); color: #FFF; }
    .fs-layout-btn.active { color: #5B8CFF; background: rgba(91, 140, 255, 0.12); border: 1px solid rgba(91, 140, 255, 0.2); }

    /* Suggestions */
    .fs-suggestions {
      padding: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      flex-shrink: 0;
    }
    .fs-suggestions-label {
      font-size: 9px; font-weight: 700;
      color: #7E8799; letter-spacing: 0.08em;
      text-transform: uppercase; margin-bottom: 8px;
    }
    .fs-chips { display: flex; flex-direction: column; gap: 5px; }
    .fs-chip {
      padding: 8px 11px; border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.07);
      background: rgba(255,255,255,0.03);
      color: #B8C0D4; font-size: 12px; font-weight: 500;
      text-align: left; cursor: pointer;
      transition: all 0.15s; width: 100%;
      font-family: inherit;
    }
    .fs-chip:hover {
      background: rgba(91,140,255,0.08);
      border-color: rgba(91,140,255,0.25);
      color: #FFFFFF;
    }

    /* Chat area */
    .fs-chat {
      flex: 1; overflow-y: auto;
      padding: 12px; display: flex;
      flex-direction: column; gap: 10px;
    }
    .fs-chat::-webkit-scrollbar { width: 3px; }
    .fs-chat::-webkit-scrollbar-track { background: transparent; }
    .fs-chat::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }

    /* Messages */
    .fs-msg { display: flex; flex-direction: column; gap: 3px; max-width: 100%; }
    .fs-msg.user { align-items: flex-end; }
    .fs-msg.assistant { align-items: flex-start; }
    .fs-bubble {
      padding: 9px 13px; border-radius: 14px;
      font-size: 13px; line-height: 1.5;
      max-width: 90%; word-wrap: break-word;
    }
    .fs-msg.user .fs-bubble {
      background: #5B8CFF;
      color: #FFFFFF; border-bottom-right-radius: 4px;
    }
    .fs-msg.assistant .fs-bubble {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.06);
      color: #E0E4EF; border-bottom-left-radius: 4px;
    }
    .fs-msg-time {
      font-size: 9px; color: #555E74; padding: 0 4px;
    }

    /* Typing dots */
    .fs-typing {
      display: flex; align-items: center; gap: 4px;
      padding: 10px 13px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 14px; border-bottom-left-radius: 4px;
      width: fit-content;
    }
    .fs-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: #5B8CFF;
      animation: fs-bounce 1.4s ease-in-out infinite;
    }
    .fs-dot:nth-child(2) { animation-delay: 0.2s; }
    .fs-dot:nth-child(3) { animation-delay: 0.4s; }

    /* Code block */
    .fs-code {
      background: rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 8px; padding: 10px 12px;
      font-family: 'SF Mono', 'Fira Code', monospace;
      font-size: 11px; color: #B8C0D4;
      line-height: 1.6; overflow-x: auto;
      margin-top: 6px; white-space: pre;
    }
    .fs-code-label {
      font-size: 9px; color: #555E74;
      letter-spacing: 0.04em; margin-bottom: 4px;
    }

    /* Input bar */
    .fs-input-bar {
      padding: 10px 12px;
      border-top: 1px solid rgba(255,255,255,0.05);
      background: rgba(11,18,32,0.6);
      flex-shrink: 0;
    }
    .fs-input-row {
      display: flex; align-items: flex-end;
      gap: 8px;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px; padding: 8px 10px;
      transition: border-color 0.2s;
    }
    .fs-input-row:focus-within {
      border-color: rgba(91,140,255,0.4);
    }
    .fs-textarea {
      flex: 1; background: none; border: none; outline: none;
      color: #FFFFFF; font-size: 13px; font-family: inherit;
      resize: none; min-height: 18px; max-height: 80px;
      line-height: 1.5; padding: 0;
      caret-color: #5B8CFF;
    }
    .fs-textarea::placeholder { color: #555E74; }
    .fs-send-btn {
      width: 28px; height: 28px; border-radius: 8px;
      border: none; background: #5B8CFF;
      color: #FFF; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; transition: all 0.15s;
    }
    .fs-send-btn:hover { background: #4a7de8; transform: scale(1.05); }
    .fs-send-btn:disabled { background: rgba(91,140,255,0.3); cursor: not-allowed; transform: none; }
    .fs-input-hint {
      font-size: 9px; color: #3A4158;
      text-align: center; margin-top: 6px; letter-spacing: 0.02em;
    }

    /* Settings styles */
    .fs-back-btn {
      display: flex; align-items: center; gap: 4px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.03);
      border-radius: 6px; padding: 4px 8px;
      color: #B8C0D4; cursor: pointer; transition: all 0.15s ease;
    }
    .fs-back-btn:hover {
      background: rgba(255,255,255,0.1);
      color: #FFF;
    }
    .fs-model-card {
      transition: all 0.15s ease;
    }
    .fs-model-card:hover {
      border-color: rgba(91,140,255,0.25) !important;
      background: rgba(255,255,255,0.04) !important;
    }
    .fs-model-card.active {
      border-color: rgba(91,140,255,0.5) !important;
      background: rgba(91,140,255,0.08) !important;
    }
    .fs-delete-model-btn {
      background: none; border: none; color: #EF4444; padding: 4px; cursor: pointer; display: flex; align-items: center; transition: all 0.15s ease;
    }
    .fs-delete-model-btn:hover {
      color: #FF4D4D !important;
      transform: scale(1.1);
    }

    /* Animations */
    @keyframes fs-glow {
      0%,100% { opacity: 0.6; transform: scale(0.9); }
      50%      { opacity: 1;   transform: scale(1.15); }
    }
    @keyframes fs-bounce {
      0%,60%,100% { transform: translateY(0); }
      30%         { transform: translateY(-5px); }
    }
  `;
  document.head.appendChild(style);

  // ── Build trigger tab ────────────────────────────────────────
  const trigger = document.createElement('div');
  trigger.id = TRIGGER_ID;
  trigger.innerHTML = `
    <div class="fs-trigger-dot"></div>
    <span class="fs-trigger-label">AI</span>
  `;
  trigger.title = 'Open Echo';
  trigger.addEventListener('click', toggleSidebar);
  document.body.appendChild(trigger);

  // ── Build sidebar panel ──────────────────────────────────────
  const sidebar = document.createElement('div');
  sidebar.id = SIDEBAR_ID;
  document.body.appendChild(sidebar);
  renderSidebar();

  // ── Listen for toolbar icon click ────────────────────────────
  const msgApi = typeof browser !== 'undefined' ? browser : chrome;
  msgApi.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'FLOWSYNC_TOGGLE') toggleSidebar();
  });

  // Apply layout classes to html/body elements
  function applyLayoutClasses() {
    if (isOpen) {
      if (layoutMode === 'parallel') {
        document.documentElement.classList.add('echo-layout-parallel');
        document.documentElement.classList.remove('echo-layout-overlay');
        document.body.classList.add('echo-layout-parallel');
        document.body.classList.remove('echo-layout-overlay');
      } else {
        document.documentElement.classList.add('echo-layout-overlay');
        document.documentElement.classList.remove('echo-layout-parallel');
        document.body.classList.add('echo-layout-overlay');
        document.body.classList.remove('echo-layout-parallel');
      }
    } else {
      document.documentElement.classList.remove('echo-layout-parallel', 'echo-layout-overlay');
      document.body.classList.remove('echo-layout-parallel', 'echo-layout-overlay');
    }
    // Adjust absolute/fixed elements
    adjustFixedElements();
  }

  // ── Toggle open/close ────────────────────────────────────────
  function toggleSidebar() {
    isOpen = !isOpen;
    applyLayoutClasses();
    if (isOpen) {
      sidebar.classList.add('open');
      trigger.style.right = SIDEBAR_W + 'px';
      trigger.title = 'Close Echo';
    } else {
      sidebar.classList.remove('open');
      trigger.style.right = '0px';
      trigger.title = 'Open Echo';
    }
  }

  // ── Render full sidebar HTML ────────────────────────────────
  function renderSidebar() {
    const showSuggestions = messages.length === 0;

    let hasGrid = document.getElementById('echo-bg-grid-container');
    if (!hasGrid) {
      sidebar.innerHTML = `
        <div id="echo-bg-grid-container" class="echo-cursor-grid-bg">
          <canvas id="echo-bg-grid-canvas" class="echo-cursor-grid-canvas"></canvas>
        </div>
        <div class="fs-content-wrapper" style="position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; width: 100%;"></div>
      `;
      const container = document.getElementById('echo-bg-grid-container');
      const canvas = document.getElementById('echo-bg-grid-canvas');
      initCursorGrid(container, canvas);
    }

    const wrapper = sidebar.querySelector('.fs-content-wrapper');
    const activeModelObj = models.find(m => m.id === activeModelId) || models[0];

    if (isSettingsOpen) {
      wrapper.innerHTML = `
        <!-- Header -->
        <div class="fs-header">
          <div class="fs-header-left" style="display: flex; align-items: center;">
            <button class="fs-back-btn" id="fs-settings-back" title="Back to Chat">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              <span style="font-size: 11px; margin-left: 4px; font-weight: 600;">Back</span>
            </button>
            <span class="fs-title" style="margin-left: 8px;">Settings</span>
          </div>
        </div>

        <div class="fs-settings-body" style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 20px;">
          <div class="fs-settings-section">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #A2ABBE; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#5B8CFF" stroke-width="2.5">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              AI Models
            </div>
            <p style="font-size: 11px; color: #7E8799; margin: 0 0 12px 0;">Select the active model for web copilot prompts.</p>
            
            <div class="fs-models-list" style="display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; max-height: 180px; overflow-y: auto;">
              ${models.map(m => {
                const isActive = m.id === activeModelId;
                const isDeletable = !['gemini-3.5-flash', 'gpt-4o', 'claude-3.5-sonnet'].includes(m.id);
                return `
                  <div class="fs-model-card ${isActive ? 'active' : ''}" data-model-id="${m.id}" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-radius: 8px; border: 1px solid ${isActive ? 'rgba(91,140,255,0.4)' : 'rgba(255,255,255,0.06)'}; background: ${isActive ? 'rgba(91,140,255,0.06)' : 'rgba(255,255,255,0.02)'}; cursor: pointer;">
                    <div style="display: flex; flex-direction: column; gap: 2px;">
                      <span style="font-size: 12px; font-weight: 600; color: #FFF;">${m.name}</span>
                      <span style="font-size: 9px; color: #5B8CFF; font-weight: 700; letter-spacing: 0.04em;">${m.provider.toUpperCase()}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      ${isActive ? `<span style="color: #22C55E; display: flex; align-items: center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>` : ''}
                      ${isDeletable ? `<button class="fs-delete-model-btn" data-model-id="${m.id}" style="background: none; border: none; color: #EF4444; padding: 4px; cursor: pointer; display: flex; align-items: center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg></button>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <form id="fs-add-model-form" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 8px; padding: 8px;">
              <div style="display: flex; gap: 6px;">
                <input type="text" id="fs-new-model-name" placeholder="Name (e.g. GPT-4o mini)" style="flex: 2; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 6px; color: #FFF; font-size: 11px; outline: none; box-sizing: border-box;" required />
                <select id="fs-new-model-provider" style="flex: 1.2; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 4px; color: #B8C0D4; font-size: 11px; outline: none; box-sizing: border-box;">
                  <option value="google">Google</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="ollama">Ollama</option>
                  <option value="custom">Custom</option>
                </select>
                <button type="submit" style="background: #5B8CFF; border: none; border-radius: 6px; color: #FFF; padding: 6px 10px; font-size: 11px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add
                </button>
              </div>
            </form>
          </div>
        </div>
      `;

      bindSettingsEvents();
      return;
    }

    wrapper.innerHTML = `
      <!-- Header -->
      <div class="fs-header">
        <div class="fs-header-left">
          <div class="fs-logo">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="12" stroke="rgba(91,140,255,0.5)" stroke-width="1.5"/>
              <circle cx="16" cy="16" r="5" fill="#5B8CFF" filter="url(#glow)"/>
              <defs><filter id="glow"><feGaussianBlur stdDeviation="2" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
            </svg>
          </div>
          <div class="fs-titles">
            <span class="fs-title">Echo</span>
            <span class="fs-subtitle">${activeModelObj ? activeModelObj.name : 'Page Co-pilot'}</span>
          </div>
          <div class="fs-live-dot"></div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button class="fs-layout-btn" id="fs-settings-btn" title="Settings">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
          <button class="fs-layout-btn ${layoutMode === 'parallel' ? 'active' : ''}" id="fs-layout-toggle" title="${layoutMode === 'parallel' ? 'Switch to Overlay Mode' : 'Switch to Side-by-Side Mode'}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" fill="none"/>
              <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor"/>
            </svg>
          </button>
          <button class="fs-close-btn" id="fs-close" title="Close">✕</button>
        </div>
      </div>

      <!-- Suggestion chips -->
      ${showSuggestions ? `
      <div class="fs-suggestions">
        <div class="fs-suggestions-label">What can I help with?</div>
        <div class="fs-chips">
          <button class="fs-chip" data-prompt="Summarize this page for me in bullet points.">📄 Summarize this page</button>
          <button class="fs-chip" data-prompt="Explain the main concept on this page in simple terms.">💡 Explain this page</button>
          <button class="fs-chip" data-prompt="Translate the selected text on this page to English.">🌐 Translate selection</button>
          <button class="fs-chip" data-prompt="Help me write a response or draft based on this page content.">✍️ Help me write</button>
        </div>
      </div>
      ` : ''}

      <!-- Chat messages -->
      <div class="fs-chat" id="fs-chat">
        ${messages.map(m => renderMessage(m)).join('')}
        ${isTyping ? `<div class="fs-msg assistant"><div class="fs-typing"><span class="fs-dot"></span><span class="fs-dot"></span><span class="fs-dot"></span></div></div>` : ''}
      </div>

      <!-- Input -->
      <div class="fs-input-bar">
        <div class="fs-input-row">
          <textarea
            class="fs-textarea"
            id="fs-input"
            placeholder="Ask Echo anything…"
            rows="1"
          ></textarea>
          <button class="fs-send-btn" id="fs-send" title="Send (Enter)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
        <div class="fs-input-hint">Enter to send · Shift+Enter for new line</div>
      </div>
    `;

    // Bind events after render
    bindEvents();
    scrollToBottom();
  }

  function renderMessage(msg) {
    const time = msg.time || '';
    const codeBlock = msg.code
      ? `<div class="fs-code"><div class="fs-code-label">${msg.codeTitle || 'snippet'}</div>${escapeHtml(msg.code)}</div>`
      : '';
    return `
      <div class="fs-msg ${msg.sender}">
        <div class="fs-bubble">${escapeHtml(msg.text)}${codeBlock}</div>
        <span class="fs-msg-time">${time}</span>
      </div>
    `;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  function bindEvents() {
    // Close button
    const closeBtn = document.getElementById('fs-close');
    if (closeBtn) closeBtn.addEventListener('click', toggleSidebar);

    // Layout toggle button
    const layoutToggle = document.getElementById('fs-layout-toggle');
    if (layoutToggle) {
      layoutToggle.addEventListener('click', () => {
        layoutMode = layoutMode === 'parallel' ? 'overlay' : 'parallel';
        localStorage.setItem('echo-layout-mode', layoutMode);
        applyLayoutClasses();
        renderSidebar();
      });
    }

    // Settings toggle button
    const settingsBtn = document.getElementById('fs-settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        isSettingsOpen = true;
        renderSidebar();
      });
    }

    // Suggestion chips
    const chips = sidebar.querySelectorAll('.fs-chip[data-prompt]');
    chips.forEach(chip => {
      chip.addEventListener('click', () => sendMessage(chip.dataset.prompt));
    });

    // Textarea auto-resize
    const textarea = document.getElementById('fs-input');
    if (textarea) {
      textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
      });
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage(textarea.value.trim());
        }
      });
    }

    // Send button
    const sendBtn = document.getElementById('fs-send');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        const ta = document.getElementById('fs-input');
        if (ta) sendMessage(ta.value.trim());
      });
    }
  }

  function bindSettingsEvents() {
    // Back button
    const backBtn = document.getElementById('fs-settings-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        isSettingsOpen = false;
        renderSidebar();
      });
    }

    // Select Model
    const modelCards = sidebar.querySelectorAll('.fs-model-card');
    modelCards.forEach(card => {
      card.addEventListener('click', () => {
        const modelId = card.dataset.modelId;
        activeModelId = modelId;
        localStorage.setItem('echo-extension-active-model-id', modelId);
        renderSidebar();
      });
    });

    // Delete Model
    const deleteBtns = sidebar.querySelectorAll('.fs-delete-model-btn');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const modelId = btn.dataset.modelId;
        if (['gemini-3.5-flash', 'gpt-4o', 'claude-3.5-sonnet'].includes(modelId)) return;
        
        models = models.filter(m => m.id !== modelId);
        localStorage.setItem('echo-extension-models', JSON.stringify(models));
        if (activeModelId === modelId) {
          activeModelId = 'gemini-3.5-flash';
          localStorage.setItem('echo-extension-active-model-id', activeModelId);
        }
        renderSidebar();
      });
    });

    // Add Model Form
    const form = document.getElementById('fs-add-model-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('fs-new-model-name');
        const providerSelect = document.getElementById('fs-new-model-provider');
        if (!nameInput || !nameInput.value.trim()) return;

        const newId = 'custom-' + Date.now();
        const newModel = {
          id: newId,
          name: nameInput.value.trim(),
          provider: providerSelect ? providerSelect.value : 'google'
        };

        models.push(newModel);
        localStorage.setItem('echo-extension-models', JSON.stringify(models));
        activeModelId = newId;
        localStorage.setItem('echo-extension-active-model-id', newId);
        renderSidebar();
      });
    }
  }


  function scrollToBottom() {
    const chat = document.getElementById('fs-chat');
    if (chat) setTimeout(() => { chat.scrollTop = chat.scrollHeight; }, 50);
  }

  // ── Send a message ────────────────────────────────────────────
  function sendMessage(text) {
    if (!text || isTyping) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messages.push({ id: ++msgIdCount, sender: 'user', text, time: now });
    isTyping = true;
    renderSidebar();

    // Try Electron local API first, then fall back to built-in responses
    fetchElectronResponse(text)
      .then(reply => addAssistantMessage(reply))
      .catch(() => addAssistantMessage(buildLocalResponse(text)));
  }

  function addAssistantMessage(reply) {
    isTyping = false;
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messages.push({
      id: ++msgIdCount,
      sender: 'assistant',
      text: reply.text,
      time: now,
      code: reply.code,
      codeTitle: reply.codeTitle,
    });
    renderSidebar();
  }

  // ── Electron local API ────────────────────────────────────────
  async function fetchElectronResponse(prompt) {
    const res = await fetch(`${ELECTRON_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, url: location.href, title: document.title, modelId: activeModelId }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error('not ok');
    const data = await res.json();
    return { text: data.reply };
  }

  // ── Built-in smart responses ──────────────────────────────────
  function buildLocalResponse(text) {
    const t = text.toLowerCase();

    if (t.includes('summarize') || t.includes('summary') || t.includes('page')) {
      const title = document.title;
      const desc = document.querySelector('meta[name="description"]')?.content || '';
      const h1 = document.querySelector('h1')?.innerText || '';
      const paras = [...document.querySelectorAll('p')].slice(0, 4).map(p => p.innerText.slice(0, 100)).filter(Boolean);
      const bullets = paras.map(p => `• ${p}`).join('\n');
      return { text: `Here's a summary of "${title}":\n\n${h1 ? `**${h1}**\n` : ''}${desc ? `${desc}\n\n` : ''}${bullets || 'No main content detected on this page.'}` };
    }

    if (t.includes('explain')) {
      const h1 = document.querySelector('h1')?.innerText || document.title;
      return { text: `This page is about: **${h1}**\n\nIt appears to be a ${detectPageType()} page. The main content discusses topics related to the headline above. Would you like me to go deeper on any specific section?` };
    }

    if (t.includes('translate')) {
      return { text: "To translate, please highlight the text on the page, copy it, and paste it here — I'll translate it to your desired language." };
    }

    if (t.includes('code') || t.includes('snippet')) {
      const codeEl = document.querySelector('pre code, code');
      if (codeEl) {
        return { text: "Found a code snippet on this page:", code: codeEl.innerText.slice(0, 400), codeTitle: 'Page snippet' };
      }
      return { text: "I didn't find a specific code block. Could you paste the code here so I can help?" };
    }

    if (t.includes('write') || t.includes('draft') || t.includes('email')) {
      return { text: "Sure! Tell me more about what you'd like to write — a message, email, post, or document — and I'll draft it for you." };
    }

    if (t.includes('hello') || t.includes('hi') || t.includes('hey')) {
      return { text: `Hi there! 👋 I'm Echo, your page co-pilot.\n\nI can summarize this page, explain content, translate text, help you write, or find code snippets. What would you like to do?` };
    }

    // Generic response
    return { text: `I understood your request: "${text}"\n\nI'm currently running in standalone mode (the Echo desktop app isn't connected). I can still help with page summaries, explanations, translations, and writing. What would you like?` };
  }

  function detectPageType() {
    const url = location.href;
    if (url.includes('github')) return 'GitHub repository';
    if (url.includes('stackoverflow')) return 'Stack Overflow Q&A';
    if (url.includes('youtube')) return 'YouTube video';
    if (url.includes('twitter') || url.includes('x.com')) return 'social media';
    if (url.includes('linkedin')) return 'LinkedIn professional';
    if (url.includes('medium') || url.includes('dev.to') || url.includes('hashnode')) return 'blog article';
    if (document.querySelector('article')) return 'article';
    if (document.querySelector('.product, [class*="product"]')) return 'product';
    return 'web';
  }

  // ── Ping Electron Desktop App status ─────────────────────────
  async function pingElectronApp() {
    try {
      await fetch(`${ELECTRON_URL}/api/active`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: location.href, title: document.title }),
        signal: AbortSignal.timeout(1500)
      });
    } catch (e) {
      // Ignore errors when desktop app is not running
    }
  }

  // Start pinging immediately and every 4 seconds
  pingElectronApp();
  setInterval(pingElectronApp, 4000);

  // ── Dynamic Adjustment of Fixed/Absolute page elements ──────────
  function adjustFixedElements() {
    // 1. Restore any previously modified elements first
    const adjustedRight = document.querySelectorAll('[data-echo-orig-right]');
    adjustedRight.forEach(el => {
      el.style.right = el.getAttribute('data-echo-orig-right');
      el.removeAttribute('data-echo-orig-right');
    });

    const adjustedWidth = document.querySelectorAll('[data-echo-orig-width]');
    adjustedWidth.forEach(el => {
      el.style.width = el.getAttribute('data-echo-orig-width');
      el.removeAttribute('data-echo-orig-width');
    });

    if (!isOpen || layoutMode !== 'parallel') return;

    // 2. Scan DOM and adjust absolute/fixed containers to shift them left of our sidebar
    const elements = document.querySelectorAll('body *');
    elements.forEach(el => {
      // Ignore our own sidebar and trigger button
      if (el.id === SIDEBAR_ID || el.id === TRIGGER_ID || el.closest(`#${SIDEBAR_ID}`)) return;

      const style = window.getComputedStyle(el);
      const position = style.position;

      if (position === 'fixed' || position === 'absolute') {
        const rightVal = style.right;
        const widthVal = style.width;

        // If it is aligned to the right edge (right: 0px or computed right <= 5px due to subpixels)
        const rPx = parseInt(rightVal) || 0;
        if (rightVal === '0px' || rPx <= 5) {
          el.setAttribute('data-echo-orig-right', el.style.right || '');
          el.style.right = `${SIDEBAR_W}px`;
        }

        // If it is full-width viewport element (computed width matches window innerWidth)
        const wPx = parseInt(widthVal) || 0;
        if (wPx >= window.innerWidth - 10) {
          el.setAttribute('data-echo-orig-width', el.style.width || '');
          el.style.width = `calc(100% - ${SIDEBAR_W}px)`;
        }
      }
    });
  }

  // ── Vanilla implementation of CursorGrid ─────────────────────────
  function initCursorGrid(container, canvas) {
    const p = {
      cellSize: 70,
      color: '#5B8CFF',
      radius: 140,
      falloff: 'smooth',
      holdTime: 400,
      fadeDuration: 800,
      lineWidth: 1.2,
      maxOpacity: 0.6,
      fillOpacity: 0,
      gridOpacity: 0,
      cellRadius: 0,
      clickPulse: true,
      pulseSpeed: 600
    };

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let cols = 0;
    let rows = 0;
    let offX = 0;
    let offY = 0;
    let alphas = new Float32Array(0);
    let touched = new Float64Array(0);
    let w = 0;
    let h = 0;
    const pulses = [];
    let raf = 0;
    let running = false;
    let lastFrame = 0;

    const FALLOFF_CURVES = {
      linear: t => t,
      smooth: t => t * t * (3 - 2 * t),
      sharp: t => t * t * t
    };

    const hexToRgb = hex => {
      const h = hex.replace('#', '');
      const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
      const num = parseInt(v, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    };

    const rebuild = () => {
      w = container.offsetWidth;
      h = container.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / p.cellSize) + 1;
      rows = Math.ceil(h / p.cellSize) + 1;
      offX = (w - cols * p.cellSize) / 2;
      offY = (h - rows * p.cellSize) / 2;
      alphas = new Float32Array(cols * rows);
      touched = new Float64Array(cols * rows);
    };

    const cellCenter = i => {
      const cx = offX + (i % cols) * p.cellSize + p.cellSize / 2;
      const cy = offY + Math.floor(i / cols) * p.cellSize + p.cellSize / 2;
      return [cx, cy];
    };

    const energize = (x, y, boost) => {
      const r = Math.max(p.radius, 1);
      const ease = FALLOFF_CURVES[p.falloff] ?? FALLOFF_CURVES.linear;
      const now = performance.now();
      const minCol = Math.max(0, Math.floor((x - r - offX) / p.cellSize));
      const maxCol = Math.min(cols - 1, Math.floor((x + r - offX) / p.cellSize));
      const minRow = Math.max(0, Math.floor((y - r - offY) / p.cellSize));
      const maxRow = Math.min(rows - 1, Math.floor((y + r - offY) / p.cellSize));
      for (let cRow = minRow; cRow <= maxRow; cRow++) {
        for (let cCol = minCol; cCol <= maxCol; cCol++) {
          const i = cRow * cols + cCol;
          const [cx, cy] = cellCenter(i);
          const dist = Math.hypot(cx - x, cy - y);
          if (dist > r) continue;
          const level = ease(1 - dist / r) * p.maxOpacity * (boost ?? 1);
          if (level > alphas[i]) {
            alphas[i] = level;
            touched[i] = now;
          } else if (level > 0) {
            touched[i] = now;
          }
        }
      }
    };

    const draw = now => {
      const dt = Math.min(now - lastFrame, 50);
      lastFrame = now;
      ctx.clearRect(0, 0, w, h);
      const [cr, cg, cb] = hexToRgb(p.color);

      // Faint static lattice
      if (p.gridOpacity > 0) {
        ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${p.gridOpacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let cCol = 0; cCol <= cols; cCol++) {
          const x = Math.round(offX + cCol * p.cellSize) + 0.5;
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
        }
        for (let cRow = 0; cRow <= rows; cRow++) {
          const y = Math.round(offY + cRow * p.cellSize) + 0.5;
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
        }
        ctx.stroke();
      }

      // click pulses
      for (let pi = pulses.length - 1; pi >= 0; pi--) {
        const pulse = pulses[pi];
        const age = (now - pulse.t0) / 1000;
        const ringR = age * p.pulseSpeed;
        if (ringR > Math.hypot(w, h)) {
          pulses.splice(pi, 1);
          continue;
        }
        const band = p.cellSize;
        const minCol = Math.max(0, Math.floor((pulse.x - ringR - band - offX) / p.cellSize));
        const maxCol = Math.min(cols - 1, Math.floor((pulse.x + ringR + band - offX) / p.cellSize));
        const minRow = Math.max(0, Math.floor((pulse.y - ringR - band - offY) / p.cellSize));
        const maxRow = Math.min(rows - 1, Math.floor((pulse.y + ringR + band - offY) / p.cellSize));
        for (let cRow = minRow; cRow <= maxRow; cRow++) {
          for (let cCol = minCol; cCol <= maxCol; cCol++) {
            const i = cRow * cols + cCol;
            const [cx, cy] = cellCenter(i);
            const dist = Math.hypot(cx - pulse.x, cy - pulse.y);
            if (Math.abs(dist - ringR) < band / 2 && p.maxOpacity > alphas[i]) {
              alphas[i] = p.maxOpacity;
              touched[i] = now;
            }
          }
        }
      }

      let anyVisible = pulses.length > 0;
      const fadeStep = dt / Math.max(p.fadeDuration, 16);
      const half = p.cellSize / 2;

      for (let i = 0; i < alphas.length; i++) {
        let a = alphas[i];
        if (a <= 0) continue;
        if (now - touched[i] > p.holdTime) {
          a = Math.max(0, a - fadeStep);
          alphas[i] = a;
          if (a <= 0) continue;
        }
        anyVisible = true;

        const [cx, cy] = cellCenter(i);
        const gradient = ctx.createRadialGradient(cx, cy, half * 0.1, cx, cy, p.cellSize);
        gradient.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${a})`);
        gradient.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);

        const x = cx - half + 0.5;
        const y = cy - half + 0.5;
        const s = p.cellSize - 1;

        ctx.beginPath();
        if (p.cellRadius > 0) {
          ctx.roundRect(x, y, s, s, p.cellRadius);
        } else {
          ctx.rect(x, y, s, s);
        }
        if (p.fillOpacity > 0) {
          ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${a * p.fillOpacity})`;
          ctx.fill();
        }
        ctx.strokeStyle = gradient;
        ctx.lineWidth = p.lineWidth;
        ctx.stroke();
      }

      if (anyVisible || p.gridOpacity > 0) {
        raf = requestAnimationFrame(draw);
      } else {
        running = false;
        ctx.clearRect(0, 0, w, h);
      }
    };

    const wake = () => {
      if (running) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(draw);
    };

    const toLocal = e => {
      const rect = canvas.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };

    const onPointerMove = e => {
      const [x, y] = toLocal(e);
      energize(x, y);
      wake();
    };

    const onPointerDown = e => {
      if (!p.clickPulse) return;
      const [x, y] = toLocal(e);
      pulses.push({ x, y, t0: performance.now() });
      wake();
    };

    window.addEventListener('resize', rebuild);
    // Listen to pointer move on the container (the sidebar background)
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerdown', onPointerDown);

    // Also forward sidebar container pointer movements to activate cells!
    sidebar.addEventListener('pointermove', onPointerMove);
    sidebar.addEventListener('pointerdown', onPointerDown);

    // Initial build
    rebuild();
    wake();
  }

  // Notify Electron app on unload to instantly restore desktop floating island
  function notifyDisconnect() {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(`${ELECTRON_URL}/api/disconnect`);
    } else {
      fetch(`${ELECTRON_URL}/api/disconnect`, { method: 'POST', keepalive: true }).catch(() => {});
    }
  }
  window.addEventListener('pagehide', notifyDisconnect);
  window.addEventListener('beforeunload', notifyDisconnect);

})();

