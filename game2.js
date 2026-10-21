```javascript
(() => {
  'use strict';

  /*
   * REXWEB NEXORA — EXTRA ARCADE
   * Ten additional arcade games.
   * Supports #nexora-games and standalone loading.
   */

  function initNexoraExtraArcade() {
    const existingLauncher = document.getElementById('nx2-launcher');
    const existingOverlay = document.getElementById('nx2-overlay');

    if (existingLauncher && existingOverlay) return;
    if (existingLauncher) existingLauncher.remove();
    if (existingOverlay) existingOverlay.remove();

    let ROOT = document.getElementById('nexora-games');

    if (!ROOT) {
      ROOT = document.createElement('div');
      ROOT.id = 'nexora-games';
      document.body.appendChild(ROOT);
    }

    const GAMES = [
      { id: 'memory', icon: '🧠', name: 'Memory Match', image: 'photo-1516321318423-f06f85e504b3' },
      { id: 'racing', icon: '🏎️', name: 'Neon Racing', image: 'photo-1492144534655-ae79c964c9d7' },
      { id: 'tower', icon: '🗼', name: 'Tower Stack', image: 'photo-1511818966892-d7d671e672a2' },
      { id: 'mine', icon: '💣', name: 'Minefield Mystery', image: 'photo-1518709268805-4e9042af9f23' },
      { id: 'puzzle', icon: '🧩', name: 'Sliding Puzzle', image: 'photo-1513364776144-60967b0f800f' },
      { id: 'alien', icon: '👾', name: 'Alien Invasion', image: 'photo-1446776811953-b23d57bd21aa' },
      { id: 'ninja', icon: '🥷', name: 'Ninja Shadow Strike', image: 'photo-1518709268805-4e9042af9f23' },
      { id: 'word', icon: '🔤', name: 'Word Scramble', image: 'photo-1455390582262-044cdead277a' },
      { id: 'hockey', icon: '🏒', name: 'Air Hockey', image: 'photo-1519861531473-9200262188bf' },
      { id: 'maze', icon: '🌀', name: 'Neon Maze', image: 'photo-1519608487953-e999c86e7455' }
    ];

    const DIFFICULTIES = {
      Easy: { speed: 0.75, enemy: 0.65, time: 1.4, target: 1.3 },
      Medium: { speed: 1, enemy: 1, time: 1, target: 1 },
      Hard: { speed: 1, enemy: 1.4, time: 0.8, target: 0.8 },
      Hardest: { speed: 1, enemy: 1.9, time: 0.65, target: 0.6 }
    };

    let difficulty = 'Medium';
    let activeGame = null;
    let gameToken = 0;
    let animationFrame = 0;
    let timers = [];
    let cleanupGame = null;
    let score = 0;
    let bestScore = 0;

    const launcher = document.createElement('section');
    launcher.id = 'nx2-launcher';

    const overlay = document.createElement('div');
    overlay.id = 'nx2-overlay';
    overlay.hidden = true;

    const style = document.createElement('style');
    style.id = 'nx2-styles';
    style.textContent = `
      #nx2-launcher {
        width: 100%;
        box-sizing: border-box;
        margin: 0 auto 18px;
        padding: 12px;
        color: #f2f7ff;
        background: #050914;
        border: 1px solid #17283d;
        border-radius: 16px;
        font-family: system-ui, sans-serif;
      }

      #nx2-launcher * , #nx2-overlay * {
        box-sizing: border-box;
      }

      #nx2-launcher .nx2-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      #nx2-launcher .nx2-heading h2 {
        margin: 0;
        font-size: clamp(16px, 4vw, 22px);
        color: #35e8ff;
      }

      #nx2-launcher .nx2-heading span {
        font-size: 10px;
        color: #9aaec7;
        letter-spacing: 1px;
      }

      #nx2-launcher .nx2-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 7px;
      }

      #nx2-launcher .nx2-card {
        min-width: 0;
        min-height: 90px;
        height: clamp(82px, 19vw, 120px);
        padding: 5px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        gap: 4px;
        overflow: hidden;
        position: relative;
        border: 1px solid #35e8ff;
        border-radius: 10px;
        background-color: #101a2b;
        background-position: center;
        background-size: cover;
        color: white;
        cursor: pointer;
        text-align: center;
        box-shadow: inset 0 0 12px #35e8ff18;
        transition: transform .15s ease, border-color .15s ease;
      }

      #nx2-launcher .nx2-card::before {
        content: "";
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, #03071240, #030712f5);
      }

      #nx2-launcher .nx2-card:active {
        transform: scale(.96);
      }

      #nx2-launcher .nx2-card .nx2-icon,
      #nx2-launcher .nx2-card .nx2-name {
        position: relative;
        z-index: 1;
      }

      #nx2-launcher .nx2-icon {
        font-size: clamp(20px, 5vw, 30px);
        line-height: 1.1;
      }

      #nx2-launcher .nx2-name {
        font-size: clamp(8px, 2.1vw, 11px);
        line-height: 1.15;
        font-weight: 800;
        overflow-wrap: anywhere;
      }

      #nx2-overlay {
        position: fixed;
        z-index: 2147483000;
        inset: 0;
        width: 100%;
        height: 100%;
        height: 100dvh;
        overflow: auto;
        overscroll-behavior: contain;
        background: #050914;
        color: #f2f7ff;
        font-family: system-ui, sans-serif;
        padding: max(8px, env(safe-area-inset-top)) 10px max(12px, env(safe-area-inset-bottom));
      }

      #nx2-overlay[hidden] {
        display: none !important;
      }

      #nx2-overlay .nx2-topbar {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 6px 0 10px;
        background: #050914f5;
      }

      #nx2-overlay button {
        font: inherit;
        touch-action: manipulation;
      }

      #nx2-overlay .nx2-topbtn {
        border: 1px solid #35e8ff;
        border-radius: 9px;
        background: #0b1728;
        color: #35e8ff;
        padding: 8px 10px;
        font-size: 12px;
        font-weight: 800;
        white-space: nowrap;
        cursor: pointer;
      }

      #nx2-overlay .nx2-title {
        min-width: 0;
        flex: 1;
        text-align: center;
        color: #35e8ff;
        font-size: clamp(13px, 3.6vw, 18px);
        font-weight: 900;
        overflow-wrap: anywhere;
      }

      #nx2-overlay .nx2-settings {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 4px 0 10px;
      }

      #nx2-overlay details {
        position: relative;
        font-size: 12px;
      }

      #nx2-overlay summary {
        border: 1px solid #9b6cff;
        border-radius: 8px;
        padding: 7px 10px;
        color: #d8c6ff;
        background: #151026;
        cursor: pointer;
        list-style-position: inside;
      }

      #nx2-overlay .nx2-difficulty-list {
        position: absolute;
        top: calc(100% + 5px);
        left: 0;
        z-index: 50;
        display: grid;
        gap: 5px;
        min-width: 130px;
        padding: 7px;
        border: 1px solid #9b6cff;
        border-radius: 10px;
        background: #0b1020;
        box-shadow: 0 8px 25px #000a;
      }

      #nx2-overlay .nx2-difficulty-list button {
        padding: 8px;
        color: white;
        background: #141d31;
        border: 1px solid #27354d;
        border-radius: 7px;
        text-align: left;
        cursor: pointer;
      }

      #nx2-overlay .nx2-difficulty-list button.active {
        color: #35e8ff;
        border-color: #35e8ff;
      }

      #nx2-overlay .nx2-status {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 12px;
        color: #b9c9df;
        font-size: 12px;
        margin: 8px 0;
      }

      #nx2-overlay .nx2-status strong {
        color: #43f5a5;
      }

      #nx2-overlay #nx2-game-area {
        width: 100%;
        max-width: 850px;
        margin: 0 auto;
        min-height: 220px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      #nx2-overlay #nx2-game-area canvas {
        display: block;
        width: 100%;
        max-width: 800px;
        height: auto;
        max-height: 64vh;
        border: 1px solid #27405e;
        border-radius: 10px;
        background: #070d19;
        touch-action: none;
      }

      #nx2-overlay .nx2-message {
        text-align: center;
        color: #c8d6e8;
        font-size: 13px;
        line-height: 1.5;
        padding: 6px;
      }

      #nx2-overlay .nx2-controls {
        width: 100%;
        max-width: 520px;
        margin: 12px auto 0;
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 8px;
      }

      #nx2-overlay .nx2-touch-area {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
      }

      #nx2-overlay .nx2-pad {
        position: relative;
        flex: 1;
        height: 104px;
        min-width: 0;
        border: 2px solid #35e8ff;
        border-radius: 16px;
        background: linear-gradient(135deg, #0b1930, #101024);
        box-shadow: inset 0 0 16px #35e8ff1c, 0 0 10px #35e8ff17;
        touch-action: none;
        overflow: hidden;
      }

      #nx2-overlay .nx2-pad::before,
      #nx2-overlay .nx2-pad::after {
        content: "";
        position: absolute;
        background: #35e8ff30;
        pointer-events: none;
      }

      #nx2-overlay .nx2-pad::before {
        width: 1px;
        top: 0;
        bottom: 0;
        left: 50%;
      }

      #nx2-overlay .nx2-pad::after {
        height: 1px;
        left: 0;
        right: 0;
        top: 50%;
      }

      #nx2-overlay .nx2-pad-inner {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
      }

      #nx2-overlay .nx2-knob {
        width: 48px;
        height: 48px;
        border: 2px solid #35e8ff;
        border-radius: 12px;
        background: #35e8ff24;
        box-shadow: 0 0 15px #35e8ff45;
        transform: translate(0, 0);
      }

      #nx2-overlay .nx2-fire {
        flex: 0 0 82px;
        height: 82px;
        border: 2px solid #ff5f87;
        border-radius: 18px;
        background: #2a1023;
        color: #ff9db7;
        font-size: 12px;
        font-weight: 900;
        cursor: pointer;
        touch-action: none;
      }

      #nx2-overlay .nx2-action {
        padding: 10px 14px;
        border: 1px solid #35e8ff;
        border-radius: 9px;
        background: #0b1728;
        color: #35e8ff;
        font-weight: 800;
        cursor: pointer;
      }

      #nx2-overlay .nx2-action-row {
        display: flex;
        justify-content: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      #nx2-overlay .nx2-board {
        display: grid;
        gap: 4px;
        width: min(92vw, 420px);
        margin: auto;
        touch-action: manipulation;
      }

      #nx2-overlay .nx2-tile {
        min-width: 0;
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #2b4563;
        border-radius: 6px;
        background: #101d32;
        color: #35e8ff;
        font-size: clamp(12px, 3.5vw, 22px);
        font-weight: 900;
        cursor: pointer;
      }

      #nx2-overlay .nx2-tile.empty {
        border-color: transparent;
        background: #080e1a;
        cursor: default;
      }

      #nx2-overlay .nx2-tile.revealed {
        background: #13273a;
        color: #43f5a5;
      }

      #nx2-overlay .nx2-tile.mine {
        background: #48162b;
        color: #ff6c8d;
      }

      #nx2-overlay .nx2-word {
        width: 100%;
        max-width: 480px;
        text-align: center;
      }

      #nx2-overlay .nx2-word-display {
        font-size: clamp(24px, 7vw, 42px);
        letter-spacing: 5px;
        font-weight: 900;
        color: #35e8ff;
        margin: 15px 0;
        overflow-wrap: anywhere;
      }

      #nx2-overlay .nx2-word-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #35e8ff;
        border-radius: 9px;
        color: white;
        background: #0a1424;
        font-size: 16px;
        outline: none;
      }

      #nx2-overlay .nx2-word-input:focus {
        box-shadow: 0 0 12px #35e8ff30;
      }

      #nx2-overlay .nx2-hockey {
        position: relative;
        width: 100%;
        max-width: 620px;
        aspect-ratio: 1.3;
        overflow: hidden;
        border: 2px solid #35e8ff;
        border-radius: 14px;
        background: repeating-linear-gradient(0deg, #0b1830, #0b1830 24px, #0d1c36 25px);
        touch-action: none;
      }

      #nx2-overlay .nx2-hockey::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        border-left: 2px dashed #35e8ff75;
      }

      #nx2-overlay .nx2-paddle,
      #nx2-overlay .nx2-puck {
        position: absolute;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }

      #nx2-overlay .nx2-paddle {
        width: 42px;
        height: 42px;
        border: 3px solid #35e8ff;
        background: #35e8ff32;
        box-shadow: 0 0 12px #35e8ff55;
      }

      #nx2-overlay .nx2-paddle.enemy {
        border-color: #ff5f87;
        background: #ff5f8730;
      }

      #nx2-overlay .nx2-puck {
        width: 19px;
        height: 19px;
        background: white;
        box-shadow: 0 0 12px white;
      }

      #nx2-overlay .nx2-numbers {
        display: flex;
        justify-content: center;
        gap: 18px;
        font-size: 15px;
        font-weight: 900;
      }

      #nx2-overlay .nx2-numbers span:first-child {
        color: #35e8ff;
      }

      #nx2-overlay .nx2-numbers span:last-child {
        color: #ff5f87;
      }

      @media (max-width: 480px) {
        #nx2-launcher { padding: 8px; }
        #nx2-launcher .nx2-grid { gap: 5px; }
        #nx2-launcher .nx2-card {
          min-height: 75px;
          height: 20vw;
          padding: 3px;
          border-radius: 8px;
        }
        #nx2-launcher .nx2-name { font-size: 8px; }
        #nx2-overlay { padding-left: 7px; padding-right: 7px; }
        #nx2-overlay .nx2-topbtn { padding: 7px; font-size: 11px; }
        #nx2-overlay .nx2-pad { height: 96px; }
        #nx2-overlay .nx2-fire { flex-basis: 72px; height: 72px; }
      }

      @media (prefers-reduced-motion: reduce) {
        #nx2-launcher .nx2-card { transition: none; }
      }
    `;

    if (!document.getElementById('nx2-styles')) {
      document.head.appendChild(style);
    }

    launcher.innerHTML = `
      <div class="nx2-heading">
        <h2>⚡ EXTRA ARCADE</h2>
        <span>10 GAMES</span>
      </div>
      <div class="nx2-grid">
        ${GAMES.map(game => `
          <button class="nx2-card" type="button" data-game="${game.id}"
            style="background-image:url('https://images.unsplash.com/${game.image}?auto=format&fit=crop&w=320&q=70')"
            aria-label="Play ${game.name}">
            <span class="nx2-icon">${game.icon}</span>
            <span class="nx2-name">${game.name}</span>
          </button>
        `).join('')}
      </div>
    `;

    overlay.innerHTML = `
      <div class="nx2-topbar">
        <button class="nx2-topbtn" id="nx2-back" type="button">← Games</button>
        <div class="nx2-title" id="nx2-title">EXTRA ARCADE</div>
        <button class="nx2-topbtn" id="nx2-restart" type="button">↻ Restart</button>
      </div>

      <div class="nx2-settings">
        <details id="nx2-difficulty">
          <summary>Difficulty: <span id="nx2-difficulty-label">Medium</span></summary>
          <div class="nx2-difficulty-list">
            ${Object.keys(DIFFICULTIES).map(name =>
              `<button type="button" data-difficulty="${name}" class="${name === 'Medium' ? 'active' : ''}">${name}</button>`
            ).join('')}
          </div>
        </details>
        <div class="nx2-status">
          <span>Score: <strong id="nx2-score">0</strong></span>
          <span>Best: <strong id="nx2-best">0</strong></span>
          <span id="nx2-extra-status"></span>
        </div>
      </div>

      <div id="nx2-game-area">
        <div class="nx2-message">Choose a game to begin.</div>
      </div>
      <div class="nx2-controls" id="nx2-controls"></div>
      <div class="nx2-message" id="nx2-help">Choose a game and have fun!</div>
    `;

    ROOT.insertBefore(launcher, ROOT.firstChild);
    document.body.appendChild(overlay);

    const $ = selector => overlay.querySelector(selector);
    const gameArea = $('#nx2-game-area');
    const controls = $('#nx2-controls');
    const help = $('#nx2-help');
    const title = $('#nx2-title');
    const scoreEl = $('#nx2-score');
    const bestEl = $('#nx2-best');
    const extraStatus = $('#nx2-extra-status');

    function setScore(value) {
      score = Math.max(0, Math.floor(value || 0));
      scoreEl.textContent = score;
      if (score > bestScore) {
        bestScore = score;
        bestEl.textContent = bestScore;
      }
    }

    function later(fn, ms) {
      const id = setTimeout(fn, ms);
      timers.push(id);
      return id;
    }

    function clearGame() {
      gameToken++;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      timers.forEach(clearTimeout);
      timers = [];
      if (typeof cleanupGame === 'function') {
        try { cleanupGame(); } catch (_) {}
      }
      cleanupGame = null;
      controls.innerHTML = '';
      extraStatus.textContent = '';
      document.onkeydown = null;
    }

    function shell(name, message) {
      clearGame();
      activeGame = name;
      title.textContent = GAMES.find(g => g.id === name)?.name || 'EXTRA ARCADE';
      gameArea.innerHTML = '';
      help.textContent = message || '';
      setScore(0);
      return gameToken;
    }

    function makeCanvas(width, height) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.setAttribute('aria-label', 'Game area');
      const ctx = canvas.getContext('2d');
      gameArea.appendChild(canvas);
      return { canvas, ctx, wrap: gameArea };
    }

    function addButton(label, fn, className = 'nx2-action') {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = className;
      button.textContent = label;
      button.addEventListener('click', fn);
      controls.appendChild(button);
      return button;
    }

    function addTouchpad(container, onMove, options = {}) {
      const area = document.createElement('div');
      area.className = 'nx2-touch-area';

      const pad = document.createElement('div');
      pad.className = 'nx2-pad';
      pad.setAttribute('aria-label', 'Touch joystick');

      const inner = document.createElement('div');
      inner.className = 'nx2-pad-inner';
      const knob = document.createElement('div');
      knob.className = 'nx2-knob';
      inner.appendChild(knob);
      pad.appendChild(inner);
      area.appendChild(pad);

      let pointerId = null;
      let rect = null;

      function resetPad() {
        pointerId = null;
        rect = null;
        knob.style.transform = 'translate(0px, 0px)';
        if (onMove) onMove(0, 0, false);
      }

      function update(event) {
        if (!rect) return;
        const dx = event.clientX - (rect.left + rect.width / 2);
        const dy = event.clientY - (rect.top + rect.height / 2);
        const maxX = rect.width * 0.35;
        const maxY = rect.height * 0.34;
        const x = Math.max(-1, Math.min(1, dx / maxX));
        const y = Math.max(-1, Math.min(1, dy / maxY));
        knob.style.transform = `translate(${x * maxX}px, ${y * maxY}px)`;
        if (onMove) onMove(x, y, true);
      }

      pad.addEventListener('pointerdown', event => {
        event.preventDefault();
        if (pointerId !== null) return;
        pointerId = event.pointerId;
        rect = pad.getBoundingClientRect();
        try { pad.setPointerCapture(pointerId); } catch (_) {}
        update(event);
      });

      pad.addEventListener('pointermove', event => {
        if (event.pointerId === pointerId) {
          event.preventDefault();
          update(event);
        }
      });

      pad.addEventListener('pointerup', event => {
        if (event.pointerId === pointerId) resetPad();
      });
      pad.addEventListener('pointercancel', resetPad);
      pad.addEventListener('lostpointercapture', resetPad);

      let fireButton = null;
      let fireTimer = null;

      if (options.fire) {
        fireButton = document.createElement('button');
        fireButton.type = 'button';
        fireButton.className = 'nx2-fire';
        fireButton.textContent = options.fireLabel || 'FIRE';
        area.appendChild(fireButton);

        const fire = () => {
          if (options.onFire) options.onFire();
        };

        fireButton.addEventListener('pointerdown', event => {
          event.preventDefault();
          fire();
          clearInterval(fireTimer);
          fireTimer = setInterval(fire, options.fireRate || 130);
          try { fireButton.setPointerCapture(event.pointerId); } catch (_) {}
        });

        const stopFire = () => {
          clearInterval(fireTimer);
          fireTimer = null;
        };
        fireButton.addEventListener('pointerup', stopFire);
        fireButton.addEventListener('pointercancel', stopFire);
        fireButton.addEventListener('lostpointercapture', stopFire);
        fireButton.addEventListener('contextmenu', event => event.preventDefault());

        const previousCleanup = cleanupGame;
        cleanupGame = () => {
          stopFire();
          if (previousCleanup) previousCleanup();
        };
      }

      container.appendChild(area);

      const previousCleanup = cleanupGame;
      cleanupGame = () => {
        resetPad();
        if (fireTimer) clearInterval(fireTimer);
        if (previousCleanup) previousCleanup();
      };

      return { pad, fireButton };
    }

    function keyHandler(handler) {
      document.onkeydown = event => {
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
          event.preventDefault();
        }
        handler(event);
      };
    }

    function finishGame(message) {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      const result = document.createElement('div');
      result.className = 'nx2-message';
      result.textContent = message;
      gameArea.appendChild(result);
      addButton('Play Again', () => startGame(activeGame));
    }

    function startMemory() {
      shell('memory', 'Flip two cards at a time and match every pair.');
      const token = gameToken;
      const board = document.createElement('div');
      board.className = 'nx2-board';
      board.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
      gameArea.appendChild(board);

      const symbols = ['🚀', '👾', '💎', '🐉', '⚡', '🎯', '🌙', '🔥'];
      const cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
      let first = null;
      let lock = false;
      let matched = 0;
      let moves = 0;

      cards.forEach((symbol, index) => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'nx2-tile';
        card.textContent = '?';
        card.dataset.symbol = symbol;
        card.dataset.index = index;

        card.addEventListener('click', () => {
          if (token !== gameToken || lock || card.classList.contains('revealed') || card.classList.contains('matched')) return;
          card.classList.add('revealed');
          card.textContent = symbol;

          if (!first) {
            first = card;
            return;
          }

          moves++;
          lock = true;
          if (first.dataset.symbol === symbol) {
            first.classList.add('matched');
            card.classList.add('matched');
            matched += 2;
            setScore(score + 10);
            first = null;
            lock = false;
            if (matched === cards.length) {
              help.textContent = `All pairs matched in ${moves} moves!`;
              finishGame(`Victory! You matched every pair in ${moves} moves.`);
            }
          } else {
            const oldFirst = first;
            first = null;
            later(() => {
              if (token !== gameToken) return;
              oldFirst.classList.remove('revealed');
              card.classList.remove('revealed');
              oldFirst.textContent = '?';
              card.textContent = '?';
              lock = false;
            }, 650);
          }
        });

        board.appendChild(card);
      });
    }

    function startRacing() {
      shell('racing', 'Steer left and right to avoid traffic. Survive as long as possible.');
      const token = gameToken;
      const { canvas, ctx } = makeCanvas(480, 640);

      let playerX = 240;
      let lane = 1;
      let cars = [];
      let elapsed = 0;
      let last = 0;
      let alive = true;
      let spawn = 0;
      let roadOffset = 0;
      let remaining = 3600;
      let steer = 0;
      const speed = 260;
      const playerY = 530;

      function drawCar(x, y, color, player = false) {
        ctx.fillStyle = '#05070d';
        ctx.fillRect(x - 18, y - 31, 36, 62);
        ctx.fillStyle = color;
        ctx.fillRect(x - 13, y - 28, 26, 56);
        ctx.fillStyle = player ? '#b8f9ff' : '#ffe3a6';
        ctx.fillRect(x - 9, y - 20, 18, 13);
        ctx.fillStyle = '#121b2a';
        ctx.fillRect(x - 9, y + 4, 18, 12);
        ctx.fillStyle = '#f8faff';
        ctx.fillRect(x - 15, y - 22, 4, 8);
        ctx.fillRect(x + 11, y - 22, 4, 8);
        ctx.fillStyle = '#ff476f';
        ctx.fillRect(x - 15, y + 18, 4, 7);
        ctx.fillRect(x + 11, y + 18, 4, 7);
      }

      function frame(time) {
        if (token !== gameToken || !alive) return;
        const dt = Math.min(0.04, last ? (time - last) / 1000 : 0);
        last = time;
        elapsed += dt;
        remaining = Math.max(0, 3600 - elapsed);
        extraStatus.textContent = `${Math.floor(remaining / 60)}:${String(Math.floor(remaining % 60)).padStart(2, '0')}`;

        roadOffset = (roadOffset + speed * dt) % 80;
        playerX += steer * 350 * dt;
        playerX = Math.max(110, Math.min(370, playerX));

        spawn += dt;
        if (spawn > Math.max(0.35, 0.9 / DIFFICULTIES[difficulty].enemy)) {
          spawn = 0;
          const lanes = [150, 240, 330];
          const x = lanes[Math.floor(Math.random() * lanes.length)];
          cars.push({ x, y: -40, speed: (180 + Math.random() * 130) * DIFFICULTIES[difficulty].enemy });
        }

        cars.forEach(car => car.y += car.speed * dt);
        cars = cars.filter(car => car.y < 700);

        for (const car of cars) {
          if (Math.abs(car.x - playerX) < 30 && Math.abs(car.y - playerY) < 45) {
            alive = false;
            finishGame('Crash! Try again and dodge the traffic.');
            return;
          }
        }

        setScore(Math.floor(elapsed * 10));
        ctx.fillStyle = '#10151e';
        ctx.fillRect(0, 0, 480, 640);
        ctx.fillStyle = '#282f3a';
        ctx.fillRect(95, 0, 290, 640);
        ctx.fillStyle = '#d8dce4';
        for (let y = -80 + roadOffset; y < 640; y += 80) {
          ctx.fillRect(187, y, 5, 40);
          ctx.fillRect(288, y, 5, 40);
        }
        ctx.fillStyle = '#43f5a5';
        ctx.fillRect(96, 0, 3, 640);
        ctx.fillRect(381, 0, 3, 640);

        cars.forEach(car => drawCar(car.x, car.y, '#ff4770'));
        drawCar(playerX, playerY, '#35e8ff', true);

        if (remaining <= 0) {
          alive = false;
          finishGame('Race complete! You survived the full 60-minute challenge.');
          return;
        }

        animationFrame = requestAnimationFrame(frame);
      }

      addTouchpad(controls, x => { steer = x; });
      keyHandler(event => {
        if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') steer = -1;
        if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') steer = 1;
      });

      window.addEventListener('pointerup', () => { steer = 0; }, { once: true });
      later(() => {
        if (token !== gameToken) return;
        animationFrame = requestAnimationFrame(frame);
      }, 0);

      cleanupGame = () => {
        alive = false;
        document.onkeydown = null;
      };
    }

    function startTower() {
      shell('tower', 'Tap or press Space to drop the moving block. Stack as high as you can.');
      const token = gameToken;
      const { canvas, ctx } = makeCanvas(420, 560);

      let blocks = [{ x: 90, y: 480, w: 240, h: 24 }];
      let moving = { x: 0, y: 450, w: 240, h: 24, dir: 1 };
      let speed = 170 * DIFFICULTIES[difficulty].enemy;
      let alive = true;
      let last = 0;

      function draw() {
        ctx.fillStyle = '#070d19';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        blocks.forEach((b, i) => {
          ctx.fillStyle = `hsl(${185 + i * 19}, 90%, 55%)`;
          ctx.fillRect(b.x, b.y, b.w, b.h);
          ctx.strokeStyle = '#d5fbff';
          ctx.strokeRect(b.x, b.y, b.w, b.h);
        });
        ctx.fillStyle = '#9b6cff';
        ctx.fillRect(moving.x, moving.y, moving.w, moving.h);
      }

      function drop() {
        if (!alive || token !== gameToken) return;
        const top = blocks[blocks.length - 1];
        const left = Math.max(top.x, moving.x);
        const right = Math.min(top.x + top.w, moving.x + moving.w);
        const width = right - left;

        if (width <= 0) {
          alive = false;
          finishGame('The block missed the tower. Try again!');
          return;
        }

        blocks.push({ x: left, y: moving.y, w: width, h: 24 });
        setScore(blocks.length - 1);
        if (width < 10) {
          alive = false;
          finishGame('Tower complete! You stacked a very narrow block.');
          return;
        }

        moving = {
          x: moving.dir > 0 ? -width : canvas.width,
          y: moving.y - 30,
          w: width,
          h: 24,
          dir: moving.dir * -1
        };

        if (moving.y < 50) {
          alive = false;
          finishGame('Amazing tower! You reached the top.');
        }
      }

      canvas.addEventListener('pointerdown', event => {
        event.preventDefault();
        drop();
      });

      addButton('DROP BLOCK', drop);
      keyHandler(event => {
        if (event.code === 'Space' || event.key === 'Enter') drop();
      });

      function frame(time) {
        if (token !== gameToken || !alive) return;
        const dt = Math.min(0.04, last ? (time - last) / 1000 : 0);
        last = time;
        moving.x += moving.dir * speed * dt;
        if (moving.x + moving.w > canvas.width) {
          moving.x = canvas.width - moving.w;
          moving.dir = -1;
        }
        if (moving.x < 0) {
          moving.x = 0;
          moving.dir = 1;
        }
        draw();
        animationFrame = requestAnimationFrame(frame);
      }

      animationFrame = requestAnimationFrame(frame);
      cleanupGame = () => { alive = false; document.onkeydown = null; };
    }

    function startMine() {
      shell('mine', 'Reveal safe squares and avoid hidden mines. Numbers show nearby mines.');
      const token = gameToken;
      const size = 8;
      const mineCount = difficulty === 'Easy' ? 8 : difficulty === 'Hardest' ? 18 : difficulty === 'Hard' ? 15 : 12;
      const board = document.createElement('div');
      board.className = 'nx2-board';
      board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
      gameArea.appendChild(board);

      const cells = Array.from({ length: size * size }, () => ({ mine: false, revealed: false, count: 0 }));
      let placed = 0;
      while (placed < mineCount) {
        const i = Math.floor(Math.random() * cells.length);
        if (!cells[i].mine) {
          cells[i].mine = true;
          placed++;
        }
      }

      function neighbors(index) {
        const x = index % size;
        const y = Math.floor(index / size);
        const list = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (!dx && !dy) continue;
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < size && ny >= 0 && ny < size) list.push(ny * size + nx);
          }
        }
        return list;
      }

      cells.forEach((cell, i) => {
        cell.count = neighbors(i).filter(n => cells[n].mine).length;
      });

      let revealed = 0;
      let ended = false;

      function reveal(index) {
        if (token !== gameToken || ended) return;
        const cell = cells[index];
        const button = board.children[index];
        if (cell.revealed) return;
        cell.revealed = true;
        button.classList.add('revealed');

        if (cell.mine) {
          ended = true;
          button.classList.add('mine');
          button.textContent = '💣';
          cells.forEach((other, i) => {
            if (other.mine) {
              board.children[i].textContent = '💣';
              board.children[i].classList.add('mine');
            }
          });
          finishGame('Boom! You found a mine. Try again.');
          return;
        }

        revealed++;
        button.textContent = cell.count ? cell.count : '·';
        button.style.color = ['#43f5a5', '#35e8ff', '#9b6cff', '#ffbd59'][cell.count % 4];
        setScore(revealed * 5);

        if (cell.count === 0) neighbors(index).forEach(n => {
          if (!cells[n].revealed && !cells[n].mine) reveal(n);
        });

        if (revealed === cells.length - mineCount) {
          ended = true;
          finishGame('Minefield cleared! Every safe square is revealed.');
        }
      }

      cells.forEach((cell, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'nx2-tile';
        button.textContent = '?';
        button.addEventListener('click', () => reveal(index));
        board.appendChild(button);
      });
    }

    function startPuzzle() {
      shell('puzzle', 'Arrange the numbered tiles in order. The empty square is used to move tiles.');
      const token = gameToken;
      const size = 4;
      const board = document.createElement('div');
      board.className = 'nx2-board';
      board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
      gameArea.appendChild(board);

      let tiles = Array.from({ length: size * size - 1 }, (_, i) => i + 1).concat(0);
      const directions = [-size, size, -1, 1];

      function validMove(index, next) {
        if (next < 0 || next >= tiles.length) return false;
        if (Math.abs(next % size - index % size) + Math.abs(Math.floor(next / size) - Math.floor(index / size)) !== 1) return false;
        return true;
      }

      let empty = tiles.length - 1;
      let previous = -1;
      for (let i = 0; i < 250; i++) {
        const moves = directions.map(d => empty + d).filter(n => validMove(empty, n) && n !== previous);
        const next = moves[Math.floor(Math.random() * moves.length)];
        previous = empty;
        [tiles[empty], tiles[next]] = [tiles[next], tiles[empty]];
        empty = next;
      }

      function solved() {
        return tiles.every((v, i) => v === (i === tiles.length - 1 ? 0 : i + 1));
      }

      function render() {
        board.innerHTML = '';
        tiles.forEach((value, index) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'nx2-tile' + (!value ? ' empty' : '');
          button.textContent = value || '';
          button.addEventListener('click', () => {
            if (token !== gameToken || !value) return;
            if (!validMove(index, empty)) return;
            [tiles[index], tiles[empty]] = [tiles[empty], tiles[index]];
            empty = index;
            setScore(score + 1);
            render();
            if (solved()) finishGame(`Puzzle solved in ${score} moves!`);
          });
          board.appendChild(button);
        });
      }

      addButton('Shuffle', () => startPuzzle());
      render();
      keyHandler(event => {
        const index = tiles.indexOf(0);
        let next = -1;
        if (event.key === 'ArrowUp') next = index + size;
        if (event.key === 'ArrowDown') next = index - size;
        if (event.key === 'ArrowLeft') next = index + 1;
        if (event.key === 'ArrowRight') next = index - 1;
        if (next >= 0 && next < tiles.length && validMove(index, next)) {
          [tiles[index], tiles[next]] = [tiles[next], tiles[index]];
          empty = next;
          setScore(score + 1);
          render();
          if (solved()) finishGame(`Puzzle solved in ${score} moves!`);
        }
      });
    }

    function startAlien() {
      shell('alien', 'Move your ship and hold FIRE to defeat the alien fleet.');
      const token = gameToken;
      const { canvas, ctx } = makeCanvas(480, 600);

      let playerX = 240;
      let bullets = [];
      let enemies = [];
      let enemyBullets = [];
      let alive = true;
      let last = 0;
      let spawn = 0;
      let cooldown = 0;
      let steer = 0;
      let lives = 3;

      function shoot() {
        if (!alive || token !== gameToken || cooldown > 0) return;
        bullets.push({ x: playerX, y: 520 });
        cooldown = 0.2;
      }

      function addEnemies() {
        const rows = difficulty === 'Hardest' ? 4 : difficulty === 'Hard' ? 3 : 2;
        const cols = 7;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            enemies.push({ x: 55 + c * 58, y: 55 + r * 45, alive: true, phase: Math.random() * 5 });
          }
        }
      }
      addEnemies();

      function frame(time) {
        if (token !== gameToken || !alive) return;
        const dt = Math.min(0.04, last ? (time - last) / 1000 : 0);
        last = time;
        cooldown = Math.max(0, cooldown - dt);
        playerX = Math.max(22, Math.min(458, playerX + steer * 300 * dt));
        bullets.forEach(b => b.y -= 420 * dt);
        bullets = bullets.filter(b => b.y > -10);

        spawn += dt;
        enemies.forEach(enemy => {
          enemy.x += Math.sin(time / 450 + enemy.phase) * 45 * DIFFICULTIES[difficulty].enemy * dt;
          enemy.y += 7 * DIFFICULTIES[difficulty].enemy * dt;
          if (Math.random() < 0.0018 * DIFFICULTIES[difficulty].enemy) {
            enemyBullets.push({ x: enemy.x, y: enemy.y + 10 });
          }
        });

        enemyBullets.forEach(b => b.y += 220 * DIFFICULTIES[difficulty].enemy * dt);
        enemyBullets = enemyBullets.filter(b => b.y < 620);

        bullets.forEach(b => {
          const enemy = enemies.find(e => e.alive && Math.abs(e.x - b.x) < 20 && Math.abs(e.y - b.y) < 20);
          if (enemy) {
            enemy.alive = false;
            b.y = -100;
            setScore(score + 10);
          }
        });
        enemies = enemies.filter(e => e.alive);

        if (enemyBullets.some(b => Math.abs(b.x - playerX) < 20 && Math.abs(b.y - 530) < 20)) {
          enemyBullets = [];
          lives--;
          extraStatus.textContent = `Lives: ${lives}`;
          if (lives <= 0) {
            alive = false;
            finishGame('Your ship was overwhelmed. Try again!');
            return;
          }
        }

        if (!enemies.length) {
          addEnemies();
          enemies.forEach(e => e.y = 35);
        }

        if (enemies.some(e => e.y > 490)) {
          alive = false;
          finishGame('The aliens reached your ship. Try again!');
          return;
        }

        ctx.fillStyle = '#050914';
        ctx.fillRect(0, 0, 480, 600);
        ctx.fillStyle = '#35e8ff';
        ctx.beginPath();
        ctx.moveTo(playerX, 505);
        ctx.lineTo(playerX - 16, 542);
        ctx.lineTo(playerX + 16, 542);
        ctx.closePath();
        ctx.fill();

        enemies.forEach(e => {
          ctx.fillStyle = '#9b6cff';
          ctx.fillRect(e.x - 12, e.y - 10, 24, 18);
          ctx.fillStyle = '#d8c6ff';
          ctx.fillRect(e.x - 7, e.y - 4, 4, 4);
          ctx.fillRect(e.x + 3, e.y - 4, 4, 4);
        });

        ctx.fillStyle = '#43f5a5';
        bullets.forEach(b => ctx.fillRect(b.x - 2, b.y - 8, 4, 12));
        ctx.fillStyle = '#ff5f87';
        enemyBullets.forEach(b => ctx.fillRect(b.x - 3, b.y - 4, 6, 9));

        animationFrame = requestAnimationFrame(frame);
      }

      addTouchpad(controls, x => { steer = x; }, { fire: true, onFire: shoot, fireRate: 120 });
      addButton('FIRE', shoot);
      extraStatus.textContent = `Lives: ${lives}`;

      keyHandler(event => {
        if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') steer = -1;
        if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') steer = 1;
        if (event.code === 'Space') shoot();
      });

      animationFrame = requestAnimationFrame(frame);
      cleanupGame = () => { alive = false; document.onkeydown = null; };
    }

    function startNinja() {
      shell('ninja', 'Move, jump and avoid enemies. Collect points and survive as long as you can.');
      const token = gameToken;
      const { canvas, ctx } = makeCanvas(480, 520);

      let player = { x: 80, y: 390, vy: 0, w: 25, h: 40, grounded: true };
      let obstacles = [];
      let coins = [];
      let elapsed = 0;
      let last = 0;
      let spawn = 0;
      let alive = true;
      let steer = 0;
      let jumpQueued = false;
      let lives = 3;
      let worldSpeed = 200 * DIFFICULTIES[difficulty].enemy;

      function jump() {
        if (player.grounded) {
          player.vy = -420;
          player.grounded = false;
        }
      }

      function frame(time) {
        if (token !== gameToken || !alive) return;
        const dt = Math.min(0.04, last ? (time - last) / 1000 : 0);
        last = time;
        elapsed += dt;
        spawn += dt;

        if (jumpQueued) {
          jump();
          jumpQueued = false;
        }

        player.x += steer * 230 * dt;
        player.x = Math.max(15, Math.min(440, player.x));
        player.vy += 900 * dt;
        player.y += player.vy * dt;

        if (player.y + player.h >= 440) {
          player.y = 440 - player.h;
          player.vy = 0;
          player.grounded = true;
        }

        if (spawn > Math.max(0.55, 1.3 / DIFFICULTIES[difficulty].enemy)) {
          spawn = 0;
          obstacles.push({ x: 500, y: 400, w: 24 + Math.random() * 18, h: 40 });
          if (Math.random() < 0.6) coins.push({ x: 510, y: 340 - Math.random() * 80, r: 8 });
        }

        obstacles.forEach(o => o.x -= worldSpeed * dt);
        coins.forEach(c => c.x -= worldSpeed * dt);
        obstacles = obstacles.filter(o => o.x + o.w > 0);
        coins = coins.filter(c => c.x > -20);

        obstacles.forEach(o => {
          if (player.x < o.x + o.w && player.x + player.w > o.x && player.y < o.y + o.h && player.y + player.h > o.y) {
            o.x = -100;
            lives--;
            extraStatus.textContent = `Lives: ${lives}`;
            if (lives <= 0) {
              alive = false;
              finishGame('Your run is over. Try again!');
            }
          }
        });

        coins.forEach(c => {
          if (Math.abs(player.x + player.w / 2 - c.x) < 20 && Math.abs(player.y + player.h / 2 - c.y) < 25) {
            c.x = -100;
            setScore(score + 20);
          }
        });

        if (!alive) return;
        setScore(Math.max(score, Math.floor(elapsed * 2)));

        ctx.fillStyle = '#070d19';
        ctx.fillRect(0, 0, 480, 520);
        ctx.fillStyle = '#132b3c';
        ctx.fillRect(0, 440, 480, 80);
        ctx.strokeStyle = '#35e8ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 440);
        ctx.lineTo(480, 440);
        ctx.stroke();

        coins.forEach(c => {
          ctx.fillStyle = '#ffcf4d';
          ctx.beginPath();
          ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          ctx.fill();
        });

        obstacles.forEach(o => {
          ctx.fillStyle = '#ff5f87';
          ctx.fillRect(o.x, o.y, o.w, o.h);
        });

        ctx.fillStyle = '#35e8ff';
        ctx.fillRect(player.x, player.y, player.w, player.h);
        ctx.fillStyle = '#eaffff';
        ctx.fillRect(player.x + 14, player.y + 8, 6, 6);

        animationFrame = requestAnimationFrame(frame);
      }

      addTouchpad(controls, x => { steer = x; });
      addButton('JUMP', () => { jumpQueued = true; });
      keyHandler(event => {
        if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') steer = -1;
        if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') steer = 1;
        if (event.code === 'Space' || event.key === 'ArrowUp') jumpQueued = true;
      });

      animationFrame = requestAnimationFrame(frame);
      cleanupGame = () => { alive = false; document.onkeydown = null; };
    }

    function startWord() {
      shell('word', 'Unscramble the letters to discover the hidden word.');
      const token = gameToken;
      const words = ['GALAXY', 'ROCKET', 'PLANET', 'NEBULA', 'COSMIC', 'DRAGON', 'PUZZLE', 'ARCADE', 'ENERGY', 'NEXORA'];
      let current = '';
      let scrambled = '';
      let remaining = 60;
      let ended = false;

      const box = document.createElement('div');
      box.className = 'nx2-word';
      box.innerHTML = `
        <div class="nx2-word-display" id="nx2-scrambled"></div>
        <input class="nx2-word-input" id="nx2-answer" autocomplete="off" autocapitalize="characters" placeholder="Type your answer" />
        <div class="nx2-message" id="nx2-word-message"></div>
      `;
      gameArea.appendChild(box);

      const scrambledEl = box.querySelector('#nx2-scrambled');
      const answer = box.querySelector('#nx2-answer');
      const message = box.querySelector('#nx2-word-message');

      function newWord() {
        current = words[Math.floor(Math.random() * words.length)];
        scrambled = current.split('').sort(() => Math.random() - 0.5).join('');
        if (scrambled === current) scrambled = current.slice(1) + current[0];
        scrambledEl.textContent = scrambled.split('').join(' ');
        answer.value = '';
        answer.focus();
      }

      function submit() {
        if (ended || token !== gameToken) return;
        if (answer.value.trim().toUpperCase() === current) {
          setScore(score + 10);
          message.textContent = 'Correct! +10 points';
          newWord();
        } else {
          message.textContent = 'Not quite. Try again!';
        }
      }

      answer.addEventListener('keydown', event => {
        if (event.key === 'Enter') submit();
      });

      addButton('CHECK WORD', submit);
      addButton('SKIP WORD', () => {
        setScore(Math.max(0, score - 2));
        newWord();
      });

      newWord();
      extraStatus.textContent = `${remaining}s`;

      const interval = setInterval(() => {
        if (token !== gameToken || ended) {
          clearInterval(interval);
          return;
        }
        remaining--;
        extraStatus.textContent = `${remaining}s`;
        if (remaining <= 0) {
          ended = true;
          clearInterval(interval);
          finishGame(`Time's up! Your score was ${score}.`);
        }
      }, 1000);

      cleanupGame = () => {
        ended = true;
        clearInterval(interval);
      };
    }

    function startHockey() {
      shell('hockey', 'Drag your paddle to hit the puck past the opponent.');
      const token = gameToken;

      const scoreboard = document.createElement('div');
      scoreboard.className = 'nx2-numbers';
      scoreboard.innerHTML = '<span id="nx2-player-points">0</span><span id="nx2-enemy-points">0</span>';
      gameArea.appendChild(scoreboard);

      const rink = document.createElement('div');
      rink.className = 'nx2-hockey';
      gameArea.appendChild(rink);

      const player = document.createElement('div');
      player.className = 'nx2-paddle';
      const enemy = document.createElement('div');
      enemy.className = 'nx2-paddle enemy';
      const puck = document.createElement('div');
      puck.className = 'nx2-puck';
      rink.append(player, enemy, puck);

      let playerX = 50, playerY = 80;
      let enemyX = 50, enemyY = 20;
      let puckX = 50, puckY = 50;
      let vx = 23, vy = 34;
      let playerPoints = 0, enemyPoints = 0;
      let last = 0, alive = true;
      let dragging = false;

      const pScore = scoreboard.querySelector('#nx2-player-points');
      const eScore = scoreboard.querySelector('#nx2-enemy-points');

      function place(el, x, y) {
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
      }

      function movePlayer(event) {
        const rect = rink.getBoundingClientRect();
        playerX = Math.max(8, Math.min(92, (event.clientX - rect.left) / rect.width * 100));
        playerY = Math.max(55, Math.min(92, (event.clientY - rect.top) / rect.height * 100));
      }

      rink.addEventListener('pointerdown', event => {
        dragging = true;
        try { rink.setPointerCapture(event.pointerId); } catch (_) {}
        movePlayer(event);
      });
      rink.addEventListener('pointermove', event => {
        if (dragging) movePlayer(event);
      });
      rink.addEventListener('pointerup', () => { dragging = false; });
      rink.addEventListener('pointercancel', () => { dragging = false; });

      function resetPuck(direction) {
        puckX = 50;
        puckY = 50;
        vx = (Math.random() * 30 - 15);
        vy = 35 * direction;
      }

      function frame(time) {
        if (token !== gameToken || !alive) return;
        const dt = Math.min(0.04, last ? (time - last) / 1000 : 0);
        last = time;

        const targetX = puckX;
        enemyX += (targetX - enemyX) * Math.min(1, dt * 2.5 * DIFFICULTIES[difficulty].enemy);
        enemyY = 18;

        puckX += vx * dt;
        puckY += vy * dt;

        if (puckX < 4 || puckX > 96) {
          vx *= -1;
          puckX = Math.max(4, Math.min(96, puckX));
        }

        if (puckY < 0) {
          playerPoints++;
          pScore.textContent = playerPoints;
          setScore(score + 10);
          resetPuck(1);
        } else if (puckY > 100) {
          enemyPoints++;
          eScore.textContent = enemyPoints;
          resetPuck(-1);
        }

        if (Math.abs(puckX - playerX) < 13 && puckY > playerY - 8 && puckY < playerY + 4) {
          vy = -Math.abs(vy) - 2;
          vx += (puckX - playerX) * 1.5;
          puckY = playerY - 8;
        }

        if (Math.abs(puckX - enemyX) < 13 && puckY < enemyY + 8 && puckY > enemyY - 5) {
          vy = Math.abs(vy) + 2;
          vx += (puckX - enemyX) * 1.5;
          puckY = enemyY + 8;
        }

        place(player, playerX, playerY);
        place(enemy, enemyX, enemyY);
        place(puck, puckX, puckY);

        if (playerPoints >= 7 || enemyPoints >= 7) {
          alive = false;
          finishGame(playerPoints >= 7 ? 'You won the air hockey match!' : 'The opponent won. Try again!');
          return;
        }

        animationFrame = requestAnimationFrame(frame);
      }

      addButton('Reset Puck', () => resetPuck(Math.random() > 0.5 ? 1 : -1));
      animationFrame = requestAnimationFrame(frame);
      cleanupGame = () => { alive = false; };
    }

    function startMaze() {
      shell('maze', 'Navigate the maze to reach the glowing exit. Use the joystick or arrow keys.');
      const token = gameToken;
      const { canvas, ctx } = makeCanvas(420, 480);

      const maze = [
        '111111111111111',
        '100000100000001',
        '101110101111101',
        '101000100000101',
        '101011111010101',
        '100010000010001',
        '111010111110101',
        '100010100000101',
        '101110101111101',
        '100000100000001',
        '101111111011101',
        '100000000010001',
        '111011101110101',
        '100000000000001',
        '111111111111101'
      ];

      const rows = maze.length;
      const cols = maze[0].length;
      const cell = Math.min(canvas.width / cols, canvas.height / rows);
      let player = { x: 1, y: 1 };
      const exit = { x: cols - 2, y: rows - 1 };
      let alive = true;
      let moveX = 0, moveY = 0;
      let moveTimer = 0;

      function canMove(x, y) {
        return y >= 0 && y < rows && x >= 0 && x < cols && maze[y][x] === '0';
      }

      function move(dx, dy) {
        if (!alive || token !== gameToken) return;
        const nx = player.x + dx;
        const ny = player.y + dy;
        if (canMove(nx, ny)) {
          player.x = nx;
          player.y = ny;
          setScore(score + 1);
          draw();
          if (player.x === exit.x && player.y === exit.y) {
            alive = false;
            finishGame('Maze escaped! You found the exit.');
          }
        }
      }

      function draw() {
        ctx.fillStyle = '#050914';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            ctx.fillStyle = maze[y][x] === '1' ? '#1d3552' : '#071322';
            ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
            if (maze[y][x] === '1') {
              ctx.strokeStyle = '#35e8ff55';
              ctx.strokeRect(x * cell, y * cell, cell - 1, cell - 1);
            }
          }
        }

        ctx.fillStyle = '#43f5a5';
        ctx.fillRect(exit.x * cell + 2, exit.y * cell + 2, cell - 4, cell - 4);

        ctx.fillStyle = '#9b6cff';
        ctx.beginPath();
        ctx.arc(player.x * cell + cell / 2, player.y * cell + cell / 2, cell * 0.32, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e4d8ff';
        ctx.stroke();
      }

      addTouchpad(controls, (x, y, active) => {
        if (!active) {
          moveX = 0;
          moveY = 0;
          return;
        }
        moveX = Math.abs(x) > 0.35 ? Math.sign(x) : 0;
        moveY = Math.abs(y) > 0.35 ? Math.sign(y) : 0;
      });

      keyHandler(event => {
        const key = event.key.toLowerCase();
        if (key === 'arrowup' || key === 'w') move(0, -1);
        if (key === 'arrowdown' || key === 's') move(0, 1);
        if (key === 'arrowleft' || key === 'a') move(-1, 0);
        if (key === 'arrowright' || key === 'd') move(1, 0);
      });

      function moveLoop() {
        if (token !== gameToken || !alive) return;
        if (moveTimer <= 0) {
          if (moveX) move(moveX, 0);
          else if (moveY) move(0, moveY);
          moveTimer = 0.14;
        } else {
          moveTimer -= 0.04;
        }
        later(moveLoop, 40);
      }

      draw();
      moveLoop();
      cleanupGame = () => { alive = false; document.onkeydown = null; };
    }

    function startGame(id) {
      const game = GAMES.find(item => item.id === id);
      if (!game) return;

      overlay.hidden = false;
      document.body.style.overflow = 'hidden';

      switch (id) {
        case 'memory': startMemory(); break;
        case 'racing': startRacing(); break;
        case 'tower': startTower(); break;
        case 'mine': startMine(); break;
        case 'puzzle': startPuzzle(); break;
        case 'alien': startAlien(); break;
        case 'ninja': startNinja(); break;
        case 'word': startWord(); break;
        case 'hockey': startHockey(); break;
        case 'maze': startMaze(); break;
        default:
          shell(id, 'This game is not available.');
      }
    }

    launcher.addEventListener('click', event => {
      const button = event.target.closest('[data-game]');
      if (!button) return;
      startGame(button.dataset.game);
    });

    $('#nx2-back').addEventListener('click', () => {
      clearGame();
      overlay.hidden = true;
      document.body.style.overflow = '';
      activeGame = null;
    });

    $('#nx2-restart').addEventListener('click', () => {
      if (activeGame) startGame(activeGame);
    });

    overlay.querySelectorAll('[data-difficulty]').forEach(button => {
      button.addEventListener('click', () => {
        difficulty = button.dataset.difficulty;
        $('#nx2-difficulty-label').textContent = difficulty;
        overlay.querySelectorAll('[data-difficulty]').forEach(item => {
          item.classList.toggle('active', item.dataset.difficulty === difficulty);
        });
        $('#nx2-difficulty').open = false;
        if (activeGame) startGame(activeGame);
      });
    });

    overlay.addEventListener('click', event => {
      if (event.target === overlay) return;
    });

    window.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !overlay.hidden) {
        clearGame();
        overlay.hidden = true;
        document.body.style.overflow = '';
        activeGame = null;
      }
    });

    bestEl.textContent = bestScore;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNexoraExtraArcade, { once: true });
  } else {
    initNexoraExtraArcade();
  }
})();
```
