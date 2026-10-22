```javascript
(() => {
'use strict';

const $ = s => document.querySelector(s);
const grid = $('#game-grid');
const screen = $('#game-screen');
const playArea = $('#play-area');
const title = $('#game-title');
const help = $('#game-help');
const difficultySelect = $('#difficulty');

if (!grid || !screen || !playArea || !title || !help || !difficultySelect) {
  console.error('Extra Arcade: Required HTML elements are missing.');
  return;
}

const GAMES = [
 {id:'parkour',name:'Cyber Parkour',icon:'⚡',type:'RUN · JUMP',glow:'#35e8ff'},
 {id:'galaxy',name:'Galaxy Defender',icon:'🚀',type:'SPACE SHOOTER',glow:'#9b6cff'},
 {id:'reflex',name:'Neon Reflex',icon:'🔮',type:'DODGE · REACT',glow:'#ff4fd8'},
 {id:'racer',name:'Street Racer',icon:'🏎️',type:'TRAFFIC RACE',glow:'#ff5577'},
 {id:'zombie',name:'Zombie Outbreak',icon:'🧟',type:'SURVIVAL',glow:'#43f5a5'},
 {id:'dragon',name:'Dragon Quest',icon:'🐉',type:'MONSTER BATTLE',glow:'#ff9f43'},
 {id:'asteroid',name:'Asteroid Rush',icon:'☄️',type:'SPACE FLIGHT',glow:'#35e8ff'},
 {id:'ninja',name:'Ninja Escape',icon:'🥷',type:'ROOFTOP RUN',glow:'#9b6cff'},
 {id:'penalty',name:'Penalty Pro',icon:'⚽',type:'SHOOTOUT',glow:'#43f5a5'},
 {id:'hover',name:'Hoverboard Rush',icon:'🛹',type:'FUTURE RUN',glow:'#ff4fd8'}
];

GAMES.forEach(g => {
 const b = document.createElement('button');
 b.type = 'button';
 b.className = 'game-card';
 b.innerHTML = `<span class="game-art" style="--glow:${g.glow}"></span><span class="game-icon">${g.icon}</span><span><span class="game-name">${g.name}</span><span class="game-type">${g.type}</span></span>`;
 b.addEventListener('click', () => openGame(g.id));
 grid.appendChild(b);
});

let active = null;
let cleanupFn = null;
let difficulty = 'Medium';
let score = 0;
let lives = 3;
let timeLeft = 60;
let raf = 0;
let timer = 0;

const factors = {Easy:.72, Medium:1, Hard:1.3, Hardest:1.65};

function clean() {
 cancelAnimationFrame(raf);
 clearInterval(timer);
 if (cleanupFn) {
  try { cleanupFn(); } catch (e) { console.warn(e); }
 }
 cleanupFn = null;
 playArea.replaceChildren();
}

function openGame(id) {
 clean();
 active = id;
 const g = GAMES.find(x => x.id === id);
 if (!g) return;
 title.textContent = g.name;
 screen.classList.add('open');
 document.body.style.overflow = 'hidden';
 difficulty = difficultySelect.value;
 start(id);
}

function closeGame() {
 clean();
 screen.classList.remove('open');
 document.body.style.overflow = '';
 active = null;
}

const backButton = $('#back-button');
const restartButton = $('#restart-button');

if (backButton) backButton.addEventListener('click', closeGame);
if (restartButton) restartButton.addEventListener('click', () => {
 if (active) openGame(active);
});

difficultySelect.addEventListener('change', () => {
 difficulty = difficultySelect.value;
 if (active) openGame(active);
});

document.addEventListener('keydown', e => {
 if (e.key === 'Escape' && screen.classList.contains('open')) closeGame();
});

function start(id) {
 score = 0;
 lives = 3;
 timeLeft = 60;

 const hud = document.createElement('div');
 hud.className = 'hud';
 hud.innerHTML = '<span id="hud-score">Score: 0</span><span id="hud-lives">Lives: 3</span><span id="hud-time">Time: 60s</span>';

 const c = document.createElement('canvas');
 c.width = 360;
 c.height = 480;
 c.setAttribute('aria-label', title.textContent + ' game canvas');

 const controls = document.createElement('div');
 controls.className = 'controls';

 const result = document.createElement('div');
 result.id = 'result-toast';

 playArea.append(hud, c, controls, result);

 const ctx = c.getContext('2d');
 if (!ctx) {
  result.textContent = 'Canvas is not supported by this browser.';
  return;
 }

 const scoreEl = hud.querySelector('#hud-score');
 const livesEl = hud.querySelector('#hud-lives');
 const timeEl = hud.querySelector('#hud-time');
 const factor = factors[difficulty] || 1;

 let ended = false;
 let last = 0;

 function hudUpdate() {
  scoreEl.textContent = 'Score: ' + Math.floor(score);
  livesEl.textContent = 'Lives: ' + lives;
  timeEl.textContent = 'Time: ' + Math.max(0, Math.ceil(timeLeft)) + 's';
 }

 function background() {
  ctx.fillStyle = '#070d1c';
  ctx.fillRect(0, 0, 360, 480);
  ctx.save();
  ctx.strokeStyle = '#16334d';
  ctx.lineWidth = 1;
  for (let x = 0; x < 360; x += 30) {
   ctx.beginPath();
   ctx.moveTo(x, 0);
   ctx.lineTo(x, 480);
   ctx.stroke();
  }
  for (let y = 0; y < 480; y += 30) {
   ctx.beginPath();
   ctx.moveTo(0, y);
   ctx.lineTo(360, y);
   ctx.stroke();
  }
  ctx.restore();
 }

 function text(t, x, y, size = 16, color = '#eef7ff') {
  ctx.fillStyle = color;
  ctx.font = `800 ${size}px system-ui,Arial`;
  ctx.textAlign = 'center';
  ctx.fillText(t, x, y);
 }

 function rect(x, y, w, h, color, stroke = '#35e8ff') {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);
 }

 function circle(x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
 }

 function end(message) {
  if (ended) return;
  ended = true;
  clearInterval(timer);
  result.textContent = message + ' · Score ' + Math.floor(score);
  ctx.fillStyle = '#030713e8';
  ctx.fillRect(0, 0, 360, 480);
  text(message, 180, 220, 24, '#35e8ff');
  text('Score ' + Math.floor(score), 180, 255, 17);
  text('Tap Restart to play again', 180, 285, 12);
 }

 function addBtn(label, fn) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'control-btn';
  b.textContent = label;
  b.addEventListener('click', fn);
  controls.appendChild(b);
  return b;
 }

 function makePad(fn) {
  const pad = document.createElement('div');
  pad.style.cssText = 'width:min(100%,440px);height:74px;border:2px solid #35e8ff;border-radius:14px;background:linear-gradient(90deg,#101b30,#122a42,#101b30);touch-action:none;position:relative;overflow:hidden';
  pad.innerHTML = '<span style="position:absolute;inset:0;display:grid;place-items:center;color:#9eafc9;font-size:12px;font-weight:800;pointer-events:none">DRAG TO MOVE ◀ ▶</span><span style="position:absolute;left:50%;top:50%;width:42px;height:42px;border-radius:12px;border:2px solid #35e8ff;background:#35e8ff40;transform:translate(-50%,-50%);pointer-events:none"></span>';
  controls.appendChild(pad);

  let down = false;
  const knob = pad.lastElementChild;

  function move(e) {
   const r = pad.getBoundingClientRect();
   const x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - .5) * 2));
   knob.style.left = (50 + x * 38) + '%';
   fn(x);
  }

  function up() {
   down = false;
   knob.style.left = '50%';
   fn(0);
  }

  pad.addEventListener('pointerdown', e => {
   down = true;
   pad.setPointerCapture(e.pointerId);
   move(e);
  });
  pad.addEventListener('pointermove', e => {
   if (down) move(e);
  });
  pad.addEventListener('pointerup', up);
  pad.addEventListener('pointercancel', up);

  return up;
 }

 function buttonKeys(mapping) {
  const down = e => {
   if (mapping[e.key]) {
    e.preventDefault();
    mapping[e.key](true);
   }
  };
  const up = e => {
   if (mapping[e.key]) mapping[e.key](false);
  };

  window.addEventListener('keydown', down);
  window.addEventListener('keyup', up);

  const previous = cleanupFn;
  cleanupFn = () => {
   window.removeEventListener('keydown', down);
   window.removeEventListener('keyup', up);
   if (previous) previous();
  };
 }

 function countdown() {
  timer = setInterval(() => {
   if (ended) return;
   timeLeft--;
   hudUpdate();
   if (timeLeft <= 0) end('TIME UP');
  }, 1000);
 }

 let state = {};

 if (id === 'parkour' || id === 'ninja' || id === 'hover' || id === 'reflex') {
  state = {x:90, y:385, vy:0, ground:true, obs:[], spawn:0, world:0};

  const jump = () => {
   if (!ended && state.ground) {
    state.vy = -10.5;
    state.ground = false;
   }
  };

  addBtn('JUMP', jump);
  const steer = makePad(x => state.x = Math.max(35, Math.min(325, state.x + x * 6)));
  addBtn('◀', () => state.x = Math.max(35, state.x - 22));
  addBtn('▶', () => state.x = Math.min(325, state.x + 22));

  buttonKeys({
   ArrowLeft:v => { if (v) state.x = Math.max(35, state.x - 20); },
   ArrowRight:v => { if (v) state.x = Math.min(325, state.x + 20); },
   ' ':v => { if (v) jump(); },
   ArrowUp:v => { if (v) jump(); }
  });

  help.textContent = 'Drag the touchpad to steer. Tap JUMP or press Space to clear incoming obstacles.';

  function frame(t) {
   if (active !== id || ended) return;
   if (!last) last = t;
   const dt = Math.min(32, t - last);
   last = t;

   state.world += dt * .18;
   state.spawn += dt;

   if (state.spawn > Math.max(430, 900 / factor)) {
    state.spawn = 0;
    state.obs.push({x:35 + Math.random() * 290, y:-25, w:22 + Math.random() * 18, h:24 + Math.random() * 18});
   }

   state.vy += dt * .00055 * 980;
   state.y += state.vy * (dt / 16);

   if (state.y > 385) {
    state.y = 385;
    state.vy = 0;
    state.ground = true;
   }

   state.obs.forEach(o => o.y += dt * .22 * factor);
   state.obs = state.obs.filter(o => o.y < 500);

   for (let i = state.obs.length - 1; i >= 0; i--) {
    const o = state.obs[i];
    if (Math.abs(o.x - state.x) < 24 && Math.abs(o.y - state.y) < 30) {
     state.obs.splice(i, 1);
     lives--;
     if (lives <= 0) end('RUN OVER');
    } else if (o.y > 405) {
     state.obs.splice(i, 1);
     score += 5;
    }
   }

   background();
   ctx.fillStyle = '#102b42';
   ctx.fillRect(0, 420, 360, 60);

   for (let x = -(state.world % 40); x < 360; x += 40) {
    rect(x, 420, 24, 5, '#35e8ff', '#35e8ff');
   }

   state.obs.forEach(o => rect(o.x, o.y, o.w, o.h, id === 'ninja' ? '#9b6cff' : id === 'hover' ? '#ff4fd8' : '#ff5577'));

   text(id === 'parkour' ? 'CYBER PARKOUR' : id === 'ninja' ? 'NINJA ESCAPE' : id === 'hover' ? 'HOVERBOARD RUSH' : 'NEON REFLEX', 180, 32, 15);

   if (id === 'hover') {
    ctx.fillStyle = '#35e8ff';
    ctx.fillRect(state.x - 24, state.y + 18, 48, 5);
    circle(state.x, state.y + 12, 14, '#ff4fd8');
   } else if (id === 'ninja') {
    text('🥷', state.x, state.y + 12, 27);
   } else {
    text('◆', state.x, state.y + 10, 28, '#35e8ff');
   }

   hudUpdate();
   score += dt * .002;
   raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);
  const previous = cleanupFn;
  cleanupFn = () => {
   steer();
   if (previous) previous();
  };

 } else if (id === 'galaxy' || id === 'asteroid') {
  state = {x:180, shots:[], enemies:[], spawn:0, fire:0};
  let firing = true;

  const shoot = () => {
   if (!ended) state.shots.push({x:state.x, y:410});
  };

  addBtn('HOLD FIRE', shoot);
  addBtn('FIRE OFF', () => firing = false);
  const release = makePad(x => state.x = Math.max(20, Math.min(340, state.x + x * 7)));
  addBtn('◀', () => state.x = Math.max(20, state.x - 20));
  addBtn('▶', () => state.x = Math.min(340, state.x + 20));

  const keydown = e => {
   if (e.key === 'ArrowLeft') state.x = Math.max(20, state.x - 12);
   if (e.key === 'ArrowRight') state.x = Math.min(340, state.x + 12);
   if (e.code === 'Space') {
    e.preventDefault();
    shoot();
   }
  };

  window.addEventListener('keydown', keydown);
  cleanupFn = () => {
   release();
   window.removeEventListener('keydown', keydown);
  };

  help.textContent = 'Move with the touchpad. Your ship fires automatically; tap HOLD FIRE to add a shot, or FIRE OFF to pause shooting.';

  function frame(t) {
   if (active !== id || ended) return;
   if (!last) last = t;
   const dt = Math.min(32, t - last);
   last = t;
   state.spawn += dt;
   state.fire += dt;

   if (state.fire > 210) {
    state.fire = 0;
    if (firing) shoot();
   }

   if (state.spawn > Math.max(260, 750 / factor)) {
    state.spawn = 0;
    state.enemies.push({x:18 + Math.random() * 324, y:-20, v:1 + Math.random() * 1.5});
   }

   state.shots.forEach(s => s.y -= dt * .48);
   state.enemies.forEach(e => e.y += dt * .09 * factor);
   state.shots = state.shots.filter(s => s.y > -10);

   for (let i = state.enemies.length - 1; i >= 0; i--) {
    const e = state.enemies[i];
    const hit = state.shots.findIndex(s => Math.abs(s.x - e.x) < 18 && Math.abs(s.y - e.y) < 18);

    if (hit >= 0) {
     state.shots.splice(hit, 1);
     state.enemies.splice(i, 1);
     score += 10;
    } else if (e.y > 420) {
     state.enemies.splice(i, 1);
     lives--;
     if (lives <= 0) end('SHIP LOST');
    }
   }

   background();
   text(id === 'galaxy' ? 'GALAXY DEFENDER' : 'ASTEROID RUSH', 180, 28, 15);

   ctx.fillStyle = '#35e8ff';
   ctx.beginPath();
   ctx.moveTo(state.x, 405);
   ctx.lineTo(state.x - 15, 433);
   ctx.lineTo(state.x + 15, 433);
   ctx.closePath();
   ctx.fill();

   state.shots.forEach(s => rect(s.x - 2, s.y, 4, 12, '#43f5a5', '#43f5a5'));
   state.enemies.forEach(e => {
    if (id === 'asteroid') {
     circle(e.x, e.y, 12, '#9b6cff');
     circle(e.x - 3, e.y - 3, 4, '#49336e');
    } else {
     text('👾', e.x, e.y + 7, 22);
    }
   });

   hudUpdate();
   raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);

 } else if (id === 'racer') {
  state = {x:180, cars:[], spawn:0, road:0};

  const left = () => state.x = Math.max(55, state.x - 22);
  const right = () => state.x = Math.min(305, state.x + 22);

  addBtn('◀ STEER', left);
  addBtn('▶ STEER', right);
  const release = makePad(x => state.x = Math.max(55, Math.min(305, state.x + x * 6)));

  buttonKeys({
   ArrowLeft:v => { if (v) left(); },
   ArrowRight:v => { if (v) right(); }
  });

  const previous = cleanupFn;
  cleanupFn = () => {
   release();
   if (previous) previous();
  };

  help.textContent = 'Steer with the wide touchpad or arrow keys. Avoid traffic and stay on the road.';

  function frame(t) {
   if (active !== id || ended) return;
   if (!last) last = t;
   const dt = Math.min(32, t - last);
   last = t;

   state.road = (state.road + dt * .25) % 44;
   state.spawn += dt;

   if (state.spawn > Math.max(380, 850 / factor)) {
    state.spawn = 0;
    state.cars.push({x:60 + Math.random() * 240, y:-65});
   }

   state.cars.forEach(o => o.y += dt * .22 * factor);
   state.cars = state.cars.filter(o => o.y < 510);

   for (let i = state.cars.length - 1; i >= 0; i--) {
    const o = state.cars[i];
    if (Math.abs(o.x - state.x) < 28 && o.y > 365 && o.y < 445) {
     lives--;
     state.cars.splice(i, 1);
     if (lives <= 0) end('CRASH!');
    }
   }

   background();
   ctx.fillStyle = '#222b3b';
   ctx.fillRect(38, 0, 284, 480);
   ctx.fillStyle = '#43f5a5';
   ctx.fillRect(43, 0, 4, 480);
   ctx.fillRect(313, 0, 4, 480);
   ctx.strokeStyle = '#eaf6ff';
   ctx.lineWidth = 3;
   ctx.setLineDash([25, 19]);
   ctx.lineDashOffset = -state.road;
   ctx.beginPath();
   ctx.moveTo(180, 0);
   ctx.lineTo(180, 480);
   ctx.stroke();
   ctx.setLineDash([]);

   state.cars.forEach(o => {
    rect(o.x - 13, o.y, 26, 47, '#ff5577', '#ffc1cf');
    ctx.fillStyle = '#171c29';
    ctx.fillRect(o.x - 8, o.y + 7, 16, 10);
   });

   rect(state.x - 14, 395, 28, 53, '#35e8ff', '#b8f8ff');
   ctx.fillStyle = '#101b30';
   ctx.fillRect(state.x - 8, 403, 16, 12);

   text('STREET RACER', 180, 28, 15);
   score += dt * .003;
   hudUpdate();
   raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);

 } else if (id === 'zombie' || id === 'dragon') {
  state = {x:180, y:250, enemies:[], spawn:0};

  const move = makePad(x => state.x = Math.max(20, Math.min(340, state.x + x * 7)));

  function attack() {
   if (ended) return;
   const i = state.enemies.findIndex(e => Math.hypot(e.x - state.x, e.y - state.y) < 75);
   if (i >= 0) {
    state.enemies.splice(i, 1);
    score += 10;
   } else {
    score = Math.max(0, score - 1);
   }
  }

  addBtn('ATTACK', attack);
  addBtn('↑', () => state.y = Math.max(45, state.y - 18));
  addBtn('↓', () => state.y = Math.min(445, state.y + 18));
  addBtn('◀', () => state.x = Math.max(20, state.x - 18));
  addBtn('▶', () => state.x = Math.min(340, state.x + 18));

  const kd = e => {
   const m = {
    ArrowUp:() => state.y = Math.max(45, state.y - 18),
    ArrowDown:() => state.y = Math.min(445, state.y + 18),
    ArrowLeft:() => state.x = Math.max(20, state.x - 18),
    ArrowRight:() => state.x = Math.min(340, state.x + 18),
    ' ':attack
   };
   if (m[e.key]) {
    e.preventDefault();
    m[e.key]();
   }
  };

  window.addEventListener('keydown', kd);
  const previous = cleanupFn;
  cleanupFn = () => {
   move();
   window.removeEventListener('keydown', kd);
   if (previous) previous();
  };

  help.textContent = id === 'zombie'
   ? 'Move around the arena and tap ATTACK when enemies get close. Survive as long as you can.'
   : 'Move around the arena and attack dragons when they approach. Keep your lives.';

  function frame(t) {
   if (active !== id || ended) return;
   if (!last) last = t;
   const dt = Math.min(32, t - last);
   last = t;

   state.spawn += dt;

   if (state.spawn > Math.max(500, 1150 / factor)) {
    state.spawn = 0;
    const side = Math.floor(Math.random() * 4);
    state.enemies.push({
     x:side === 0 ? 5 : side === 1 ? 355 : Math.random() * 360,
     y:side === 2 ? 5 : side === 3 ? 475 : Math.random() * 480
    });
   }

   state.enemies.forEach(e => {
    const dx = state.x - e.x;
    const dy = state.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    e.x += dx / d * dt * .035 * factor;
    e.y += dy / d * dt * .035 * factor;
   });

   state.enemies = state.enemies.filter(e => {
    if (Math.hypot(e.x - state.x, e.y - state.y) < 23) {
     lives--;
     if (lives <= 0) end(id === 'zombie' ? 'OVERRUN' : 'QUEST ENDED');
     return false;
    }
    return true;
   });

   background();

   text(id === 'zombie' ? 'ZOMBIE OUTBREAK' : 'DRAGON QUEST', 180, 28, 15);

   ctx.strokeStyle = '#1d344b';
   for (let x = 20; x < 360; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 40);
    ctx.lineTo(x, 480);
    ctx.stroke();
   }

   text(id === 'zombie' ? '🧍' : '🛡️', state.x, state.y + 8, 28);
   state.enemies.forEach(e => text(id === 'zombie' ? '🧟' : '🐉', e.x, e.y + 8, 25));

   score += dt * .001;
   hudUpdate();
   raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);

 } else if (id === 'penalty') {
  state = {keeper:180, aim:0, attempt:0};
  let moving = false;

  function drawGoal() {
   ctx.strokeStyle = '#eef7ff';
   ctx.lineWidth = 5;
   ctx.strokeRect(70, 90, 220, 110);

   ctx.strokeStyle = '#37516b';
   ctx.lineWidth = 1;

   for (let x = 85; x < 290; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 90);
    ctx.lineTo(x, 200);
    ctx.stroke();
   }

   for (let y = 110; y < 200; y += 20) {
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.lineTo(290, y);
    ctx.stroke();
   }

   text('GOAL', 180, 70, 14);
   text('⚽', 180, 375, 27);
   text('🧤', state.keeper, 178, 28, 25);
  }

  function draw() {
   background();
   drawGoal();
   text(`Shot ${Math.min(5, state.attempt + 1)} / 5`, 180, 440, 15);
  }

  function shoot() {
   if (ended || moving) return;
   moving = true;
   state.attempt++;

   const target = state.aim || (Math.random() - .5) * 100;
   const start = performance.now();
   const duration = 650;

   function anim(now) {
    if (active !== id || ended) return;
    const p = Math.min(1, (now - start) / duration);

    background();
    drawGoal();
    circle(180 + target * p, 365 - 240 * p, Math.max(5, 10 - 3 * p), '#fff');

    if (p < 1) {
     requestAnimationFrame(anim);
    } else {
     moving = false;

     if (Math.abs(target - state.keeper) > 27) {
      score += 10;
      result.textContent = 'GOAL!';
     } else {
      result.textContent = 'SAVED!';
     }

     hudUpdate();

     if (state.attempt >= 5) end('SHOOTOUT COMPLETE');
     else draw();
    }
   }

   requestAnimationFrame(anim);
  }

  addBtn('AIM LEFT', () => state.aim = -70);
  addBtn('AIM CENTER', () => state.aim = 0);
  addBtn('AIM RIGHT', () => state.aim = 70);
  addBtn('SHOOT', shoot);

  const release = makePad(x => state.aim = x * 90);
  cleanupFn = release;

  help.textContent = 'Choose a shot direction, then tap SHOOT. Score past the moving goalkeeper in five attempts.';

  let direction = 1;

  function frame(t) {
   if (active !== id || ended) return;
   if (!last) last = t;
   const dt = Math.min(32, t - last);
   last = t;

   state.keeper += direction * dt * .07 * factor;

   if (state.keeper < 100 || state.keeper > 260) direction *= -1;
   if (!moving) draw();

   raf = requestAnimationFrame(frame);
  }

  raf = requestAnimationFrame(frame);

 } else {
  help.textContent = 'Game mode is not available.';
 }

 countdown();
}
})();
```
