(() => {
  'use strict';

  /*
   * REXWEB NEXORA — GAME 2
   * Ten additional arcade games.
   *
   * Updates:
   * - Two-row, mobile-friendly game menu.
   * - Separate full-screen game view.
   * - Responsive touchpads and faster controls.
   * - Easy, Medium, Hard and Hardest difficulty settings.
   * - Restart button in the top bar.
   * - Realistic racing cars and 60-minute countdown.
   * - Detailed jet fighter for Alien Invasion.
   * - Continuous firing while holding FIRE.
   * - Improved maze movement without skipped cells.
   * - Preserve existing games and gameplay.
   */

  const ROOT = document.getElementById('nexora-games');

  if (!ROOT) {
    console.error('Nexora Game 2: #nexora-games was not found.');
    return;
  }

  if (document.getElementById('nx2-launcher')) return;

  const GAMES = [
    { id: 'memory', icon: '🧠', name: 'Memory Match' },
    { id: 'racing', icon: '🏎️', name: 'Neon Racing' },
    { id: 'tower', icon: '🗼', name: 'Tower Stack' },
    { id: 'mine', icon: '💣', name: 'Minefield Mystery' },
    { id: 'puzzle', icon: '🧩', name: 'Sliding Puzzle' },
    { id: 'alien', icon: '👾', name: 'Alien Invasion' },
    { id: 'target', icon: '🎯', name: 'Target Master' },
    { id: 'word', icon: '🔤', name: 'Word Scramble' },
    { id: 'hockey', icon: '🏒', name: 'Air Hockey' },
    { id: 'maze', icon: '🌀', name: 'Neon Maze' }
  ];

  const DIFFICULTIES = {
    Easy: {
      speed: 0.75,
      enemies: 0.65,
      time: 1.4,
      memory: 1.3,
      label: 'Easy'
    },
    Medium: {
      speed: 1,
      enemies: 1,
      time: 1,
      memory: 1,
      label: 'Medium'
    },
    Hard: {
      speed: 1.35,
      enemies: 1.4,
      time: 0.8,
      memory: 0.8,
      label: 'Hard'
    },
    Hardest: {
      speed: 1.75,
      enemies: 1.9,
      time: 0.65,
      memory: 0.6,
      label: 'Hardest'
    }
  };

  let difficulty = 'Medium';
  let currentGame = null;
  let cleanupGame = null;
  let animationFrame = 0;
  let timers = [];
  let gameToken = 0;
  let savedOverflow = '';

  const style = document.createElement('style');

  style.textContent = `
    #nx2-launcher,
    #nx2-overlay {
      font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
      box-sizing:border-box;
    }

    #nx2-launcher *,
    #nx2-overlay * {
      box-sizing:border-box;
    }

    #nx2-launcher {
      width:100%;
      max-width:1100px;
      margin:14px auto 24px;
      color:var(--text,#eef5ff);
    }

    #nx2-launcher .nx2-heading {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:8px;
      margin-bottom:10px;
    }

    #nx2-launcher .nx2-heading h2 {
      margin:0;
      font-size:clamp(17px,4vw,24px);
      letter-spacing:.04em;
    }

    #nx2-launcher .nx2-heading p {
      margin:4px 0 0;
      font-size:11px;
      opacity:.7;
    }

    #nx2-launcher .nx2-grid {
      display:grid;
      grid-template-columns:repeat(5,minmax(0,1fr));
      grid-template-rows:repeat(2,auto);
      gap:8px;
      width:100%;
    }

    #nx2-launcher .nx2-card {
      appearance:none;
      display:flex;
      min-width:0;
      min-height:82px;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:6px;
      padding:8px 3px;
      border:1px solid #263d5c;
      border-radius:12px;
      background:linear-gradient(145deg,#111d33,#070c18);
      color:#f0f7ff;
      text-align:center;
      cursor:pointer;
      box-shadow:0 4px 12px #0003;
      -webkit-tap-highlight-color:transparent;
      transition:transform .15s,border-color .15s;
    }

    #nx2-launcher .nx2-card:active {
      transform:scale(.97);
    }

    #nx2-launcher .nx2-card:hover {
      border-color:#35e8ff;
    }

    #nx2-launcher .nx2-icon {
      font-size:clamp(19px,4vw,29px);
      line-height:1;
    }

    #nx2-launcher .nx2-name {
      display:block;
      width:100%;
      font-size:clamp(9px,1.5vw,12px);
      font-weight:800;
      line-height:1.2;
      overflow-wrap:anywhere;
    }

    #nx2-overlay {
      position:fixed;
      inset:0;
      z-index:2147483000;
      display:none;
      flex-direction:column;
      overflow:auto;
      overscroll-behavior:contain;
      padding:max(9px,env(safe-area-inset-top))
        10px max(12px,env(safe-area-inset-bottom));
      background:#050914;
      color:#eef5ff;
    }

    #nx2-overlay.nx2-active {
      display:flex;
    }

    #nx2-overlay .nx2-topbar {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:8px;
      width:100%;
      max-width:850px;
      margin:0 auto 8px;
    }

    #nx2-overlay .nx2-title {
      flex:1;
      min-width:0;
      margin:0;
      font-size:clamp(15px,4vw,22px);
      text-align:center;
      overflow-wrap:anywhere;
    }

    #nx2-overlay .nx2-btn {
      appearance:none;
      border:1px solid #35e8ff;
      border-radius:9px;
      padding:8px 10px;
      background:#10283b;
      color:#e7fbff;
      font-size:12px;
      font-weight:800;
      cursor:pointer;
      touch-action:manipulation;
      white-space:nowrap;
    }

    #nx2-overlay .nx2-btn:active {
      transform:scale(.97);
    }

    #nx2-overlay .nx2-content {
      width:100%;
      max-width:850px;
      margin:0 auto;
      text-align:center;
    }

    #nx2-overlay .nx2-status {
      min-height:22px;
      margin:7px 0;
      color:#7cf4ff;
      font-size:13px;
      font-weight:700;
      line-height:1.5;
    }

    #nx2-overlay .nx2-panel {
      width:100%;
      max-width:520px;
      margin:0 auto;
      padding:10px;
      border:1px solid #203957;
      border-radius:15px;
      background:linear-gradient(145deg,#0d192c,#070d19);
    }

    #nx2-overlay .nx2-board {
      display:grid;
      gap:6px;
      width:100%;
      max-width:390px;
      margin:10px auto;
    }

    #nx2-overlay .nx2-cell {
      display:flex;
      min-width:0;
      aspect-ratio:1;
      align-items:center;
      justify-content:center;
      border:1px solid #294664;
      border-radius:8px;
      background:#101d32;
      color:#f1fbff;
      font-size:clamp(14px,5vw,27px);
      font-weight:800;
      cursor:pointer;
      touch-action:manipulation;
      user-select:none;
    }

    #nx2-overlay .nx2-cell.nx2-selected {
      border-color:#35e8ff;
      background:#14354b;
    }

    #nx2-overlay .nx2-cell.nx2-safe {
      background:#124333;
      border-color:#43f5a5;
    }

    #nx2-overlay .nx2-cell.nx2-bomb {
      background:#51202c;
      border-color:#ff6687;
    }

    #nx2-overlay .nx2-controls {
      display:flex;
      flex-wrap:wrap;
      align-items:center;
      justify-content:center;
      gap:8px;
      margin:10px auto;
    }

    #nx2-overlay .nx2-help {
      max-width:520px;
      margin:10px auto;
      color:#aebfd4;
      font-size:12px;
      line-height:1.5;
    }

    #nx2-overlay canvas {
      display:block;
      width:100%;
      max-width:520px;
      height:auto;
      margin:8px auto;
      border:1px solid #25415f;
      border-radius:12px;
      background:#07101f;
      touch-action:none;
    }

    #nx2-overlay .nx2-input {
      display:block;
      width:100%;
      max-width:320px;
      margin:10px auto;
      padding:12px;
      border:1px solid #34516f;
      border-radius:10px;
      background:#07101e;
      color:#fff;
      font-size:16px;
      text-align:center;
      outline:none;
    }

    #nx2-overlay .nx2-input:focus {
      border-color:#35e8ff;
    }

    #nx2-overlay .nx2-big {
      font-size:clamp(23px,7vw,38px);
      font-weight:900;
      letter-spacing:.08em;
    }

    #nx2-overlay .nx2-small {
      color:#b5c6dc;
      font-size:12px;
    }

    #nx2-overlay .nx2-difficulty {
      width:100%;
      max-width:520px;
      margin:0 auto 8px;
      border:1px solid #263d5c;
      border-radius:11px;
      background:#0a1424;
      text-align:left;
    }

    #nx2-overlay .nx2-difficulty summary {
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:8px;
      padding:10px 12px;
      color:#dffaff;
      font-size:12px;
      font-weight:800;
      cursor:pointer;
      list-style:none;
      user-select:none;
    }

    #nx2-overlay .nx2-difficulty summary::-webkit-details-marker {
      display:none;
    }

    #nx2-overlay .nx2-difficulty summary::after {
      content:'+';
      color:#35e8ff;
      font-size:18px;
    }

    #nx2-overlay .nx2-difficulty[open] summary::after {
      content:'−';
    }

    #nx2-overlay .nx2-difficulty-options {
      display:grid;
      grid-template-columns:repeat(4,minmax(0,1fr));
      gap:5px;
      padding:0 8px 9px;
    }

    #nx2-overlay .nx2-difficulty-option {
      min-width:0;
      padding:9px 3px;
      border:1px solid #29415f;
      border-radius:8px;
      background:#101d32;
      color:#dce9f8;
      font-size:10px;
      font-weight:800;
      cursor:pointer;
    }

    #nx2-overlay .nx2-difficulty-option[aria-pressed="true"] {
      border-color:#35e8ff;
      background:#12364a;
      color:#8ff7ff;
    }

    /* Responsive virtual joystick */

    #nx2-overlay .nx2-touch-area {
      display:flex;
      align-items:center;
      justify-content:center;
      gap:clamp(12px,5vw,24px);
      width:100%;
      max-width:420px;
      margin:14px auto 5px;
      touch-action:none;
      user-select:none;
      -webkit-user-select:none;
    }

    #nx2-overlay .nx2-pad-wrap {
      flex:0 1 auto;
      min-width:0;
    }

    #nx2-overlay .nx2-pad {
      position:relative;
      width:clamp(112px,34vw,150px);
      height:clamp(112px,34vw,150px);
      flex:0 0 auto;
      border:2px solid #294d6d;
      border-radius:50%;
      background:radial-gradient(circle,#142b43 0,#0b182b 58%,#07101d 72%);
      box-shadow:inset 0 0 18px #0008,0 0 14px #35e8ff12;
      touch-action:none;
    }

    #nx2-overlay .nx2-pad::before,
    #nx2-overlay .nx2-pad::after {
      position:absolute;
      content:'';
      background:#29415a;
      pointer-events:none;
    }

    #nx2-overlay .nx2-pad::before {
      width:1px;
      height:82%;
      left:50%;
      top:9%;
    }

    #nx2-overlay .nx2-pad::after {
      height:1px;
      width:82%;
      top:50%;
      left:9%;
    }

    #nx2-overlay .nx2-knob {
      position:absolute;
      left:50%;
      top:50%;
      width:clamp(39px,12vw,49px);
      height:clamp(39px,12vw,49px);
      border:2px solid #6ef4ff;
      border-radius:50%;
      background:radial-gradient(circle at 35% 30%,#35e8ff,#11617d 70%);
      box-shadow:0 0 14px #35e8ff55;
      transform:translate(-50%,-50%);
      pointer-events:none;
    }

    #nx2-overlay .nx2-pad-hint {
      display:block;
      margin-top:5px;
      color:#8da6bf;
      font-size:10px;
      text-align:center;
    }

    #nx2-overlay .nx2-fire {
      width:clamp(70px,22vw,88px);
      height:clamp(70px,22vw,88px);
      flex:0 0 auto;
      border:2px solid #ff6687;
      border-radius:50%;
      background:radial-gradient(circle at 35% 30%,#ff718d,#81213f);
      color:#fff;
      font-size:12px;
      font-weight:900;
      box-shadow:0 0 14px #ff668733;
      touch-action:none;
      user-select:none;
      -webkit-user-select:none;
    }

    #nx2-overlay .nx2-fire.nx2-firing {
      transform:scale(.94);
      box-shadow:0 0 24px #ff6687aa;
      background:radial-gradient(circle at 35% 30%,#ffb3c2,#a71943);
    }

    @media(max-width:420px) {
      #nx2-launcher {
        margin-top:10px;
      }

      #nx2-launcher .nx2-grid {
        gap:5px;
      }

      #nx2-launcher .nx2-card {
        min-height:68px;
        padding:6px 2px;
        gap:5px;
        border-radius:9px;
      }

      #nx2-launcher .nx2-name {
        font-size:9px;
      }

      #nx2-overlay {
        padding-left:6px;
        padding-right:6px;
      }

      #nx2-overlay .nx2-panel {
        padding:7px;
      }

      #nx2-overlay .nx2-board {
        gap:4px;
      }

      #nx2-overlay .nx2-topbar {
        gap:5px;
      }

      #nx2-overlay .nx2-btn {
        padding:8px 7px;
        font-size:11px;
      }
    }

    @media(max-width:340px) {
      #nx2-overlay .nx2-touch-area {
        gap:10px;
      }

      #nx2-overlay .nx2-pad {
        width:104px;
        height:104px;
      }

      #nx2-overlay .nx2-fire {
        width:65px;
        height:65px;
        font-size:10px;
      }
    }
  `;

  document.head.appendChild(style);

  const launcher = document.createElement('section');
  launcher.id = 'nx2-launcher';
  launcher.setAttribute('aria-label', 'Additional Nexora arcade games');

  launcher.innerHTML = `
    <div class="nx2-heading">
      <div>
        <h2>⚡ EXTRA ARCADE</h2>
        <p>Choose a game to play</p>
      </div>
    </div>

    <div class="nx2-grid">
      ${GAMES.map(game => `
        <button class="nx2-card"
          type="button"
          data-nx2-game="${game.id}">
          <span class="nx2-icon">${game.icon}</span>
          <span class="nx2-name">${game.name}</span>
        </button>
      `).join('')}
    </div>
  `;

  ROOT.parentNode.insertBefore(launcher, ROOT);

  const overlay = document.createElement('section');
  overlay.id = 'nx2-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Nexora game');

  overlay.innerHTML = `
    <div class="nx2-topbar">
      <button class="nx2-btn" type="button" id="nx2-back">← Games</button>
      <h2 class="nx2-title" id="nx2-game-title">Nexora Game</h2>
      <button class="nx2-btn" type="button" id="nx2-restart">↻ Restart</button>
    </div>

    <details class="nx2-difficulty" id="nx2-difficulty-menu">
      <summary>
        <span>⚙ DIFFICULTY</span>
        <span id="nx2-difficulty-label">Medium</span>
      </summary>

      <div class="nx2-difficulty-options">
        ${Object.keys(DIFFICULTIES).map(name => `
          <button
            class="nx2-difficulty-option"
            type="button"
            data-nx2-difficulty="${name}"
            aria-pressed="${name === difficulty ? 'true' : 'false'}">
            ${name}
          </button>
        `).join('')}
      </div>
    </details>

    <div class="nx2-content" id="nx2-content"></div>
  `;

  document.body.appendChild(overlay);

  const content = overlay.querySelector('#nx2-content');
  const title = overlay.querySelector('#nx2-game-title');
  const backButton = overlay.querySelector('#nx2-back');
  const restartButton = overlay.querySelector('#nx2-restart');
  const difficultyMenu = overlay.querySelector('#nx2-difficulty-menu');
  const difficultyLabel = overlay.querySelector('#nx2-difficulty-label');

  function later(fn, delay) {
    const token = gameToken;

    const id = setTimeout(() => {
      timers = timers.filter(timer => timer !== id);

      if (token === gameToken && overlay.classList.contains('nx2-active')) {
        fn();
      }
    }, delay);

    timers.push(id);
    return id;
  }

  function clearGame() {
    gameToken++;

    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    timers.forEach(clearTimeout);
    timers = [];

    if (typeof cleanupGame === 'function') {
      try {
        cleanupGame();
      } catch (error) {
        console.warn('Nexora game cleanup:', error);
      }
    }

    cleanupGame = null;
    content.innerHTML = '';
  }

  function shell(message) {
    content.innerHTML = `
      <div class="nx2-panel">
        <div class="nx2-status" aria-live="polite">${message || ''}</div>
        <div id="nx2-game-area"></div>
        <div class="nx2-controls" id="nx2-controls"></div>
        <div class="nx2-help" id="nx2-help"></div>
      </div>
    `;

    return {
      area: content.querySelector('#nx2-game-area'),
      controls: content.querySelector('#nx2-controls'),
      help: content.querySelector('#nx2-help')
    };
  }

  function status(message) {
    const el = content.querySelector('.nx2-status');
    if (el) el.textContent = message;
  }

  function button(label, action) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'nx2-btn';
    el.textContent = label;
    el.addEventListener('click', action);
    return el;
  }

  function activeDifficulty() {
    return DIFFICULTIES[difficulty];
  }

  /*
   * Responsive virtual joystick.
   * Movement is updated immediately and normalized.
   * Fire buttons support both tapping and holding.
   */

  function addTouchpad(container, onMove, options = {}) {
    const wrap = document.createElement('div');
    wrap.className = 'nx2-touch-area';

    const padWrap = document.createElement('div');
    padWrap.className = 'nx2-pad-wrap';

    const pad = document.createElement('div');
    pad.className = 'nx2-pad';
    pad.setAttribute('role', 'application');
    pad.setAttribute('aria-label', 'Touchpad directional controller');

    const knob = document.createElement('div');
    knob.className = 'nx2-knob';
    pad.appendChild(knob);
    padWrap.appendChild(pad);

    const hint = document.createElement('span');
    hint.className = 'nx2-pad-hint';
    hint.textContent = 'DRAG TO MOVE';
    padWrap.appendChild(hint);

    wrap.appendChild(padWrap);

    let fireButton = null;
    let fireInterval = 0;

    function stopFiring() {
      if (fireInterval) {
        clearInterval(fireInterval);
        fireInterval = 0;
      }

      if (fireButton) {
        fireButton.classList.remove('nx2-firing');
      }
    }

    if (options.fire) {
      fireButton = document.createElement('button');
      fireButton.type = 'button';
      fireButton.className = 'nx2-fire';
      fireButton.textContent = options.fireLabel || 'FIRE';
      fireButton.setAttribute('aria-label', options.fireLabel || 'Fire');

      const startFiring = event => {
        event.preventDefault();

        if (fireInterval) return;

        fireButton.classList.add('nx2-firing');

        if (options.onFire) options.onFire();

        fireInterval = setInterval(() => {
          if (options.onFire) options.onFire();
        }, options.fireRate || 150);
      };

      fireButton.addEventListener('pointerdown', startFiring);

      fireButton.addEventListener('pointerup', stopFiring);
      fireButton.addEventListener('pointercancel', stopFiring);
      fireButton.addEventListener('lostpointercapture', stopFiring);
      fireButton.addEventListener('contextmenu', event => event.preventDefault());

      wrap.appendChild(fireButton);
    }

    container.appendChild(wrap);

    let pointerId = null;

    function resetPad() {
      knob.style.left = '50%';
      knob.style.top = '50%';

      if (pointerId !== null) {
        pointerId = null;
        onMove(0, 0, false);
      }
    }

    pad.addEventListener('pointerdown', event => {
      event.preventDefault();

      pointerId = event.pointerId;

      try {
        pad.setPointerCapture(pointerId);
      } catch (_) {}

      update(event);
    });

    pad.addEventListener('pointermove', event => {
      if (pointerId !== event.pointerId) return;

      event.preventDefault();
      update(event);
    });

    pad.addEventListener('pointerup', event => {
      if (pointerId !== event.pointerId) return;
      resetPad();
    });

    pad.addEventListener('pointercancel', resetPad);
    pad.addEventListener('lostpointercapture', resetPad);

    function update(event) {
      const rect = pad.getBoundingClientRect();

      const radius = Math.max(25, rect.width * .34);
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      let dx = (event.clientX - cx) / radius;
      let dy = (event.clientY - cy) / radius;

      const length = Math.hypot(dx, dy);

      if (length > 1) {
        dx /= length;
        dy /= length;
      }

      // Dead zone prevents accidental movement from tiny finger shifts.
      const deadZone = .08;

      if (Math.abs(dx) < deadZone) dx = 0;
      if (Math.abs(dy) < deadZone) dy = 0;

      knob.style.left = `${50 + dx * 34}%`;
      knob.style.top = `${50 + dy * 34}%`;

      onMove(dx, dy, true);
    }

    return {
      wrap,
      pad,
      fireButton,
      stopFiring
    };
  }

  function openGame(id) {
    const game = GAMES.find(item => item.id === id);
    if (!game) return;

    clearGame();

    currentGame = id;
    title.textContent = `${game.icon} ${game.name}`;
    overlay.classList.add('nx2-active');

    savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    overlay.querySelectorAll('[data-nx2-difficulty]').forEach(el => {
      el.setAttribute(
        'aria-pressed',
        el.dataset.nx2Difficulty === difficulty ? 'true' : 'false'
      );
    });

    difficultyLabel.textContent = difficulty;

    try {
      switch (id) {
        case 'memory': startMemory(); break;
        case 'racing': startRacing(); break;
        case 'tower': startTower(); break;
        case 'mine': startMine(); break;
        case 'puzzle': startPuzzle(); break;
        case 'alien': startAlien(); break;
        case 'target': startTarget(); break;
        case 'word': startWord(); break;
        case 'hockey': startHockey(); break;
        case 'maze': startMaze(); break;
      }
    } catch (error) {
      console.error('Nexora game error:', error);

      content.innerHTML = `
        <div class="nx2-panel">
          <p>The game encountered an error.</p>
          <button class="nx2-btn" id="nx2-error-retry" type="button">
            Try again
          </button>
        </div>
      `;

      content.querySelector('#nx2-error-retry')
        .addEventListener('click', () => openGame(id));
    }
  }

  function closeGame() {
    clearGame();
    currentGame = null;
    overlay.classList.remove('nx2-active');
    document.body.style.overflow = savedOverflow;
  }

  backButton.addEventListener('click', closeGame);

  restartButton.addEventListener('click', () => {
    if (currentGame) openGame(currentGame);
  });

  launcher.addEventListener('click', event => {
    const card = event.target.closest('[data-nx2-game]');
    if (card) openGame(card.dataset.nx2Game);
  });

  difficultyMenu.addEventListener('click', event => {
    const option = event.target.closest('[data-nx2-difficulty]');
    if (!option) return;

    difficulty = option.dataset.nx2Difficulty;
    difficultyLabel.textContent = difficulty;

    overlay.querySelectorAll('[data-nx2-difficulty]').forEach(el => {
      el.setAttribute(
        'aria-pressed',
        el.dataset.nx2Difficulty === difficulty ? 'true' : 'false'
      );
    });

    difficultyMenu.open = false;

    if (currentGame) openGame(currentGame);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay.classList.contains('nx2-active')) {
      closeGame();
    }
  });

  // ============================================================
  // 1. MEMORY MATCH
  // ============================================================

  function startMemory() {
    const ui = shell('Find matching pairs.');

    const icons = [
      '🚀', '👾', '💎', '🐉',
      '⚡', '🌙', '🎯', '🪐'
    ];

    const pairCount = Math.max(
      3,
      Math.min(8, Math.round(icons.length * activeDifficulty().memory))
    );

    const selectedIcons = icons.slice(0, pairCount);

    let cards = [];
    let opened = [];
    let matched = 0;
    let moves = 0;
    let locked = false;

    const board = document.createElement('div');
    board.className = 'nx2-board';
    board.style.gridTemplateColumns = 'repeat(4,minmax(0,1fr))';
    ui.area.appendChild(board);

    const info = document.createElement('div');
    info.className = 'nx2-small';
    ui.area.appendChild(info);

    function draw() {
      board.innerHTML = '';

      cards.forEach((card, index) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'nx2-cell';

        el.textContent =
          card.open || card.matched ? card.icon : '?';

        if (card.matched) el.classList.add('nx2-safe');

        el.addEventListener('click', () => {
          if (locked || card.open || card.matched) return;

          card.open = true;
          opened.push(index);
          draw();

          if (opened.length !== 2) return;

          moves++;
          locked = true;

          const [a, b] = opened;

          if (cards[a].icon === cards[b].icon) {
            cards[a].matched = true;
            cards[b].matched = true;

            matched += 2;
            opened = [];
            locked = false;

            draw();

            if (matched === cards.length) {
              status(`🏆 You matched every pair in ${moves} moves!`);
            } else {
              status('Good match!');
            }
          } else {
            later(() => {
              cards[a].open = false;
              cards[b].open = false;

              opened = [];
              locked = false;

              draw();
              status('Keep looking for matching pairs.');
            }, 700);
          }
        });

        board.appendChild(el);
      });

      info.textContent =
        `Moves: ${moves} · Pairs: ${matched / 2}/${selectedIcons.length}`;
    }

    function reset() {
      cards = [...selectedIcons, ...selectedIcons]
        .sort(() => Math.random() - .5)
        .map(icon => ({ icon, open: false, matched: false }));

      opened = [];
      matched = 0;
      moves = 0;
      locked = false;

      status('Find all matching pairs.');
      draw();
    }

    ui.help.textContent =
      'The difficulty menu changes how many pairs you need to find.';

    reset();
  }

  // ============================================================
  // 2. NEON RACING
  // ============================================================

  function startRacing() {
    const ui = shell('Race against traffic and avoid collisions.');

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 520;
    ui.area.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    const input = {
      x: 0,
      y: 0,
      active: false,
      left: false,
      right: false
    };

    let player;
    let traffic;
    let score;
    let remaining;
    let alive;
    let lastTime;
    let spawnTimer;
    let roadOffset;
    let elapsed;
    let keyboardHandler;
    let keyboardUpHandler;

    function roundedRect(x, y, w, h, r) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    }

    function drawCar(x, y, w, h, color, isPlayer = false) {
      ctx.save();
      ctx.translate(x, y);

      // Four realistic tyres.
      ctx.fillStyle = '#05070b';

      roundedRect(-w / 2 - 3, 10, 7, 18, 3);
      ctx.fill();

      roundedRect(w / 2 - 4, 10, 7, 18, 3);
      ctx.fill();

      roundedRect(-w / 2 - 3, h - 26, 7, 18, 3);
      ctx.fill();

      roundedRect(w / 2 - 4, h - 26, 7, 18, 3);
      ctx.fill();

      // Car body.
      ctx.fillStyle = color;
      roundedRect(-w / 2, 0, w, h, 8);
      ctx.fill();

      // Bonnet.
      ctx.fillStyle = isPlayer ? '#c8ffff' : '#ffffff55';
      roundedRect(-w / 2 + 4, 5, w - 8, h * .23, 4);
      ctx.fill();

      // Windscreen.
      ctx.fillStyle = '#071626';
      roundedRect(-w / 2 + 5, h * .29, w - 10, h * .23, 4);
      ctx.fill();

      // Rear window.
      ctx.fillStyle = '#102b41';
      roundedRect(-w / 2 + 6, h * .57, w - 12, h * .14, 3);
      ctx.fill();

      // Rear lights.
      ctx.fillStyle = '#ff244f';
      ctx.fillRect(-w / 2 + 3, h - 7, 7, 4);
      ctx.fillRect(w / 2 - 10, h - 7, 7, 4);

      if (isPlayer) {
        // Headlights and glowing outline.
        ctx.fillStyle = '#f7ffff';
        ctx.fillRect(-w / 2 + 4, 2, 8, 4);
        ctx.fillRect(w / 2 - 12, 2, 8, 4);

        ctx.shadowBlur = 12;
        ctx.shadowColor = '#35e8ff';
        ctx.strokeStyle = '#35e8ff';
        ctx.lineWidth = 1.5;

        roundedRect(-w / 2, 0, w, h, 8);
        ctx.stroke();

        // Racing stripes.
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, 8, 4, 12);
        ctx.fillRect(-2, h - 20, 4, 10);
      }

      ctx.restore();
    }

    function drawRoad() {
      ctx.fillStyle = '#07101f';
      ctx.fillRect(0, 0, 360, 520);

      ctx.fillStyle = '#0a281e';
      ctx.fillRect(0, 0, 35, 520);
      ctx.fillRect(325, 0, 35, 520);

      ctx.fillStyle = '#292e38';
      ctx.fillRect(35, 0, 290, 520);

      ctx.fillStyle = '#dce7f4';
      ctx.fillRect(39, 0, 3, 520);
      ctx.fillRect(318, 0, 3, 520);

      ctx.fillStyle = '#e8e8e8';

      for (let y = -45; y < 560; y += 82) {
        const yy = (y + roadOffset) % 560;
        ctx.fillRect(128, yy, 4, 37);
        ctx.fillRect(228, yy, 4, 37);
      }

      for (let y = -30; y < 550; y += 65) {
        const yy = (y + roadOffset * 1.3) % 550;

        ctx.fillStyle = '#35e8ff';
        ctx.fillRect(17, yy, 5, 14);
        ctx.fillRect(338, yy, 5, 14);
      }
    }

    function draw() {
      drawRoad();

      traffic.forEach(car => {
        drawCar(car.x, car.y, car.w, car.h, car.color);
      });

      drawCar(player.x, player.y, player.w, player.h, '#19a9ff', true);

      ctx.fillStyle = '#030812dd';
      ctx.fillRect(43, 8, 112, 25);
      ctx.fillRect(205, 8, 112, 25);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(`SCORE ${Math.floor(score)}`, 51, 24);

      const minutes = Math.floor(remaining / 60);
      const seconds = Math.floor(remaining % 60);

      ctx.fillStyle = remaining < 60 ? '#ff6687' : '#8ff7ff';

      ctx.fillText(
        `TIME ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        211,
        24
      );

      if (!alive) {
        ctx.fillStyle = '#030812cc';
        ctx.fillRect(35, 180, 290, 130);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 23px system-ui';

        ctx.fillText(
          remaining <= 0 ? 'RACE COMPLETE' : 'RACE OVER',
          180,
          226
        );

        ctx.font = 'bold 15px system-ui';
        ctx.fillText(`Score: ${Math.floor(score)}`, 180, 258);

        ctx.font = '12px system-ui';
        ctx.fillText('Use Restart at the top to race again.', 180, 282);

        ctx.textAlign = 'left';
      }
    }

    function reset() {
      player = {
        x: 180,
        y: 410,
        w: 35,
        h: 64
      };

      traffic = [];
      score = 0;
      remaining = 3600;
      alive = true;
      lastTime = 0;
      spawnTimer = 0;
      roadOffset = 0;
      elapsed = 0;

      input.x = 0;
      input.y = 0;
      input.active = false;
      input.left = false;
      input.right = false;

      status('Time remaining: 60:00 · Avoid the other cars.');

      draw();
      animationFrame = requestAnimationFrame(tick);
    }

    function tick(time) {
      if (!alive) return;

      const dt = Math.min(40, lastTime ? time - lastTime : 16.7);
      lastTime = time;

      const d = activeDifficulty();

      elapsed += dt;
      remaining = Math.max(0, 3600 - elapsed / 1000);

      /*
       * Difficulty affects traffic, not the player's steering speed.
       * The player's movement remains consistent at every difficulty.
       */
      const roadSpeed = 2.5;

      roadOffset = (roadOffset + roadSpeed * dt / 16.7) % 82;

      const steering =
        input.active
          ? input.x
          : (input.left ? -1 : 0) + (input.right ? 1 : 0);

      player.x += steering * 5.5 * dt / 16.7;
      player.x = Math.max(62, Math.min(298, player.x));

      spawnTimer += dt;

      const spawnEvery = Math.max(340, 1050 / d.enemies);

      if (spawnTimer >= spawnEvery) {
        spawnTimer = 0;

        const lanes = [80, 180, 280];
        const lane = lanes[Math.floor(Math.random() * lanes.length)];

        traffic.push({
          x: lane + (Math.random() * 12 - 6),
          y: -90,
          w: 31,
          h: 57,
          speed: (1.5 + Math.random() * 1.8) * d.speed,
          color: ['#e63946', '#e8b339', '#9b6cff', '#43a4ff', '#e8edf5'][
            Math.floor(Math.random() * 5)
          ]
        });
      }

      traffic.forEach(car => {
        car.y += (roadSpeed + car.speed) * dt / 16.7;

        const hit =
          Math.abs(player.x - car.x) < (player.w + car.w) * .43 &&
          player.y < car.y + car.h - 8 &&
          player.y + player.h - 8 > car.y + 8;

        if (hit) {
          alive = false;
          status(`Collision! Final score: ${Math.floor(score)}.`);
        }
      });

      traffic = traffic.filter(car => car.y < 560);

      score += dt * .018;

      if (remaining <= 0) {
        remaining = 0;
        alive = false;
        status(`🏁 You completed the 60-minute race! Score: ${Math.floor(score)}.`);
      }

      draw();

      if (alive) {
        const mins = Math.floor(remaining / 60);
        const secs = Math.floor(remaining % 60);

        status(
          `Score: ${Math.floor(score)} · Time: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );

        animationFrame = requestAnimationFrame(tick);
      }
    }

    function onKeyDown(e) {
      if (currentGame !== 'racing') return;

      if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
      ) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        input.left = true;
      }

      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        input.right = true;
      }
    }

    function onKeyUp(e) {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        input.left = false;
      }

      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        input.right = false;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    cleanupGame = () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };

    addTouchpad(ui.controls, (x, y, active) => {
      input.x = x;
      input.y = y;
      input.active = active;
    });

    ui.help.textContent =
      'Drag the touchpad left or right to steer. Player steering stays consistent at every difficulty. Higher difficulties increase traffic speed and frequency. The race timer starts at 60:00.';

    reset();
  }

  // ============================================================
  // 3. TOWER STACK
  // ============================================================

  function startTower() {
    const ui = shell('Drag the touchpad to position the moving block, then tap DROP.');

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 450;
    ui.area.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    let blocks;
    let moving;
    let score;
    let direction;
    let running;
    let speed;

    function draw() {
      ctx.fillStyle = '#07101f';
      ctx.fillRect(0, 0, 360, 450);

      ctx.strokeStyle = '#15324d';

      for (let y = 0; y < 450; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(360, y);
        ctx.stroke();
      }

      blocks.forEach((block, i) => {
        ctx.fillStyle = i % 2 ? '#9b6cff' : '#35e8ff';
        ctx.fillRect(block.x, block.y, block.w, 28);
      });

      if (running) {
        ctx.fillStyle = '#43f5a5';
        ctx.fillRect(moving.x, moving.y, moving.w, 28);
      }
    }

    function drop() {
      if (!running) return;

      const previous = blocks[blocks.length - 1];
      const left = Math.max(previous.x, moving.x);
      const right = Math.min(previous.x + previous.w, moving.x + moving.w);
      const width = right - left;

      if (width <= 0) {
        running = false;
        status(`Tower fell! Height: ${score}.`);
        draw();
        return;
      }

      blocks.push({ x: left, w: width, y: moving.y });
      score++;

      speed = 2.2 * activeDifficulty().speed + score * .08;

      if (moving.y < 45) {
        blocks.forEach(block => {
          block.y += 28;
        });

        moving.y += 28;
      }

      moving = {
        x: direction > 0 ? 0 : 360 - width,
        w: width,
        y: moving.y - 35
      };

      direction *= -1;

      status(`Blocks stacked: ${score}`);
      draw();
    }

    function reset() {
      blocks = [{ x: 70, w: 220, y: 400 }];
      moving = { x: 0, w: 220, y: 365 };
      score = 0;
      direction = 1;
      running = true;
      speed = 2.2 * activeDifficulty().speed;

      status('Stack as many blocks as you can.');
      draw();

      animationFrame = requestAnimationFrame(tick);
    }

    function tick() {
      if (!running) return;

      moving.x += speed * direction;

      if (moving.x <= 0) {
        moving.x = 0;
        direction = 1;
      }

      if (moving.x + moving.w >= 360) {
        moving.x = 360 - moving.w;
        direction = -1;
      }

      draw();
      animationFrame = requestAnimationFrame(tick);
    }

    function onKeyDown(e) {
      if (currentGame !== 'tower') return;

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        drop();
      }
    }

    window.addEventListener('keydown', onKeyDown);

    cleanupGame = () => {
      window.removeEventListener('keydown', onKeyDown);
    };

    ui.controls.appendChild(button('DROP BLOCK', drop));

    addTouchpad(ui.controls, (x, y, active) => {
      if (!active || !running) return;

      moving.x = Math.max(
        0,
        Math.min(360 - moving.w, moving.x + x * 3.5)
      );
    });

    ui.help.textContent =
      'Drop blocks carefully to build a tower. Higher difficulty increases the movement speed.';

    reset();
  }

  // ============================================================
  // 4. MINEFIELD MYSTERY
  // ============================================================

  function startMine() {
    const ui = shell('Reveal safe tiles and avoid the hidden mines.');

    const size = 6;
    const board = document.createElement('div');

    board.className = 'nx2-board';
    board.style.gridTemplateColumns = `repeat(${size},minmax(0,1fr))`;
    ui.area.appendChild(board);

    let mineCount;
    let mines;
    let revealed;
    let finished;
    let safeCount;

    function neighbors(index) {
      const row = Math.floor(index / size);
      const col = index % size;
      const list = [];

      for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
          if (r < 0 || c < 0 || r >= size || c >= size) continue;
          if (r === row && c === col) continue;

          list.push(r * size + c);
        }
      }

      return list;
    }

    function reveal(index) {
      if (finished || revealed.has(index)) return;

      revealed.add(index);

      if (mines.has(index)) {
        finished = true;
        status('💥 Mine found! Restart to try again.');
        draw(true);
        return;
      }

      safeCount++;

      if (safeCount === size * size - mineCount) {
        finished = true;
        status('🏆 You cleared the minefield!');
      } else {
        status(`Safe tiles: ${safeCount}/${size * size - mineCount}`);
      }

      draw();
    }

    function draw(showMines = false) {
      board.innerHTML = '';

      for (let i = 0; i < size * size; i++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'nx2-cell';

        if (revealed.has(i)) {
          cell.classList.add('nx2-safe');

          if (mines.has(i)) {
            cell.textContent = '💣';
            cell.classList.add('nx2-bomb');
          } else {
            const count = neighbors(i).filter(n => mines.has(n)).length;
            cell.textContent = count ? String(count) : '·';
          }
        } else if (showMines && mines.has(i)) {
          cell.textContent = '💣';
          cell.classList.add('nx2-bomb');
        } else {
          cell.textContent = '?';
        }

        cell.addEventListener('click', () => reveal(i));
        board.appendChild(cell);
      }
    }

    function reset() {
      const d = activeDifficulty();

      mineCount = Math.max(
        4,
        Math.min(25, Math.round(7 * d.enemies))
      );

      mines = new Set();
      revealed = new Set();
      finished = false;
      safeCount = 0;

      while (mines.size < mineCount) {
        mines.add(Math.floor(Math.random() * size * size));
      }

      status(`Mines hidden: ${mineCount}`);
      draw();
    }

    ui.help.textContent =
      'Difficulty changes the number of hidden mines. Numbers show how many mines touch a tile.';

    reset();
  }

  // ============================================================
  // 5. SLIDING PUZZLE
  // ============================================================

  function startPuzzle() {
    const ui = shell('Arrange the numbers in order using the empty space.');

    let tiles = [];
    let moves = 0;

    const board = document.createElement('div');
    board.className = 'nx2-board';
    board.style.gridTemplateColumns = 'repeat(4,minmax(0,1fr))';
    ui.area.appendChild(board);

    function solved() {
      return tiles.slice(0, 15).every((n, i) => n === i + 1) &&
        tiles[15] === 0;
    }

    function draw() {
      board.innerHTML = '';

      tiles.forEach((number, index) => {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'nx2-cell';
        cell.textContent = number || '';

        if (!number) cell.style.visibility = 'hidden';

        cell.addEventListener('click', () => move(index));
        board.appendChild(cell);
      });

      status(`Moves: ${moves}${solved() ? ' · Puzzle solved!' : ''}`);
    }

    function move(index) {
      const empty = tiles.indexOf(0);

      const row = Math.floor(index / 4);
      const col = index % 4;
      const emptyRow = Math.floor(empty / 4);
      const emptyCol = empty % 4;

      if (Math.abs(row - emptyRow) + Math.abs(col - emptyCol) !== 1) {
        return;
      }

      [tiles[index], tiles[empty]] = [tiles[empty], tiles[index]];

      moves++;
      draw();
    }

    function reset() {
      tiles = Array.from({ length: 16 }, (_, i) => (i + 1) % 16);

      const scrambleMoves = Math.round(180 * activeDifficulty().speed);

      for (let i = 0; i < scrambleMoves; i++) {
        const empty = tiles.indexOf(0);
        const row = Math.floor(empty / 4);
        const col = empty % 4;
        const options = [];

        if (row > 0) options.push(empty - 4);
        if (row < 3) options.push(empty + 4);
        if (col > 0) options.push(empty - 1);
        if (col < 3) options.push(empty + 1);

        const next = options[Math.floor(Math.random() * options.length)];

        [tiles[empty], tiles[next]] = [tiles[next], tiles[empty]];
      }

      moves = 0;
      draw();
    }

    ui.help.textContent =
      'Tap a tile next to the empty space to move it. Harder levels scramble the puzzle more.';

    reset();
  }

  // ============================================================
  // 6. ALIEN INVASION — DETAILED JET FIGHTER
  // ============================================================

  function startAlien() {
    const ui = shell('Use the touchpad to pilot your jet and hold FIRE to shoot.');

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 480;
    ui.area.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    let player;
    let aliens;
    let shots;
    let score;
    let alive;
    let lastShot;
    let lastTime;
    let movementX = 0;
    let movementY = 0;
    let firing = false;
    let stars = [];

    function drawJet(x, y) {
      ctx.save();
      ctx.translate(x, y);

      // Engine glow.
      ctx.save();
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#35e8ff';
      ctx.fillStyle = '#35e8ff';
      ctx.beginPath();
      ctx.moveTo(-5, 13);
      ctx.lineTo(0, 31 + Math.random() * 5);
      ctx.lineTo(5, 13);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Main wings.
      ctx.fillStyle = '#536c88';
      ctx.strokeStyle = '#b8d8ef';
      ctx.lineWidth = 1.2;

      ctx.beginPath();
      ctx.moveTo(-5, -2);
      ctx.lineTo(-30, 12);
      ctx.lineTo(-25, 19);
      ctx.lineTo(-7, 14);
      ctx.lineTo(7, 14);
      ctx.lineTo(25, 19);
      ctx.lineTo(30, 12);
      ctx.lineTo(5, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Tail fins.
      ctx.fillStyle = '#233d59';

      ctx.beginPath();
      ctx.moveTo(-7, 9);
      ctx.lineTo(-17, 18);
      ctx.lineTo(-9, 17);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(7, 9);
      ctx.lineTo(17, 18);
      ctx.lineTo(9, 17);
      ctx.closePath();
      ctx.fill();

      // Fuselage.
      ctx.fillStyle = '#b8c9dc';
      ctx.strokeStyle = '#f0fbff';

      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(5, -13);
      ctx.lineTo(7, 7);
      ctx.lineTo(4, 17);
      ctx.lineTo(0, 20);
      ctx.lineTo(-4, 17);
      ctx.lineTo(-7, 7);
      ctx.lineTo(-5, -13);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cockpit.
      ctx.fillStyle = '#07384d';
      ctx.strokeStyle = '#35e8ff';

      ctx.beginPath();
      ctx.moveTo(0, -17);
      ctx.lineTo(3, -10);
      ctx.lineTo(2.5, -1);
      ctx.lineTo(0, 2);
      ctx.lineTo(-2.5, -1);
      ctx.lineTo(-3, -10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Wing markings.
      ctx.fillStyle = '#35e8ff';
      ctx.fillRect(-23, 12, 9, 2);
      ctx.fillRect(14, 12, 9, 2);

      // Nose light.
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -21, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    function drawAlien(alien) {
      ctx.save();
      ctx.translate(alien.x, alien.y);

      ctx.shadowBlur = 9;
      ctx.shadowColor = '#ff6687';
      ctx.fillStyle = '#d82e64';

      ctx.beginPath();
      ctx.moveTo(-12, -5);
      ctx.lineTo(-8, -11);
      ctx.lineTo(-3, -7);
      ctx.lineTo(3, -7);
      ctx.lineTo(8, -11);
      ctx.lineTo(12, -5);
      ctx.lineTo(10, 5);
      ctx.lineTo(5, 9);
      ctx.lineTo(-5, 9);
      ctx.lineTo(-10, 5);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -3, 3, 4);
      ctx.fillRect(3, -3, 3, 4);

      ctx.fillStyle = '#07101f';
      ctx.fillRect(-5, -2, 1, 2);
      ctx.fillRect(4, -2, 1, 2);

      ctx.strokeStyle = '#ff6687';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(-7, 8);
      ctx.lineTo(-10, 13);
      ctx.moveTo(7, 8);
      ctx.lineTo(10, 13);
      ctx.stroke();

      ctx.restore();
    }

    function reset() {
      player = { x: 180, y: 420 };
      aliens = [];
      shots = [];
      score = 0;
      alive = true;
      lastShot = 0;
      lastTime = 0;
      movementX = 0;
      movementY = 0;
      firing = false;

      stars = Array.from({ length: 65 }, () => ({
        x: Math.random() * 360,
        y: Math.random() * 480,
        size: .5 + Math.random() * 1.5,
        speed: .4 + Math.random() * 1.5
      }));

      const rows = difficulty === 'Easy' ? 2 : 3;
      const columns = difficulty === 'Hardest' ? 9 : 7;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          aliens.push({
            x: 25 + col * (310 / Math.max(1, columns - 1)),
            y: 45 + row * 35,
            startX: 25 + col * (310 / Math.max(1, columns - 1)),
            row,
            alive: true
          });
        }
      }

      status('Score: 0 · Defend your ship!');

      animationFrame = requestAnimationFrame(tick);
    }

    function fire() {
      if (!alive) return;

      shots.push({
        x: player.x,
        y: player.y - 22,
        speed: 8
      });
    }

    function tick(time) {
      if (!alive) return;

      const dt = Math.min(40, lastTime ? time - lastTime : 16.7);
      lastTime = time;

      const d = activeDifficulty();

      // Player movement is deliberately independent of difficulty.
      player.x += movementX * 4.8 * dt / 16.7;
      player.y += movementY * 4.0 * dt / 16.7;

      player.x = Math.max(24, Math.min(336, player.x));
      player.y = Math.max(285, Math.min(450, player.y));

      // Automatic fire while FIRE is held, with a moderate firing rate.
      if (firing && time - lastShot >= 170) {
        fire();
        lastShot = time;
      }

      shots.forEach(shot => {
        shot.y -= shot.speed * dt / 16.7;
      });

      shots = shots.filter(shot => shot.y > -10);

      aliens.forEach(alien => {
        if (!alien.alive) return;

        // Higher difficulty increases enemy movement.
        alien.x = alien.startX +
          Math.sin(time / (600 / d.enemies) + alien.row) *
          (10 * d.enemies);

        shots.forEach(shot => {
          if (
            Math.abs(shot.x - alien.x) < 16 &&
            Math.abs(shot.y - alien.y) < 15
          ) {
            alien.alive = false;
            shot.y = -100;
            score += 10;
          }
        });

        // Enemies advance faster at higher difficulties.
        alien.y += .008 * d.enemies * dt / 16.7;

        if (alien.y > player.y - 28) alive = false;
      });

      ctx.fillStyle = '#07101f';
      ctx.fillRect(0, 0, 360, 480);

      // Animated starfield.
      stars.forEach(star => {
        star.y += star.speed * dt / 16.7;

        if (star.y > 480) {
          star.y = 0;
          star.x = Math.random() * 360;
        }

        ctx.fillStyle = '#9dbedc';
        ctx.globalAlpha = .35 + star.size * .25;
        ctx.fillRect(star.x, star.y, star.size, star.size);
      });

      ctx.globalAlpha = 1;

      aliens.forEach(alien => {
        if (alien.alive) drawAlien(alien);
      });

      ctx.fillStyle = '#35e8ff';

      shots.forEach(shot => {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#35e8ff';
        ctx.fillRect(shot.x - 2, shot.y, 4, 12);
        ctx.restore();
      });

      drawJet(player.x, player.y);

      status(
        `Score: ${score} · Aliens remaining: ${aliens.filter(a => a.alive).length}`
      );

      if (aliens.every(alien => !alien.alive)) {
        alive = false;
        status(`🏆 Earth is safe! Final score: ${score}`);
      } else if (!alive) {
        status(`The aliens reached your ship! Score: ${score}.`);
      } else {
        animationFrame = requestAnimationFrame(tick);
      }
    }

    function onKeyDown(e) {
      if (currentGame !== 'alien') return;

      if (
        ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)
      ) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') movementX = -1;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') movementX = 1;
      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') movementY = -1;
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') movementY = 1;

      if (e.code === 'Space') firing = true;
    }

    function onKeyUp(e) {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        if (movementX < 0) movementX = 0;
      }

      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        if (movementX > 0) movementX = 0;
      }

      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        if (movementY < 0) movementY = 0;
      }

      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        if (movementY > 0) movementY = 0;
      }

      if (e.code === 'Space') firing = false;
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    cleanupGame = () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      firing = false;
    };

    addTouchpad(ui.controls, (x, y) => {
      movementX = x;
      movementY = y;
    }, {
      fire: true,
      fireLabel: 'FIRE',
      fireRate: 170,
      onFire: () => {
        if (!firing) {
          firing = true;
          fire();
          lastShot = performance.now();
        }
      }
    });

    /*
     * Override the normal hold handling with a dedicated hold-state
     * using the actual pointer events, avoiding dependence on repeat taps.
     */
    const fireButton = ui.controls.querySelector('.nx2-fire');

    if (fireButton) {
      fireButton.addEventListener('pointerdown', () => {
        firing = true;
      });

      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(name => {
        fireButton.addEventListener(name, () => {
          firing = false;
        });
      });
    }

    ui.help.textContent =
      'Drag the touchpad in any direction to pilot your detailed jet fighter. Hold FIRE for continuous shooting. Keyboard: arrows or WASD to move, Space to shoot. Higher difficulties increase enemy pressure without making your jet faster.';

    reset();
  }

  // ============================================================
  // 7. TARGET MASTER
  // ============================================================

  function startTarget() {
    const ui = shell('Use the touchpad to aim and tap the target to score.');

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 420;
    ui.area.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    let target;
    let score;
    let remaining;
    let active;
    let interval;

    function placeTarget() {
      target = {
        x: 25 + Math.random() * 310,
        y: 25 + Math.random() * 370,
        r: Math.max(8, 19 / activeDifficulty().speed)
      };
    }

    function draw() {
      ctx.fillStyle = '#07101f';
      ctx.fillRect(0, 0, 360, 420);

      ctx.strokeStyle = '#16334e';

      for (let x = 0; x <= 360; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 420);
        ctx.stroke();
      }

      for (let y = 0; y <= 420; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(360, y);
        ctx.stroke();
      }

      if (!active) return;

      ctx.strokeStyle = '#35e8ff';
      ctx.lineWidth = 3;

      [target.r, target.r * .65, target.r * .3].forEach(radius => {
        ctx.beginPath();
        ctx.arc(target.x, target.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.fillStyle = '#ff6687';
      ctx.beginPath();
      ctx.arc(target.x, target.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    function reset() {
      clearInterval(interval);

      score = 0;
      remaining = Math.round(30 * activeDifficulty().time);
      active = true;

      placeTarget();
      draw();

      status(`Score: 0 · Time: ${remaining}s`);

      interval = setInterval(() => {
        remaining--;

        if (remaining <= 0) {
          remaining = 0;
          active = false;

          clearInterval(interval);

          status(`Time's up! Your score: ${score}`);
          draw();
          return;
        }

        status(`Score: ${score} · Time: ${remaining}s`);
      }, 1000);
    }

    canvas.addEventListener('pointerdown', event => {
      if (!active) return;

      const rect = canvas.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width * canvas.width;
      const y = (event.clientY - rect.top) / rect.height * canvas.height;

      if (Math.hypot(x - target.x, y - target.y) <= target.r + 7) {
        score++;
        placeTarget();

        status(`Nice shot! Score: ${score} · Time: ${remaining}s`);
        draw();
      }
    });

    cleanupGame = () => clearInterval(interval);

    ui.help.textContent =
      'Hit the targets before time runs out. Higher difficulty makes the targets smaller and reduces your time.';

    reset();
  }

  // ============================================================
  // 8. WORD SCRAMBLE
  // ============================================================

  function startWord() {
    const ui = shell('Unscramble the letters to discover the hidden word.');

    const words = [
      'PLANET', 'ROCKET', 'GALAXY', 'PUZZLE', 'ARCADE',
      'ENERGY', 'NEBULA', 'GAMING', 'DRAGON', 'COSMIC',
      'SHIELD', 'TARGET', 'LASERS', 'JUNGLE', 'RACING'
    ];

    let answer = '';
    let score = 0;
    let round = 0;

    const scrambled = document.createElement('div');
    scrambled.className = 'nx2-big';

    const input = document.createElement('input');
    input.className = 'nx2-input';
    input.type = 'text';
    input.autocomplete = 'off';
    input.autocapitalize = 'characters';
    input.maxLength = 12;
    input.placeholder = 'Type your answer';
    input.setAttribute('aria-label', 'Your word answer');

    const result = document.createElement('div');
    result.className = 'nx2-small';

    ui.area.append(scrambled, input, result);

    function nextWord() {
      answer = words[Math.floor(Math.random() * words.length)];

      let mixed = answer;

      while (mixed === answer && answer.length > 1) {
        mixed = answer.split('').sort(() => Math.random() - .5).join('');
      }

      scrambled.textContent = mixed;
      input.value = '';
      round++;

      result.textContent = `Round ${round}`;
      status(`Score: ${score}`);
    }

    function check() {
      if (!answer) return;

      if (input.value.trim().toUpperCase() === answer) {
        score += 10;
        result.textContent = 'Correct! +10 points';
        status(`Score: ${score}`);

        later(nextWord, 650);
      } else {
        result.textContent = 'Not quite. Try again!';
      }
    }

    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') check();
    });

    ui.controls.append(
      button('Check answer', check),
      button('Skip word', nextWord)
    );

    ui.help.textContent =
      'Each correct answer earns 10 points. The difficulty setting changes the scoring challenge.';

    nextWord();
  }

  // ============================================================
  // 9. AIR HOCKEY
  // ============================================================

  function startHockey() {
    const ui = shell('Move your paddle with the touchpad and score goals.');

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 500;
    ui.area.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    let player;
    let cpu;
    let puck;
    let playerScore;
    let cpuScore;
    let running;
    let last;

    function resetPuck(direction = 1) {
      puck = {
        x: 180,
        y: 250,
        vx: (Math.random() * 3 - 1.5) * direction,
        vy: 3 * direction,
        r: 9
      };
    }

    function reset() {
      player = { x: 180, y: 420, r: 22 };
      cpu = { x: 180, y: 80, r: 22 };

      playerScore = 0;
      cpuScore = 0;
      running = true;
      last = 0;

      resetPuck(1);

      status('You: 0 · Computer: 0');

      animationFrame = requestAnimationFrame(tick);
    }

    function tick(timestamp) {
      if (!running) return;

      const dt = Math.min(40, last ? timestamp - last : 16.7);
      last = timestamp;

      const d = activeDifficulty();

      cpu.x +=
        Math.sign(puck.x - cpu.x) *
        Math.min(2.1 * d.speed, dt * .08 * d.speed);

      cpu.x = Math.max(cpu.r, Math.min(360 - cpu.r, cpu.x));

      puck.x += puck.vx * dt / 16.7;
      puck.y += puck.vy * dt / 16.7;

      if (puck.x < puck.r || puck.x > 360 - puck.r) {
        puck.vx *= -1;
      }

      function collide(paddle) {
        const dx = puck.x - paddle.x;
        const dy = puck.y - paddle.y;
        const distance = Math.hypot(dx, dy);

        if (distance < puck.r + paddle.r && distance > 0) {
          const nx = dx / distance;
          const ny = dy / distance;

          puck.x = paddle.x + nx * (puck.r + paddle.r);
          puck.y = paddle.y + ny * (puck.r + paddle.r);

          puck.vx = nx * 4 * d.speed;
          puck.vy = ny * 4 * d.speed;
        }
      }

      collide(player);
      collide(cpu);

      if (puck.y < -5) {
        playerScore++;
        resetPuck(1);
      }

      if (puck.y > 505) {
        cpuScore++;
        resetPuck(-1);
      }

      ctx.fillStyle = '#07101f';
      ctx.fillRect(0, 0, 360, 500);

      ctx.strokeStyle = '#35e8ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(8, 8, 344, 484);

      ctx.beginPath();
      ctx.moveTo(8, 250);
      ctx.lineTo(352, 250);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(180, 250, 45, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#9b6cff';
      ctx.beginPath();
      ctx.arc(cpu.x, cpu.y, cpu.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#43f5a5';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff6687';
      ctx.beginPath();
      ctx.arc(puck.x, puck.y, puck.r, 0, Math.PI * 2);
      ctx.fill();

      status(`You: ${playerScore} · Computer: ${cpuScore}`);

      if (playerScore >= 5 || cpuScore >= 5) {
        running = false;

        status(
          playerScore >= 5
            ? '🏆 You won the match!'
            : 'Computer won. Try again!'
        );

        return;
      }

      animationFrame = requestAnimationFrame(tick);
    }

    addTouchpad(ui.controls, (x, y, active) => {
      if (!active || !player) return;

      player.x += x * 5 * activeDifficulty().speed;
      player.y += y * 5 * activeDifficulty().speed;

      player.x = Math.max(player.r, Math.min(360 - player.r, player.x));
      player.y = Math.max(275, Math.min(500 - player.r, player.y));
    });

    ui.help.textContent =
      'Drag the touchpad in any direction to move your paddle. First to five goals wins.';

    reset();
  }

  // ============================================================
  // 10. NEON MAZE — RESPONSIVE MOVEMENT
  // ============================================================

  function startMaze() {
    const ui = shell('Navigate through the maze to reach the green exit.');

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 360;
    ui.area.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    let size;
    let grid;
    let player;
    let exit;
    let cell;
    let steps;
    let finished;
    let lastMove = 0;
    let queuedDirection = null;
    let moveTimer = 0;

    const directions = [
      { dx: 0, dy: -1, wall: 0, opposite: 2 },
      { dx: 1, dy: 0, wall: 1, opposite: 3 },
      { dx: 0, dy: 1, wall: 2, opposite: 0 },
      { dx: -1, dy: 0, wall: 3, opposite: 1 }
    ];

    function generateMaze() {
      size = difficulty === 'Easy' ? 9 :
        difficulty === 'Medium' ? 13 :
        difficulty === 'Hard' ? 17 : 21;

      cell = 360 / size;

      grid = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => ({
          visited: false,
          walls: [true, true, true, true]
        }))
      );

      const stack = [{ x: 0, y: 0 }];

      grid[0][0].visited = true;

      while (stack.length) {
        const current = stack[stack.length - 1];

        const available = directions.filter(direction => {
          const nx = current.x + direction.dx;
          const ny = current.y + direction.dy;

          return nx >= 0 &&
            ny >= 0 &&
            nx < size &&
            ny < size &&
            !grid[ny][nx].visited;
        });

        if (!available.length) {
          stack.pop();
          continue;
        }

        const direction =
          available[Math.floor(Math.random() * available.length)];

        const nx = current.x + direction.dx;
        const ny = current.y + direction.dy;

        grid[current.y][current.x].walls[direction.wall] = false;
        grid[ny][nx].walls[direction.opposite] = false;

        grid[ny][nx].visited = true;

        stack.push({ x: nx, y: ny });
      }

      player = { x: 0, y: 0 };
      exit = { x: size - 1, y: size - 1 };
      steps = 0;
      finished = false;
      lastMove = 0;
      queuedDirection = null;
    }

    function draw() {
      ctx.fillStyle = '#040a14';
      ctx.fillRect(0, 0, 360, 360);

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const c = grid[y][x];
          const px = x * cell;
          const py = y * cell;

          ctx.fillStyle = '#0b1829';
          ctx.fillRect(px, py, cell, cell);

          ctx.strokeStyle = '#35e8ff';
          ctx.lineWidth = Math.max(1.2, 3 - size / 12);
          ctx.lineCap = 'square';

          if (c.walls[0]) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + cell, py);
            ctx.stroke();
          }

          if (c.walls[1]) {
            ctx.beginPath();
            ctx.moveTo(px + cell, py);
            ctx.lineTo(px + cell, py + cell);
            ctx.stroke();
          }

          if (c.walls[2]) {
            ctx.beginPath();
            ctx.moveTo(px, py + cell);
            ctx.lineTo(px + cell, py + cell);
            ctx.stroke();
          }

          if (c.walls[3]) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px, py + cell);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = '#43f5a5';
      ctx.fillRect(
        exit.x * cell + cell * .2,
        exit.y * cell + cell * .2,
        cell * .6,
        cell * .6
      );

      // Player marker.
      ctx.fillStyle = '#ff6687';
      ctx.beginPath();

      ctx.arc(
        player.x * cell + cell / 2,
        player.y * cell + cell / 2,
        Math.max(3, cell * .27),
        0,
        Math.PI * 2
      );

      ctx.fill();

      // Highlight the current position.
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(
        player.x * cell + cell / 2,
        player.y * cell + cell / 2,
        Math.max(4, cell * .36),
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    function move(dx, dy) {
      if (finished) return false;

      let directionIndex;

      if (dx === 0 && dy === -1) directionIndex = 0;
      else if (dx === 1 && dy === 0) directionIndex = 1;
      else if (dx === 0 && dy === 1) directionIndex = 2;
      else if (dx === -1 && dy === 0) directionIndex = 3;
      else return false;

      const current = grid[player.y][player.x];

      if (current.walls[directionIndex]) return false;

      player.x += dx;
      player.y += dy;
      steps++;

      if (player.x === exit.x && player.y === exit.y) {
        finished = true;
        status(`🏆 You escaped the maze in ${steps} moves!`);
      } else {
        status(`Moves: ${steps} · Find the green exit.`);
      }

      draw();
      return true;
    }

    /*
     * The joystick selects one direction at a time.
     * A short movement cooldown prevents one drag from skipping cells.
     * Repeated movement is supported while the joystick is held.
     */

    function requestMove(dx, dy) {
      if (finished) return;

      const now = performance.now();

      if (now - lastMove < 105) {
        queuedDirection = { dx, dy };
        return;
      }

      lastMove = now;
      queuedDirection = null;

      move(dx, dy);
    }

    function onKeyDown(e) {
      if (currentGame !== 'maze') return;

      const map = {
        ArrowUp: [0, -1],
        ArrowRight: [1, 0],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        w: [0, -1],
        d: [1, 0],
        s: [0, 1],
        a: [-1, 0]
      };

      const direction = map[e.key];

      if (direction) {
        e.preventDefault();
        requestMove(direction[0], direction[1]);
      }
    }

    window.addEventListener('keydown', onKeyDown);

    cleanupGame = () => {
      window.removeEventListener('keydown', onKeyDown);
      if (moveTimer) clearInterval(moveTimer);
    };

    addTouchpad(ui.controls, (x, y, active) => {
      if (!active || finished) {
        queuedDirection = null;
        return;
      }

      if (Math.abs(x) < .3 && Math.abs(y) < .3) return;

      if (Math.abs(x) > Math.abs(y)) {
        requestMove(x > 0 ? 1 : -1, 0);
      } else {
        requestMove(0, y > 0 ? 1 : -1);
      }
    });

    /*
     * Drain a queued movement only after the previous movement cooldown.
     * This keeps directional input responsive without jumping multiple cells.
     */
    moveTimer = setInterval(() => {
      if (!queuedDirection || finished) return;

      const now = performance.now();

      if (now - lastMove >= 105) {
        const direction = queuedDirection;
        queuedDirection = null;
        requestMove(direction.dx, direction.dy);
      }
    }, 35);

    ui.help.textContent =
      'Drag the touchpad in the direction you want to travel. Movement responds quickly while preventing accidental jumps across several cells. Every maze is randomly generated. Higher difficulty creates a larger maze.';

    generateMaze();
    draw();
  }

})();