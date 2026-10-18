/* REXWEB NEXORA ARCADE — FIXED GAME.JS
   Includes laptop-style touchpad controls without arrow buttons.
   Requires: <div id="nexora-games"></div>
*/

(() => {
  'use strict';

  const ROOT_ID = 'nexora-games';
  const SCORE_KEY = 'rexweb_nexora_arcade_scores_v1';
  const root = document.getElementById(ROOT_ID);

  if (!root) {
    console.error('Nexora Arcade: #nexora-games was not found.');
    return;
  }

  const games = [
    { id: 'snake', name: 'Snake', icon: '🐍', desc: 'Eat, grow, and avoid your tail.' },
    { id: 'ttt', name: 'Tic-Tac-Toe', icon: '⭕', desc: 'Challenge the computer.' },
    { id: 'pong', name: 'Pong', icon: '🏓', desc: 'Keep the ball in play.' },
    { id: 'breakout', name: 'Brick Breaker', icon: '🧱', desc: 'Destroy every brick.' },
    { id: 'runner', name: 'Endless Runner', icon: '🏃', desc: 'Jump over obstacles.' },
    { id: 'shooter', name: 'Space Shooter', icon: '🚀', desc: 'Dodge enemies and fire.' },
    { id: 'math', name: 'Math Challenge', icon: '🧠', desc: 'Solve math questions.' },
    { id: 'rps', name: 'Rock Paper Scissors', icon: '✊', desc: 'Choose your move.' },
    { id: 'hangman', name: 'Hangman', icon: '🔤', desc: 'Guess the hidden word.' },
    { id: 'flappy', name: 'Flappy Flyer', icon: '🐦', desc: 'Fly between the pipes.' }
  ];

  let scores = {};
  let currentGame = null;
  let cleanup = [];
  let animation = 0;
  let session = 0;

  try {
    scores = JSON.parse(localStorage.getItem(SCORE_KEY) || '{}');
    if (!scores || typeof scores !== 'object') scores = {};
  } catch {
    scores = {};
  }

  function saveScores() {
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
    } catch {}
  }

  function best(id) {
    return Number(scores[id]) || 0;
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

  function addCleanup(fn) {
    if (typeof fn === 'function') cleanup.push(fn);
  }

  function stopGame() {
    session++;

    if (animation) {
      cancelAnimationFrame(animation);
      animation = 0;
    }

    cleanup.forEach(fn => {
      try { fn(); } catch (error) {
        console.warn('Arcade cleanup:', error);
      }
    });

    cleanup = [];
    currentGame = null;
  }

  function injectStyles() {
    if (document.getElementById('nexora-arcade-styles')) return;

    const style = document.createElement('style');
    style.id = 'nexora-arcade-styles';

    style.textContent = `
      #nexora-games {
        --bg:#050914;
        --panel:#0b1425;
        --panel2:#101d32;
        --line:#223651;
        --text:#f2f7ff;
        --muted:#91a4bf;
        --cyan:#35e8ff;
        --purple:#9b6cff;
        --green:#43f5a5;

        background:var(--bg);
        color:var(--text);
        min-height:100%;
        padding:16px;
        font-family:system-ui,-apple-system,"Segoe UI",sans-serif;
        box-sizing:border-box;
        overflow:hidden;
      }

      #nexora-games *,
      #nexora-games *::before,
      #nexora-games *::after {
        box-sizing:border-box;
      }

      #nexora-games button {
        font:inherit;
        cursor:pointer;
        -webkit-tap-highlight-color:transparent;
      }

      #nexora-games .nx-shell {
        width:min(100%,1000px);
        margin:auto;
      }

      #nexora-games .nx-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        flex-wrap:wrap;
        gap:12px;
        margin-bottom:20px;
      }

      #nexora-games .nx-brand {
        display:flex;
        align-items:center;
        gap:12px;
      }

      #nexora-games .nx-logo {
        width:54px;
        height:54px;
        display:grid;
        place-items:center;
        border:1px solid #27637c;
        border-radius:16px;
        color:var(--cyan);
        font-size:30px;
        font-weight:900;
        background:linear-gradient(135deg,#102b42,#161332);
      }

      #nexora-games h1 {
        font-size:clamp(18px,4vw,26px);
        margin:0;
        line-height:1.2;
      }

      #nexora-games .nx-subtitle {
        color:var(--muted);
        font-size:12px;
        margin-top:5px;
      }

      #nexora-games .nx-btn {
        border:1px solid var(--line);
        background:var(--panel2);
        color:var(--text);
        padding:11px 15px;
        border-radius:12px;
        min-height:43px;
      }

      #nexora-games .nx-primary {
        background:var(--cyan);
        border-color:var(--cyan);
        color:#001019;
        font-weight:850;
      }

      #nexora-games .nx-title {
        font-size:19px;
        margin:20px 0 13px;
      }

      #nexora-games .nx-grid {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:12px;
      }

      #nexora-games .nx-card {
        text-align:left;
        color:var(--text);
        background:linear-gradient(145deg,var(--panel),#080f1e);
        border:1px solid var(--line);
        border-radius:16px;
        padding:16px;
        min-width:0;
      }

      #nexora-games .nx-card:active {
        border-color:var(--cyan);
      }

      #nexora-games .nx-icon {
        display:block;
        font-size:29px;
        margin-bottom:10px;
      }

      #nexora-games .nx-card-name {
        display:block;
        font-weight:850;
        font-size:15px;
      }

      #nexora-games .nx-description {
        display:block;
        color:var(--muted);
        font-size:12px;
        margin-top:6px;
        line-height:1.5;
      }

      #nexora-games .nx-best {
        display:block;
        color:var(--cyan);
        font-size:11px;
        margin-top:12px;
      }

      #nexora-games .nx-panel {
        border:1px solid var(--line);
        border-radius:20px;
        background:var(--panel);
        overflow:hidden;
      }

      #nexora-games .nx-game-header {
        display:flex;
        align-items:center;
        justify-content:space-between;
        flex-wrap:wrap;
        gap:14px;
        padding:18px;
        border-bottom:1px solid var(--line);
      }

      #nexora-games .nx-game-name {
        display:flex;
        align-items:center;
        gap:12px;
      }

      #nexora-games .nx-game-name h2 {
        font-size:21px;
        margin:0;
      }

      #nexora-games .nx-game-name p {
        color:var(--muted);
        margin:5px 0 0;
        font-size:13px;
      }

      #nexora-games .nx-stats {
        display:flex;
        gap:8px;
        flex-wrap:wrap;
      }

      #nexora-games .nx-stat {
        background:#060d19;
        border:1px solid var(--line);
        border-radius:11px;
        padding:10px 12px;
        font-size:12px;
      }

      #nexora-games .nx-stat strong {
        color:var(--cyan);
      }

      #nexora-games .nx-area {
        padding:14px;
      }

      #nexora-games canvas {
        display:block;
        width:100%;
        height:auto;
        border-radius:14px;
        background:#030914;
        touch-action:none;
      }

      #nexora-games .nx-message {
        text-align:center;
        min-height:28px;
        padding:8px 12px;
        color:var(--cyan);
        font-size:13px;
      }

      /* LAPTOP-STYLE TOUCHPAD: no directional buttons */
      #nexora-games .nx-controller {
        padding:19px 15px 22px;
        border-top:1px solid var(--line);
        background:linear-gradient(180deg,#091120,#060c18);
        text-align:center;
      }

      #nexora-games .nx-controller-label {
        font-size:11px;
        font-weight:850;
        letter-spacing:3px;
        color:var(--muted);
        margin-bottom:15px;
      }

      #nexora-games .nx-laptop-base {
        width:min(100%,440px);
        margin:0 auto;
        padding:8px 12px 12px;
        background:linear-gradient(145deg,#17243a,#0a1120);
        border:1px solid #30445f;
        border-radius:18px 18px 24px 24px;
        box-shadow:0 8px 0 #030711, inset 0 1px #ffffff0b;
      }

      #nexora-games .nx-touchpad {
        position:relative;
        width:min(100%,340px);
        height:150px;
        margin:0 auto;
        border:1px solid #31536d;
        border-radius:14px;
        background:
          radial-gradient(ellipse at center,#142b40 0%,#0b1728 72%);
        box-shadow:inset 0 2px 8px #0008,0 0 18px #35e8ff08;
        overflow:hidden;
        touch-action:none;
        user-select:none;
        -webkit-user-select:none;
        -webkit-touch-callout:none;
      }

      #nexora-games .nx-touchpad::before {
        content:"";
        position:absolute;
        left:50%;
        top:12px;
        bottom:12px;
        border-left:1px dashed #31536d;
        opacity:.5;
        pointer-events:none;
      }

      #nexora-games .nx-touchpad::after {
        content:"";
        position:absolute;
        top:50%;
        left:12px;
        right:12px;
        border-top:1px dashed #31536d;
        opacity:.5;
        pointer-events:none;
      }

      #nexora-games .nx-pad-hint {
        position:absolute;
        inset:0;
        display:grid;
        place-items:center;
        padding:15px;
        color:#9db5cf;
        font-size:12px;
        line-height:1.7;
        pointer-events:none;
        z-index:1;
      }

      #nexora-games .nx-touchpad.nx-touching {
        border-color:var(--cyan);
        background:#102b40;
        box-shadow:inset 0 0 25px #35e8ff12;
      }

      #nexora-games .nx-touchpad.nx-touching .nx-pad-hint {
        opacity:.15;
      }

      #nexora-games .nx-pad-status {
        min-height:23px;
        margin-top:12px;
        color:var(--cyan);
        font-size:12px;
      }

      #nexora-games .nx-pad-bar {
        width:40%;
        height:3px;
        margin:8px auto 0;
        background:#31435a;
        border-radius:5px;
      }

      #nexora-games .nx-controls {
        display:flex;
        justify-content:center;
        gap:10px;
        flex-wrap:wrap;
        padding:15px 12px 18px;
      }

      #nexora-games .nx-board {
        display:grid;
        grid-template-columns:repeat(3,minmax(0,1fr));
        gap:8px;
        max-width:330px;
        margin:16px auto;
      }

      #nexora-games .nx-cell {
        aspect-ratio:1;
        border:1px solid #2a415e;
        border-radius:13px;
        background:#0c192a;
        color:var(--cyan);
        font-size:clamp(30px,8vw,48px);
        font-weight:900;
      }

      #nexora-games .nx-cell.nx-o {
        color:var(--purple);
      }

      #nexora-games .nx-question {
        font-size:clamp(28px,8vw,42px);
        text-align:center;
        font-weight:900;
        color:var(--cyan);
        margin:20px 0;
      }

      #nexora-games .nx-result {
        color:var(--muted);
        text-align:center;
        min-height:25px;
        font-size:13px;
      }

      #nexora-games .nx-answer-grid {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:10px;
        max-width:460px;
        margin:16px auto;
      }

      #nexora-games .nx-answer,
      #nexora-games .nx-letter {
        border:1px solid var(--line);
        border-radius:10px;
        padding:13px 8px;
        background:#0c192a;
        color:var(--text);
        font-weight:800;
      }

      #nexora-games .nx-letter-grid {
        display:grid;
        grid-template-columns:repeat(7,minmax(0,1fr));
        gap:6px;
        max-width:460px;
        margin:15px auto;
      }

      #nexora-games .nx-letter {
        padding:8px 2px;
      }

      #nexora-games .nx-letter:disabled {
        opacity:.3;
      }

      #nexora-games .nx-word {
        text-align:center;
        font-size:clamp(22px,6vw,34px);
        letter-spacing:6px;
        font-weight:900;
        overflow-wrap:anywhere;
        margin:20px 0;
      }

      #nexora-games .nx-rps {
        display:flex;
        justify-content:center;
        flex-wrap:wrap;
        gap:10px;
        margin:20px auto;
      }

      #nexora-games .nx-footer {
        color:#60758f;
        text-align:center;
        font-size:11px;
        padding:18px 0 5px;
      }

      @media(min-width:650px) {
        #nexora-games { padding:24px; }
        #nexora-games .nx-grid {
          grid-template-columns:repeat(3,minmax(0,1fr));
        }
        #nexora-games .nx-area { padding:20px; }
      }

      @media(max-width:380px) {
        #nexora-games { padding:10px; }
        #nexora-games .nx-grid { gap:8px; }
        #nexora-games .nx-card { padding:12px; }
        #nexora-games .nx-touchpad { height:130px; }
        #nexora-games .nx-letter-grid {
          grid-template-columns:repeat(6,minmax(0,1fr));
        }
      }
    `;

    document.head.appendChild(style);
  }

  function shell() {
    return `
      <div class="nx-shell">
        <header class="nx-header">
          <div class="nx-brand">
            <div class="nx-logo">N</div>
            <div>
              <h1>REXWEB NEXORA</h1>
              <div class="nx-subtitle">ARCADE UNIVERSE · TOUCH TO PLAY</div>
            </div>
          </div>
          <button class="nx-btn" data-home>← All Games</button>
        </header>
      </div>
    `;
  }

  function renderHome() {
    stopGame();

    root.innerHTML = `
      <div class="nx-shell">
        <header class="nx-header">
          <div class="nx-brand">
            <div class="nx-logo">N</div>
            <div>
              <h1>REXWEB NEXORA</h1>
              <div class="nx-subtitle">ARCADE UNIVERSE · PLAY WITHOUT LIMITS</div>
            </div>
          </div>
          <button class="nx-btn" data-refresh>↻ Refresh Scores</button>
        </header>

        <h2 class="nx-title">Choose Your Game</h2>

        <div class="nx-grid">
          ${games.map(game => `
            <button class="nx-card" data-open="${game.id}">
              <span class="nx-icon">${game.icon}</span>
              <span class="nx-card-name">${escapeHTML(game.name)}</span>
              <span class="nx-description">${escapeHTML(game.desc)}</span>
              <span class="nx-best">BEST SCORE: ${best(game.id)}</span>
            </button>
          `).join('')}
        </div>

        <footer class="nx-footer">
          REXWEB NEXORA · YOUR DIGITAL WORLD, WITHOUT LIMITS
        </footer>
      </div>
    `;

    root.querySelectorAll('[data-open]').forEach(button => {
      button.addEventListener('click', () => openGame(button.dataset.open));
    });

    root.querySelector('[data-refresh]').addEventListener('click', renderHome);
  }

  function openGame(id) {
    const game = games.find(item => item.id === id);
    if (!game) return;

    stopGame();
    currentGame = id;
    const mySession = session;

    root.innerHTML = `
      ${shell()}
      <div class="nx-shell">
        <section class="nx-panel">
          <header class="nx-game-header">
            <div class="nx-game-name">
              <span style="font-size:32px">${game.icon}</span>
              <div>
                <h2>${escapeHTML(game.name)}</h2>
                <p>${escapeHTML(game.desc)}</p>
              </div>
            </div>
            <div class="nx-stats">
              <div class="nx-stat">SCORE: <strong data-score>0</strong></div>
              <div class="nx-stat">BEST: <strong data-best>${best(id)}</strong></div>
            </div>
          </header>

          <div class="nx-area" data-area></div>
          <div class="nx-message" data-message aria-live="polite"></div>

          <section class="nx-controller">
            <div class="nx-controller-label">TOUCH CONTROLLER</div>
            <div class="nx-laptop-base">
              <div class="nx-touchpad" data-touchpad aria-label="Touchpad game controller">
                <div class="nx-pad-hint">
                  Swipe to move · Tap to act<br>
                  Drag anywhere inside this pad
                </div>
              </div>
              <div class="nx-pad-bar"></div>
            </div>
            <div class="nx-pad-status" data-pad-status>Touchpad ready</div>
          </section>

          <div class="nx-controls">
            <button class="nx-btn nx-primary" data-restart>↻ Restart</button>
            <button class="nx-btn" data-home>▦ All Games</button>
          </div>
        </section>
        <footer class="nx-footer">Use the touchpad or your keyboard to play.</footer>
      </div>
    `;

    root.querySelectorAll('[data-home]').forEach(button => {
      button.addEventListener('click', renderHome);
    });

    root.querySelector('[data-restart]').addEventListener('click', () => {
      if (currentGame === id) openGame(id);
    });

    const area = root.querySelector('[data-area]');
    const message = root.querySelector('[data-message]');
    const scoreEl = root.querySelector('[data-score]');
    const bestEl = root.querySelector('[data-best]');
    const pad = root.querySelector('[data-touchpad]');
    const padStatus = root.querySelector('[data-pad-status]');

    let score = 0;

    function say(text) {
      if (mySession === session && message.isConnected) {
        message.textContent = text;
      }
    }

    function setScore(value) {
      score = Math.max(0, Math.floor(Number(value) || 0));
      scoreEl.textContent = score;

      if (score > best(id)) {
        scores[id] = score;
        saveScores();
      }

      bestEl.textContent = best(id);
    }

    function addScore(value) {
      setScore(score + value);
    }

    function canvas(width, height) {
      area.innerHTML = '';

      const c = document.createElement('canvas');
      c.width = width;
      c.height = height;
      c.setAttribute('aria-label', game.name + ' game area');

      area.appendChild(c);

      return { canvas: c, ctx: c.getContext('2d') };
    }

    /*
      Touchpad gestures:
      - swipe left/right/up/down to move
      - tap to jump, flap, or fire
      - hold to continuously fire in Space Shooter
      - Pong and Brick Breaker use horizontal finger movement
    */

    let pointerStart = null;
    let lastPointer = null;
    let pointerHeld = false;
    let holdTimer = 0;

    const controls = {
      left: false,
      right: false,
      up: false,
      down: false,
      fire: false,
      action: false,
      pointerX: 0.5,
      pointerY: 0.5
    };

    function releasePointer() {
      pointerHeld = false;
      controls.fire = false;
      controls.left = false;
      controls.right = false;
      controls.up = false;
      controls.down = false;

      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = 0;

      pad.classList.remove('nx-touching');
    }

    function updatePointer(event) {
      const rect = pad.getBoundingClientRect();

      controls.pointerX = Math.max(0, Math.min(
        1, (event.clientX - rect.left) / rect.width
      ));

      controls.pointerY = Math.max(0, Math.min(
        1, (event.clientY - rect.top) / rect.height
      ));
    }

    pad.addEventListener('pointerdown', event => {
      event.preventDefault();

      pointerHeld = true;
      pointerStart = { x: event.clientX, y: event.clientY };
      lastPointer = pointerStart;

      updatePointer(event);
      pad.classList.add('nx-touching');

      try { pad.setPointerCapture(event.pointerId); } catch {}

      controls.action = true;

      holdTimer = setTimeout(() => {
        if (pointerHeld) controls.fire = true;
      }, 180);

      if (mySession === session) {
        padStatus.textContent = 'Touchpad active';
      }
    });

    pad.addEventListener('pointermove', event => {
      if (!pointerHeld || !pointerStart) return;
      event.preventDefault();

      updatePointer(event);

      const dx = event.clientX - pointerStart.x;
      const dy = event.clientY - pointerStart.y;

      controls.left = dx < -14;
      controls.right = dx > 14;
      controls.up = dy < -14;
      controls.down = dy > 14;

      lastPointer = { x: event.clientX, y: event.clientY };

      if (Math.abs(dx) > 18 || Math.abs(dy) > 18) {
        padStatus.textContent =
          Math.abs(dx) > Math.abs(dy)
            ? (dx < 0 ? 'Moving left' : 'Moving right')
            : (dy < 0 ? 'Moving up' : 'Moving down');
      }
    });

    function finishPointer(event) {
      if (!pointerHeld) return;

      if (pointerStart && lastPointer) {
        const dx = lastPointer.x - pointerStart.x;
        const dy = lastPointer.y - pointerStart.y;

        if (Math.abs(dx) < 14 && Math.abs(dy) < 14) {
          controls.action = true;
        }
      }

      releasePointer();
      pointerStart = null;
      lastPointer = null;

      if (mySession === session && padStatus.isConnected) {
        padStatus.textContent = 'Touchpad ready';
      }
    }

    pad.addEventListener('pointerup', finishPointer);
    pad.addEventListener('pointercancel', finishPointer);
    pad.addEventListener('lostpointercapture', releasePointer);
    addCleanup(releasePointer);

    const keys = new Set();

    function onKeyDown(event) {
      if (mySession !== session) return;

      const key = event.key.toLowerCase();

      if ([
        'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
        ' ', 'w', 'a', 's', 'd', 'enter'
      ].includes(key)) {
        event.preventDefault();
      }

      keys.add(key);
      controls.left = keys.has('arrowleft') || keys.has('a');
      controls.right = keys.has('arrowright') || keys.has('d');
      controls.up = keys.has('arrowup') || keys.has('w');
      controls.down = keys.has('arrowdown') || keys.has('s');
      controls.fire = keys.has(' ') || keys.has('enter');
      controls.action = controls.fire;
    }

    function onKeyUp(event) {
      keys.delete(event.key.toLowerCase());

      controls.left = keys.has('arrowleft') || keys.has('a');
      controls.right = keys.has('arrowright') || keys.has('d');
      controls.up = keys.has('arrowup') || keys.has('w');
      controls.down = keys.has('arrowdown') || keys.has('s');
      controls.fire = keys.has(' ') || keys.has('enter');
      controls.action = controls.fire;
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    addCleanup(() => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    });

    function loop(callback) {
      let previous = 0;
      let alive = true;

      function frame(time) {
        if (!alive || mySession !== session) return;

        const dt = previous
          ? Math.min((time - previous) / 1000, 0.04)
          : 0;

        previous = time;
        callback(dt, time);

        animation = requestAnimationFrame(frame);
      }

      animation = requestAnimationFrame(frame);

      addCleanup(() => {
        alive = false;
        cancelAnimationFrame(animation);
      });
    }

    function drawText(ctx, text, x, y, size = 16) {
      ctx.fillStyle = '#eaf3ff';
      ctx.font = `bold ${size}px system-ui`;
      ctx.fillText(text, x, y);
    }

    function startSnake() {
      const { canvas: c, ctx } = canvas(360, 360);
      const cell = 18;
      const count = 20;

      let snake = [
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 }
      ];

      let direction = { x: 1, y: 0 };
      let nextDirection = { ...direction };
      let food = { x: 14, y: 10 };
      let timer = 0;
      let alive = true;

      function newFood() {
        for (let i = 0; i < 500; i++) {
          const position = {
            x: Math.floor(Math.random() * count),
            y: Math.floor(Math.random() * count)
          };

          if (!snake.some(part =>
            part.x === position.x && part.y === position.y
          )) {
            food = position;
            return;
          }
        }
      }

      function turn(name) {
        const directions = {
          left: { x: -1, y: 0 },
          right: { x: 1, y: 0 },
          up: { x: 0, y: -1 },
          down: { x: 0, y: 1 }
        };

        const next = directions[name];
        if (!next) return;

        if (next.x !== -direction.x || next.y !== -direction.y) {
          nextDirection = next;
        }
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.strokeStyle = '#102035';

        for (let i = 0; i <= count; i++) {
          ctx.beginPath();
          ctx.moveTo(i * cell, 0);
          ctx.lineTo(i * cell, c.height);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(0, i * cell);
          ctx.lineTo(c.width, i * cell);
          ctx.stroke();
        }

        ctx.fillStyle = '#ff5e89';
        ctx.beginPath();
        ctx.arc(
          food.x * cell + cell / 2,
          food.y * cell + cell / 2,
          cell * 0.34, 0, Math.PI * 2
        );
        ctx.fill();

        snake.forEach((part, index) => {
          ctx.fillStyle = index === 0 ? '#66ffd0' : '#1bc995';
          ctx.fillRect(
            part.x * cell + 2,
            part.y * cell + 2,
            cell - 4,
            cell - 4
          );
        });
      }

      function tick() {
        if (!alive) return;

        direction = { ...nextDirection };

        const head = {
          x: snake[0].x + direction.x,
          y: snake[0].y + direction.y
        };

        if (
          head.x < 0 || head.y < 0 ||
          head.x >= count || head.y >= count ||
          snake.some((part, index) =>
            index > 0 && part.x === head.x && part.y === head.y
          )
        ) {
          alive = false;
          say('Game over! Your score: ' + score);
          return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
          addScore(10);
          newFood();
        } else {
          snake.pop();
        }
      }

      let previousAction = false;

      loop(dt => {
        timer += dt;

        const action = controls.action;
        if (action && !previousAction) {
          if (controls.left) turn('left');
          else if (controls.right) turn('right');
          else if (controls.up) turn('up');
          else if (controls.down) turn('down');
        }

        previousAction = action;

        if (controls.left) turn('left');
        if (controls.right) turn('right');
        if (controls.up) turn('up');
        if (controls.down) turn('down');

        if (timer >= 0.13) {
          timer = 0;
          tick();
        }

        draw();
      });

      say('Swipe on the touchpad to change direction.');
    }

    function startShooter() {
      const { canvas: c, ctx } = canvas(480, 400);

      const player = { x: 240, y: 345 };
      let bullets = [];
      let enemies = [];
      let particles = [];
      let spawnTimer = 0;
      let fireTimer = 0;
      let elapsed = 0;
      let hull = 3;
      let alive = true;

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, c.width, c.height);

        for (let i = 0; i < 65; i++) {
          const x = (79 * i) % c.width;
          const y = (113 * i + elapsed * 35) % c.height;

          ctx.fillStyle = i % 4 === 0 ? '#35e8ff' : '#546a8c';
          ctx.fillRect(x, y, 2, 2);
        }

        ctx.fillStyle = '#35e8ff';
        ctx.beginPath();
        ctx.moveTo(player.x, player.y - 16);
        ctx.lineTo(player.x - 15, player.y + 12);
        ctx.lineTo(player.x + 15, player.y + 12);
        ctx.closePath();
        ctx.fill();

        bullets.forEach(bullet => {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bullet.x - 2, bullet.y - 8, 4, 12);
        });

        enemies.forEach(enemy => {
          ctx.fillStyle = '#ff6d9a';
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

        drawText(ctx, 'HULL ' + '♥'.repeat(hull), 12, 22, 13);
      }

      function explode(x, y, color) {
        for (let i = 0; i < 8; i++) {
          particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 180,
            vy: (Math.random() - 0.5) * 180,
            life: 0.35 + Math.random() * 0.3,
            color
          });
        }
      }

      function fire() {
        if (!alive || fireTimer > 0) return;

        bullets.push({ x: player.x, y: player.y - 14 });
        fireTimer = 0.18;
      }

      loop(dt => {
        elapsed += dt;
        fireTimer -= dt;
        spawnTimer -= dt;

        if (controls.left) player.x -= 260 * dt;
        if (controls.right) player.x += 260 * dt;

        player.x = Math.max(18, Math.min(c.width - 18, player.x));

        if (controls.fire || controls.action) fire();

        if (spawnTimer <= 0) {
          enemies.push({
            x: 20 + Math.random() * (c.width - 40),
            y: -18,
            speed: 70 + Math.random() * 65 + elapsed * 0.5
          });

          spawnTimer = Math.max(0.3, 0.85 - elapsed * 0.005);
        }

        bullets.forEach(bullet => {
          bullet.y -= 390 * dt;
        });

        enemies.forEach(enemy => {
          enemy.y += enemy.speed * dt;

          if (
            Math.abs(enemy.x - player.x) < 22 &&
            Math.abs(enemy.y - player.y) < 25
          ) {
            enemy.dead = true;
            hull--;
            explode(enemy.x, enemy.y, '#ff6d9a');

            if (hull <= 0) {
              alive = false;
              say('Ship destroyed! Final score: ' + score);
            }
          }

          bullets.forEach(bullet => {
            if (
              !bullet.dead && !enemy.dead &&
              Math.abs(bullet.x - enemy.x) < 16 &&
              Math.abs(bullet.y - enemy.y) < 16
            ) {
              bullet.dead = true;
              enemy.dead = true;
              addScore(10);
              explode(enemy.x, enemy.y, '#35e8ff');
            }
          });

          if (enemy.y > c.height + 15) {
            enemy.dead = true;
            hull--;

            if (hull <= 0) {
              alive = false;
              say('Invaders broke through! Final score: ' + score);
            }
          }
        });

        particles.forEach(particle => {
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.life -= dt;
        });

        bullets = bullets.filter(b => !b.dead && b.y > -15);
        enemies = enemies.filter(e => !e.dead);
        particles = particles.filter(p => p.life > 0);

        draw();
      });

      say('Swipe left or right to move. Tap or hold the touchpad to fire.');
    }

    function startRunner() {
      const { canvas: c, ctx } = canvas(520, 280);

      const ground = 225;
      const player = { x: 70, y: ground - 35, w: 27, h: 35, vy: 0 };
      let obstacles = [];
      let spawn = 0.7;
      let elapsed = 0;
      let distance = 0;
      let alive = true;
      let jumpRequested = false;

      function jump() {
        if (player.y >= ground - player.h - 1) {
          player.vy = -390;
        }
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.strokeStyle = '#152b43';

        for (let i = 0; i < 12; i++) {
          const x = (i * 53 - elapsed * 50) % c.width;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, ground);
          ctx.stroke();
        }

        ctx.strokeStyle = '#35e8ff';
        ctx.beginPath();
        ctx.moveTo(0, ground);
        ctx.lineTo(c.width, ground);
        ctx.stroke();

        ctx.fillStyle = '#43f5a5';
        ctx.fillRect(player.x, player.y, player.w, player.h);

        ctx.fillStyle = '#ff6d9a';
        obstacles.forEach(obstacle => {
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
        });

        drawText(ctx, 'DISTANCE ' + distance, 12, 22, 13);
      }

      loop(dt => {
        if (alive) {
          elapsed += dt;
          spawn -= dt;

          if (jumpRequested) {
            jump();
            jumpRequested = false;
          }

          player.vy += 1000 * dt;
          player.y += player.vy * dt;

          if (player.y >= ground - player.h) {
            player.y = ground - player.h;
            player.vy = 0;
          }

          if (spawn <= 0) {
            const height = 22 + Math.random() * 24;

            obstacles.push({
              x: c.width + 10,
              y: ground - height,
              w: 18 + Math.random() * 12,
              h: height
            });

            spawn = 0.8 + Math.random() * 0.8;
          }

          const speed = Math.min(340, 205 + elapsed * 2.2);

          obstacles.forEach(obstacle => {
            obstacle.x -= speed * dt;
          });

          obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.w > 0);

          distance = Math.floor(elapsed * 10);
          setScore(distance);

          for (const obstacle of obstacles) {
            if (
              player.x + player.w - 4 > obstacle.x &&
              player.x + 4 < obstacle.x + obstacle.w &&
              player.y + player.h - 3 > obstacle.y
            ) {
              alive = false;
              say('Game over! Distance: ' + distance);
              break;
            }
          }
        }

        draw();
      });

      addCleanup(() => { jumpRequested = false; });

      const onTap = () => { jumpRequested = true; };
      pad.addEventListener('pointerdown', onTap);
      addCleanup(() => pad.removeEventListener('pointerdown', onTap));

      say('Tap the touchpad to jump over obstacles.');
    }

    function startPong() {
      const { canvas: c, ctx } = canvas(520, 320);

      let leftY = 125;
      let rightY = 125;
      let leftScore = 0;
      let rightScore = 0;

      const paddleHeight = 70;
      const paddleWidth = 10;

      let ball = {
        x: 260, y: 160,
        vx: 205, vy: 125, r: 7
      };

      function resetBall(direction) {
        ball = {
          x: c.width / 2,
          y: c.height / 2,
          vx: 205 * direction,
          vy: Math.random() * 160 - 80,
          r: 7
        };
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.strokeStyle = '#1d3550';
        ctx.setLineDash([7, 9]);
        ctx.beginPath();
        ctx.moveTo(c.width / 2, 0);
        ctx.lineTo(c.width / 2, c.height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#35e8ff';
        ctx.fillRect(18, leftY, paddleWidth, paddleHeight);

        ctx.fillStyle = '#9b6cff';
        ctx.fillRect(c.width - 28, rightY, paddleWidth, paddleHeight);

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();

        drawText(ctx, String(leftScore), c.width / 2 - 55, 42, 30);
        drawText(ctx, String(rightScore), c.width / 2 + 35, 42, 30);
      }

      loop(dt => {
        if (controls.up) leftY -= 280 * dt;
        if (controls.down) leftY += 280 * dt;

        leftY = Math.max(0, Math.min(c.height - paddleHeight, leftY));

        const target = ball.y - paddleHeight / 2;
        rightY += Math.sign(target - rightY) *
          Math.min(Math.abs(target - rightY), 205 * dt);

        rightY = Math.max(0, Math.min(c.height - paddleHeight, rightY));

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        if (ball.y < ball.r || ball.y > c.height - ball.r) {
          ball.vy *= -1;
        }

        if (
          ball.vx < 0 &&
          ball.x - ball.r < 28 &&
          ball.y > leftY &&
          ball.y < leftY + paddleHeight
        ) {
          ball.vx = Math.abs(ball.vx) * 1.03;
          ball.vy += (ball.y - (leftY + paddleHeight / 2)) * 1.4;
          ball.x = 29;
        }

        if (
          ball.vx > 0 &&
          ball.x + ball.r > c.width - 28 &&
          ball.y > rightY &&
          ball.y < rightY + paddleHeight
        ) {
          ball.vx = -Math.abs(ball.vx) * 1.03;
          ball.vy += (ball.y - (rightY + paddleHeight / 2)) * 1.2;
          ball.x = c.width - 29;
        }

        if (ball.x < -10) {
          rightScore++;
          resetBall(1);
        } else if (ball.x > c.width + 10) {
          leftScore++;
          addScore(1);
          resetBall(-1);
        }

        draw();
      });

      say('Swipe up and down to move your paddle.');
    }

    function startBreakout() {
      const { canvas: c, ctx } = canvas(480, 420);

      const paddle = { x: 200, w: 86, h: 11 };
      let ball = { x: 240, y: 320, vx: 160, vy: -190, r: 7 };
      let bricks = [];
      let alive = true;

      const columns = 8;
      const rows = 5;
      const brickWidth = 50;
      const brickHeight = 17;
      const gap = 5;

      const colors = [
        '#35e8ff', '#9b6cff', '#43f5a5', '#ffbe55', '#ff6d9a'
      ];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          bricks.push({
            x: 22 + col * (brickWidth + gap),
            y: 38 + row * (brickHeight + gap),
            w: brickWidth,
            h: brickHeight,
            alive: true,
            color: colors[row]
          });
        }
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, c.width, c.height);

        bricks.forEach(brick => {
          if (!brick.alive) return;
          ctx.fillStyle = brick.color;
          ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
        });

        ctx.fillStyle = '#35e8ff';
        ctx.fillRect(paddle.x, c.height - 32, paddle.w, paddle.h);

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
      }

      loop(dt => {
        if (controls.left) paddle.x -= 330 * dt;
        if (controls.right) paddle.x += 330 * dt;

        if (pointerHeld) {
          paddle.x = controls.pointerX * c.width - paddle.w / 2;
        }

        paddle.x = Math.max(0, Math.min(c.width - paddle.w, paddle.x));

        if (alive) {
          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;

          if (ball.x < ball.r || ball.x > c.width - ball.r) {
            ball.vx *= -1;
          }

          if (ball.y < ball.r) {
            ball.vy = Math.abs(ball.vy);
          }

          const paddleY = c.height - 32;

          if (
            ball.vy > 0 &&
            ball.y + ball.r >= paddleY &&
            ball.y <= paddleY + paddle.h &&
            ball.x >= paddle.x &&
            ball.x <= paddle.x + paddle.w
          ) {
            ball.vy = -Math.abs(ball.vy);
            ball.vx += (ball.x - (paddle.x + paddle.w / 2)) * 2;
            ball.y = paddleY - ball.r;
          }

          bricks.forEach(brick => {
            if (
              !brick.alive ||
              ball.x + ball.r < brick.x ||
              ball.x - ball.r > brick.x + brick.w ||
              ball.y + ball.r < brick.y ||
              ball.y - ball.r > brick.y + brick.h
            ) return;

            brick.alive = false;
            ball.vy *= -1;
            addScore(10);
          });

          if (bricks.every(brick => !brick.alive)) {
            alive = false;
            say('You cleared every brick! Final score: ' + score);
          } else if (ball.y > c.height + 15) {
            alive = false;
            say('Ball lost! Final score: ' + score);
          }
        }

        draw();
      });

      say('Swipe left or right to move the paddle.');
    }

    function startTicTacToe() {
      area.innerHTML = `
        <div class="nx-result" data-status>Your turn — you are X.</div>
        <div class="nx-board">
          ${Array.from({ length: 9 }, (_, i) =>
            `<button class="nx-cell" data-cell="${i}"></button>`
          ).join('')}
        </div>
      `;

      const board = Array(9).fill('');
      const boardEl = area.querySelector('.nx-board');
      const status = area.querySelector('[data-status]');

      const wins = [
        [0,1,2],[3,4,5],[6,7,8],
        [0,3,6],[1,4,7],[2,5,8],
        [0,4,8],[2,4,6]
      ];

      let finished = false;
      let timer = 0;

      function winner() {
        for (const [a, b, c] of wins) {
          if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
          }
        }

        return board.every(Boolean) ? 'draw' : null;
      }

      function draw() {
        boardEl.querySelectorAll('[data-cell]').forEach(button => {
          const value = board[Number(button.dataset.cell)];
          button.textContent = value;
          button.disabled = finished || Boolean(value);
          button.classList.toggle('nx-o', value === 'O');
        });
      }

      function check() {
        const result = winner();
        if (!result) return false;

        finished = true;
        draw();

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

      function computerMove() {
        if (finished || mySession !== session) return;

        let move = findWinningMove('O');

        if (move < 0) move = findWinningMove('X');
        if (move < 0 && !board[4]) move = 4;

        if (move < 0) {
          const available = [0,2,6,8].filter(i => !board[i]);
          if (available.length) {
            move = available[Math.floor(Math.random() * available.length)];
          }
        }

        if (move < 0) {
          const available = board
            .map((value, index) => value ? -1 : index)
            .filter(index => index >= 0);

          if (available.length) {
            move = available[Math.floor(Math.random() * available.length)];
          }
        }

        if (move >= 0) board[move] = 'O';

        draw();

        if (!check()) {
          status.textContent = 'Your turn — you are X.';
        }
      }

      function clickCell(event) {
        const button = event.target.closest('[data-cell]');
        if (!button || finished) return;

        const index = Number(button.dataset.cell);
        if (board[index]) return;

        board[index] = 'X';
        draw();

        if (check()) return;

        status.textContent = 'Computer is thinking…';
        timer = setTimeout(computerMove, 300);
      }

      boardEl.addEventListener('click', clickCell);

      addCleanup(() => {
        clearTimeout(timer);
        boardEl.removeEventListener('click', clickCell);
      });

      say('Tap a square to place X.');
    }

    function startMath() {
      area.innerHTML = `
        <div class="nx-result" data-info>Answer correctly to earn points.</div>
        <div class="nx-question" data-question></div>
        <div class="nx-answer-grid" data-answers></div>
        <div class="nx-result" data-streak>Correct answers: 0</div>
      `;

      const question = area.querySelector('[data-question]');
      const answers = area.querySelector('[data-answers]');
      const info = area.querySelector('[data-info]');
      const streak = area.querySelector('[data-streak]');

      let correct = 0;
      let streakCount = 0;
      let locked = false;
      let timer = 0;

      function newQuestion() {
        locked = false;
        info.textContent = 'Choose the correct answer.';

        const operation = Math.floor(Math.random() * 4);
        let a = 1 + Math.floor(Math.random() * 20);
        let b = 1 + Math.floor(Math.random() * 20);
        let symbol = '+';

        if (operation === 0) {
          correct = a + b;
        } else if (operation === 1) {
          if (b > a) [a, b] = [b, a];
          correct = a - b;
          symbol = '−';
        } else if (operation === 2) {
          a = 1 + Math.floor(Math.random() * 12);
          b = 1 + Math.floor(Math.random() * 12);
          correct = a * b;
          symbol = '×';
        } else {
          b = 1 + Math.floor(Math.random() * 10);
          correct = 1 + Math.floor(Math.random() * 12);
          a = b * correct;
          symbol = '÷';
        }

        question.textContent = `${a} ${symbol} ${b} = ?`;

        const choices = new Set([correct]);

        while (choices.size < 4) {
          const offset = Math.floor(Math.random() * 13) - 6;
          choices.add(Math.max(0, correct + (offset || 1)));
        }

        answers.innerHTML = [...choices]
          .sort(() => Math.random() - 0.5)
          .map((value, index) =>
            `<button class="nx-answer" data-answer="${value}">
              ${index + 1}. ${value}
            </button>`
          ).join('');
      }

      function choose(value) {
        if (locked) return;

        locked = true;

        if (Number(value) === correct) {
          streakCount++;
          addScore(10);
          info.textContent = 'Correct! +10 points.';
        } else {
          streakCount = 0;
          info.textContent = 'The correct answer was ' + correct + '.';
        }

        streak.textContent = 'Correct answers: ' + streakCount;

        answers.querySelectorAll('button').forEach(button => {
          button.disabled = true;
        });

        timer = setTimeout(newQuestion, 650);
      }

      answers.addEventListener('click', event => {
        const button = event.target.closest('[data-answer]');
        if (button) choose(button.dataset.answer);
      });

      addCleanup(() => clearTimeout(timer));

      const onKey = event => {
        if (!/^[1-4]$/.test(event.key)) return;

        const button = answers.querySelectorAll('[data-answer]')[
          Number(event.key) - 1
        ];

        if (button) choose(button.dataset.answer);
      };

      window.addEventListener('keydown', onKey);
      addCleanup(() => window.removeEventListener('keydown', onKey));

      newQuestion();
      say('Choose an answer on screen or press 1–4.');
    }

    function startRPS() {
      const options = ['rock', 'paper', 'scissors'];
      const icons = { rock: '✊', paper: '✋', scissors: '✌️' };

      area.innerHTML = `
        <div class="nx-result">Choose your move.</div>
        <div class="nx-rps">
          <button class="nx-btn" data-rps="rock">✊ Rock</button>
          <button class="nx-btn" data-rps="paper">✋ Paper</button>
          <button class="nx-btn" data-rps="scissors">✌️ Scissors</button>
        </div>
        <div class="nx-question" data-result>Ready?</div>
        <div class="nx-result" data-tally>Wins: 0 · Draws: 0 · Losses: 0</div>
      `;

      const result = area.querySelector('[data-result]');
      const tally = area.querySelector('[data-tally]');

      let wins = 0;
      let draws = 0;
      let losses = 0;

      function play(choice) {
        const computer = options[Math.floor(Math.random() * 3)];

        if (choice === computer) {
          draws++;
          result.textContent = 'Draw!';
        } else if (
          (choice === 'rock' && computer === 'scissors') ||
          (choice === 'paper' && computer === 'rock') ||
          (choice === 'scissors' && computer === 'paper')
        ) {
          wins++;
          addScore(1);
          result.textContent = 'You win!';
        } else {
          losses++;
          result.textContent = 'Computer wins!';
        }

        result.textContent += ` ${icons[choice]} vs ${icons[computer]}`;

        tally.textContent =
          `Wins: ${wins} · Draws: ${draws} · Losses: ${losses}`;
      }

      const onClick = event => {
        const button = event.target.closest('[data-rps]');
        if (button) play(button.dataset.rps);
      };

      area.addEventListener('click', onClick);

      const onKey = event => {
        const key = event.key.toLowerCase();
        const map = { r: 'rock', p: 'paper', s: 'scissors' };
        if (map[key]) play(map[key]);
      };

      window.addEventListener('keydown', onKey);

      addCleanup(() => {
        area.removeEventListener('click', onClick);
        window.removeEventListener('keydown', onKey);
      });

      say('Tap Rock, Paper, or Scissors.');
    }

    function startHangman() {
      const words = [
        'GALAXY', 'PLANET', 'ROCKET', 'JUNGLE', 'PUZZLE',
        'ARCADE', 'NEXORA', 'GAMING', 'NEBULA', 'PYTHON',
        'COMPUTER', 'RAINBOW', 'DIAMOND', 'OCEAN', 'FUTURE'
      ];

      const word = words[Math.floor(Math.random() * words.length)];
      const guessed = new Set();

      let mistakes = 0;
      let finished = false;

      area.innerHTML = `
        <div class="nx-result" data-status>Guess the hidden word.</div>
        <div class="nx-question" data-drawing>○</div>
        <div class="nx-word" data-word></div>
        <div class="nx-letter-grid">
          ${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter =>
            `<button class="nx-letter" data-letter="${letter}">${letter}</button>`
          ).join('')}
        </div>
      `;

      const wordEl = area.querySelector('[data-word]');
      const drawing = area.querySelector('[data-drawing]');
      const status = area.querySelector('[data-status]');
      const letterGrid = area.querySelector('.nx-letter-grid');

      const stages = ['○', '◔', '◑', '◕', '◉', '☠', '✖'];

      function draw() {
        wordEl.textContent = word
          .split('')
          .map(letter => guessed.has(letter) ? letter : '_')
          .join(' ');

        drawing.textContent = stages[Math.min(mistakes, 6)];

        letterGrid.querySelectorAll('[data-letter]').forEach(button => {
          button.disabled = finished || guessed.has(button.dataset.letter);
        });
      }

      function guess(letter) {
        if (finished || guessed.has(letter)) return;

        guessed.add(letter);

        if (!word.includes(letter)) mistakes++;

        if (word.split('').every(char => guessed.has(char))) {
          finished = true;
          addScore(10);
          status.textContent = `You solved it! The word was ${word}. +10 points.`;
        } else if (mistakes >= 6) {
          finished = true;
          status.textContent = `Game over! The word was ${word}.`;
        } else {
          status.textContent = `Mistakes: ${mistakes}/6`;
        }

        draw();
      }

      const onClick = event => {
        const button = event.target.closest('[data-letter]');
        if (button) guess(button.dataset.letter);
      };

      letterGrid.addEventListener('click', onClick);

      const onKey = event => {
        if (/^[a-z]$/i.test(event.key)) {
          guess(event.key.toUpperCase());
        }
      };

      window.addEventListener('keydown', onKey);

      addCleanup(() => {
        letterGrid.removeEventListener('click', onClick);
        window.removeEventListener('keydown', onKey);
      });

      draw();
      say('Guess letters using your keyboard or the letters on screen.');
    }

    function startFlappy() {
      const { canvas: c, ctx } = canvas(360, 480);

      const bird = { x: 82, y: 210, vy: 0, r: 12 };
      const pipeWidth = 54;
      const gap = 145;

      let pipes = [];
      let gravity = 900;
      let flapVelocity = -300;
      let spawnTimer = 0;
      let alive = true;
      let started = false;
      let flapRequested = false;
      let distance = 0;

      function flap() {
        if (!alive) return;
        started = true;
        bird.vy = flapVelocity;
      }

      function draw() {
        ctx.fillStyle = '#071226';
        ctx.fillRect(0, 0, c.width, c.height);

        for (let i = 0; i < 28; i++) {
          ctx.fillStyle = '#213957';
          ctx.fillRect((37 * i) % c.width, (71 * i) % c.height, 2, 2);
        }

        pipes.forEach(pipe => {
          ctx.fillStyle = '#43f5a5';
          ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
          ctx.fillRect(
            pipe.x,
            pipe.top + gap,
            pipeWidth,
            c.height - pipe.top - gap
          );
        });

        ctx.fillStyle = '#ffdc68';
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#091120';
        ctx.beginPath();
        ctx.arc(bird.x + 4, bird.y - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        drawText(ctx, 'SCORE ' + distance, c.width / 2 - 43, 30, 17);

        if (!started && alive) {
          ctx.textAlign = 'center';
          drawText(ctx, 'TAP TO START', c.width / 2 - 70, c.height / 2 + 65, 17);
          ctx.textAlign = 'left';
        }
      }

      loop(dt => {
        if (flapRequested) {
          flap();
          flapRequested = false;
        }

        if (started && alive) {
          bird.vy += gravity * dt;
          bird.y += bird.vy * dt;

          spawnTimer -= dt;

          if (spawnTimer <= 0) {
            const top = 55 + Math.random() * (c.height - gap - 115);

            pipes.push({
              x: c.width + 5,
              top,
              counted: false
            });

            spawnTimer = 1.35;
          }

          pipes.forEach(pipe => {
            pipe.x -= 145 * dt;

            if (!pipe.counted && pipe.x + pipeWidth < bird.x) {
              pipe.counted = true;
              distance++;
              setScore(distance);
            }

            const overlaps =
              bird.x + bird.r > pipe.x &&
              bird.x - bird.r < pipe.x + pipeWidth;

            const outsideGap =
              bird.y - bird.r < pipe.top ||
              bird.y + bird.r > pipe.top + gap;

            if (overlaps && outsideGap) {
              alive = false;
              say('Flight ended! Score: ' + distance);
            }
          });

          pipes = pipes.filter(pipe => pipe.x + pipeWidth > -5);

          if (bird.y - bird.r < 0 || bird.y + bird.r > c.height) {
            alive = false;
            say('Flight ended! Score: ' + distance);
          }
        }

        draw();
      });

      const onTap = () => { flapRequested = true; };

      pad.addEventListener('pointerdown', onTap);
      c.addEventListener('pointerdown', onTap);

      addCleanup(() => {
        pad.removeEventListener('pointerdown', onTap);
        c.removeEventListener('pointerdown', onTap);
      });

      say('Tap the touchpad or game screen to flap.');
    }

    function startSimpleFallback(name) {
      area.innerHTML = `
        <div class="nx-question">${escapeHTML(name)}</div>
        <div class="nx-result">This game is being initialized.</div>
      `;
      say('Select Restart to play again.');
    }

    try {
      switch (id) {
        case 'snake': startSnake(); break;
        case 'ttt': startTicTacToe(); break;
        case 'pong': startPong(); break;
        case 'breakout': startBreakout(); break;
        case 'runner': startRunner(); break;
        case 'shooter': startShooter(); break;
        case 'math': startMath(); break;
        case 'rps': startRPS(); break;
        case 'hangman': startHangman(); break;
        case 'flappy': startFlappy(); break;
        default: startSimpleFallback(game.name);
      }
    } catch (error) {
      console.error('Nexora game error:', error);
      area.innerHTML = `
        <div class="nx-result">
          The game could not start. Check the browser console for details.
        </div>
      `;
      say('Game initialization failed.');
    }
  }

  injectStyles();
  renderHome();
})();