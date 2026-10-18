/* ==========================================================
   REXWEB NEXORA — 10-GAME ARCADE
   Complete self-contained game.js
   Mobile + Desktop | No external libraries
   ========================================================== */

(() => {
  "use strict";

  const ROOT_ID = "nexora-games";
  const SCORE_KEY = "rexweb_nexora_arcade_scores_v1";

  const root = document.getElementById(ROOT_ID);

  if (!root) {
    console.error("RexWeb Nexora: #nexora-games was not found.");
    return;
  }

  let cleanup = null;
  let currentScore = 0;
  let currentGame = "";
  let gameToken = 0;

  function getScores() {
    try {
      return JSON.parse(localStorage.getItem(SCORE_KEY)) || {};
    } catch (_) {
      return {};
    }
  }

  function saveScore(name, score) {
    const scores = getScores();
    const value = Math.max(0, Math.floor(Number(score) || 0));

    scores[name] = Math.max(scores[name] || 0, value);

    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
    } catch (_) {}

    return scores[name];
  }

  function bestScore(name) {
    return getScores()[name] || 0;
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

  const games = [
    { id: "snake", name: "Snake", icon: "🐍", description: "Eat food and grow longer." },
    { id: "tictactoe", name: "Tic-Tac-Toe", icon: "❌", description: "Beat the computer." },
    { id: "pong", name: "Pong", icon: "🏓", description: "Return the bouncing ball." },
    { id: "brick", name: "Brick Breaker", icon: "🧱", description: "Break every brick." },
    { id: "runner", name: "Endless Runner", icon: "🏃", description: "Jump over obstacles." },
    { id: "shooter", name: "Space Shooter", icon: "🚀", description: "Defend space from enemies." },
    { id: "math", name: "Math Challenge", icon: "🧠", description: "Solve sums against the clock." },
    { id: "rps", name: "Rock Paper Scissors", icon: "✊", description: "Challenge the computer." },
    { id: "hangman", name: "Hangman", icon: "🔤", description: "Guess the hidden word." },
    { id: "flappy", name: "Flappy Flyer", icon: "🐦", description: "Fly through the gaps." }
  ];

  const styles = `
    #nexora-games {
      --nx-bg: #050914;
      --nx-panel: #0b1427;
      --nx-border: #263b5d;
      --nx-blue: #37b6ff;
      --nx-purple: #a78bfa;
      --nx-text: #f4f7ff;
      --nx-muted: #9eabc5;
      color: var(--nx-text);
      font-family: system-ui, Arial, sans-serif;
      padding: 16px;
    }

    #nexora-games * { box-sizing: border-box; }

    #nexora-games .nx-shell {
      max-width: 1150px;
      margin: auto;
    }

    #nexora-games .nx-title {
      text-align: center;
      font-size: clamp(25px, 5vw, 38px);
      font-weight: 950;
      margin: 8px 0;
      background: linear-gradient(90deg,#fff,#37b6ff,#a78bfa);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    #nexora-games .nx-subtitle {
      color: var(--nx-muted);
      text-align: center;
      margin: 0 0 22px;
      font-size: 13px;
    }

    #nexora-games .nx-stats {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      margin-bottom: 22px;
    }

    #nexora-games .nx-stat {
      background: #101d34;
      border: 1px solid var(--nx-border);
      border-radius: 12px;
      padding: 11px 17px;
      text-align: center;
      min-width: 115px;
    }

    #nexora-games .nx-stat strong {
      display: block;
      color: var(--nx-blue);
      font-size: 21px;
    }

    #nexora-games .nx-stat span {
      color: var(--nx-muted);
      font-size: 11px;
    }

    #nexora-games .nx-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0,1fr));
      gap: 12px;
    }

    @media(min-width:650px) {
      #nexora-games .nx-grid {
        grid-template-columns: repeat(3, minmax(0,1fr));
      }
    }

    @media(min-width:950px) {
      #nexora-games .nx-grid {
        grid-template-columns: repeat(5, minmax(0,1fr));
      }
    }

    #nexora-games .nx-card {
      min-width: 0;
      background: linear-gradient(145deg,#101d34,#091120);
      border: 1px solid var(--nx-border);
      border-radius: 17px;
      padding: 17px 12px;
      text-align: center;
      transition: transform .18s,border-color .18s,box-shadow .18s;
    }

    #nexora-games .nx-card:hover {
      transform: translateY(-3px);
      border-color: var(--nx-blue);
      box-shadow: 0 8px 28px #168bff16;
    }

    #nexora-games .nx-icon { font-size: 38px; }

    #nexora-games .nx-card h3 {
      font-size: 15px;
      margin: 9px 0 5px;
    }

    #nexora-games .nx-card p {
      min-height: 34px;
      color: var(--nx-muted);
      font-size: 12px;
      margin: 0 0 12px;
    }

    #nexora-games button {
      font: inherit;
      cursor: pointer;
      touch-action: manipulation;
      -webkit-tap-highlight-color: transparent;
    }

    #nexora-games .nx-btn {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 6px;
      border: 1px solid #36577f;
      border-radius: 10px;
      padding: 10px 14px;
      color: white;
      background: #142844;
      font-weight: 750;
    }

    #nexora-games .nx-btn:hover { border-color: var(--nx-blue); }

    #nexora-games .nx-primary {
      color: #06101f;
      border-color: transparent;
      background: linear-gradient(100deg,#37b6ff,#a78bfa);
    }

    #nexora-games .nx-wide { width: 100%; }

    #nexora-games .nx-game-panel {
      max-width: 850px;
      margin: auto;
      border: 1px solid var(--nx-border);
      border-radius: 18px;
      padding: 15px;
      background: linear-gradient(145deg,#0c172b,#070d19);
    }

    #nexora-games .nx-game-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 12px;
    }

    #nexora-games .nx-game-header h2 {
      margin: 0;
      font-size: 22px;
    }

    #nexora-games .nx-instructions {
      color: var(--nx-muted);
      font-size: 13px;
      line-height: 1.6;
      margin: 10px 0 15px;
    }

    #nexora-games .nx-board {
      margin: 12px auto;
      max-width: 100%;
    }

    #nexora-games .nx-canvas {
      display: block;
      width: 100%;
      max-width: 620px;
      height: auto;
      margin: auto;
      background: #030813;
      border: 1px solid #233957;
      border-radius: 12px;
      touch-action: none;
    }

    #nexora-games .nx-game-stats {
      display: flex;
      gap: 10px;
      justify-content: center;
      flex-wrap: wrap;
      margin: 10px 0;
    }

    #nexora-games .nx-pill {
      background: #101f37;
      border: 1px solid var(--nx-border);
      border-radius: 10px;
      padding: 8px 13px;
      font-size: 13px;
    }

    #nexora-games .nx-pill strong { color: var(--nx-blue); }

    /* ==========================================================
       DEDICATED MINI TOUCHSCREEN CONTROLLER PANEL
       ========================================================== */
    #nexora-games .nx-gamepad {
      background: #070e1c;
      border: 1px solid #37b6ff;
      box-shadow: 0 0 15px rgba(55, 182, 255, 0.15);
      border-radius: 14px;
      padding: 12px;
      margin: 15px auto;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      user-select: none;
      -webkit-user-select: none;
    }

    #nexora-games .nx-gamepad-row {
      display: flex;
      gap: 10px;
      justify-content: center;
      width: 100%;
    }

    #nexora-games .nx-pad-btn {
      background: #10233f;
      border: 1px solid #37b6ff;
      color: #37b6ff;
      font-weight: 800;
      border-radius: 10px;
      padding: 12px 18px;
      min-width: 56px;
      min-height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: background 0.1s, transform 0.1s, box-shadow 0.1s;
    }

    #nexora-games .nx-pad-btn:active,
    #nexora-games .nx-pad-btn.nx-active {
      background: #37b6ff;
      color: #06101f;
      box-shadow: 0 0 12px #37b6ff;
      transform: scale(0.95);
    }

    #nexora-games .nx-pad-wide {
      flex: 1;
      max-width: 180px;
      background: linear-gradient(100deg,#37b6ff,#a78bfa);
      color: #06101f;
      border: none;
      font-size: 15px;
    }

    #nexora-games .nx-pad-wide:active,
    #nexora-games .nx-pad-wide.nx-active {
      background: linear-gradient(100deg,#2595dc,#9072e6);
      color: #06101f;
      box-shadow: 0 0 15px #a78bfa;
    }

    #nexora-games .nx-pad-info {
      color: var(--nx-muted);
      font-size: 12px;
      text-align: center;
      padding: 4px;
      margin: 0;
    }

    #nexora-games .nx-message {
      text-align: center;
      font-weight: 800;
      min-height: 25px;
      margin: 10px 0;
      color: #9de8ff;
    }

    #nexora-games .nx-tic-grid {
      display: grid;
      grid-template-columns: repeat(3,minmax(0,100px));
      justify-content: center;
      gap: 8px;
      margin: 20px auto;
    }

    #nexora-games .nx-tic-cell {
      height: 90px;
      font-size: 34px;
      font-weight: 900;
      background: #101f37;
      border: 1px solid #36577f;
      border-radius: 13px;
      color: white;
    }

    #nexora-games .nx-tic-cell:disabled { cursor: default; }

    #nexora-games .nx-answer {
      background: #0a1324;
      border: 1px solid var(--nx-border);
      border-radius: 12px;
      padding: 13px;
      color: white;
      font-size: 21px;
      width: 100%;
      outline: none;
    }

    #nexora-games .nx-answer:focus { border-color: var(--nx-blue); }

    #nexora-games .nx-letter-grid {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 6px;
      margin: 15px 0;
    }

    #nexora-games .nx-letter {
      min-width: 36px;
      min-height: 40px;
      border: 1px solid #36577f;
      border-radius: 8px;
      background: #142844;
      color: white;
      font-weight: 800;
    }

    #nexora-games .nx-letter:disabled { opacity: .35; }

    #nexora-games .nx-word {
      text-align: center;
      letter-spacing: 8px;
      font-size: clamp(23px,6vw,34px);
      font-weight: 900;
      margin: 20px 0;
      overflow-wrap: anywhere;
    }

    #nexora-games .nx-choice-grid {
      display: grid;
      grid-template-columns: repeat(3,minmax(0,1fr));
      gap: 8px;
      max-width: 430px;
      margin: 20px auto;
    }

    #nexora-games .nx-choice {
      padding: 15px 4px;
      font-size: clamp(24px,5vw,36px);
      background: #101f37;
      border: 1px solid #36577f;
      border-radius: 13px;
      color: white;
    }

    #nexora-games .nx-choice span {
      display: block;
      font-size: 12px;
      margin-top: 5px;
    }

    #nexora-games .nx-footer {
      text-align: center;
      color: #7384a4;
      font-size: 11px;
      margin-top: 25px;
    }
  `;

  function injectStyles() {
    if (document.getElementById("nexora-arcade-styles")) return;

    const style = document.createElement("style");
    style.id = "nexora-arcade-styles";
    style.textContent = styles;
    document.head.appendChild(style);
  }

  function setScore(score) {
    currentScore = Math.max(0, Math.floor(Number(score) || 0));
    saveScore(currentGame, currentScore);

    const scoreEl = root.querySelector("[data-current-score]");
    const bestEl = root.querySelector("[data-best-score]");

    if (scoreEl) scoreEl.textContent = currentScore;
    if (bestEl) bestEl.textContent = bestScore(currentGame);
  }

  function stopCurrentGame() {
    gameToken++;

    if (typeof cleanup === "function") {
      try { cleanup(); } catch (error) {
        console.error("Game cleanup error:", error);
      }
    }

    cleanup = null;
  }

  function menu() {
    stopCurrentGame();
    currentGame = "";
    currentScore = 0;

    root.innerHTML = `
      <div class="nx-shell">
        <h2 class="nx-title">REXWEB NEXORA ARCADE</h2>
        <p class="nx-subtitle">PLAY • COMPETE • BEAT YOUR HIGH SCORES</p>

        <div class="nx-stats">
          <div class="nx-stat">
            <strong>10</strong>
            <span>GAMES AVAILABLE</span>
          </div>
          <div class="nx-stat">
            <strong>${Object.keys(getScores()).length}</strong>
            <span>GAMES WITH SAVED SCORES</span>
          </div>
        </div>

        <div class="nx-grid">
          ${games.map(game => `
            <article class="nx-card">
              <div class="nx-icon">${game.icon}</div>
              <h3>${escapeHTML(game.name)}</h3>
              <p>${escapeHTML(game.description)}</p>
              <div class="nx-pill" style="margin-bottom:10px">
                Best: <strong>${bestScore(game.id)}</strong>
              </div>
              <button class="nx-btn nx-primary nx-wide"
                data-play="${game.id}">PLAY NOW</button>
            </article>
          `).join("")}
        </div>

        <div class="nx-footer">REXWEB NEXORA • YOUR ARCADE, YOUR RECORDS</div>
      </div>
    `;

    root.querySelectorAll("[data-play]").forEach(button => {
      button.addEventListener("click", () => openGame(button.dataset.play));
    });
  }

  function openGame(id) {
    const game = games.find(item => item.id === id);
    if (!game) return;

    stopCurrentGame();

    currentGame = id;
    currentScore = 0;

    const token = gameToken;

    root.innerHTML = `
      <div class="nx-shell">
        <section class="nx-game-panel">
          <div class="nx-game-header">
            <h2>${game.icon} ${escapeHTML(game.name)}</h2>
            <button class="nx-btn" data-menu>← All Games</button>
          </div>

          <div class="nx-game-stats">
            <div class="nx-pill">Score: <strong data-current-score>0</strong></div>
            <div class="nx-pill">Best: <strong data-best-score>${bestScore(id)}</strong></div>
          </div>

          <div class="nx-instructions">${escapeHTML(game.description)}</div>
          <div data-game-area class="nx-board"></div>
          
          <div data-gamepad-area></div>
          
          <div class="nx-message" data-message></div>

          <div class="nx-controls">
            <button class="nx-btn" data-restart>↻ Restart</button>
          </div>
        </section>
      </div>
    `;

    root.querySelector("[data-menu]").addEventListener("click", menu);

    root.querySelector("[data-restart]").addEventListener("click", () => {
      if (token === gameToken) openGame(id);
    });

    const area = root.querySelector("[data-game-area]");
    const gamepadArea = root.querySelector("[data-gamepad-area]");
    const message = root.querySelector("[data-message]");

    function say(text) {
      if (message) message.textContent = text;
    }

    function addCleanup(fn) {
      cleanup = fn;
    }

    const context = {
      area,
      gamepadArea,
      say,
      setScore,
      bestScore,
      addCleanup,
      token
    };

    try {
      const handlers = {
        snake: playSnake,
        tictactoe: playTicTacToe,
        pong: playPong,
        brick: playBrickBreaker,
        runner: playRunner,
        shooter: playShooter,
        math: playMath,
        rps: playRPS,
        hangman: playHangman,
        flappy: playFlappy
      };

      handlers[id](context);
    } catch (error) {
      console.error("Arcade game error:", error);
      area.innerHTML = `
        <p style="text-align:center;color:#ff9eae">
          This game encountered an error. Press Restart to try again.
        </p>`;
    }
  }

  /* ==========================================================
     SHARED CANVAS & CONTROLLER HELPERS
     ========================================================== */

  function makeCanvas(area, width, height) {
    area.innerHTML = `
      <canvas class="nx-canvas"
        width="${width}" height="${height}"
        aria-label="Game play area"></canvas>
    `;

    return area.querySelector("canvas");
  }

  function renderGamepad(gamepadArea, type, config = {}) {
    if (!gamepadArea) return;
    
    let html = "";
    if (type === "dpad") {
      html = `
        <div class="nx-gamepad">
          <div class="nx-gamepad-row">
            <button class="nx-pad-btn" data-pad="up">⬆️</button>
          </div>
          <div class="nx-gamepad-row">
            <button class="nx-pad-btn" data-pad="left">⬅️</button>
            <button class="nx-pad-btn" data-pad="down">⬇️</button>
            <button class="nx-pad-btn" data-pad="right">➡️</button>
          </div>
        </div>
      `;
    } else if (type === "paddle-vertical") {
      html = `
        <div class="nx-gamepad">
          <div class="nx-gamepad-row">
            <button class="nx-pad-btn nx-pad-wide" data-pad="up">⬆️ UP</button>
            <button class="nx-pad-btn nx-pad-wide" data-pad="down">⬇️ DOWN</button>
          </div>
        </div>
      `;
    } else if (type === "paddle-horizontal") {
      html = `
        <div class="nx-gamepad">
          <div class="nx-gamepad-row">
            <button class="nx-pad-btn nx-pad-wide" data-pad="left">⬅️ LEFT</button>
            <button class="nx-pad-btn nx-pad-wide" data-pad="right">➡️ RIGHT</button>
          </div>
        </div>
      `;
    } else if (type === "action-single") {
      html = `
        <div class="nx-gamepad">
          <div class="nx-gamepad-row">
            <button class="nx-pad-btn nx-pad-wide" data-pad="action">${config.label || "ACTION"}</button>
          </div>
        </div>
      `;
    } else if (type === "shooter") {
      html = `
        <div class="nx-gamepad">
          <div class="nx-gamepad-row">
            <button class="nx-pad-btn" data-pad="left">⬅️</button>
            <button class="nx-pad-btn nx-pad-wide" data-pad="action">🚀 FIRE</button>
            <button class="nx-pad-btn" data-pad="right">➡️</button>
          </div>
        </div>
      `;
    } else {
      html = `
        <div class="nx-gamepad">
          <p class="nx-pad-info">${config.info || "TAP THE GAME BOARD TO PLAY"}</p>
        </div>
      `;
    }

    gamepadArea.innerHTML = html;
  }

  function bindPadButton(gamepadArea, key, callbackStart, callbackEnd) {
    const btn = gamepadArea.querySelector(`[data-pad="${key}"]`);
    if (!btn) return () => {};

    const handleStart = e => {
      e.preventDefault();
      btn.classList.add("nx-active");
      if (typeof callbackStart === "function") callbackStart();
    };

    const handleEnd = e => {
      e.preventDefault();
      btn.classList.remove("nx-active");
      if (typeof callbackEnd === "function") callbackEnd();
    };

    btn.addEventListener("pointerdown", handleStart);
    btn.addEventListener("pointerup", handleEnd);
    btn.addEventListener("pointerleave", handleEnd);
    btn.addEventListener("pointercancel", handleEnd);

    return () => {
      btn.removeEventListener("pointerdown", handleStart);
      btn.removeEventListener("pointerup", handleEnd);
      btn.removeEventListener("pointerleave", handleEnd);
      btn.removeEventListener("pointercancel", handleEnd);
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /* ==========================================================
     1. SNAKE
     ========================================================== */

  function playSnake(ctx) {
    const { area, gamepadArea, say, setScore, addCleanup } = ctx;
    const size = 20;
    const canvas = makeCanvas(area, 400, 400);
    const c = canvas.getContext("2d");

    let snake, food, direction, nextDirection, score, timer, dead;
    let lastTouch = null;

    renderGamepad(gamepadArea, "dpad");

    function reset() {
      clearInterval(timer);
      snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ];
      direction = { x: 1, y: 0 };
      nextDirection = direction;
      score = 0;
      dead = false;
      setScore(0);
      say("Use directional controls or gamepad.");

      spawnFood();
      draw();
      timer = setInterval(step, 120);
    }

    function spawnFood() {
      do {
        food = { x: randomInt(0, 19), y: randomInt(0, 19) };
      } while (snake.some(part => part.x === food.x && part.y === food.y));
    }

    function setDirection(x, y) {
      if (x === -direction.x && y === -direction.y) return;
      nextDirection = { x, y };
    }

    function step() {
      if (dead) return;

      direction = nextDirection;

      const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
      };

      const eating = head.x === food.x && head.y === food.y;

      if (
        head.x < 0 || head.y < 0 ||
        head.x >= 20 || head.y >= 20 ||
        snake.slice(0, eating ? snake.length : -1)
          .some(part => part.x === head.x && part.y === head.y)
      ) {
        dead = true;
        clearInterval(timer);
        say("Game over! Score: " + score + ". Press Restart.");
        return;
      }

      snake.unshift(head);

      if (eating) {
        score += 10;
        setScore(score);
        spawnFood();
      } else {
        snake.pop();
      }

      draw();
    }

    function draw() {
      c.fillStyle = "#030813";
      c.fillRect(0, 0, 400, 400);

      c.strokeStyle = "#101d32";
      for (let i = 0; i <= 20; i++) {
        c.beginPath();
        c.moveTo(i * size, 0);
        c.lineTo(i * size, 400);
        c.stroke();

        c.beginPath();
        c.moveTo(0, i * size);
        c.lineTo(400, i * size);
        c.stroke();
      }

      c.fillStyle = "#ff6384";
      c.beginPath();
      c.arc(food.x * size + 10, food.y * size + 10, 7, 0, Math.PI * 2);
      c.fill();

      snake.forEach((part, index) => {
        c.fillStyle = index === 0 ? "#b6ff8c" : "#37d6a4";
        c.fillRect(part.x * size + 2, part.y * size + 2, 16, 16);
      });
    }

    const keyHandler = event => {
      const map = {
        ArrowUp: [0, -1],
        w: [0, -1],
        ArrowDown: [0, 1],
        s: [0, 1],
        ArrowLeft: [-1, 0],
        a: [-1, 0],
        ArrowRight: [1, 0],
        d: [1, 0]
      };

      if (map[event.key]) {
        event.preventDefault();
        setDirection(...map[event.key]);
      }
    };

    document.addEventListener("keydown", keyHandler);

    const cleanupUp = bindPadButton(gamepadArea, "up", () => setDirection(0, -1));
    const cleanupDown = bindPadButton(gamepadArea, "down", () => setDirection(0, 1));
    const cleanupLeft = bindPadButton(gamepadArea, "left", () => setDirection(-1, 0));
    const cleanupRight = bindPadButton(gamepadArea, "right", () => setDirection(1, 0));

    const touchStart = event => {
      const touch = event.changedTouches[0];
      lastTouch = { x: touch.clientX, y: touch.clientY };
    };

    const touchEnd = event => {
      if (!lastTouch) return;

      const touch = event.changedTouches[0];
      const dx = touch.clientX - lastTouch.x;
      const dy = touch.clientY - lastTouch.y;

      if (Math.max(Math.abs(dx), Math.abs(dy)) > 20) {
        if (Math.abs(dx) > Math.abs(dy)) {
          setDirection(dx > 0 ? 1 : -1, 0);
        } else {
          setDirection(0, dy > 0 ? 1 : -1);
        }
      }

      lastTouch = null;
    };

    canvas.addEventListener("touchstart", touchStart, { passive: true });
    canvas.addEventListener("touchend", touchEnd, { passive: true });

    addCleanup(() => {
      clearInterval(timer);
      document.removeEventListener("keydown", keyHandler);
      canvas.removeEventListener("touchstart", touchStart);
      canvas.removeEventListener("touchend", touchEnd);
      cleanupUp();
      cleanupDown();
      cleanupLeft();
      cleanupRight();
    });

    reset();
  }

  /* ==========================================================
     2. TIC-TAC-TOE
     ========================================================== */

  function playTicTacToe(ctx) {
    const { area, gamepadArea, say, setScore, addCleanup } = ctx;

    let board, finished, busy, roundScore;

    renderGamepad(gamepadArea, "info", { info: "MAKE YOUR MOVE ON THE GRID" });

    function reset() {
      board = Array(9).fill("");
      finished = false;
      busy = false;
      roundScore = 0;
      setScore(0);

      area.innerHTML = `
        <p style="text-align:center">You are <strong style="color:#37b6ff">X</strong>.
        The computer is O.</p>
        <div class="nx-tic-grid">
          ${board.map((_, i) => `
            <button class="nx-tic-cell" data-cell="${i}"></button>
          `).join("")}
        </div>
      `;

      area.querySelectorAll("[data-cell]").forEach(button => {
        button.addEventListener("click", () => playerMove(Number(button.dataset.cell)));
      });

      say("Make your move.");
    }

    const wins = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    function winner(b) {
      for (const line of wins) {
        const [a, m, z] = line;
        if (b[a] && b[a] === b[m] && b[a] === b[z]) {
          return b[a];
        }
      }
      return b.every(Boolean) ? "draw" : "";
    }

    function paint() {
      area.querySelectorAll("[data-cell]").forEach(button => {
        const i = Number(button.dataset.cell);
        button.textContent = board[i];
        button.disabled = !!board[i] || finished || busy;
        button.style.color = board[i] === "X" ? "#37b6ff" : "#ff9bca";
      });
    }

    function endRound(result) {
      finished = true;

      if (result === "X") {
        roundScore += 10;
        setScore(roundScore);
        say("You win! +10 points. Press Restart for another round.");
      } else if (result === "O") {
        say("The computer wins. Press Restart to try again.");
      } else {
        say("It's a draw! Press Restart to play again.");
      }

      paint();
    }

    function playerMove(index) {
      if (finished || busy || board[index]) return;

      board[index] = "X";
      paint();

      const result = winner(board);
      if (result) return endRound(result);

      busy = true;
      paint();

      setTimeout(() => {
        if (!area.isConnected || finished) return;

        const empty = board
          .map((value, i) => value ? -1 : i)
          .filter(i => i >= 0);

        if (!empty.length) {
          busy = false;
          return endRound("draw");
        }

        let move = findWinningMove("O");

        if (move < 0) move = findWinningMove("X");
        if (move < 0 && !board[4]) move = 4;

        if (move < 0) {
          const corners = [0, 2, 6, 8].filter(i => !board[i]);
          if (corners.length) move = corners[randomInt(0, corners.length - 1)];
        }

        if (move < 0) move = empty[randomInt(0, empty.length - 1)];

        board[move] = "O";
        busy = false;
        paint();

        const outcome = winner(board);
        if (outcome) endRound(outcome);
      }, 280);
    }

    function findWinningMove(symbol) {
      for (let i = 0; i < 9; i++) {
        if (board[i]) continue;
        board[i] = symbol;
        const result = winner(board);
        board[i] = "";
        if (result === symbol) return i;
      }
      return -1;
    }

    reset();
    addCleanup(() => {});
  }

  /* ==========================================================
     3. PONG
     ========================================================== */

  function playPong(ctx) {
    const { area, gamepadArea, say, setScore, addCleanup } = ctx;
    const canvas = makeCanvas(area, 600, 380);
    const c = canvas.getContext("2d");

    let playerY, cpuY, ballX, ballY, vx, vy, score, raf, running;
    const keys = new Set();

    renderGamepad(gamepadArea, "paddle-vertical");

    function reset() {
      score = 0;
      playerY = cpuY = 150;
      ballX = 300;
      ballY = 190;
      vx = 4;
      vy = Math.random() * 4 - 2;
      running = true;
      setScore(0);
      say("Move with ↑/↓, W/S, or gamepad. First to 5 wins.");
    }

    function draw() {
      c.fillStyle = "#030813";
      c.fillRect(0, 0, 600, 380);

      c.setLineDash([8, 9]);
      c.strokeStyle = "#29415e";
      c.beginPath();
      c.moveTo(300, 0);
      c.lineTo(300, 380);
      c.stroke();
      c.setLineDash([]);

      c.fillStyle = "#37b6ff";
      c.fillRect(20, playerY, 12, 80);

      c.fillStyle = "#a78bfa";
      c.fillRect(568, cpuY, 12, 80);

      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(ballX, ballY, 8, 0, Math.PI * 2);
      c.fill();

      c.font = "28px system-ui";
      c.textAlign = "center";
      c.fillText(score, 250, 40);
      c.fillText("CPU", 350, 40);
    }

    function frame() {
      if (!running) return;

      if (keys.has("ArrowUp") || keys.has("w")) playerY -= 6;
      if (keys.has("ArrowDown") || keys.has("s")) playerY += 6;

      playerY = clamp(playerY, 0, 300);
      cpuY = clamp(cpuY + (ballY - 40 - cpuY) * 0.055, 0, 300);

      ballX += vx;
      ballY += vy;

      if (ballY < 8 || ballY > 372) vy *= -1;

      if (
        vx < 0 && ballX < 40 &&
        ballY > playerY && ballY < playerY + 80
      ) {
        vx = Math.abs(vx) + 0.2;
        vy += (ballY - (playerY + 40)) * 0.08;
      }

      if (
        vx > 0 && ballX > 560 &&
        ballY > cpuY && ballY < cpuY + 80
      ) {
        vx = -Math.abs(vx) - 0.15;
        vy += (ballY - (cpuY + 40)) * 0.06;
      }

      if (ballX < 0) {
        running = false;
        say("CPU scores. Press Restart to try again.");
      }

      if (ballX > 600) {
        score++;
        setScore(score);

        if (score >= 5) {
          running = false;
          say("You win! Press Restart for another match.");
        } else {
          ballX = 300;
          ballY = 190;
          vx = -4;
          vy = Math.random() * 4 - 2;
        }
      }

      draw();

      if (running) raf = requestAnimationFrame(frame);
    }

    function movePlayer(event) {
      if (event.key.startsWith("Arrow")) event.preventDefault();
      keys.add(event.key);
    }

    function stopPlayer(event) {
      keys.delete(event.key);
    }

    document.addEventListener("keydown", movePlayer);
    document.addEventListener("keyup", stopPlayer);

    let moveIntervalUp = null;
    let moveIntervalDown = null;

    const cleanupUp = bindPadButton(gamepadArea, "up", () => {
      clearInterval(moveIntervalUp);
      moveIntervalUp = setInterval(() => {
        playerY = clamp(playerY - 7, 0, 300);
      }, 25);
    }, () => {
      clearInterval(moveIntervalUp);
      moveIntervalUp = null;
    });

    const cleanupDown = bindPadButton(gamepadArea, "down", () => {
      clearInterval(moveIntervalDown);
      moveIntervalDown = setInterval(() => {
        playerY = clamp(playerY + 7, 0, 300);
      }, 25);
    }, () => {
      clearInterval(moveIntervalDown);
      moveIntervalDown = null;
    });

    addCleanup(() => {
      running = false;
      cancelAnimationFrame(raf);
      clearInterval(moveIntervalUp);
      clearInterval(moveIntervalDown);
      document.removeEventListener("keydown", movePlayer);
      document.removeEventListener("keyup", stopPlayer);
      cleanupUp();
      cleanupDown();
    });

    reset();
    frame();
  }

  /* ==========================================================
     4. BRICK BREAKER
     ========================================================== */

  function playBrickBreaker(ctx) {
    const { area, gamepadArea, say, setScore, addCleanup } = ctx;
    const canvas = makeCanvas(area, 600, 420);
    const c = canvas.getContext("2d");

    let paddleX, ballX, ballY, vx, vy, bricks, score, lives, raf, running;
    let pointerX = null;
    const keys = new Set();

    renderGamepad(gamepadArea, "paddle-horizontal");

    function reset() {
      paddleX = 250;
      ballX = 300;
      ballY = 350;
      vx = 3;
      vy = -4;
      score = 0;
      lives = 3;
      running = true;
      bricks = [];

      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 9; col++) {
          bricks.push({
            x: 18 + col * 63,
            y: 35 + row * 25,
            w: 55,
            h: 16,
            alive: true
          });
        }
      }

      setScore(0);
      say("Move the paddle with mouse, touch, gamepad, or ← → keys.");
    }

    function draw() {
      c.fillStyle = "#030813";
      c.fillRect(0, 0, 600, 420);

      const colors = ["#37b6ff", "#a78bfa", "#ff7cc8", "#45e5b0", "#ffc857"];

      bricks.forEach((brick, i) => {
        if (!brick.alive) return;
        c.fillStyle = colors[Math.floor(i / 9) % colors.length];
        c.fillRect(brick.x, brick.y, brick.w, brick.h);
      });

      c.fillStyle = "#ffffff";
      c.fillRect(paddleX, 390, 100, 10);

      c.beginPath();
      c.arc(ballX, ballY, 7, 0, Math.PI * 2);
      c.fill();

      c.font = "16px system-ui";
      c.fillText("Lives: " + lives, 15, 410);
    }

    function frame() {
      if (!running) return;

      if (pointerX !== null) {
        paddleX = pointerX - 50;
      } else {
        if (keys.has("ArrowLeft") || keys.has("a")) paddleX -= 7;
        if (keys.has("ArrowRight") || keys.has("d")) paddleX += 7;
      }

      paddleX = clamp(paddleX, 0, 500);

      ballX += vx;
      ballY += vy;

      if (ballX < 7 || ballX > 593) vx *= -1;
      if (ballY < 7) vy *= -1;

      if (
        vy > 0 && ballY >= 382 &&
        ballX >= paddleX && ballX <= paddleX + 100
      ) {
        vy = -Math.abs(vy);
        vx = clamp((ballX - (paddleX + 50)) * 0.12, -6, 6);
        if (Math.abs(vx) < 1) vx = vx < 0 ? -1 : 1;
      }

      for (const brick of bricks) {
        if (
          brick.alive &&
          ballX >= brick.x && ballX <= brick.x + brick.w &&
          ballY >= brick.y && ballY <= brick.y + brick.h
        ) {
          brick.alive = false;
          vy *= -1;
          score += 10;
          setScore(score);
          break;
        }
      }

      if (ballY > 420) {
        lives--;
        if (lives <= 0) {
          running = false;
          say("Game over! Final score: " + score);
        } else {
          ballX = 300;
          ballY = 350;
          vx = 3;
          vy = -4;
        }
      }

      if (bricks.every(brick => !brick.alive)) {
        running = false;
        say("Amazing! You cleared every brick!");
      }

      draw();
      if (running) raf = requestAnimationFrame(frame);
    }

    const keydown = event => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") event.preventDefault();
      keys.add(event.key);
      pointerX = null;
    };

    const keyup = event => keys.delete(event.key);

    const pointer = event => {
      const rect = canvas.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) * 600 / rect.width;
    };

    canvas.addEventListener("pointermove", pointer);
    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);

    let moveIntervalLeft = null;
    let moveIntervalRight = null;

    const cleanupLeft = bindPadButton(gamepadArea, "left", () => {
      pointerX = null;
      clearInterval(moveIntervalLeft);
      moveIntervalLeft = setInterval(() => {
        paddleX = clamp(paddleX - 8, 0, 500);
      }, 25);
    }, () => {
      clearInterval(moveIntervalLeft);
      moveIntervalLeft = null;
    });

    const cleanupRight = bindPadButton(gamepadArea, "right", () => {
      pointerX = null;
      clearInterval(moveIntervalRight);
      moveIntervalRight = setInterval(() => {
        paddleX = clamp(paddleX + 8, 0, 500);
      }, 25);
    }, () => {
      clearInterval(moveIntervalRight);
      moveIntervalRight = null;
    });

    addCleanup(() => {
      running = false;
      cancelAnimationFrame(raf);
      clearInterval(moveIntervalLeft);
      clearInterval(moveIntervalRight);
      canvas.removeEventListener("pointermove", pointer);
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
      cleanupLeft();
      cleanupRight();
    });

    reset();
    frame();
  }

  /* ==========================================================
     5. ENDLESS RUNNER
     ========================================================== */

  function playRunner(ctx) {
    const { area, gamepadArea, say, setScore, addCleanup } = ctx;
    const canvas = makeCanvas(area, 600, 320);
    const c = canvas.getContext("2d");

    let playerY, velocity, obstacles, score, speed, raf, running, grounded;
    let lastTime = 0;

    renderGamepad(gamepadArea, "action-single", { label: "⬆ JUMP" });

    function reset() {
      playerY = 230;
      velocity = 0;
      grounded = true;
      obstacles = [];
      score = 0;
      speed = 4;
      running = true;
      lastTime = 0;
      setScore(0);
      say("Tap Jump or use gamepad/space to avoid obstacles.");
    }

    function jump() {
      if (!running) return;
      if (grounded) {
        velocity = -11;
        grounded = false;
      }
    }

    function draw() {
      c.fillStyle = "#030813";
      c.fillRect(0, 0, 600, 320);

      c.fillStyle = "#10243e";
      c.fillRect(0, 265, 600, 55);

      c.strokeStyle = "#37b6ff";
      c.beginPath();
      c.moveTo(0, 265);
      c.lineTo(600, 265);
      c.stroke();

      c.fillStyle = "#37b6ff";
      c.fillRect(65, playerY, 30, 35);

      c.fillStyle = "#ff6384";
      obstacles.forEach(obstacle => {
        c.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
      });

      c.fillStyle = "#ffffff";
      c.font = "17px system-ui";
      c.fillText("Score: " + score, 15, 25);
    }

    function frame(time) {
      if (!running) return;

      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      velocity += 0.55 * dt;
      playerY += velocity * dt;

      if (playerY >= 230) {
        playerY = 230;
        velocity = 0;
        grounded = true;
      }

      if (Math.random() < 0.018 * dt) {
        obstacles.push({
          x: 610,
          y: 230 + randomInt(0, 15),
          w: randomInt(20, 32),
          h: randomInt(25, 35)
        });
      }

      obstacles.forEach(obstacle => obstacle.x -= speed * dt);
      obstacles = obstacles.filter(obstacle => obstacle.x > -50);

      for (const obstacle of obstacles) {
        if (
          65 + 30 > obstacle.x &&
          65 < obstacle.x + obstacle.w &&
          playerY + 35 > obstacle.y &&
          playerY < obstacle.y + obstacle.h
        ) {
          running = false;
          say("Game over! Score: " + score + ". Press Restart.");
          draw();
          return;
        }
      }

      score += Math.floor(dt);
      speed = Math.min(9, 4 + score / 400);
      setScore(score);
      draw();
      raf = requestAnimationFrame(frame);
    }

    const keydown = event => {
      if (event.code === "Space" || event.key === "ArrowUp") {
        event.preventDefault();
        jump();
      }
    };

    document.addEventListener("keydown", keydown);
    canvas.addEventListener("pointerdown", jump);

    const cleanupAction = bindPadButton(gamepadArea, "action", jump);

    addCleanup(() => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", keydown);
      canvas.removeEventListener("pointerdown", jump);
      cleanupAction();
    });

    reset();
    raf = requestAnimationFrame(frame);
  }

  /* ==========================================================
     6. SPACE SHOOTER
     ========================================================== */

  function playShooter(ctx) {
    const { area, gamepadArea, say, setScore, addCleanup } = ctx;
    const canvas = makeCanvas(area, 600, 420);
    const c = canvas.getContext("2d");

    let player, bullets, enemies, score, raf, running, lastSpawn;
    const keys = new Set();
    let lastTime = 0;
    let lastShot = 0;

    renderGamepad(gamepadArea, "shooter");

    function reset() {
      player = { x: 300, y: 370 };
      bullets = [];
      enemies = [];
      score = 0;
      running = true;
      lastSpawn = 0;
      lastTime = 0;
      lastShot = 0;
      setScore(0);
      say("Move with ← → or gamepad. Tap FIRE to shoot.");
    }

    function shoot() {
      if (!running) return;
      const now = performance.now();
      if (now - lastShot < 170) return;
      lastShot = now;
      bullets.push({ x: player.x, y: player.y - 15 });
    }

    function draw() {
      c.fillStyle = "#030813";
      c.fillRect(0, 0, 600, 420);

      for (let i = 0; i < 50; i++) {
        const x = (i * 97) % 600;
        const y = (i * 67) % 420;
        c.fillStyle = "#243b5c";
        c.fillRect(x, y, 2, 2);
      }

      c.fillStyle = "#37b6ff";
      c.beginPath();
      c.moveTo(player.x, player.y - 17);
      c.lineTo(player.x - 14, player.y + 12);
      c.lineTo(player.x + 14, player.y + 12);
      c.closePath();
      c.fill();

      c.fillStyle = "#b6ff8c";
      bullets.forEach(b => c.fillRect(b.x - 2, b.y - 7, 4, 12));

      c.fillStyle = "#ff6384";
      enemies.forEach(e => {
        c.beginPath();
        c.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        c.fill();
      });

      c.fillStyle = "#fff";
      c.font = "16px system-ui";
      c.fillText("Score: " + score, 12, 24);
    }

    function frame(time) {
      if (!running) return;

      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      if (keys.has("ArrowLeft") || keys.has("a")) player.x -= 5 * dt;
      if (keys.has("ArrowRight") || keys.has("d")) player.x += 5 * dt;

      player.x = clamp(player.x, 18, 582);

      if (time - lastSpawn > Math.max(300, 950 - score * 3)) {
        enemies.push({
          x: randomInt(20, 580),
          y: -15,
          r: randomInt(10, 16),
          speed: 1.6 + Math.random() * 1.5 + score / 250
        });
        lastSpawn = time;
      }

      bullets.forEach(b => b.y -= 7 * dt);
      enemies.forEach(e => e.y += e.speed * dt);

      for (const bullet of bullets) {
        for (const enemy of enemies) {
          if (
            !enemy.dead &&
            Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y) <
              enemy.r + 5
          ) {
            enemy.dead = true;
            bullet.dead = true;
            score += 10;
            setScore(score);
          }
        }
      }

      bullets = bullets.filter(b => !b.dead && b.y > -15);
      enemies = enemies.filter(e => !e.dead && e.y < 450);

      if (enemies.some(e => Math.hypot(e.x - player.x, e.y - player.y) < e.r + 12)) {
        running = false;
        say("Your ship was hit! Score: " + score);
        draw();
        return;
      }

      draw();
      raf = requestAnimationFrame(frame);
    }

    const keydown = event => {
      keys.add(event.key);
      if (event.code === "Space") {
        event.preventDefault();
        shoot();
      }
    };

    const keyup = event => keys.delete(event.key);

    const pointermove = event => {
      if (event.pointerType === "mouse" && event.buttons === 0) return;
      const rect = canvas.getBoundingClientRect();
      player.x = clamp((event.clientX - rect.left) * 600 / rect.width, 18, 582);
    };

    document.addEventListener("keydown", keydown);
    document.addEventListener("keyup", keyup);
    canvas.addEventListener("pointermove", pointermove);

    let moveIntervalLeft = null;
    let moveIntervalRight = null;

    const cleanupLeft = bindPadButton(gamepadArea, "left", () => {
      clearInterval(moveIntervalLeft);
      moveIntervalLeft = setInterval(() => {
        player.x = clamp(player.x - 8, 18, 582);
      }, 25);
    }, () => {
      clearInterval(moveIntervalLeft);
      moveIntervalLeft = null;
    });

    const cleanupRight = bindPadButton(gamepadArea, "right", () => {
      clearInterval(moveIntervalRight);
      moveIntervalRight = setInterval(() => {
        player.x = clamp(player.x + 8, 18, 582);
      }, 25);
    }, () => {
      clearInterval(moveIntervalRight);
      moveIntervalRight = null;
    });

    const cleanupAction = bindPadButton(gamepadArea, "action", shoot);

    addCleanup(() => {
      running = false;
      cancelAnimationFrame(raf);
      clearInterval(moveIntervalLeft);
      clearInterval(moveIntervalRight);
      document.removeEventListener("keydown", keydown);
      document.removeEventListener("keyup", keyup);
      canvas.removeEventListener("pointermove", pointermove);
      cleanupLeft();
      cleanupRight();
      cleanupAction();
    });

    reset();
    raf = requestAnimationFrame(frame);
  }

  /* ==========================================================
     7. MATH CHALLENGE
     ========================================================== */

  function playMath(ctx) {
    const { area, gamepadArea, say, setScore, addCleanup } = ctx;

    let score = 0;
    let timeLeft = 30;
    let a, b, answer, interval, ended = false;

    renderGamepad(gamepadArea, "info", { info: "SOLVE AS MANY SUMS AS YOU CAN" });

    function question() {
      const operation = randomInt(0, 2);

      if (operation === 0) {
        a = randomInt(1, 30);
        b = randomInt(1, 30);
        answer = a + b;
      } else if (operation === 1) {
        a = randomInt(10, 40);
        b = randomInt(1, a);
        answer = a - b;
      } else {
        a = randomInt(2, 12);
        b = randomInt(2, 10);
        answer = a * b;
      }

      const symbols = operation === 0 ? "+" : operation === 1 ? "−" : "×";
      const qEl = area.querySelector("[data-question]");
      const ansEl = area.querySelector("[data-answer]");
      if (qEl) qEl.textContent = `${a} ${symbols} ${b} = ?`;
      if (ansEl) {
        ansEl.value = "";
        ansEl.focus();
      }
    }

    function render() {
      area.innerHTML = `
        <div style="max-width:420px;margin:auto;text-align:center">
          <div class="nx-game-stats">
            <div class="nx-pill">Time: <strong data-time>30</strong>s</div>
            <div class="nx-pill">Correct: <strong data-correct>0</strong></div>
          </div>
          <h2 data-question style="font-size:38px;margin:30px 0"></h2>
          <form data-form>
            <input class="nx-answer" data-answer type="number"
              inputmode="numeric" autocomplete="off"
              placeholder="Your answer" required>
            <button class="nx-btn nx-primary nx-wide" style="margin-top:12px">
              SUBMIT ANSWER
            </button>
          </form>
        </div>
      `;

      area.querySelector("[data-form]").addEventListener("submit", event => {
        event.preventDefault();
        if (ended) return;

        const input = area.querySelector("[data-answer]");
        if (!input || input.value.trim() === "") return;

        if (Number(input.value) === answer) {
          score += 10;
          setScore(score);
          const cEl = area.querySelector("[data-correct]");
          if (cEl) cEl.textContent = score / 10;
          say("Correct! +10 points.");
        } else {
          say("Not quite! The correct answer was " + answer + ".");
        }

        question();
      });

      question();
    }

    function finish() {
      ended = true;
      clearInterval(interval);

      area.innerHTML = `
        <div style="text-align:center;padding:25px">
          <div style="font-size:50px">🧠</div>
          <h2>Time's up!</h2>
          <p>You earned <strong>${score}</strong> points.</p>
          <p>Press Restart to try again.</p>
        </div>
      `;

      say("Challenge completed.");
    }

    render();
    setScore(0);
    say("You have 30 seconds. Each correct answer earns 10 points.");

    interval = setInterval(() => {
      if (ended) return;

      timeLeft--;

      const timeEl = area.querySelector("[data-time]");
      if (timeEl) timeEl.textContent = timeLeft;

      if (timeLeft <= 0) finish();
    }, 1000);

    addCleanup(() => clearInterval(interval));
  }

  /* ==========================================================
     8. ROCK PAPER SCISSORS
     ========================================================== */

  function playRPS(ctx) {
    const { area, gamepadArea, say, setScore, addCleanup } = ctx;

    let score = 0;
    let round = 0;
    let ended = false;

    renderGamepad(gamepadArea, "info", { info: "TAP A CHOICE BUTTON ABOVE TO PLAY" });

    const choices = [
      { id: "rock", name: "Rock", icon: "✊" },
      { id: "paper", name: "Paper", icon: "✋" },
      { id: "scissors", name: "Scissors", icon: "✌️" }
    ];

    function reset() {
      score = 0;
      round = 0;
      ended = false;
      setScore(0);

      area.innerHTML = `
        <div style="max-width:520px;margin:auto;text-align:center">
          <p>Play 10 rounds. Each win earns 10 points.</p>
          <div class="nx-pill">Round: <strong data-round>0</strong> / 10</div>

          <div class="nx-choice-grid">
            ${choices.map(choice => `
              <button class="nx-choice" data-choice="${choice.id}">
                ${choice.icon}<span>${choice.name}</span>
              </button>
            `).join("")}
          </div>

          <div class="nx-message" data-result></div>
          <p data-record></p>
        </div>
      `;

      area.querySelectorAll("[data-choice]").forEach(button => {
        button.addEventListener("click", () => play(button.dataset.choice));
      });

      say("Choose rock, paper, or scissors.");
    }

    function play(userChoice) {
      if (ended) return;

      const computerChoice = choices[randomInt(0, 2)].id;
      round++;

      let result;

      if (userChoice === computerChoice) {
        result = "Draw!";
      } else if (
        (userChoice === "rock" && computerChoice === "scissors") ||
        (userChoice === "paper" && computerChoice === "rock") ||
        (userChoice === "scissors" && computerChoice === "paper")
      ) {
        result = "You win this round! +10 points.";
        score += 10;
        setScore(score);
      } else {
        result = "Computer wins this round.";
      }

      const names = Object.fromEntries(choices.map(c => [c.id, c.name]));

      const resEl = area.querySelector("[data-result]");
      const rndEl = area.querySelector("[data-round]");
      const recEl = area.querySelector("[data-record]");

      if (resEl) resEl.textContent = `You: ${names[userChoice]} • Computer: ${names[computerChoice]} — ${result}`;
      if (rndEl) rndEl.textContent = round;

      if (round >= 10) {
        ended = true;
        area.querySelectorAll("[data-choice]").forEach(button => {
          button.disabled = true;
        });

        if (recEl) recEl.textContent = `Game finished! Your score: ${score}. Press Restart to play again.`;
        say("Match complete.");
      }
    }

    reset();
    addCleanup(() => {});
  }

  /* ==========================================================
     9. HANGMAN
     ========================================================== */

  function playHangman(ctx) {
    const { area, gamepadArea, say, setScore, addCleanup } = ctx;

    renderGamepad(gamepadArea, "info", { info: "TAP LETTERS BELOW TO GUESS THE WORD" });

    const words = [
      "JAVASCRIPT", "COMPUTER", "GALAXY", "KEYBOARD",
      "PROGRAM", "NETWORK", "ROBOT", "PLANET",
      "BROWSER", "PUZZLE", "ARCADE", "RAINBOW",
      "MONITOR", "PIXEL", "GAMING", "NEXORA"
    ];

    let word, guessed, mistakes, score, finished;

    function reset() {
      word = words[randomInt(0, words.length - 1)];
      guessed = [];
      mistakes = 0;
      score = 0;
      finished = false;
      setScore(0);
      render();
      say("Guess the hidden word. You have 6 incorrect guesses.");
    }

    function render() {
      const display = [...word]
        .map(letter => guessed.includes(letter) ? letter : "_")
        .join(" ");

      area.innerHTML = `
        <div style="max-width:600px;margin:auto;text-align:center">
          <div style="font-size:52px">${["🙂","😐","😕","😟","😣","😵","💀"][mistakes]}</div>
          <div class="nx-game-stats">
            <div class="nx-pill">Mistakes: <strong>${mistakes}</strong>/6</div>
            <div class="nx-pill">Letters found: <strong>${guessed.length}</strong></div>
          </div>
          <div class="nx-word">${display}</div>
          <div class="nx-letter-grid">
            ${"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => `
              <button class="nx-letter" data-letter="${letter}"
                ${guessed.includes(letter) || finished ? "disabled" : ""}>
                ${letter}
              </button>
            `).join("")}
          </div>
          <p style="color:#9eabc5">Category: Everyday words and technology</p>
        </div>
      `;

      area.querySelectorAll("[data-letter]").forEach(button => {
        button.addEventListener("click", () => guess(button.dataset.letter));
      });
    }

    function guess(letter) {
      if (finished || guessed.includes(letter)) return;

      guessed.push(letter);

      if (word.includes(letter)) {
        score += 5;
        setScore(score);
      } else {
        mistakes++;
      }

      const won = [...word].every(char => guessed.includes(char));

      if (won) {
        finished = true;
        score += 20;
        setScore(score);
        say("You guessed the word! +20 bonus points.");
      } else if (mistakes >= 6) {
        finished = true;
        say("Game over! The word was " + word + ".");
      } else if (word.includes(letter)) {
        say("Correct letter!");
      } else {
        say("Wrong letter. Try another.");
      }

      render();

      if (finished) {
        area.insertAdjacentHTML("beforeend", `
          <div style="text-align:center;margin:15px">
            <p>The word was <strong>${word}</strong>.</p>
            <button class="nx-btn nx-primary" data-next-word>New Word</button>
          </div>
        `);

        const nextBtn = area.querySelector("[data-next-word]");
        if (nextBtn) nextBtn.addEventListener("click", reset);
      }
    }

    const keyHandler = event => {
      if (/^[a-z]$/i.test(event.key)) guess(event.key.toUpperCase());
    };

    document.addEventListener("keydown", keyHandler);

    addCleanup(() => document.removeEventListener("keydown", keyHandler));

    reset();
  }

  /* ==========================================================
     10. FLAPPY FLYER
     ========================================================== */

  function playFlappy(ctx) {
    const { area, gamepadArea, say, setScore, addCleanup } = ctx;
    const canvas = makeCanvas(area, 400, 560);
    const c = canvas.getContext("2d");

    let birdY, velocity, pipes, score, raf, running, passed;
    let lastTime = 0;
    const birdX = 90;
    const birdR = 12;

    renderGamepad(gamepadArea, "action-single", { label: "🐦 FLAP" });

    function reset() {
      birdY = 270;
      velocity = 0;
      pipes = [];
      score = 0;
      passed = 0;
      running = true;
      lastTime = 0;
      setScore(0);
      say("Tap Flap or use gamepad/space to fly. Avoid the pipes!");
      pipes.push(makePipe(420));
    }

    function makePipe(x) {
      const gap = 155;
      const top = randomInt(70, 330);

      return {
        x,
        top,
        bottom: top + gap,
        gap,
        passed: false
      };
    }

    function flap() {
      if (!running) return;
      velocity = -6.2;
    }

    function draw() {
      const gradient = c.createLinearGradient(0, 0, 0, 560);
      gradient.addColorStop(0, "#08152c");
      gradient.addColorStop(1, "#15314d");

      c.fillStyle = gradient;
      c.fillRect(0, 0, 400, 560);

      for (let i = 0; i < 32; i++) {
        c.fillStyle = "#ffffff";
        c.fillRect((i * 83) % 400, (i * 97) % 560, 2, 2);
      }

      pipes.forEach(pipe => {
        c.fillStyle = "#35d39a";
        c.fillRect(pipe.x, 0, 52, pipe.top);
        c.fillRect(pipe.x, pipe.bottom, 52, 560 - pipe.bottom);

        c.fillStyle = "#1c9f75";
        c.fillRect(pipe.x - 4, pipe.top - 12, 60, 12);
        c.fillRect(pipe.x - 4, pipe.bottom, 60, 12);
      });

      c.fillStyle = "#ffd166";
      c.beginPath();
      c.arc(birdX, birdY, birdR, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = "#ffffff";
      c.beginPath();
      c.arc(birdX + 4, birdY - 3, 3, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = "#07101c";
      c.beginPath();
      c.arc(birdX + 5, birdY - 3, 1.3, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = "#ff8b4a";
      c.beginPath();
      c.moveTo(birdX + 10, birdY + 1);
      c.lineTo(birdX + 20, birdY + 4);
      c.lineTo(birdX + 10, birdY + 7);
      c.closePath();
      c.fill();

      c.fillStyle = "#fff";
      c.font = "bold 24px system-ui";
      c.textAlign = "center";
      c.fillText(score, 200, 38);
    }

    function frame(time) {
      if (!running) return;

      if (!lastTime) lastTime = time;
      const dt = Math.min((time - lastTime) / 16.67, 2);
      lastTime = time;

      velocity += 0.3 * dt;
      birdY += velocity * dt;

      pipes.forEach(pipe => pipe.x -= 2.6 * dt);

      if (pipes.length && pipes[pipes.length - 1].x < 230) {
        pipes.push(makePipe(420));
      }

      pipes = pipes.filter(pipe => pipe.x > -70);

      for (const pipe of pipes) {
        const overlaps = birdX + birdR > pipe.x && birdX - birdR < pipe.x + 52;
        const hitsPipe = birdY - birdR < pipe.top || birdY + birdR > pipe.bottom;

        if (overlaps && hitsPipe) {
          running = false;
          say("You hit a pipe! Score: " + score + ". Press Restart.");
          draw();
          return;
        }

        if (!pipe.passed && pipe.x + 52 < birdX) {
          pipe.passed = true;
          score++;
          setScore(score);
        }
      }

      if (birdY - birdR < 0 || birdY + birdR > 560) {
        running = false;
        say("Game over! Score: " + score + ". Press Restart.");
        draw();
        return;
      }

      draw();
      raf = requestAnimationFrame(frame);
    }

    const keydown = event => {
      if (event.code === "Space" || event.key === "ArrowUp") {
        event.preventDefault();
        flap();
      }
    };

    document.addEventListener("keydown", keydown);
    canvas.addEventListener("pointerdown", flap);

    const cleanupAction = bindPadButton(gamepadArea, "action", flap);

    addCleanup(() => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", keydown);
      canvas.removeEventListener("pointerdown", flap);
      cleanupAction();
    });

    reset();
    raf = requestAnimationFrame(frame);
  }

  /* ==========================================================
     STARTUP
     ========================================================== */

  try {
    injectStyles();
    menu();

    const loadingMessage = document.getElementById("loading-error");
    if (loadingMessage) loadingMessage.remove();

    console.log("RexWeb Nexora Arcade loaded successfully.");
  } catch (error) {
    console.error("RexWeb Nexora Arcade failed to start:", error);

    root.innerHTML = `
      <div style="padding:20px;text-align:center;color:#ffb4c4">
        <h2>Arcade loading error</h2>
        <p>Reload the page and check that game.js is saved correctly.</p>
        <button onclick="location.reload()">Reload Arcade</button>
      </div>
    `;
  }
})();
