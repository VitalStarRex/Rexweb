/* =========================================================
   REXWEB NEXORA — 20-GAME ARCADE
   COMPLETE SELF-CONTAINED GAME.JS
   ========================================================= */

(() => {
  "use strict";

  const ROOT_ID = "nexora-games";
  const SAVE_KEY = "rexweb_nexora_arcade_v1";

  const games = Object.create(null);
  let root;
  let currentGame = null;
  let cleanupCurrent = () => {};
  let gameToken = 0;

  const state = {
    scores: {},
    recent: [],
    sound: false
  };

  /* roundRect fallback for older browsers */
  if (
    typeof CanvasRenderingContext2D !== "undefined" &&
    !CanvasRenderingContext2D.prototype.roundRect
  ) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      r = Math.max(0, Math.min(typeof r === "number" ? r : 0, w / 2, h / 2));
      this.moveTo(x + r, y);
      this.arcTo(x + w, y, x + w, y + h, r);
      this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r);
      this.arcTo(x, y, x + w, y, r);
      this.closePath();
    };
  }

  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "{}");
    if (saved && typeof saved === "object") {
      state.scores = saved.scores || {};
      state.recent = Array.isArray(saved.recent) ? saved.recent : [];
      state.sound = !!saved.sound;
    }
  } catch (_) {}

  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function shuffle(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
      const j = randomInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function recordScore(id, score) {
    score = Math.max(0, Math.floor(Number(score) || 0));
    const previous = Number(state.scores[id]) || 0;

    if (score > previous) {
      state.scores[id] = score;
      save();
      return true;
    }

    return false;
  }

  function getBest(id) {
    return Number(state.scores[id]) || 0;
  }

  function register(id, title, description, icon, category, start) {
    games[id] = { id, title, description, icon, category, start };
  }

  /* ---------------------- STYLES ---------------------- */

  const style = document.createElement("style");
  style.textContent = `
    #${ROOT_ID} {
      --nx-bg: #050914;
      --nx-panel: #0c1427;
      --nx-panel2: #111d35;
      --nx-blue: #37b6ff;
      --nx-purple: #a78bfa;
      --nx-text: #f4f7ff;
      --nx-muted: #9eabc5;
      color: var(--nx-text);
      background: var(--nx-bg);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      min-height: 100vh;
      padding: 16px;
      box-sizing: border-box;
      isolation: isolate;
    }

    #${ROOT_ID} *,
    #${ROOT_ID} *::before,
    #${ROOT_ID} *::after {
      box-sizing: border-box;
    }

    #${ROOT_ID} button,
    #${ROOT_ID} input,
    #${ROOT_ID} select {
      font: inherit;
    }

    #${ROOT_ID} button {
      cursor: pointer;
      touch-action: manipulation;
    }

    #${ROOT_ID} .nx-wrap {
      max-width: 1100px;
      margin: 0 auto;
    }

    #${ROOT_ID} .nx-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 22px;
    }

    #${ROOT_ID} .nx-brand {
      font-size: clamp(23px, 5vw, 35px);
      font-weight: 900;
      letter-spacing: -1px;
      margin: 0;
      background: linear-gradient(100deg, #fff, #65caff, #b5a0ff);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    #${ROOT_ID} .nx-tagline {
      color: var(--nx-muted);
      margin: 4px 0 0;
      font-size: 13px;
    }

    #${ROOT_ID} .nx-panel {
      background: linear-gradient(145deg, var(--nx-panel), #080e1d);
      border: 1px solid #233451;
      border-radius: 20px;
      padding: 18px;
      box-shadow: 0 12px 40px #0004;
    }

    #${ROOT_ID} .nx-hero {
      padding: clamp(20px, 5vw, 36px);
      margin-bottom: 20px;
      background:
        radial-gradient(ellipse at top right, #17457966, transparent 55%),
        linear-gradient(140deg, #101c34, #080d1a);
    }

    #${ROOT_ID} .nx-hero h2 {
      font-size: clamp(25px, 6vw, 42px);
      margin: 0 0 8px;
      line-height: 1.12;
    }

    #${ROOT_ID} .nx-hero p {
      color: var(--nx-muted);
      line-height: 1.6;
      margin: 0;
    }

    #${ROOT_ID} .nx-search {
      width: 100%;
      padding: 13px 15px;
      background: #080f20;
      color: white;
      border: 1px solid #2b3c5b;
      border-radius: 12px;
      outline: none;
      margin: 0 0 15px;
    }

    #${ROOT_ID} .nx-search:focus {
      border-color: var(--nx-blue);
      box-shadow: 0 0 0 3px #37b6ff20;
    }

    #${ROOT_ID} .nx-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
      gap: 13px;
    }

    #${ROOT_ID} .nx-card {
      border: 1px solid #22314c;
      border-radius: 16px;
      background: linear-gradient(145deg, #111c31, #0a1120);
      padding: 17px;
      transition: transform .18s ease, border-color .18s ease;
    }

    #${ROOT_ID} .nx-card:hover {
      transform: translateY(-3px);
      border-color: #398fd1;
    }

    #${ROOT_ID} .nx-icon {
      font-size: 34px;
      margin-bottom: 9px;
    }

    #${ROOT_ID} .nx-card h3 {
      margin: 0 0 7px;
      font-size: 17px;
    }

    #${ROOT_ID} .nx-card p {
      color: var(--nx-muted);
      font-size: 13px;
      line-height: 1.5;
      min-height: 39px;
      margin: 0 0 12px;
    }

    #${ROOT_ID} .nx-best {
      font-size: 12px;
      color: #82d6ff;
      margin-bottom: 12px;
    }

    #${ROOT_ID} .nx-btn {
      background: linear-gradient(100deg, #138ee5, #6555dd);
      color: white;
      border: 0;
      border-radius: 11px;
      padding: 11px 15px;
      font-weight: 800;
      min-height: 42px;
    }

    #${ROOT_ID} .nx-btn:hover {
      filter: brightness(1.13);
    }

    #${ROOT_ID} .nx-btn:focus-visible {
      outline: 3px solid #8fdcff;
      outline-offset: 3px;
    }

    #${ROOT_ID} .nx-btn-secondary {
      background: #17243c;
      border: 1px solid #344765;
    }

    #${ROOT_ID} .nx-btn-danger {
      background: #6f2437;
      border: 1px solid #a33d55;
    }

    #${ROOT_ID} .nx-hold {
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
      min-width: 90px;
      min-height: 52px;
    }

    #${ROOT_ID} .nx-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 9px;
      margin: 12px 0;
    }

    #${ROOT_ID} .nx-pad-row {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      margin: 12px auto;
    }

    #${ROOT_ID} .nx-pad-row button {
      min-width: 62px;
      min-height: 50px;
      font-size: 19px;
    }

    #${ROOT_ID} .nx-game-title {
      font-size: clamp(23px, 5vw, 34px);
      margin: 0 0 5px;
    }

    #${ROOT_ID} .nx-muted {
      color: var(--nx-muted);
    }

    #${ROOT_ID} .nx-status {
      padding: 12px;
      background: #101c31;
      border: 1px solid #263a5a;
      border-radius: 12px;
      margin: 12px 0;
      line-height: 1.5;
    }

    #${ROOT_ID} .nx-canvas-wrap {
      width: 100%;
      max-width: 700px;
      margin: 12px auto;
      position: relative;
    }

    #${ROOT_ID} canvas {
      display: block;
      width: 100%;
      height: auto;
      background: #060b16;
      border: 1px solid #263a5a;
      border-radius: 13px;
      touch-action: none;
    }

    #${ROOT_ID} .nx-board {
      display: grid;
      gap: 7px;
      max-width: 440px;
      margin: 16px auto;
    }

    #${ROOT_ID} .nx-cell {
      aspect-ratio: 1;
      display: grid;
      place-items: center;
      border-radius: 9px;
      background: #17243c;
      border: 1px solid #344765;
      color: white;
      font-size: clamp(18px, 5vw, 30px);
      font-weight: 800;
      min-width: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
    }

    #${ROOT_ID} .nx-cell:disabled {
      cursor: default;
      opacity: 1;
    }

    #${ROOT_ID} .nx-cell.nx-selected {
      background: #17518b;
      border-color: #66caff;
    }

    #${ROOT_ID} .nx-cell.nx-matched {
      background: #124b3d;
      border-color: #31d6a0;
    }

    #${ROOT_ID} .nx-cell.nx-x {
      color: #67caff;
    }

    #${ROOT_ID} .nx-cell.nx-o {
      color: #c3a5ff;
    }

    #${ROOT_ID} .nx-controls {
      display: grid;
      grid-template-columns: repeat(3, minmax(55px, 78px));
      justify-content: center;
      gap: 8px;
      margin: 14px auto;
    }

    #${ROOT_ID} .nx-controls button {
      min-height: 48px;
      border-radius: 12px;
      border: 1px solid #344765;
      background: #17243c;
      color: white;
      font-size: 20px;
      touch-action: manipulation;
    }

    #${ROOT_ID} .nx-controls .nx-up {
      grid-column: 2;
    }

    #${ROOT_ID} .nx-controls .nx-left {
      grid-column: 1;
    }

    #${ROOT_ID} .nx-controls .nx-down {
      grid-column: 2;
    }

    #${ROOT_ID} .nx-controls .nx-right {
      grid-column: 3;
    }

    #${ROOT_ID} .nx-small {
      font-size: 12px;
      color: var(--nx-muted);
    }

    @media (max-width: 480px) {
      #${ROOT_ID} {
        padding: 10px;
      }

      #${ROOT_ID} .nx-panel {
        padding: 13px;
        border-radius: 15px;
      }

      #${ROOT_ID} .nx-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      #${ROOT_ID} .nx-card {
        padding: 12px;
      }

      #${ROOT_ID} .nx-card p {
        min-height: 55px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #${ROOT_ID} *,
      #${ROOT_ID} *::before,
      #${ROOT_ID} *::after {
        animation-duration: .01ms !important;
        transition-duration: .01ms !important;
        scroll-behavior: auto !important;
      }
    }
  `;
  document.head.appendChild(style);

  /* ---------------------- GAME HUB ---------------------- */

  function shell(title, description) {
    root.innerHTML = `
      <div class="nx-wrap">
        <div class="nx-header">
          <div>
            <h1 class="nx-brand">REXWEB NEXORA</h1>
            <p class="nx-tagline">PLAY. CREATE. TRADE. GROW.</p>
          </div>
          <button class="nx-btn nx-btn-secondary" id="nxBack">← All Games</button>
        </div>

        <section class="nx-panel">
          <h2 class="nx-game-title">${escapeHTML(title)}</h2>
          <p class="nx-muted">${escapeHTML(description)}</p>
          <div class="nx-actions" id="nxActions"></div>
          <div id="nxStatus" class="nx-status" aria-live="polite">Ready to play.</div>
          <div id="nxPlayArea"></div>
        </section>
      </div>
    `;

    root.querySelector("#nxBack").addEventListener("click", showHub);
  }

  function status(message) {
    const element = root.querySelector("#nxStatus");
    if (element) element.textContent = message;
  }

  function actions(items) {
    const element = root.querySelector("#nxActions");
    if (!element) return;

    element.innerHTML = "";

    items.forEach(item => {
      const btn = document.createElement("button");
      btn.className = "nx-btn " + (item.secondary ? "nx-btn-secondary" : "");
      btn.textContent = item.label;
      btn.addEventListener("click", item.onClick);
      element.appendChild(btn);
    });
  }

  function area() {
    return root.querySelector("#nxPlayArea");
  }

  function button(label, onClick, secondary = false) {
    const element = document.createElement("button");
    element.className = "nx-btn" + (secondary ? " nx-btn-secondary" : "");
    element.textContent = label;
    element.addEventListener("click", onClick);
    return element;
  }

  /* A button that stays "pressed" while a finger or mouse is held on it */
  function holdButton(label, onDown, onUp) {
    const element = document.createElement("button");
    element.className = "nx-btn nx-btn-secondary nx-hold";
    element.textContent = label;
    element.addEventListener("pointerdown", event => {
      event.preventDefault();
      onDown();
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach(type => {
      element.addEventListener(type, () => onUp());
    });
    element.addEventListener("contextmenu", event => event.preventDefault());
    return element;
  }

  function padRow(playArea, buttons) {
    const row = document.createElement("div");
    row.className = "nx-pad-row";
    buttons.forEach(item => row.appendChild(item));
    playArea.appendChild(row);
    return row;
  }

  function smallButton(label, onClick, aria) {
    const element = button(label, onClick, true);
    if (aria) element.setAttribute("aria-label", aria);
    return element;
  }

  function dpad(playArea, onMove) {
    const controls = document.createElement("div");
    controls.className = "nx-controls";

    [
      ["↑", "nx-up", 0, -1],
      ["←", "nx-left", -1, 0],
      ["↓", "nx-down", 0, 1],
      ["→", "nx-right", 1, 0]
    ].forEach(([label, className, x, y]) => {
      const control = document.createElement("button");
      control.className = className;
      control.textContent = label;
      control.setAttribute("aria-label", "Move " + label);
      control.addEventListener("click", () => onMove(x, y));
      controls.appendChild(control);
    });

    playArea.appendChild(controls);
    return controls;
  }

  function makeCanvas(playArea, w, h, label, maxWidth) {
    const wrap = document.createElement("div");
    wrap.className = "nx-canvas-wrap";
    if (maxWidth) wrap.style.maxWidth = maxWidth + "px";

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.setAttribute("aria-label", label);
    wrap.appendChild(canvas);
    playArea.appendChild(wrap);

    return { canvas, ctx: canvas.getContext("2d"), wrap };
  }

  /* Shared animation loop for the newer canvas games */
  function makeLoop(token, update, draw, maxDt) {
    let id = 0;
    let last = 0;
    let running = true;
    let stopped = false;
    const limit = maxDt || 0.03;

    function frame(time) {
      if (stopped || !isActive(token)) return;
      if (!last) last = time;
      const dt = Math.min((time - last) / 1000, limit);
      last = time;
      if (running) update(dt);
      draw();
      id = requestAnimationFrame(frame);
    }

    return {
      start() {
        cancelAnimationFrame(id);
        last = 0;
        stopped = false;
        id = requestAnimationFrame(frame);
      },
      stop() {
        stopped = true;
        cancelAnimationFrame(id);
      },
      setRunning(value) {
        running = !!value;
        last = 0;
      },
      toggle() {
        running = !running;
        last = 0;
        return running;
      },
      get running() {
        return running;
      }
    };
  }

  function showHub() {
    gameToken++;
    cleanupCurrent();
    cleanupCurrent = () => {};
    currentGame = null;

    const total = Object.keys(games).length;

    root.innerHTML = `
      <div class="nx-wrap">
        <header class="nx-header">
          <div>
            <h1 class="nx-brand">REXWEB NEXORA</h1>
            <p class="nx-tagline">PLAY. CREATE. TRADE. GROW.</p>
          </div>
          <div class="nx-small">${total} GAMES • FREE TO PLAY</div>
        </header>

        <section class="nx-panel nx-hero">
          <h2>Your next high score starts here.</h2>
          <p>${total} arcade games. One destination. Choose a game and beat your personal best.</p>
        </section>

        <input
          class="nx-search"
          id="nxSearch"
          type="search"
          placeholder="Search games..."
          aria-label="Search games"
        >

        <div class="nx-grid" id="nxGameGrid"></div>

        <p class="nx-small" style="text-align:center;margin:22px 0 8px">
          RexWeb Nexora Arcade • High scores are saved on this device.
        </p>
      </div>
    `;

    const search = root.querySelector("#nxSearch");
    search.addEventListener("input", renderCards);
    renderCards();

    try { window.scrollTo(0, 0); } catch (_) {}
  }

  function renderCards() {
    const grid = root.querySelector("#nxGameGrid");
    if (!grid) return;

    const query = root.querySelector("#nxSearch").value.trim().toLowerCase();

    const list = Object.values(games).filter(game =>
      (game.title + " " + game.description + " " + game.category)
        .toLowerCase()
        .includes(query)
    );

    grid.innerHTML = "";

    if (!list.length) {
      grid.innerHTML = `<div class="nx-panel">No games found. Try another search.</div>`;
      return;
    }

    list.forEach(game => {
      const card = document.createElement("article");
      card.className = "nx-card";

      card.innerHTML = `
        <div class="nx-icon">${game.icon}</div>
        <h3>${escapeHTML(game.title)}</h3>
        <p>${escapeHTML(game.description)}</p>
        <div class="nx-best">Personal best: ${getBest(game.id)}</div>
      `;

      card.appendChild(button("Play Now →", () => openGame(game.id)));
      grid.appendChild(card);
    });
  }

  function openGame(id) {
    const game = games[id];
    if (!game) return;

    gameToken++;
    const token = gameToken;

    cleanupCurrent();
    cleanupCurrent = () => {};
    currentGame = id;

    state.recent = [id, ...state.recent.filter(item => item !== id)].slice(0, 10);
    save();

    try { window.scrollTo(0, 0); } catch (_) {}

    try {
      cleanupCurrent = game.start(token) || (() => {});
    } catch (error) {
      console.error("Game failed to start:", id, error);
      shell("Game Error", "This game could not start.");
      status("Sorry, this game encountered an error. Return to the menu and try again.");
    }
  }

  function isActive(token) {
    return token === gameToken && currentGame !== null;
  }

  /* ====================== GAME: SNAKE ====================== */

  register(
    "snake",
    "Snake",
    "Eat food, grow longer, and avoid hitting yourself or the walls.",
    "🐍",
    "Arcade",
    startSnake
  );

  function startSnake(token) {
    shell("Snake", "Use the arrow buttons, WASD, or keyboard arrows to steer.");
    const playArea = area();

    const canvas = document.createElement("canvas");
    canvas.width = 480;
    canvas.height = 480;
    canvas.setAttribute("aria-label", "Snake game board");
    playArea.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const cell = 24;
    const count = canvas.width / cell;

    let snake;
    let food;
    let direction;
    let nextDirection;
    let score;
    let running;
    let ended;
    let timer = null;

    function newFood() {
      let candidate;
      do {
        candidate = {
          x: randomInt(0, count - 1),
          y: randomInt(0, count - 1)
        };
      } while (snake.some(part =>
        part.x === candidate.x && part.y === candidate.y
      ));

      food = candidate;
    }

    function reset() {
      clearInterval(timer);
      snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];

      direction = { x: 1, y: 0 };
      nextDirection = { x: 1, y: 0 };
      score = 0;
      running = true;
      ended = false;

      newFood();
      status("Score: 0 • Eat the glowing food!");
      draw();
      timer = setInterval(step, 125);
    }

    function changeDirection(x, y) {
      if (!running || ended) return;
      if (x === -direction.x && y === -direction.y) return;
      nextDirection = { x, y };
    }

    function step() {
      if (!isActive(token) || !running || ended) return;

      direction = nextDirection;

      const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
      };

      const eating = head.x === food.x && head.y === food.y;
      const collisionBody = eating ? snake : snake.slice(0, -1);

      if (
        head.x < 0 || head.y < 0 ||
        head.x >= count || head.y >= count ||
        collisionBody.some(part => part.x === head.x && part.y === head.y)
      ) {
        ended = true;
        running = false;
        clearInterval(timer);
        recordScore("snake", score);
        status(`Game over! Score: ${score}. Best: ${getBest("snake")}. Press Restart to play again.`);
        draw();
        return;
      }

      snake.unshift(head);

      if (eating) {
        score += 10;
        newFood();
        status(`Score: ${score} • Best: ${Math.max(score, getBest("snake"))}`);
      } else {
        snake.pop();
      }

      draw();
    }

    function draw() {
      ctx.fillStyle = "#060b16";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#13213a";
      ctx.lineWidth = 1;

      for (let i = 0; i <= count; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cell, 0);
        ctx.lineTo(i * cell, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * cell);
        ctx.lineTo(canvas.width, i * cell);
        ctx.stroke();
      }

      if (food) {
        ctx.fillStyle = "#ff5d86";
        ctx.beginPath();
        ctx.arc(
          food.x * cell + cell / 2,
          food.y * cell + cell / 2,
          cell * 0.38,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? "#83f7d4" : "#28b99b";
        ctx.beginPath();
        ctx.roundRect(
          part.x * cell + 2,
          part.y * cell + 2,
          cell - 4,
          cell - 4,
          6
        );
        ctx.fill();
      });
    }

    function keyHandler(event) {
      const keys = {
        ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
        ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
        ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
        ArrowRight: [1, 0], d: [1, 0], D: [1, 0]
      };

      if (keys[event.key]) {
        event.preventDefault();
        changeDirection(...keys[event.key]);
      }
    }

    document.addEventListener("keydown", keyHandler);

    dpad(playArea, changeDirection);

    actions([
      { label: "Restart", onClick: reset },
      {
        label: "Pause / Resume",
        secondary: true,
        onClick: () => {
          if (ended) return;
          running = !running;
          if (running) {
            timer = setInterval(step, 125);
            status(`Resumed • Score: ${score}`);
          } else {
            clearInterval(timer);
            status(`Paused • Score: ${score}`);
          }
        }
      }
    ]);

    reset();

    return () => {
      clearInterval(timer);
      document.removeEventListener("keydown", keyHandler);
    };
  }

  /* ================== GAME: TIC-TAC-TOE ================== */

  register(
    "tictactoe",
    "Tic-Tac-Toe",
    "Play X against the computer or challenge another player on your device.",
    "❌",
    "Board",
    startTicTacToe
  );

  function startTicTacToe(token) {
    shell("Tic-Tac-Toe", "Get three symbols in a row, column, or diagonal.");
    const playArea = area();

    let boardState;
    let turn;
    let ended;
    let mode = "computer";
    const pendingTimers = new Set();

    const modeLabel = document.createElement("div");
    modeLabel.className = "nx-status";
    modeLabel.textContent = "Mode: Play against the computer";
    playArea.appendChild(modeLabel);

    const board = document.createElement("div");
    board.className = "nx-board";
    board.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
    board.style.maxWidth = "330px";
    playArea.appendChild(board);

    function winner(cells) {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
      ];

      for (const [a, b, c] of lines) {
        if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
          return cells[a];
        }
      }
      return cells.every(Boolean) ? "draw" : null;
    }

    function paint() {
      board.innerHTML = "";

      boardState.forEach((value, index) => {
        const cellButton = document.createElement("button");
        cellButton.className = "nx-cell";
        cellButton.textContent = value || "";
        cellButton.disabled = !!value || ended;
        cellButton.setAttribute(
          "aria-label",
          value ? `Square ${index + 1}: ${value}` : `Empty square ${index + 1}`
        );

        if (value === "X") cellButton.classList.add("nx-x");
        if (value === "O") cellButton.classList.add("nx-o");

        cellButton.addEventListener("click", () => playMove(index));
        board.appendChild(cellButton);
      });
    }

    function clearTimers() {
      pendingTimers.forEach(clearTimeout);
      pendingTimers.clear();
    }

    function reset() {
      clearTimers();
      boardState = Array(9).fill("");
      turn = "X";
      ended = false;

      status(mode === "computer"
        ? "You are X. The computer is O."
        : "Two-player mode. X goes first.");

      paint();
    }

    function finishIfNeeded() {
      const result = winner(boardState);
      if (!result) return false;

      ended = true;
      paint();

      if (result === "draw") {
        status("It's a draw! Restart for another round.");
      } else {
        status(result === "X" ? "X wins!" : "O wins!");
        if (result === "X" && mode === "computer") {
          recordScore("tictactoe", getBest("tictactoe") + 1);
        }
      }

      return true;
    }

    function playMove(index) {
      if (ended || boardState[index] || !isActive(token)) return;
      if (mode === "computer" && turn === "O") return;

      boardState[index] = turn;
      if (finishIfNeeded()) return;

      if (mode === "two") {
        turn = turn === "X" ? "O" : "X";
        status(`${turn}'s turn.`);
        paint();
        return;
      }

      turn = "O";
      status("Computer is thinking...");
      paint();

      const timer = setTimeout(() => {
        pendingTimers.delete(timer);
        if (!isActive(token) || ended) return;

        const selected = chooseComputerMove(boardState);
        if (selected < 0) return;

        boardState[selected] = "O";

        if (!finishIfNeeded()) {
          turn = "X";
          status("Your turn. You are X.");
          paint();
        }
      }, 280);

      pendingTimers.add(timer);
    }

    function chooseComputerMove(cells) {
      for (let i = 0; i < 9; i++) {
        if (!cells[i]) {
          cells[i] = "O";
          const result = winner(cells);
          cells[i] = "";
          if (result === "O") return i;
        }
      }

      for (let i = 0; i < 9; i++) {
        if (!cells[i]) {
          cells[i] = "X";
          const result = winner(cells);
          cells[i] = "";
          if (result === "X") return i;
        }
      }

      if (!cells[4]) return 4;

      const corners = shuffle([0, 2, 6, 8]).filter(i => !cells[i]);
      if (corners.length) return corners[0];

      const sides = [1, 3, 5, 7].filter(i => !cells[i]);
      if (sides.length) return sides[0];

      return cells.findIndex(value => !value);
    }

    function renderActions() {
      actions([
        { label: "Restart", onClick: reset },
        {
          label: mode === "computer" ? "Switch to Two Players" : "Play Against Computer",
          secondary: true,
          onClick: () => {
            mode = mode === "computer" ? "two" : "computer";
            modeLabel.textContent = mode === "computer"
              ? "Mode: Play against the computer"
              : "Mode: Two players on one device";
            renderActions();
            reset();
          }
        }
      ]);
    }

    renderActions();
    reset();

    return () => clearTimers();
  }

  /* ======================== GAME: PONG ======================== */

  register(
    "pong",
    "Pong",
    "Beat the computer by bouncing the ball past its paddle.",
    "🏓",
    "Arcade",
    startPong
  );

  function startPong(token) {
    shell("Pong", "Move your paddle with the mouse, touch, or arrow keys.");

    const playArea = area();
    const wrap = document.createElement("div");
    wrap.className = "nx-canvas-wrap";

    const canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 420;
    canvas.setAttribute("aria-label", "Pong game");
    wrap.appendChild(canvas);
    playArea.appendChild(wrap);

    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const paddleH = 82;
    const paddleW = 12;

    let playerY, cpuY, ballX, ballY, ballVX, ballVY, playerScore, cpuScore;
    let running = false;
    let ended = false;
    let animation = 0;
    let lastTime = 0;
    let up = false;
    let down = false;
    let targetY = null;

    function resetBall(direction) {
      ballX = W / 2;
      ballY = H / 2;
      const speed = 270;
      ballVX = speed * direction;
      ballVY = randomInt(-150, 150);
    }

    function reset() {
      cancelAnimationFrame(animation);
      playerY = H / 2 - paddleH / 2;
      cpuY = H / 2 - paddleH / 2;
      playerScore = 0;
      cpuScore = 0;
      running = true;
      ended = false;
      lastTime = 0;
      targetY = null;
      resetBall(Math.random() < 0.5 ? -1 : 1);
      status("First to 5 points wins. Good luck!");
      draw();
      animation = requestAnimationFrame(frame);
    }

    function draw() {
      ctx.fillStyle = "#060b16";
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "#273955";
      ctx.setLineDash([8, 10]);
      ctx.beginPath();
      ctx.moveTo(W / 2, 0);
      ctx.lineTo(W / 2, H);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = "#67caff";
      ctx.fillRect(22, playerY, paddleW, paddleH);

      ctx.fillStyle = "#c4a5ff";
      ctx.fillRect(W - 22 - paddleW, cpuY, paddleW, paddleH);

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ballX, ballY, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 36px system-ui";
      ctx.textAlign = "center";
      ctx.fillStyle = "#67caff";
      ctx.fillText(playerScore, W * 0.35, 52);

      ctx.fillStyle = "#c4a5ff";
      ctx.fillText(cpuScore, W * 0.65, 52);

      if (!running && !ended) {
        ctx.fillStyle = "#ffffff";
        ctx.font = "18px system-ui";
        ctx.fillText("Paused", W / 2, H / 2);
      }
    }

    function frame(time) {
      if (!isActive(token) || ended) return;
      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.03);
      lastTime = time;

      if (running) update(dt);
      draw();
      animation = requestAnimationFrame(frame);
    }

    function update(dt) {
      if (up) playerY -= 360 * dt;
      if (down) playerY += 360 * dt;

      if (targetY !== null) {
        const center = playerY + paddleH / 2;
        playerY += Math.max(-360 * dt, Math.min(360 * dt, targetY - center));
      }

      playerY = Math.max(0, Math.min(H - paddleH, playerY));

      const cpuCenter = cpuY + paddleH / 2;
      const cpuSpeed = 265;
      const difference = ballY - cpuCenter;

      cpuY += Math.max(-cpuSpeed * dt, Math.min(cpuSpeed * dt, difference));
      cpuY = Math.max(0, Math.min(H - paddleH, cpuY));

      ballX += ballVX * dt;
      ballY += ballVY * dt;

      if (ballY < 9 || ballY > H - 9) {
        ballVY *= -1;
        ballY = Math.max(9, Math.min(H - 9, ballY));
      }

      if (
        ballVX < 0 &&
        ballX - 9 <= 34 &&
        ballX > 22 &&
        ballY >= playerY &&
        ballY <= playerY + paddleH
      ) {
        ballX = 35;
        ballVX = Math.abs(ballVX) * 1.045;
        const offset = (ballY - (playerY + paddleH / 2)) / (paddleH / 2);
        ballVY = offset * 320;
      }

      if (
        ballVX > 0 &&
        ballX + 9 >= W - 34 &&
        ballX < W - 22 &&
        ballY >= cpuY &&
        ballY <= cpuY + paddleH
      ) {
        ballX = W - 35;
        ballVX = -Math.abs(ballVX) * 1.045;
        const offset = (ballY - (cpuY + paddleH / 2)) / (paddleH / 2);
        ballVY = offset * 300;
      }

      if (ballX < -15) {
        cpuScore++;
        pointScored(-1);
      } else if (ballX > W + 15) {
        playerScore++;
        pointScored(1);
      }
    }

    function pointScored(direction) {
      if (playerScore >= 5 || cpuScore >= 5) {
        ended = true;
        running = false;
        const won = playerScore >= 5;
        if (won) recordScore("pong", playerScore);
        status(won ? `You win ${playerScore}–${cpuScore}!` : `Computer wins ${cpuScore}–${playerScore}. Try again!`);
        return;
      }
      status(`You ${playerScore} — ${cpuScore} Computer`);
      resetBall(direction);
    }

    function moveFromPointer(event) {
      const rect = canvas.getBoundingClientRect();
      const scaleY = H / rect.height;
      targetY = (event.clientY - rect.top) * scaleY;
      targetY = Math.max(0, Math.min(H, targetY));
    }

    function isUpKey(key) { return key === "ArrowUp" || key === "w" || key === "W"; }
    function isDownKey(key) { return key === "ArrowDown" || key === "s" || key === "S"; }

    function keyHandler(event) {
      if (isUpKey(event.key) || isDownKey(event.key) || event.key === " ") {
        event.preventDefault();
      }
      if (isUpKey(event.key)) { up = true; targetY = null; }
      if (isDownKey(event.key)) { down = true; targetY = null; }

      if (event.key === " " && !ended && !event.repeat) {
        running = !running;
        lastTime = 0;
        status(running ? "Game resumed." : "Game paused.");
      }
    }

    function keyUp(event) {
      if (isUpKey(event.key)) up = false;
      if (isDownKey(event.key)) down = false;
    }

    canvas.addEventListener("pointermove", moveFromPointer);
    canvas.addEventListener("pointerdown", moveFromPointer);
    document.addEventListener("keydown", keyHandler);
    document.addEventListener("keyup", keyUp);

    actions([
      { label: "Restart", onClick: reset },
      {
        label: "Pause / Resume",
        secondary: true,
        onClick: () => {
          if (ended) return;
          running = !running;
          lastTime = 0;
          status(running ? "Game resumed." : "Game paused.");
        }
      }
    ]);

    reset();

    return () => {
      cancelAnimationFrame(animation);
      canvas.removeEventListener("pointermove", moveFromPointer);
      canvas.removeEventListener("pointerdown", moveFromPointer);
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("keyup", keyUp);
    };
  }

  /* ==================== GAME: BRICK BREAKER ==================== */

  register(
    "brickbreaker",
    "Brick Breaker",
    "Bounce the ball off your paddle and destroy every brick.",
    "🧱",
    "Arcade",
    startBrickBreaker
  );

  function startBrickBreaker(token) {
    shell("Brick Breaker", "Move the paddle with touch, mouse, or arrow keys.");
    const playArea = area();

    const wrap = document.createElement("div");
    wrap.className = "nx-canvas-wrap";

    const canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 480;
    canvas.setAttribute("aria-label", "Brick Breaker game");
    wrap.appendChild(canvas);
    playArea.appendChild(wrap);

    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const paddle = { x: W / 2 - 52, y: H - 35, w: 104, h: 12 };
    const ball = { x: W / 2, y: H - 65, r: 8, vx: 210, vy: -250 };

    let bricks = [];
    let score = 0;
    let lives = 3;
    let running = false;
    let ended = false;
    let animation = 0;
    let lastTime = 0;
    let left = false;
    let right = false;

    function makeBricks() {
      bricks = [];
      const rows = 6;
      const cols = 10;
      const gap = 7;
      const margin = 20;
      const brickW = (W - margin * 2 - gap * (cols - 1)) / cols;
      const brickH = 20;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          bricks.push({
            x: margin + col * (brickW + gap),
            y: 48 + row * (brickH + gap),
            w: brickW,
            h: brickH,
            alive: true,
            color: row
          });
        }
      }
    }

    function resetBall() {
      ball.x = W / 2;
      ball.y = H - 65;
      ball.vx = (Math.random() < 0.5 ? -1 : 1) * 210;
      ball.vy = -250;
      paddle.x = W / 2 - paddle.w / 2;
    }

    function reset() {
      cancelAnimationFrame(animation);
      score = 0;
      lives = 3;
      running = true;
      ended = false;
      lastTime = 0;
      makeBricks();
      resetBall();
      status("Destroy all the bricks. You have 3 lives.");
      draw();
      animation = requestAnimationFrame(frame);
    }

    function draw() {
      ctx.fillStyle = "#060b16";
      ctx.fillRect(0, 0, W, H);

      const colors = ["#ff628d", "#ff9f59", "#ffd166", "#58dfb5", "#5dc6ff", "#a78bfa"];

      bricks.forEach(brick => {
        if (!brick.alive) return;
        ctx.fillStyle = colors[brick.color];
        ctx.beginPath();
        ctx.roundRect(brick.x, brick.y, brick.w, brick.h, 4);
        ctx.fill();
      });

      ctx.fillStyle = "#67caff";
      ctx.beginPath();
      ctx.roundRect(paddle.x, paddle.y, paddle.w, paddle.h, 7);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 18px system-ui";
      ctx.textAlign = "left";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`Score: ${score}`, 20, 27);

      ctx.textAlign = "right";
      ctx.fillText(`Lives: ${lives}`, W - 20, 27);
    }

    function frame(time) {
      if (!isActive(token) || ended) return;
      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.025);
      lastTime = time;

      if (running) update(dt);
      draw();
      animation = requestAnimationFrame(frame);
    }

    function update(dt) {
      if (left) paddle.x -= 430 * dt;
      if (right) paddle.x += 430 * dt;

      paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x));

      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      if (ball.x - ball.r <= 0 || ball.x + ball.r >= W) {
        ball.vx *= -1;
        ball.x = Math.max(ball.r, Math.min(W - ball.r, ball.x));
      }

      if (ball.y - ball.r <= 0) {
        ball.vy = Math.abs(ball.vy);
        ball.y = ball.r;
      }

      if (
        ball.vy > 0 &&
        ball.y + ball.r >= paddle.y &&
        ball.y - ball.r <= paddle.y + paddle.h &&
        ball.x >= paddle.x &&
        ball.x <= paddle.x + paddle.w
      ) {
        ball.y = paddle.y - ball.r;
        const offset = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
        ball.vx = offset * 340;
        ball.vy = -Math.max(200, Math.sqrt(210 * 210 + 250 * 250));

        const speed = Math.hypot(ball.vx, ball.vy);
        const targetSpeed = Math.min(440, speed + 4);
        ball.vx = (ball.vx / speed) * targetSpeed;
        ball.vy = (ball.vy / speed) * targetSpeed;
      }

      for (const brick of bricks) {
        if (!brick.alive) continue;
        const insideX = ball.x + ball.r >= brick.x && ball.x - ball.r <= brick.x + brick.w;
        const insideY = ball.y + ball.r >= brick.y && ball.y - ball.r <= brick.y + brick.h;

        if (insideX && insideY) {
          brick.alive = false;
          score += 10;

          const previousX = ball.x - ball.vx * dt;
          if (previousX + ball.r <= brick.x || previousX - ball.r >= brick.x + brick.w) {
            ball.vx *= -1;
          } else {
            ball.vy *= -1;
          }
          break;
        }
      }

      if (bricks.every(brick => !brick.alive)) {
        ended = true;
        running = false;
        recordScore("brickbreaker", score);
        status(`Victory! You destroyed every brick. Score: ${score}.`);
        return;
      }

      if (ball.y - ball.r > H) {
        lives--;
        if (lives <= 0) {
          ended = true;
          running = false;
          recordScore("brickbreaker", score);
          status(`Game over! Score: ${score}. Best: ${getBest("brickbreaker")}.`);
        } else {
          resetBall();
          status(`Ball lost. ${lives} ${lives === 1 ? "life" : "lives"} remaining.`);
        }
      }
    }

    function movePointer(event) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const x = (event.clientX - rect.left) * scaleX;
      paddle.x = Math.max(0, Math.min(W - paddle.w, x - paddle.w / 2));
    }

    function keyHandler(event) {
      if (["ArrowLeft", "ArrowRight", "a", "A", "d", "D", " "].includes(event.key)) {
        event.preventDefault();
      }
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") left = true;
      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") right = true;

      if (event.key === " " && !ended && !event.repeat) {
        running = !running;
        lastTime = 0;
        status(running ? "Game resumed." : "Game paused.");
      }
    }

    function keyUp(event) {
      if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") left = false;
      if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") right = false;
    }

    canvas.addEventListener("pointermove", movePointer);
    document.addEventListener("keydown", keyHandler);
    document.addEventListener("keyup", keyUp);

    actions([
      { label: "Restart", onClick: reset },
      {
        label: "Pause / Resume",
        secondary: true,
        onClick: () => {
          if (ended) return;
          running = !running;
          lastTime = 0;
          status(running ? "Game resumed." : "Game paused.");
        }
      }
    ]);

    reset();

    return () => {
      cancelAnimationFrame(animation);
      canvas.removeEventListener("pointermove", movePointer);
      document.removeEventListener("keydown", keyHandler);
      document.removeEventListener("keyup", keyUp);
    };
  }

  /* ==================== GAME: ENDLESS RUNNER ==================== */

  register(
    "runner",
    "Endless Runner",
    "Jump over obstacles, survive longer, and beat your best distance.",
    "🏃",
    "Arcade",
    startRunner
  );

  function startRunner(token) {
    shell("Endless Runner", "Tap the game, press Space, or use the Jump button.");
    const playArea = area();

    const wrap = document.createElement("div");
    wrap.className = "nx-canvas-wrap";

    const canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 340;
    canvas.setAttribute("aria-label", "Endless Runner game");
    wrap.appendChild(canvas);
    playArea.appendChild(wrap);

    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;
    const ground = H - 48;

    let player, obstacles, score, speed, spawnIn, running, ended;
    let animation = 0;
    let lastTime = 0;
    let jumpQueued = false;

    function reset() {
      cancelAnimationFrame(animation);
      player = { x: 80, y: ground - 38, w: 30, h: 38, vy: 0, onGround: true };
      obstacles = [];
      score = 0;
      speed = 280;
      spawnIn = 1;
      running = true;
      ended = false;
      lastTime = 0;
      jumpQueued = false;

      status("Jump over obstacles. Your distance is your score.");
      draw();
      animation = requestAnimationFrame(frame);
    }

    function jump() {
      if (ended) return;
      if (!running) {
        running = true;
        lastTime = 0;
        return;
      }
      if (player.onGround) {
        player.vy = -570;
        player.onGround = false;
      }
    }

    function draw() {
      ctx.fillStyle = "#060b16";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#1c3557";
      for (let i = 0; i < 25; i++) {
        const x = (i * 97 + Math.floor(score * 0.3)) % W;
        const y = 25 + (i * 43) % 170;
        ctx.fillRect(x, y, 2, 2);
      }

      ctx.strokeStyle = "#35577d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, ground);
      ctx.lineTo(W, ground);
      ctx.stroke();

      ctx.fillStyle = "#67caff";
      ctx.beginPath();
      ctx.roundRect(player.x, player.y, player.w, player.h, 7);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(player.x + 18, player.y + 8, 5, 5);

      obstacles.forEach(obstacle => {
        ctx.fillStyle = "#ff658b";
        ctx.beginPath();
        ctx.roundRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h, 5);
        ctx.fill();
      });

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`Distance: ${Math.floor(score)}`, 18, 28);
      ctx.fillText(`Speed: ${Math.floor(speed)}`, 18, 53);
    }

    function frame(time) {
      if (!isActive(token) || ended) return;
      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.025);
      lastTime = time;

      if (running) update(dt);
      draw();
      animation = requestAnimationFrame(frame);
    }

    function update(dt) {
      score += dt * 10;
      speed = Math.min(560, 280 + score * 0.8);

      if (jumpQueued) {
        jumpQueued = false;
        jump();
      }

      player.vy += 1450 * dt;
      player.y += player.vy * dt;

      if (player.y + player.h >= ground) {
        player.y = ground - player.h;
        player.vy = 0;
        player.onGround = true;
      }

      spawnIn -= dt;
      if (spawnIn <= 0) {
        const height = randomInt(25, 48);
        const width = randomInt(18, 30);
        obstacles.push({
          x: W + 10,
          y: ground - height,
          w: width,
          h: height
        });
        spawnIn = Math.max(0.65, randomInt(90, 155) / 100 - score / 1200);
      }

      obstacles.forEach(obstacle => {
        obstacle.x -= speed * dt;
      });

      obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.w > -10);

      for (const obstacle of obstacles) {
        const collided =
          player.x + player.w > obstacle.x &&
          player.x < obstacle.x + obstacle.w &&
          player.y + player.h > obstacle.y &&
          player.y < obstacle.y + obstacle.h;

        if (collided) {
          ended = true;
          running = false;
          const finalScore = Math.floor(score);
          recordScore("runner", finalScore);
          status(`Game over! Distance: ${finalScore}. Best: ${getBest("runner")}. Press Restart to try again.`);
          return;
        }
      }
    }

    function keyHandler(event) {
      if ([" ", "ArrowUp", "w", "W"].includes(event.key)) {
        event.preventDefault();
        if (event.repeat) return;
        jumpQueued = true;
      }
    }

    function pointerJump(event) {
      if (event.target.closest("button")) return;
      jumpQueued = true;
    }

    document.addEventListener("keydown", keyHandler);
    canvas.addEventListener("pointerdown", pointerJump);

    const jumpButton = button("⬆ Jump", () => {
      jumpQueued = true;
    });
    playArea.appendChild(jumpButton);

    actions([
      { label: "Restart", onClick: reset },
      {
        label: "Pause / Resume",
        secondary: true,
        onClick: () => {
          if (ended) return;
          running = !running;
          lastTime = 0;
          status(running ? "Game resumed." : "Game paused.");
        }
      }
    ]);

    reset();

    return () => {
      cancelAnimationFrame(animation);
      document.removeEventListener("keydown", keyHandler);
      canvas.removeEventListener("pointerdown", pointerJump);
    };
  }

  /* ==================== GAME: SPACE SHOOTER ==================== */

  register(
    "space",
    "Space Shooter",
    "Pilot your ship, shoot enemies, dodge collisions, and survive waves.",
    "🚀",
    "Arcade",
    startSpaceShooter
  );

  function startSpaceShooter(token) {
    shell("Space Shooter", "Move with arrows, WASD, or drag on touch. Hold Space or the Fire button to shoot.");
    const playArea = area();

    const wrap = document.createElement("div");
    wrap.className = "nx-canvas-wrap";

    const canvas = document.createElement("canvas");
    canvas.width = 700;
    canvas.height = 460;
    canvas.setAttribute("aria-label", "Space Shooter game");
    wrap.appendChild(canvas);
    playArea.appendChild(wrap);

    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    let player, bullets, enemies, enemyBullets, particles, score, lives, wave;
    let spawnTimer, shootTimer, running, ended;
    let animation = 0;
    let lastTime = 0;
    const keys = new Set();

    function reset() {
      cancelAnimationFrame(animation);
      player = { x: W / 2, y: H - 65, r: 15, speed: 310, invincible: 0 };
      bullets = [];
      enemies = [];
      enemyBullets = [];
      particles = [];
      score = 0;
      lives = 3;
      wave = 1;
      spawnTimer = 0.5;
      shootTimer = 0;
      running = true;
      ended = false;
      lastTime = 0;

      status("Destroy enemies and dodge incoming fire.");
      draw();
      animation = requestAnimationFrame(frame);
    }

    function spawnEnemy() {
      const type = Math.random();
      enemies.push({
        x: randomInt(28, W - 28),
        y: -25,
        r: type < 0.25 ? 18 : 13,
        hp: type < 0.25 ? 2 : 1,
        speed: randomInt(65, 105) + wave * 7,
        fire: randomInt(10, 30) / 10,
        drift: randomInt(-40, 40),
        points: type < 0.25 ? 30 : 10
      });
    }

    function shoot() {
      bullets.push({ x: player.x, y: player.y - 16, r: 4, speed: 440 });
    }

    function addExplosion(x, y) {
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = randomInt(40, 160);
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.45
        });
      }
    }

    function draw() {
      ctx.fillStyle = "#060b16";
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "#9ccfff";
      for (let i = 0; i < 75; i++) {
        const x = (i * 89 + Math.floor(score * 0.5)) % W;
        const y = (i * 47 + Math.floor(score * 1.8)) % H;
        ctx.fillRect(x, y, 2, 2);
      }

      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.fillStyle = player.invincible > 0 ? "#ffffff" : "#67caff";
      ctx.beginPath();
      ctx.moveTo(0, -19);
      ctx.lineTo(15, 15);
      ctx.lineTo(0, 8);
      ctx.lineTo(-15, 15);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = "#83f7d4";
      bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.roundRect(bullet.x - 2, bullet.y - 8, 4, 13, 2);
        ctx.fill();
      });

      enemies.forEach(enemy => {
        ctx.fillStyle = enemy.hp > 1 ? "#ffb45d" : "#ff658b";
        ctx.beginPath();
        ctx.moveTo(enemy.x, enemy.y + enemy.r);
        ctx.lineTo(enemy.x + enemy.r, enemy.y - enemy.r * 0.6);
        ctx.lineTo(enemy.x, enemy.y - enemy.r * 0.2);
        ctx.lineTo(enemy.x - enemy.r, enemy.y - enemy.r * 0.6);
        ctx.closePath();
        ctx.fill();
      });

      ctx.fillStyle = "#d6a5ff";
      enemyBullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.r, 0, Math.PI * 2);
        ctx.fill();
      });

      particles.forEach(particle => {
        ctx.globalAlpha = Math.max(0, particle.life / 0.45);
        ctx.fillStyle = "#ffd166";
        ctx.fillRect(particle.x, particle.y, 4, 4);
      });
      ctx.globalAlpha = 1;

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 17px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(`Score: ${score}`, 16, 26);
      ctx.fillText(`Lives: ${lives}`, 16, 50);

      ctx.textAlign = "right";
      ctx.fillText(`Wave: ${wave}`, W - 16, 26);
    }

    function frame(time) {
      if (!isActive(token) || ended) return;
      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 1000, 0.025);
      lastTime = time;

      if (running) update(dt);
      draw();
      animation = requestAnimationFrame(frame);
    }

    function update(dt) {
      if (keys.has("ArrowLeft") || keys.has("a")) player.x -= player.speed * dt;
      if (keys.has("ArrowRight") || keys.has("d")) player.x += player.speed * dt;
      if (keys.has("ArrowUp") || keys.has("w")) player.y -= player.speed * dt;
      if (keys.has("ArrowDown") || keys.has("s")) player.y += player.speed * dt;

      player.x = Math.max(player.r, Math.min(W - player.r, player.x));
      player.y = Math.max(player.r + 15, Math.min(H - player.r, player.y));
      player.invincible = Math.max(0, player.invincible - dt);

      shootTimer -= dt;
      if (keys.has(" ") && shootTimer <= 0) {
        shoot();
        shootTimer = 0.19;
      }

      spawnTimer -= dt;
      if (spawnTimer <= 0) {
        spawnEnemy();
        spawnTimer = Math.max(0.3, 1.05 - wave * 0.07);
      }

      bullets.forEach(bullet => { bullet.y -= bullet.speed * dt; });
      bullets = bullets.filter(bullet => bullet.y > -15);

      enemies.forEach(enemy => {
        enemy.y += enemy.speed * dt;
        enemy.x += enemy.drift * dt;
        if (enemy.x < enemy.r || enemy.x > W - enemy.r) enemy.drift *= -1;

        enemy.fire -= dt;
        if (enemy.fire <= 0 && enemy.y > 0 && enemy.y < H - 100) {
          const dx = player.x - enemy.x;
          const dy = player.y - enemy.y;
          const length = Math.hypot(dx, dy) || 1;
          enemyBullets.push({
            x: enemy.x,
            y: enemy.y + enemy.r,
            vx: (dx / length) * 150,
            vy: (dy / length) * 150,
            r: 5
          });
          enemy.fire = randomInt(20, 40) / 10;
        }
      });

      enemyBullets.forEach(bullet => {
        bullet.x += bullet.vx * dt;
        bullet.y += bullet.vy * dt;
      });
      enemyBullets = enemyBullets.filter(bullet => bullet.y < H + 10 && bullet.x > -10 && bullet.x < W + 10);

      particles.forEach(particle => {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.life -= dt;
      });
      particles = particles.filter(particle => particle.life > 0);

      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        for (let j = bullets.length - 1; j >= 0; j--) {
          const bullet = bullets[j];
          if (Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < enemy.r + bullet.r) {
            bullets.splice(j, 1);
            enemy.hp--;
            if (enemy.hp <= 0) {
              score += enemy.points;
              addExplosion(enemy.x, enemy.y);
              enemies.splice(i, 1);
            }
            break;
          }
        }
      }

      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.y > H + 25) {
          enemies.splice(i, 1);
          continue;
        }
        if (player.invincible <= 0 && Math.hypot(player.x - enemy.x, player.y - enemy.y) < player.r + enemy.r) {
          enemies.splice(i, 1);
          damagePlayer();
        }
      }

      if (player.invincible <= 0) {
        for (let i = enemyBullets.length - 1; i >= 0; i--) {
          const bullet = enemyBullets[i];
          if (Math.hypot(player.x - bullet.x, player.y - bullet.y) < player.r + bullet.r) {
            enemyBullets.splice(i, 1);
            damagePlayer();
            break;
          }
        }
      }

      const newWave = 1 + Math.floor(score / 150);
      if (newWave > wave) {
        wave = newWave;
        status(`Wave ${wave}! Enemies are getting faster.`);
      }
    }

    function damagePlayer() {
      if (player.invincible > 0 || ended) return;
      lives--;
      player.invincible = 1.3;
      status(`Hit! ${lives} ${lives === 1 ? "life" : "lives"} remaining.`);
      if (lives <= 0) {
        ended = true;
        running = false;
        recordScore("space", score);
        status(`Game over! Score: ${score}. Best: ${getBest("space")}. Press Restart to play again.`);
      }
    }

    function keyDown(event) {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(key)) {
        event.preventDefault();
      }
      keys.add(key);
    }

    function keyUp(event) {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      keys.delete(key);
    }

    function pointerMove(event) {
      if (event.pointerType === "mouse") return;
      const rect = canvas.getBoundingClientRect();
      player.x = (event.clientX - rect.left) * W / rect.width;
      player.y = (event.clientY - rect.top) * H / rect.height;
      player.x = Math.max(player.r, Math.min(W - player.r, player.x));
      player.y = Math.max(player.r + 15, Math.min(H - player.r, player.y));
    }

    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerdown", pointerMove);

    padRow(playArea, [
      holdButton("🔥 Hold to Fire", () => keys.add(" "), () => keys.delete(" "))
    ]);

    actions([
      { label: "Restart", onClick: reset },
      {
        label: "Pause / Resume",
        secondary: true,
        onClick: () => {
          if (ended) return;
          running = !running;
          lastTime = 0;
          status(running ? "Game resumed." : "Game paused.");
        }
      }
    ]);

    reset();

    return () => {
      cancelAnimationFrame(animation);
      document.removeEventListener("keydown", keyDown);
      document.removeEventListener("keyup", keyUp);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointerdown", pointerMove);
      keys.clear();
    };
  }

  /* ===================== GAME: MINESWEEPER ===================== */

  register(
    "minesweeper",
    "Minesweeper",
    "Reveal safe squares, follow the number clues, and avoid mines.",
    "💣",
    "Puzzle",
    startMinesweeper
  );

  function startMinesweeper(token) {
    shell("Minesweeper", "Reveal every safe square. Use Flag Mode or right-click to mark suspected mines.");
    const playArea = area();

    const SIZE = 10;
    const MINE_COUNT = 15;

    let cells, revealed, flagged, started, ended, flagMode, seconds, timer, revealedSafe;

    const info = document.createElement("div");
    info.className = "nx-status";
    playArea.appendChild(info);

    const board = document.createElement("div");
    board.className = "nx-board";
    board.style.gridTemplateColumns = `repeat(${SIZE}, minmax(0, 1fr))`;
    board.style.maxWidth = "500px";
    board.style.gap = "3px";
    playArea.appendChild(board);

    function indexOf(x, y) { return y * SIZE + x; }

    function neighbors(index) {
      const x = index % SIZE;
      const y = Math.floor(index / SIZE);
      const result = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < SIZE && ny >= 0 && ny < SIZE) {
            result.push(indexOf(nx, ny));
          }
        }
      }
      return result;
    }

    function placeMines(firstIndex) {
      const forbidden = new Set([firstIndex, ...neighbors(firstIndex)]);
      const candidates = [];
      for (let i = 0; i < SIZE * SIZE; i++) {
        if (!forbidden.has(i)) candidates.push(i);
      }
      const mineLocations = shuffle(candidates).slice(0, MINE_COUNT);
      mineLocations.forEach(index => { cells[index].mine = true; });

      cells.forEach((cell, index) => {
        if (cell.mine) return;
        cell.count = neighbors(index).filter(neighbor => cells[neighbor].mine).length;
      });

      started = true;
      seconds = 0;
      timer = setInterval(() => {
        if (!isActive(token) || ended) return;
        seconds++;
        updateInfo();
      }, 1000);
    }

    function reset() {
      clearInterval(timer);
      cells = Array.from({ length: SIZE * SIZE }, () => ({ mine: false, count: 0 }));
      revealed = new Set();
      flagged = new Set();
      started = false;
      ended = false;
      flagMode = false;
      seconds = 0;
      revealedSafe = 0;

      board.innerHTML = "";
      for (let i = 0; i < SIZE * SIZE; i++) {
        const cellButton = document.createElement("button");
        cellButton.className = "nx-cell";
        cellButton.style.aspectRatio = "1";
        cellButton.setAttribute("aria-label", `Hidden square ${i + 1}`);

        cellButton.addEventListener("click", () => {
          if (flagMode) toggleFlag(i);
          else reveal(i);
        });

        cellButton.addEventListener("contextmenu", event => {
          event.preventDefault();
          toggleFlag(i);
        });

        board.appendChild(cellButton);
      }
      updateInfo();
      status("Choose any square to begin. Your first area will be safe.");
    }

    function updateInfo() {
      info.textContent = `Mines: ${MINE_COUNT} • Flags: ${flagged.size} • Safe squares: ${revealedSafe}/${SIZE * SIZE - MINE_COUNT} • Time: ${seconds}s`;
    }

    function toggleFlag(index) {
      if (ended || revealed.has(index)) return;
      if (flagged.has(index)) {
        flagged.delete(index);
      } else {
        if (flagged.size >= MINE_COUNT) {
          status("You have used all 15 flags.");
          return;
        }
        flagged.add(index);
      }
      renderBoard();
      updateInfo();
    }

    function reveal(index) {
      if (ended || revealed.has(index) || flagged.has(index)) return;
      if (!started) placeMines(index);

      if (cells[index].mine) {
        ended = true;
        clearInterval(timer);
        cells.forEach((cell, i) => { if (cell.mine) revealed.add(i); });
        renderBoard();
        status(`Boom! You found a mine after ${seconds} seconds.`);
        return;
      }

      floodReveal(index);
      renderBoard();
      updateInfo();

      if (revealedSafe === SIZE * SIZE - MINE_COUNT) {
        ended = true;
        clearInterval(timer);
        const score = Math.max(100, 1500 - seconds * 5);
        recordScore("minesweeper", score);
        status(`You win! Revealed in ${seconds} seconds. Score: ${score}.`);
      }
    }

    function floodReveal(startIndex) {
      const stack = [startIndex];
      while (stack.length) {
        const index = stack.pop();
        if (revealed.has(index) || flagged.has(index) || cells[index].mine) continue;
        revealed.add(index);
        revealedSafe++;

        if (cells[index].count === 0) {
          neighbors(index).forEach(neighbor => {
            if (!revealed.has(neighbor) && !flagged.has(neighbor) && !cells[neighbor].mine) {
              stack.push(neighbor);
            }
          });
        }
      }
    }

    function renderBoard() {
      const buttons = board.children;
      for (let i = 0; i < cells.length; i++) {
        const cellButton = buttons[i];
        const cell = cells[i];
        cellButton.className = "nx-cell";
        cellButton.style.background = "";
        cellButton.style.color = "";
        cellButton.disabled = revealed.has(i) || ended;

        if (revealed.has(i)) {
          if (cell.mine) {
            cellButton.textContent = "💣";
            cellButton.style.background = "#662b40";
          } else {
            cellButton.textContent = cell.count || "";
            cellButton.style.background = "#101c31";
            const colors = { 1: "#67caff", 2: "#70e0a0", 3: "#ff8e8e", 4: "#bba5ff", 5: "#ffbd66" };
            if (cell.count) cellButton.style.color = colors[cell.count] || "#ffffff";
          }
        } else if (flagged.has(i)) {
          cellButton.textContent = "🚩";
          cellButton.style.background = "#563a19";
        } else {
          cellButton.textContent = "";
        }
      }
    }

    actions([
      { label: "Restart", onClick: reset },
      {
        label: "🚩 Flag Mode: OFF",
        secondary: true,
        onClick: event => {
          flagMode = !flagMode;
          event.currentTarget.textContent = `🚩 Flag Mode: ${flagMode ? "ON" : "OFF"}`;
          status(flagMode ? "Flag Mode is ON." : "Flag Mode is OFF.");
        }
      }
    ]);

    reset();
    return () => clearInterval(timer);
  }

  /* ==================== GAME: MATH CHALLENGE ==================== */

  register(
    "math",
    "Math Challenge",
    "Solve arithmetic questions before the 30-second timer reaches zero.",
    "🔢",
    "Puzzle",
    startMath
  );

  function startMath(token) {
    shell("Math Challenge", "Answer as many arithmetic questions as you can in 30 seconds.");
    const playArea = area();

    const question = document.createElement("div");
    question.className = "nx-panel";
    question.style.textAlign = "center";
    question.style.marginTop = "15px";
    question.style.fontSize = "clamp(25px, 7vw, 42px)";
    question.style.fontWeight = "900";
    playArea.appendChild(question);

    const form = document.createElement("form");
    form.style.display = "flex";
    form.style.gap = "9px";
    form.style.flexWrap = "wrap";
    form.style.margin = "15px 0";
    playArea.appendChild(form);

    const input = document.createElement("input");
    input.type = "number";
    input.inputMode = "numeric";
    input.placeholder = "Your answer";
    input.required = true;
    input.style.flex = "1 1 130px";
    input.style.padding = "13px";
    input.style.background = "#080f20";
    input.style.color = "white";
    input.style.border = "1px solid #344765";
    input.style.borderRadius = "10px";

    const submit = document.createElement("button");
    submit.className = "nx-btn";
    submit.type = "submit";
    submit.textContent = "Submit Answer";
    form.append(input, submit);

    const nextButton = button("Next Question", nextQuestion, true);
    nextButton.style.display = "none";
    playArea.appendChild(nextButton);

    let answer = 0, score = 0, correct = 0, attempted = 0, remaining = 30;
    let running = false, ended = false, timer = null, questionLocked = false;

    function makeQuestion() {
      const difficulty = Math.min(4, Math.floor(score / 5));
      const operation = randomInt(0, Math.min(3, difficulty + 1));
      let a, b, symbol;

      if (operation === 0) {
        a = randomInt(1, 10 + difficulty * 10);
        b = randomInt(1, 10 + difficulty * 10);
        answer = a + b;
        symbol = "+";
      } else if (operation === 1) {
        a = randomInt(1, 10 + difficulty * 10);
        b = randomInt(1, a);
        answer = a - b;
        symbol = "−";
      } else if (operation === 2) {
        a = randomInt(2, 10 + difficulty * 2);
        b = randomInt(2, 10);
        answer = a * b;
        symbol = "×";
      } else {
        b = randomInt(2, 12);
        answer = randomInt(2, 12);
        a = b * answer;
        symbol = "÷";
      }
      question.textContent = `${a} ${symbol} ${b} = ?`;
    }

    function updateStatus() {
      status(`Time: ${remaining}s • Score: ${score} • Correct: ${correct}/${attempted}`);
    }

    function nextQuestion() {
      if (ended) return;
      questionLocked = false;
      input.value = "";
      input.disabled = false;
      submit.disabled = false;
      nextButton.style.display = "none";
      makeQuestion();
      input.focus();
    }

    function finish() {
      ended = true;
      running = false;
      clearInterval(timer);
      input.disabled = true;
      submit.disabled = true;
      nextButton.style.display = "none";
      recordScore("math", score);
      question.textContent = "Time's up!";
      status(`Final score: ${score}. Correct: ${correct}/${attempted}. Best: ${getBest("math")}.`);
    }

    function reset() {
      clearInterval(timer);
      score = 0;
      correct = 0;
      attempted = 0;
      remaining = 30;
      running = true;
      ended = false;
      questionLocked = false;
      input.value = "";
      input.disabled = false;
      submit.disabled = false;
      nextButton.style.display = "none";
      makeQuestion();
      updateStatus();

      timer = setInterval(() => {
        if (!isActive(token) || ended) return;
        remaining--;
        updateStatus();
        if (remaining <= 0) finish();
      }, 1000);
      input.focus();
    }

    form.addEventListener("submit", event => {
      event.preventDefault();
      if (ended || questionLocked) return;
      if (input.value.trim() === "") return;

      const submitted = Number(input.value);
      attempted++;
      questionLocked = true;
      input.disabled = true;
      submit.disabled = true;

      if (submitted === answer) {
        correct++;
        score += 10;
        status(`Correct! +10 points.`);
      } else {
        status(`Not quite. The correct answer was ${answer}.`);
      }

      recordScore("math", score);
      updateStatus();

      if (remaining > 0) {
        nextButton.style.display = "inline-block";
      }
    });

    actions([{ label: "Restart", onClick: reset }]);
    reset();

    return () => clearInterval(timer);
  }

  /* ================= GAME: ROCK PAPER SCISSORS ================= */

  register(
    "rps",
    "Rock Paper Scissors",
    "Choose rock, paper, or scissors and challenge the computer.",
    "✊",
    "Casual",
    startRPS
  );

  function startRPS(token) {
    shell("Rock Paper Scissors", "Rock beats scissors. Scissors beat paper. Paper beats rock.");
    const playArea = area();

    let playerScore = 0, computerScore = 0, draws = 0, round = 0, ended = false;

    const choices = [
      { name: "Rock", icon: "✊" },
      { name: "Paper", icon: "✋" },
      { name: "Scissors", icon: "✌️" }
    ];

    const resultBox = document.createElement("div");
    resultBox.className = "nx-panel";
    resultBox.style.textAlign = "center";
    resultBox.style.marginTop = "15px";
    playArea.appendChild(resultBox);

    const scoreBox = document.createElement("div");
    scoreBox.className = "nx-status";
    playArea.appendChild(scoreBox);

    const choiceGrid = document.createElement("div");
    choiceGrid.className = "nx-grid";
    choiceGrid.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
    playArea.appendChild(choiceGrid);

    function updateScore() {
      scoreBox.textContent = `You: ${playerScore} • Computer: ${computerScore} • Draws: ${draws} • Rounds: ${round}`;
    }

    function reset() {
      playerScore = 0;
      computerScore = 0;
      draws = 0;
      round = 0;
      ended = false;

      resultBox.innerHTML = `
        <div style="font-size:46px">✊ ✋ ✌️</div>
        <h3>Ready for a match?</h3>
        <p class="nx-muted">Choose your move below.</p>
      `;
      updateScore();
      status("Make your first move!");
    }

    function play(playerChoice) {
      if (ended || !isActive(token)) return;

      const computerChoice = randomInt(0, 2);
      const player = choices[playerChoice];
      const computer = choices[computerChoice];
      round++;

      let outcome;
      if (playerChoice === computerChoice) {
        draws++;
        outcome = "It's a draw!";
      } else if (
        (playerChoice === 0 && computerChoice === 2) ||
        (playerChoice === 1 && computerChoice === 0) ||
        (playerChoice === 2 && computerChoice === 1)
      ) {
        playerScore++;
        outcome = "You win this round!";
      } else {
        computerScore++;
        outcome = "Computer wins this round!";
      }

      resultBox.innerHTML = `
        <div style="display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap">
          <div>
            <div style="font-size:48px">${player.icon}</div>
            <strong>You</strong>
            <div class="nx-small">${player.name}</div>
          </div>
          <div style="font-size:22px;font-weight:900;color:#67caff">VS</div>
          <div>
            <div style="font-size:48px">${computer.icon}</div>
            <strong>Computer</strong>
            <div class="nx-small">${computer.name}</div>
          </div>
        </div>
        <h3 style="margin-bottom:5px">${outcome}</h3>
      `;

      recordScore("rps", playerScore);
      updateScore();
      status(`Round ${round}: ${outcome} Best win count: ${getBest("rps")}.`);
    }

    choices.forEach((choice, index) => {
      const card = document.createElement("div");
      card.className = "nx-card";
      card.style.textAlign = "center";

      const icon = document.createElement("div");
      icon.className = "nx-icon";
      icon.style.fontSize = "42px";
      icon.textContent = choice.icon;

      const title = document.createElement("h3");
      title.textContent = choice.name;

      const playButton = button("Choose " + choice.name, () => play(index));
      playButton.style.width = "100%";

      card.append(icon, title, playButton);
      choiceGrid.appendChild(card);
    });

    actions([{ label: "Restart Match", onClick: reset }]);
    reset();

    return () => {};
  }

