(() => {
  'use strict';

  const ROOT_ID = 'nexora-games';
  const SCORE_KEY = 'rexweb_nexora_arcade_scores_v1';
  const root = document.getElementById(ROOT_ID);

  if (!root) {
    console.error('Nexora Arcade: #nexora-games was not found.');
    return;
  }

  const $ = (selector, parent = root) => parent.querySelector(selector);
  const $$ = (selector, parent = root) => [...parent.querySelectorAll(selector)];

  const games = [
    { id: 'snake', name: 'Snake', icon: '🐍', description: 'Eat, grow, and avoid your tail.' },
    { id: 'ttt', name: 'Tic-Tac-Toe', icon: '⭕', description: 'Challenge the computer.' },
    { id: 'pong', name: 'Pong', icon: '🏓', description: 'Keep the ball in play.' },
    { id: 'breakout', name: 'Brick Breaker', icon: '🧱', description: 'Destroy every brick.' },
    { id: 'runner', name: 'Endless Runner', icon: '🏃', description: 'Jump over obstacles.' },
    { id: 'shooter', name: 'Space Shooter', icon: '🚀', description: 'Dodge enemies and fire.' },
    { id: 'math', name: 'Math Challenge', icon: '🧠', description: 'Solve as many questions as possible.' },
    { id: 'rps', name: 'Rock Paper Scissors', icon: '✊', description: 'Choose your move.' },
    { id: 'hangman', name: 'Hangman', icon: '🔤', description: 'Guess the hidden word.' },
    { id: 'flappy', name: 'Flappy Flyer', icon: '🐦', description: 'Fly between the pipes.' }
  ];

  let currentGame = null;
  let cleanupCurrent = () => {};
  let gameToken = 0;
  let scores = loadScores();

  function loadScores() {
    try {
      return JSON.parse(localStorage.getItem(SCORE_KEY) || '{}');
    } catch (_) {
      return {};
    }
  }

  function saveScores() {
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
    } catch (_) {}
  }

  function bestScore(id) {
    return Number(scores[id] || 0);
  }

  function saveBest(id, score) {
    if (score > bestScore(id)) {
      scores[id] = score;
      saveScores();
    }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function injectStyles() {
    if (document.getElementById('nexora-arcade-styles')) return;

    const style = document.createElement('style');
    style.id = 'nexora-arcade-styles';
    style.textContent = `
      #nexora-games {
        --nx-bg:#050914;
        --nx-panel:#0b1425;
        --nx-panel2:#101d32;
        --nx-line:#223651;
        --nx-text:#f2f7ff;
        --nx-muted:#91a4bf;
        --nx-cyan:#35e8ff;
        --nx-purple:#9b6cff;
        --nx-green:#43f5a5;
        color:var(--nx-text);
        background:var(--nx-bg);
        font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        min-height:100%;
        padding:16px;
        box-sizing:border-box;
        overflow:hidden;
      }

      #nexora-games * { box-sizing:border-box; }
      #nexora-games button,
      #nexora-games input { font:inherit; }
      #nexora-games button { -webkit-tap-highlight-color:transparent; }

      #nexora-games .nx-shell {
        width:min(100%,1000px);
        margin:0 auto;
      }

      #nexora-games .nx-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        flex-wrap:wrap;
        margin-bottom:18px;
      }

      #nexora-games .nx-brand {
        display:flex;
        align-items:center;
        gap:11px;
      }

      #nexora-games .nx-logo {
        width:46px;
        height:46px;
        display:grid;
        place-items:center;
        border:1px solid #27637c;
        border-radius:14px;
        color:var(--nx-cyan);
        font-size:24px;
        font-weight:900;
        background:linear-gradient(135deg,#102b42,#161332);
        box-shadow:0 0 22px #35e8ff19;
      }

      #nexora-games .nx-brand h1 {
        font-size:clamp(17px,4vw,24px);
        line-height:1.15;
        margin:0;
        letter-spacing:.6px;
      }

      #nexora-games .nx-brand p {
        margin:5px 0 0;
        color:var(--nx-muted);
        font-size:12px;
      }

      #nexora-games .nx-btn {
        border:1px solid var(--nx-line);
        color:var(--nx-text);
        background:var(--nx-panel2);
        border-radius:11px;
        padding:10px 14px;
        min-height:42px;
        cursor:pointer;
        transition:transform .12s,border-color .12s,background .12s;
      }

      #nexora-games .nx-btn:active { transform:scale(.97); }
      #nexora-games .nx-btn:focus-visible,
      #nexora-games .nx-pad-btn:focus-visible {
        outline:2px solid var(--nx-cyan);
        outline-offset:3px;
      }

      #nexora-games .nx-btn-primary {
        color:#001019;
        font-weight:800;
        background:var(--nx-cyan);
        border-color:var(--nx-cyan);
      }

      #nexora-games .nx-btn-small { padding:7px 10px; min-height:35px; }

      #nexora-games .nx-section-title {
        font-size:17px;
        margin:20px 0 12px;
      }

      #nexora-games .nx-game-grid {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:12px;
      }

      #nexora-games .nx-game-card {
        text-align:left;
        padding:16px;
        border:1px solid var(--nx-line);
        border-radius:16px;
        background:linear-gradient(145deg,var(--nx-panel),#080f1e);
        color:var(--nx-text);
        min-width:0;
        cursor:pointer;
        transition:transform .15s,border-color .15s,box-shadow .15s;
      }

      #nexora-games .nx-game-card:hover {
        border-color:#2684a5;
        box-shadow:0 0 20px #35e8ff0b;
      }

      #nexora-games .nx-game-card:active { transform:scale(.985); }

      #nexora-games .nx-card-icon {
        font-size:29px;
        margin-bottom:11px;
        display:block;
      }

      #nexora-games .nx-card-title {
        font-size:15px;
        font-weight:800;
        display:block;
      }

      #nexora-games .nx-card-description {
        color:var(--nx-muted);
        font-size:12px;
        display:block;
        margin-top:6px;
        line-height:1.5;
      }

      #nexora-games .nx-card-best {
        display:block;
        color:var(--nx-cyan);
        font-size:11px;
        margin-top:12px;
      }

      #nexora-games .nx-panel {
        border:1px solid var(--nx-line);
        background:var(--nx-panel);
        border-radius:18px;
        overflow:hidden;
      }

      #nexora-games .nx-game-top {
        padding:16px;
        border-bottom:1px solid var(--nx-line);
        display:flex;
        justify-content:space-between;
        align-items:center;
        flex-wrap:wrap;
        gap:12px;
      }

      #nexora-games .nx-game-heading {
        display:flex;
        align-items:center;
        gap:10px;
      }

      #nexora-games .nx-game-heading h2 {
        font-size:19px;
        margin:0;
      }

      #nexora-games .nx-game-heading p {
        font-size:12px;
        color:var(--nx-muted);
        margin:4px 0 0;
      }

      #nexora-games .nx-stats {
        display:flex;
        gap:8px;
        flex-wrap:wrap;
      }

      #nexora-games .nx-stat {
        padding:7px 10px;
        border:1px solid var(--nx-line);
        border-radius:10px;
        background:#060d19;
        font-size:12px;
        white-space:nowrap;
      }

      #nexora-games .nx-stat strong { color:var(--nx-cyan); }

      #nexora-games .nx-game-area {
        padding:12px;
        min-height:220px;
        position:relative;
      }

      #nexora-games .nx-canvas-wrap {
        width:100%;
        position:relative;
        margin:0 auto;
      }

      #nexora-games canvas {
        display:block;
        width:100%;
        height:auto;
        border-radius:12px;
        background:#030914;
        touch-action:none;
      }

      #nexora-games .nx-message {
        text-align:center;
        min-height:24px;
        padding:5px 12px 12px;
        color:var(--nx-cyan);
        font-size:13px;
      }

      #nexora-games .nx-controls {
        display:flex;
        justify-content:center;
        flex-wrap:wrap;
        gap:9px;
        padding:0 12px 16px;
      }

      #nexora-games .nx-gamepad {
        border-top:1px solid var(--nx-line);
        padding:16px 12px;
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:10px;
        background:linear-gradient(180deg,#091120,#060c18);
        touch-action:none;
        user-select:none;
        -webkit-user-select:none;
      }

      #nexora-games .nx-pad-label {
        color:var(--nx-muted);
        font-size:10px;
        letter-spacing:2px;
        font-weight:800;
      }

      #nexora-games .nx-pad-row {
        display:flex;
        align-items:center;
        justify-content:center;
        gap:9px;
      }

      #nexora-games .nx-pad-btn {
        border:1px solid #2b526c;
        border-radius:13px;
        min-width:62px;
        min-height:58px;
        padding:8px;
        display:grid;
        place-items:center;
        color:var(--nx-cyan);
        font-size:22px;
        font-weight:900;
        background:linear-gradient(145deg,#14253b,#091321);
        box-shadow:inset 0 1px #ffffff0a,0 5px 0 #030812;
        cursor:pointer;
        touch-action:none;
        user-select:none;
        -webkit-user-select:none;
        -webkit-touch-callout:none;
      }

      #nexora-games .nx-pad-btn.nx-active,
      #nexora-games .nx-pad-btn:active {
        transform:translateY(3px);
        box-shadow:inset 0 0 20px #35e8ff20,0 2px 0 #030812;
        background:#15354b;
        border-color:var(--nx-cyan);
      }

      #nexora-games .nx-pad-btn.nx-action {
        min-width:100px;
        color:#00120e;
        background:linear-gradient(145deg,#5bffc1,#18c88c);
        border-color:var(--nx-green);
        font-size:14px;
        letter-spacing:.7px;
      }

      #nexora-games .nx-pad-btn.nx-purple {
        color:#fff;
        background:linear-gradient(145deg,#8053d8,#43278b);
        border-color:#9b6cff;
      }

      #nexora-games .nx-pad-info {
        color:var(--nx-muted);
        text-align:center;
        font-size:12px;
        max-width:340px;
        line-height:1.5;
      }

      #nexora-games .nx-board {
        display:grid;
        gap:8px;
        max-width:360px;
        margin:12px auto;
      }

      #nexora-games .nx-ttt-board {
        grid-template-columns:repeat(3,minmax(0,1fr));
        width:min(100%,330px);
      }

      #nexora-games .nx-cell {
        aspect-ratio:1;
        border:1px solid #2a415e;
        border-radius:13px;
        background:#0c192a;
        color:var(--nx-cyan);
        font-size:clamp(28px,8vw,48px);
        font-weight:900;
        cursor:pointer;
      }

      #nexora-games .nx-cell:disabled { cursor:default; opacity:.95; }
      #nexora-games .nx-cell.nx-o { color:var(--nx-purple); }

      #nexora-games .nx-answer-grid {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:10px;
        max-width:480px;
        margin:16px auto;
      }

      #nexora-games .nx-answer {
        padding:15px 10px;
        border:1px solid var(--nx-line);
        border-radius:12px;
        color:var(--nx-text);
        background:#0c192a;
        font-weight:800;
        cursor:pointer;
      }

      #nexora-games .nx-answer:active { border-color:var(--nx-cyan); }
      #nexora-games .nx-word {
        text-align:center;
        font-size:clamp(22px,6vw,34px);
        letter-spacing:7px;
        margin:18px 0;
        font-weight:900;
        overflow-wrap:anywhere;
      }

      #nexora-games .nx-letter-grid {
        display:grid;
        grid-template-columns:repeat(7,minmax(0,1fr));
        gap:6px;
        max-width:460px;
        margin:15px auto;
      }

      #nexora-games .nx-letter {
        min-height:39px;
        border:1px solid var(--nx-line);
        border-radius:8px;
        background:#0d192b;
        color:var(--nx-text);
        cursor:pointer;
        font-weight:800;
      }

      #nexora-games .nx-letter:disabled { opacity:.3; cursor:default; }
      #nexora-games .nx-question {
        font-size:clamp(28px,8vw,43px);
        font-weight:900;
        text-align:center;
        margin:20px 0;
        color:var(--nx-cyan);
      }

      #nexora-games .nx-result {
        font-size:14px;
        color:var(--nx-muted);
        text-align:center;
        min-height:24px;
      }

      #nexora-games .nx-rps-buttons {
        display:flex;
        justify-content:center;
        flex-wrap:wrap;
        gap:10px;
        margin:18px auto;
      }

      #nexora-games .nx-rps-buttons .nx-btn { min-width:92px; }

      #nexora-games .nx-footer {
        text-align:center;
        color:#60758f;
        font-size:11px;
        padding:18px 0 4px;
      }

      #nexora-games .nx-hidden { display:none !important; }

      @media (min-width:650px) {
        #nexora-games { padding:24px; }
        #nexora-games .nx-game-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
        #nexora-games .nx-game-area { padding:20px; }
        #nexora-games .nx-pad-btn { min-width:68px; min-height:62px; }
      }

      @media (max-width:380px) {
        #nexora-games { padding:10px; }
        #nexora-games .nx-game-grid { gap:8px; }
        #nexora-games .nx-game-card { padding:12px; }
        #nexora-games .nx-pad-btn { min-width:55px; min-height:54px; }
        #nexora-games .nx-letter-grid { grid-template-columns:repeat(6,minmax(0,1fr)); }
      }

      @media (prefers-reduced-motion:reduce) {
        #nexora-games * { transition:none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function renderHome() {
    stopCurrentGame();

    root.innerHTML = `
      <div class="nx-shell">
        <header class="nx-header">
          <div class="nx-brand">
            <div class="nx-logo">N</div>
            <div>
              <h1>REXWEB NEXORA</h1>
              <p>ARCADE UNIVERSE · PLAY WITHOUT LIMITS</p>
            </div>
          </div>
          <button class="nx-btn" data-action="refresh">↻ Refresh Scores</button>
        </header>

        <h2 class="nx-section-title">Choose Your Game</h2>

        <div class="nx-game-grid">
          ${games.map(game => `
            <button class="nx-game-card" data-open="${game.id}">
              <span class="nx-card-icon">${game.icon}</span>
              <span class="nx-card-title">${escapeHTML(game.name)}</span>
              <span class="nx-card-description">${escapeHTML(game.description)}</span>
              <span class="nx-card-best">BEST SCORE: ${bestScore(game.id)}</span>
            </button>
          `).join('')}
        </div>

        <footer class="nx-footer">REXWEB NEXORA · YOUR DIGITAL WORLD, WITHOUT LIMITS</footer>
      </div>
    `;

    $$('[data-open]').forEach(button => {
      button.addEventListener('click', () => openGame(button.dataset.open));
    });

    $('[data-action="refresh"]').addEventListener('click', renderHome);
  }

  function stopCurrentGame() {
    gameToken++;
    try {
      cleanupCurrent();
    } catch (error) {
      console.warn('Game cleanup issue:', error);
    }
    cleanupCurrent = () => {};
    currentGame = null;
  }

  function makeCanvas(width, height) {
    const wrap = document.createElement('div');
    wrap.className = 'nx-canvas-wrap';
    wrap.style.maxWidth = width + 'px';

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.setAttribute('aria-label', 'Game play area');

    wrap.appendChild(canvas);
    return { wrap, canvas, ctx: canvas.getContext('2d') };
  }

  function makeButton(label, action, className = '') {
    const button = document.createElement('button');
    button.className = 'nx-btn ' + className;
    button.textContent = label;
    button.type = 'button';
    button.addEventListener('click', action);
    return button;
  }

  function openGame(id) {
    const game = games.find(item => item.id === id);
    if (!game) return;

    stopCurrentGame();
    currentGame = id;

    const token = gameToken;
    let score = 0;
    let message = '';
    let area;
    let stats;
    let scoreNode;
    let bestNode;
    let messageNode;
    let gamepad;
    let controls;
    let gameCleanup = () => {};
    let controllerCleanups = [];

    root.innerHTML = `
      <div class="nx-shell">
        <header class="nx-header">
          <div class="nx-brand">
            <div class="nx-logo">N</div>
            <div>
              <h1>REXWEB NEXORA</h1>
              <p>ARCADE UNIVERSE · TOUCH TO PLAY</p>
            </div>
          </div>
          <button class="nx-btn" data-action="all-games">← All Games</button>
        </header>

        <section class="nx-panel">
          <div class="nx-game-top">
            <div class="nx-game-heading">
              <span style="font-size:28px">${game.icon}</span>
              <div>
                <h2>${escapeHTML(game.name)}</h2>
                <p>${escapeHTML(game.description)}</p>
              </div>
            </div>
            <div class="nx-stats">
              <div class="nx-stat">SCORE: <strong data-score>0</strong></div>
              <div class="nx-stat">BEST: <strong data-best>${bestScore(id)}</strong></div>
            </div>
          </div>

          <div class="nx-game-area" data-game-area></div>
          <div class="nx-message" data-message aria-live="polite"></div>
          <div class="nx-gamepad" data-gamepad>
            <div class="nx-pad-label">TOUCH CONTROLLER</div>
            <div class="nx-pad-content" data-pad-content></div>
          </div>
          <div class="nx-controls">
            <button class="nx-btn nx-btn-primary" data-action="restart">↻ Restart</button>
            <button class="nx-btn" data-action="all-games">▦ All Games</button>
          </div>
        </section>

        <footer class="nx-footer">Use the touchscreen controller or your keyboard.</footer>
      </div>
    `;

    area = $('[data-game-area]');
    scoreNode = $('[data-score]');
    bestNode = $('[data-best]');
    messageNode = $('[data-message]');
    gamepad = $('[data-gamepad]');
    controls = $('[data-pad-content]');

    $('[data-action="all-games"]').addEventListener('click', renderHome);
    $('[data-action="restart"]').addEventListener('click', () => {
      if (token === gameToken) openGame(id);
    });

    function setMessage(text) {
      message = text || '';
      if (messageNode && messageNode.isConnected) messageNode.textContent = message;
    }

    function setScore(value) {
      score = Math.max(0, Math.floor(Number(value) || 0));
      if (scoreNode && scoreNode.isConnected) scoreNode.textContent = score;
      saveBest(id, score);
      if (bestNode && bestNode.isConnected) bestNode.textContent = bestScore(id);
    }

    function addScore(amount = 1) {
      setScore(score + amount);
    }

    function makePadButton(key, label, className = '') {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nx-pad-btn ' + className;
      button.dataset.pad = key;
      button.textContent = label;
      button.setAttribute('aria-label', label);
      return button;
    }

    function bindPadButton(key, onStart, onEnd) {
      const button = controls.querySelector(`[data-pad="${key}"]`);
      if (!button) return () => {};

      let active = false;
      let pointerId = null;

      function start(event) {
        if (active) return;
        if (event.cancelable) event.preventDefault();
        active = true;
        pointerId = event.pointerId ?? null;
        button.classList.add('nx-active');

        if (pointerId !== null && button.setPointerCapture) {
          try { button.setPointerCapture(pointerId); } catch (_) {}
        }

        if (typeof onStart === 'function') onStart(event);
      }

      function end(event) {
        if (!active) return;

        if (
          event &&
          pointerId !== null &&
          event.pointerId !== undefined &&
          event.pointerId !== pointerId
        ) return;

        active = false;
        pointerId = null;
        button.classList.remove('nx-active');

        if (typeof onEnd === 'function') onEnd(event);
      }

      function keyStart(event) {
        if (event.repeat) return;
        start(event);
      }

      button.addEventListener('pointerdown', start);
      button.addEventListener('pointerup', end);
      button.addEventListener('pointercancel', end);
      button.addEventListener('lostpointercapture', end);
      button.addEventListener('contextmenu', preventContextMenu);

      function preventContextMenu(event) {
        event.preventDefault();
      }

      return () => {
        end();
        button.removeEventListener('pointerdown', start);
        button.removeEventListener('pointerup', end);
        button.removeEventListener('pointercancel', end);
        button.removeEventListener('lostpointercapture', end);
        button.removeEventListener('contextmenu', preventContextMenu);
      };
    }

    function setPad(type, handlers = {}) {
      controllerCleanups.forEach(fn => {
        try { fn(); } catch (_) {}
      });
      controllerCleanups = [];
      controls.innerHTML = '';

      const add = (key, label, className, start, end) => {
        controls.appendChild(makePadButton(key, label, className));
        controllerCleanups.push(bindPadButton(key, start, end));
      };

      if (type === 'dpad') {
        const pad = document.createElement('div');
        pad.style.display = 'flex';
        pad.style.flexDirection = 'column';
        pad.style.alignItems = 'center';
        pad.style.gap = '8px';

        const top = document.createElement('div');
        top.className = 'nx-pad-row';

        const middle = document.createElement('div');
        middle.className = 'nx-pad-row';

        const bottom = document.createElement('div');
        bottom.className = 'nx-pad-row';

        const createInto = (container, key, label) => {
          const button = makePadButton(key, label);
          container.appendChild(button);

          let active = false;
          let pointerId = null;

          function start(event) {
            if (active) return;
            if (event.cancelable) event.preventDefault();
            active = true;
            pointerId = event.pointerId ?? null;
            button.classList.add('nx-active');
            if (pointerId !== null && button.setPointerCapture) {
              try { button.setPointerCapture(pointerId); } catch (_) {}
            }
            if (handlers[key]) handlers[key](true);
          }

          function end(event) {
            if (!active) return;
            if (event && pointerId !== null && event.pointerId !== undefined && event.pointerId !== pointerId) return;
            active = false;
            pointerId = null;
            button.classList.remove('nx-active');
            if (handlers[key]) handlers[key](false);
          }

          button.addEventListener('pointerdown', start);
          button.addEventListener('pointerup', end);
          button.addEventListener('pointercancel', end);
          button.addEventListener('lostpointercapture', end);

          controllerCleanups.push(() => {
            end();
            button.removeEventListener('pointerdown', start);
            button.removeEventListener('pointerup', end);
            button.removeEventListener('pointercancel', end);
            button.removeEventListener('lostpointercapture', end);
          });
        };

        createInto(top, 'up', '↑');
        createInto(middle, 'left', '←');
        createInto(middle, 'right', '→');
        createInto(bottom, 'down', '↓');

        pad.append(top, middle, bottom);
        controls.appendChild(pad);
      } else if (type === 'vertical') {
        const row = document.createElement('div');
        row.className = 'nx-pad-row';
        controls.appendChild(row);

        ['up', 'down'].forEach(key => {
          const label = key === 'up' ? '↑ UP' : '↓ DOWN';
          const button = makePadButton(key, label);
          row.appendChild(button);
          controllerCleanups.push(bindPadButton(key, () => handlers[key]?.(true), () => handlers[key]?.(false)));
        });
      } else if (type === 'horizontal') {
        const row = document.createElement('div');
        row.className = 'nx-pad-row';
        controls.appendChild(row);

        ['left', 'right'].forEach(key => {
          const button = makePadButton(key, key === 'left' ? '← LEFT' : 'RIGHT →');
          row.appendChild(button);
          controllerCleanups.push(bindPadButton(key, () => handlers[key]?.(true), () => handlers[key]?.(false)));
        });
      } else if (type === 'jump') {
        add('action', 'JUMP', 'nx-action', handlers.action, handlers.release);
      } else if (type === 'flap') {
        add('action', 'FLAP', 'nx-action', handlers.action, handlers.release);
      } else if (type === 'shooter') {
        const row = document.createElement('div');
        row.className = 'nx-pad-row';
        controls.appendChild(row);

        ['left', 'right', 'action'].forEach(key => {
          const label = key === 'left' ? '←' : key === 'right' ? '→' : 'FIRE';
          const cls = key === 'action' ? 'nx-action' : '';
          const button = makePadButton(key, label, cls);
          row.appendChild(button);

          controllerCleanups.push(
            bindPadButton(
              key,
              () => handlers[key]?.(true),
              () => handlers[key]?.(false)
            )
          );
        });
      } else {
        controls.innerHTML = `<div class="nx-pad-info">${escapeHTML(handlers.info || 'Use the game buttons on the screen.')}</div>`;
      }
    }

    function listenKey(handler) {
      function keydown(event) {
        if (token !== gameToken) return;
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
          event.preventDefault();
        }
        handler(event, true);
      }

      function keyup(event) {
        if (token !== gameToken) return;
        handler(event, false);
      }

      window.addEventListener('keydown', keydown);
      window.addEventListener('keyup', keyup);

      return () => {
        window.removeEventListener('keydown', keydown);
        window.removeEventListener('keyup', keyup);
      };
    }

    function rafLoop(callback) {
      let raf = 0;
      let running = true;
      let previous = 0;

      function frame(now) {
        if (!running || token !== gameToken) return;
        const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
        previous = now;
        callback(dt, now);
        raf = requestAnimationFrame(frame);
      }

      raf = requestAnimationFrame(frame);

      return () => {
        running = false;
        cancelAnimationFrame(raf);
      };
    }

    function intervalLoop(callback, delay) {
      const timer = setInterval(() => {
        if (token === gameToken) callback();
      }, delay);

      return () => clearInterval(timer);
    }

    function canvasGame(width, height) {
      const item = makeCanvas(width, height);
      area.appendChild(item.wrap);
      return item;
    }

    function finishGame(text) {
      setMessage(text);
    }

    function restartHome() {
      renderHome();
    }

    // SNAKE
    function startSnake() {
      const { canvas, ctx } = canvasGame(360, 360);
      const size = 18;
      const cells = 20;
      let snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
      let direction = { x: 1, y: 0 };
      let nextDirection = { x: 1, y: 0 };
      let food = { x: 14, y: 10 };
      let alive = true;
      let accumulator = 0;

      function spawnFood() {
        for (let tries = 0; tries < 500; tries++) {
          const candidate = {
            x: Math.floor(Math.random() * cells),
            y: Math.floor(Math.random() * cells)
          };
          if (!snake.some(part => part.x === candidate.x && part.y === candidate.y)) {
            food = candidate;
            return;
          }
        }
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#102035';
        ctx.lineWidth = 1;
        for (let i = 0; i <= cells; i++) {
          ctx.beginPath();
          ctx.moveTo(i * size, 0);
          ctx.lineTo(i * size, canvas.height);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(0, i * size);
          ctx.lineTo(canvas.width, i * size);
          ctx.stroke();
        }

        ctx.fillStyle = '#ff5e89';
        ctx.shadowColor = '#ff5e89';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(food.x * size + size / 2, food.y * size + size / 2, size * .34, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        snake.forEach((part, index) => {
          ctx.fillStyle = index === 0 ? '#66ffd0' : '#1bc995';
          ctx.shadowColor = '#35e8ff';
          ctx.shadowBlur = index === 0 ? 12 : 4;
          ctx.fillRect(part.x * size + 2, part.y * size + 2, size - 4, size - 4);
        });
        ctx.shadowBlur = 0;
      }

      function step() {
        if (!alive) return;
        direction = nextDirection;

        const head = {
          x: snake[0].x + direction.x,
          y: snake[0].y + direction.y
        };

        if (
          head.x < 0 || head.y < 0 ||
          head.x >= cells || head.y >= cells ||
          snake.some((part, index) => index > 0 && part.x === head.x && part.y === head.y)
        ) {
          alive = false;
          finishGame('Game over! Tap Restart to play again.');
          return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
          addScore(10);
          spawnFood();
        } else {
          snake.pop();
        }

        draw();
      }

      function changeDirection(key) {
        const map = {
          up: { x: 0, y: -1 },
          down: { x: 0, y: 1 },
          left: { x: -1, y: 0 },
          right: { x: 1, y: 0 }
        };
        const next = map[key];
        if (!next) return;

        if (next.x !== -direction.x || next.y !== -direction.y) {
          nextDirection = next;
        }
      }

      setPad('dpad', {
        up: down => down && changeDirection('up'),
        down: down => down && changeDirection('down'),
        left: down => down && changeDirection('left'),
        right: down => down && changeDirection('right')
      });

      const removeKeys = listenKey(event => {
        if (!event[1]) return;
        const key = event[0].key;
        if (key === 'ArrowUp' || key.toLowerCase() === 'w') changeDirection('up');
        if (key === 'ArrowDown' || key.toLowerCase() === 's') changeDirection('down');
        if (key === 'ArrowLeft' || key.toLowerCase() === 'a') changeDirection('left');
        if (key === 'ArrowRight' || key.toLowerCase() === 'd') changeDirection('right');
      });

      const removeLoop = rafLoop(dt => {
        accumulator += dt;
        if (accumulator >= 0.12) {
          accumulator = 0;
          step();
        }
      });

      draw();
      return () => {
        removeLoop();
        removeKeys();
      };
    }

    // TIC-TAC-TOE
    function startTicTacToe() {
      setPad('info', { info: 'Tap any empty square to place X. The computer plays O.' });

      area.innerHTML = `
        <div class="nx-result" data-ttt-status>Your turn — you are X.</div>
        <div class="nx-board nx-ttt-board" data-ttt-board>
          ${Array.from({ length: 9 }, (_, i) => `<button class="nx-cell" data-cell="${i}" aria-label="Square ${i + 1}"></button>`).join('')}
        </div>
      `;

      const board = Array(9).fill('');
      let ended = false;
      let aiTimer = null;
      const boardElement = $('[data-ttt-board]', area);
      const status = $('[data-ttt-status]', area);
      const winLines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];

      function winner() {
        for (const line of winLines) {
          const [a, b, c] = line;
          if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
          }
        }
        return board.every(Boolean) ? 'draw' : null;
      }

      function render() {
        $$('[data-cell]', boardElement).forEach(button => {
          const value = board[Number(button.dataset.cell)];
          button.textContent = value;
          button.disabled = ended || Boolean(value);
          button.classList.toggle('nx-o', value === 'O');
        });
      }

      function checkEnd() {
        const result = winner();
        if (!result) return false;
        ended = true;
        render();

        if (result === 'X') {
          addScore(1);
          status.textContent = 'You win! +1 point.';
        } else if (result === 'O') {
          status.textContent = 'Computer wins. Try again!';
        } else {
          status.textContent = 'It is a draw.';
        }
        return true;
      }

      function aiMove() {
        if (ended || token !== gameToken) return;

        let move = findWinningMove('O');
        if (move < 0) move = findWinningMove('X');
        if (move < 0 && !board[4]) move = 4;

        if (move < 0) {
          const corners = [0, 2, 6, 8].filter(index => !board[index]);
          if (corners.length) move = corners[Math.floor(Math.random() * corners.length)];
        }

        if (move < 0) {
          const empty = board.map((v, i) => v ? -1 : i).filter(i => i >= 0);
          if (empty.length) move = empty[Math.floor(Math.random() * empty.length)];
        }

        if (move >= 0) board[move] = 'O';
        render();
        checkEnd();
        if (!ended) status.textContent = 'Your turn — you are X.';
      }

      function findWinningMove(mark) {
        for (let i = 0; i < 9; i++) {
          if (board[i]) continue;
          board[i] = mark;
          const won = winner() === mark;
          board[i] = '';
          if (won) return i;
        }
        return -1;
      }

      function clickCell(event) {
        const button = event.target.closest('[data-cell]');
        if (!button || ended) return;
        const index = Number(button.dataset.cell);
        if (board[index]) return;

        board[index] = 'X';
        render();
        if (checkEnd()) return;

        status.textContent = 'Computer is thinking…';
        aiTimer = setTimeout(aiMove, 350);
      }

      boardElement.addEventListener('click', clickCell);
      render();

      return () => {
        clearTimeout(aiTimer);
        boardElement.removeEventListener('click', clickCell);
      };
    }

    // PONG
    function startPong() {
      const { canvas, ctx } = canvasGame(520, 320);
      let playerY = 125;
      let aiY = 125;
      let ball = { x: 260, y: 160, vx: 210, vy: 125, r: 7 };
      let playerScore = 0;
      let aiScore = 0;
      let up = false;
      let down = false;
      const paddleW = 10;
      const paddleH = 70;

      function resetBall(direction) {
        ball = {
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: 205 * direction,
          vy: (Math.random() * 160) - 80,
          r: 7
        };
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#1d3550';
        ctx.setLineDash([7, 9]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#35e8ff';
        ctx.shadowColor = '#35e8ff';
        ctx.shadowBlur = 12;
        ctx.fillRect(18, playerY, paddleW, paddleH);

        ctx.fillStyle = '#9b6cff';
        ctx.shadowColor = '#9b6cff';
        ctx.fillRect(canvas.width - 28, aiY, paddleW, paddleH);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 30px system-ui';
        ctx.fillStyle = '#d9e8ff';
        ctx.textAlign = 'center';
        ctx.fillText(playerScore, canvas.width / 2 - 55, 42);
        ctx.fillText(aiScore, canvas.width / 2 + 55, 42);
      }

      function update(dt) {
        if (up) playerY -= 280 * dt;
        if (down) playerY += 280 * dt;
        playerY = Math.max(0, Math.min(canvas.height - paddleH, playerY));

        const target = ball.y - paddleH / 2;
        aiY += Math.sign(target - aiY) * Math.min(Math.abs(target - aiY), 205 * dt);
        aiY = Math.max(0, Math.min(canvas.height - paddleH, aiY));

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        if (ball.y < ball.r || ball.y > canvas.height - ball.r) ball.vy *= -1;

        if (
          ball.vx < 0 &&
          ball.x - ball.r < 28 &&
          ball.y > playerY &&
          ball.y < playerY + paddleH
        ) {
          ball.vx = Math.abs(ball.vx) * 1.04;
          ball.vy += ((ball.y - (playerY + paddleH / 2)) / (paddleH / 2)) * 65;
          ball.x = 29;
        }

        if (
          ball.vx > 0 &&
          ball.x + ball.r > canvas.width - 28 &&
          ball.y > aiY &&
          ball.y < aiY + paddleH
        ) {
          ball.vx = -Math.abs(ball.vx) * 1.03;
          ball.vy += ((ball.y - (aiY + paddleH / 2)) / (paddleH / 2)) * 55;
          ball.x = canvas.width - 29;
        }

        if (ball.x < -10) {
          aiScore++;
          resetBall(1);
        } else if (ball.x > canvas.width + 10) {
          playerScore++;
          addScore(1);
          resetBall(-1);
        }
      }

      setPad('vertical', {
        up: active => { up = active; },
        down: active => { down = active; }
      });

      const removeKeys = listenKey((event, pressed) => {
        const key = event.key.toLowerCase();
        if (key === 'arrowup' || key === 'w') up = pressed;
        if (key === 'arrowdown' || key === 's') down = pressed;
      });

      const removeLoop = rafLoop(dt => {
        update(dt);
        draw();
      });

      return () => {
        up = down = false;
        removeKeys();
        removeLoop();
      };
    }

    // BRICK BREAKER
    function startBreakout() {
      const { canvas, ctx } = canvasGame(480, 420);
      const cols = 8;
      const rows = 5;
      const gap = 5;
      const brickW = 50;
      const brickH = 17;
      const offsetX = 22;
      const offsetY = 38;
      let paddleX = 200;
      const paddleW = 86;
      const paddleH = 11;
      let ball = { x: 240, y: 320, vx: 160, vy: -190, r: 7 };
      let alive = true;
      let left = false;
      let right = false;
      const bricks = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          bricks.push({
            x: offsetX + col * (brickW + gap),
            y: offsetY + row * (brickH + gap),
            w: brickW,
            h: brickH,
            alive: true,
            color: ['#35e8ff', '#9b6cff', '#43f5a5', '#ffbe55', '#ff6d9a'][row]
          });
        }
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        bricks.forEach(brick => {
          if (!brick.alive) return;
          ctx.fillStyle = brick.color;
          ctx.shadowColor = brick.color;
          ctx.shadowBlur = 8;
          ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
        });

        ctx.shadowBlur = 14;
        ctx.shadowColor = '#35e8ff';
        ctx.fillStyle = '#35e8ff';
        ctx.fillRect(paddleX, canvas.height - 32, paddleW, paddleH);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      function update(dt) {
        if (!alive) return;

        if (left) paddleX -= 330 * dt;
        if (right) paddleX += 330 * dt;
        paddleX = Math.max(0, Math.min(canvas.width - paddleW, paddleX));

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        if (ball.x < ball.r || ball.x > canvas.width - ball.r) ball.vx *= -1;
        if (ball.y < ball.r) ball.vy = Math.abs(ball.vy);

        const paddleY = canvas.height - 32;
        if (
          ball.vy > 0 &&
          ball.y + ball.r >= paddleY &&
          ball.y < paddleY + paddleH &&
          ball.x >= paddleX &&
          ball.x <= paddleX + paddleW
        ) {
          ball.vy = -Math.abs(ball.vy);
          ball.vx += ((ball.x - (paddleX + paddleW / 2)) / (paddleW / 2)) * 95;
          ball.y = paddleY - ball.r;
        }

        bricks.forEach(brick => {
          if (!brick.alive) return;

          if (
            ball.x + ball.r > brick.x &&
            ball.x - ball.r < brick.x + brick.w &&
            ball.y + ball.r > brick.y &&
            ball.y - ball.r < brick.y + brick.h
          ) {
            brick.alive = false;
            ball.vy *= -1;
            addScore(10);
          }
        });

        if (bricks.every(brick => !brick.alive)) {
          alive = false;
          finishGame('You cleared every brick! Restart to play again.');
        } else if (ball.y > canvas.height + 15) {
          alive = false;
          finishGame('Ball lost! Tap Restart to try again.');
        }
      }

      setPad('horizontal', {
        left: active => { left = active; },
        right: active => { right = active; }
      });

      const removeKeys = listenKey((event, pressed) => {
        const key = event.key.toLowerCase();
        if (key === 'arrowleft' || key === 'a') left = pressed;
        if (key === 'arrowright' || key === 'd') right = pressed;
      });

      const removeLoop = rafLoop(dt => {
        update(dt);
        draw();
      });

      return () => {
        left = right = false;
        removeKeys();
        removeLoop();
      };
    }

    // ENDLESS RUNNER
    function startRunner() {
      const { canvas, ctx } = canvasGame(520, 280);
      const ground = 225;
      const player = { x: 70, y: ground - 35, w: 27, h: 35, vy: 0, jumping: false };
      let obstacles = [];
      let spawnTimer = 0;
      let elapsed = 0;
      let alive = true;
      let jumpQueued = false;
      let scoreTimer = 0;
      let speed = 205;

      function jump() {
        if (!alive) return;
        if (!player.jumping) {
          player.vy = -390;
          player.jumping = true;
        }
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#152b43';
        for (let i = 0; i < 12; i++) {
          const x = (i * 53 - (elapsed * speed * .4) % 53);
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, ground);
          ctx.stroke();
        }

        ctx.strokeStyle = '#35e8ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, ground);
        ctx.lineTo(canvas.width, ground);
        ctx.stroke();

        ctx.fillStyle = '#43f5a5';
        ctx.shadowColor = '#43f5a5';
        ctx.shadowBlur = 12;
        ctx.fillRect(player.x, player.y, player.w, player.h);

        ctx.fillStyle = '#ff6d9a';
        ctx.shadowColor = '#ff6d9a';
        obstacles.forEach(obstacle => {
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
        });
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#d9e8ff';
        ctx.font = '13px system-ui';
        ctx.fillText('DISTANCE ' + score, 12, 22);
      }

      let score = 0;

      function update(dt) {
        if (!alive) return;

        elapsed += dt;
        scoreTimer += dt;
        speed = Math.min(340, 205 + elapsed * 2.2);

        if (scoreTimer >= .1) {
          const gained = Math.floor(scoreTimer * 10);
          score += gained;
          scoreTimer -= gained / 10;
          setScore(score);
        }

        if (jumpQueued) {
          jumpQueued = false;
          jump();
        }

        if (player.jumping) {
          player.vy += 1000 * dt;
          player.y += player.vy * dt;
          if (player.y >= ground - player.h) {
            player.y = ground - player.h;
            player.vy = 0;
            player.jumping = false;
          }
        }

        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          const h = 22 + Math.random() * 24;
          obstacles.push({ x: canvas.width + 10, y: ground - h, w: 18 + Math.random() * 12, h });
          spawnTimer = .85 + Math.random() * .85;
        }

        obstacles.forEach(obstacle => obstacle.x -= speed * dt);
        obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.w > -5);

        for (const obstacle of obstacles) {
          if (
            player.x + player.w - 4 > obstacle.x &&
            player.x + 4 < obstacle.x + obstacle.w &&
            player.y + player.h - 3 > obstacle.y
          ) {
            alive = false;
            finishGame('Game over! Distance: ' + score + '. Tap Restart to try again.');
            break;
          }
        }
      }

      setPad('jump', {
        action: () => { jumpQueued = true; }
      });

      const removeKeys = listenKey((event, pressed) => {
        if (!pressed) return;
        const key = event.key.toLowerCase();
        if (key === ' ' || key === 'arrowup' || key === 'w') jumpQueued = true;
      });

      const removeLoop = rafLoop(dt => {
        update(dt);
        draw();
      });

      return () => {
        alive = false;
        removeKeys();
        removeLoop();
      };
    }

    // SPACE SHOOTER
    function startShooter() {
      const { canvas, ctx } = canvasGame(480, 400);
      const player = { x: 240, y: 345, w: 28, h: 24 };
      let bullets = [];
      let enemies = [];
      let particles = [];
      let left = false;
      let right = false;
      let firing = false;
      let fireCooldown = 0;
      let spawnTimer = 0;
      let elapsed = 0;
      let alive = true;
      let health = 3;

      function shoot() {
        if (!alive || fireCooldown > 0) return;
        bullets.push({ x: player.x, y: player.y - 14, vy: -390 });
        fireCooldown = .16;
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 65; i++) {
          const x = (i * 79) % canvas.width;
          const y = ((i * 113) + elapsed * 30) % canvas.height;
          ctx.fillStyle = i % 4 === 0 ? '#35e8ff' : '#546a8c';
          ctx.fillRect(x, y, 2, 2);
        }

        ctx.fillStyle = '#35e8ff';
        ctx.shadowColor = '#35e8ff';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - 16);
        ctx.lineTo(player.x - 15, player.y + 12);
        ctx.lineTo(player.x + 15, player.y + 12);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 8;
        ctx.fillStyle = '#f6fdff';
        bullets.forEach(bullet => ctx.fillRect(bullet.x - 2, bullet.y - 8, 4, 12));

        ctx.fillStyle = '#ff6d9a';
        ctx.shadowColor = '#ff6d9a';
        enemies.forEach(enemy => {
          ctx.beginPath();
          ctx.moveTo(enemy.x, enemy.y + 12);
          ctx.lineTo(enemy.x - 13, enemy.y - 10);
          ctx.lineTo(enemy.x + 13, enemy.y - 10);
          ctx.closePath();
          ctx.fill();
        });

        particles.forEach(particle => {
          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x, particle.y, 3, 3);
        });

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#e6efff';
        ctx.font = '13px system-ui';
        ctx.fillText('HULL ' + '♥'.repeat(health), 12, 22);
      }

      function explode(x, y, color) {
        for (let i = 0; i < 7; i++) {
          particles.push({
            x, y,
            vx: (Math.random() - .5) * 150,
            vy: (Math.random() - .5) * 150,
            life: .4 + Math.random() * .35,
            color
          });
        }
      }

      function update(dt) {
        if (!alive) return;
        elapsed += dt;

        if (left) player.x -= 270 * dt;
        if (right) player.x += 270 * dt;
        player.x = Math.max(18, Math.min(canvas.width - 18, player.x));

        fireCooldown -= dt;
        if (firing && fireCooldown <= 0) shoot();

        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          enemies.push({
            x: 22 + Math.random() * (canvas.width - 44),
            y: -18,
            vy: 65 + Math.random() * 60 + elapsed * .6
          });
          spawnTimer = Math.max(.35, .85 - elapsed * .008) + Math.random() * .3;
        }

        bullets.forEach(bullet => bullet.y += bullet.vy * dt);
        bullets = bullets.filter(bullet => bullet.y > -20);

        enemies.forEach(enemy => enemy.y += enemy.vy * dt);

        for (const enemy of enemies) {
          if (
            Math.abs(enemy.x - player.x) < 22 &&
            Math.abs(enemy.y - player.y) < 25
          ) {
            enemy.dead = true;
            health--;
            explode(enemy.x, enemy.y, '#ff6d9a');

            if (health <= 0) {
              alive = false;
              finishGame('Ship destroyed! Score: ' + score + '. Tap Restart to try again.');
            }
          }

          for (const bullet of bullets) {
            if (
              !bullet.dead &&
              !enemy.dead &&
              Math.abs(bullet.x - enemy.x) < 16 &&
              Math.abs(bullet.y - enemy.y) < 16
            ) {
              bullet.dead = true;
              enemy.dead = true;
              addScore(10);
              explode(enemy.x, enemy.y, '#35e8ff');
            }
          }

          if (enemy.y > canvas.height + 15) {
            enemy.dead = true;
            health--;
            if (health <= 0) {
              alive = false;
              finishGame('Invaders broke through! Score: ' + score + '.');
            }
          }
        }

        bullets = bullets.filter(bullet => !bullet.dead);
        enemies = enemies.filter(enemy => !enemy.dead);

        particles.forEach(particle => {
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.life -= dt;
        });
        particles = particles.filter(particle => particle.life > 0);
      }

      setPad('shooter', {
        left: active => { left = active; },
        right: active => { right = active; },
        action: active => {
          firing = active;
          if (active) shoot();
        }
      });

      const removeKeys = listenKey((event, pressed) => {
        const key = event.key.toLowerCase();
        if (key === 'arrowleft' || key === 'a') left = pressed;
        if (key === 'arrowright' || key === 'd') right = pressed;
        if (key === ' ' || key === 'enter') {
          firing = pressed;
          if (pressed) shoot();
        }
      });

      const removeLoop = rafLoop(dt => {
        update(dt);
        draw();
      });

      return () => {
        left = right = firing = false;
        removeKeys();
        removeLoop();
      };
    }

    // MATH CHALLENGE
    function startMath() {
      setPad('info', { info: 'Choose an answer below. Keyboard shortcuts 1–4 also work.' });

      area.innerHTML = `
        <div class="nx-result" data-math-info>Answer correctly to earn points.</div>
        <div class="nx-question" data-question></div>
        <div class="nx-answer-grid" data-answers></div>
        <div class="nx-result" data-math-streak>Correct answers: 0</div>
      `;

      const questionNode = $('[data-question]', area);
      const answersNode = $('[data-answers]', area);
      const infoNode = $('[data-math-info]', area);
      const streakNode = $('[data-math-streak]', area);
      let answer = 0;
      let streak = 0;
      let locked = false;

      function newQuestion() {
        locked = false;
        infoNode.textContent = 'Choose the correct answer.';
        const operation = Math.floor(Math.random() * 4);
        let a = 1 + Math.floor(Math.random() * 20);
        let b = 1 + Math.floor(Math.random() * 20);
        let symbol = '+';

        if (operation === 0) {
          answer = a + b;
          symbol = '+';
        } else if (operation === 1) {
          if (b > a) [a, b] = [b, a];
          answer = a - b;
          symbol = '−';
        } else if (operation === 2) {
          a = 1 + Math.floor(Math.random() * 12);
          b = 1 + Math.floor(Math.random() * 12);
          answer = a * b;
          symbol = '×';
        } else {
          b = 1 + Math.floor(Math.random() * 10);
          answer = 1 + Math.floor(Math.random() * 12);
          a = b * answer;
          symbol = '÷';
        }

        questionNode.textContent = `${a} ${symbol} ${b} = ?`;

        const choices = new Set([answer]);
        while (choices.size < 4) {
          const offset = Math.floor(Math.random() * 13) - 6;
          choices.add(Math.max(0, answer + (offset || 1)));
        }

        const shuffled = [...choices].sort(() => Math.random() - .5);
        answersNode.innerHTML = shuffled.map((value, index) =>
          `<button class="nx-answer" data-answer="${value}">${index + 1}. ${value}</button>`
        ).join('');
      }

      function choose(value) {
        if (locked) return;
        locked = true;

        if (Number(value) === answer) {
          streak++;
          addScore(10);
          infoNode.textContent = 'Correct! +10 points.';
        } else {
          streak = 0;
          infoNode.textContent = 'Not quite. The answer was ' + answer + '.';
        }

        streakNode.textContent = 'Correct answers: ' + streak;
        $$('[data-answer]', answersNode).forEach(button => button.disabled = true);
        setTimeout(() => {
          if (token === gameToken) newQuestion();
        }, 650);
      }

      answersNode.addEventListener('click', event => {
        const button = event.target.closest('[data-answer]');
        if (button) choose(button.dataset.answer);
      });

      const removeKeys = listenKey((event, pressed) => {
        if (!pressed) return;
        const key = event.key;
        if (['1', '2', '3', '4'].includes(key)) {
          const button = $$('[data-answer]', answersNode)[Number(key) - 1];
          if (button) choose(button.dataset.answer);
        }
      });

      newQuestion();

      return () => {
        removeKeys();
      };
    }

    // ROCK PAPER SCISSORS
    function startRPS() {
      setPad('info', { info: 'Tap Rock, Paper, or Scissors to play.' });

      area.innerHTML = `
        <div class="nx-result">First to win a round earns 1 point.</div>
        <div class="nx-rps-buttons" data-rps-buttons>
          <button class="nx-btn" data-rps="rock">✊ Rock</button>
          <button class="nx-btn" data-rps="paper">✋ Paper</button>
          <button class="nx-btn" data-rps="scissors">✌️ Scissors</button>
        </div>
        <div class="nx-question" data-rps-result>Ready?</div>
        <div class="nx-result" data-rps-score>Wins: 0 · Draws: 0 · Losses: 0</div>
      `;

      const resultNode = $('[data-rps-result]', area);
      const scoreNodeRPS = $('[data-rps-score]', area);
      const choices = ['rock', 'paper', 'scissors'];
      const icons = { rock: '✊', paper: '✋', scissors: '✌️' };
      let wins = 0;
      let draws = 0;
      let losses = 0;

      function play(player) {
        const computer = choices[Math.floor(Math.random() * 3)];
        let result;

        if (player === computer) {
          draws++;
          result = 'Draw!';
        } else if (
          (player === 'rock' && computer === 'scissors') ||
          (player === 'paper' && computer === 'rock') ||
          (player === 'scissors' && computer === 'paper')
        ) {
          wins++;
          addScore(1);
          result = 'You win!';
        } else {
          losses++;
          result = 'Computer wins!';
        }

        resultNode.textContent = `${icons[player]} vs ${icons[computer]}`;
        scoreNodeRPS.textContent = `${result} Wins: ${wins} · Draws: ${draws} · Losses: ${losses}`;
      }

      const buttons = $('[data-rps-buttons]', area);
      const clickHandler = event => {
        const button = event.target.closest('[data-rps]');
        if (button) play(button.dataset.rps);
      };

      buttons.addEventListener('click', clickHandler);

      const removeKeys = listenKey((event, pressed) => {
        if (!pressed) return;
        const map = { r: 'rock', p: 'paper', s: 'scissors' };
        if (map[event.key.toLowerCase()]) play(map[event.key.toLowerCase()]);
      });

      return () => {
        buttons.removeEventListener('click', clickHandler);
        removeKeys();
      };
    }

    // HANGMAN
    function startHangman() {
      setPad('info', { info: 'Choose letters from the keyboard on screen or your physical keyboard.' });

      const wordList = [
        'GALAXY', 'PLANET', 'ROCKET', 'JUNGLE', 'PUZZLE',
        'ARCADE', 'NEXORA', 'GAMING', 'NEBULA', 'PYTHON',
        'COMPUTER', 'RAINBOW', 'DIAMOND', 'OCEAN', 'FUTURE'
      ];

      let word = wordList[Math.floor(Math.random() * wordList.length)];
      let guessed = new Set();
      let mistakes = 0;
      const maxMistakes = 6;
      let ended = false;

      area.innerHTML = `
        <div class="nx-result" data-hangman-status>Guess the hidden word.</div>
        <div class="nx-question" data-hangman-drawing>○</div>
        <div class="nx-word" data-hangman-word></div>
        <div class="nx-letter-grid" data-hangman-letters>
          ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter =>
            `<button class="nx-letter" data-letter="${letter}">${letter}</button>`
          ).join('')}
        </div>
      `;

      const wordNode = $('[data-hangman-word]', area);
      const drawingNode = $('[data-hangman-drawing]', area);
      const statusNode = $('[data-hangman-status]', area);
      const lettersNode = $('[data-hangman-letters]', area);
      const drawing = ['○', '◔', '◑', '◕', '◉', '☠', '✖'];

      function render() {
        wordNode.textContent = word.split('').map(letter => guessed.has(letter) ? letter : '_').join(' ');
        drawingNode.textContent = drawing[Math.min(mistakes, maxMistakes)];
        $$('[data-letter]', lettersNode).forEach(button => {
          button.disabled = guessed.has(button.dataset.letter) || ended;
        });
      }

      function guess(letter) {
        if (ended || guessed.has(letter)) return;
        guessed.add(letter);

        if (!word.includes(letter)) mistakes++;

        if (word.split('').every(char => guessed.has(char))) {
          ended = true;
          addScore(10);
          statusNode.textContent = `You solved it! The word was ${word}. +10 points.`;
        } else if (mistakes >= maxMistakes) {
          ended = true;
          statusNode.textContent = `Game over! The word was ${word}.`;
        } else {
          statusNode.textContent = `Mistakes: ${mistakes}/${maxMistakes}`;
        }

        render();
      }

      const clickHandler = event => {
        const button = event.target.closest('[data-letter]');
        if (button) guess(button.dataset.letter);
      };

      lettersNode.addEventListener('click', clickHandler);

      const removeKeys = listenKey((event, pressed) => {
        if (!pressed && /^[a-z]$/i.test(event.key)) {
          guess(event.key.toUpperCase());
        }
      });

      render();

      return () => {
        lettersNode.removeEventListener('click', clickHandler);
        removeKeys();
      };
    }

    // FLAPPY FLYER
    function startFlappy() {
      const { canvas, ctx } = canvasGame(360, 480);
      const bird = { x: 82, y: 210, vy: 0, r: 12 };
      let pipes = [];
      let elapsed = 0;
      let spawnTimer = 0;
      let alive = true;
      let started = false;
      let flapQueued = false;
      let distance = 0;
      const gravity = 900;
      const flapStrength = -300;
      const pipeWidth = 54;
      const gapHeight = 145;

      function flap() {
        if (!alive) return;
        if (!started) started = true;
        bird.vy = flapStrength;
      }

      function draw() {
        ctx.fillStyle = '#071226';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 28; i++) {
          const x = (i * 37) % canvas.width;
          const y = (i * 71) % canvas.height;
          ctx.fillStyle = '#213957';
          ctx.fillRect(x, y, 2, 2);
        }

        pipes.forEach(pipe => {
          ctx.fillStyle = '#43f5a5';
          ctx.shadowColor = '#43f5a5';
          ctx.shadowBlur = 8;
          ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
          ctx.fillRect(pipe.x, pipe.top + gapHeight, pipeWidth, canvas.height - pipe.top - gapHeight);

          ctx.fillStyle = '#1bbf88';
          ctx.fillRect(pipe.x - 4, pipe.top - 10, pipeWidth + 8, 10);
          ctx.fillRect(pipe.x - 4, pipe.top + gapHeight, pipeWidth + 8, 10);
        });

        ctx.shadowColor = '#ffdc68';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffdc68';
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#091120';
        ctx.beginPath();
        ctx.arc(bird.x + 4, bird.y - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#eaf3ff';
        ctx.font = 'bold 17px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('SCORE ' + score, canvas.width / 2, 30);

        if (!started && alive) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 17px system-ui';
          ctx.fillText('TAP FLAP TO START', canvas.width / 2, canvas.height / 2 + 65);
        }
      }

      function update(dt) {
        if (!alive) return;

        if (flapQueued) {
          flapQueued = false;
          flap();
        }

        if (!started) return;

        elapsed += dt;
        bird.vy += gravity * dt;
        bird.y += bird.vy * dt;

        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          const top = 55 + Math.random() * (canvas.height - gapHeight - 115);
          pipes.push({ x: canvas.width + 5, top, scored: false });
          spawnTimer = 1.35;
        }

        pipes.forEach(pipe => {
          pipe.x -= 145 * dt;

          if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
            pipe.scored = true;
            score++;
            setScore(score);
          }

          const horizontal = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + pipeWidth;
          const verticalHit = bird.y - bird.r < pipe.top || bird.y + bird.r > pipe.top + gapHeight;

          if (horizontal && verticalHit) {
            alive = false;
            finishGame('You hit a pipe! Score: ' + score + '. Tap Restart to try again.');
          }
        });

        pipes = pipes.filter(pipe => pipe.x + pipeWidth > -5);

        if (bird.y - bird.r < 0 || bird.y + bird.r > canvas.height) {
          alive = false;
          finishGame('Flight ended! Score: ' + score + '. Tap Restart to try again.');
        }
      }

      let score = 0;

      setPad('flap', {
        action: () => { flapQueued = true; }
      });

      const removeKeys = listenKey((event, pressed) => {
        if (!pressed) return;
        const key = event.key.toLowerCase();
        if (key === ' ' || key === 'arrowup' || key === 'w') flapQueued = true;
      });

      const clickFlap = () => { flapQueued = true; };
      canvas.addEventListener('pointerdown', clickFlap);

      const removeLoop = rafLoop(dt => {
        update(dt);
        draw();
      });

      return () => {
        alive = false;
        removeKeys();
        removeLoop();
        canvas.removeEventListener('pointerdown', clickFlap);
      };
    }

    try {
      switch (id) {
        case 'snake': gameCleanup = startSnake(); break;
        case 'ttt': gameCleanup = startTicTacToe(); break;
        case 'pong': gameCleanup = startPong(); break;
        case 'breakout': gameCleanup = startBreakout(); break;
        case 'runner': gameCleanup = startRunner(); break;
        case 'shooter': gameCleanup = startShooter(); break;
        case 'math': gameCleanup = startMath(); break;
        case 'rps': gameCleanup = startRPS(); break;
        case 'hangman': gameCleanup = startHangman(); break;
        case 'flappy': gameCleanup = startFlappy(); break;
        default:
          area.textContent = 'This game is not available.';
      }
    } catch (error) {
      console.error('Nexora game error:', error);
      area.innerHTML = '<p class="nx-result">The game could not start. Tap Restart to try again.</p>';
    }

    cleanupCurrent = () => {
      controllerCleanups.forEach(fn => {
        try { fn(); } catch (_) {}
      });
      controllerCleanups = [];

      try { gameCleanup(); } catch (_) {}

      if (gamepad && gamepad.isConnected) {
        gamepad.querySelectorAll('button').forEach(button => {
          button.classList.remove('nx-active');
        });
      }
    };
  }

  injectStyles();
  renderHome();
})();