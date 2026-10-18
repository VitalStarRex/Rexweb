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
  let cleanup = [];
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

  function installStyles() {
    if (document.getElementById('nexora-arcade-styles')) return;

    const style = document.createElement('style');
    style.id = 'nexora-arcade-styles';

    style.textContent = `
      #nexora-games {
        --nx-bg:#040a16;
        --nx-panel:#0a1527;
        --nx-panel2:#10213a;
        --nx-line:#203956;
        --nx-text:#f2f7ff;
        --nx-muted:#91a7c5;
        --nx-cyan:#35e8ff;
        --nx-purple:#9b6cff;
        --nx-green:#43f5a5;
        background:var(--nx-bg);
        color:var(--nx-text);
        font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        min-height:100%;
        padding:16px;
        box-sizing:border-box;
        overflow:hidden;
      }

      #nexora-games * { box-sizing:border-box; }
      #nexora-games button { font:inherit; -webkit-tap-highlight-color:transparent; }

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
        margin-bottom:18px;
      }

      #nexora-games .nx-brand {
        display:flex;
        align-items:center;
        gap:12px;
      }

      #nexora-games .nx-logo {
        width:58px;
        height:58px;
        flex-shrink:0;
        display:grid;
        place-items:center;
        border:2px solid #126b91;
        border-radius:17px;
        color:var(--nx-cyan);
        font-size:30px;
        font-weight:900;
        background:linear-gradient(135deg,#102d48,#191334);
        box-shadow:0 0 20px #00dfff22;
      }

      #nexora-games .nx-brand h1 {
        font-size:clamp(17px,4vw,26px);
        margin:0;
        line-height:1.2;
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
        border-radius:13px;
        padding:11px 15px;
        min-height:43px;
        cursor:pointer;
      }

      #nexora-games .nx-btn:active { transform:scale(.98); }

      #nexora-games .nx-btn-primary {
        color:#001019;
        background:var(--nx-cyan);
        border-color:var(--nx-cyan);
        font-weight:900;
      }

      #nexora-games .nx-title {
        font-size:18px;
        margin:22px 0 13px;
      }

      #nexora-games .nx-game-grid {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:12px;
      }

      #nexora-games .nx-game-card {
        text-align:left;
        padding:16px;
        min-width:0;
        border:1px solid var(--nx-line);
        border-radius:17px;
        background:linear-gradient(145deg,var(--nx-panel),#070e1c);
        color:var(--nx-text);
        cursor:pointer;
      }

      #nexora-games .nx-game-card:hover {
        border-color:var(--nx-cyan);
      }

      #nexora-games .nx-card-icon {
        display:block;
        font-size:29px;
        margin-bottom:10px;
      }

      #nexora-games .nx-card-title {
        display:block;
        font-weight:850;
      }

      #nexora-games .nx-card-description {
        display:block;
        color:var(--nx-muted);
        font-size:12px;
        margin-top:6px;
        line-height:1.5;
      }

      #nexora-games .nx-card-best {
        display:block;
        margin-top:12px;
        color:var(--nx-cyan);
        font-size:11px;
      }

      #nexora-games .nx-panel {
        border:1px solid var(--nx-line);
        border-radius:23px;
        overflow:hidden;
        background:var(--nx-panel);
      }

      #nexora-games .nx-game-top {
        padding:18px;
        display:flex;
        align-items:center;
        justify-content:space-between;
        flex-wrap:wrap;
        gap:14px;
        border-bottom:1px solid var(--nx-line);
      }

      #nexora-games .nx-game-heading {
        display:flex;
        align-items:center;
        gap:12px;
      }

      #nexora-games .nx-game-heading h2 {
        margin:0;
        font-size:clamp(18px,4vw,26px);
      }

      #nexora-games .nx-game-heading p {
        margin:5px 0 0;
        color:var(--nx-muted);
        font-size:13px;
      }

      #nexora-games .nx-stats {
        display:flex;
        gap:9px;
        flex-wrap:wrap;
      }

      #nexora-games .nx-stat {
        background:#050c18;
        border:1px solid var(--nx-line);
        border-radius:12px;
        padding:10px 13px;
        font-size:13px;
      }

      #nexora-games .nx-stat strong { color:var(--nx-cyan); }

      #nexora-games .nx-game-area {
        position:relative;
        padding:14px;
        min-height:180px;
      }

      #nexora-games .nx-canvas-wrap {
        position:relative;
        width:100%;
        margin:auto;
      }

      #nexora-games canvas {
        display:block;
        width:100%;
        height:auto;
        border:1px solid #153b5c;
        border-radius:17px;
        background:#030914;
        touch-action:none;
      }

      #nexora-games .nx-message {
        text-align:center;
        min-height:23px;
        padding:6px 10px 12px;
        color:var(--nx-cyan);
        font-size:13px;
      }

      #nexora-games .nx-controls {
        display:flex;
        justify-content:center;
        flex-wrap:wrap;
        gap:10px;
        padding:12px;
      }

      /* UNIVERSAL LAPTOP-STYLE TOUCHPAD */

      #nexora-games .nx-gamepad {
        border-top:1px solid var(--nx-line);
        padding:20px 12px;
        background:linear-gradient(180deg,#081426,#040b16);
      }

      #nexora-games .nx-pad-label {
        color:var(--nx-muted);
        text-align:center;
        font-size:12px;
        font-weight:900;
        letter-spacing:3px;
        margin-bottom:15px;
      }

      #nexora-games .nx-touch-layout {
        width:min(100%,650px);
        margin:auto;
        display:grid;
        grid-template-columns:minmax(0,1fr);
        gap:13px;
        align-items:center;
      }

      #nexora-games .nx-touch-instructions {
        display:flex;
        justify-content:space-between;
        gap:10px;
        align-items:center;
        flex-wrap:wrap;
        color:#a6c5e7;
        font-size:12px;
        line-height:1.7;
      }

      #nexora-games .nx-touch-status {
        color:var(--nx-green);
        font-weight:800;
      }

      #nexora-games .nx-touchpad {
        position:relative;
        width:100%;
        height:160px;
        overflow:hidden;
        border:3px solid #00dfff;
        border-radius:24px;
        background:
          linear-gradient(90deg,transparent 49.7%,#20b8df30 50%,transparent 50.3%),
          linear-gradient(transparent 49.7%,#20b8df30 50%,transparent 50.3%),
          radial-gradient(ellipse at center,#123e5d,#08192c 75%);
        box-shadow:0 0 17px #00dfff32,inset 0 0 22px #00dfff13;
        touch-action:none;
        user-select:none;
        -webkit-user-select:none;
      }

      #nexora-games .nx-touchpad::before {
        content:"";
        position:absolute;
        inset:10px;
        border:1px solid #35e8ff38;
        border-radius:15px;
        pointer-events:none;
      }

      #nexora-games .nx-touchpad::after {
        content:"";
        position:absolute;
        left:50%;
        top:50%;
        width:100px;
        height:100px;
        border:1px solid #35e8ff20;
        border-radius:50%;
        transform:translate(-50%,-50%);
        pointer-events:none;
      }

      #nexora-games .nx-touch-knob {
        position:absolute;
        left:50%;
        top:50%;
        width:32px;
        height:32px;
        transform:translate(-50%,-50%);
        border:3px solid #8bf8ff;
        border-radius:50%;
        background:#00dfff;
        box-shadow:0 0 15px #00dfff,0 0 35px #00dfff70;
        pointer-events:none;
        z-index:2;
      }

      #nexora-games .nx-touchpad.nx-touch-active {
        border-color:#71f7ff;
        box-shadow:0 0 25px #00dfff50,inset 0 0 28px #00dfff22;
      }

      #nexora-games .nx-touch-buttons {
        display:flex;
        justify-content:center;
        flex-wrap:wrap;
        gap:10px;
      }

      #nexora-games .nx-pad-btn {
        min-width:65px;
        min-height:55px;
        padding:10px 16px;
        border:1px solid #28536e;
        border-radius:14px;
        color:var(--nx-cyan);
        background:linear-gradient(145deg,#142a42,#091426);
        font-weight:900;
        font-size:18px;
        cursor:pointer;
        touch-action:manipulation;
      }

      #nexora-games .nx-pad-action {
        min-width:115px;
        color:#001a12;
        background:linear-gradient(145deg,#5affc2,#17c98b);
        border-color:var(--nx-green);
      }

      #nexora-games .nx-board {
        display:grid;
        gap:8px;
        max-width:340px;
        margin:15px auto;
      }

      #nexora-games .nx-ttt-board {
        grid-template-columns:repeat(3,minmax(0,1fr));
      }

      #nexora-games .nx-cell {
        aspect-ratio:1;
        border:1px solid #2a415e;
        border-radius:13px;
        background:#0c192a;
        color:var(--nx-cyan);
        font-size:clamp(30px,8vw,48px);
        font-weight:900;
        cursor:pointer;
      }

      #nexora-games .nx-cell.nx-o { color:var(--nx-purple); }

      #nexora-games .nx-result {
        text-align:center;
        color:var(--nx-muted);
        font-size:14px;
        line-height:1.6;
      }

      #nexora-games .nx-question {
        text-align:center;
        margin:20px 0;
        color:var(--nx-cyan);
        font-size:clamp(27px,7vw,42px);
        font-weight:900;
      }

      #nexora-games .nx-answer-grid {
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:10px;
        max-width:480px;
        margin:15px auto;
      }

      #nexora-games .nx-answer {
        padding:15px 8px;
        border:1px solid var(--nx-line);
        border-radius:12px;
        background:#0c192a;
        color:var(--nx-text);
        font-weight:800;
        cursor:pointer;
      }

      #nexora-games .nx-rps-buttons {
        display:flex;
        justify-content:center;
        flex-wrap:wrap;
        gap:9px;
        margin:18px auto;
      }

      #nexora-games .nx-word {
        text-align:center;
        margin:20px 0;
        font-size:clamp(22px,6vw,34px);
        font-weight:900;
        letter-spacing:6px;
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
      }

      #nexora-games .nx-letter:disabled,
      #nexora-games .nx-answer:disabled {
        opacity:.45;
        cursor:default;
      }

      #nexora-games .nx-hidden { display:none !important; }

      #nexora-games .nx-footer {
        padding:18px 0 4px;
        color:#7188a6;
        text-align:center;
        font-size:12px;
      }

      @media(min-width:650px) {
        #nexora-games { padding:24px; }
        #nexora-games .nx-game-grid {
          grid-template-columns:repeat(3,minmax(0,1fr));
        }
        #nexora-games .nx-game-area { padding:20px; }
        #nexora-games .nx-touch-layout {
          grid-template-columns:minmax(0,1fr);
        }
      }

      @media(max-width:380px) {
        #nexora-games { padding:10px; }
        #nexora-games .nx-game-grid { gap:8px; }
        #nexora-games .nx-game-card { padding:12px; }
        #nexora-games .nx-touchpad { height:135px; }
        #nexora-games .nx-letter-grid { grid-template-columns:repeat(6,minmax(0,1fr)); }
      }

      @media(prefers-reduced-motion:reduce) {
        #nexora-games * { transition:none !important; }
      }
    `;

    document.head.appendChild(style);
  }

  function dispose() {
    gameToken++;

    cleanup.forEach(fn => {
      try { fn(); } catch (error) {
        console.warn('Nexora cleanup:', error);
      }
    });

    cleanup = [];
    currentGame = null;
  }

  function register(fn) {
    if (typeof fn === 'function') cleanup.push(fn);
  }

  function setMessage(message) {
    const el = $('[data-message]');
    if (el) el.textContent = message || '';
  }

  function setScore(value) {
    if (!currentGame) return;

    currentGame.score = Math.max(0, Math.floor(Number(value) || 0));

    const score = $('[data-score]');
    const best = $('[data-best]');

    if (score) score.textContent = currentGame.score;

    if (currentGame.score > bestScore(currentGame.id)) {
      scores[currentGame.id] = currentGame.score;
      saveScores();
    }

    if (best) best.textContent = bestScore(currentGame.id);
  }

  function addScore(points = 1) {
    if (currentGame) setScore(currentGame.score + points);
  }

  function canvas(width, height, maxWidth = width) {
    const wrap = document.createElement('div');
    wrap.className = 'nx-canvas-wrap';
    wrap.style.maxWidth = maxWidth + 'px';

    const el = document.createElement('canvas');
    el.width = width;
    el.height = height;
    el.setAttribute('aria-label', 'Game play area');

    wrap.appendChild(el);
    $('[data-game-area]').appendChild(wrap);

    const ctx = el.getContext('2d');

    if (!ctx) throw new Error('Canvas is not supported.');

    return { canvas: el, ctx };
  }

  function loop(callback) {
    let raf = 0;
    let previous = 0;
    let alive = true;
    const token = gameToken;

    function frame(now) {
      if (!alive || token !== gameToken) return;

      const dt = previous ? Math.min((now - previous) / 1000, 0.035) : 0;
      previous = now;

      callback(dt, now);
      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }

  function keyboard(callback) {
    const down = event => {
      if (event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement) return;

      callback(event, true);
    };

    const up = event => callback(event, false);

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);

    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }

  /*
   * UNIVERSAL TOUCHPAD:
   * Swipe directions work across the arcade.
   * Buttons provide accessible directional controls.
   * Game-specific actions are mapped separately.
   */

  function touchpad(gameId, container) {
    const padRoot = document.createElement('div');
    padRoot.className = 'nx-gamepad';

    padRoot.innerHTML = `
      <div class="nx-pad-label">UNIVERSAL TOUCHPAD</div>

      <div class="nx-touch-layout">
        <div class="nx-touch-instructions">
          <span>Swipe to move · Tap to act</span>
          <span class="nx-touch-status" data-pad-status>● Ready</span>
        </div>

        <div class="nx-touchpad"
             data-touchpad
             role="application"
             aria-label="Touchpad controller">
          <div class="nx-touch-knob" data-touch-knob></div>
        </div>

        <div class="nx-touch-buttons">
          <button type="button" class="nx-pad-btn" data-direction="left" aria-label="Move left">←</button>
          <button type="button" class="nx-pad-btn" data-direction="up" aria-label="Move up">↑</button>
          <button type="button" class="nx-pad-btn" data-direction="down" aria-label="Move down">↓</button>
          <button type="button" class="nx-pad-btn" data-direction="right" aria-label="Move right">→</button>
          <button type="button" class="nx-pad-btn nx-pad-action" data-pad-action>ACT</button>
        </div>
      </div>
    `;

    container.replaceChildren(padRoot);

    const pad = $('[data-touchpad]', padRoot);
    const knob = $('[data-touch-knob]', padRoot);
    const status = $('[data-pad-status]', padRoot);
    const actionButton = $('[data-pad-action]', padRoot);

    const keyMap = {
      left: 'ArrowLeft',
      right: 'ArrowRight',
      up: 'ArrowUp',
      down: 'ArrowDown'
    };

    const activeKeys = new Set();
    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let moved = false;
    let lastDirection = '';
    let destroyed = false;

    function emitKey(key, pressed) {
      if (!key || destroyed) return;

      if (pressed) {
        if (activeKeys.has(key)) return;
        activeKeys.add(key);

        window.dispatchEvent(new KeyboardEvent('keydown', {
          key,
          bubbles: true,
          cancelable: true
        }));
      } else {
        if (!activeKeys.has(key)) return;
        activeKeys.delete(key);

        window.dispatchEvent(new KeyboardEvent('keyup', {
          key,
          bubbles: true,
          cancelable: true
        }));
      }
    }

    function releaseKeys() {
      [...activeKeys].forEach(key => emitKey(key, false));
    }

    function directionFor(dx, dy) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 16) return '';

      if (Math.abs(dx) >= Math.abs(dy)) {
        return dx < 0 ? 'left' : 'right';
      }

      return dy < 0 ? 'up' : 'down';
    }

    function showStatus(message) {
      if (!destroyed) status.textContent = message;
    }

    function move(direction, pressed) {
      if (destroyed) return;

      if (gameId === 'ttt' ||
          gameId === 'math' ||
          gameId === 'rps' ||
          gameId === 'hangman') {
        showStatus('Tap your answer on the game.');
        return;
      }

      if (gameId === 'runner' && direction === 'up' && pressed) {
        act();
        return;
      }

      if (gameId === 'flappy' && pressed) {
        act();
        return;
      }

      if (gameId === 'pong' &&
          direction !== 'up' && direction !== 'down') return;

      if (gameId === 'breakout' &&
          direction !== 'left' && direction !== 'right') return;

      if (gameId === 'shooter' &&
          direction !== 'left' && direction !== 'right') return;

      emitKey(keyMap[direction], pressed);

      if (pressed) {
        lastDirection = direction;
        showStatus('● Moving ' + direction);
      } else {
        showStatus('● Ready');
      }
    }

    function act() {
      if (destroyed) return;

      switch (gameId) {
        case 'snake':
          showStatus('Swipe to steer your snake.');
          break;

        case 'runner':
        case 'flappy':
        case 'shooter':
        case 'breakout':
          emitKey(' ', true);
          setTimeout(() => emitKey(' ', false), 60);
          showStatus('● Action');
          break;

        case 'pong':
          showStatus('Move up or down to control your paddle.');
          break;

        case 'ttt':
        case 'math':
        case 'rps':
        case 'hangman':
          showStatus('Tap your choice in the game.');
          break;

        default:
          showStatus('● Ready');
      }
    }

    function onPointerDown(event) {
      if (destroyed || pointerId !== null) return;

      event.preventDefault();

      pointerId = event.pointerId;
      const rect = pad.getBoundingClientRect();

      startX = event.clientX - rect.left;
      startY = event.clientY - rect.top;
      moved = false;
      lastDirection = '';

      pad.classList.add('nx-touch-active');

      try {
        pad.setPointerCapture(pointerId);
      } catch (_) {}

      knob.style.left = startX + 'px';
      knob.style.top = startY + 'px';

      showStatus('● Touch active');
    }

    function onPointerMove(event) {
      if (destroyed || event.pointerId !== pointerId) return;

      event.preventDefault();

      const rect = pad.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const dx = x - startX;
      const dy = y - startY;

      const maxX = rect.width * 0.38;
      const maxY = rect.height * 0.32;

      knob.style.left = Math.max(12, Math.min(rect.width - 12, x)) + 'px';
      knob.style.top = Math.max(12, Math.min(rect.height - 12, y)) + 'px';

      if (Math.max(Math.abs(dx), Math.abs(dy)) > 16) {
        moved = true;

        const direction = directionFor(dx, dy);

        if (direction && direction !== lastDirection) {
          releaseKeys();
          move(direction, true);
        }
      }
    }

    function onPointerUp(event) {
      if (pointerId === null ||
          (event && event.pointerId !== undefined &&
           event.pointerId !== pointerId)) return;

      if (event && event.cancelable) event.preventDefault();

      const wasMoved = moved;

      pointerId = null;
      pad.classList.remove('nx-touch-active');

      releaseKeys();

      knob.style.left = '50%';
      knob.style.top = '50%';

      if (!wasMoved) act();
      else showStatus('● Ready');
    }

    function onPointerCancel() {
      pointerId = null;
      pad.classList.remove('nx-touch-active');
      releaseKeys();
      knob.style.left = '50%';
      knob.style.top = '50%';
      showStatus('● Ready');
    }

    pad.addEventListener('pointerdown', onPointerDown);
    pad.addEventListener('pointermove', onPointerMove);
    pad.addEventListener('pointerup', onPointerUp);
    pad.addEventListener('pointercancel', onPointerCancel);
    pad.addEventListener('lostpointercapture', onPointerCancel);

    const directionButtons = $$('[data-direction]', padRoot);

    directionButtons.forEach(button => {
      const direction = button.dataset.direction;

      const down = event => {
        event.preventDefault();
        move(direction, true);
      };

      const up = event => {
        if (event) event.preventDefault();
        move(direction, false);
      };

      button.addEventListener('pointerdown', down);
      button.addEventListener('pointerup', up);
      button.addEventListener('pointercancel', up);
      button.addEventListener('lostpointercapture', up);

      register(() => {
        button.removeEventListener('pointerdown', down);
        button.removeEventListener('pointerup', up);
        button.removeEventListener('pointercancel', up);
        button.removeEventListener('lostpointercapture', up);
      });
    });

    const onAction = event => {
      event.preventDefault();
      act();
    };

    actionButton.addEventListener('click', onAction);

    const labels = {
      snake: 'TURN',
      ttt: 'SELECT',
      pong: 'PLAY',
      breakout: 'LAUNCH',
      runner: 'JUMP',
      shooter: 'FIRE',
      math: 'ANSWER',
      rps: 'CHOOSE',
      hangman: 'GUESS',
      flappy: 'FLAP'
    };

    actionButton.textContent = labels[gameId] || 'ACT';

    register(() => {
      destroyed = true;
      releaseKeys();

      pad.removeEventListener('pointerdown', onPointerDown);
      pad.removeEventListener('pointermove', onPointerMove);
      pad.removeEventListener('pointerup', onPointerUp);
      pad.removeEventListener('pointercancel', onPointerCancel);
      pad.removeEventListener('lostpointercapture', onPointerCancel);
      actionButton.removeEventListener('click', onAction);
    });
  }

  function renderHome() {
    dispose();
    installStyles();

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

          <button class="nx-btn" data-refresh>↻ Refresh Scores</button>
        </header>

        <h2 class="nx-title">Choose Your Game</h2>

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

        <footer class="nx-footer">
          REXWEB NEXORA · YOUR DIGITAL WORLD, WITHOUT LIMITS
        </footer>
      </div>
    `;

    $$('[data-open]').forEach(button => {
      button.addEventListener('click', () => startGame(button.dataset.open));
    });

    $('[data-refresh]').addEventListener('click', renderHome);
  }

  function startGame(id) {
    const game = games.find(item => item.id === id);
    if (!game) return;

    dispose();
    installStyles();

    currentGame = { id, score: 0 };

    const token = gameToken;

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
          <button class="nx-btn" data-home>← All Games</button>
        </header>

        <section class="nx-panel">
          <div class="nx-game-top">
            <div class="nx-game-heading">
              <span style="font-size:34px">${game.icon}</span>
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

          <div data-gamepad></div>

          <div class="nx-controls">
            <button class="nx-btn nx-btn-primary" data-restart>↻ Restart</button>
            <button class="nx-btn" data-home>▦ All Games</button>
          </div>
        </section>

        <footer class="nx-footer">
          Use the touchpad or keyboard to play.
        </footer>
      </div>
    `;

    $$('[data-home]').forEach(button => {
      button.addEventListener('click', renderHome);
    });

    $('[data-restart]').addEventListener('click', () => startGame(id));

    try {
      switch (id) {
        case 'snake': gameSnake(); break;
        case 'ttt': gameTTT(); break;
        case 'pong': gamePong(); break;
        case 'breakout': gameBreakout(); break;
        case 'runner': gameRunner(); break;
        case 'shooter': gameShooter(); break;
        case 'math': gameMath(); break;
        case 'rps': gameRPS(); break;
        case 'hangman': gameHangman(); break;
        case 'flappy': gameFlappy(); break;
      }

      if (token === gameToken && currentGame) {
        touchpad(id, $('[data-gamepad]'));
      }
    } catch (error) {
      console.error('Nexora game error:', error);
      setMessage('The game encountered an error. Tap Restart to try again.');
    }
  }

  /* 1. SNAKE */

  function gameSnake() {
    const { canvas: el, ctx } = canvas(360, 360);
    const size = 18;
    const cells = 20;

    let body, direction, nextDirection, food, alive, accumulator;

    function reset() {
      body = [
        { x: 9, y: 10 },
        { x: 8, y: 10 },
        { x: 7, y: 10 }
      ];
      direction = { x: 1, y: 0 };
      nextDirection = { ...direction };
      food = randomFood();
      alive = true;
      accumulator = 0;
      setScore(0);
      setMessage('Eat the food. Avoid walls and your tail.');
      draw();
    }

    function randomFood() {
      let point;

      do {
        point = {
          x: Math.floor(Math.random() * cells),
          y: Math.floor(Math.random() * cells)
        };
      } while (body && body.some(part =>
        part.x === point.x && part.y === point.y
      ));

      return point;
    }

    function draw() {
      ctx.fillStyle = '#030914';
      ctx.fillRect(0, 0, el.width, el.height);

      ctx.strokeStyle = '#102035';

      for (let i = 0; i <= cells; i++) {
        ctx.beginPath();
        ctx.moveTo(i * size, 0);
        ctx.lineTo(i * size, el.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * size);
        ctx.lineTo(el.width, i * size);
        ctx.stroke();
      }

      ctx.fillStyle = '#ff5e89';
      ctx.beginPath();
      ctx.arc(
        food.x * size + size / 2,
        food.y * size + size / 2,
        size * 0.34,
        0, Math.PI * 2
      );
      ctx.fill();

      body.forEach((part, i) => {
        ctx.fillStyle = i === 0 ? '#66ffd0' : '#1bc995';
        ctx.fillRect(
          part.x * size + 2,
          part.y * size + 2,
          size - 4,
          size - 4
        );
      });
    }

    function steer(dir) {
      const map = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 }
      };

      const next = map[dir];
      if (!next) return;

      if (next.x === -direction.x && next.y === -direction.y) return;

      nextDirection = next;
    }

    function update() {
      if (!alive) return;

      direction = { ...nextDirection };

      const head = {
        x: body[0].x + direction.x,
        y: body[0].y + direction.y
      };

      const eating = head.x === food.x && head.y === food.y;

      if (
        head.x < 0 || head.y < 0 ||
        head.x >= cells || head.y >= cells ||
        body.slice(0, eating ? undefined : -1).some(part =>
          part.x === head.x && part.y === head.y
        )
      ) {
        alive = false;
        setMessage('Game over! Your score: ' + currentGame.score);
        return;
      }

      body.unshift(head);

      if (eating) {
        addScore(10);
        food = randomFood();

        if (body.length >= cells * cells) {
          alive = false;
          setMessage('Amazing! You filled the entire board!');
        }
      } else {
        body.pop();
      }

      draw();
    }

    register(keyboard((event, pressed) => {
      if (!pressed) return;

      const key = event.key.toLowerCase();

      if (key === 'arrowup' || key === 'w') steer('up');
      if (key === 'arrowdown' || key === 's') steer('down');
      if (key === 'arrowleft' || key === 'a') steer('left');
      if (key === 'arrowright' || key === 'd') steer('right');
    }));

    register(loop(dt => {
      if (!alive) return;

      accumulator += dt;

      if (accumulator >= 0.12) {
        accumulator = 0;
        update();
      }
    }));

    reset();

    const oldReset = reset;
    register(() => { alive = false; });
    return oldReset;
  }

  /* 2. TIC-TAC-TOE */

  function gameTTT() {
    const area = $('[data-game-area]');

    area.innerHTML = `
      <div class="nx-result" data-ttt-status>Your turn — you are X.</div>
      <div class="nx-board nx-ttt-board" data-ttt-board>
        ${Array.from({ length: 9 }, (_, i) =>
          `<button class="nx-cell" data-cell="${i}" aria-label="Square ${i + 1}"></button>`
        ).join('')}
      </div>
    `;

    const board = $('[data-ttt-board]');
    const status = $('[data-ttt-status]');

    const cells = Array(9).fill('');
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    let finished = false;
    let timer = null;

    function winner() {
      for (const line of lines) {
        const [a, b, c] = line;

        if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
          return cells[a];
        }
      }

      return cells.every(Boolean) ? 'draw' : null;
    }

    function draw() {
      $$('[data-cell]', board).forEach(button => {
        const value = cells[Number(button.dataset.cell)];
        button.textContent = value;
        button.disabled = finished || Boolean(value);
        button.classList.toggle('nx-o', value === 'O');
      });
    }

    function finish() {
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
        status.textContent = 'Draw game!';
      }

      return true;
    }

    function findWinningMove(player) {
      for (let i = 0; i < 9; i++) {
        if (cells[i]) continue;

        cells[i] = player;
        const wins = winner() === player;
        cells[i] = '';

        if (wins) return i;
      }

      return -1;
    }

    function computerMove() {
      if (finished) return;

      let index = findWinningMove('O');

      if (index < 0) index = findWinningMove('X');
      if (index < 0 && !cells[4]) index = 4;

      if (index < 0) {
        const corners = [0, 2, 6, 8].filter(i => !cells[i]);

        if (corners.length) {
          index = corners[Math.floor(Math.random() * corners.length)];
        }
      }

      if (index < 0) {
        const remaining = cells
          .map((value, i) => value ? -1 : i)
          .filter(i => i >= 0);

        if (remaining.length) {
          index = remaining[Math.floor(Math.random() * remaining.length)];
        }
      }

      if (index >= 0) cells[index] = 'O';

      draw();

      if (!finish()) status.textContent = 'Your turn — you are X.';
    }

    function click(event) {
      const button = event.target.closest('[data-cell]');

      if (!button || finished) return;

      const index = Number(button.dataset.cell);

      if (cells[index]) return;

      cells[index] = 'X';
      draw();

      if (finish()) return;

      status.textContent = 'Computer is thinking…';
      timer = setTimeout(computerMove, 300);
    }

    board.addEventListener('click', click);
    draw();

    register(() => {
      clearTimeout(timer);
      board.removeEventListener('click', click);
    });
  }

  /* 3. PONG */

  function gamePong() {
    const { canvas: el, ctx } = canvas(520, 320, 700);

    let playerY = 125;
    let opponentY = 125;
    const paddleW = 10;
    const paddleH = 70;

    let up = false;
    let down = false;
    let leftScore = 0;
    let rightScore = 0;
    let ball;
    let accumulator = 0;

    function resetBall(direction) {
      ball = {
        x: el.width / 2,
        y: el.height / 2,
        vx: 210 * direction,
        vy: (Math.random() - 0.5) * 160,
        r: 7
      };
    }

    function draw() {
      ctx.fillStyle = '#030914';
      ctx.fillRect(0, 0, el.width, el.height);

      ctx.strokeStyle = '#1d3550';
      ctx.setLineDash([7, 9]);
      ctx.beginPath();
      ctx.moveTo(el.width / 2, 0);
      ctx.lineTo(el.width / 2, el.height);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#35e8ff';
      ctx.fillRect(18, playerY, paddleW, paddleH);

      ctx.fillStyle = '#9b6cff';
      ctx.fillRect(el.width - 28, opponentY, paddleW, paddleH);

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d9e8ff';
      ctx.font = 'bold 30px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(leftScore, el.width / 2 - 55, 42);
      ctx.fillText(rightScore, el.width / 2 + 55, 42);
    }

    function update(dt) {
      if (up) playerY -= 280 * dt;
      if (down) playerY += 280 * dt;

      playerY = Math.max(0, Math.min(el.height - paddleH, playerY));

      const target = ball.y - paddleH / 2;
      opponentY += Math.sign(target - opponentY) *
        Math.min(Math.abs(target - opponentY), 180 * dt);

      opponentY = Math.max(0, Math.min(el.height - paddleH, opponentY));

      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      if (ball.y < ball.r || ball.y > el.height - ball.r) {
        ball.vy *= -1;
      }

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
        ball.x + ball.r > el.width - 28 &&
        ball.y > opponentY &&
        ball.y < opponentY + paddleH
      ) {
        ball.vx = -Math.abs(ball.vx) * 1.03;
        ball.vy += ((ball.y - (opponentY + paddleH / 2)) / (paddleH / 2)) * 55;
        ball.x = el.width - 29;
      }

      if (ball.x < -10) {
        rightScore++;
        resetBall(1);
      } else if (ball.x > el.width + 10) {
        leftScore++;
        addScore(1);
        resetBall(-1);
      }
    }

    register(keyboard((event, pressed) => {
      const key = event.key.toLowerCase();

      if (key === 'arrowup' || key === 'w') up = pressed;
      if (key === 'arrowdown' || key === 's') down = pressed;
    }));

    resetBall(Math.random() > 0.5 ? 1 : -1);

    register(loop(dt => {
      update(dt);
      draw();
    }));

    register(() => { up = down = false; });
  }

  /* 4. BRICK BREAKER */

  function gameBreakout() {
    const { canvas: el, ctx } = canvas(480, 420, 620);

    const columns = 8;
    const rows = 5;
    const brickW = 50;
    const brickH = 17;
    const gap = 5;
    const startX = 22;
    const startY = 38;

    let paddleX = 200;
    const paddleW = 86;
    const paddleH = 11;

    let ball;
    let bricks;
    let alive = true;
    let left = false;
    let right = false;

    function reset() {
      paddleX = (el.width - paddleW) / 2;

      ball = {
        x: el.width / 2,
        y: el.height - 65,
        vx: 155,
        vy: -190,
        r: 7
      };

      bricks = [];

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

      alive = true;
      setScore(0);
      setMessage('Break all the bricks without losing your ball.');
    }

    function draw() {
      ctx.fillStyle = '#030914';
      ctx.fillRect(0, 0, el.width, el.height);

      bricks.forEach(brick => {
        if (!brick.alive) return;

        ctx.fillStyle = brick.color;
        ctx.fillRect(brick.x, brick.y, brick.w, brick.h);
      });

      ctx.fillStyle = '#35e8ff';
      ctx.fillRect(paddleX, el.height - 32, paddleW, paddleH);

      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();
    }

    function update(dt) {
      if (!alive) return;

      if (left) paddleX -= 330 * dt;
      if (right) paddleX += 330 * dt;

      paddleX = Math.max(0, Math.min(el.width - paddleW, paddleX));

      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      if (ball.x < ball.r || ball.x > el.width - ball.r) ball.vx *= -1;
      if (ball.y < ball.r) ball.vy = Math.abs(ball.vy);

      const paddleY = el.height - 32;

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
        setMessage('You cleared every brick! Restart to play again.');
      } else if (ball.y > el.height + 15) {
        alive = false;
        setMessage('Ball lost! Restart to try again.');
      }
    }

    register(keyboard((event, pressed) => {
      const key = event.key.toLowerCase();

      if (key === 'arrowleft' || key === 'a') left = pressed;
      if (key === 'arrowright' || key === 'd') right = pressed;
    }));

    register(loop(dt => {
      update(dt);
      draw();
    }));

    reset();

    register(() => { left = right = false; });
  }

  /* 5. ENDLESS RUNNER */

  function gameRunner() {
    const { canvas: el, ctx } = canvas(520, 280, 700);

    const ground = 225;

    const player = {
      x: 70,
      y: ground - 35,
      w: 27,
      h: 35,
      vy: 0,
      jumping: false
    };

    let obstacles = [];
    let elapsed = 0;
    let spawn = 0;
    let distance = 0;
    let speed = 205;
    let alive = true;
    let jumpQueued = false;
    let scoreAccumulator = 0;

    function jump() {
      if (!alive) return;
      if (!player.jumping) {
        player.vy = -390;
        player.jumping = true;
      }
    }

    function draw() {
      ctx.fillStyle = '#030914';
      ctx.fillRect(0, 0, el.width, el.height);

      ctx.strokeStyle = '#152b43';

      for (let i = 0; i < 12; i++) {
        const x = i * 53 - (elapsed * speed * 0.4) % 53;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ground);
        ctx.stroke();
      }

      ctx.strokeStyle = '#35e8ff';
      ctx.beginPath();
      ctx.moveTo(0, ground);
      ctx.lineTo(el.width, ground);
      ctx.stroke();

      ctx.fillStyle = '#43f5a5';
      ctx.fillRect(player.x, player.y, player.w, player.h);

      ctx.fillStyle = '#ff6d9a';

      obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
      });

      ctx.fillStyle = '#d9e8ff';
      ctx.font = '13px system-ui';
      ctx.fillText('DISTANCE ' + distance, 12, 22);
    }

    function update(dt) {
      if (!alive) return;

      elapsed += dt;
      speed = Math.min(340, 205 + 2.2 * elapsed);

      scoreAccumulator += dt;

      if (scoreAccumulator >= 0.1) {
        const gained = Math.floor(scoreAccumulator * 10);
        distance += gained;
        scoreAccumulator -= gained / 10;
        setScore(distance);
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

      spawn -= dt;

      if (spawn <= 0) {
        const height = 22 + Math.random() * 24;

        obstacles.push({
          x: el.width + 10,
          y: ground - height,
          w: 18 + Math.random() * 12,
          h: height
        });

        spawn = 0.85 + Math.random() * 0.85;
      }

      obstacles.forEach(obstacle => {
        obstacle.x -= speed * dt;
      });

      obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.w > -5);

      for (const obstacle of obstacles) {
        if (
          player.x + player.w - 4 > obstacle.x &&
          player.x + 4 < obstacle.x + obstacle.w &&
          player.y + player.h - 3 > obstacle.y
        ) {
          alive = false;
          setMessage('Game over! Distance: ' + distance + '. Restart to try again.');
          break;
        }
      }
    }

    register(keyboard((event, pressed) => {
      if (!pressed) return;

      const key = event.key.toLowerCase();

      if (key === ' ' || key === 'arrowup' || key === 'w') {
        jumpQueued = true;
      }
    }));

    register(loop(dt => {
      update(dt);
      draw();
    }));

    register(() => { alive = false; });
  }

  /* 6. SPACE SHOOTER */

  function gameShooter() {
    const { canvas: el, ctx } = canvas(480, 400, 700);

    const player = { x: 240, y: 345, w: 28, h: 24 };

    let enemies = [];
    let bullets = [];
    let particles = [];
    let left = false;
    let right = false;
    let firing = false;
    let fireCooldown = 0;
    let spawnCooldown = 0;
    let elapsed = 0;
    let alive = true;
    let hull = 3;

    function shoot() {
      if (!alive || fireCooldown > 0) return;

      bullets.push({
        x: player.x,
        y: player.y - 15,
        vx: 0,
        vy: -390
      });

      fireCooldown = 0.16;
    }

    function burst(x, y, color) {
      for (let i = 0; i < 7; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 180,
          vy: (Math.random() - 0.5) * 180,
          life: 0.4 + Math.random() * 0.35,
          color
        });
      }
    }

    function draw() {
      ctx.fillStyle = '#030914';
      ctx.fillRect(0, 0, el.width, el.height);

      for (let i = 0; i < 65; i++) {
        const x = (79 * i) % el.width;
        const y = (113 * i + 30 * elapsed * 12) % el.height;

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

      ctx.fillStyle = '#f6fdff';
      ctx.shadowColor = '#35e8ff';

      bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - 2, bullet.y - 7, 4, 12);
      });

      particles.forEach(particle => {
        ctx.globalAlpha = Math.max(0, particle.life / 0.75);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 3, 3);
      });

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#e6efff';
      ctx.font = 'bold 13px system-ui';
      ctx.fillText('HULL ' + '♥'.repeat(hull), 12, 22);
    }

    function update(dt) {
      if (!alive) return;

      elapsed += dt;

      if (left) player.x -= 270 * dt;
      if (right) player.x += 270 * dt;

      player.x = Math.max(18, Math.min(el.width - 18, player.x));

      fireCooldown -= dt;
      if (firing) shoot();

      spawnCooldown -= dt;

      if (spawnCooldown <= 0) {
        enemies.push({
          x: 22 + Math.random() * (el.width - 44),
          y: -18,
          vy: 65 + Math.random() * 60 + elapsed * 0.5,
          dead: false
        });

        spawnCooldown = Math.max(0.35, 0.85 - elapsed * 0.008) +
          Math.random() * 0.3;
      }

      bullets.forEach(bullet => {
        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;
      });

      bullets = bullets.filter(bullet => bullet.y > -20);

      enemies.forEach(enemy => {
        enemy.y += enemy.vy * dt;

        if (
          Math.abs(enemy.x - player.x) < 22 &&
          Math.abs(enemy.y - player.y) < 25
        ) {
          enemy.dead = true;
          hull--;
          burst(enemy.x, enemy.y, '#ff6d9a');

          if (hull <= 0) {
            alive = false;
            setMessage('Ship destroyed! Score: ' + currentGame.score);
          }
        }

        bullets.forEach(bullet => {
          if (
            !enemy.dead &&
            !bullet.dead &&
            Math.abs(bullet.x - enemy.x) < 16 &&
            Math.abs(bullet.y - enemy.y) < 16
          ) {
            bullet.dead = true;
            enemy.dead = true;
            addScore(10);
            burst(enemy.x, enemy.y, '#35e8ff');
          }
        });

        if (enemy.y > el.height + 15 && !enemy.dead) {
          enemy.dead = true;
          hull--;

          if (hull <= 0) {
            alive = false;
            setMessage('Invaders broke through! Score: ' + currentGame.score);
          }
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

    register(keyboard((event, pressed) => {
      const key = event.key.toLowerCase();

      if (key === 'arrowleft' || key === 'a') left = pressed;
      if (key === 'arrowright' || key === 'd') right = pressed;

      if (key === ' ' || key === 'enter') {
        firing = pressed;
        if (pressed) shoot();
      }
    }));

    register(loop(dt => {
      update(dt);
      draw();
    }));

    register(() => {
      alive = false;
      left = right = firing = false;
    });
  }

  /* 7. MATH CHALLENGE */

  function gameMath() {
    const area = $('[data-game-area]');

    area.innerHTML = `
      <div class="nx-result" data-math-info>Answer correctly to earn points.</div>
      <div class="nx-question" data-question></div>
      <div class="nx-answer-grid" data-answers></div>
      <div class="nx-result" data-streak>Correct answers: 0</div>
    `;

    const question = $('[data-question]');
    const answers = $('[data-answers]');
    const info = $('[data-math-info]');
    const streak = $('[data-streak]');

    let answer = 0;
    let count = 0;
    let locked = false;
    let timer = null;

    function nextQuestion() {
      locked = false;
      info.textContent = 'Choose the correct answer.';

      const type = Math.floor(Math.random() * 4);
      let a = 1 + Math.floor(Math.random() * 20);
      let b = 1 + Math.floor(Math.random() * 20);
      let symbol = '+';

      if (type === 0) {
        answer = a + b;
      } else if (type === 1) {
        if (b > a) [a, b] = [b, a];
        answer = a - b;
        symbol = '−';
      } else if (type === 2) {
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

      question.textContent = `${a} ${symbol} ${b} = ?`;

      const options = new Set([answer]);

      while (options.size < 4) {
        const offset = Math.floor(Math.random() * 13) - 6;
        options.add(Math.max(0, answer + (offset || 1)));
      }

      answers.innerHTML = [...options]
        .sort(() => Math.random() - 0.5)
        .map((value, index) =>
          `<button class="nx-answer" data-answer="${value}">${index + 1}. ${value}</button>`
        ).join('');
    }

    function choose(value) {
      if (locked) return;
      locked = true;

      if (Number(value) === answer) {
        count++;
        addScore(10);
        info.textContent = 'Correct! +10 points.';
      } else {
        count = 0;
        info.textContent = 'Incorrect. The answer was ' + answer + '.';
      }

      streak.textContent = 'Correct answers: ' + count;

      $$('[data-answer]', answers).forEach(button => {
        button.disabled = true;
      });

      timer = setTimeout(nextQuestion, 650);
    }

    const click = event => {
      const button = event.target.closest('[data-answer]');
      if (button) choose(button.dataset.answer);
    };

    answers.addEventListener('click', click);

    register(keyboard((event, pressed) => {
      if (!pressed || !/^[1-4]$/.test(event.key)) return;

      const button = $$('[data-answer]', answers)[Number(event.key) - 1];

      if (button && !button.disabled) choose(button.dataset.answer);
    }));

    register(() => {
      clearTimeout(timer);
      answers.removeEventListener('click', click);
    });

    nextQuestion();
  }

  /* 8. ROCK PAPER SCISSORS */

  function gameRPS() {
    const area = $('[data-game-area]');

    area.innerHTML = `
      <div class="nx-result">Choose your move.</div>

      <div class="nx-rps-buttons" data-rps-buttons>
        <button class="nx-btn" data-rps="rock">✊ Rock</button>
        <button class="nx-btn" data-rps="paper">✋ Paper</button>
        <button class="nx-btn" data-rps="scissors">✌️ Scissors</button>
      </div>

      <div class="nx-question" data-rps-result>Ready?</div>
      <div class="nx-result" data-rps-score>Wins: 0 · Draws: 0 · Losses: 0</div>
    `;

    const result = $('[data-rps-result]');
    const score = $('[data-rps-score]');
    const buttons = $('[data-rps-buttons]');

    const choices = ['rock', 'paper', 'scissors'];
    const icons = { rock: '✊', paper: '✋', scissors: '✌️' };

    let wins = 0;
    let draws = 0;
    let losses = 0;

    function play(choice) {
      const computer = choices[Math.floor(Math.random() * 3)];

      let message;

      if (choice === computer) {
        draws++;
        message = 'Draw!';
      } else if (
        (choice === 'rock' && computer === 'scissors') ||
        (choice === 'paper' && computer === 'rock') ||
        (choice === 'scissors' && computer === 'paper')
      ) {
        wins++;
        addScore(1);
        message = 'You win!';
      } else {
        losses++;
        message = 'Computer wins!';
      }

      result.textContent = `${icons[choice]} vs ${icons[computer]} — ${message}`;
      score.textContent = `Wins: ${wins} · Draws: ${draws} · Losses: ${losses}`;
    }

    const click = event => {
      const button = event.target.closest('[data-rps]');
      if (button) play(button.dataset.rps);
    };

    buttons.addEventListener('click', click);

    register(keyboard((event, pressed) => {
      if (!pressed) return;

      const keyMap = {
        r: 'rock',
        p: 'paper',
        s: 'scissors'
      };

      if (keyMap[event.key.toLowerCase()]) {
        play(keyMap[event.key.toLowerCase()]);
      }
    }));

    register(() => buttons.removeEventListener('click', click));
  }

  /* 9. HANGMAN */

  function gameHangman() {
    const words = [
      'GALAXY', 'PLANET', 'ROCKET', 'JUNGLE', 'PUZZLE',
      'ARCADE', 'NEXORA', 'GAMING', 'NEBULA', 'PYTHON',
      'COMPUTER', 'RAINBOW', 'DIAMOND', 'OCEAN', 'FUTURE'
    ];

    const word = words[Math.floor(Math.random() * words.length)];
    const guessed = new Set();

    let mistakes = 0;
    const maxMistakes = 6;
    let finished = false;

    const area = $('[data-game-area]');

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

    const wordEl = $('[data-hangman-word]');
    const drawing = $('[data-hangman-drawing]');
    const status = $('[data-hangman-status]');
    const letters = $('[data-hangman-letters]');

    const stages = ['○', '◔', '◑', '◕', '◉', '☠', '✖'];

    function render() {
      wordEl.textContent = word.split('').map(letter =>
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

    const click = event => {
      const button = event.target.closest('[data-letter]');
      if (button) guess(button.dataset.letter);
    };

    letters.addEventListener('click', click);

    register(keyboard((event, pressed) => {
      if (pressed && /^[a-z]$/i.test(event.key)) {
        guess(event.key.toUpperCase());
      }
    }));

    register(() => letters.removeEventListener('click', click));

    render();
  }

  /* 10. FLAPPY FLYER */

  function gameFlappy() {
    const { canvas: el, ctx } = canvas(360, 480, 500);

    const bird = { x: 82, y: 210, vy: 0, r: 12 };

    let pipes = [];
    let alive = true;
    let started = false;
    let flapQueued = false;
    let spawnTimer = 0;
    let score = 0;

    const gravity = 900;
    const flapVelocity = -300;
    const pipeWidth = 54;
    const gap = 145;

    function flap() {
      if (!alive) return;

      started = true;
      bird.vy = flapVelocity;
    }

    function draw() {
      ctx.fillStyle = '#071226';
      ctx.fillRect(0, 0, el.width, el.height);

      for (let i = 0; i < 28; i++) {
        const x = (37 * i) % el.width;
        const y = (71 * i) % el.height;

        ctx.fillStyle = '#213957';
        ctx.fillRect(x, y, 2, 2);
      }

      pipes.forEach(pipe => {
        ctx.fillStyle = '#43f5a5';

        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        ctx.fillRect(
          pipe.x,
          pipe.top + gap,
          pipeWidth,
          el.height - pipe.top - gap
        );

        ctx.fillStyle = '#1bbf88';
        ctx.fillRect(pipe.x - 4, pipe.top - 10, pipeWidth + 8, 10);
        ctx.fillRect(pipe.x - 4, pipe.top + gap, pipeWidth + 8, 10);
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
      ctx.fillText('SCORE ' + score, el.width / 2, 30);

      if (!started && alive) {
        ctx.fillStyle = '#fff';
        ctx.fillText('TAP FLAP TO START', el.width / 2, el.height / 2 + 65);
      }
    }

    function update(dt) {
      if (!alive) return;

      if (flapQueued) {
        flapQueued = false;
        flap();
      }

      if (!started) return;

      bird.vy += gravity * dt;
      bird.y += bird.vy * dt;

      spawnTimer -= dt;

      if (spawnTimer <= 0) {
        const maxTop = el.height - gap - 55;
        const top = 35 + Math.random() * Math.max(10, maxTop - 35);

        pipes.push({
          x: el.width + 5,
          top,
          scored: false
        });

        spawnTimer = 1.35;
      }

      pipes.forEach(pipe => {
        pipe.x -= 145 * dt;

        if (!pipe.scored && pipe.x + pipeWidth < bird.x) {
          pipe.scored = true;
          score++;
          setScore(score);
        }

        const horizontal =
          bird.x + bird.r > pipe.x &&
          bird.x - bird.r < pipe.x + pipeWidth;

        const vertical =
          bird.y - bird.r < pipe.top ||
          bird.y + bird.r > pipe.top + gap;

        if (horizontal && vertical) {
          alive = false;
          setMessage('You hit a pipe! Score: ' + score + '. Restart to try again.');
        }
      });

      pipes = pipes.filter(pipe => pipe.x + pipeWidth > -5);

      if (bird.y - bird.r < 0 || bird.y + bird.r > el.height) {
        alive = false;
        setMessage('Flight ended! Score: ' + score + '. Restart to try again.');
      }
    }

    register(keyboard((event, pressed) => {
      if (!pressed) return;

      const key = event.key.toLowerCase();

      if (key === ' ' || key === 'arrowup' || key === 'w') {
        flapQueued = true;
      }
    }));

    const canvasTap = () => {
      flapQueued = true;
    };

    el.addEventListener('pointerdown', canvasTap);

    register(() => el.removeEventListener('pointerdown', canvasTap));

    register(loop(dt => {
      update(dt);
      draw();
    }));

    register(() => { alive = false; });
  }

  installStyles();
  renderHome();
})();