(() => {
  'use strict';

  /*
   * REXWEB NEXORA — GAME 2
   * ARCADE UNIVERSE · PLAY WITHOUT LIMITS
   *
   * Ten additional games:
   * 1. Memory Match
   * 2. Neon Racing
   * 3. Tower Stack
   * 4. Minefield Mystery
   * 5. Sliding Puzzle
   * 6. Alien Invasion
   * 7. Target Master
   * 8. Word Scramble
   * 9. Air Hockey
   * 10. Neon Maze
   *
   * Standalone module.
   * Does not overwrite game.js.
   * Dark/light mode follows the document's data-theme attribute.
   */

  const MODULE_ID = 'rexweb-game2';
  const SCORE_KEY = 'rexweb_nexora_game2_scores_v1';

  if (document.getElementById(MODULE_ID)) {
    console.warn('RexWeb Game 2 is already initialized.');
    return;
  }

  const games = [
    {
      id: 'memory',
      name: 'Memory Match',
      icon: '🧠',
      description: 'Find matching pairs and test your memory.'
    },
    {
      id: 'racing',
      name: 'Neon Racing',
      icon: '🏎️',
      description: 'Dodge traffic and survive the neon highway.'
    },
    {
      id: 'tower',
      name: 'Tower Stack',
      icon: '🧱',
      description: 'Stack moving blocks and build the tallest tower.'
    },
    {
      id: 'minefield',
      name: 'Minefield Mystery',
      icon: '💣',
      description: 'Reveal safe tiles and solve the minefield.'
    },
    {
      id: 'sliding',
      name: 'Sliding Puzzle',
      icon: '🧩',
      description: 'Arrange the numbered tiles in order.'
    },
    {
      id: 'alien',
      name: 'Alien Invasion',
      icon: '👾',
      description: 'Defend the galaxy against invading aliens.'
    },
    {
      id: 'target',
      name: 'Target Master',
      icon: '🎯',
      description: 'Hit as many targets as possible in 60 seconds.'
    },
    {
      id: 'words',
      name: 'Word Scramble',
      icon: '🔤',
      description: 'Unscramble letters to discover hidden words.'
    },
    {
      id: 'hockey',
      name: 'Air Hockey',
      icon: '🏓',
      description: 'Challenge the computer in a hockey match.'
    },
    {
      id: 'maze',
      name: 'Neon Maze',
      icon: '🌀',
      description: 'Navigate the maze, collect crystals, and escape.'
    }
  ];

  const style = document.createElement('style');

  style.textContent = `
    #${MODULE_ID} {
      --g2-bg: var(--bg, #050914);
      --g2-panel: var(--card, #0b1224);
      --g2-text: var(--text, #eaf5ff);
      --g2-muted: var(--muted, #91a4bd);
      --g2-cyan: var(--cyan, #35e8ff);
      --g2-purple: var(--purple, #9b6cff);
      --g2-green: var(--green, #43f5a5);
      --g2-border: rgba(120,170,220,.22);
      color: var(--g2-text);
      font-family: inherit;
      width: 100%;
      margin: 28px auto;
      box-sizing: border-box;
    }

    #${MODULE_ID} *,
    #${MODULE_ID} *::before,
    #${MODULE_ID} *::after {
      box-sizing: border-box;
    }

    #${MODULE_ID} .g2-heading {
      text-align: center;
      padding: 12px 12px 22px;
    }

    #${MODULE_ID} .g2-eyebrow {
      color: var(--g2-cyan);
      font-size: .76rem;
      letter-spacing: .2em;
      font-weight: 800;
    }

    #${MODULE_ID} .g2-heading h2 {
      margin: 10px 0;
      font-size: clamp(1.7rem, 5vw, 2.7rem);
      line-height: 1.15;
      font-weight: 900;
      overflow-wrap: anywhere;
    }

    #${MODULE_ID} .g2-heading p {
      color: var(--g2-muted);
      max-width: 600px;
      margin: 10px auto;
      line-height: 1.7;
    }

    #${MODULE_ID} .g2-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
      gap: 16px;
    }

    #${MODULE_ID} .g2-card {
      min-width: 0;
      border: 1px solid var(--g2-border);
      border-radius: 18px;
      padding: 20px;
      background:
        radial-gradient(circle at 100% 0%, rgba(53,232,255,.09), transparent 45%),
        var(--g2-panel);
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: transform .2s ease, border-color .2s ease;
    }

    #${MODULE_ID} .g2-card:hover {
      transform: translateY(-3px);
      border-color: var(--g2-cyan);
    }

    #${MODULE_ID} .g2-icon {
      font-size: 2.3rem;
      line-height: 1.2;
    }

    #${MODULE_ID} .g2-card h3 {
      margin: 0;
      font-size: 1.12rem;
      overflow-wrap: anywhere;
    }

    #${MODULE_ID} .g2-card p {
      color: var(--g2-muted);
      line-height: 1.6;
      font-size: .92rem;
      margin: 0;
      flex: 1;
    }

    #${MODULE_ID} .g2-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 43px;
      padding: 10px 16px;
      border: 1px solid var(--g2-cyan);
      border-radius: 11px;
      background: rgba(53,232,255,.09);
      color: var(--g2-text);
      font: inherit;
      font-weight: 800;
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    #${MODULE_ID} .g2-btn:hover {
      background: rgba(53,232,255,.18);
    }

    #${MODULE_ID} .g2-btn.primary {
      background: var(--g2-cyan);
      color: #03101a;
    }

    #${MODULE_ID} .g2-btn:disabled {
      opacity: .45;
      cursor: not-allowed;
    }

    #${MODULE_ID} button:focus-visible,
    #${MODULE_ID} input:focus-visible,
    #${MODULE_ID} select:focus-visible {
      outline: 3px solid var(--g2-purple);
      outline-offset: 3px;
    }

    #${MODULE_ID} .g2-game {
      margin-top: 22px;
      padding: clamp(12px, 3vw, 24px);
      background: var(--g2-panel);
      border: 1px solid var(--g2-border);
      border-radius: 20px;
      min-width: 0;
      overflow: hidden;
    }

    #${MODULE_ID} .g2-game[hidden] {
      display: none !important;
    }

    #${MODULE_ID} .g2-game-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 18px;
    }

    #${MODULE_ID} .g2-game-head h3 {
      margin: 0;
      font-size: clamp(1.1rem, 4vw, 1.5rem);
    }

    #${MODULE_ID} .g2-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
      margin: 12px 0;
    }

    #${MODULE_ID} .g2-stat {
      border: 1px solid var(--g2-border);
      border-radius: 10px;
      padding: 8px 12px;
      color: var(--g2-muted);
      font-size: .85rem;
    }

    #${MODULE_ID} .g2-stat strong {
      color: var(--g2-cyan);
      margin-left: 4px;
    }

    #${MODULE_ID} .g2-status {
      min-height: 28px;
      color: var(--g2-green);
      line-height: 1.6;
      margin: 12px 0;
      overflow-wrap: anywhere;
    }

    #${MODULE_ID} .g2-board {
      display: grid;
      gap: 7px;
      width: 100%;
      max-width: 480px;
      margin: 16px auto;
    }

    #${MODULE_ID} .g2-tile {
      aspect-ratio: 1;
      min-width: 0;
      border-radius: 10px;
      border: 1px solid var(--g2-border);
      background: rgba(53,232,255,.07);
      color: var(--g2-text);
      font-size: clamp(.85rem, 4vw, 1.3rem);
      font-weight: 800;
      cursor: pointer;
      touch-action: manipulation;
      user-select: none;
    }

    #${MODULE_ID} .g2-tile:hover {
      border-color: var(--g2-cyan);
    }

    #${MODULE_ID} .g2-tile.selected,
    #${MODULE_ID} .g2-tile.revealed {
      background: rgba(53,232,255,.2);
      border-color: var(--g2-cyan);
    }

    #${MODULE_ID} .g2-tile.matched,
    #${MODULE_ID} .g2-tile.safe {
      background: rgba(67,245,165,.14);
      border-color: var(--g2-green);
    }

    #${MODULE_ID} .g2-controls {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 9px;
      margin: 16px 0;
    }

    #${MODULE_ID} .g2-canvas-wrap {
      width: 100%;
      max-width: 560px;
      margin: 16px auto;
      overflow: hidden;
      border: 1px solid var(--g2-border);
      border-radius: 15px;
      background: #050914;
    }

    #${MODULE_ID} canvas {
      display: block;
      width: 100%;
      height: auto;
      touch-action: none;
    }

    #${MODULE_ID} .g2-touchpad {
      max-width: 310px;
      margin: 18px auto;
      display: grid;
      grid-template-columns: repeat(3, minmax(55px, 1fr));
      gap: 8px;
      user-select: none;
    }

    #${MODULE_ID} .g2-touchpad button {
      min-height: 53px;
      font-size: 1.2rem;
      touch-action: none;
    }

    #${MODULE_ID} .g2-touchpad .g2-up {
      grid-column: 2;
    }

    #${MODULE_ID} .g2-touchpad .g2-left {
      grid-column: 1;
    }

    #${MODULE_ID} .g2-touchpad .g2-down {
      grid-column: 2;
    }

    #${MODULE_ID} .g2-touchpad .g2-right {
      grid-column: 3;
    }

    #${MODULE_ID} .g2-input {
      width: 100%;
      min-width: 0;
      min-height: 45px;
      border: 1px solid var(--g2-border);
      border-radius: 10px;
      background: var(--g2-bg);
      color: var(--g2-text);
      padding: 11px 13px;
      font: inherit;
    }

    #${MODULE_ID} .g2-word-form {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
      max-width: 480px;
      margin: 14px auto;
    }

    #${MODULE_ID} .g2-word-form .g2-input {
      flex: 1 1 180px;
    }

    #${MODULE_ID} .g2-word {
      text-align: center;
      font-size: clamp(1.4rem, 7vw, 2.5rem);
      font-weight: 900;
      letter-spacing: .13em;
      color: var(--g2-cyan);
      overflow-wrap: anywhere;
      margin: 22px 0;
    }

    #${MODULE_ID} .g2-difficulty {
      max-width: 220px;
    }

    #${MODULE_ID} .g2-small {
      font-size: .84rem;
      color: var(--g2-muted);
      line-height: 1.6;
    }

    @media (max-width: 480px) {
      #${MODULE_ID} .g2-grid {
        grid-template-columns: 1fr;
      }

      #${MODULE_ID} .g2-card {
        padding: 17px;
      }

      #${MODULE_ID} .g2-game {
        border-radius: 14px;
      }

      #${MODULE_ID} .g2-board {
        gap: 5px;
      }

      #${MODULE_ID} .g2-tile {
        border-radius: 7px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #${MODULE_ID} *,
      #${MODULE_ID} *::before,
      #${MODULE_ID} *::after {
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
      }
    }
  `;

  document.head.appendChild(style);

  const root = document.createElement('section');
  root.id = MODULE_ID;
  root.setAttribute('aria-label', 'RexWeb Nexora additional arcade games');

  root.innerHTML = `
    <header class="g2-heading">
      <div class="g2-eyebrow">REXWEB NEXORA · GAME 02</div>
      <h2>🎮 Arcade Expansion</h2>
      <p>Ten new challenges. One arcade universe. Choose your next adventure.</p>
    </header>

    <div class="g2-grid" data-g2-grid></div>

    <section class="g2-game" data-g2-game hidden>
      <div class="g2-game-head">
        <h3 data-g2-title></h3>
        <button type="button" class="g2-btn" data-g2-back>← All Games</button>
      </div>
      <div data-g2-content></div>
    </section>
  `;

  /*
   * Integrate after the existing Nexora arcade when possible.
   * Otherwise append to the document without requiring game.js.
   */
  const existingArcade =
    document.getElementById('nexora-games') ||
    document.querySelector('[data-nexora-arcade]');

  if (existingArcade && existingArcade.parentNode) {
    existingArcade.insertAdjacentElement('afterend', root);
  } else {
    (document.querySelector('main') || document.body).appendChild(root);
  }

  const $ = selector => root.querySelector(selector);

  const grid = $('[data-g2-grid]');
  const gamePanel = $('[data-g2-game]');
  const gameTitle = $('[data-g2-title]');
  const gameContent = $('[data-g2-content]');

  let activeCleanup = null;
  let activeGame = null;

  const scores = loadScores();

  function loadScores() {
    try {
      const value = JSON.parse(localStorage.getItem(SCORE_KEY) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch (_) {
      return {};
    }
  }

  function saveScore(id, value, mode = 'max') {
    const number = Number(value);

    if (!Number.isFinite(number)) return;

    const old = Number(scores[id] || 0);

    scores[id] = mode === 'min'
      ? (old > 0 ? Math.min(old, number) : number)
      : Math.max(old, number);

    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
    } catch (_) {}
  }

  function best(id) {
    return Number(scores[id] || 0);
  }

  function shuffle(array) {
    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }

  function randomInt(max) {
    return Math.floor(Math.random() * max);
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

  function button(label, action, extra = '') {
    return `<button type="button" class="g2-btn ${extra}" data-action="${escapeHTML(action)}">${label}</button>`;
  }

  function stat(label, value, id) {
    return `<div class="g2-stat">${label}<strong data-stat="${id}">${value}</strong></div>`;
  }

  function status(message = '') {
    const node = gameContent.querySelector('[data-status]');

    if (node) node.textContent = message;
  }

  function setStat(id, value) {
    const node = gameContent.querySelector(`[data-stat="${id}"]`);

    if (node) node.textContent = value;
  }

  function setup(title, html) {
    stopActiveGame();

    activeGame = title;

    gameTitle.textContent = title;
    gameContent.innerHTML = html;

    gamePanel.hidden = false;

    root.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  function stopActiveGame() {
    if (typeof activeCleanup === 'function') {
      activeCleanup();
    }

    activeCleanup = null;
    activeGame = null;
  }

  function startLoop(callback) {
    let frame = 0;
    let stopped = false;

    function loop() {
      if (stopped) return;

      callback();
      frame = requestAnimationFrame(loop);
    }

    frame = requestAnimationFrame(loop);

    return () => {
      stopped = true;
      cancelAnimationFrame(frame);
    };
  }

  function startTimer(seconds, onTick, onEnd) {
    let remaining = seconds;
    let interval = null;
    let stopped = false;

    onTick(remaining);

    interval = setInterval(() => {
      if (stopped) return;

      remaining = Math.max(0, remaining - 1);
      onTick(remaining);

      if (remaining <= 0) {
        stopped = true;
        clearInterval(interval);
        onEnd();
      }
    }, 1000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }

  function canvasMarkup(width, height) {
    return `
      <div class="g2-canvas-wrap">
        <canvas width="${width}" height="${height}" data-canvas></canvas>
      </div>
    `;
  }

  function getCanvas() {
    const canvas = gameContent.querySelector('[data-canvas]');

    return {
      canvas,
      ctx: canvas.getContext('2d'),
      width: canvas.width,
      height: canvas.height
    };
  }

  function bindButton(action, handler) {
    const element = gameContent.querySelector(`[data-action="${action}"]`);

    if (element) element.addEventListener('click', handler);

    return element;
  }

  function makeTouchpad() {
    return `
      <div class="g2-touchpad" aria-label="Touch controls">
        <button type="button" class="g2-btn g2-up" data-pad="up" aria-label="Up">▲</button>
        <button type="button" class="g2-btn g2-left" data-pad="left" aria-label="Left">◀</button>
        <button type="button" class="g2-btn g2-down" data-pad="down" aria-label="Down">▼</button>
        <button type="button" class="g2-btn g2-right" data-pad="right" aria-label="Right">▶</button>
      </div>
    `;
  }

  function bindPad(callback) {
    const buttons = [...gameContent.querySelectorAll('[data-pad]')];

    buttons.forEach(button => {
      const handler = event => {
        event.preventDefault();

        if (!button.disabled) {
          callback(button.dataset.pad);
        }
      };

      button.addEventListener('pointerdown', handler);
      button.addEventListener('click', handler);
    });
  }

  /*
   * Game 1: Memory Match
   */

  function openMemory() {
    const symbols = ['🚀', '🪐', '🌟', '🦊', '🐬', '🍀', '🎮', '💎'];
    let cards = [];
    let selected = [];
    let matched = new Set();
    let moves = 0;
    let seconds = 0;
    let locked = false;
    let timer = null;
    let completed = false;

    setup('🧠 Memory Match', `
      <div class="g2-stats">
        ${stat('Moves', 0, 'moves')}
        ${stat('Time', '0s', 'time')}
        ${stat('Pairs', '0/8', 'pairs')}
        ${stat('Best moves', best('memory') || '—', 'best')}
      </div>

      <div class="g2-controls">
        <select class="g2-input g2-difficulty" data-level aria-label="Memory difficulty">
          <option value="4">Easy · 8 pairs</option>
          <option value="6">Medium · 18 pairs</option>
          <option value="8">Hard · 32 pairs</option>
        </select>
        ${button('New Game', 'new', 'primary')}
      </div>

      <div class="g2-board" data-board style="grid-template-columns:repeat(4,minmax(0,1fr))"></div>
      <p class="g2-status" data-status aria-live="polite">Find all matching pairs.</p>
    `);

    const board = gameContent.querySelector('[data-board]');
    const level = gameContent.querySelector('[data-level]');

    function render() {
      board.innerHTML = '';

      cards.forEach((symbol, index) => {
        const tile = document.createElement('button');

        tile.type = 'button';
        tile.className = 'g2-tile';

        if (matched.has(index)) {
          tile.classList.add('matched');
          tile.textContent = symbol;
          tile.disabled = true;
        } else if (selected.includes(index)) {
          tile.classList.add('revealed');
          tile.textContent = symbol;
        } else {
          tile.textContent = '?';
          tile.setAttribute('aria-label', 'Hidden card');
        }

        tile.addEventListener('click', () => flip(index));

        board.appendChild(tile);
      });
    }

    function flip(index) {
      if (locked || completed || matched.has(index) || selected.includes(index)) {
        return;
      }

      selected.push(index);

      if (selected.length === 2) {
        moves++;
        setStat('moves', moves);

        const [first, second] = selected;

        if (cards[first] === cards[second]) {
          matched.add(first);
          matched.add(second);
          selected = [];

          setStat('pairs', `${matched.size / 2}/${cards.length / 2}`);
          status('Match found! ✨');

          if (matched.size === cards.length) {
            completed = true;
            clearInterval(timer);

            saveScore('memory', moves, 'min');
            setStat('best', best('memory'));

            status(`Excellent! You matched every pair in ${moves} moves.`);
          }
        } else {
          locked = true;

          setTimeout(() => {
            selected = [];
            locked = false;
            render();
          }, 650);
        }
      }

      render();
    }

    function newGame() {
      clearInterval(timer);

      const pairs = Number(level.value) ** 2;
      const symbolsNeeded = pairs;

      const emojiPool = [
        '🚀','🪐','🌟','🦊','🐬','🍀','🎮','💎',
        '⚡','🎧','🐼','🌈','🍉','🦋','🌙','🔥',
        '🎲','🐸','🍕','🛸','🧩','🐙','🌻','🎯',
        '🦁','🍇','🎹','🐝','🪼','🦄','🌍','⭐'
      ];

      const chosen = shuffle(emojiPool).slice(0, symbolsNeeded);

      cards = shuffle([...chosen, ...chosen]);
      selected = [];
      matched = new Set();
      moves = 0;
      seconds = 0;
      locked = false;
      completed = false;

      board.style.gridTemplateColumns = `repeat(${level.value},minmax(0,1fr))`;

      setStat('moves', 0);
      setStat('time', '0s');
      setStat('pairs', `0/${pairs}`);
      setStat('best', best('memory') || '—');

      render();
      status('Find all matching pairs.');

      timer = setInterval(() => {
        if (!completed) {
          seconds++;
          setStat('time', `${seconds}s`);
        }
      }, 1000);
    }

    level.addEventListener('change', newGame);
    bindButton('new', newGame);

    newGame();

    activeCleanup = () => clearInterval(timer);
  }

  /*
   * Game 2: Neon Racing
   */

  function openRacing() {
    setup('🏎️ Neon Racing', `
      <div class="g2-stats">
        ${stat('Distance', 0, 'distance')}
        ${stat('Coins', 0, 'coins')}
        ${stat('Best', best('racing'), 'best')}
      </div>

      <div class="g2-controls">
        ${button('Start / Restart', 'start', 'primary')}
      </div>

      ${canvasMarkup(420, 620)}

      <p class="g2-small">Use the left and right buttons, arrow keys, or swipe on the road to steer.</p>

      <div class="g2-controls">
        ${button('◀ Left', 'left')}
        ${button('Right ▶', 'right')}
      </div>

      <p class="g2-status" data-status>Press Start to race.</p>
    `);

    const { canvas, ctx, width, height } = getCanvas();

    let player = 1;
    let obstacles = [];
    let coins = [];
    let distance = 0;
    let collected = 0;
    let running = false;
    let crashed = false;
    let last = 0;
    let elapsed = 0;
    let spawn = 0;
    let coinSpawn = 0;
    let animation = 0;

    const keys = new Set();

    function steer(direction) {
      if (!running) return;

      player = Math.max(0, Math.min(2, player + direction));
    }

    function draw() {
      ctx.fillStyle = '#050914';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#101b30';
      ctx.fillRect(45, 0, width - 90, height);

      ctx.strokeStyle = '#35e8ff';
      ctx.lineWidth = 3;
      ctx.setLineDash([24, 22]);

      for (const x of [width / 3, width * 2 / 3]) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      ctx.setLineDash([]);

      ctx.fillStyle = '#35e8ff';
      ctx.fillRect(43, 0, 3, height);
      ctx.fillRect(width - 46, 0, 3, height);

      const laneX = lane => 72 + lane * 92;

      for (const obstacle of obstacles) {
        ctx.fillStyle = '#ff557b';
        ctx.fillRect(laneX(obstacle.lane), obstacle.y, 38, 57);

        ctx.fillStyle = '#ffd6df';
        ctx.fillRect(laneX(obstacle.lane) + 7, obstacle.y + 7, 24, 8);
      }

      for (const coin of coins) {
        ctx.fillStyle = '#ffd84a';
        ctx.beginPath();
        ctx.arc(laneX(coin.lane) + 19, coin.y, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#43f5a5';

      const x = laneX(player);

      ctx.beginPath();
      ctx.moveTo(x + 19, height - 100);
      ctx.lineTo(x, height - 50);
      ctx.lineTo(x + 38, height - 50);
      ctx.closePath();
      ctx.fill();

      if (!running) {
        ctx.fillStyle = 'rgba(0,0,0,.48)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 25px sans-serif';
        ctx.fillText(crashed ? 'RACE OVER' : 'NEON RACING', width / 2, height / 2);
        ctx.font = '15px sans-serif';
        ctx.fillText('Tap Start / Restart', width / 2, height / 2 + 30);
      }
    }

    function endRace() {
      running = false;
      crashed = true;

      saveScore('racing', Math.floor(distance));

      setStat('best', best('racing'));
      status(`Race over! Distance: ${Math.floor(distance)}. Tap Start to race again.`);
      draw();
    }

    function loop(timestamp) {
      if (!running) return;

      const delta = Math.min(0.04, (timestamp - (last || timestamp)) / 1000);
      last = timestamp;
      elapsed += delta;

      const speed = 190 + Math.min(260, elapsed * 8);

      distance += delta * speed / 10;
      spawn += delta;
      coinSpawn += delta;

      if (keys.has('ArrowLeft') || keys.has('a')) steer(-1);
      if (keys.has('ArrowRight') || keys.has('d')) steer(1);

      if (spawn > Math.max(.35, .9 - elapsed * .01)) {
        spawn = 0;
        obstacles.push({
          lane: randomInt(3),
          y: -65
        });
      }

      if (coinSpawn > 1.4) {
        coinSpawn = 0;

        coins.push({
          lane: randomInt(3),
          y: -20
        });
      }

      obstacles.forEach(obstacle => obstacle.y += speed * delta);
      coins.forEach(coin => coin.y += speed * delta);

      const playerY = height - 85;

      for (const obstacle of obstacles) {
        if (
          obstacle.lane === player &&
          obstacle.y + 57 > playerY - 12 &&
          obstacle.y < playerY + 20
        ) {
          endRace();
          return;
        }
      }

      coins = coins.filter(coin => {
        if (coin.lane === player && Math.abs(coin.y - playerY) < 35) {
          collected++;
          setStat('coins', collected);
          return false;
        }

        return coin.y < height + 30;
      });

      obstacles = obstacles.filter(obstacle => obstacle.y < height + 70);

      setStat('distance', Math.floor(distance));
      draw();

      animation = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(animation);

      player = 1;
      obstacles = [];
      coins = [];
      distance = 0;
      collected = 0;
      elapsed = 0;
      spawn = 0;
      coinSpawn = 0;
      last = 0;
      crashed = false;
      running = true;

      setStat('distance', 0);
      setStat('coins', 0);

      status('Race started! Avoid the traffic.');
      draw();

      animation = requestAnimationFrame(loop);
    }

    bindButton('start', start);
    bindButton('left', () => steer(-1));
    bindButton('right', () => steer(1));

    function keydown(event) {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
      }

      keys.add(event.key);
    }

    function keyup(event) {
      keys.delete(event.key);
    }

    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);

    let swipeX = null;

    canvas.addEventListener('pointerdown', event => {
      swipeX = event.clientX;
    });

    canvas.addEventListener('pointerup', event => {
      if (swipeX === null) return;

      const difference = event.clientX - swipeX;

      if (Math.abs(difference) > 18) {
        steer(difference > 0 ? 1 : -1);
      }

      swipeX = null;
    });

    draw();

    activeCleanup = () => {
      cancelAnimationFrame(animation);
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
    };
  }

  /*
   * Game 3: Tower Stack
   */

  function openTower() {
    setup('🧱 Tower Stack', `
      <div class="g2-stats">
        ${stat('Height', 0, 'height')}
        ${stat('Best', best('tower'), 'best')}
      </div>

      <div class="g2-controls">
        ${button('Start / Restart', 'start', 'primary')}
        ${button('Drop Block', 'drop')}
      </div>

      ${canvasMarkup(420, 520)}

      <p class="g2-small">Tap the canvas or press Drop Block to place each moving block.</p>
      <p class="g2-status" data-status>Build your tower.</p>
    `);

    const { canvas, ctx, width, height } = getCanvas();

    let blocks = [];
    let current = null;
    let running = false;
    let direction = 1;
    let speed = 145;
    let score = 0;
    let animation = 0;
    let last = 0;

    function start() {
      cancelAnimationFrame(animation);

      blocks = [{
        x: 130,
        y: height - 45,
        w: 160,
        h: 24
      }];

      current = {
        x: 0,
        y: height - 85,
        w: 160,
        h: 24
      };

      score = 0;
      speed = 145;
      direction = 1;
      running = true;
      last = 0;

      setStat('height', 0);
      status('Tap to drop a block.');

      draw();
      animation = requestAnimationFrame(loop);
    }

    function draw() {
      ctx.fillStyle = '#050914';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(53,232,255,.14)';

      for (let y = 0; y < height; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      blocks.forEach((block, index) => {
        ctx.fillStyle = index % 2 ? '#9b6cff' : '#35e8ff';
        ctx.fillRect(block.x, block.y, block.w, block.h);
      });

      if (current) {
        ctx.fillStyle = '#43f5a5';
        ctx.fillRect(current.x, current.y, current.w, current.h);
      }

      if (!running) {
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText(blocks.length > 1 ? 'TOWER COMPLETE' : 'TOWER STACK', width / 2, 35);
      }
    }

    function end() {
      running = false;
      current = null;

      saveScore('tower', score);
      setStat('best', best('tower'));

      status(`Tower finished! You stacked ${score} blocks.`);
      draw();
    }

    function drop() {
      if (!running || !current) return;

      const previous = blocks[blocks.length - 1];

      const left = Math.max(current.x, previous.x);
      const right = Math.min(
        current.x + current.w,
        previous.x + previous.w
      );

      const overlap = right - left;

      if (overlap <= 0) {
        end();
        return;
      }

      const next = {
        x: left,
        y: current.y,
        w: overlap,
        h: current.h
      };

      blocks.push(next);
      score++;

      setStat('height', score);

      if (score >= 15) {
        end();
        status('Amazing! You completed a 15-block tower.');
        return;
      }

      speed = Math.min(390, speed + 13);

      current = {
        x: direction > 0 ? -overlap : width,
        y: current.y - 30,
        w: overlap,
        h: current.h
      };

      if (current.y < 55) {
        blocks.forEach(block => block.y += 30);
        current.y += 30;
      }

      if (current.y < 35) {
        end();
        return;
      }

      status('Nice placement! Keep stacking.');
      draw();
    }

    function loop(timestamp) {
      if (!running || !current) return;

      const delta = Math.min(.04, (timestamp - (last || timestamp)) / 1000);
      last = timestamp;

      current.x += direction * speed * delta;

      if (current.x + current.w >= width) {
        current.x = width - current.w;
        direction = -1;
      }

      if (current.x <= 0) {
        current.x = 0;
        direction = 1;
      }

      draw();
      animation = requestAnimationFrame(loop);
    }

    bindButton('start', start);
    bindButton('drop', drop);

    canvas.addEventListener('pointerdown', event => {
      event.preventDefault();
      drop();
    });

    start();

    activeCleanup = () => {
      running = false;
      cancelAnimationFrame(animation);
    };
  }

  /*
   * Game 4: Minefield Mystery
   */

  function openMinefield() {
    let size = 8;
    let mines = 10;
    let mineSet = new Set();
    let revealed = new Set();
    let flagged = new Set();
    let started = false;
    let ended = false;
    let timer = null;
    let seconds = 0;
    let firstClick = -1;

    setup('💣 Minefield Mystery', `
      <div class="g2-controls">
        <select class="g2-input g2-difficulty" data-level aria-label="Minefield size">
          <option value="8">Easy · 8 × 8</option>
          <option value="10">Medium · 10 × 10</option>
          <option value="12">Hard · 12 × 12</option>
        </select>
        ${button('New Board', 'new', 'primary')}
        ${button('Flag Mode: Off', 'flag')}
      </div>

      <div class="g2-stats">
        ${stat('Mines left', mines, 'mines')}
        ${stat('Time', '0s', 'time')}
      </div>

      <div class="g2-board" data-board style="grid-template-columns:repeat(8,minmax(0,1fr))"></div>
      <p class="g2-status" data-status>Reveal a tile. Number clues show nearby mines.</p>
      <p class="g2-small">Long-press a tile or enable Flag Mode to mark a suspected mine. Your first revealed tile is always safe.</p>
    `);

    const board = gameContent.querySelector('[data-board]');
    const level = gameContent.querySelector('[data-level]');

    let flagMode = false;

    function neighbors(index) {
      const row = Math.floor(index / size);
      const col = index % size;
      const result = [];

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;

          const r = row + dr;
          const c = col + dc;

          if (r >= 0 && r < size && c >= 0 && c < size) {
            result.push(r * size + c);
          }
        }
      }

      return result;
    }

    function countMines(index) {
      return neighbors(index).filter(item => mineSet.has(item)).length;
    }

    function render() {
      board.innerHTML = '';

      for (let i = 0; i < size * size; i++) {
        const tile = document.createElement('button');

        tile.type = 'button';
        tile.className = 'g2-tile';

        if (revealed.has(i)) {
          tile.classList.add('revealed');

          if (mineSet.has(i)) {
            tile.textContent = '💣';
          } else {
            const count = countMines(i);
            tile.textContent = count ? String(count) : '';
            tile.classList.add('safe');
          }

          tile.disabled = true;
        } else if (flagged.has(i)) {
          tile.textContent = '🚩';
        } else {
          tile.textContent = '';
          tile.setAttribute('aria-label', `Covered tile ${i + 1}`);
        }

        tile.addEventListener('click', () => {
          if (flagMode) toggleFlag(i);
          else reveal(i);
        });

        let pressTimer = null;
        let longPressed = false;

        tile.addEventListener('pointerdown', () => {
          longPressed = false;

          pressTimer = setTimeout(() => {
            longPressed = true;
            toggleFlag(i);
          }, 550);
        });

        ['pointerup', 'pointerleave', 'pointercancel'].forEach(type => {
          tile.addEventListener(type, () => clearTimeout(pressTimer));
        });

        tile.addEventListener('contextmenu', event => {
          event.preventDefault();

          if (!longPressed) toggleFlag(i);
        });

        board.appendChild(tile);
      }
    }

    function toggleFlag(index) {
      if (ended || revealed.has(index)) return;

      if (flagged.has(index)) flagged.delete(index);
      else flagged.add(index);

      setStat('mines', mines - flagged.size);
      render();
    }

    function reveal(index) {
      if (ended || revealed.has(index) || flagged.has(index)) return;

      if (!started) {
        started = true;
        firstClick = index;

        while (mineSet.has(index)) {
          mineSet.delete(index);
        }

        timer = setInterval(() => {
          seconds++;
          setStat('time', `${seconds}s`);
        }, 1000);
      }

      if (mineSet.has(index)) {
        revealed.add(index);
        ended = true;
        clearInterval(timer);
        render();
        status('Mine found! Start a new board to try again.');
        return;
      }

      floodReveal(index);

      const safeTotal = size * size - mines;

      if (revealed.size >= safeTotal) {
        ended = true;
        clearInterval(timer);
        status(`You cleared the minefield in ${seconds} seconds!`);
      } else {
        status('Safe tile! Keep exploring.');
      }

      render();
    }

    function floodReveal(start) {
      const stack = [start];

      while (stack.length) {
        const index = stack.pop();

        if (revealed.has(index) || mineSet.has(index) || flagged.has(index)) {
          continue;
        }

        revealed.add(index);

        if (countMines(index) === 0) {
          neighbors(index).forEach(next => {
            if (!revealed.has(next)) stack.push(next);
          });
        }
      }
    }

    function newBoard() {
      clearInterval(timer);

      size = Number(level.value);
      mines = size === 8 ? 10 : size === 10 ? 18 : 28;

      mineSet = new Set();
      revealed = new Set();
      flagged = new Set();

      started = false;
      ended = false;
      flagMode = false;
      seconds = 0;
      firstClick = -1;

      while (mineSet.size < mines) {
        mineSet.add(randomInt(size * size));
      }

      board.style.gridTemplateColumns = `repeat(${size},minmax(0,1fr))`;

      setStat('mines', mines);
      setStat('time', '0s');

      const flagButton = gameContent.querySelector('[data-action="flag"]');

      if (flagButton) flagButton.textContent = 'Flag Mode: Off';

      status('Your first revealed tile is safe.');
      render();
    }

    level.addEventListener('change', newBoard);

    bindButton('new', newBoard);

    bindButton('flag', () => {
      flagMode = !flagMode;

      const flagButton = gameContent.querySelector('[data-action="flag"]');

      flagButton.textContent = `Flag Mode: ${flagMode ? 'On' : 'Off'}`;
    });

    newBoard();

    activeCleanup = () => clearInterval(timer);
  }

  /*
   * Game 5: Sliding Puzzle
   */

  function openSliding() {
    let size = 3;
    let tiles = [];
    let moves = 0;
    let seconds = 0;
    let timer = null;
    let started = false;
    let completed = false;

    setup('🧩 Sliding Puzzle', `
      <div class="g2-controls">
        <select class="g2-input g2-difficulty" data-level aria-label="Puzzle size">
          <option value="3">Easy · 3 × 3</option>
          <option value="4">Medium · 4 × 4</option>
          <option value="5">Hard · 5 × 5</option>
        </select>
        ${button('Shuffle / Restart', 'new', 'primary')}
      </div>

      <div class="g2-stats">
        ${stat('Moves', 0, 'moves')}
        ${stat('Time', '0s', 'time')}
        ${stat('Best time', best('sliding') ? `${best('sliding')}s` : '—', 'best')}
      </div>

      <div class="g2-board" data-board style="grid-template-columns:repeat(3,minmax(0,1fr))"></div>
      <p class="g2-status" data-status>Arrange the tiles in numerical order.</p>
    `);

    const board = gameContent.querySelector('[data-board]');
    const level = gameContent.querySelector('[data-level]');

    function isSolved() {
      return tiles.every((value, index) =>
        index === tiles.length - 1 ? value === 0 : value === index + 1
      );
    }

    function adjacent(a, b) {
      const ar = Math.floor(a / size);
      const ac = a % size;
      const br = Math.floor(b / size);
      const bc = b % size;

      return Math.abs(ar - br) + Math.abs(ac - bc) === 1;
    }

    function move(index) {
      if (completed) return;

      const blank = tiles.indexOf(0);

      if (!adjacent(index, blank)) return;

      if (!started) {
        started = true;

        timer = setInterval(() => {
          seconds++;
          setStat('time', `${seconds}s`);
        }, 1000);
      }

      [tiles[index], tiles[blank]] = [tiles[blank], tiles[index]];

      moves++;
      setStat('moves', moves);

      render();

      if (isSolved()) {
        completed = true;
        clearInterval(timer);

        saveScore('sliding', seconds, 'min');
        setStat('best', best('sliding') ? `${best('sliding')}s` : '—');

        status(`Puzzle solved in ${moves} moves and ${seconds} seconds!`);
      }
    }

    function render() {
      board.innerHTML = '';

      tiles.forEach((value, index) => {
        const tile = document.createElement('button');

        tile.type = 'button';
        tile.className = 'g2-tile';

        if (value === 0) {
          tile.style.visibility = 'hidden';
          tile.disabled = true;
        } else {
          tile.textContent = String(value);
          tile.addEventListener('click', () => move(index));
        }

        board.appendChild(tile);
      });
    }

    function newGame() {
      clearInterval(timer);

      size = Number(level.value);

      tiles = Array.from(
        { length: size * size },
        (_, index) => (index + 1) % (size * size)
      );

      let blank = tiles.length - 1;

      /*
       * Generate a solvable shuffle by performing legal moves
       * from the solved board rather than arbitrary randomization.
       */
      let previousBlank = -1;

      for (let i = 0; i < size * size * 30; i++) {
        const options = [];

        for (let j = 0; j < tiles.length; j++) {
          if (adjacent(blank, j) && j !== previousBlank) {
            options.push(j);
          }
        }

        if (!options.length) continue;

        const next = options[randomInt(options.length)];

        [tiles[blank], tiles[next]] = [tiles[next], tiles[blank]];

        previousBlank = blank;
        blank = next;
      }

      if (isSolved()) {
        const next = adjacent(blank, blank - 1) ? blank - 1 : blank - size;

        [tiles[blank], tiles[next]] = [tiles[next], tiles[blank]];
      }

      moves = 0;
      seconds = 0;
      started = false;
      completed = false;

      board.style.gridTemplateColumns = `repeat(${size},minmax(0,1fr))`;

      setStat('moves', 0);
      setStat('time', '0s');
      setStat('best', best('sliding') ? `${best('sliding')}s` : '—');

      status('Tap a tile beside the empty space to move it.');
      render();
    }

    level.addEventListener('change', newGame);
    bindButton('new', newGame);

    newGame();

    activeCleanup = () => clearInterval(timer);
  }

  /*
   * Game 6: Alien Invasion
   */

  function openAlien() {
    setup('👾 Alien Invasion', `
      <div class="g2-stats">
        ${stat('Score', 0, 'score')}
        ${stat('Lives', 3, 'lives')}
        ${stat('Wave', 1, 'wave')}
        ${stat('Best', best('alien'), 'best')}
      </div>

      <div class="g2-controls">
        ${button('Launch / Restart', 'start', 'primary')}
      </div>

      ${canvasMarkup(420, 560)}

      <p class="g2-small">Move with the touchpad, arrow keys, or by dragging across the canvas. Tap FIRE to shoot.</p>

      <div class="g2-controls">
        ${button('◀ Left', 'left')}
        ${button('🔥 FIRE', 'fire', 'primary')}
        ${button('Right ▶', 'right')}
      </div>

      <p class="g2-status" data-status>Launch your ship to begin.</p>
    `);

    const { canvas, ctx, width, height } = getCanvas();

    let player = { x: width / 2, y: height - 55 };
    let enemies = [];
    let bullets = [];
    let score = 0;
    let lives = 3;
    let wave = 1;
    let running = false;
    let last = 0;
    let fireClock = 0;
    let enemyClock = 0;
    let animation = 0;

    const keys = new Set();
    let moveDirection = 0;
    let firing = false;

    function spawnWave() {
      enemies = [];

      const columns = Math.min(8, 3 + wave);

      for (let i = 0; i < columns; i++) {
        enemies.push({
          x: 35 + i * ((width - 70) / Math.max(1, columns - 1)),
          y: 50 + randomInt(55),
          vx: (randomInt(2) ? 1 : -1) * (35 + wave * 4),
          alive: true
        });
      }
    }

    function draw() {
      ctx.fillStyle = '#050914';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 45; i++) {
        ctx.fillStyle = i % 2 ? '#24395c' : '#35e8ff';
        ctx.fillRect((i * 73) % width, (i * 97) % height, 2, 2);
      }

      enemies.forEach(enemy => {
        if (!enemy.alive) return;

        ctx.fillStyle = '#ff557b';
        ctx.fillRect(enemy.x - 14, enemy.y - 10, 28, 20);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(enemy.x - 7, enemy.y - 4, 4, 4);
        ctx.fillRect(enemy.x + 3, enemy.y - 4, 4, 4);
      });

      bullets.forEach(bullet => {
        ctx.fillStyle = '#43f5a5';
        ctx.fillRect(bullet.x - 2, bullet.y, 4, 12);
      });

      ctx.fillStyle = '#35e8ff';
      ctx.beginPath();
      ctx.moveTo(player.x, player.y - 19);
      ctx.lineTo(player.x - 16, player.y + 16);
      ctx.lineTo(player.x + 16, player.y + 16);
      ctx.closePath();
      ctx.fill();

      if (!running) {
        ctx.fillStyle = 'rgba(0,0,0,.5)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('ALIEN INVASION', width / 2, height / 2);
      }
    }

    function endGame() {
      running = false;

      saveScore('alien', score);

      setStat('best', best('alien'));
      status(`Mission over! Final score: ${score}. Restart to defend the galaxy again.`);
      draw();
    }

    function loop(timestamp) {
      if (!running) return;

      const delta = Math.min(.04, (timestamp - (last || timestamp)) / 1000);
      last = timestamp;

      if (keys.has('ArrowLeft') || keys.has('a')) moveDirection = -1;
      else if (keys.has('ArrowRight') || keys.has('d')) moveDirection = 1;
      else if (!gameContent.querySelector('[data-pad="left"]:active') &&
               !gameContent.querySelector('[data-pad="right"]:active')) {
        moveDirection = 0;
      }

      if (keys.has(' ') || firing) fireClock += delta;
      else fireClock = Math.max(0, fireClock - delta);

      player.x += moveDirection * 270 * delta;
      player.x = Math.max(20, Math.min(width - 20, player.x));

      if ((keys.has(' ') || firing) && fireClock > .18) {
        bullets.push({ x: player.x, y: player.y - 22 });
        fireClock = 0;
      }

      bullets.forEach(bullet => bullet.y -= 380 * delta);
      bullets = bullets.filter(bullet => bullet.y > -20);

      enemies.forEach(enemy => {
        if (!enemy.alive) return;

        enemy.x += enemy.vx * delta;

        if (enemy.x < 20 || enemy.x > width - 20) {
          enemy.vx *= -1;
          enemy.y += 12;
        }

        for (const bullet of bullets) {
          if (
            bullet.y < enemy.y + 12 &&
            bullet.y > enemy.y - 12 &&
            Math.abs(bullet.x - enemy.x) < 19
          ) {
            enemy.alive = false;
            bullet.y = -100;
            score += 10;
            setStat('score', score);
          }
        }

        if (enemy.y > player.y - 20) {
          enemy.alive = false;
          lives--;
          setStat('lives', lives);

          if (lives <= 0) {
            endGame();
          }
        }
      });

      if (!running) return;

      enemies = enemies.filter(enemy => enemy.alive);

      if (!enemies.length) {
        wave++;
        setStat('wave', wave);

        spawnWave();
        status(`Wave ${wave}! Keep defending.`);
      }

      draw();

      animation = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(animation);

      player = { x: width / 2, y: height - 55 };
      bullets = [];
      score = 0;
      lives = 3;
      wave = 1;
      last = 0;
      fireClock = 0;
      enemyClock = 0;
      running = true;
      moveDirection = 0;
      firing = false;

      setStat('score', 0);
      setStat('lives', 3);
      setStat('wave', 1);
      setStat('best', best('alien'));

      spawnWave();

      status('Defend the galaxy!');
      draw();

      animation = requestAnimationFrame(loop);
    }

    bindButton('start', start);
    bindButton('left', () => { moveDirection = -1; });
    bindButton('right', () => { moveDirection = 1; });

    const fireButton = gameContent.querySelector('[data-action="fire"]');

    fireButton.addEventListener('pointerdown', event => {
      event.preventDefault();
      firing = true;
    });

    ['pointerup', 'pointerleave', 'pointercancel'].forEach(type => {
      fireButton.addEventListener(type, () => { firing = false; });
    });

    function keydown(event) {
      if (['ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
        event.preventDefault();
      }

      keys.add(event.key);
    }

    function keyup(event) {
      keys.delete(event.key);
    }

    document.addEventListener('keydown', keydown);
    document.addEventListener('keyup', keyup);

    let dragging = false;

    canvas.addEventListener('pointerdown', event => {
      dragging = true;
      canvas.setPointerCapture(event.pointerId);
      updatePlayer(event);
    });

    canvas.addEventListener('pointermove', event => {
      if (dragging) updatePlayer(event);
    });

    canvas.addEventListener('pointerup', () => { dragging = false; });
    canvas.addEventListener('pointercancel', () => { dragging = false; });

    function updatePlayer(event) {
      const rect = canvas.getBoundingClientRect();

      player.x = (event.clientX - rect.left) / rect.width * width;
      player.x = Math.max(20, Math.min(width - 20, player.x));
    }

    start();

    activeCleanup = () => {
      running = false;
      firing = false;

      cancelAnimationFrame(animation);

      document.removeEventListener('keydown', keydown);
      document.removeEventListener('keyup', keyup);
    };
  }

  /*
   * Game 7: Target Master
   */

  function openTarget() {
    setup('🎯 Target Master', `
      <div class="g2-stats">
        ${stat('Score', 0, 'score')}
        ${stat('Time', 60, 'time')}
        ${stat('Hits', 0, 'hits')}
        ${stat('Accuracy', '0%', 'accuracy')}
      </div>

      <div class="g2-controls">
        ${button('Start Challenge', 'start', 'primary')}
      </div>

      ${canvasMarkup(420, 420)}

      <p class="g2-status" data-status>Tap targets before they disappear.</p>
    `);

    const { canvas, ctx, width, height } = getCanvas();

    let target = { x: 210, y: 210, r: 25 };
    let score = 0;
    let hits = 0;
    let attempts = 0;
    let seconds = 60;
    let running = false;
    let animation = 0;
    let targetClock = 0;
    let timerCleanup = null;

    function moveTarget() {
      target.r = 17 + randomInt(15);
      target.x = target.r + randomInt(width - target.r * 2);
      target.y = target.r + randomInt(height - target.r * 2);
      targetClock = 0;
    }

    function draw() {
      ctx.fillStyle = '#050914';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(53,232,255,.12)';

      for (let x = 20; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 20; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (running) {
        ctx.strokeStyle = '#35e8ff';
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#43f5a5';
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.r * .55, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#050914';
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.r * .2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = 'bold 23px sans-serif';
        ctx.fillText('TARGET MASTER', width / 2, height / 2);
      }
    }

    function end() {
      running = false;

      if (timerCleanup) timerCleanup();

      saveScore('target', score);
      setStat('best', best('target'));

      status(`Time's up! You scored ${score} points.`);
      draw();
    }

    function start() {
      cancelAnimationFrame(animation);

      score = 0;
      hits = 0;
      attempts = 0;
      seconds = 60;
      running = true;

      setStat('score', 0);
      setStat('hits', 0);
      setStat('time', 60);
      setStat('accuracy', '0%');

      moveTarget();

      if (timerCleanup) timerCleanup();

      timerCleanup = startTimer(60, remaining => {
        seconds = remaining;
        setStat('time', remaining);
      }, end);

      status('Go! Hit the targets.');

      animation = startLoop(() => {
        if (!running) return;

        targetClock += 1 / 60;

        if (targetClock > 1.6) moveTarget();

        draw();
      });
    }

    canvas.addEventListener('pointerdown', event => {
      if (!running) return;

      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width * width;
      const y = (event.clientY - rect.top) / rect.height * height;

      attempts++;

      const distance = Math.hypot(x - target.x, y - target.y);

      if (distance <= target.r) {
        hits++;

        const points = distance < target.r * .35 ? 15 : 10;

        score += points;

        moveTarget();
        status(`Direct hit! +${points} points.`);
      } else {
        status('Miss! Keep trying.');
      }

      setStat('score', score);
      setStat('hits', hits);
      setStat('accuracy', `${Math.round(hits / attempts * 100)}%`);
    });

    bindButton('start', start);

    start();

    activeCleanup = () => {
      cancelAnimationFrame(animation);
      if (timerCleanup) timerCleanup();
    };
  }

  /*
   * Game 8: Word Scramble
   */

  function openWords() {
    const words = [
      { word: 'JAVASCRIPT', hint: 'A popular programming language.' },
      { word: 'GALAXY', hint: 'A huge collection of stars.' },
      { word: 'PLANET', hint: 'A world that orbits a star.' },
      { word: 'KEYBOARD', hint: 'An input device for typing.' },
      { word: 'BROWSER', hint: 'An app used to visit websites.' },
      { word: 'NETWORK', hint: 'Connected computers or devices.' },
      { word: 'RAINBOW', hint: 'A colorful arc in the sky.' },
      { word: 'DIAMOND', hint: 'A very hard precious gemstone.' },
      { word: 'ELEPHANT', hint: 'A large animal with a trunk.' },
      { word: 'NOTEBOOK', hint: 'A book for writing notes.' },
      { word: 'PUZZLE', hint: 'A problem that needs solving.' },
      { word: 'ROBOT', hint: 'A machine that can perform tasks.' },
      { word: 'CRYSTAL', hint: 'A solid with an ordered structure.' },
      { word: 'COMPUTER', hint: 'A programmable electronic machine.' },
      { word: 'OCEAN', hint: 'A vast body of salt water.' }
    ];

    let queue = [];
    let index = 0;
    let score = 0;
    let streak = 0;
    let seconds = 60;
    let completed = false;
    let timerCleanup = null;

    setup('🔤 Word Scramble', `
      <div class="g2-stats">
        ${stat('Score', 0, 'score')}
        ${stat('Streak', 0, 'streak')}
        ${stat('Time', 60, 'time')}
        ${stat('Best', best('words'), 'best')}
      </div>

      <div class="g2-controls">
        ${button('New Challenge', 'start', 'primary')}
        ${button('Show Hint', 'hint')}
        ${button('Skip Word', 'skip')}
      </div>

      <div class="g2-word" data-scrambled>READY?</div>

      <p class="g2-status" data-status>Unscramble the letters before time runs out.</p>

      <form class="g2-word-form" data-form>
        <input class="g2-input" data-answer type="text" autocomplete="off" spellcheck="false" placeholder="Type your answer" aria-label="Your answer">
        <button class="g2-btn primary" type="submit">Check</button>
      </form>
    `);

    const scrambledNode = gameContent.querySelector('[data-scrambled]');
    const answer = gameContent.querySelector('[data-answer]');
    const form = gameContent.querySelector('[data-form]');

    function scramble(word) {
      let result = word;

      for (let i = 0; i < 10 && result === word; i++) {
        result = shuffle(word.split('')).join('');
      }

      return result;
    }

    function current() {
      return queue[index];
    }

    function showWord() {
      if (!current()) {
        finish();
        return;
      }

      scrambledNode.textContent = scramble(current().word);
      answer.value = '';
      answer.focus();
      status('Unscramble the letters.');
    }

    function finish() {
      completed = true;

      if (timerCleanup) timerCleanup();

      scrambledNode.textContent = 'CHALLENGE COMPLETE';

      saveScore('words', score);
      setStat('best', best('words'));

      status(`Challenge complete! Final score: ${score}.`);
    }

    function start() {
      if (timerCleanup) timerCleanup();

      queue = shuffle(words);
      index = 0;
      score = 0;
      streak = 0;
      seconds = 60;
      completed = false;

      setStat('score', 0);
      setStat('streak', 0);
      setStat('time', 60);
      setStat('best', best('words'));

      timerCleanup = startTimer(60, remaining => {
        seconds = remaining;
        setStat('time', remaining);
      }, finish);

      showWord();
    }

    form.addEventListener('submit', event => {
      event.preventDefault();

      if (completed || !current()) return;

      const guess = answer.value.trim().toUpperCase();

      if (guess === current().word) {
        streak++;

        score += 10 + Math.min(20, streak * 2);

        setStat('score', score);
        setStat('streak', streak);

        status(`Correct! The word was ${current().word}.`);

        index++;
        showWord();
      } else {
        streak = 0;
        setStat('streak', 0);
        status('Not quite. Try again!');
      }
    });

    bindButton('start', start);

    bindButton('hint', () => {
      if (!completed && current()) status(`Hint: ${current().hint}`);
    });

    bindButton('skip', () => {
      if (completed || !current()) return;

      streak = 0;
      setStat('streak', 0);

      index++;
      showWord();
    });

    start();

    activeCleanup = () => {
      if (timerCleanup) timerCleanup();
    };
  }

  /*
   * Game 9: Air Hockey
   */

  function openHockey() {
    setup('🏓 Air Hockey', `
      <div class="g2-stats">
        ${stat('You', 0, 'player')}
        ${stat('Computer', 0, 'computer')}
        ${stat('Time', 60, 'time')}
      </div>

      <div class="g2-controls">
        ${button('Start / Restart', 'start', 'primary')}
        ${button('Computer Difficulty: Normal', 'difficulty')}
      </div>

      ${canvasMarkup(420, 620)}

      <p class="g2-small">Drag your paddle on the table. You can also use the directional touchpad.</p>

      ${makeTouchpad()}

      <p class="g2-status" data-status>First to 5 goals wins, or lead when time expires.</p>
    `);

    const { canvas, ctx, width, height } = getCanvas();

    let playerScore = 0;
    let computerScore = 0;
    let seconds = 60;
    let running = false;
    let difficulty = 1;
    let timerCleanup = null;
    let animation = 0;
    let last = 0;

    const player = { x: width / 2, y: height - 75, r: 24 };
    const computer = { x: width / 2, y: 75, r: 24 };
    const puck = { x: width / 2, y: height / 2, r: 12, vx: 160, vy: 220 };

    let moveX = 0;
    let moveY = 0;

    function resetPuck(direction = 1) {
      puck.x = width / 2;
      puck.y = height / 2;
      puck.vx = (Math.random() > .5 ? 1 : -1) * (110 + randomInt(80));
      puck.vy = direction * (180 + randomInt(60));
    }

    function draw() {
      ctx.fillStyle = '#07182a';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#35e8ff';
      ctx.lineWidth = 3;
      ctx.strokeRect(15, 15, width - 30, height - 30);

      ctx.beginPath();
      ctx.moveTo(15, height / 2);
      ctx.lineTo(width - 15, height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ff557b';
      ctx.beginPath();
      ctx.arc(computer.x, computer.y, computer.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#43f5a5';
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(puck.x, puck.y, puck.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#35e8ff';
      ctx.font = 'bold 27px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${playerScore}  -  ${computerScore}`, width / 2, height / 2 - 15);

      if (!running) {
        ctx.fillStyle = 'rgba(0,0,0,.4)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px sans-serif';
        ctx.fillText('AIR HOCKEY', width / 2, height / 2 + 55);
      }
    }

    function finish(message) {
      running = false;

      if (timerCleanup) timerCleanup();

      status(message);
      draw();
    }

    function scoreGoal(side) {
      if (side === 'player') {
        playerScore++;
        setStat('player', playerScore);

        resetPuck(-1);
        status('Goal! You scored.');
      } else {
        computerScore++;
        setStat('computer', computerScore);

        resetPuck(1);
        status('The computer scored. Keep going!');
      }

      if (playerScore >= 5 || computerScore >= 5) {
        finish(playerScore > computerScore ? 'You win the match! 🏆' : 'Computer wins. Try again!');
      }
    }

    function loop(timestamp) {
      if (!running) return;

      const delta = Math.min(.035, (timestamp - (last || timestamp)) / 1000);
      last = timestamp;

      player.x += moveX * 250 * delta;
      player.y += moveY * 250 * delta;

      player.x = Math.max(player.r + 15, Math.min(width - player.r - 15, player.x));
      player.y = Math.max(height / 2 + player.r + 5, Math.min(height - player.r - 15, player.y));

      const desiredX = puck.x;
      const desiredY = puck.y - 45;

      computer.x += Math.max(
        -180 * difficulty * delta,
        Math.min(180 * difficulty * delta, desiredX - computer.x)
      );

      computer.y += Math.max(
        -100 * difficulty * delta,
        Math.min(100 * difficulty * delta, desiredY - computer.y)
      );

      computer.x = Math.max(computer.r + 15, Math.min(width - computer.r - 15, computer.x));
      computer.y = Math.max(computer.r + 15, Math.min(height / 2 - computer.r - 5, computer.y));

      puck.x += puck.vx * delta;
      puck.y += puck.vy * delta;

      if (puck.x < puck.r + 15 || puck.x > width - puck.r - 15) {
        puck.vx *= -1;
      }

      if (puck.y < 25) {
        if (puck.x > width * .35 && puck.x < width * .65) {
          scoreGoal('player');
        } else {
          puck.vy *= -1;
        }
      }

      if (puck.y > height - 25) {
        if (puck.x > width * .35 && puck.x < width * .65) {
          scoreGoal('computer');
        } else {
          puck.vy *= -1;
        }
      }

      [[player, 1], [computer, -1]].forEach(([paddle, direction]) => {
        const dx = puck.x - paddle.x;
        const dy = puck.y - paddle.y;
        const distance = Math.hypot(dx, dy);

        if (distance < puck.r + paddle.r && distance > 0) {
          const nx = dx / distance;
          const ny = dy / distance;

          puck.vx = nx * 230;
          puck.vy = ny * 260;

          if (direction === 1 && puck.vy < 0) puck.vy = -Math.abs(puck.vy);
          if (direction === -1 && puck.vy > 0) puck.vy = Math.abs(puck.vy);

          puck.x = paddle.x + nx * (puck.r + paddle.r + 1);
          puck.y = paddle.y + ny * (puck.r + paddle.r + 1);
        }
      });

      draw();

      animation = requestAnimationFrame(loop);
    }

    function start() {
      cancelAnimationFrame(animation);

      playerScore = 0;
      computerScore = 0;
      seconds = 60;
      running = true;
      last = 0;
      moveX = 0;
      moveY = 0;

      player.x = width / 2;
      player.y = height - 75;
      computer.x = width / 2;
      computer.y = 75;

      setStat('player', 0);
      setStat('computer', 0);
      setStat('time', 60);

      resetPuck(Math.random() > .5 ? 1 : -1);

      if (timerCleanup) timerCleanup();

      timerCleanup = startTimer(60, remaining => {
        seconds = remaining;
        setStat('time', remaining);
      }, () => {
        finish(
          playerScore === computerScore
            ? 'The match is a draw!'
            : playerScore > computerScore
              ? 'Time up! You win! 🏆'
              : 'Time up! The computer wins.'
        );
      });

      status('Match started!');
      animation = requestAnimationFrame(loop);
    }

    bindButton('start', start);

    bindButton('difficulty', () => {
      difficulty = difficulty === 1 ? 1.6 : difficulty === 1.6 ? .65 : 1;

      const buttonNode = gameContent.querySelector('[data-action="difficulty"]');

      buttonNode.textContent = `Computer Difficulty: ${
        difficulty === 1 ? 'Normal' : difficulty === 1.6 ? 'Hard' : 'Easy'
      }`;
    });

    bindPad(direction => {
      moveX = direction === 'left' ? -1 : direction === 'right' ? 1 : 0;
      moveY = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
    });

    const padButtons = gameContent.querySelectorAll('[data-pad]');

    padButtons.forEach(button => {
      button.addEventListener('pointerup', () => {
        moveX = 0;
        moveY = 0;
      });

      button.addEventListener('pointercancel', () => {
        moveX = 0;
        moveY = 0;
      });

      button.addEventListener('pointerleave', () => {
        moveX = 0;
        moveY = 0;
      });
    });

    let dragging = false;

    canvas.addEventListener('pointerdown', event => {
      dragging = true;
      canvas.setPointerCapture(event.pointerId);
      movePaddle(event);
    });

    canvas.addEventListener('pointermove', event => {
      if (dragging) movePaddle(event);
    });

    canvas.addEventListener('pointerup', () => { dragging = false; });
    canvas.addEventListener('pointercancel', () => { dragging = false; });

    function movePaddle(event) {
      const rect = canvas.getBoundingClientRect();

      player.x = (event.clientX - rect.left) / rect.width * width;
      player.y = (event.clientY - rect.top) / rect.height * height;

      player.x = Math.max(player.r + 15, Math.min(width - player.r - 15, player.x));
      player.y = Math.max(height / 2 + player.r + 5, Math.min(height - player.r - 15, player.y));
    }

    start();

    activeCleanup = () => {
      running = false;

      cancelAnimationFrame(animation);

      if (timerCleanup) timerCleanup();
    };
  }

  /*
   * Game 10: Neon Maze
   */

  function openMaze() {
    let size = 15;
    let maze = [];
    let player = { x: 0, y: 0 };
    let exit = { x: 14, y: 14 };
    let crystals = new Set();
    let collected = 0;
    let moves = 0;
    let seconds = 0;
    let timer = null;
    let finished = false;

    setup('🌀 Neon Maze', `
      <div class="g2-controls">
        <select class="g2-input g2-difficulty" data-level aria-label="Maze difficulty">
          <option value="11">Easy</option>
          <option value="15" selected>Medium</option>
          <option value="21">Hard</option>
        </select>
        ${button('New Maze', 'new', 'primary')}
      </div>

      <div class="g2-stats">
        ${stat('Crystals', 0, 'crystals')}
        ${stat('Moves', 0, 'moves')}
        ${stat('Time', '0s', 'time')}
        ${stat('Best time', best('maze') ? `${best('maze')}s` : '—', 'best')}
      </div>

      <div class="g2-board" data-board style="grid-template-columns:repeat(15,minmax(0,1fr))"></div>

      ${makeTouchpad()}

      <p class="g2-status" data-status>Find the exit and collect crystals along the way.</p>
    `);

    const board = gameContent.querySelector('[data-board]');
    const level = gameContent.querySelector('[data-level]');

    function key(x, y) {
      return `${x},${y}`;
    }

    function generateMaze() {
      maze = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => ({
          top: true,
          right: true,
          bottom: true,
          left: true,
          visited: false
        }))
      );

      const stack = [{ x: 0, y: 0 }];

      maze[0][0].visited = true;

      while (stack.length) {
        const current = stack[stack.length - 1];

        const choices = [
          { x: current.x, y: current.y - 1, wall: 'top', opposite: 'bottom' },
          { x: current.x + 1, y: current.y, wall: 'right', opposite: 'left' },
          { x: current.x, y: current.y + 1, wall: 'bottom', opposite: 'top' },
          { x: current.x - 1, y: current.y, wall: 'left', opposite: 'right' }
        ].filter(next =>
          next.x >= 0 && next.x < size &&
          next.y >= 0 && next.y < size &&
          !maze[next.y][next.x].visited
        );

        if (!choices.length) {
          stack.pop();
          continue;
        }

        const next = choices[randomInt(choices.length)];

        maze[current.y][current.x][next.wall] = false;
        maze[next.y][next.x][next.opposite] = false;

        maze[next.y][next.x].visited = true;

        stack.push({ x: next.x, y: next.y });
      }

      crystals = new Set();

      while (crystals.size < Math.min(8, Math.floor(size / 2))) {
        const x = randomInt(size);
        const y = randomInt(size);

        if ((x || y) && (x !== size - 1 || y !== size - 1)) {
          crystals.add(key(x, y));
        }
      }

      player = { x: 0, y: 0 };
      exit = { x: size - 1, y: size - 1 };

      collected = 0;
      moves = 0;
      seconds = 0;
      finished = false;

      clearInterval(timer);

      timer = setInterval(() => {
        if (!finished) {
          seconds++;
          setStat('time', `${seconds}s`);
        }
      }, 1000);

      setStat('crystals', 0);
      setStat('moves', 0);
      setStat('time', '0s');
      setStat('best', best('maze') ? `${best('maze')}s` : '—');

      status('Navigate the maze to reach the exit.');
      render();
    }

    function render() {
      board.innerHTML = '';

      board.style.gridTemplateColumns = `repeat(${size},minmax(0,1fr))`;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const cell = maze[y][x];
          const tile = document.createElement('button');

          tile.type = 'button';
          tile.className = 'g2-tile';

          tile.style.aspectRatio = '1';
          tile.style.borderRadius = '2px';
          tile.style.padding = '0';
          tile.style.fontSize = 'clamp(.45rem,2.5vw,.9rem)';
          tile.style.borderTop = cell.top ? '2px solid #35e8ff' : '2px solid transparent';
          tile.style.borderRight = cell.right ? '2px solid #35e8ff' : '2px solid transparent';
          tile.style.borderBottom = cell.bottom ? '2px solid #35e8ff' : '2px solid transparent';
          tile.style.borderLeft = cell.left ? '2px solid #35e8ff' : '2px solid transparent';

          if (player.x === x && player.y === y) {
            tile.textContent = '🟢';
          } else if (exit.x === x && exit.y === y) {
            tile.textContent = '🏁';
          } else if (crystals.has(key(x, y))) {
            tile.textContent = '💎';
          }

          tile.setAttribute('aria-label', `Maze cell ${x + 1}, ${y + 1}`);

          tile.addEventListener('click', () => {
            const dx = x - player.x;
            const dy = y - player.y;

            if (Math.abs(dx) + Math.abs(dy) === 1) {
              move(dx, dy);
            }
          });

          board.appendChild(tile);
        }
      }
    }

    function move(dx, dy) {
      if (finished) return;

      const cell = maze[player.y][player.x];

      if (dx === 1 && cell.right) return;
      if (dx === -1 && cell.left) return;
      if (dy === 1 && cell.bottom) return;
      if (dy === -1 && cell.top) return;

      const nx = player.x + dx;
      const ny = player.y + dy;

      if (nx < 0 || nx >= size || ny < 0 || ny >= size) return;

      player.x = nx;
      player.y = ny;
      moves++;

      const crystalKey = key(nx, ny);

      if (crystals.has(crystalKey)) {
        crystals.delete(crystalKey);
        collected++;

        setStat('crystals', collected);
      }

      setStat('moves', moves);

      if (player.x === exit.x && player.y === exit.y) {
        finished = true;
        clearInterval(timer);

        saveScore('maze', seconds, 'min');
        setStat('best', best('maze') ? `${best('maze')}s` : '—');

        status(`You escaped in ${seconds}s with ${collected} crystals!`);
      } else {
        status('Keep going! Find the exit.');
      }

      render();
    }

    function onKey(event) {
      const directions = {
        ArrowUp: [0, -1],
        w: [0, -1],
        ArrowDown: [0, 1],
        s: [0, 1],
        ArrowLeft: [-1, 0],
        a: [-1, 0],
        ArrowRight: [1, 0],
        d: [1, 0]
      };

      const direction = directions[event.key];

      if (direction) {
        event.preventDefault();
        move(direction[0], direction[1]);
      }
    }

    bindPad(direction => {
      const movesMap = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0]
      };

      move(...movesMap[direction]);
    });

    document.addEventListener('keydown', onKey);

    level.addEventListener('change', () => {
      size = Number(level.value);
      generateMaze();
    });

    bindButton('new', () => {
      size = Number(level.value);
      generateMaze();
    });

    generateMaze();

    activeCleanup = () => {
      clearInterval(timer);
      document.removeEventListener('keydown', onKey);
    };
  }

  /*
   * Game catalogue
   */

  function renderCatalogue() {
    grid.innerHTML = games.map(game => `
      <article class="g2-card">
        <div class="g2-icon" aria-hidden="true">${game.icon}</div>
        <h3>${game.name}</h3>
        <p>${game.description}</p>
        <button
          type="button"
          class="g2-btn primary"
          data-open-game="${game.id}"
        >▶ Play Now</button>
      </article>
    `).join('');
  }

  const gameHandlers = {
    memory: openMemory,
    racing: openRacing,
    tower: openTower,
    minefield: openMinefield,
    sliding: openSliding,
    alien: openAlien,
    target: openTarget,
    words: openWords,
    hockey: openHockey,
    maze: openMaze
  };

  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-open-game]');

    if (!button) return;

    const handler = gameHandlers[button.dataset.openGame];

    if (handler) handler();
  });

  $('[data-g2-back]').addEventListener('click', () => {
    stopActiveGame();

    gamePanel.hidden = true;

    root.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  });

  /*
   * Respond to theme changes without overriding index.html.
   */
  const themeObserver = new MutationObserver(() => {
    root.dataset.theme = document.documentElement.dataset.theme || 'dark';
  });

  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  renderCatalogue();

  console.info('RexWeb Nexora Game 2 loaded: 10 additional games.');
})();