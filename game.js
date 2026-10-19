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

  let scores = {};
  try {
    scores = JSON.parse(localStorage.getItem(SCORE_KEY) || '{}') || {};
  } catch (_) {}

  let cleanupCurrent = () => {};
  let generation = 0;
  let activeGame = null;

  const $ = (selector, scope = root) => scope.querySelector(selector);
  const $$ = (selector, scope = root) => [...scope.querySelectorAll(selector)];
  
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));

  const best = id => Number(scores[id] || 0);

  function saveScores() {
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
    } catch (_) {}
  }

  function addStyles() {
    if (document.getElementById('nexora-arcade-styles')) return;
    const style = document.createElement('style');
    style.id = 'nexora-arcade-styles';
    style.textContent = `
      #nexora-games {
        --bg: #050914;
        --panel: #0b1425;
        --panel2: #101d32;
        --line: #223651;
        --text: #f2f7ff;
        --muted: #91a4bf;
        --cyan: #35e8ff;
        --purple: #9b6cff;
        --green: #43f5a5;
        color: var(--text);
        background: var(--bg);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        min-height: 60vh;
        padding: 8px;
        overflow: hidden;
      }
      #nexora-games * {
        box-sizing: border-box;
      }
      #nexora-games button {
        font: inherit;
        -webkit-tap-highlight-color: transparent;
      }
      #nexora-games .nx-shell {
        width: min(100%, 960px);
        margin: 0 auto;
      }
      #nexora-games .nx-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 10px;
      }
      #nexora-games .nx-brand {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      #nexora-games .nx-logo {
        width: 36px;
        height: 36px;
        display: grid;
        place-items: center;
        border: 1px solid #27637c;
        border-radius: 10px;
        color: var(--cyan);
        font-size: 20px;
        font-weight: 900;
        background: linear-gradient(135deg, #102b42, #161332);
        box-shadow: 0 0 16px #35e8ff19;
      }
      #nexora-games .nx-brand h1 {
        font-size: clamp(15px, 3.5vw, 20px);
        line-height: 1.1;
        margin: 0;
        letter-spacing: .5px;
      }
      #nexora-games .nx-brand p {
        margin: 2px 0 0;
        color: var(--muted);
        font-size: 10px;
      }
      #nexora-games .nx-btn {
        border: 1px solid var(--line);
        color: var(--text);
        background: var(--panel2);
        border-radius: 9px;
        padding: 6px 10px;
        min-height: 34px;
        cursor: pointer;
        transition: transform .12s, border-color .12s;
      }
      #nexora-games .nx-btn:active {
        transform: scale(.97);
      }
      #nexora-games .nx-btn-primary {
        color: #001019;
        font-weight: 900;
        background: var(--cyan);
        border-color: var(--cyan);
      }
      #nexora-games .nx-title {
        font-size: 15px;
        margin: 10px 0 8px;
      }
      #nexora-games .nx-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }
      #nexora-games .nx-card {
        text-align: left;
        padding: 10px;
        border: 1px solid var(--line);
        border-radius: 12px;
        background: linear-gradient(145deg, var(--panel), #080f1e);
        color: var(--text);
        min-width: 0;
        cursor: pointer;
      }
      #nexora-games .nx-card:hover {
        border-color: #2684a5;
      }
      #nexora-games .nx-card-icon {
        font-size: 22px;
        display: block;
        margin-bottom: 6px;
      }
      #nexora-games .nx-card-title {
        font-size: 13px;
        font-weight: 800;
        display: block;
      }
      #nexora-games .nx-card-description {
        color: var(--muted);
        font-size: 11px;
        display: block;
        margin-top: 4px;
        line-height: 1.3;
      }
      #nexora-games .nx-card-best {
        display: block;
        color: var(--cyan);
        font-size: 10px;
        margin-top: 6px;
      }
      #nexora-games .nx-panel {
        border: 1px solid var(--line);
        background: var(--panel);
        border-radius: 14px;
        overflow: hidden;
      }
      #nexora-games .nx-game-top {
        padding: 8px 12px;
        border-bottom: 1px solid var(--line);
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 6px;
      }
      #nexora-games .nx-game-heading {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      #nexora-games .nx-game-heading h2 {
        font-size: clamp(16px, 3.5vw, 21px);
        margin: 0;
      }
      #nexora-games .nx-game-heading p {
        font-size: 11px;
        color: var(--muted);
        margin: 2px 0 0;
      }
      #nexora-games .nx-stats {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      #nexora-games .nx-stat {
        padding: 4px 8px;
        border: 1px solid var(--line);
        border-radius: 8px;
        background: #060d19;
        font-size: 11px;
        white-space: nowrap;
      }
      #nexora-games .nx-stat strong {
        color: var(--cyan);
      }
      #nexora-games .nx-game-area {
        padding: 8px;
        min-height: 150px;
      }
      #nexora-games .nx-canvas-wrap {
        width: 100%;
        max-width: 380px;
        margin: 0 auto;
      }
      #nexora-games canvas {
        display: block;
        width: 100%;
        height: auto;
        max-height: 240px;
        border-radius: 10px;
        background: #030914;
        border: 1px solid #1b3854;
        touch-action: none;
      }
      #nexora-games .nx-message {
        text-align: center;
        min-height: 18px;
        padding: 2px 8px 6px;
        color: var(--cyan);
        font-size: 11px;
      }
      #nexora-games .nx-controls {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 6px;
        padding: 6px;
      }
      #nexora-games .nx-controller {
        padding: 8px 10px;
        border-top: 1px solid #18334d;
        background: linear-gradient(180deg, #071326, #040a16);
      }
      #nexora-games .nx-controller-title {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 8px;
        color: #a7c8ed;
        font-size: 10px;
        font-weight: 900;
        letter-spacing: 1.5px;
        margin-bottom: 6px;
        text-align: center;
      }
      #nexora-games .nx-controller-title:before,
      #nexora-games .nx-controller-title:after {
        content: "";
        height: 1px;
        flex: 1;
        max-width: 80px;
        background: linear-gradient(90deg, transparent, var(--cyan));
      }
      #nexora-games .nx-controller-title:after {
        background: linear-gradient(90deg, var(--cyan), transparent);
      }
      #nexora-games .nx-controller-layout {
        display: grid;
        grid-template-columns: minmax(60px, .6fr) minmax(130px, 1.4fr) minmax(60px, .6fr);
        align-items: center;
        gap: 8px;
        max-width: 750px;
        margin: auto;
      }
      #nexora-games .nx-instructions,
      #nexora-games .nx-pad-status {
        min-width: 0;
        padding: 6px 8px;
        border: 1px solid #17466b;
        border-radius: 10px;
        background: #07182c;
        color: #a9c9ed;
        font-size: 10px;
        line-height: 1.4;
      }
      #nexora-games .nx-instructions .nx-hand {
        display: block;
        font-size: 18px;
        margin-bottom: 2px;
      }
      #nexora-games .nx-pad-status strong {
        display: block;
        color: #9bc9ff;
        margin-bottom: 2px;
        font-size: 10px;
      }
      #nexora-games .nx-ready {
        color: var(--green);
        font-weight: 800;
      }
      #nexora-games .nx-pad {
        position: relative;
        height: 100px;
        width: 100%;
        border: 2px solid #087ca5;
        border-radius: 14px;
        background: linear-gradient(90deg, transparent 49.6%, #1681a744 50%, transparent 50.5%),
                    linear-gradient(transparent 49.6%, #1681a744 50%, transparent 50.5%),
                    radial-gradient(ellipse at center, #123c5c, #071a30 75%);
        box-shadow: 0 0 0 2px #00d9ff12, 0 0 10px #00cfff22, inset 0 0 12px #00cfff14;
        overflow: hidden;
        touch-action: none;
        user-select: none;
        -webkit-user-select: none;
        cursor: crosshair;
      }
      #nexora-games .nx-pad:before {
        content: "";
        position: absolute;
        inset: 6px;
        border: 1px solid #42caff22;
        border-radius: 8px;
        pointer-events: none;
      }
      #nexora-games .nx-pad.nx-pad-active {
        border-color: var(--cyan);
        box-shadow: 0 0 0 2px #00d9ff20, 0 0 15px #00cfff55, inset 0 0 15px #00cfff24;
      }
      #nexora-games .nx-pad-knob {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 36px;
        height: 36px;
        border: 2px solid #25e7ff;
        border-radius: 50%;
        background: radial-gradient(circle, #35e8ff 0 22%, #087fa7 27%, #063554 70%);
        box-shadow: 0 0 0 6px #00d9ff19, 0 0 12px #00d9ff88;
        transform: translate(-50%, -50%);
        pointer-events: none;
      }
      #nexora-games .nx-board {
        display: grid;
        gap: 6px;
        max-width: 260px;
        margin: 6px auto;
      }
      #nexora-games .nx-ttt-board {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        width: min(100%, 250px);
      }
      #nexora-games .nx-cell {
        aspect-ratio: 1;
        border: 1px solid #2a415e;
        border-radius: 10px;
        background: #0c192a;
        color: var(--cyan);
        font-size: clamp(22px, 6vw, 36px);
        font-weight: 900;
        cursor: pointer;
      }
      #nexora-games .nx-cell.nx-o {
        color: var(--purple);
      }
      #nexora-games .nx-result {
        font-size: 11px;
        color: var(--muted);
        text-align: center;
        min-height: 18px;
      }
      #nexora-games .nx-question {
        font-size: clamp(20px, 6vw, 32px);
        font-weight: 900;
        text-align: center;
        margin: 10px 0;
        color: var(--cyan);
      }
      #nexora-games .nx-answer-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
        max-width: 380px;
        margin: 10px auto;
      }
      #nexora-games .nx-answer {
        padding: 10px 8px;
        border: 1px solid var(--line);
        border-radius: 10px;
        color: var(--text);
        background: #0c192a;
        font-weight: 800;
        cursor: pointer;
      }
      #nexora-games .nx-rps-buttons {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;
        margin: 10px auto;
      }
      #nexora-games .nx-word {
        text-align: center;
        font-size: clamp(18px, 5vw, 26px);
        letter-spacing: 5px;
        margin: 10px 0;
        font-weight: 900;
        overflow-wrap: anywhere;
      }
      #nexora-games .nx-letter-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 4px;
        max-width: 360px;
        margin: 8px auto;
      }
      #nexora-games .nx-letter {
        min-height: 30px;
        border: 1px solid var(--line);
        border-radius: 6px;
        background: #0d192b;
        color: var(--text);
        cursor: pointer;
        font-weight: 800;
        font-size: 11px;
      }
      #nexora-games .nx-letter:disabled {
        opacity: .3;
        cursor: default;
      }
      #nexora-games .nx-footer {
        text-align: center;
        color: #60758f;
        font-size: 10px;
        padding: 8px 0 2px;
      }
      @media(max-width: 480px) {
        #nexora-games .nx-controller-layout { grid-template-columns: 1fr; gap: 6px; }
        #nexora-games .nx-instructions { text-align: center; padding: 4px 8px; }
        #nexora-games .nx-instructions .nx-hand { display: inline; margin-right: 6px; font-size: 14px; }
        #nexora-games .nx-pad-status { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 4px 8px; }
        #nexora-games .nx-pad-status strong { margin: 0; }
        #nexora-games .nx-pad { height: 95px; }
      }
    `;
    document.head.appendChild(style);
  }

  function stopCurrent() {
    generation++;
    try {
      cleanupCurrent();
    } catch (error) {
      console.warn('Arcade cleanup:', error);
    }
    cleanupCurrent = () => {};
    activeGame = null;
  }

  function showHome() {
    stopCurrent();
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
          <button class="nx-btn" data-action="refresh">↻ Refresh</button>
        </header>
        <h2 class="nx-title">Choose Your Game</h2>
        <div class="nx-grid">
          ${games.map(game => `
            <button class="nx-card" data-open="${game.id}">
              <span class="nx-card-icon">${game.icon}</span>
              <span class="nx-card-title">${escapeHTML(game.name)}</span>
              <span class="nx-card-description">${escapeHTML(game.description)}</span>
              <span class="nx-card-best">BEST: ${best(game.id)}</span>
            </button>
          `).join('')}
        </div>
        <footer class="nx-footer">REXWEB NEXORA · YOUR DIGITAL WORLD</footer>
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

    stopCurrent();
    activeGame = id;
    const thisGeneration = generation;
    let score = 0;

    root.innerHTML = `
      <div class="nx-shell">
        <header class="nx-header">
          <div class="nx-brand">
            <div class="nx-logo">N</div>
            <div>
              <h1>REXWEB NEXORA</h1>
              <p>ARCADE UNIVERSE</p>
            </div>
          </div>
          <button class="nx-btn" data-action="home">← Back</button>
        </header>
        <section class="nx-panel">
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
              <div class="nx-stat">BEST: <strong data-best>${best(id)}</strong></div>
            </div>
          </div>
          <div class="nx-game-area" data-game-area></div>
          <div class="nx-message" data-message aria-live="polite"></div>
          <section class="nx-controller">
            <div class="nx-controller-title">TOUCH CONTROLLER</div>
            <div class="nx-controller-layout">
              <div class="nx-instructions">
                <span class="nx-hand">☝️</span>
                <span data-instructions>Drag to move</span>
              </div>
              <div class="nx-pad" data-pad aria-label="Virtual touchpad. Drag to move and tap to act.">
                <div class="nx-pad-knob" data-knob></div>
              </div>
              <div class="nx-pad-status">
                <div>
                  <strong>PAD STATUS</strong>
                  <span class="nx-ready" data-pad-state>● Ready</span>
                </div>
                <div>
                  X: <span data-pad-x>0.50</span><br>
                  Y: <span data-pad-y>0.50</span>
                </div>
              </div>
            </div>
          </section>
          <div class="nx-controls">
            <button class="nx-btn nx-btn-primary" data-action="restart">↻ Restart</button>
            <button class="nx-btn" data-action="home">▦ All Games</button>
          </div>
        </section>
        <footer class="nx-footer">REXWEB NEXORA</footer>
      </div>
    `;

    const area = $('[data-game-area]');
    const message = $('[data-message]');
    const scoreLabel = $('[data-score]');
    const bestLabel = $('[data-best]');
    const pad = $('[data-pad]');
    const knob = $('[data-knob]');
    const padState = $('[data-pad-state]');
    const padX = $('[data-pad-x]');
    const padY = $('[data-pad-y]');
    const instructions = $('[data-instructions]');

    $('[data-action="home"]').addEventListener('click', showHome);
    $('[data-action="restart"]').addEventListener('click', () => {
      if (activeGame === id) openGame(id);
    });

    function setMessage(text) {
      if (message && message.isConnected) message.textContent = text || '';
    }

    function setScore(value) {
      score = Math.max(0, Math.floor(Number(value) || 0));
      scoreLabel.textContent = score;
      if (score > best(id)) {
        scores[id] = score;
        saveScores();
      }
      bestLabel.textContent = best(id);
    }

    function addScore(amount = 1) {
      setScore(score + amount);
    }

    function makeCanvas(width, height) {
      const wrap = document.createElement('div');
      wrap.className = 'nx-canvas-wrap';
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.setAttribute('aria-label', `${game.name} game area`);
      wrap.appendChild(canvas);
      area.appendChild(wrap);
      return { canvas, ctx: canvas.getContext('2d') };
    }

    const controller = {
      x: 0,
      y: 0,
      active: false,
      fire: false,
      jump: false,
      left: false,
      right: false,
      up: false,
      down: false,
      tap: false,
      keys: new Set()
    };

    const localCleanups = [];
    let animationFrame = 0;
    let intervalIds = [];
    let timeoutIds = [];
    let lastTime = 0;

    function listen(target, event, handler, options) {
      target.addEventListener(event, handler, options);
      localCleanups.push(() => target.removeEventListener(event, handler, options));
    }

    function timeout(callback, ms) {
      const timer = setTimeout(() => {
        timeoutIds = timeoutIds.filter(item => item !== timer);
        if (thisGeneration === generation && activeGame === id) callback();
      }, ms);
      timeoutIds.push(timer);
      return timer;
    }

    function frame(callback) {
      let alive = true;
      const tick = time => {
        if (!alive || thisGeneration !== generation || activeGame !== id) return;
        const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.04) : 0;
        lastTime = time;
        callback(dt, time);
        animationFrame = requestAnimationFrame(tick);
      };
      animationFrame = requestAnimationFrame(tick);
      return () => {
        alive = false;
        cancelAnimationFrame(animationFrame);
      };
    }

    function setInstructions(text) {
      instructions.textContent = text;
    }

    function updatePadDisplay() {
      knob.style.left = `${50 + controller.x * 40}%`;
      knob.style.top = `${50 + controller.y * 40}%`;
      padX.textContent = (0.5 + controller.x / 2).toFixed(2);
      padY.textContent = (0.5 + controller.y / 2).toFixed(2);
      padState.textContent = controller.active ? '● Active' : '● Ready';
      padState.style.color = controller.active ? '#35e8ff' : '#43f5a5';
      pad.classList.toggle('nx-pad-active', controller.active);
    }

    function resetPad() {
      controller.x = 0;
      controller.y = 0;
      controller.active = false;
      controller.left = false;
      controller.right = false;
      controller.up = false;
      controller.down = false;
      updatePadDisplay();
    }

    function updateFromPointer(event) {
      const rect = pad.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      controller.x = Math.max(-1, Math.min(1, (nx - 0.5) * 2));
      controller.y = Math.max(-1, Math.min(1, (ny - 0.5) * 2));
      controller.left = controller.x < -0.18;
      controller.right = controller.x > 0.18;
      controller.up = controller.y < -0.18;
      controller.down = controller.y > 0.18;
      controller.active = true;
      updatePadDisplay();
    }

    let pointerId = null;

    listen(pad, 'pointerdown', event => {
      event.preventDefault();
      pointerId = event.pointerId;
      try {
        pad.setPointerCapture(event.pointerId);
      } catch (_) {}
      updateFromPointer(event);
      if (id === 'shooter') {
        controller.fire = true;
      } else if (id === 'flappy' || id === 'runner') {
        controller.jump = true;
      } else if (id === 'snake') {
        steerSnakeFromVector(controller.x, controller.y);
      } else if (id === 'ttt') {
        handleBoardTap(event);
      } else if (id === 'math') {
        handleMathTap(event);
      } else if (id === 'rps') {
        handleRpsTap(event);
      } else if (id === 'hangman') {
        handleHangmanTap(event);
      } else {
        controller.tap = true;
      }
    });

    listen(pad, 'pointermove', event => {
      if (event.pointerId !== pointerId) return;
      event.preventDefault();
      updateFromPointer(event);
      if (id === 'snake') {
        steerSnakeFromVector(controller.x, controller.y);
      }
      if (id === 'shooter') {
        controller.fire = true;
      }
    });

    function endPointer(event) {
      if (pointerId !== null && event.pointerId !== pointerId) return;
      pointerId = null;
      resetPad();
      controller.fire = false;
      controller.jump = false;
    }

    listen(pad, 'pointerup', endPointer);
    listen(pad, 'pointercancel', endPointer);
    listen(pad, 'lostpointercapture', endPointer);
    listen(pad, 'contextmenu', event => event.preventDefault());

    listen(window, 'keydown', event => {
      if (thisGeneration !== generation) return;
      const key = event.key.toLowerCase();
      controller.keys.add(key);
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) {
        event.preventDefault();
      }
      controller.left = controller.keys.has('arrowleft') || controller.keys.has('a');
      controller.right = controller.keys.has('arrowright') || controller.keys.has('d');
      controller.up = controller.keys.has('arrowup') || controller.keys.has('w');
      controller.down = controller.keys.has('arrowdown') || controller.keys.has('s');

      if (key === ' ' || key === 'arrowup' || key === 'w') {
        if (id === 'runner' || id === 'flappy') controller.jump = true;
        if (id === 'shooter') controller.fire = true;
      }

      if (id === 'snake') {
        if (controller.up) steerSnakeFromVector(0, -1);
        else if (controller.down) steerSnakeFromVector(0, 1);
        else if (controller.left) steerSnakeFromVector(-1, 0);
        else if (controller.right) steerSnakeFromVector(1, 0);
      }

      if (id === 'math' && /^[1-4]$/.test(key)) {
        chooseMathAnswer(Number(key) - 1);
      }

      if (id === 'hangman' && /^[a-z]$/.test(key)) {
        guessLetter(key.toUpperCase());
      }

      if (id === 'rps') {
        if (key === 'r') playRps('rock');
        if (key === 'p') playRps('paper');
        if (key === 's') playRps('scissors');
      }
    });

    listen(window, 'keyup', event => {
      controller.keys.delete(event.key.toLowerCase());
      controller.left = controller.keys.has('arrowleft') || controller.keys.has('a');
      controller.right = controller.keys.has('arrowright') || controller.keys.has('d');
      controller.up = controller.keys.has('arrowup') || controller.keys.has('w');
      controller.down = controller.keys.has('arrowdown') || controller.keys.has('s');

      if (event.key === ' ' || event.key === 'ArrowUp' || event.key.toLowerCase() === 'w') {
        controller.jump = false;
        controller.fire = false;
      }
    });

    let snakeDirection = { x: 1, y: 0 };
    let snakeNextDirection = { x: 1, y: 0 };

    function steerSnakeFromVector(x, y) {
      if (Math.abs(x) > Math.abs(y)) {
        if (x > 0.18) snakeNextDirection = { x: 1, y: 0 };
        if (x < -0.18) snakeNextDirection = { x: -1, y: 0 };
      } else {
        if (y > 0.18) snakeNextDirection = { x: 0, y: 1 };
        if (y < -0.18) snakeNextDirection = { x: 0, y: -1 };
      }
    }

    let boardTapHandler = null;
    let mathTapHandler = null;
    let rpsTapHandler = null;
    let hangmanTapHandler = null;

    function handleBoardTap(event) { if (boardTapHandler) boardTapHandler(event); }
    function handleMathTap(event) { if (mathTapHandler) mathTapHandler(event); }
    function handleRpsTap(event) { if (rpsTapHandler) rpsTapHandler(event); }
    function handleHangmanTap(event) { if (hangmanTapHandler) hangmanTapHandler(event); }

    function makeGame() {
      switch (id) {
        case 'snake': return gameSnake();
        case 'ttt': return gameTicTacToe();
        case 'pong': return gamePong();
        case 'breakout': return gameBreakout();
        case 'runner': return gameRunner();
        case 'shooter': return gameShooter();
        case 'math': return gameMath();
        case 'rps': return gameRPS();
        case 'hangman': return gameHangman();
        case 'flappy': return gameFlappy();
        default:
          area.textContent = 'Game unavailable.';
          return () => {};
      }
    }

    function gameSnake() {
      setInstructions('Drag pad to steer');
      const { canvas, ctx } = makeCanvas(300, 300);
      const size = 15;
      const grid = 20;
      let snake = [{ x: 9, y: 10 }, { x: 8, y: 10 }, { x: 7, y: 10 }];
      let food = { x: 14, y: 10 };
      let alive = true;
      let elapsed = 0;

      function placeFood() {
        for (let i = 0; i < 500; i++) {
          const candidate = {
            x: Math.floor(Math.random() * grid),
            y: Math.floor(Math.random() * grid)
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
        for (let i = 0; i <= grid; i++) {
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
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(food.x * size + size / 2, food.y * size + size / 2, size * 0.34, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        snake.forEach((part, index) => {
          ctx.fillStyle = index === 0 ? '#66ffd0' : '#1bc995';
          ctx.fillRect(part.x * size + 1, part.y * size + 1, size - 2, size - 2);
        });
      }

      function step() {
        if (!alive) return;
        steerSnakeFromVector(controller.x, controller.y);
        const next = snakeNextDirection;
        if (!(next.x === -snakeDirection.x && next.y === -snakeDirection.y)) {
          snakeDirection = { ...next };
        }
        const head = {
          x: snake[0].x + snakeDirection.x,
          y: snake[0].y + snakeDirection.y
        };
        if (
          head.x < 0 || head.y < 0 || head.x >= grid || head.y >= grid ||
          snake.some((part, index) => index > 0 && part.x === head.x && part.y === head.y)
        ) {
          alive = false;
          setMessage('Game over! Tap Restart.');
          return;
        }
        snake.unshift(head);
        if (head.x === food.x && head.y === food.y) {
          addScore(10);
          placeFood();
        } else {
          snake.pop();
        }
        draw();
      }

      const stop = frame(dt => {
        elapsed += dt;
        if (elapsed >= 0.12) {
          elapsed = 0;
          step();
        }
      });
      draw();
      return () => stop();
    }

    function gameTicTacToe() {
      setInstructions('Tap cells to play');
      const status = document.createElement('div');
      status.className = 'nx-result';
      status.textContent = 'Your turn — you are X.';

      const board = document.createElement('div');
      board.className = 'nx-board nx-ttt-board';
      board.innerHTML = Array.from({ length: 9 }, (_, index) => `
        <button class="nx-cell" data-cell="${index}" aria-label="Square ${index + 1}"></button>
      `).join('');

      area.append(status, board);
      const cells = $$('.nx-cell', board);
      const state = Array(9).fill('');
      const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];
      let ended = false;
      let computerTimer = null;

      function winner() {
        for (const line of wins) {
          const [a, b, c] = line;
          if (state[a] && state[a] === state[b] && state[a] === state[c]) {
            return state[a];
          }
        }
        return state.every(Boolean) ? 'draw' : null;
      }

      function render() {
        cells.forEach((cell, index) => {
          cell.textContent = state[index];
          cell.disabled = ended || Boolean(state[index]);
          cell.classList.toggle('nx-o', state[index] === 'O');
        });
      }

      function finish() {
        const result = winner();
        if (!result) return false;
        ended = true;
        render();
        if (result === 'X') {
          addScore(1);
          status.textContent = 'You win! +1 point.';
        } else if (result === 'O') {
          status.textContent = 'Computer wins.';
        } else {
          status.textContent = 'It is a draw.';
        }
        return true;
      }

      function findWinningMove(mark) {
        for (let i = 0; i < 9; i++) {
          if (state[i]) continue;
          state[i] = mark;
          const winsNow = winner() === mark;
          state[i] = '';
          if (winsNow) return i;
        }
        return -1;
      }

      function computerMove() {
        if (ended) return;
        let move = findWinningMove('O');
        if (move < 0) move = findWinningMove('X');
        if (move < 0 && !state[4]) move = 4;
        if (move < 0) {
          const corners = [0, 2, 6, 8].filter(index => !state[index]);
          if (corners.length) {
            move = corners[Math.floor(Math.random() * corners.length)];
          }
        }
        if (move < 0) {
          const empty = state.map((value, index) => value ? -1 : index).filter(index => index >= 0);
          if (empty.length) move = empty[Math.floor(Math.random() * empty.length)];
        }
        if (move >= 0) state[move] = 'O';
        render();
        if (!finish()) status.textContent = 'Your turn — you are X.';
      }

      function play(index) {
        if (ended || state[index]) return;
        state[index] = 'X';
        render();
        if (finish()) return;
        status.textContent = 'Computer thinking…';
        computerTimer = timeout(computerMove, 300);
      }

      listen(board, 'click', event => {
        const cell = event.target.closest('[data-cell]');
        if (cell) play(Number(cell.dataset.cell));
      });

      boardTapHandler = event => {
        if (ended) return;
        const rect = pad.getBoundingClientRect();
        const index = Math.min(8, Math.max(0,
          Math.floor(((event.clientY - rect.top) / rect.height) * 3) * 3 +
          Math.floor(((event.clientX - rect.left) / rect.width) * 3)
        ));
        play(index);
      };

      render();
      return () => {
        if (computerTimer) clearTimeout(computerTimer);
        boardTapHandler = null;
      };
    }

    function gamePong() {
      setInstructions('Drag pad up and down');
      const { canvas, ctx } = makeCanvas(400, 240);
      let playerY = 90;
      let enemyY = 90;
      const paddleWidth = 8;
      const paddleHeight = 55;
      let ball = { x: 200, y: 120, vx: 180, vy: Math.random() * 100 - 50, r: 6 };

      function resetBall(direction) {
        ball = {
          x: canvas.width / 2,
          y: canvas.height / 2,
          vx: 180 * direction,
          vy: Math.random() * 100 - 50,
          r: 6
        };
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#1d3550';
        ctx.setLineDash([5, 7]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#35e8ff';
        ctx.fillRect(14, playerY, paddleWidth, paddleHeight);
        ctx.fillStyle = '#9b6cff';
        ctx.fillRect(canvas.width - 22, enemyY, paddleWidth, paddleHeight);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#d9e8ff';
        ctx.font = 'bold 24px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(score, canvas.width / 2 - 40, 32);
      }

      const stop = frame(dt => {
        const movement = controller.y * 260;
        playerY += movement * dt;
        playerY = Math.max(0, Math.min(canvas.height - paddleHeight, playerY));

        const enemyTarget = ball.y - paddleHeight / 2;
        enemyY += Math.sign(enemyTarget - enemyY) * Math.min(Math.abs(enemyTarget - enemyY), 160 * dt);
        enemyY = Math.max(0, Math.min(canvas.height - paddleHeight, enemyY));

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        if (ball.y < ball.r || ball.y > canvas.height - ball.r) {
          ball.vy *= -1;
        }

        if (
          ball.vx < 0 && ball.x - ball.r < 22 &&
          ball.y >= playerY && ball.y <= playerY + paddleHeight
        ) {
          ball.vx = Math.abs(ball.vx) * 1.035;
          ball.vy += (ball.y - (playerY + paddleHeight / 2)) / (paddleHeight / 2) * 50;
          ball.x = 23;
        }

        if (
          ball.vx > 0 && ball.x + ball.r > canvas.width - 22 &&
          ball.y >= enemyY && ball.y <= enemyY + paddleHeight
        ) {
          ball.vx = -Math.abs(ball.vx) * 1.02;
          ball.vy += (ball.y - (enemyY + paddleHeight / 2)) / (paddleHeight / 2) * 40;
          ball.x = canvas.width - 23;
        }

        if (ball.x < -10) {
          resetBall(1);
        } else if (ball.x > canvas.width + 10) {
          addScore(1);
          resetBall(-1);
        }

        draw();
      });

      return () => stop();
    }

    function gameBreakout() {
      setInstructions('Drag left or right');
      const { canvas, ctx } = makeCanvas(380, 300);
      const cols = 8;
      const rows = 4;
      const brickW = 40;
      const brickH = 14;
      const gap = 4;
      const startX = 18;
      const startY = 30;
      let paddleX = 150;
      const paddleW = 72;
      const paddleH = 10;
      let ball = { x: 190, y: 220, vx: 140, vy: -170, r: 6 };
      let alive = true;
      let bricks = [];

      function resetBricks() {
        bricks = [];
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            bricks.push({
              x: startX + col * (brickW + gap),
              y: startY + row * (brickH + gap),
              w: brickW,
              h: brickH,
              alive: true,
              color: ['#35e8ff', '#9b6cff', '#43f5a5', '#ffbe55'][row]
            });
          }
        }
      }

      function draw() {
        ctx.fillStyle = '#030914';
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
        ctx.fillRect(paddleX, canvas.height - 26, paddleW, paddleH);
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      resetBricks();

      const stop = frame(dt => {
        if (!alive) {
          draw();
          return;
        }
        paddleX += controller.x * 300 * dt;
        paddleX = Math.max(0, Math.min(canvas.width - paddleW, paddleX));

        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;

        if (ball.x < ball.r || ball.x > canvas.width - ball.r) {
          ball.vx *= -1;
        }
        if (ball.y < ball.r) {
          ball.vy = Math.abs(ball.vy);
        }

        const paddleY = canvas.height - 26;
        if (
          ball.vy > 0 &&
          ball.y + ball.r >= paddleY &&
          ball.y <= paddleY + paddleH &&
          ball.x >= paddleX &&
          ball.x <= paddleX + paddleW
        ) {
          ball.vy = -Math.abs(ball.vy);
          ball.vx += (ball.x - (paddleX + paddleW / 2)) / (paddleW / 2) * 80;
          ball.y = paddleY - ball.r;
        }

        for (const brick of bricks) {
          if (
            brick.alive &&
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
          setMessage('Cleared all bricks!');
        } else if (ball.y > canvas.height + 15) {
          alive = false;
          setMessage('Ball lost! Tap Restart.');
        }

        draw();
      });

      return () => {
        alive = false;
        stop();
      };
    }

    function gameRunner() {
      setInstructions('Tap pad to jump');
      const { canvas, ctx } = makeCanvas(400, 220);
      const ground = 180;
      const player = { x: 50, y: ground - 28, w: 22, h: 28, vy: 0, jumping: false };
      let obstacles = [];
      let alive = true;
      let elapsed = 0;
      let spawnTimer = 0;
      let speed = 180;
      let distance = 0;

      function jump() {
        if (!alive) return;
        if (!player.jumping) {
          player.vy = -340;
          player.jumping = true;
        }
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#152b43';
        for (let i = 0; i < 10; i++) {
          const x = (i * 45 - elapsed * speed * 0.4) % canvas.width;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, ground);
          ctx.stroke();
        }
        ctx.strokeStyle = '#35e8ff';
        ctx.beginPath();
        ctx.moveTo(0, ground);
        ctx.lineTo(canvas.width, ground);
        ctx.stroke();

        ctx.fillStyle = '#43f5a5';
        ctx.shadowColor = '#43f5a5';
        ctx.shadowBlur = 8;
        ctx.fillRect(player.x, player.y, player.w, player.h);

        ctx.fillStyle = '#ff6d9a';
        ctx.shadowColor = '#ff6d9a';
        obstacles.forEach(obstacle => {
          ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
        });
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#d9e8ff';
        ctx.font = '11px system-ui';
        ctx.fillText(`DIST ${Math.floor(distance)}`, 10, 18);
      }

      const stop = frame(dt => {
        if (!alive) {
          draw();
          return;
        }
        elapsed += dt;
        distance += dt * 10;
        speed = Math.min(280, 180 + elapsed * 2);
        setScore(Math.floor(distance));

        if (controller.tap || controller.jump) {
          jump();
          controller.tap = false;
          controller.jump = false;
        }

        if (player.jumping) {
          player.vy += 900 * dt;
          player.y += player.vy * dt;
          if (player.y >= ground - player.h) {
            player.y = ground - player.h;
            player.vy = 0;
            player.jumping = false;
          }
        }

        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          const height = 18 + Math.random() * 20;
          obstacles.push({
            x: canvas.width + 10,
            y: ground - height,
            w: 14 + Math.random() * 10,
            h: height
          });
          spawnTimer = 0.9 + Math.random() * 0.8;
        }

        obstacles.forEach(obstacle => {
          obstacle.x -= speed * dt;
        });
        obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.w > -5);

        for (const obstacle of obstacles) {
          if (
            player.x + player.w - 3 > obstacle.x &&
            player.x + 3 < obstacle.x + obstacle.w &&
            player.y + player.h - 2 > obstacle.y
          ) {
            alive = false;
            setMessage(`Game over! Distance: ${Math.floor(distance)}`);
            break;
          }
        }

        draw();
      });

      return () => {
        alive = false;
        stop();
      };
    }

    function gameShooter() {
      setInstructions('Swipe to move, tap to fire');
      const { canvas, ctx } = makeCanvas(380, 260);
      const ship = { x: 190, y: 220 };
      let bullets = [];
      let enemies = [];
      let particles = [];
      let spawnTimer = 0;
      let fireTimer = 0;
      let elapsed = 0;
      let hull = 3;
      let alive = true;

      function fire() {
        if (!alive || fireTimer > 0) return;
        bullets.push({ x: ship.x, y: ship.y - 12, vx: 0, vy: -320 });
        fireTimer = 0.16;
      }

      function explode(x, y, color) {
        for (let i = 0; i < 5; i++) {
          particles.push({
            x, y,
            vx: 120 * (Math.random() - 0.5),
            vy: 120 * (Math.random() - 0.5),
            life: 0.3 + Math.random() * 0.3,
            color
          });
        }
      }

      function draw() {
        ctx.fillStyle = '#030914';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 40; i++) {
          const x = (67 * i) % canvas.width;
          const y = (97 * i + elapsed * 20) % canvas.height;
          ctx.fillStyle = i % 4 === 0 ? '#35e8ff' : '#546a8c';
          ctx.fillRect(x, y, 1.5, 1.5);
        }
        ctx.fillStyle = '#35e8ff';
        ctx.shadowColor = '#35e8ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(ship.x, ship.y - 12);
        ctx.lineTo(ship.x - 12, ship.y + 10);
        ctx.lineTo(ship.x + 12, ship.y + 10);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f6fdff';
        bullets.forEach(bullet => {
          ctx.fillRect(bullet.x - 1.5, bullet.y - 6, 3, 10);
        });

        ctx.fillStyle = '#ff4f8b';
        ctx.shadowColor = '#ff4f8b';
        enemies.forEach(enemy => {
          ctx.beginPath();
          ctx.moveTo(enemy.x, enemy.y + 10);
          ctx.lineTo(enemy.x - 10, enemy.y - 8);
          ctx.lineTo(enemy.x + 10, enemy.y - 8);
          ctx.closePath();
          ctx.fill();
        });

        particles.forEach(particle => {
          ctx.fillStyle = particle.color;
          ctx.fillRect(particle.x, particle.y, 2.5, 2.5);
        });
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#e6efff';
        ctx.font = 'bold 11px system-ui';
        ctx.fillText(`HULL ${'♥'.repeat(hull)}`, 10, 18);
      }

      const stop = frame(dt => {
        elapsed += dt;
        if (!alive) {
          draw();
          return;
        }

        ship.x += controller.x * 280 * dt;
        ship.x = Math.max(14, Math.min(canvas.width - 14, ship.x));

        fireTimer -= dt;
        if (controller.tap || controller.fire) {
          fire();
          controller.tap = false;
          controller.fire = false;
        }

        spawnTimer -= dt;
        if (spawnTimer <= 0) {
          enemies.push({
            x: 18 + (canvas.width - 36) * Math.random(),
            y: -14,
            vy: 55 + 50 * Math.random() + elapsed * 0.5,
            dead: false
          });
          spawnTimer = Math.max(0.4, 0.9 - elapsed * 0.008) + Math.random() * 0.25;
        }

        bullets.forEach(bullet => {
          bullet.x += bullet.vx * dt;
          bullet.y += bullet.vy * dt;
        });
        bullets = bullets.filter(bullet => bullet.y > -20);

        enemies.forEach(enemy => {
          enemy.y += enemy.vy * dt;
          if (
            Math.abs(enemy.x - ship.x) < 18 &&
            Math.abs(enemy.y - ship.y) < 20
          ) {
            enemy.dead = true;
            hull--;
            explode(enemy.x, enemy.y, '#ff6d9a');
            if (hull <= 0) {
              alive = false;
              setMessage(`Ship destroyed! Score: ${score}`);
            }
          }

          bullets.forEach(bullet => {
            if (
              !bullet.dead &&
              !enemy.dead &&
              Math.abs(bullet.x - enemy.x) < 14 &&
              Math.abs(bullet.y - enemy.y) < 14
            ) {
              bullet.dead = true;
              enemy.dead = true;
              addScore(10);
              explode(enemy.x, enemy.y, '#35e8ff');
            }
          });

          if (enemy.y > canvas.height + 15 && !enemy.dead) {
            enemy.dead = true;
            hull--;
            if (hull <= 0) {
              alive = false;
              setMessage(`Invaders broke through! Score: ${score}`);
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

        draw();
      });

      return () => {
        alive = false;
        stop();
      };
    }

    function gameMath() {
      setInstructions('Tap answers');
      const status = document.createElement('div');
      status.className = 'nx-result';
      status.textContent = 'Solve correctly for points.';

      const question = document.createElement('div');
      question.className = 'nx-question';

      const answers = document.createElement('div');
      answers.className = 'nx-answer-grid';

      const streak = document.createElement('div');
      streak.className = 'nx-result';
      streak.textContent = 'Correct streak: 0';

      area.append(status, question, answers, streak);

      let answer = 0;
      let correctStreak = 0;
      let locked = false;
      let choices = [];

      function newQuestion() {
        locked = false;
        status.textContent = 'Choose correct answer.';
        const operation = Math.floor(Math.random() * 4);
        let a = 1 + Math.floor(Math.random() * 15);
        let b = 1 + Math.floor(Math.random() * 15);
        let symbol = '+';

        if (operation === 0) {
          answer = a + b;
          symbol = '+';
        } else if (operation === 1) {
          if (b > a) [a, b] = [b, a];
          answer = a - b;
          symbol = '−';
        } else if (operation === 2) {
          a = 1 + Math.floor(Math.random() * 10);
          b = 1 + Math.floor(Math.random() * 10);
          answer = a * b;
          symbol = '×';
        } else {
          b = 1 + Math.floor(Math.random() * 9);
          answer = 1 + Math.floor(Math.random() * 10);
          a = b * answer;
          symbol = '÷';
        }

        question.textContent = `${a} ${symbol} ${b} = ?`;
        const options = new Set([answer]);
        while (options.size < 4) {
          const offset = Math.floor(Math.random() * 11) - 5;
          options.add(Math.max(0, answer + (offset || 1)));
        }
        choices = [...options].sort(() => Math.random() - 0.5);
        answers.innerHTML = choices.map((value, index) => `
          <button class="nx-answer" data-answer="${value}">${index + 1}. ${value}</button>
        `).join('');
      }

      function chooseMathAnswer(index) {
        if (locked || index < 0 || index >= choices.length) return;
        locked = true;
        if (Number(choices[index]) === answer) {
          correctStreak++;
          addScore(10);
          status.textContent = 'Correct! +10 pts';
        } else {
          correctStreak = 0;
          status.textContent = `Answer was ${answer}`;
        }
        streak.textContent = `Correct streak: ${correctStreak}`;
        $$('[data-answer]', answers).forEach(button => {
          button.disabled = true;
        });
        timeout(newQuestion, 700);
      }

      listen(answers, 'click', event => {
        const button = event.target.closest('[data-answer]');
        if (!button) return;
        chooseMathAnswer(choices.indexOf(Number(button.dataset.answer)));
      });

      mathTapHandler = event => {
        if (locked) return;
        const rect = pad.getBoundingClientRect();
        const index = Math.min(3, Math.max(0,
          Math.floor((event.clientY - rect.top) / rect.height * 2) * 2 +
          Math.floor((event.clientX - rect.left) / rect.width * 2)
        ));
        chooseMathAnswer(index);
      };

      newQuestion();
      return () => {
        mathTapHandler = null;
      };
    }

    function gameRPS() {
      setInstructions('Choose move');
      const status = document.createElement('div');
      status.className = 'nx-result';
      status.textContent = 'Rock, Paper, or Scissors.';

      const buttons = document.createElement('div');
      buttons.className = 'nx-rps-buttons';
      buttons.innerHTML = `
        <button class="nx-btn" data-rps="rock">✊ Rock</button>
        <button class="nx-btn" data-rps="paper">✋ Paper</button>
        <button class="nx-btn" data-rps="scissors">✌️ Scissors</button>
      `;

      const result = document.createElement('div');
      result.className = 'nx-question';
      result.textContent = 'Ready?';

      const tally = document.createElement('div');
      tally.className = 'nx-result';
      tally.textContent = 'Wins: 0 · Draws: 0 · Losses: 0';

      area.append(status, buttons, result, tally);

      const moves = ['rock', 'paper', 'scissors'];
      const icons = { rock: '✊', paper: '✋', scissors: '✌️' };
      let wins = 0;
      let draws = 0;
      let losses = 0;

      function playRps(move) {
        const computer = moves[Math.floor(Math.random() * moves.length)];
        let messageText;
        if (move === computer) {
          draws++;
          messageText = 'Draw!';
        } else if (
          (move === 'rock' && computer === 'scissors') ||
          (move === 'paper' && computer === 'rock') ||
          (move === 'scissors' && computer === 'paper')
        ) {
          wins++;
          addScore(1);
          messageText = 'You win!';
        } else {
          losses++;
          messageText = 'Computer wins!';
        }
        result.textContent = `${icons[move]} vs ${icons[computer]}`;
        status.textContent = messageText;
        tally.textContent = `Wins: ${wins} · Draws: ${draws} · Losses: ${losses}`;
      }

      listen(buttons, 'click', event => {
        const button = event.target.closest('[data-rps]');
        if (button) playRps(button.dataset.rps);
      });

      rpsTapHandler = event => {
        const rect = pad.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        playRps(x < 1 / 3 ? 'rock' : x < 2 / 3 ? 'paper' : 'scissors');
      };

      return () => {
        rpsTapHandler = null;
      };
    }

    function gameHangman() {
      setInstructions('Select grid letters');
      const wordList = [
        'GALAXY', 'PLANET', 'ROCKET', 'JUNGLE', 'PUZZLE',
        'ARCADE', 'NEXORA', 'GAMING', 'NEBULA', 'PYTHON',
        'COMPUTER', 'RAINBOW', 'DIAMOND', 'OCEAN', 'FUTURE'
      ];
      let word = '';
      let guessed = new Set();
      let mistakes = 0;
      const maxMistakes = 6;
      let ended = false;

      const status = document.createElement('div');
      status.className = 'nx-result';
      const drawing = document.createElement('div');
      drawing.className = 'nx-question';
      const display = document.createElement('div');
      display.className = 'nx-word';
      const letters = document.createElement('div');
      letters.className = 'nx-letter-grid';
      letters.innerHTML = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => `
        <button class="nx-letter" data-letter="${letter}">${letter}</button>
      `).join('');

      area.append(status, drawing, display, letters);

      function resetHangman() {
        word = wordList[Math.floor(Math.random() * wordList.length)];
        guessed = new Set();
        mistakes = 0;
        ended = false;
        status.textContent = 'Guess hidden word.';
        render();
      }

      function render() {
        display.textContent = word.split('').map(letter =>
          guessed.has(letter) ? letter : '_'
        ).join(' ');
        drawing.textContent = ['○', '◔', '◑', '◕', '◉', '☠', '✖'][mistakes];
        $$('[data-letter]', letters).forEach(button => {
          button.disabled = ended || guessed.has(button.dataset.letter);
        });
      }

      function guessLetter(letter) {
        if (ended || guessed.has(letter) || !/^[A-Z]$/.test(letter)) return;
        guessed.add(letter);
        if (!word.includes(letter)) mistakes++;

        if (word.split('').every(char => guessed.has(char))) {
          ended = true;
          addScore(10);
          status.textContent = `Solved! Word: ${word}`;
        } else if (mistakes >= maxMistakes) {
          ended = true;
          status.textContent = `Game over! Word: ${word}`;
        } else {
          status.textContent = `Mistakes: ${mistakes}/${maxMistakes}`;
        }
        render();
      }

      listen(letters, 'click', event => {
        const button = event.target.closest('[data-letter]');
        if (button) guessLetter(button.dataset.letter);
      });

      hangmanTapHandler = event => {
        const rect = pad.getBoundingClientRect();
        const lettersArray = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const col = Math.min(6, Math.max(0, Math.floor((event.clientX - rect.left) / rect.width * 7)));
        const row = Math.min(3, Math.max(0, Math.floor((event.clientY - rect.top) / rect.height * 4)));
        const index = row * 7 + col;
        if (index < lettersArray.length) guessLetter(lettersArray[index]);
      };

      resetHangman();
      return () => {
        hangmanTapHandler = null;
      };
    }

    function gameFlappy() {
      setInstructions('Tap pad to flap');
      const { canvas, ctx } = makeCanvas(300, 380);
      const bird = { x: 70, y: 170, vy: 0, r: 10 };
      let pipes = [];
      let elapsed = 0;
      let spawnTimer = 0;
      let alive = true;
      let started = false;
      let passed = 0;
      const gravity = 850;
      const flapVelocity = -280;
      const pipeW = 46;
      const gap = 120;

      function flap() {
        if (!alive) return;
        started = true;
        bird.vy = flapVelocity;
      }

      function draw() {
        ctx.fillStyle = '#071226';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < 20; i++) {
          const x = (31 * i) % canvas.width;
          const y = (59 * i) % canvas.height;
          ctx.fillStyle = '#213957';
          ctx.fillRect(x, y, 1.5, 1.5);
        }
        pipes.forEach(pipe => {
          ctx.fillStyle = '#43f5a5';
          ctx.shadowColor = '#43f5a5';
          ctx.shadowBlur = 6;
          ctx.fillRect(pipe.x, 0, pipeW, pipe.top);
          ctx.fillRect(pipe.x, pipe.top + gap, pipeW, canvas.height - pipe.top - gap);
          ctx.fillStyle = '#1bbf88';
          ctx.fillRect(pipe.x - 3, pipe.top - 8, pipeW + 6, 8);
          ctx.fillRect(pipe.x - 3, pipe.top + gap, pipeW + 6, 8);
        });

        ctx.shadowColor = '#ffdc68';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#ffdc68';
        ctx.beginPath();
        ctx.arc(bird.x, bird.y, bird.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#091120';
        ctx.beginPath();
        ctx.arc(bird.x + 3, bird.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#eaf3ff';
        ctx.font = 'bold 15px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(`SCORE ${passed}`, canvas.width / 2, 24);

        if (!started && alive) {
          ctx.fillStyle = '#fff';
          ctx.fillText('TAP PAD TO START', canvas.width / 2, canvas.height / 2 + 50);
        }
      }

      const stop = frame(dt => {
        elapsed += dt;
        if (!alive) {
          draw();
          return;
        }

        if (controller.tap || controller.jump) {
          flap();
          controller.tap = false;
          controller.jump = false;
        }

        if (started) {
          bird.vy += gravity * dt;
          bird.y += bird.vy * dt;

          spawnTimer -= dt;
          if (spawnTimer <= 0) {
            const minTop = 45;
            const maxTop = canvas.height - gap - 45;
            pipes.push({
              x: canvas.width + 5,
              top: minTop + Math.random() * (maxTop - minTop),
              scored: false
            });
            spawnTimer = 1.3;
          }

          pipes.forEach(pipe => {
            pipe.x -= 130 * dt;
            if (!pipe.scored && pipe.x + pipeW < bird.x) {
              pipe.scored = true;
              passed++;
              setScore(passed);
            }

            const overlapsX = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + pipeW;
            const outsideGap = bird.y - bird.r < pipe.top || bird.y + bird.r > pipe.top + gap;
            if (overlapsX && outsideGap) {
              alive = false;
              setMessage(`Hit pipe! Score: ${passed}`);
            }
          });

          pipes = pipes.filter(pipe => pipe.x + pipeW > -5);

          if (bird.y - bird.r < 0 || bird.y + bird.r > canvas.height) {
            alive = false;
            setMessage(`Flight ended! Score: ${passed}`);
          }
        }

        draw();
      });

      return () => {
        alive = false;
        stop();
      };
    }

    let gameCleanup = () => {};
    try {
      gameCleanup = makeGame() || (() => {});
    } catch (error) {
      console.error(`Nexora ${id} error:`, error);
      area.innerHTML = '<p class="nx-result">Game initialization failed.</p>';
      setMessage('Failed to start.');
    }

    updatePadDisplay();

    cleanupCurrent = () => {
      try {
        gameCleanup();
      } catch (error) {
        console.warn('Game cleanup error:', error);
      }
      localCleanups.forEach(cleanup => {
        try { cleanup(); } catch (_) {}
      });
      cancelAnimationFrame(animationFrame);
      intervalIds.forEach(clearInterval);
      timeoutIds.forEach(clearTimeout);
      controller.keys.clear();
      resetPad();
      boardTapHandler = null;
      mathTapHandler = null;
      rpsTapHandler = null;
      hangmanTapHandler = null;
    };
  }

  addStyles();
  showHome();
})();
