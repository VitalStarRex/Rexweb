/* =====================================
   RexWeb Nexora — Games Hub
   File: js/game.js
===================================== */

(() => {
  "use strict";

  const games = [
    {
      id: "tap-rush",
      title: "Tap Rush",
      icon: "⚡",
      category: "Arcade",
      description: "Tap as fast as you can before time runs out.",
      badge: "QUICK PLAY"
    },
    {
      id: "number-guess",
      title: "Number Hunt",
      icon: "🔢",
      category: "Puzzle",
      description: "Find the hidden number using your clues.",
      badge: "BRAIN GAME"
    },
    {
      id: "memory-match",
      title: "Memory Match",
      icon: "🧠",
      category: "Puzzle",
      description: "Match pairs of cards and test your memory.",
      badge: "CHALLENGE"
    },
    {
      id: "rock-paper-scissors",
      title: "Rock Paper Scissors",
      icon: "✊",
      category: "Casual",
      description: "Challenge the computer in this classic game.",
      badge: "CLASSIC"
    }
  ];

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function renderGames() {
    const page = document.getElementById("page-games");

    if (!page) {
      console.warn("RexWeb Nexora: Games page was not found.");
      return;
    }

    const panel = page.querySelector(".panel");
    if (!panel) return;

    panel.innerHTML = `
      <div class="nexora-games">
        <div class="nexora-games-heading">
          <div>
            <span class="section-label">GAME ZONE</span>
            <h2>Choose your game 🎮</h2>
            <p>Play, improve your skills, and beat your best score.</p>
          </div>
        </div>

        <div class="nexora-games-tools">
          <input
            id="nexoraGameSearch"
            type="search"
            placeholder="Search games..."
            aria-label="Search games"
          >

          <select id="nexoraGameCategory" aria-label="Filter games">
            <option value="all">All categories</option>
            <option value="Arcade">Arcade</option>
            <option value="Puzzle">Puzzle</option>
            <option value="Casual">Casual</option>
          </select>
        </div>

        <div id="nexoraGameGrid" class="nexora-game-grid"></div>
        <div id="nexoraGameStage" class="nexora-game-stage" hidden></div>
      </div>
    `;

    document.getElementById("nexoraGameSearch")
      .addEventListener("input", displayGames);

    document.getElementById("nexoraGameCategory")
      .addEventListener("change", displayGames);

    displayGames();
  }

  function displayGames() {
    const grid = document.getElementById("nexoraGameGrid");
    if (!grid) return;

    const search = document.getElementById("nexoraGameSearch")
      .value.trim().toLowerCase();

    const category = document.getElementById("nexoraGameCategory").value;

    const filtered = games.filter(game => {
      const matchesSearch =
        `${game.title} ${game.description} ${game.category}`
          .toLowerCase().includes(search);

      const matchesCategory =
        category === "all" || game.category === category;

      return matchesSearch && matchesCategory;
    });

    if (!filtered.length) {
      grid.innerHTML = "<p>No games found. Try another search.</p>";
      return;
    }

    grid.innerHTML = filtered.map(game => `
      <article class="nexora-game-card">
        <div class="nexora-game-icon">${game.icon}</div>
        <span class="nexora-game-badge">${game.badge}</span>
        <h3>${escapeHTML(game.title)}</h3>
        <p>${escapeHTML(game.description)}</p>
        <div class="nexora-game-footer">
          <span>${escapeHTML(game.category)}</span>
          <button type="button" data-play-game="${game.id}">
            Play Now →
          </button>
        </div>
      </article>
    `).join("");

    grid.querySelectorAll("[data-play-game]").forEach(button => {
      button.addEventListener("click", () => {
        launchGame(button.dataset.playGame);
      });
    });
  }

  function launchGame(gameId) {
    const stage = document.getElementById("nexoraGameStage");
    if (!stage) return;

    stage.hidden = false;

    switch (gameId) {
      case "tap-rush":
        playTapRush(stage);
        break;

      case "number-guess":
        playNumberHunt(stage);
        break;

      case "rock-paper-scissors":
        playRPS(stage);
        break;

      case "memory-match":
        playMemoryMatch(stage);
        break;

      default:
        stage.innerHTML = "<p>This game is not available yet.</p>";
    }

    stage.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function gameShell(title, content) {
    return `
      <div class="nexora-game-box">
        <button type="button" data-close-game>← Back to games</button>
        <h2>${title}</h2>
        ${content}
      </div>
    `;
  }

  function attachBack(stage) {
    const button = stage.querySelector("[data-close-game]");
    if (button) {
      button.addEventListener("click", () => {
        stage.hidden = true;
        stage.innerHTML = "";
        document.getElementById("nexoraGameGrid")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function playTapRush(stage) {
    let score = 0;
    let time = 10;
    let timer = null;

    stage.innerHTML = gameShell(
      "⚡ Tap Rush",
      `
        <p>Time: <strong id="tapTime">10</strong> seconds</p>
        <p>Score: <strong id="tapScore">0</strong></p>
        <button id="tapTarget" class="nexora-tap-target">TAP ME!</button>
        <p id="tapMessage">Press Start to begin.</p>
        <button id="tapStart">Start Game</button>
      `
    );

    attachBack(stage);

    const target = stage.querySelector("#tapTarget");
    const start = stage.querySelector("#tapStart");

    target.disabled = true;

    target.addEventListener("click", () => {
      if (time <= 0) return;
      score++;
      stage.querySelector("#tapScore").textContent = score;
    });

    start.addEventListener("click", () => {
      clearInterval(timer);
      score = 0;
      time = 10;
      target.disabled = false;
      start.disabled = true;

      stage.querySelector("#tapScore").textContent = score;
      stage.querySelector("#tapTime").textContent = time;
      stage.querySelector("#tapMessage").textContent = "Tap as fast as you can!";

      timer = setInterval(() => {
        time--;
        stage.querySelector("#tapTime").textContent = time;

        if (time <= 0) {
          clearInterval(timer);
          target.disabled = true;
          start.disabled = false;
          stage.querySelector("#tapMessage").textContent =
            `Time's up! Your score is ${score}.`;
        }
      }, 1000);
    });

    stage.querySelector("[data-close-game]").addEventListener("click", () => {
      clearInterval(timer);
    });
  }

  function playNumberHunt(stage) {
    let secret = Math.floor(Math.random() * 100) + 1;
    let attempts = 0;

    stage.innerHTML = gameShell(
      "🔢 Number Hunt",
      `
        <p>Guess the hidden number between 1 and 100.</p>
        <form id="numberForm">
          <input id="numberGuess" type="number" min="1" max="100"
            required placeholder="Enter a number">
          <button type="submit">Guess</button>
        </form>
        <p id="numberMessage" aria-live="polite">Good luck!</p>
        <p>Attempts: <strong id="numberAttempts">0</strong></p>
        <button id="numberRestart">New Number</button>
      `
    );

    attachBack(stage);

    const form = stage.querySelector("#numberForm");
    const input = stage.querySelector("#numberGuess");

    form.addEventListener("submit", event => {
      event.preventDefault();
      const guess = Number(input.value);

      if (guess < 1 || guess > 100) return;

      attempts++;
      stage.querySelector("#numberAttempts").textContent = attempts;

      const message = stage.querySelector("#numberMessage");

      if (guess === secret) {
        message.textContent = `Correct! You found it in ${attempts} attempts!`;
      } else {
        message.textContent = guess < secret
          ? "Too low! Try a higher number."
          : "Too high! Try a lower number.";
      }

      input.value = "";
      input.focus();
    });

    stage.querySelector("#numberRestart").addEventListener("click", () => {
      secret = Math.floor(Math.random() * 100) + 1;
      attempts = 0;
      stage.querySelector("#numberAttempts").textContent = "0";
      stage.querySelector("#numberMessage").textContent = "New number ready!";
      input.value = "";
      input.focus();
    });
  }

  function playRPS(stage) {
    let playerScore = 0;
    let computerScore = 0;

    stage.innerHTML = gameShell(
      "✊ Rock Paper Scissors",
      `
        <p>Choose your move:</p>
        <div class="nexora-rps-buttons">
          <button data-move="rock">✊ Rock</button>
          <button data-move="paper">✋ Paper</button>
          <button data-move="scissors">✌️ Scissors</button>
        </div>
        <p id="rpsResult" aria-live="polite">Ready?</p>
        <p>You: <strong id="rpsPlayer">0</strong> · Computer:
          <strong id="rpsComputer">0</strong></p>
      `
    );

    attachBack(stage);

    const moves = ["rock", "paper", "scissors"];

    stage.querySelectorAll("[data-move]").forEach(button => {
      button.addEventListener("click", () => {
        const player = button.dataset.move;
        const computer = moves[Math.floor(Math.random() * moves.length)];

        let result = `You chose ${player}; computer chose ${computer}. `;

        if (player === computer) {
          result += "It's a draw!";
        } else if (
          (player === "rock" && computer === "scissors") ||
          (player === "paper" && computer === "rock") ||
          (player === "scissors" && computer === "paper")
        ) {
          playerScore++;
          result += "You win this round!";
        } else {
          computerScore++;
          result += "Computer wins this round!";
        }

        stage.querySelector("#rpsResult").textContent = result;
        stage.querySelector("#rpsPlayer").textContent = playerScore;
        stage.querySelector("#rpsComputer").textContent = computerScore;
      });
    });
  }

  function playMemoryMatch(stage) {
    const symbols = ["🍀", "🚀", "🎮", "⭐", "🔥", "💎"];
    let cards = [...symbols, ...symbols]
      .sort(() => Math.random() - 0.5);

    let first = null;
    let locked = false;
    let matches = 0;
    let moves = 0;

    stage.innerHTML = gameShell(
      "🧠 Memory Match",
      `
        <p>Find all matching pairs.</p>
        <p>Moves: <strong id="memoryMoves">0</strong></p>
        <div id="memoryGrid" class="nexora-memory-grid"></div>
        <p id="memoryMessage" aria-live="polite">Find your first pair!</p>
        <button id="memoryRestart">Restart</button>
      `
    );

    attachBack(stage);

    const grid = stage.querySelector("#memoryGrid");

    function render() {
      grid.innerHTML = cards.map((symbol, index) => `
        <button class="nexora-memory-card" data-card="${index}"
          aria-label="Hidden card">${symbol}</button>
      `).join("");

      grid.querySelectorAll("[data-card]").forEach(button => {
        button.dataset.revealed = "false";
        button.textContent = "❔";
        button.addEventListener("click", () => flip(button));
      });
    }

    function flip(button) {
      if (locked || button.dataset.revealed === "true") return;

      button.dataset.revealed = "true";
      button.textContent = cards[Number(button.dataset.card)];

      if (!first) {
        first = button;
        return;
      }

      moves++;
      stage.querySelector("#memoryMoves").textContent = moves;

      if (
        cards[Number(first.dataset.card)] ===
        cards[Number(button.dataset.card)]
      ) {
        matches++;
        first.disabled = true;
        button.disabled = true;
        first = null;

        if (matches === symbols.length) {
          stage.querySelector("#memoryMessage").textContent =
            `You matched every pair in ${moves} moves!`;
        }
      } else {
        locked = true;
        const previous = first;
        first = null;

        setTimeout(() => {
          if (!stage.isConnected) return;
          previous.textContent = "❔";
          button.textContent = "❔";
          previous.dataset.revealed = "false";
          button.dataset.revealed = "false";
          locked = false;
        }, 750);
      }
    }

    function reset() {
      cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5);
      first = null;
      locked = false;
      matches = 0;
      moves = 0;
      stage.querySelector("#memoryMoves").textContent = "0";
      stage.querySelector("#memoryMessage").textContent = "Find your first pair!";
      render();
    }

    stage.querySelector("#memoryRestart").addEventListener("click", reset);
    render();
  }

  function addGameStyles() {
    if (document.getElementById("nexoraGameStyles")) return;

    const style = document.createElement("style");
    style.id = "nexoraGameStyles";
    style.textContent = `
      .nexora-games { width: 100%; }
      .nexora-games-heading h2 { margin-bottom: 8px; }
      .nexora-games-tools {
        display: flex; gap: 10px; flex-wrap: wrap; margin: 22px 0;
      }
      .nexora-games-tools input,
      .nexora-games-tools select,
      .nexora-game-box input {
        min-width: 0; padding: 12px; border-radius: 12px;
        border: 1px solid var(--border, #334155);
        background: var(--surface, #111827);
        color: var(--text, #fff);
      }
      .nexora-games-tools input { flex: 1; }
      .nexora-game-grid {
        display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 16px;
      }
      .nexora-game-card {
        border: 1px solid var(--border, #334155);
        border-radius: 18px; padding: 18px;
        background: var(--surface, #111827);
      }
      .nexora-game-icon { font-size: 38px; margin-bottom: 10px; }
      .nexora-game-badge {
        font-size: 11px; letter-spacing: 1px; opacity: .75;
      }
      .nexora-game-card h3 { margin: 10px 0; }
      .nexora-game-card p { line-height: 1.6; }
      .nexora-game-footer {
        display: flex; justify-content: space-between; align-items: center;
        gap: 8px; margin-top: 18px;
      }
      .nexora-game-card button,
      .nexora-game-box button {
        cursor: pointer; border: 0; border-radius: 10px;
        padding: 10px 14px; font-weight: 700;
        background: var(--primary, #2563eb); color: white;
      }
      .nexora-game-stage { margin-top: 24px; }
      .nexora-game-box {
        padding: 18px; border-radius: 18px;
        border: 1px solid var(--border, #334155);
        background: var(--surface, #111827);
      }
      .nexora-game-box h2 { margin-top: 18px; }
      .nexora-tap-target {
        width: 150px; height: 100px; margin: 12px;
        font-size: 22px; border-radius: 18px !important;
      }
      .nexora-game-box button:disabled { opacity: .5; cursor: not-allowed; }
      .nexora-rps-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
      .nexora-memory-grid {
        display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px; max-width: 440px; margin: 18px 0;
      }
      .nexora-memory-card {
        min-height: 62px; font-size: 24px; padding: 8px !important;
      }
      @media (max-width: 480px) {
        .nexora-game-footer { align-items: flex-start; flex-direction: column; }
        .nexora-games-tools { flex-direction: column; }
      }
    `;

    document.head.appendChild(style);
  }

  function initGames() {
    addGameStyles();

    const page = document.getElementById("page-games");
    if (!page) return;

    renderGames();

    // Restore the game catalogue if another part of the app reuses this page.
    document.querySelectorAll('[data-page="games"]').forEach(link => {
      link.addEventListener("click", () => {
        setTimeout(renderGames, 0);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGames);
  } else {
    initGames();
  }
})();