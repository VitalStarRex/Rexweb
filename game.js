(() => {
  'use strict';

  const ROOT_ID = 'nexora-games';
  const SCORE_KEY = 'rexweb_nexora_arcade_scores_v2';
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
  let generation = 0;
  let cleanup = () => {};
  let scores = loadScores();

  function loadScores() {
    try {
      return JSON.parse(localStorage.getItem(SCORE_KEY) || '{}') || {};
    } catch {
      return {};
    }
  }

  function saveScores() {
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
    } catch {}
  }

  function best(id) {
    return Number(scores[id]) || 0;
  }

  function setBest(id, score) {
    if (score > best(id)) {
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

  function installStyles() {
    if ($('#nexora-arcade-styles', document)) return;

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
        color:var(--text);
        background:var(--bg);
        font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        min-height:100%;
        padding:16px;
        box-sizing:border-box;
        overflow:hidden;
      }

      #nexora-games * { box-sizing:border-box; }
      #nexora-games button { font:inherit; -webkit-tap-highlight-color:transparent; }
      #nexora-games button:focus-visible {
        outline:2px solid var(--cyan);
        outline-offset:3px;
      }

      #nexora-games .nx-shell { width:min(100%,1000px); margin:auto; }
      #nexora-games .nx-header {
        display:flex; align-items:center; justify-content:space-between;
        flex-wrap:wrap; gap:12px; margin-bottom:18px;
      }
      #nexora-games .nx-brand { display:flex; align-items:center; gap:11px; }
      #nexora-games .nx-logo {
        width:46px; height:46px; display:grid; place-items:center;
        border:1px solid #27637c; border-radius:14px;
        color:var(--cyan); font-size:24px; font-weight:900;
        background:linear-gradient(135deg,#102b42,#161332);
        box-shadow:0 0 22px #35e8ff19;
      }
      #nexora-games .nx-brand h1 {
        font-size:clamp(17px,4vw,24px); line-height:1.15;
        margin:0; letter-spacing:.6px;
      }
      #nexora-games .nx-brand p {
        margin:5px 0 0; color:var(--muted); font-size:12px;
      }

      #nexora-games .nx-btn {
        border:1px solid var(--line); color:var(--text);
        background:var(--panel2); border-radius:11px;
        padding:10px 14px; min-height:42px; cursor:pointer;
      }
      #nexora-games .nx-btn:active { transform:scale(.97); }
      #nexora-games .nx-btn-primary {
        color:#001019; font-weight:800;
        background:var(--cyan); border-color:var(--cyan);
      }
      #nexora-games .nx-section-title { font-size:17px; margin:20px 0 12px; }
      #nexora-games .nx-game-grid {
        display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px;
      }
      #nexora-games .nx-game-card {
        text-align:left; padding:16px; min-width:0;
        border:1px solid var(--line); border-radius:16px;
        background:linear-gradient(145deg,var(--panel),#080f1e);
        color:var(--text); cursor:pointer;
      }
      #nexora-games .nx-game-card:hover { border-color:#2684a5; }
      #nexora-games .nx-card-icon { display:block; font-size:29px; margin-bottom:11px; }
      #nexora-games .nx-card-title { display:block; font-size:15px; font-weight:800; }
      #nexora-games .nx-card-description {
        display:block; margin-top:6px; color:var(--muted);
        font-size:12px; line-height:1.5;
      }
      #nexora-games .nx-card-best {
        display:block; margin-top:12px; color:var(--cyan); font-size:11px;
      }

      #nexora-games .nx-panel {
        border:1px solid var(--line); background:var(--panel);
        border-radius:18px; overflow:hidden;
      }
      #nexora-games .nx-game-top {
        padding:16px; border-bottom:1px solid var(--line);
        display:flex; justify-content:space-between; align-items:center;
        flex-wrap:wrap; gap:12px;
      }
      #nexora-games .nx-game-heading { display:flex; align-items:center; gap:10px; }
      #nexora-games .nx-game-heading h2 { font-size:19px; margin:0; }
      #nexora-games .nx-game-heading p {
        font-size:12px; color:var(--muted); margin:4px 0 0;
      }
      #nexora-games .nx-stats { display:flex; gap:8px; flex-wrap:wrap; }
      #nexora-games .nx-stat {
        padding:7px 10px; border:1px solid var(--line);
        border-radius:10px; background:#060d19;
        font-size:12px; white-space:nowrap;
      }
      #nexora-games .nx-stat strong { color:var(--cyan); }
      #nexora-games .nx-game-area {
        padding:12px; min-height:220px; position:relative;
      }
      #nexora-games .nx-canvas-wrap { width:100%; position:relative; margin:auto; }
      #nexora-games canvas {
        display:block; width:100%; height:auto; border-radius:12px;
        background:#030914; touch-action:none;
      }
      #nexora-games .nx-message {
        text-align:center; min-height:24px; padding:5px 12px 12px;
        color:var(--cyan); font-size:13px;
      }
      #nexora-games .nx-controls {
        display:flex; justify-content:center; flex-wrap:wrap;
        gap:9px; padding:0 12px 16px;
      }

      /* Laptop-style touchpad */
      #nexora-games .nx-gamepad {
        border-top:1px solid var(--line); padding:16px 14px 18px;
        display:flex; flex-direction:column; align-items:center; gap:10px;
        background:linear-gradient(180deg,#091120,#060c18);
        user-select:none; -webkit-user-select:none;
      }
      #nexora-games .nx-pad-label {
        color:var(--muted); font-size:10px; letter-spacing:2px;
        font-weight:800; text-align:center;
      }
      #nexora-games .nx-touchpad {
        width:min(100%,360px); height:112px; position:relative;
        border:2px solid #31506a; border-radius:15px;
        background:linear-gradient(145deg,#14253b,#091321);
        box-shadow:inset 0 2px 9px #0008,0 5px 0 #030812,0 0 18px #35e8ff0a;
        touch-action:none; overflow:hidden; cursor:default;
      }
      #nexora-games .nx-touchpad:before {
        content:""; position:absolute; inset:7px;
        border:1px solid #ffffff0a; border-radius:10px; pointer-events:none;
      }
      #nexora-games .nx-pad-surface {
        position:absolute; inset:0; display:grid; place-items:center;
        color:#7c98b6; font-size:11px; letter-spacing:1px;
        pointer-events:none;
      }
      #nexora-games .nx-pad-surface span {
        padding:7px 10px; border-radius:8px;
        background:#07101d99; text-align:center;
      }
      #nexora-games .nx-pad-indicator {
        position:absolute; width:35px; height:35px; border-radius:50%;
        border:1px solid #35e8ff88; background:#35e8ff18;
        transform:translate(-50%,-50%); pointer-events:none; display:none;
      }
      #nexora-games .nx-pad-indicator.active { display:block; }
      #nexora-games .nx-pad-actions {
        display:flex; flex-wrap:wrap; justify-content:center; gap:9px;
      }
      #nexora-games .nx-pad-action {
        min-width:90px; min-height:40px; padding:9px 15px;
        border-radius:10px; border:1px solid #2b526c;
        color:var(--cyan); background:#10243a; font-weight:800;
        cursor:pointer; touch-action:manipulation;
      }
      #nexora-games .nx-pad-action.primary {
        color:#00120e; background:var(--green); border-color:var(--green);
      }
      #nexora-games .nx-pad-info {
        color:var(--muted); text-align:center; font-size:12px;
        max-width:340px; line-height:1.5;
      }

      #nexora-games .nx-board {
        display:grid; gap:8px; max-width:360px; margin:12px auto;
      }
      #nexora-games .nx-ttt-board {
        grid-template-columns:repeat(3,minmax(0,1fr)); width:min(100%,330px);
      }
      #nexora-games .nx-cell {
        aspect-ratio:1; border:1px solid #2a415e; border-radius:13px;
        background:#0c192a; color:var(--cyan);
        font-size:clamp(28px,8vw,48px); font-weight:900; cursor:pointer;
      }
      #nexora-games .nx-cell:disabled { cursor:default; opacity:.95; }
      #nexora-games .nx-cell.nx-o { color:var(--purple); }

      #nexora-games .nx-answer-grid {
        display:grid; grid-template-columns:repeat(2,minmax(0,1fr));
        gap:10px; max-width:480px; margin:16px auto;
      }
      #nexora-games .nx-answer {
        padding:15px 10px; border:1px solid var(--line);
        border-radius:12px; color:var(--text); background:#0c192a;
        font-weight:800; cursor:pointer;
      }
      #nexora-games .nx-word {
        text-align:center; font-size:clamp(22px,6vw,34px);
        letter-spacing:7px; margin:18px 0; font-weight:900;
        overflow-wrap:anywhere;
      }
      #nexora-games .nx-letter-grid {
        display:grid; grid-template-columns:repeat(7,minmax(0,1fr));
        gap:6px; max-width:460px; margin:15px auto;
      }
      #nexora-games .nx-letter {
        min-height:39px; border:1px solid var(--line); border-radius:8px;
        background:#0d192b; color:var(--text); cursor:pointer; font-weight:800;
      }
      #nexora-games .nx-letter:disabled { opacity:.3; cursor:default; }
      #nexora-games .nx-question {
        font-size:clamp(28px,8vw,43px); font-weight:900;
        text-align:center; margin:20px 0; color:var(--cyan);
      }
      #nexora-games .nx-result {
        font-size:14px; color:var(--muted); text-align:center; min-height:24px;
      }
      #nexora-games .nx-rps-buttons {
        display:flex; justify-content:center; flex-wrap:wrap;
        gap:10px; margin:18px auto;
      }
      #nexora-games .nx-rps-buttons .nx-btn { min-width:92px; }
      #nexora-games .nx-footer {
        text-align:center; color:#60758f; font-size:11px; padding:18px 0 4px;
      }
      #nexora-games .nx-hidden { display:none !important; }

      @media(min-width:650px) {
        #nexora-games { padding:24px; }
        #nexora-games .nx-game-grid { grid-template-columns:repeat(3,minmax(0,1fr)); }
        #nexora-games .nx-game-area { padding:20px; }
        #nexora-games .nx-touchpad { height:125px; }
      }
      @media(max-width:380px) {
        #nexora-games { padding:10px; }
        #nexora-games .nx-game-grid { gap:8px; }
        #nexora-games .nx-game-card { padding:12px; }
        #nexora-games .nx-letter-grid { grid-template-columns:repeat(6,minmax(0,1fr)); }
        #nexora-games .nx-touchpad { height:100px; }
      }
      @media(prefers-reduced-motion:reduce) {
        #nexora-games * { transition:none !important; }
      }
    `;

    document.head.appendChild(style);
  }

  function stopGame() {
    generation++;
    try {
      cleanup();
    } catch (error) {
      console.warn('Nexora cleanup:', error);
    }
    cleanup = () => {};
    currentGame = null;
  }

  function showHome() {
    stopGame();

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
              <span class="nx-card-best">BEST SCORE: ${best(game.id)}</span>
            </button>
          `).join('')}
        </div>
        <footer class="nx-footer">REXWEB NEXORA · YOUR DIGITAL WORLD, WITHOUT LIMITS</footer>
      </div>
    `;

    $$('[data-open]').forEach(button => {
      button.addEventListener('click', () => openGame(button.dataset.open));
    });

    $('[data-action="refresh"]').addEventListener('click', showHome);
  }

  function openGame(id) {
    const game = games.find(item => item.id === id);
    if (!game) return;

    stopGame();
    currentGame = id;
    const myGeneration = generation;
    let score = 0;

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
              <div class="nx-stat">BEST: <strong data-best>${best(id)}</strong></div>
            </div>
          </div>

          <div class="nx-game-area" data-game-area></div>
          <div class="nx-message" data-message aria-live="polite"></div>

          <div class="nx-gamepad">
            <div class="nx-pad-label">NEXORA TOUCHPAD</div>
            <div class="nx-touchpad" data-touchpad role="application"
                 aria-label="Laptop-style touchpad. Swipe to move and tap to perform the game action.">
              <div class="nx-pad-surface"><span data-pad-hint>SWIPE TO MOVE · TAP TO ACT</span></div>
              <div class="nx-pad-indicator" data-pad-indicator></div>
            </div>
            <div class="nx-pad-actions" data-pad-actions></div>
            <div class="nx-pad-info" data-pad-info>
              Swipe to move. Tap the touchpad to perform an action.
            </div>
          </div>

          <div class="nx-controls">
            <button class="nx-btn nx-btn-primary" data-action="restart">↻ Restart</button>
            <button class="nx-btn" data-action="all-games">▦ All Games</button>
          </div>
        </section>
        <footer class="nx-footer">Touchpad, touchscreen, or keyboard controls supported.</footer>
      </div>
    `;

    const area = $('[data-game-area]');
    const scoreElement = $('[data-score]');
    const bestElement = $('[data-best]');
    const messageElement = $('[data-message]');
    const touchpad = $('[data-touchpad]');
    const indicator = $('[data-pad-indicator]');
    const hint = $('[data-pad-hint]');
    const actions = $('[data-pad-actions]');
    const padInfo = $('[data-pad-info]');

    $('[data-action="all-games"]').addEventListener('click', showHome);
    $('[data-action="restart"]').addEventListener('click', () => {
      if (currentGame === id && generation === myGeneration) openGame(id);
    });

    function say(message) {
      if (messageElement && messageElement.isConnected) {
        messageElement.textContent = message || '';
      }
    }

    function addScore(points) {
      score = Math.max(0, score + (Number(points) || 0));
      scoreElement.textContent = score;
      setBest(id, score);
      bestElement.textContent = best(id);
    }

    function canvas(width, height) {
      const wrap = document.createElement('div');
      wrap.className = 'nx-canvas-wrap';
      wrap.style.maxWidth = `${width}px`;

      const element = document.createElement('canvas');
      element.width = width;
      element.height = height;
      element.setAttribute('aria-label', `${game.name} game screen`);

      wrap.appendChild(element);
      area.appendChild(wrap);

      const context = element.getContext('2d');
      if (!context) throw new Error('Canvas is not supported.');

      return { canvas: element, ctx: context };
    }

    const disposers = [];
    let animationFrame = 0;
    let loopStopped = false;
    let keyHandler = null;
    let lastFrame = 0;

    function onKeys(callback) {
      keyHandler = event => {
        if (generation !== myGeneration) return;

        const key = event.key.toLowerCase();

        if (
          ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key) &&
          !/^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)
        ) {
          event.preventDefault();
        }

        callback(key, true, event);
      };

      const keyUp = event => {
        callback(event.key.toLowerCase(), false, event);
      };

      window.addEventListener('keydown', keyHandler);
      window.addEventListener('keyup', keyUp);

      disposers.push(() => {
        window.removeEventListener('keydown', keyHandler);
        window.removeEventListener('keyup', keyUp);
      });
    }

    function loop(update, draw) {
      loopStopped = false;
      lastFrame = 0;

      function frame(timestamp) {
        if (loopStopped || generation !== myGeneration) return;

        const dt = lastFrame
          ? Math.min((timestamp - lastFrame) / 1000, 0.035)
          : 0;

        lastFrame = timestamp;

        try {
          update(dt);
          draw();
        } catch (error) {
          console.error('Nexora game loop:', error);
          say('A game error occurred. Tap Restart to try again.');
          loopStopped = true;
          return;
        }

        if (!loopStopped && generation === myGeneration) {
          animationFrame = requestAnimationFrame(frame);
        }
      }

      animationFrame = requestAnimationFrame(frame);
    }

    function stopLoop() {
      loopStopped = true;
      cancelAnimationFrame(animationFrame);
    }

    function addButton(label, callback, primary = false) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `nx-pad-action${primary ? ' primary' : ''}`;
      button.textContent = label;
      button.addEventListener('click', callback);
      actions.appendChild(button);

      disposers.push(() => button.removeEventListener('click', callback));
      return button;
    }

    /*
      Laptop-style touchpad:
      - Horizontal and vertical finger movement generate movement input.
      - A tap generates an action.
      - No visible mouse cursor is created.
      - Keyboard input remains supported.
    */
    let padStart = null;
    let padLast = null;
    let padMoved = false;
    let padPointer = null;
    let padAction = () => {};
    let padMove = () => {};
    let padRelease = () => {};
    let padEnabled = true;

    function configurePad(options = {}) {
      padAction = options.action || (() => {});
      padMove = options.move || (() => {});
      padRelease = options.release || (() => {});
      padEnabled = true;

      hint.textContent = options.hint || 'SWIPE TO MOVE · TAP TO ACT';
      padInfo.textContent = options.info || 'Swipe to move. Tap to perform an action.';

      actions.innerHTML = '';
      (options.buttons || []).forEach(item => {
        addButton(item.label, item.action, !!item.primary);
      });

      const down = event => {
        if (!padEnabled || padPointer !== null) return;
        if (event.cancelable) event.preventDefault();

        padPointer = event.pointerId;
        padStart = { x: event.clientX, y: event.clientY };
        padLast = { x: event.clientX, y: event.clientY };
        padMoved = false;

        const rect = touchpad.getBoundingClientRect();
        indicator.style.left = `${event.clientX - rect.left}px`;
        indicator.style.top = `${event.clientY - rect.top}px`;
        indicator.classList.add('active');

        try {
          touchpad.setPointerCapture(event.pointerId);
        } catch {}
      };

      const move = event => {
        if (!padEnabled || padPointer !== event.pointerId || !padStart) return;
        if (event.cancelable) event.preventDefault();

        const dx = event.clientX - padLast.x;
        const dy = event.clientY - padLast.y;
        const totalX = event.clientX - padStart.x;
        const totalY = event.clientY - padStart.y;

        if (Math.hypot(totalX, totalY) > 9) padMoved = true;

        const rect = touchpad.getBoundingClientRect();
        indicator.style.left = `${event.clientX - rect.left}px`;
        indicator.style.top = `${event.clientY - rect.top}px`;

        if (padMoved) {
          padMove({
            dx,
            dy,
            totalX,
            totalY,
            x: event.clientX,
            y: event.clientY
          });
        }

        padLast = { x: event.clientX, y: event.clientY };
      };

      const up = event => {
        if (padPointer !== event.pointerId) return;

        const moved = padMoved;
        padPointer = null;
        padStart = null;
        padLast = null;
        indicator.classList.remove('active');

        if (moved) padRelease();
        else padAction();
      };

      const cancel = event => {
        if (padPointer !== event.pointerId) return;
        padPointer = null;
        padStart = null;
        padLast = null;
        indicator.classList.remove('active');
        padRelease();
      };

      touchpad.addEventListener('pointerdown', down);
      touchpad.addEventListener('pointermove', move);
      touchpad.addEventListener('pointerup', up);
      touchpad.addEventListener('pointercancel', cancel);

      disposers.push(() => {
        touchpad.removeEventListener('pointerdown', down);
        touchpad.removeEventListener('pointermove', move);
        touchpad.removeEventListener('pointerup', up);
        touchpad.removeEventListener('pointercancel', cancel);
      });
    }

    function clearPad() {
      padEnabled = false;
      padPointer = null;
      padStart = null;
      padLast = null;
      indicator.classList.remove('active');
    }

    function addCleanup(fn) {
      if (typeof fn === 'function') disposers.push(fn);
    }

    function finish() {
      if (generation !== myGeneration) return;
      stopLoop();
      clearPad();
    }

    function makeGame() {
      switch (id) {
        case 'snake': return snakeGame();
        case 'ttt': return ticTacToe();
        case 'pong': return pongGame();
        case 'breakout': return breakoutGame();
        case 'runner': return runnerGame();
        case 'shooter': return shooterGame();
        case 'math': return mathGame();
        case 'rps': return rpsGame();
        case 'hangman': return hangmanGame();
        case 'flappy': return flappyGame();
        default: say('This game is not available.'); return () => {};
      }
    }

    function snakeGame() {
      const { canvas: c, ctx } = canvas(360, 360);
      const size = 18;
      const cells = 20;

      let body = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
      let direction = { x: 1, y: 0 };
      let nextDirection = { ...direction };
      let food = { x: 14, y: 10 };
      let alive = true;
      let accumulator = 0;

      function placeFood() {
        for (let i = 0; i < 500; i++) {
          const candidate = {
            x: Math.floor(Math.random() * cells),
            y: Math.floor(Math.random() * cells)
          };

          if (!body.some(part => part.x === candidate.x && part.y === candidate.y)) {
            food = candidate;
            return;
          }
        }
      }

      function turn(name) {
        const directions = {
          up: { x: 0, y: -1 },
          down: { x: 0, y: 1 },
          left: { x: -1, y: 0 },
          right: { x: 1, y: 0 }
        };

        const candidate = directions[name];
        if (!candidate) return;

        if (
          candidate.x !== -direction.x ||
          candidate.y !== -direction.y
        ) {
          nextDirection = candidate;
        }
      }

      function update(dt) {
        if (!alive) return;
        accumulator += dt;

        while (accumulator >= 0.12) {
          accumulator -= 0.12;
          direction = nextDirection;

          const head = {
            x: body[0].x + direction.x,
            y: body[0].y + direction.y
          };

          const eating = head.x === food.x && head.y === food.y;
          const collisionBody = eating ? body : body.slice(0, -1);

          if (
            head.x < 0 || head.y < 0 ||
            head.x >= cells || head.y >= cells ||
            collisionBody.some(part => part.x === head.x && part.y === head.y)
          ) {
            alive = false;
            say(`Game over! Score: ${score}. Tap Restart to play again.`);
            break;
          }

          body.unshift(head);

          if (eating) {
            addScore(10);
            placeFood();
          } else {
            body.pop();
          }
        }
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.strokeStyle = '#102035';
        ctx.lineWidth = 1;

        for (let i = 0; i <= cells; i++) {
          ctx.beginPath();
          ctx.moveTo(i * size, 0);
          ctx.lineTo(i * size, c.height);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(0, i * size);
          ctx.lineTo(c.width, i * size);
          ctx.stroke();
        }

        ctx.fillStyle = '#ff5e89';
        ctx.beginPath();
        ctx.arc(food.x * size + size / 2, food.y * size + size / 2, size * .34, 0, Math.PI * 2);
        ctx.fill();

        body.forEach((part, index) => {
          ctx.fillStyle = index === 0 ? '#66ffd0' : '#1bc995';
          ctx.fillRect(part.x * size + 2, part.y * size + 2, size - 4, size - 4);
        });
      }

      configurePad({
        hint: 'SWIPE IN A DIRECTION',
        info: 'Swipe up, down, left, or right to steer the snake.',
        move: ({ dx, dy, totalX, totalY }) => {
          if (Math.abs(totalX) > Math.abs(totalY)) turn(totalX > 0 ? 'right' : 'left');
          else turn(totalY > 0 ? 'down' : 'up');
        },
        buttons: [
          { label: '↑', action: () => turn('up') },
          { label: '←', action: () => turn('left') },
          { label: '↓', action: () => turn('down') },
          { label: '→', action: () => turn('right') }
        ]
      });

      onKeys((key, down) => {
        if (!down) return;
        if (key === 'arrowup' || key === 'w') turn('up');
        if (key === 'arrowdown' || key === 's') turn('down');
        if (key === 'arrowleft' || key === 'a') turn('left');
        if (key === 'arrowright' || key === 'd') turn('right');
      });

      loop(update, draw);
      return finish;
    }

    function ticTacToe() {
      configurePad({
        hint: 'TAP THE GAME BOARD',
        info: 'Tap an empty square to place X. The computer plays O.'
      });

      area.innerHTML = `
        <div class="nx-result" data-ttt-status>Your turn — you are X.</div>
        <div class="nx-board nx-ttt-board" data-ttt-board>
          ${Array.from({ length: 9 }, (_, i) =>
            `<button class="nx-cell" data-cell="${i}" aria-label="Square ${i + 1}"></button>`
          ).join('')}
        </div>
      `;

      const board = $('[data-ttt-board]', area);
      const status = $('[data-ttt-status]', area);
      const cells = Array(9).fill('');
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];

      let finished = false;
      let computerTimer = 0;

      function winner() {
        for (const [a, b, c] of lines) {
          if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
            return cells[a];
          }
        }

        return cells.every(Boolean) ? 'draw' : null;
      }

      function render() {
        $$('[data-cell]', board).forEach(button => {
          const value = cells[Number(button.dataset.cell)];
          button.textContent = value;
          button.disabled = finished || Boolean(value);
          button.classList.toggle('nx-o', value === 'O');
        });
      }

      function checkEnd() {
        const result = winner();
        if (!result) return false;

        finished = true;
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

      function findWinningMove(mark) {
        for (let i = 0; i < 9; i++) {
          if (cells[i]) continue;
          cells[i] = mark;
          const won = winner() === mark;
          cells[i] = '';
          if (won) return i;
        }
        return -1;
      }

      function computerMove() {
        if (finished || generation !== myGeneration) return;

        let choice = findWinningMove('O');
        if (choice < 0) choice = findWinningMove('X');
        if (choice < 0 && !cells[4]) choice = 4;

        if (choice < 0) {
          const corners = [0, 2, 6, 8].filter(i => !cells[i]);
          if (corners.length) choice = corners[Math.floor(Math.random() * corners.length)];
        }

        if (choice < 0) {
          const empty = cells.map((value, i) => value ? -1 : i).filter(i => i >= 0);
          if (empty.length) choice = empty[Math.floor(Math.random() * empty.length)];
        }

        if (choice >= 0) cells[choice] = 'O';

        render();
        if (!checkEnd()) status.textContent = 'Your turn — you are X.';
      }

      function clickCell(event) {
        const button = event.target.closest('[data-cell]');
        if (!button || finished) return;

        const index = Number(button.dataset.cell);
        if (cells[index]) return;

        cells[index] = 'X';
        render();
        if (checkEnd()) return;

        status.textContent = 'Computer is thinking…';
        computerTimer = setTimeout(computerMove, 300);
      }

      board.addEventListener('click', clickCell);
      render();

      return () => {
        clearTimeout(computerTimer);
        board.removeEventListener('click', clickCell);
        finish();
      };
    }

    function pongGame() {
      const { canvas: c, ctx } = canvas(520, 320);

      let leftY = 125;
      let rightY = 125;
      let ball = { x: 260, y: 160, vx: 205, vy: 110 };
      let playerScore = 0;
      let computerScore = 0;
      let up = false;
      let down = false;
      let running = true;

      function resetBall(direction) {
        ball = {
          x: c.width / 2,
          y: c.height / 2,
          vx: 205 * direction,
          vy: (Math.random() - .5) * 180
        };
      }

      function update(dt) {
        if (!running) return;

        if (up) leftY -= 280 * dt;
        if (down) leftY += 280 * dt;
        leftY = Math.max(0, Math.min(c.height - 70, leftY));

        const target = ball.y - 35;
        rightY += Math.sign(target - rightY) * Math.min(Math.abs(target - rightY), 190 * dt);
        rightY = Math.max(0, Math.min(c.height - 70, rightY));

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        if (ball.y < 7 || ball.y > c.height - 7) ball.vy *= -1;

        if (ball.vx < 0 && ball.x < 28 && ball.y > leftY && ball.y < leftY + 70) {
          ball.vx = Math.abs(ball.vx) * 1.04;
          ball.vy += ((ball.y - (leftY + 35)) / 35) * 65;
          ball.x = 29;
        }

        if (ball.vx > 0 && ball.x > c.width - 28 && ball.y > rightY && ball.y < rightY + 70) {
          ball.vx = -Math.abs(ball.vx) * 1.03;
          ball.vy += ((ball.y - (rightY + 35)) / 35) * 55;
          ball.x = c.width - 29;
        }

        if (ball.x < -10) {
          computerScore++;
          resetBall(1);
        } else if (ball.x > c.width + 10) {
          playerScore++;
          addScore(1);
          resetBall(-1);
        }
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
        ctx.fillRect(18, leftY, 10, 70);

        ctx.fillStyle = '#9b6cff';
        ctx.fillRect(c.width - 28, rightY, 10, 70);

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, 7, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = 'bold 30px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#d9e8ff';
        ctx.fillText(playerScore, c.width / 2 - 55, 42);
        ctx.fillText(computerScore, c.width / 2 + 55, 42);
      }

      configurePad({
        hint: 'SWIPE UP OR DOWN',
        info: 'Move your finger vertically to control your paddle.',
        move: ({ dy }) => {
          leftY += dy * 1.8;
          leftY = Math.max(0, Math.min(c.height - 70, leftY));
        },
        buttons: [
          { label: '↑ UP', action: () => { leftY -= 28; } },
          { label: '↓ DOWN', action: () => { leftY += 28; } }
        ]
      });

      onKeys((key, pressed) => {
        if (key === 'arrowup' || key === 'w') up = pressed;
        if (key === 'arrowdown' || key === 's') down = pressed;
      });

      loop(update, draw);
      return () => {
        running = false;
        up = down = false;
        finish();
      };
    }

    function breakoutGame() {
      const { canvas: c, ctx } = canvas(480, 420);

      const columns = 8;
      const rows = 5;
      const brickW = 50;
      const brickH = 17;
      const gap = 5;
      const startX = 22;
      const startY = 38;
      const paddleW = 86;
      const paddleH = 11;

      let paddleX = (c.width - paddleW) / 2;
      let left = false;
      let right = false;
      let alive = true;
      let ball = { x: 240, y: 320, vx: 160, vy: -190, r: 7 };

      const bricks = [];

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          bricks.push({
            x: startX + col * (brickW + gap),
            y: startY + row * (brickH + gap),
            w: brickW,
            h: brickH,
            alive: true,
            color: ['#35e8ff', '#9b6cff', '#43f5a5', '#ffbe55', '#ff6d9a'][row]
          });
        }
      }

      function update(dt) {
        if (!alive) return;

        if (left) paddleX -= 330 * dt;
        if (right) paddleX += 330 * dt;
        paddleX = Math.max(0, Math.min(c.width - paddleW, paddleX));

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        if (ball.x < ball.r || ball.x > c.width - ball.r) ball.vx *= -1;
        if (ball.y < ball.r) ball.vy = Math.abs(ball.vy);

        const paddleY = c.height - 32;

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

        for (const brick of bricks) {
          if (!brick.alive) continue;

          if (
            ball.x + ball.r > brick.x &&
            ball.x - ball.r < brick.x + brick.w &&
            ball.y + ball.r > brick.y &&
            ball.y - ball.r < brick.y + brick.h
          ) {
            brick.alive = false;
            ball.vy *= -1;
            addScore(10);
            break;
          }
        }

        if (bricks.every(brick => !brick.alive)) {
          alive = false;
          say('You cleared every brick! Restart to play again.');
        } else if (ball.y > c.height + 15) {
          alive = false;
          say(`Ball lost! Score: ${score}. Tap Restart to try again.`);
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
        ctx.fillRect(paddleX, c.height - 32, paddleW, paddleH);

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
      }

      configurePad({
        hint: 'SWIPE LEFT OR RIGHT',
        info: 'Move your finger horizontally to move the paddle.',
        move: ({ dx }) => {
          paddleX += dx * 1.7;
          paddleX = Math.max(0, Math.min(c.width - paddleW, paddleX));
        },
        buttons: [
          { label: '← LEFT', action: () => { paddleX -= 25; } },
          { label: 'RIGHT →', action: () => { paddleX += 25; } }
        ]
      });

      onKeys((key, pressed) => {
        if (key === 'arrowleft' || key === 'a') left = pressed;
        if (key === 'arrowright' || key === 'd') right = pressed;
      });

      loop(update, draw);
      return () => {
        alive = false;
        left = right = false;
        finish();
      };
    }

    function runnerGame() {
      const { canvas: c, ctx } = canvas(520, 280);
      const ground = 225;
      const player = { x: 70, y: ground - 35, w: 27, h: 35, vy: 0, jumping: false };

      let obstacles = [];
      let alive = true;
      let elapsed = 0;
      let spawnTimer = 0;
      let distance = 0;
      let speed = 205;
      let jumpQueued = false;

      function jump() {
        if (!alive) return;
        if (!player.jumping) {
          player.vy = -390;
          player.jumping = true;
        }
      }

      function update(dt) {
        if (!alive) return;

        elapsed += dt;
        distance += speed * dt / 10;
        speed = Math.min(340, 205 + elapsed * 2.2);

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
          const height = 22 + Math.random() * 24;
          obstacles.push({
            x: c.width + 10,
            y: ground - height,
            w: 18 + Math.random() * 12,
            h: height
          });
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
            say(`Game over! Distance: ${Math.floor(distance)}. Tap Restart to try again.`);
            break;
          }
        }

        if (alive) {
          const newScore = Math.floor(distance);
          if (newScore > score) addScore(newScore - score);
        }
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, c.width, c.height);

        ctx.strokeStyle = '#152b43';

        for (let i = 0; i < 12; i++) {
          const x = (i * 53 - elapsed * speed * .4) % c.width;
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

        ctx.fillStyle = '#d9e8ff';
        ctx.font = '13px system-ui';
        ctx.fillText(`DISTANCE ${Math.floor(distance)}`, 12, 22);
      }

      configurePad({
        hint: 'TAP OR SWIPE UP TO JUMP',
        info: 'Tap the touchpad or press the action button to jump.',
        action: () => { jumpQueued = true; },
        move: ({ totalY }) => {
          if (totalY < -30) jumpQueued = true;
        },
        buttons: [
          { label: 'JUMP', primary: true, action: () => { jumpQueued = true; } }
        ]
      });

      onKeys((key, pressed) => {
        if (pressed && (key === ' ' || key === 'arrowup' || key === 'w')) {
          jumpQueued = true;
        }
      });

      loop(update, draw);
      return () => {
        alive = false;
        finish();
      };
    }

    function shooterGame() {
      const { canvas: c, ctx } = canvas(480, 400);
      const ship = { x: 240, y: 345 };

      let enemies = [];
      let bullets = [];
      let particles = [];
      let left = false;
      let right = false;
      let firing = false;
      let fireCooldown = 0;
      let spawnTimer = 0;
      let elapsed = 0;
      let lives = 3;
      let alive = true;

      function fire() {
        if (!alive || fireCooldown > 0) return;
        bullets.push({ x: ship.x, y: ship.y - 14, vy: -390 });
        fireCooldown = .16;
      }

      function explode(x, y, color) {
        for (let i = 0; i < 7; i++) {
          particles.push({
            x, y,
            vx: 150 * (Math.random() - .5),
            vy: 150 * (Math.random() - .5),
            life: .4 + .35 * Math.random(),
            color
          });
        }
      }

      function loseLife(message) {
        lives--;
        if (lives <= 0) {
          alive = false;
          say(`${message} Score: ${score}. Tap Restart to try again.`);
        }
      }

      function update(dt) {
        if (!alive) return;

        elapsed += dt;
        if (left) ship.x -= 270 * dt;
        if (right) ship.x += 270 * dt;
        ship.x = Math.max(18, Math.min(c.width - 18, ship.x));

        fireCooldown -= dt;
        if (firing && fireCooldown <= 0) fire();

        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          enemies.push({
            x: 22 + Math.random() * (c.width - 44),
            y: -18,
            vy: 65 + 60 * Math.random() + .6 * elapsed,
            dead: false
          });
          spawnTimer = Math.max(.35, .85 - .008 * elapsed) + .3 * Math.random();
        }

        bullets.forEach(bullet => bullet.y += bullet.vy * dt);
        bullets = bullets.filter(bullet => bullet.y > -20);

        enemies.forEach(enemy => {
          enemy.y += enemy.vy * dt;

          if (
            Math.abs(enemy.x - ship.x) < 22 &&
            Math.abs(enemy.y - ship.y) < 25
          ) {
            enemy.dead = true;
            explode(enemy.x, enemy.y, '#ff6d9a');
            loseLife('Ship destroyed!');
          }

          for (const bullet of bullets) {
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
          }

          if (!enemy.dead && enemy.y > c.height + 15) {
            enemy.dead = true;
            loseLife('Invaders broke through!');
          }
        });

        bullets = bullets.filter(bullet => !bullet.dead);
        enemies = enemies.filter(enemy => !enemy.dead);

        particles.forEach(particle => {
          particle.x += particle.vx * dt;
          particle.y += particle.vy * dt;
          particle.life -= dt;
        });

        particles = particles.filter(particle => particle.life > 0);
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, c.width, c.height);

        for (let i = 0; i < 65; i++) {
          const x = (79 * i) % c.width;
          const y = (113 * i + 30 * elapsed) % c.height;
          ctx.fillStyle = i % 4 === 0 ? '#35e8ff' : '#546a8c';
          ctx.fillRect(x, y, 2, 2);
        }

        ctx.fillStyle = '#35e8ff';
        ctx.beginPath();
        ctx.moveTo(ship.x, ship.y - 16);
        ctx.lineTo(ship.x - 15, ship.y + 12);
        ctx.lineTo(ship.x + 15, ship.y + 12);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#fff';
        bullets.forEach(bullet => ctx.fillRect(bullet.x - 2, bullet.y - 8, 4, 12));

        ctx.fillStyle = '#ff6d9a';
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

        ctx.fillStyle = '#e6efff';
        ctx.font = '13px system-ui';
        ctx.fillText(`HULL ${'♥'.repeat(Math.max(0, lives))}`, 12, 22);
      }

      configurePad({
        hint: 'SWIPE TO MOVE · TAP TO FIRE',
        info: 'Slide left or right to steer. Tap or hold the FIRE button to shoot.',
        action: fire,
        move: ({ dx }) => {
          ship.x += dx * 1.7;
          ship.x = Math.max(18, Math.min(c.width - 18, ship.x));
        },
        buttons: [
          { label: '←', action: () => { ship.x -= 24; } },
          { label: 'FIRE', primary: true, action: fire },
          { label: '→', action: () => { ship.x += 24; } }
        ]
      });

      onKeys((key, pressed) => {
        if (key === 'arrowleft' || key === 'a') left = pressed;
        if (key === 'arrowright' || key === 'd') right = pressed;
        if (key === ' ' || key === 'enter') {
          firing = pressed;
          if (pressed) fire();
        }
      });

      loop(update, draw);
      return () => {
        alive = false;
        left = right = firing = false;
        finish();
      };
    }

    function mathGame() {
      configurePad({
        hint: 'TAP AN ANSWER',
        info: 'Select an answer below or use keyboard keys 1–4.'
      });

      area.innerHTML = `
        <div class="nx-result" data-math-info>Answer correctly to earn points.</div>
        <div class="nx-question" data-question></div>
        <div class="nx-answer-grid" data-answers></div>
        <div class="nx-result" data-math-streak>Correct answers: 0</div>
      `;

      const question = $('[data-question]', area);
      const answers = $('[data-answers]', area);
      const info = $('[data-math-info]', area);
      const streak = $('[data-math-streak]', area);

      let correctAnswer = 0;
      let streakCount = 0;
      let locked = false;
      let nextTimer = 0;

      function nextQuestion() {
        locked = false;
        info.textContent = 'Choose the correct answer.';

        const operation = Math.floor(Math.random() * 4);
        let a = 1 + Math.floor(Math.random() * 20);
        let b = 1 + Math.floor(Math.random() * 20);
        let symbol = '+';

        if (operation === 0) {
          correctAnswer = a + b;
          symbol = '+';
        } else if (operation === 1) {
          if (b > a) [a, b] = [b, a];
          correctAnswer = a - b;
          symbol = '−';
        } else if (operation === 2) {
          a = 1 + Math.floor(Math.random() * 12);
          b = 1 + Math.floor(Math.random() * 12);
          correctAnswer = a * b;
          symbol = '×';
        } else {
          b = 1 + Math.floor(Math.random() * 10);
          correctAnswer = 1 + Math.floor(Math.random() * 12);
          a = b * correctAnswer;
          symbol = '÷';
        }

        question.textContent = `${a} ${symbol} ${b} = ?`;

        const choices = new Set([correctAnswer]);
        while (choices.size < 4) {
          const offset = Math.floor(Math.random() * 13) - 6;
          choices.add(Math.max(0, correctAnswer + (offset || 1)));
        }

        answers.innerHTML = [...choices]
          .sort(() => Math.random() - .5)
          .map((value, index) =>
            `<button class="nx-answer" data-answer="${value}">${index + 1}. ${value}</button>`
          ).join('');
      }

      function answer(value) {
        if (locked) return;
        locked = true;

        if (Number(value) === correctAnswer) {
          streakCount++;
          addScore(10);
          info.textContent = 'Correct! +10 points.';
        } else {
          streakCount = 0;
          info.textContent = `Not quite. The answer was ${correctAnswer}.`;
        }

        streak.textContent = `Correct answers: ${streakCount}`;
        $$('[data-answer]', answers).forEach(button => button.disabled = true);

        nextTimer = setTimeout(() => {
          if (generation === myGeneration) nextQuestion();
        }, 650);
      }

      const clickHandler = event => {
        const button = event.target.closest('[data-answer]');
        if (button) answer(button.dataset.answer);
      };

      answers.addEventListener('click', clickHandler);

      onKeys((key, pressed) => {
        if (!pressed || !['1', '2', '3', '4'].includes(key)) return;
        const button = $$('[data-answer]', answers)[Number(key) - 1];
        if (button) answer(button.dataset.answer);
      });

      nextQuestion();

      return () => {
        clearTimeout(nextTimer);
        answers.removeEventListener('click', clickHandler);
        finish();
      };
    }

    function rpsGame() {
      configurePad({
        hint: 'CHOOSE YOUR MOVE',
        info: 'Tap Rock, Paper, or Scissors to play.'
      });

      area.innerHTML = `
        <div class="nx-result">Win a round to earn one point.</div>
        <div class="nx-rps-buttons" data-rps-buttons>
          <button class="nx-btn" data-rps="rock">✊ Rock</button>
          <button class="nx-btn" data-rps="paper">✋ Paper</button>
          <button class="nx-btn" data-rps="scissors">✌️ Scissors</button>
        </div>
        <div class="nx-question" data-rps-result>Ready?</div>
        <div class="nx-result" data-rps-score>Wins: 0 · Draws: 0 · Losses: 0</div>
      `;

      const result = $('[data-rps-result]', area);
      const scoreDisplay = $('[data-rps-score]', area);
      const buttonArea = $('[data-rps-buttons]', area);

      const moves = ['rock', 'paper', 'scissors'];
      const icons = { rock: '✊', paper: '✋', scissors: '✌️' };

      let wins = 0;
      let draws = 0;
      let losses = 0;

      function play(player) {
        const computer = moves[Math.floor(Math.random() * 3)];
        let outcome;

        if (player === computer) {
          draws++;
          outcome = 'Draw!';
        } else if (
          (player === 'rock' && computer === 'scissors') ||
          (player === 'paper' && computer === 'rock') ||
          (player === 'scissors' && computer === 'paper')
        ) {
          wins++;
          addScore(1);
          outcome = 'You win!';
        } else {
          losses++;
          outcome = 'Computer wins!';
        }

        result.textContent = `${icons[player]} vs ${icons[computer]} — ${outcome}`;
        scoreDisplay.textContent = `Wins: ${wins} · Draws: ${draws} · Losses: ${losses}`;
      }

      const clickHandler = event => {
        const button = event.target.closest('[data-rps]');
        if (button) play(button.dataset.rps);
      };

      buttonArea.addEventListener('click', clickHandler);

      onKeys((key, pressed) => {
        if (!pressed) return;
        const map = { r: 'rock', p: 'paper', s: 'scissors' };
        if (map[key]) play(map[key]);
      });

      return () => {
        buttonArea.removeEventListener('click', clickHandler);
        finish();
      };
    }

    function hangmanGame() {
      configurePad({
        hint: 'GUESS THE WORD',
        info: 'Tap letters on screen or use your physical keyboard.'
      });

      const wordList = [
        'GALAXY', 'PLANET', 'ROCKET', 'JUNGLE', 'PUZZLE',
        'ARCADE', 'NEXORA', 'GAMING', 'NEBULA', 'PYTHON',
        'COMPUTER', 'RAINBOW', 'DIAMOND', 'OCEAN', 'FUTURE'
      ];

      const word = wordList[Math.floor(Math.random() * wordList.length)];
      const guessed = new Set();
      let mistakes = 0;
      const maxMistakes = 6;
      let finished = false;

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

      const wordDisplay = $('[data-hangman-word]', area);
      const drawing = $('[data-hangman-drawing]', area);
      const status = $('[data-hangman-status]', area);
      const letters = $('[data-hangman-letters]', area);
      const stages = ['○', '◔', '◑', '◕', '◉', '☠', '✖'];

      function render() {
        wordDisplay.textContent = word.split('').map(letter =>
          guessed.has(letter) ? letter : '_'
        ).join(' ');

        drawing.textContent = stages[Math.min(mistakes, maxMistakes)];

        $$('[data-letter]', letters).forEach(button => {
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
        } else if (mistakes >= maxMistakes) {
          finished = true;
          status.textContent = `Game over! The word was ${word}.`;
        } else {
          status.textContent = `Mistakes: ${mistakes}/${maxMistakes}`;
        }

        render();
      }

      const clickHandler = event => {
        const button = event.target.closest('[data-letter]');
        if (button) guess(button.dataset.letter);
      };

      letters.addEventListener('click', clickHandler);

      onKeys((key, pressed) => {
        if (pressed && /^[a-z]$/.test(key)) guess(key.toUpperCase());
      });

      render();

      return () => {
        letters.removeEventListener('click', clickHandler);
        finish();
      };
    }

    function flappyGame() {
      const { canvas: c, ctx } = canvas(360, 480);

      const bird = { x: 82, y: 210, vy: 0, r: 12 };
      const pipeW = 54;
      const gap = 145;

      let pipes = [];
      let started = false;
      let alive = true;
      let flapQueued = false;
      let spawnTimer = 0;
      let elapsed = 0;
      let points = 0;

      function flap() {
        if (!alive) return;
        started = true;
        bird.vy = -300;
      }

      function update(dt) {
        if (!alive) return;

        elapsed += dt;

        if (flapQueued) {
          flapQueued = false;
          flap();
        }

        if (!started) return;

        bird.vy += 900 * dt;
        bird.y += bird.vy * dt;

        spawnTimer -= dt;

        if (spawnTimer <= 0) {
          const top = 55 + Math.random() * (c.height - gap - 115);
          pipes.push({ x: c.width + 5, top, scored: false });
          spawnTimer = 1.35;
        }

        for (const pipe of pipes) {
          pipe.x -= 145 * dt;

          if (!pipe.scored && pipe.x + pipeW < bird.x) {
            pipe.scored = true;
            points++;
            addScore(1);
          }

          const overlapsX =
            bird.x + bird.r > pipe.x &&
            bird.x - bird.r < pipe.x + pipeW;

          const overlapsY =
            bird.y - bird.r < pipe.top ||
            bird.y + bird.r > pipe.top + gap;

          if (overlapsX && overlapsY) {
            alive = false;
            say(`You hit a pipe! Score: ${points}. Tap Restart to try again.`);
            break;
          }
        }

        pipes = pipes.filter(pipe => pipe.x + pipeW > -5);

        if (bird.y - bird.r < 0 || bird.y + bird.r > c.height) {
          alive = false;
          say(`Flight ended! Score: ${points}. Tap Restart to try again.`);
        }
      }

      function draw() {
        ctx.fillStyle = '#071226';
        ctx.fillRect(0, 0, c.width, c.height);

        for (let i = 0; i < 28; i++) {
          const x = (37 * i) % c.width;
          const y = (71 * i) % c.height;
          ctx.fillStyle = '#213957';
          ctx.fillRect(x, y, 2, 2);
        }

        pipes.forEach(pipe => {
          ctx.fillStyle = '#43f5a5';
          ctx.fillRect(pipe.x, 0, pipeW, pipe.top);
          ctx.fillRect(pipe.x, pipe.top + gap, pipeW, c.height - pipe.top - gap);
          ctx.fillStyle = '#1bbf88';
          ctx.fillRect(pipe.x - 4, pipe.top - 10, pipeW + 8, 10);
          ctx.fillRect(pipe.x - 4, pipe.top + gap, pipeW + 8, 10);
        });

        ctx.fillStyle = '#ffdc68';
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#091120';
        ctx.beginPath();
        ctx.arc(bird.x + 4, bird.y - 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#eaf3ff';
        ctx.font = 'bold 17px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`SCORE ${points}`, c.width / 2, 30);

        if (!started && alive) {
          ctx.fillStyle = '#fff';
          ctx.fillText('TAP FLAP TO START', c.width / 2, c.height / 2 + 65);
        }
      }

      configurePad({
        hint: 'TAP TO FLAP',
        info: 'Tap the touchpad, the FLAP button, or press Space.',
        action: () => { flapQueued = true; },
        buttons: [
          { label: 'FLAP', primary: true, action: () => { flapQueued = true; } }
        ]
      });

      onKeys((key, pressed) => {
        if (pressed && (key === ' ' || key === 'arrowup' || key === 'w')) {
          flapQueued = true;
        }
      });

      loop(update, draw);

      return () => {
        alive = false;
        finish();
      };
    }

    try {
      cleanup = makeGame() || (() => {});
    } catch (error) {
      console.error(`Nexora ${id} error:`, error);
      area.innerHTML = '<p class="nx-result">The game could not start. Tap Restart to try again.</p>';
      cleanup = () => {};
    }

    const previousCleanup = cleanup;

    cleanup = () => {
      stopLoop();
      clearPad();

      for (const dispose of disposers.splice(0)) {
        try {
          dispose();
        } catch (error) {
          console.warn('Nexora cleanup:', error);
        }
      }

      try {
        previousCleanup();
      } catch (error) {
        console.warn('Nexora game cleanup:', error);
      }
    };
  }

  installStyles();
  showHome();
})();