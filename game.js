/* ==========================================================
   REXWEB NEXORA — LAPTOP-STYLE GAMING INTERFACE ARCADE
   Complete self-contained game.js
   Mobile + Desktop | Touchpad & Laptop Styling
   ========================================================== */

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
        --nx-bg:#030712;
        --nx-panel:#08101d;
        --nx-panel2:#0d182b;
        --nx-line:#1e314d;
        --nx-text:#edf4ff;
        --nx-muted:#8399b9;
        --nx-cyan:#35e8ff;
        --nx-purple:#9b6cff;
        --nx-green:#43f5a5;
        color:var(--nx-text);
        background:var(--nx-bg);
        font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        min-height:100%;
        padding:16px;
        box-sizing:border-box;
      }

      #nexora-games * { box-sizing:border-box; }
      #nexora-games button,
      #nexora-games input { font:inherit; }
      #nexora-games button { -webkit-tap-highlight-color:transparent; }

      #nexora-games .nx-shell {
        width:min(100%,1100px);
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
        width:42px;
        height:42px;
        display:grid;
        place-items:center;
        border:1px solid #27637c;
        border-radius:12px;
        color:var(--nx-cyan);
        font-size:22px;
        font-weight:900;
        background:linear-gradient(135deg,#0d2538,#13102c);
        box-shadow:0 0 18px #35e8ff15;
      }

      #nexora-games .nx-brand h1 {
        font-size:clamp(16px,3.5vw,22px);
        line-height:1.15;
        margin:0;
        letter-spacing:.5px;
      }

      #nexora-games .nx-brand p {
        margin:4px 0 0;
        color:var(--nx-muted);
        font-size:11px;
      }

      #nexora-games .nx-btn {
        border:1px solid var(--nx-line);
        color:var(--nx-text);
        background:var(--nx-panel2);
        border-radius:10px;
        padding:8px 14px;
        min-height:38px;
        cursor:pointer;
        transition:transform .1s,border-color .1s,background .1s;
      }

      #nexora-games .nx-btn:active { transform:scale(.97); }
      #nexora-games .nx-btn:focus-visible {
        outline:2px solid var(--nx-cyan);
        outline-offset:2px;
      }

      #nexora-games .nx-btn-primary {
        color:#001019;
        font-weight:800;
        background:var(--nx-cyan);
        border-color:var(--nx-cyan);
      }

      #nexora-games .nx-section-title {
        font-size:16px;
        margin:16px 0 12px;
      }

      #nexora-games .nx-game-grid {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:12px;
      }

      #nexora-games .nx-game-card {
        text-align:left;
        padding:15px;
        border:1px solid var(--nx-line);
        border-radius:14px;
        background:linear-gradient(145deg,var(--nx-panel),#060c18);
        color:var(--nx-text);
        min-width:0;
        cursor:pointer;
        transition:transform .12s,border-color .12s,box-shadow .12s;
      }

      #nexora-games .nx-game-card:hover {
        border-color:#2684a5;
        box-shadow:0 0 16px #35e8ff0a;
      }

      #nexora-games .nx-game-card:active { transform:scale(.985); }

      #nexora-games .nx-card-icon {
        font-size:26px;
        margin-bottom:10px;
        display:block;
      }

      #nexora-games .nx-card-title {
        font-size:14px;
        font-weight:800;
        display:block;
      }

      #nexora-games .nx-card-description {
        color:var(--nx-muted);
        font-size:11px;
        display:block;
        margin-top:5px;
        line-height:1.4;
      }

      #nexora-games .nx-card-best {
        display:block;
        color:var(--nx-cyan);
        font-size:10px;
        margin-top:10px;
      }

      /* LAPTOP CHASSIS STYLING */
      #nexora-games .nx-laptop-chassis {
        border:2px solid #233958;
        background:linear-gradient(180deg,#0a1324,#050a14);
        border-radius:20px;
        padding:16px;
        box-shadow:0 14px 40px rgba(0,0,0,0.6);
        max-width:960px;
        margin:0 auto;
      }

      #nexora-games .nx-game-top {
        display:flex;
        justify-content:space-between;
        align-items:center;
        flex-wrap:wrap;
        gap:10px;
        margin-bottom:12px;
        padding:0 4px;
      }

      #nexora-games .nx-game-heading {
        display:flex;
        align-items:center;
        gap:10px;
      }

      #nexora-games .nx-game-heading h2 {
        font-size:18px;
        margin:0;
      }

      #nexora-games .nx-game-heading p {
        font-size:11px;
        color:var(--nx-muted);
        margin:3px 0 0;
      }

      #nexora-games .nx-stats {
        display:flex;
        gap:8px;
        flex-wrap:wrap;
      }

      #nexora-games .nx-stat {
        padding:6px 10px;
        border:1px solid var(--nx-line);
        border-radius:8px;
        background:#050b16;
        font-size:11px;
        white-space:nowrap;
      }

      #nexora-games .nx-stat strong { color:var(--nx-cyan); }

      #nexora-games .nx-game-screen {
        background:#02050c;
        border:1px solid #1c2e4a;
        border-radius:14px;
        padding:16px;
        min-height:260px;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        position:relative;
        overflow:hidden;
      }

      #nexora-games .nx-canvas-wrap {
        width:100%;
        display:flex;
        justify-content:center;
      }

      #nexora-games canvas {
        display:block;
        max-width:100%;
        height:auto;
        border-radius:10px;
        background:#010307;
        touch-action:none;
      }

      #nexora-games .nx-message {
        text-align:center;
        min-height:22px;
        padding:6px 12px;
        color:var(--nx-cyan);
        font-size:12px;
      }

      /* LAPTOP TOUCHPAD SECTION */
      #nexora-games .nx-laptop-deck {
        margin-top:16px;
        padding-top:14px;
        border-top:1px solid #1a2c46;
        display:flex;
        flex-direction:column;
        align-items:center;
        gap:10px;
      }

      #nexora-games .nx-touchpad {
        width:min(100%,320px);
        height:76px;
        background:linear-gradient(145deg,#081120,#050a13);
        border:1px solid #284266;
        border-radius:12px;
        box-shadow:inset 0 2px 5px rgba(0,0,0,0.5), 0 0 12px #35e8ff08;
        display:flex;
        align-items:center;
        justify-content:center;
        position:relative;
        touch-action:none;
        user-select:none;
        -webkit-user-select:none;
        cursor:pointer;
        transition:border-color .15s, box-shadow .15s;
      }

      #nexora-games .nx-touchpad.nx-active {
        border-color:var(--nx-cyan);
        box-shadow:inset 0 2px 8px rgba(0,0,0,0.7), 0 0 16px #35e8ff25;
        background:linear-gradient(145deg,#0a172c,#070d18);
      }

      #nexora-games .nx-touchpad-indicator {
        width:44px;
        height:4px;
        background:#1e3554;
        border-radius:2px;
      }

      #nexora-games .nx-touchpad-hint {
        position:absolute;
        bottom:6px;
        font-size:9px;
        color:var(--nx-muted);
        letter-spacing:1px;
        font-weight:700;
        pointer-events:none;
      }

      #nexora-games .nx-deck-actions {
        display:flex;
        justify-content:center;
        gap:10px;
        width:100%;
      }

      #nexora-games .nx-board {
        display:grid;
        gap:8px;
        max-width:340px;
        margin:8px auto;
      }

      #nexora-games .nx-ttt-board {
        grid-template-columns:repeat(3,minmax(0,1fr));
        width:min(100%,310px);
      }

      #nexora-games .nx-cell {
        aspect-ratio:1;
        border:1px solid #243956;
        border-radius:11px;
        background:#081424;
        color:var(--nx-cyan);
        font-size:clamp(26px,7vw,42px);
        font-weight:900;
        cursor:pointer;
      }

      #nexora-games .nx-cell:disabled { cursor:default; opacity:.95; }
      #nexora-games .nx-cell.nx-o { color:var(--nx-purple); }

      #nexora-games .nx-answer-grid {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:8px;
        max-width:440px;
        margin:12px auto;
        width:100%;
      }

      #nexora-games .nx-answer {
        padding:12px 10px;
        border:1px solid var(--nx-line);
        border-radius:10px;
        color:var(--nx-text);
        background:#081424;
        font-weight:800;
        cursor:pointer;
      }

      #nexora-games .nx-answer:active { border-color:var(--nx-cyan); }
      
      #nexora-games .nx-word {
        text-align:center;
        font-size:clamp(20px,5vw,30px);
        letter-spacing:6px;
        margin:14px 0;
        font-weight:900;
        overflow-wrap:anywhere;
      }

      #nexora-games .nx-letter-grid {
        display:grid;
        grid-template-columns:repeat(7,minmax(0,1fr));
        gap:5px;
        max-width:440px;
        margin:10px auto;
      }

      #nexora-games .nx-letter {
        min-height:36px;
        border:1px solid var(--nx-line);
        border-radius:7px;
        background:#091424;
        color:var(--nx-text);
        cursor:pointer;
        font-weight:800;
        font-size:13px;
      }

      #nexora-games .nx-letter:disabled { opacity:.3; cursor:default; }
      
      #nexora-games .nx-question {
        font-size:clamp(24px,7vw,38px);
        font-weight:900;
        text-align:center;
        margin:14px 0;
        color:var(--nx-cyan);
      }

      #nexora-games .nx-result {
        font-size:13px;
        color:var(--nx-muted);
        text-align:center;
        min-height:20px;
      }

      #nexora-games .nx-rps-buttons {
        display:flex;
        justify-content:center;
        flex-wrap:wrap;
        gap:8px;
        margin:14px auto;
      }

      #nexora-games .nx-rps-buttons .nx-btn { min-width:88px; }

      #nexora-games .nx-footer {
        text-align:center;
        color:#506682;
        font-size:10px;
        padding:16px 0 2px;
      }

      @media (min-width:650px) {
        #nexora-games { padding:24px; }
        #nexora-games .nx-game-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
        #nexora-games .nx-touchpad { height:84px; width:340px; }
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
              <p>LAPTOP ARCADE UNIVERSE · PLAY WITHOUT LIMITS</p>
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

        <footer class="nx-footer">REXWEB NEXORA · LAPTOP GAMING INTERFACE</footer>
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

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.setAttribute('aria-label', 'Game play area');

    wrap.appendChild(canvas);
    return { wrap, canvas, ctx: canvas.getContext('2d') };
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
    let scoreNode;
    let bestNode;
    let messageNode;
    let touchpad;
    let gameCleanup = () => {};
    let touchpadCleanup = () => {};

    root.innerHTML = `
      <div class="nx-shell">
        <header class="nx-header">
          <div class="nx-brand">
            <div class="nx-logo">N</div>
            <div>
              <h1>REXWEB NEXORA</h1>
              <p>LAPTOP GAMING INTERFACE</p>
            </div>
          </div>
          <button class="nx-btn" data-action="all-games">← All Games</button>
        </header>

        <div class="nx-laptop-chassis">
          <div class="nx-game-top">
            <div class="nx-game-heading">
              <span style="font-size:24px">${game.icon}</span>
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

          <div class="nx-game-screen" data-game-area></div>
          <div class="nx-message" data-message aria-live="polite"></div>

          <div class="nx-laptop-deck">
            <div class="nx-touchpad" data-touchpad>
              <div class="nx-touchpad-indicator"></div>
              <span class="nx-touchpad-hint">TOUCHPAD</span>
            </div>
            <div class="nx-deck-actions">
              <button class="nx-btn nx-btn-primary" data-action="restart">↻ Restart</button>
              <button class="nx-btn" data-action="all-games">▦ Game Menu</button>
            </div>
          </div>
        </div>

        <footer class="nx-footer">Use touchpad gestures, clicks, or your keyboard.</footer>
      </div>
    `;

    area = $('[data-game-area]');
    scoreNode = $('[data-score]');
    bestNode = $('[data-best]');
    messageNode = $('[data-message]');
    touchpad = $('[data-touchpad]');

    $$('[data-action="all-games"]').forEach(btn => {
      btn.addEventListener('click', renderHome);
    });

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

    // Touchpad Gesture & Event Handler Setup
    function setupTouchpad(callbacks = {}) {
      if (!touchpad) return () => {};

      let startX = 0;
      let startY = 0;
      let lastX = 0;
      let lastY = 0;
      let tracking = false;
      let startTime = 0;
      let lastTapTime = 0;

      function pointerDown(e) {
        if (e.cancelable) e.preventDefault();
        tracking = true;
        startX = lastX = e.clientX;
        startY = lastY = e.clientY;
        startTime = performance.now();
        touchpad.classList.add('nx-active');
        if (touchpad.setPointerCapture) {
          try { touchpad.setPointerCapture(e.pointerId); } catch (_) {}
        }
        if (callbacks.onDown) callbacks.onDown(e.clientX, e.clientY);
      }

      function pointerMove(e) {
        if (!tracking) return;
        if (e.cancelable) e.preventDefault();
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        if (callbacks.onMove) callbacks.onMove(dx, dy, e.clientX, e.clientY);
      }

      function pointerUp(e) {
        if (!tracking) return;
        tracking = false;
        touchpad.classList.remove('nx-active');

        const totalDx = lastX - startX;
        const totalDy = lastY - startY;
        const duration = performance.now() - startTime;
        const absDx = Math.abs(totalDx);
        const absDy = Math.abs(totalDy);

        if (absDx < 12 && absDy < 12 && duration < 300) {
          const now = performance.now();
          const isDouble = now - lastTapTime < 320;
          lastTapTime = now;
          if (callbacks.onTap) callbacks.onTap(isDouble);
        } else if (Math.max(absDx, absDy) > 20) {
          if (absDx > absDy) {
            if (callbacks.onSwipeHorizontal) callbacks.onSwipeHorizontal(totalDx > 0 ? 'right' : 'left');
          } else {
            if (callbacks.onSwipeVertical) callbacks.onSwipeVertical(totalDy > 0 ? 'down' : 'up');
          }
        }

        if (callbacks.onUp) callbacks.onUp();
      }

      touchpad.addEventListener('pointerdown', pointerDown);
      touchpad.addEventListener('pointermove', pointerMove);
      touchpad.addEventListener('pointerup', pointerUp);
      touchpad.addEventListener('pointercancel', pointerUp);

      const preventMenu = e => e.preventDefault();
      touchpad.addEventListener('contextmenu', preventMenu);

      return () => {
        touchpad.removeEventListener('pointerdown', pointerDown);
        touchpad.removeEventListener('pointermove', pointerMove);
        touchpad.removeEventListener('pointerup', pointerUp);
        touchpad.removeEventListener('pointercancel', pointerUp);
        touchpad.removeEventListener('contextmenu', preventMenu);
      };
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

    function canvasGame(width, height) {
      const item = makeCanvas(width, height);
      area.appendChild(item.wrap);
      return item;
    }

    function finishGame(text) {
      setMessage(text);
    }

    // 1. SNAKE
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
        ctx.fillStyle = '#010307';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#0b1626';
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
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(food.x * size + size / 2, food.y * size + size / 2, size * .34, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        snake.forEach((part, index) => {
          ctx.fillStyle = index === 0 ? '#66ffd0' : '#1bc995';
          ctx.shadowColor = '#35e8ff';
          ctx.shadowBlur = index === 0 ? 10 : 3;
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

      function changeDir(dir) {
        const map = {
          up: { x: 0, y: -1 },
          down: { x: 0, y: 1 },
          left: { x: -1, y: 0 },
          right: { x: 1, y: 0 }
        };
        const next = map[dir];
        if (!next) return;
        if (next.x !== -direction.x || next.y !== -direction.y) {
          nextDirection = next;
        }
      }

      touchpadCleanup = setupTouchpad({
        onSwipeHorizontal: dir => changeDir(dir),
        onSwipeVertical: dir => changeDir(dir)
      });

      const removeKeys = listenKey(event => {
        if (!event[1]) return;
        const key = event[0].key;
        if (key === 'ArrowUp' || key.toLowerCase() === 'w') changeDir('up');
        if (key === 'ArrowDown' || key.toLowerCase() === 's') changeDir('down');
        if (key === 'ArrowLeft' || key.toLowerCase() === 'a') changeDir('left');
        if (key === 'ArrowRight' || key.toLowerCase() === 'd') changeDir('right');
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
        touchpadCleanup();
      };
    }

    // 2. TIC-TAC-TOE
    function startTicTacToe() {
      setMessage('Tap the touchpad or click grid cells to play X.');

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

      function playerMove(index) {
        if (ended || board[index]) return;
        board[index] = 'X';
        render();
        if (checkEnd()) return;

        status.textContent = 'Computer is thinking…';
        aiTimer = setTimeout(aiMove, 300);
      }

      const clickHandler = event => {
        const button = event.target.closest('[data-cell]');
        if (button) playerMove(Number(button.dataset.cell));
      };

      boardElement.addEventListener('click', clickHandler);

      // Touchpad tap cycles through available cells
      touchpadCleanup = setupTouchpad({
        onTap: () => {
          if (ended) return;
          const available = board.map((v, i) => v === '' ? i : -1).filter(i => i >= 0);
          if (available.length) {
            const pick = available[Math.floor(Math.random() * available.length)];
            playerMove(pick);
          }
        }
      });

      render();

      return () => {
        clearTimeout(aiTimer);
        boardElement.removeEventListener('click', clickHandler);
        touchpadCleanup();
      };
    }

    // 3. PONG
    function startPong() {
      const { canvas, ctx } = canvasGame(500, 300);
      let playerY = 115;
      let aiY = 115;
      let ball = { x: 250, y: 150, vx: 210, vy: 120, r: 7 };
      let playerScore = 0;
      let aiScore = 0;
      const paddleW = 10;
      const paddleH = 68;

      function resetBall(direction) {
        ball = {
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: 200 * direction,
          vy: (Math.random() * 150) - 75,
          r: 7
        };
      }

      function draw() {
        ctx.fillStyle = '#010307';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#152438';
        ctx.setLineDash([6, 8]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#35e8ff';
        ctx.shadowColor = '#35e8ff';
        ctx.shadowBlur = 10;
        ctx.fillRect(16, playerY, paddleW, paddleH);

        ctx.fillStyle = '#9b6cff';
        ctx.shadowColor = '#9b6cff';
        ctx.fillRect(canvas.width - 26, aiY, paddleW, paddleH);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = 'bold 28px system-ui';
        ctx.fillStyle = '#d9e8ff';
        ctx.textAlign = 'center';
        ctx.fillText(playerScore, canvas.width / 2 - 50, 38);
        ctx.fillText(aiScore, canvas.width / 2 + 50, 38);
      }

      touchpadCleanup = setupTouchpad({
        onMove: (dx, dy) => {
          playerY += dy * 1.3;
          playerY = Math.max(0, Math.min(canvas.height - paddleH, playerY));
        }
      });

      const removeKeys = listenKey((event, pressed) => {
        if (!pressed) return;
        const key = event.key.toLowerCase();
        if (key === 'arrowup' || key === 'w') playerY = Math.max(0, playerY - 24);
        if (key === 'arrowdown' || key === 's') playerY = Math.min(canvas.height - paddleH, playerY + 24);
      });

      const removeLoop = rafLoop(dt => {
        aiY += Math.sign((ball.y - paddleH / 2) - aiY) * Math.min(Math.abs((ball.y - paddleH / 2) - aiY), 190 * dt);
        aiY = Math.max(0, Math.min(canvas.height - paddleH, aiY));

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        if (ball.y < ball.r || ball.y > canvas.height - ball.r) ball.vy *= -1;

        if (
          ball.vx < 0 &&
          ball.x - ball.r < 26 &&
          ball.y > playerY &&
          ball.y < playerY + paddleH
        ) {
          ball.vx = Math.abs(ball.vx) * 1.04;
          ball.vy += ((ball.y - (playerY + paddleH / 2)) / (paddleH / 2)) * 60;
          ball.x = 27;
        }

        if (
          ball.vx > 0 &&
          ball.x + ball.r > canvas.width - 26 &&
          ball.y > aiY &&
          ball.y < aiY + paddleH
        ) {
          ball.vx = -Math.abs(ball.vx) * 1.03;
          ball.vy += ((ball.y - (aiY + paddleH / 2)) / (paddleH / 2)) * 50;
          ball.x = canvas.width - 27;
        }

        if (ball.x < -10) {
          aiScore++;
          resetBall(1);
        } else if (ball.x > canvas.width + 10) {
          playerScore++;
          addScore(1);
          resetBall(-1);
        }

        draw();
      });

      return () => {
        removeKeys();
        removeLoop();
        touchpadCleanup();
      };
    }

    // 4. BRICK BREAKER
    function startBreakout() {
      const { canvas, ctx } = canvasGame(480, 400);
      const cols = 8;
      const rows = 5;
      const gap = 5;
      const brickW = 50;
      const brickH = 16;
      const offsetX = 20;
      const offsetY = 36;
      let paddleX = 190;
      const paddleW = 84;
      const paddleH = 10;
      let ball = { x: 240, y: 310, vx: 150, vy: -180, r: 7 };
      let alive = true;
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
        ctx.fillStyle = '#010307';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        bricks.forEach(brick => {
          if (!brick.alive) return;
          ctx.fillStyle = brick.color;
          ctx.shadowColor = brick.color;
          ctx.shadowBlur = 6;
          ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
        });

        ctx.shadowBlur = 10;
        ctx.shadowColor = '#35e8ff';
        ctx.fillStyle = '#35e8ff';
        ctx.fillRect(paddleX, canvas.height - 30, paddleW, paddleH);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      touchpadCleanup = setupTouchpad({
        onMove: (dx) => {
          paddleX += dx * 1.5;
          paddleX = Math.max(0, Math.min(canvas.width - paddleW, paddleX));
        }
      });

      const removeKeys = listenKey((event, pressed) => {
        if (!pressed) return;
        const key = event.key.toLowerCase();
        if (key === 'arrowleft' || key === 'a') paddleX = Math.max(0, paddleX - 25);
        if (key === 'arrowright' || key === 'd') paddleX = Math.min(canvas.width - paddleW, paddleX + 25);
      });

      const removeLoop = rafLoop(dt => {
        if (!alive) return;

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        if (ball.x < ball.r || ball.x > canvas.width - ball.r) ball.vx *= -1;
        if (ball.y < ball.r) ball.vy = Math.abs(ball.vy);

        const paddleY = canvas.height - 30;
        if (
          ball.vy > 0 &&
          ball.y + ball.r >= paddleY &&
          ball.y < paddleY + paddleH &&
          ball.x >= paddleX &&
          ball.x <= paddleX + paddleW
        ) {
          ball.vy = -Math.abs(ball.vy);
          ball.vx += ((ball.x - (paddleX + paddleW / 2)) / (paddleW / 2)) * 90;
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

        draw();
      });

      return () => {
        removeKeys();
        removeLoop();
        touchpadCleanup();
      };
    }

    // 5. ENDLESS RUNNER
    function startRunner() {
      const { canvas, ctx } = canvasGame(500, 260);
      const ground = 205;
      const player = { x: 65, y: ground - 32, w: 25, h: 32, vy: 0, jumping: false };
      let obstacles = [];
      let spawnTimer = 0;
      let elapsed = 0;
      let alive = true;
      let jumpQueued = false;
      let scoreTimer = 0;
      let speed = 200;
      let score = 0;

      function jump() {
        if (!alive || player.jumping) return;
        player.vy = -380;
        player.jumping = true;
      }

      function draw() {
        ctx.fillStyle = '#010307';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#122238';
        for (let i = 0; i < 12; i++) {
          const x = (i * 50 - (elapsed * speed * .4) % 50);
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
        ctx.shadowBlur = 10;
        ctx.fillRect(player.x, player.y, player.w, player.h);

        ctx.fillStyle = '#ff6d9a';
        ctx.shadowColor = '#ff6d9a';
        obstacles.forEach(obs => {
          ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        });
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#d9e8ff';
        ctx.font = '12px system-ui';
        ctx.fillText('DISTANCE ' + score, 12, 20);
      }

      touchpadCleanup = setupTouchpad({
        onSwipeVertical: dir => {
          if (dir === 'up') jumpQueued = true;
        },
        onTap: () => { jumpQueued = true; }
      });

      const removeKeys = listenKey((event, pressed) => {
        if (!pressed) return;
        const key = event.key.toLowerCase();
        if (key === ' ' || key === 'arrowup' || key === 'w') jumpQueued = true;
      });

      const removeLoop = rafLoop(dt => {
        if (!alive) return;
        elapsed += dt;
        scoreTimer += dt;
        speed = Math.min(320, 200 + elapsed * 2);

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
          player.vy += 1050 * dt;
          player.y += player.vy * dt;
          if (player.y >= ground - player.h) {
            player.y = ground - player.h;
            player.vy = 0;
            player.jumping = false;
          }
        }

        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          const h = 20 + Math.random() * 22;
          obstacles.push({ x: canvas.width + 10, y: ground - h, w: 16 + Math.random() * 12, h });
          spawnTimer = .9 + Math.random() * .8;
        }

        obstacles.forEach(obs => obs.x -= speed * dt);
        obstacles = obstacles.filter(obs => obs.x + obs.w > -5);

        for (const obs of obstacles) {
          if (
            player.x + player.w - 3 > obs.x &&
            player.x + 3 < obs.x + obs.w &&
            player.y + player.h - 2 > obs.y
          ) {
            alive = false;
            finishGame('Game over! Distance: ' + score + '. Tap Restart.');
            break;
          }
        }

        draw();
      });

      return () => {
        removeKeys();
        removeLoop();
        touchpadCleanup();
      };
    }

    // 6. SPACE SHOOTER
    function startShooter() {
      const { canvas, ctx } = canvasGame(480, 380);
      const player = { x: 240, y: 325, w: 26, h: 22 };
      let bullets = [];
      let enemies = [];
      let particles = [];
      let fireCooldown = 0;
      let spawnTimer = 0;
      let elapsed = 0;
      let alive = true;
      let health = 3;

      function shoot() {
        if (!alive || fireCooldown > 0) return;
        bullets.push({ x: player.x, y: player.y - 12, vy: -380 });
        fireCooldown = .15;
      }

      function draw() {
        ctx.fillStyle = '#010307';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 50; i++) {
          const x = (i * 79) % canvas.width;
          const y = ((i * 113) + elapsed * 25) % canvas.height;
          ctx.fillStyle = i % 3 === 0 ? '#35e8ff' : '#425a7c';
          ctx.fillRect(x, y, 2, 2);
        }

        ctx.fillStyle = '#35e8ff';
        ctx.shadowColor = '#35e8ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - 14);
        ctx.lineTo(player.x - 14, player.y + 10);
        ctx.lineTo(player.x + 14, player.y + 10);
        ctx.closePath();
        ctx.fill();

        ctx.shadowBlur = 6;
        ctx.fillStyle = '#ffffff';
        bullets.forEach(b => ctx.fillRect(b.x - 2, b.y - 6, 4, 10));

        ctx.fillStyle = '#ff6d9a';
        ctx.shadowColor = '#ff6d9a';
        enemies.forEach(e => {
          ctx.beginPath();
          ctx.moveTo(e.x, e.y + 10);
          ctx.lineTo(e.x - 12, e.y - 8);
          ctx.lineTo(e.x + 12, e.y - 8);
          ctx.closePath();
          ctx.fill();
        });

        particles.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x, p.y, 3, 3);
        });

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#d9e8ff';
        ctx.font = '12px system-ui';
        ctx.fillText('HULL ' + '♥'.repeat(health), 12, 20);
      }

      function explode(x, y, color) {
        for (let i = 0; i < 6; i++) {
          particles.push({
            x, y,
            vx: (Math.random() - .5) * 140,
            vy: (Math.random() - .5) * 140,
            life: .35 + Math.random() * .3,
            color
          });
        }
      }

      touchpadCleanup = setupTouchpad({
        onMove: (dx) => {
          player.x += dx * 1.5;
          player.x = Math.max(16, Math.min(canvas.width - 16, player.x));
        },
        onTap: () => shoot()
      });

      const removeKeys = listenKey((event, pressed) => {
        if (!pressed) return;
        const key = event.key.toLowerCase();
        if (key === 'arrowleft' || key === 'a') player.x = Math.max(16, player.x - 22);
        if (key === 'arrowright' || key === 'd') player.x = Math.min(canvas.width - 16, player.x + 22);
        if (key === ' ' || key === 'enter') shoot();
      });

      const removeLoop = rafLoop(dt => {
        if (!alive) return;
        elapsed += dt;
        fireCooldown -= dt;

        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          enemies.push({
            x: 20 + Math.random() * (canvas.width - 40),
            y: -16,
            vy: 60 + Math.random() * 55 + elapsed * .5
          });
          spawnTimer = Math.max(.3, .8 - elapsed * .007) + Math.random() * .3;
        }

        bullets.forEach(b => b.y += b.vy * dt);
        bullets = bullets.filter(b => b.y > -20);

        enemies.forEach(e => e.y += e.vy * dt);

        for (const e of enemies) {
          if (Math.abs(e.x - player.x) < 20 && Math.abs(e.y - player.y) < 22) {
            e.dead = true;
            health--;
            explode(e.x, e.y, '#ff6d9a');
            if (health <= 0) {
              alive = false;
              finishGame('Ship destroyed! Score: ' + score + '. Tap Restart.');
            }
          }

          for (const b of bullets) {
            if (!b.dead && !e.dead && Math.abs(b.x - e.x) < 14 && Math.abs(b.y - e.y) < 14) {
              b.dead = true;
              e.dead = true;
              addScore(10);
              explode(e.x, e.y, '#35e8ff');
            }
          }

          if (e.y > canvas.height + 15) {
            e.dead = true;
            health--;
            if (health <= 0) {
              alive = false;
              finishGame('Invaders broke through! Score: ' + score);
            }
          }
        }

        bullets = bullets.filter(b => !b.dead);
        enemies = enemies.filter(e => !e.dead);

        particles.forEach(p => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
        });
        particles = particles.filter(p => p.life > 0);

        draw();
      });

      return () => {
        removeKeys();
        removeLoop();
        touchpadCleanup();
      };
    }

    // 7. MATH CHALLENGE
    function startMath() {
      setMessage('Tap the touchpad or click answer choices.');

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
      let currentChoices = [];

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
          const offset = Math.floor(Math.random() * 11) - 5;
          choices.add(Math.max(0, answer + (offset || 1)));
        }

        currentChoices = [...choices].sort(() => Math.random() - .5);
        answersNode.innerHTML = currentChoices.map((value, index) =>
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
        $$('[data-answer]', answersNode).forEach(btn => btn.disabled = true); setTimeout(() => { if (token === gameToken) newQuestion(); }, 600); }        const clickHandler = event => { const button = event.target.closest('[data-answer]'); if (button) choose(button.dataset.answer); };        answersNode.addEventListener('click', clickHandler);        touchpadCleanup = setupTouchpad({ onTap: () => { if (locked \vert{}\vert{} !currentChoices.length) return; const pick = currentChoices[Math.floor(Math.random() * currentChoices.length)]; choose(pick); } });        const removeKeys = listenKey((event, pressed) => { if (!pressed) return; const key = event.key; if (['1', '2', '3', '4'].includes(key)) { const button = $$
('[data-answer]', answersNode)[Number(key) - 1];
          if (button) choose(button.dataset.answer);
        }
      });

      newQuestion();

      return () => {
        answersNode.removeEventListener('click', clickHandler);
        removeKeys();
        touchpadCleanup();
      };
    }

    // 8. ROCK PAPER SCISSORS
    function startRPS() {
      setMessage('Choose Rock, Paper, or Scissors above.');

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

      touchpadCleanup = setupTouchpad({
        onTap: () => {
          const pick = choices[Math.floor(Math.random() * choices.length)];
          play(pick);
        }
      });

      const removeKeys = listenKey((event, pressed) => {
        if (!pressed) return;
        const map = { r: 'rock', p: 'paper', s: 'scissors' };
        if (map[event.key.toLowerCase()]) play(map[event.key.toLowerCase()]);
      });

      return () => {
        buttons.removeEventListener('click', clickHandler);
        removeKeys();
        touchpadCleanup();
      };
    }

    // 9. HANGMAN
    function startHangman() {
      setMessage('Tap letter buttons or use your keyboard.');

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
      const lettersNode = $('[data-hangman-letters]', area); const drawing = ['○', '◔', '◑', '◕', '◉', '☠', '✖'];        function render() { wordNode.textContent = word.split('').map(letter => guessed.has(letter) ? letter : '_').join(' '); drawingNode.textContent = drawing[Math.min(mistakes, maxMistakes)]; $$('[data-letter]', lettersNode).forEach(button => {
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

      touchpadCleanup = setupTouchpad({
        onTap: () => {
          if (ended) return;
          const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
          const available = alphabet.filter(l => !guessed.has(l));
          if (available.length) {
            const pick = available[Math.floor(Math.random() * available.length)];
            guess(pick);
          }
        }
      });

      const removeKeys = listenKey((event, pressed) => {
        if (!pressed && /^[a-z]$/i.test(event.key)) {
          guess(event.key.toUpperCase());
        }
      });

      render();

      return () => {
        lettersNode.removeEventListener('click', clickHandler);
        removeKeys();
        touchpadCleanup();
      };
    }

    // 10. FLAPPY FLYER
    function startFlappy() {
      const { canvas, ctx } = canvasGame(350, 460);
      const bird = { x: 80, y: 200, vy: 0, r: 12 };
      let pipes = [];
      let elapsed = 0;
      let spawnTimer = 0;
      let alive = true;
      let started = false;
      let flapQueued = false;
      let score = 0;
      const gravity = 880;
      const flapStrength = -290;
      const pipeWidth = 52;
      const gapHeight = 140;

      function flap() {
        if (!alive) return;
        if (!started) started = true;
        bird.vy = flapStrength;
      }

      function draw() {
        ctx.fillStyle = '#010307';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 25; i++) {
          const x = (i * 37) % canvas.width;
          const y = (i * 71) % canvas.height;
          ctx.fillStyle = '#1c2d44';
          ctx.fillRect(x, y, 2, 2);
        }

        pipes.forEach(pipe => {
          ctx.fillStyle = '#43f5a5';
          ctx.shadowColor = '#43f5a5';
          ctx.shadowBlur = 6;
          ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
          ctx.fillRect(pipe.x, pipe.top + gapHeight, pipeWidth, canvas.height - pipe.top - gapHeight);

          ctx.fillStyle = '#1bbf88';
          ctx.fillRect(pipe.x - 4, pipe.top - 10, pipeWidth + 8, 10);
          ctx.fillRect(pipe.x - 4, pipe.top + gapHeight, pipeWidth + 8, 10);
        });

        ctx.shadowColor = '#ffdc68';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffdc68';
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.fillStyle = '#010307';
        ctx.beginPath();
        ctx.arc(bird.x + 4, bird.y - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#d9e8ff';
        ctx.font = 'bold 16px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('SCORE ' + score, canvas.width / 2, 28);

        if (!started && alive) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px system-ui';
          ctx.fillText('TAP TOUCHPAD TO START', canvas.width / 2, canvas.height / 2 + 55);
        }
      }

      touchpadCleanup = setupTouchpad({
        onTap: () => { flapQueued = true; }
      });

      const removeKeys = listenKey((event, pressed) => {
        if (!pressed) return;
        const key = event.key.toLowerCase();
        if (key === ' ' || key === 'arrowup' || key === 'w') flapQueued = true;
      });

      const clickFlap = () => { flapQueued = true; };
      canvas.addEventListener('pointerdown', clickFlap);

      const removeLoop = rafLoop(dt => {
        if (!alive) return;

        if (flapQueued) {
          flapQueued = false;
          flap();
        }

        if (!started) {
          draw();
          return;
        }

        elapsed += dt;
        bird.vy += gravity * dt;
        bird.y += bird.vy * dt;

        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          const top = 50 + Math.random() * (canvas.height - gapHeight - 110);
          pipes.push({ x: canvas.width + 5, top, scored: false });
          spawnTimer = 1.3;
        }

        pipes.forEach(pipe => {
          pipe.x -= 140 * dt;

          if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
            pipe.scored = true;
            score++;
            setScore(score);
          }

          const horizontal = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + pipeWidth;
          const verticalHit = bird.y - bird.r < pipe.top || bird.y + bird.r > pipe.top + gapHeight;

          if (horizontal && verticalHit) {
            alive = false;
            finishGame('You hit a pipe! Score: ' + score + '. Tap Restart.');
          }
        });

        pipes = pipes.filter(pipe => pipe.x + pipeWidth > -5);

        if (bird.y - bird.r < 0 || bird.y + bird.r > canvas.height) {
          alive = false;
          finishGame('Flight ended! Score: ' + score + '. Tap Restart.');
        }

        draw();
      });

      return () => {
        alive = false;
        removeKeys();
        removeLoop();
        touchpadCleanup();
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
      try { touchpadCleanup(); } catch (_) {}
      try { gameCleanup(); } catch (_) {}
    };
  }

  injectStyles();
  renderHome();
})();

