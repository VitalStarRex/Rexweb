(() => {
  'use strict';

  /*
   * REXWEB NEXORA — GAME 2
   * ARCADE UNIVERSE · EXTRA GAMES
   *
   * 10 additional games:
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
   * Features:
   * - Two-row game launcher
   * - Compact Android-friendly layout
   * - Individual full-screen game view
   * - Back button to return to the launcher
   * - Touch-friendly controls
   * - Keyboard controls where appropriate
   * - No replacement of the original game.js
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

  const style = document.createElement('style');

  style.textContent = `
    #nx2-launcher,
    #nx2-overlay {
      font-family: system-ui, -apple-system, BlinkMacSystemFont,
        "Segoe UI", sans-serif;
      box-sizing: border-box;
    }

    #nx2-launcher *,
    #nx2-overlay * {
      box-sizing: border-box;
    }

    #nx2-launcher {
      width: 100%;
      max-width: 1100px;
      margin: 14px auto 24px;
      padding: 0;
      color: var(--text, #eef5ff);
    }

    #nx2-launcher .nx2-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 10px;
    }

    #nx2-launcher .nx2-heading h2 {
      margin: 0;
      font-size: clamp(17px, 4vw, 24px);
      line-height: 1.2;
      letter-spacing: .04em;
    }

    #nx2-launcher .nx2-heading p {
      margin: 4px 0 0;
      font-size: 11px;
      opacity: .7;
    }

    #nx2-launcher .nx2-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      grid-template-rows: repeat(2, auto);
      gap: 8px;
      width: 100%;
    }

    #nx2-launcher .nx2-card {
      appearance: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-width: 0;
      min-height: 82px;
      padding: 8px 3px;
      border: 1px solid #263d5c;
      border-radius: 12px;
      background: linear-gradient(145deg, #111d33, #070c18);
      color: #f0f7ff;
      text-align: center;
      cursor: pointer;
      box-shadow: 0 4px 12px #0003;
      -webkit-tap-highlight-color: transparent;
      transition: border-color .15s, transform .15s;
    }

    #nx2-launcher .nx2-card:hover,
    #nx2-launcher .nx2-card:focus-visible {
      border-color: #35e8ff;
      outline: none;
    }

    #nx2-launcher .nx2-card:active {
      transform: scale(.97);
    }

    #nx2-launcher .nx2-icon {
      display: block;
      font-size: clamp(19px, 4vw, 29px);
      line-height: 1;
    }

    #nx2-launcher .nx2-name {
      display: block;
      width: 100%;
      font-size: clamp(9px, 1.5vw, 12px);
      font-weight: 800;
      line-height: 1.2;
      overflow-wrap: anywhere;
    }

    #nx2-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483000;
      display: none;
      flex-direction: column;
      overflow: auto;
      overscroll-behavior: contain;
      padding:
        max(9px, env(safe-area-inset-top))
        10px
        max(12px, env(safe-area-inset-bottom));
      background: #050914;
      color: #eef5ff;
    }

    #nx2-overlay.nx2-active {
      display: flex;
    }

    #nx2-overlay .nx2-topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      width: 100%;
      max-width: 850px;
      margin: 0 auto 10px;
    }

    #nx2-overlay .nx2-title {
      min-width: 0;
      margin: 0;
      font-size: clamp(17px, 4vw, 23px);
      overflow-wrap: anywhere;
    }

    #nx2-overlay .nx2-btn {
      appearance: none;
      border: 1px solid #35e8ff;
      border-radius: 9px;
      padding: 9px 12px;
      background: #10283b;
      color: #e7fbff;
      font-size: 13px;
      font-weight: 800;
      cursor: pointer;
      touch-action: manipulation;
    }

    #nx2-overlay .nx2-btn:active {
      transform: scale(.97);
    }

    #nx2-overlay .nx2-content {
      width: 100%;
      max-width: 850px;
      margin: 0 auto;
      text-align: center;
    }

    #nx2-overlay .nx2-status {
      min-height: 24px;
      margin: 8px 0;
      color: #7cf4ff;
      font-size: 14px;
      font-weight: 700;
    }

    #nx2-overlay .nx2-panel {
      width: 100%;
      max-width: 520px;
      margin: 0 auto;
      padding: 12px;
      border: 1px solid #203957;
      border-radius: 15px;
      background: linear-gradient(145deg, #0d192c, #070d19);
    }

    #nx2-overlay .nx2-board {
      display: grid;
      gap: 7px;
      width: 100%;
      max-width: 390px;
      margin: 10px auto;
    }

    #nx2-overlay .nx2-cell {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 0;
      aspect-ratio: 1;
      border: 1px solid #294664;
      border-radius: 9px;
      background: #101d32;
      color: #f1fbff;
      font-size: clamp(15px, 5vw, 27px);
      font-weight: 800;
      cursor: pointer;
      touch-action: manipulation;
      user-select: none;
    }

    #nx2-overlay .nx2-cell:active {
      border-color: #35e8ff;
    }

    #nx2-overlay .nx2-cell.nx2-selected {
      border-color: #35e8ff;
      background: #14354b;
    }

    #nx2-overlay .nx2-cell.nx2-safe {
      background: #124333;
      border-color: #43f5a5;
    }

    #nx2-overlay .nx2-cell.nx2-bomb {
      background: #51202c;
      border-color: #ff6687;
    }

    #nx2-overlay .nx2-controls {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 8px;
      margin: 10px auto;
    }

    #nx2-overlay .nx2-help {
      margin: 10px auto;
      max-width: 520px;
      color: #aebfd4;
      font-size: 12px;
      line-height: 1.5;
    }

    #nx2-overlay canvas {
      display: block;
      width: 100%;
      max-width: 520px;
      height: auto;
      margin: 10px auto;
      border: 1px solid #25415f;
      border-radius: 12px;
      background: #07101f;
      touch-action: none;
    }

    #nx2-overlay .nx2-input {
      display: block;
      width: 100%;
      max-width: 320px;
      margin: 10px auto;
      padding: 12px;
      border: 1px solid #34516f;
      border-radius: 10px;
      background: #07101e;
      color: #fff;
      font-size: 16px;
      text-align: center;
      outline: none;
    }

    #nx2-overlay .nx2-input:focus {
      border-color: #35e8ff;
    }

    #nx2-overlay .nx2-big {
      font-size: clamp(23px, 7vw, 38px);
      font-weight: 900;
      letter-spacing: .08em;
    }

    #nx2-overlay .nx2-small {
      color: #b5c6dc;
      font-size: 12px;
    }

    @media (max-width: 420px) {
      #nx2-launcher {
        margin-top: 10px;
      }

      #nx2-launcher .nx2-grid {
        gap: 5px;
      }

      #nx2-launcher .nx2-card {
        min-height: 68px;
        padding: 6px 2px;
        gap: 5px;
        border-radius: 9px;
      }

      #nx2-launcher .nx2-name {
        font-size: 9px;
      }

      #nx2-overlay {
        padding-left: 7px;
        padding-right: 7px;
      }

      #nx2-overlay .nx2-panel {
        padding: 8px;
      }

      #nx2-overlay .nx2-board {
        gap: 5px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #nx2-launcher .nx2-card {
        transition: none;
      }
    }
  `;

  document.head.appendChild(style);

  /*
   * Insert the launcher BEFORE the original arcade.
   * This keeps game2.js separate from game.js.
   */
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
        <button class="nx2-card" type="button" data-nx2-game="${game.id}">
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
    <div class="nx2-content" id="nx2-content"></div>
  `;

  document.body.appendChild(overlay);

  const content = overlay.querySelector('#nx2-content');
  const title = overlay.querySelector('#nx2-game-title');
  const backButton = overlay.querySelector('#nx2-back');
  const restartButton = overlay.querySelector('#nx2-restart');

  let currentGame = null;
  let cleanupGame = null;
  let animationFrame = 0;
  let timers = [];
  let gameToken = 0;

  function later(fn, delay) {
    const id = setTimeout(fn, delay);
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
        console.warn('Nexora Game 2 cleanup:', error);
      }
    }

    cleanupGame = null;
    content.innerHTML = '';
  }

  function status(message) {
    const element = content.querySelector('.nx2-status');
    if (element) element.textContent = message;
  }

  function shell(description) {
    content.innerHTML = `
      <div class="nx2-panel">
        <div class="nx2-status" aria-live="polite">${description || ''}</div>
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

  function button(label, onClick) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'nx2-btn';
    el.textContent = label;
    el.addEventListener('click', onClick);
    return el;
  }

  function openGame(id) {
    const game = GAMES.find(item => item.id === id);
    if (!game) return;

    clearGame();
    currentGame = id;
    title.textContent = game.icon + ' ' + game.name;
    overlay.classList.add('nx2-active');
    document.body.style.overflow = 'hidden';

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
  }

  function closeGame() {
    clearGame();
    currentGame = null;
    overlay.classList.remove('nx2-active');
    document.body.style.overflow = '';
  }

  backButton.addEventListener('click', closeGame);

  restartButton.addEventListener('click', () => {
    if (currentGame) openGame(currentGame);
  });

  launcher.addEventListener('click', event => {
    const card = event.target.closest('[data-nx2-game]');
    if (card) openGame(card.dataset.nx2Game);
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && overlay.classList.contains('nx2-active')) {
      closeGame();
    }
  });

  // ------------------------------------------------------------
  // 1. MEMORY MATCH
  // ------------------------------------------------------------

  function startMemory() {
    const ui = shell('Find matching pairs. Tap two cards.');

    const icons = ['🚀', '👾', '💎', '🐉', '⚡', '🌙', '🎯', '🪐'];
    let cards = [];
    let opened = [];
    let matched = 0;
    let moves = 0;
    let locked = false;

    const board = document.createElement('div');
    board.className = 'nx2-board';
    board.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
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
        el.textContent = card.open || card.matched ? card.icon : '?';

        if (card.matched) el.classList.add('nx2-safe');

        el.addEventListener('click', () => {
          if (locked || card.open || card.matched) return;

          card.open = true;
          opened.push(index);
          draw();

          if (opened.length === 2) {
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
                status('🏆 You matched every pair!');
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
          }
        });

        board.appendChild(el);
      });

      info.textContent = `Moves: ${moves} · Pairs: ${matched / 2}/${icons.length}`;
    }

    function reset() {
      cards = [...icons, ...icons]
        .sort(() => Math.random() - 0.5)
        .map(icon => ({ icon, open: false, matched: false }));

      opened = [];
      matched = 0;
      moves = 0;
      locked = false;
      status('Find all eight pairs.');
      draw();
    }

    ui.controls.appendChild(button('Shuffle cards', reset));
    ui.help.textContent = 'Remember where each symbol appears, then find its matching pair.';
    reset();
  }

  // ------------------------------------------------------------
  // 2. NEON RACING
  // ------------------------------------------------------------

  function startRacing() {
    const ui = shell('Dodge traffic and survive as long as possible.');

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 520;
    ui.area.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const keys = { left: false, right: false };
    let player, obstacles, score, speed, alive, last, spawn, touchX;

    const controls = [
      ['◀ LEFT', 'left'],
      ['RIGHT ▶', 'right']
    ];

    controls.forEach(([label, key]) => {
      const b = button(label, () => {
        if (!alive) return;
        if (key === 'left') player.x -= 35;
        else player.x += 35;
        player.x = Math.max(45, Math.min(315, player.x));
      });
      ui.controls.appendChild(b);
    });

    function reset() {
      player = { x: 180, y: 445, w: 30, h: 48 };
      obstacles = [];
      score = 0;
      speed = 3;
      alive = true;
      last = 0;
      spawn = 0;
      status('Score: 0');
      draw(0);
    }

    function draw(timestamp) {
      if (!alive) return;

      const dt = Math.min(32, timestamp - (last || timestamp));
      last = timestamp;
      spawn += dt;

      if (keys.left) player.x -= 4;
      if (keys.right) player.x += 4;
      player.x = Math.max(45, Math.min(315, player.x));

      if (spawn > Math.max(360, 900 - score * 8)) {
        spawn = 0;
        obstacles.push({
          x: 45 + Math.random() * 270,
          y: -55,
          w: 28,
          h: 43
        });
      }

      obstacles.forEach(o => {
        o.y += speed * dt / 16;
      });

      obstacles = obstacles.filter(o => o.y < 550);
      speed += .0005 * dt;
      score += dt / 100;

      ctx.clearRect(0, 0, 360, 520);
      ctx.fillStyle = '#07101f';
      ctx.fillRect(0, 0, 360, 520);

      ctx.fillStyle = '#17253b';
      ctx.fillRect(35, 0, 290, 520);

      ctx.strokeStyle = '#35e8ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([20, 18]);
      ctx.beginPath();
      ctx.moveTo(180, 0);
      ctx.lineTo(180, 520);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#43f5a5';
      ctx.fillRect(player.x - player.w / 2, player.y, player.w, player.h);

      ctx.fillStyle = '#ff5478';

      for (const o of obstacles) {
        ctx.fillRect(o.x - o.w / 2, o.y, o.w, o.h);

        const hit =
          Math.abs(player.x - o.x) < (player.w + o.w) / 2 &&
          player.y < o.y + o.h &&
          player.y + player.h > o.y;

        if (hit) {
          alive = false;
          status(`Crash! Final score: ${Math.floor(score)}. Restart to race again.`);
        }
      }

      if (alive) {
        status(`Score: ${Math.floor(score)} · Speed: ${speed.toFixed(1)}`);
        animationFrame = requestAnimationFrame(draw);
      }
    }

    function onKeyDown(e) {
      if (!overlay.classList.contains('nx2-active') || currentGame !== 'racing') return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.left = true;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.right = true;
    }

    function onKeyUp(e) {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') keys.left = false;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') keys.right = false;
    }

    function onTouch(e) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * canvas.width;
      player.x = Math.max(45, Math.min(315, x));
    }

    canvas.addEventListener('pointerdown', onTouch);
    canvas.addEventListener('pointermove', e => {
      if (e.buttons) onTouch(e);
    });

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    cleanupGame = () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };

    ui.controls.appendChild(button('Start again', reset));
    ui.help.textContent = 'Use the arrow keys, A/D keys, buttons, or drag your finger across the track.';
    reset();
  }

  // ------------------------------------------------------------
  // 3. TOWER STACK
  // ------------------------------------------------------------

  function startTower() {
    const ui = shell('Tap when the moving block lines up with the tower.');

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 450;
    ui.area.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let blocks, moving, score, direction, running, speed;

    function reset() {
      blocks = [{ x: 70, w: 220, y: 400 }];
      moving = { x: 0, w: 220, y: 365 };
      score = 0;
      direction = 1;
      running = true;
      speed = 2.5;
      draw();
      status('Blocks stacked: 0');
    }

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

      blocks.forEach((b, i) => {
        ctx.fillStyle = i % 2 ? '#9b6cff' : '#35e8ff';
        ctx.fillRect(b.x, b.y, b.w, 28);
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
        status(`Tower fell! Final height: ${score}. Restart to try again.`);
        draw();
        return;
      }

      blocks.push({ x: left, w: width, y: moving.y });
      score++;
      speed += .18;

      if (moving.y < 45) {
        blocks.forEach(b => b.y += 28);
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

    function start() {
      reset();
      animationFrame = requestAnimationFrame(tick);
    }

    canvas.addEventListener('pointerdown', drop);
    ui.controls.appendChild(button('DROP BLOCK', drop));
    ui.controls.appendChild(button('Restart tower', start));
    ui.help.textContent = 'Time each drop carefully. Each successful level makes the tower narrower and faster.';
    start();
  }

  // ------------------------------------------------------------
  // 4. MINEFIELD MYSTERY
  // ------------------------------------------------------------

  function startMine() {
    const ui = shell('Reveal safe tiles. Avoid the hidden mines.');

    let size = 6;
    let mineCount = 7;
    let mines, revealed, finished, safeCount;
    const board = document.createElement('div');
    board.className = 'nx2-board';
    board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
    ui.area.appendChild(board);

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
        status('💥 Mine found! Restart to play again.');
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

    ui.controls.appendChild(button('New minefield', reset));
    ui.help.textContent = 'Tap a tile to reveal it. Numbers show how many mines are touching that tile.';
    reset();
  }

  // ------------------------------------------------------------
  // 5. SLIDING PUZZLE
  // ------------------------------------------------------------

  function startPuzzle() {
    const ui = shell('Arrange the numbers in order. The empty space allows movement.');

    let tiles = [];
    let moves = 0;

    const board = document.createElement('div');
    board.className = 'nx2-board';
    board.style.gridTemplateColumns = 'repeat(4, minmax(0, 1fr))';
    ui.area.appendChild(board);

    function solved() {
      return tiles.slice(0, 15).every((n, i) => n === i + 1) && tiles[15] === 0;
    }

    function draw() {
      board.innerHTML = '';

      tiles.forEach((n, i) => {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'nx2-cell';
        cell.textContent = n || '';

        if (!n) {
          cell.style.visibility = 'hidden';
        }

        cell.addEventListener('click', () => move(i));
        board.appendChild(cell);
      });

      status(`Moves: ${moves}${solved() ? ' · Puzzle solved!' : ''}`);
    }

    function move(index) {
      const empty = tiles.indexOf(0);
      const row = Math.floor(index / 4);
      const col = index % 4;
      const erow = Math.floor(empty / 4);
      const ecol = empty % 4;

      if (Math.abs(row - erow) + Math.abs(col - ecol) !== 1) return;

      [tiles[index], tiles[empty]] = [tiles[empty], tiles[index]];
      moves++;
      draw();
    }

    function reset() {
      tiles = Array.from({ length: 16 }, (_, i) => (i + 1) % 16);
      moves = 0;

      // Make a solvable scramble by performing valid random moves.
      for (let i = 0; i < 180; i++) {
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

    ui.controls.appendChild(button('Shuffle puzzle', reset));
    ui.help.textContent = 'Tap a number next to the empty space to move it. Put 1–15 in order.';
    reset();
  }

  // ------------------------------------------------------------
  // 6. ALIEN INVASION
  // ------------------------------------------------------------

  function startAlien() {
    const ui = shell('Move your ship and shoot the invading aliens.');

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 480;
    ui.area.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let player, aliens, shots, score, alive, left, right, lastShot;

    function reset() {
      player = { x: 180, y: 430 };
      aliens = [];

      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 7; c++) {
          aliens.push({ x: 35 + c * 45, y: 45 + r * 35, alive: true });
        }
      }

      shots = [];
      score = 0;
      alive = true;
      left = false;
      right = false;
      lastShot = 0;
      status('Score: 0');
      animationFrame = requestAnimationFrame(tick);
    }

    function tick(time) {
      if (!alive) return;

      if (left) player.x -= 4;
      if (right) player.x += 4;
      player.x = Math.max(15, Math.min(345, player.x));

      if (time - lastShot > 320) {
        shots.push({ x: player.x, y: player.y - 15 });
        lastShot = time;
      }

      shots.forEach(s => s.y -= 6);
      shots = shots.filter(s => s.y > 0);

      aliens.forEach(a => {
        if (!a.alive) return;

        a.x += Math.sin(time / 500) * .7;

        shots.forEach(s => {
          if (Math.abs(s.x - a.x) < 15 && Math.abs(s.y - a.y) < 15) {
            a.alive = false;
            s.y = -100;
            score += 10;
          }
        });

        if (a.y > 395) alive = false;
      });

      ctx.fillStyle = '#07101f';
      ctx.fillRect(0, 0, 360, 480);

      ctx.fillStyle = '#43f5a5';
      ctx.beginPath();
      ctx.moveTo(player.x, player.y - 16);
      ctx.lineTo(player.x - 13, player.y + 12);
      ctx.lineTo(player.x + 13, player.y + 12);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ff6687';
      aliens.forEach(a => {
        if (!a.alive) return;
        ctx.fillRect(a.x - 10, a.y - 8, 20, 16);
      });

      ctx.fillStyle = '#35e8ff';
      shots.forEach(s => ctx.fillRect(s.x - 2, s.y, 4, 10));

      status(`Score: ${score} · Aliens remaining: ${aliens.filter(a => a.alive).length}`);

      if (aliens.every(a => !a.alive)) {
        alive = false;
        status(`🏆 Earth is safe! Final score: ${score}`);
      } else if (!alive) {
        status(`The aliens reached your ship! Score: ${score}. Restart to try again.`);
      } else {
        animationFrame = requestAnimationFrame(tick);
      }
    }

    function setPlayerFromPointer(e) {
      const rect = canvas.getBoundingClientRect();
      player.x = (e.clientX - rect.left) / rect.width * canvas.width;
      player.x = Math.max(15, Math.min(345, player.x));
    }

    canvas.addEventListener('pointerdown', setPlayerFromPointer);
    canvas.addEventListener('pointermove', e => {
      if (e.buttons) setPlayerFromPointer(e);
    });

    const leftBtn = button('◀ LEFT', () => {
      player.x = Math.max(15, player.x - 25);
    });

    const rightBtn = button('RIGHT ▶', () => {
      player.x = Math.min(345, player.x + 25);
    });

    ui.controls.append(leftBtn, rightBtn, button('FIRE', () => {
      if (alive) shots.push({ x: player.x, y: player.y - 15 });
    }));

    function onKeyDown(e) {
      if (currentGame !== 'alien') return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') left = true;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') right = true;
    }

    function onKeyUp(e) {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') left = false;
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') right = false;
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    cleanupGame = () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };

    ui.controls.appendChild(button('Restart invasion', reset));
    ui.help.textContent = 'Move with the arrow keys, A/D, the buttons, or by dragging on the game area.';
    reset();
  }

  // ------------------------------------------------------------
  // 7. TARGET MASTER
  // ------------------------------------------------------------

  function startTarget() {
    const ui = shell('Tap the targets before the timer runs out.');

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 420;
    ui.area.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let target, score, remaining, active, interval;

    function placeTarget() {
      target = {
        x: 25 + Math.random() * 310,
        y: 25 + Math.random() * 370,
        r: 12 + Math.random() * 9
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

      [target.r, target.r * .65, target.r * .3].forEach(r => {
        ctx.beginPath();
        ctx.arc(target.x, target.y, r, 0, Math.PI * 2);
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
      remaining = 30;
      active = true;
      placeTarget();
      draw();
      status('Score: 0 · Time: 30s');

      interval = setInterval(() => {
        remaining--;

        if (remaining <= 0) {
          active = false;
          clearInterval(interval);
          status(`Time's up! Your score: ${score}`);
          draw();
          return;
        }

        status(`Score: ${score} · Time: ${remaining}s`);
      }, 1000);
    }

    canvas.addEventListener('pointerdown', e => {
      if (!active) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width * canvas.width;
      const y = (e.clientY - rect.top) / rect.height * canvas.height;
      const distance = Math.hypot(x - target.x, y - target.y);

      if (distance <= target.r + 7) {
        score++;
        placeTarget();
        status(`Nice shot! Score: ${score} · Time: ${remaining}s`);
        draw();
      }
    });

    cleanupGame = () => clearInterval(interval);

    ui.controls.appendChild(button('Play again', reset));
    ui.help.textContent = 'You have 30 seconds. Tap the target circles to earn points.';
    reset();
  }

  // ------------------------------------------------------------
  // 8. WORD SCRAMBLE
  // ------------------------------------------------------------

  function startWord() {
    const ui = shell('Unscramble the letters to find the hidden word.');

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
      input.focus();
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

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') check();
    });

    ui.controls.append(
      button('Check answer', check),
      button('Skip word', nextWord)
    );

    ui.help.textContent = 'Each correct answer earns 10 points. Type your answer and press Enter or Check answer.';
    nextWord();
  }

  // ------------------------------------------------------------
  // 9. AIR HOCKEY
  // ------------------------------------------------------------

  function startHockey() {
    const ui = shell('Move your paddle to hit the puck into the computer goal.');

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 500;
    ui.area.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    let player, cpu, puck, playerScore, cpuScore, running, last;
    let pointerActive = false;

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

      const dt = Math.min(32, timestamp - (last || timestamp));
      last = timestamp;

      cpu.x += Math.sign(puck.x - cpu.x) * Math.min(2.1, dt * .08);
      cpu.x = Math.max(cpu.r, Math.min(360 - cpu.r, cpu.x));

      puck.x += puck.vx * dt / 16;
      puck.y += puck.vy * dt / 16;

      if (puck.x < puck.r || puck.x > 360 - puck.r) puck.vx *= -1;

      function collide(paddle) {
        const dx = puck.x - paddle.x;
        const dy = puck.y - paddle.y;
        const distance = Math.hypot(dx, dy);

        if (distance < puck.r + paddle.r && distance > 0) {
          const nx = dx / distance;
          const ny = dy / distance;
          puck.x = paddle.x + nx * (puck.r + paddle.r);
          puck.y = paddle.y + ny * (puck.r + paddle.r);
          puck.vx = nx * 4;
          puck.vy = ny * 4;
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
        status(playerScore >= 5 ? '🏆 You won the match!' : 'Computer won. Try again!');
        return;
      }

      animationFrame = requestAnimationFrame(tick);
    }

    function movePlayer(e) {
      const rect = canvas.getBoundingClientRect();
      player.x = (e.clientX - rect.left) / rect.width * canvas.width;
      player.y = (e.clientY - rect.top) / rect.height * canvas.height;
      player.x = Math.max(player.r, Math.min(360 - player.r, player.x));
      player.y = Math.max(275, Math.min(500 - player.r, player.y));
    }

    canvas.addEventListener('pointerdown', e => {
      pointerActive = true;
      movePlayer(e);
    });

    canvas.addEventListener('pointermove', e => {
      if (pointerActive) movePlayer(e);
    });

    canvas.addEventListener('pointerup', () => {
      pointerActive = false;
    });

    canvas.addEventListener('pointercancel', () => {
      pointerActive = false;
    });

    ui.controls.appendChild(button('Restart match', reset));
    ui.help.textContent = 'Drag your finger in the lower half of the rink to move your paddle. First to five goals wins.';
    reset();
  }

  // ------------------------------------------------------------
  // 10. NEON MAZE
  // ------------------------------------------------------------

  function startMaze() {
    const ui = shell('Reach the green exit. Use the arrow buttons to move.');

    const size = 9;
    const maze = [
      '111111111',
      '100000001',
      '101110101',
      '100010001',
      '111010101',
      '100000101',
      '101110101',
      '100000001',
      '111111111'
    ];

    let player = { x: 1, y: 1 };
    const exit = { x: 7, y: 7 };

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 360;
    ui.area.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    function draw() {
      const cell = 40;

      ctx.fillStyle = '#07101f';
      ctx.fillRect(0, 0, 360, 360);

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          ctx.fillStyle = maze[y][x] === '1' ? '#1b2c45' : '#091524';
          ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);

          if (x === exit.x && y === exit.y) {
            ctx.fillStyle = '#43f5a5';
            ctx.fillRect(x * cell + 6, y * cell + 6, cell - 13, cell - 13);
          }
        }
      }

      ctx.fillStyle = '#35e8ff';
      ctx.beginPath();
      ctx.arc(player.x * cell + cell / 2, player.y * cell + cell / 2, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    function move(dx, dy) {
      const x = player.x + dx;
      const y = player.y + dy;

      if (x < 0 || y < 0 || x >= size || y >= size) return;
      if (maze[y][x] === '1') return;

      player = { x, y };
      draw();

      if (player.x === exit.x && player.y === exit.y) {
        status('🏆 You escaped the maze!');
      } else {
        status('Find the green exit.');
      }
    }

    ui.controls.append(
      button('▲', () => move(0, -1)),
      button('◀', () => move(-1, 0)),
      button('▼', () => move(0, 1)),
      button('▶', () => move(1, 0))
    );

    function onKeyDown(e) {
      if (currentGame !== 'maze') return;

      const map = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0]
      };

      if (map[e.key]) {
        e.preventDefault();
        move(...map[e.key]);
      }
    }

    window.addEventListener('keydown', onKeyDown);

    cleanupGame = () => {
      window.removeEventListener('keydown', onKeyDown);
    };

    ui.controls.appendChild(button('Restart maze', () => {
      player = { x: 1, y: 1 };
      status('Find the green exit.');
      draw();
    }));

    ui.help.textContent = 'Use the arrow keys or touch controls to move through the maze without crossing walls.';
    draw();
  }

})();