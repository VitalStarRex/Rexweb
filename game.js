(() => {
'use strict';

const ROOT_ID='nexora-games';
const SCORE_KEY='rexweb_nexora_arcade_scores_v1';
const MATCH_KEY='rexweb_nexora_match_scores_v1';
const root=document.getElementById(ROOT_ID);

if(!root){
 console.error('Nexora Arcade: #nexora-games was not found.');
 return;
}

const games=[
{id:'snake',name:'Snake',icon:'🐍',description:'Eat, grow, and avoid your tail.'},
{id:'ttt',name:'Tic-Tac-Toe',icon:'⭕',description:'Challenge the computer.'},
{id:'pong',name:'Pong',icon:'🏓',description:'Keep the ball in play.'},
{id:'breakout',name:'Brick Breaker',icon:'🧱',description:'Destroy every brick.'},
{id:'runner',name:'Endless Runner',icon:'🏃',description:'Jump over obstacles.'},
{id:'shooter',name:'Nexora Jet Strike',icon:'🚀',description:'Pilot your rocket and destroy enemies.'},
{id:'math',name:'Math Challenge',icon:'🧠',description:'Solve as many questions as possible.'},
{id:'rps',name:'Rock Paper Scissors',icon:'✊',description:'Choose your move.'},
{id:'hangman',name:'Hangman',icon:'🔤',description:'Guess the hidden word.'},
{id:'flappy',name:'Dove Flight',icon:'🕊️',description:'Guide a dove through the sky.'}
];

let scores={},matchRecords={};

try{scores=JSON.parse(localStorage.getItem(SCORE_KEY)||'{}')||{};}catch(_){}
try{matchRecords=JSON.parse(localStorage.getItem(MATCH_KEY)||'{}')||{};}catch(_){}

let cleanupCurrent=()=>{},generation=0,activeGame=null;
const $=(s,scope=root)=>scope.querySelector(s);
const $$=(s,scope=root)=>[...scope.querySelectorAll(s)];
const best=id=>Number(scores[id]||0);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function saveScores(){try{localStorage.setItem(SCORE_KEY,JSON.stringify(scores));}catch(_){}}
function saveMatches(){try{localStorage.setItem(MATCH_KEY,JSON.stringify(matchRecords));}catch(_){}}
function getRecord(id){return matchRecords[id]||{you:0,computer:0,draws:0};}

function recordMatch(id,result){
 const r=getRecord(id);
 if(result==='you')r.you++;
 else if(result==='computer')r.computer++;
 else r.draws++;
 matchRecords[id]=r;
 saveMatches();
 return r;
}

function addStyles(){
 if($('#nexora-arcade-styles',document))return;

 const s=document.createElement('style');
 s.id='nexora-arcade-styles';
 s.textContent=`
#nexora-games{--bg:#050914;--panel:#0b1425;--panel2:#101d32;--line:#223651;--text:#f2f7ff;--muted:#91a4bf;--cyan:#35e8ff;--purple:#9b6cff;--green:#43f5a5;color:var(--text);background:var(--bg);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;min-height:60vh;padding:8px;overflow:hidden}
#nexora-games *{box-sizing:border-box}
#nexora-games button{font:inherit;-webkit-tap-highlight-color:transparent}
#nexora-games button:focus-visible{outline:2px solid var(--cyan);outline-offset:3px}
#nexora-games .nx-shell{width:min(100%,960px);margin:auto}
#nexora-games .nx-header{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px}
#nexora-games .nx-brand{display:flex;align-items:center;gap:8px}
#nexora-games .nx-logo{width:36px;height:36px;display:grid;place-items:center;border:1px solid #27637c;border-radius:10px;color:var(--cyan);font-size:20px;font-weight:900;background:linear-gradient(135deg,#102b42,#161332);box-shadow:0 0 16px #35e8ff19}
#nexora-games .nx-brand h1{font-size:clamp(15px,3.5vw,20px);line-height:1.1;margin:0;letter-spacing:.5px}
#nexora-games .nx-brand p{margin:2px 0 0;color:var(--muted);font-size:10px}
#nexora-games .nx-btn{border:1px solid var(--line);color:var(--text);background:var(--panel2);border-radius:9px;padding:7px 11px;min-height:38px;cursor:pointer;transition:transform .1s,border-color .1s}
#nexora-games .nx-btn:active{transform:scale(.96)}
#nexora-games .nx-btn-primary{color:#001019;font-weight:900;background:var(--cyan);border-color:var(--cyan)}
#nexora-games .nx-title{font-size:15px;margin:10px 0 8px}
#nexora-games .nx-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#nexora-games .nx-card{display:block;width:100%;text-align:left;padding:11px;border:1px solid var(--line);border-radius:12px;background:linear-gradient(145deg,var(--panel),#080f1e);color:var(--text);min-width:0;cursor:pointer}
#nexora-games .nx-card:active{border-color:var(--cyan)}
#nexora-games .nx-card-icon{font-size:24px;display:block;margin-bottom:6px}
#nexora-games .nx-card-title{font-size:13px;font-weight:800;display:block}
#nexora-games .nx-card-description{color:var(--muted);font-size:11px;display:block;margin-top:4px;line-height:1.4}
#nexora-games .nx-card-best{display:block;color:var(--cyan);font-size:10px;margin-top:6px}
#nexora-games .nx-panel{border:1px solid var(--line);background:var(--panel);border-radius:14px;overflow:hidden}
#nexora-games .nx-game-top{padding:9px 12px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
#nexora-games .nx-game-heading{display:flex;align-items:center;gap:8px}
#nexora-games .nx-game-heading h2{font-size:clamp(16px,3.5vw,21px);margin:0}
#nexora-games .nx-game-heading p{font-size:11px;color:var(--muted);margin:2px 0 0}
#nexora-games .nx-stats{display:flex;gap:6px;flex-wrap:wrap}
#nexora-games .nx-stat{padding:6px 9px;border:1px solid var(--line);border-radius:8px;background:#060d19;font-size:11px;white-space:nowrap}
#nexora-games .nx-stat strong{color:var(--cyan)}
#nexora-games .nx-match-card{border:1px solid #285078;background:linear-gradient(135deg,#081b30,#11142e);border-radius:12px;padding:10px;margin:8px auto;max-width:440px;text-align:center}
#nexora-games .nx-match-label{font-size:10px;letter-spacing:1.5px;color:var(--muted);font-weight:900}
#nexora-games .nx-match-score{display:flex;justify-content:center;align-items:center;gap:15px;font-size:clamp(21px,5vw,30px);font-weight:900;margin:5px 0}
#nexora-games .nx-match-score .nx-you{color:var(--cyan)}
#nexora-games .nx-match-score .nx-computer{color:var(--purple)}
#nexora-games .nx-match-score .nx-colon{color:#8294af;font-size:18px}
#nexora-games .nx-match-meta{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;font-size:11px;color:var(--muted)}
#nexora-games .nx-clock{color:var(--green);font-weight:900;font-variant-numeric:tabular-nums}
#nexora-games .nx-clock.nx-urgent{color:#ff718f;animation:nx-pulse .65s infinite alternate}
#nexora-games .nx-clock-track{height:5px;background:#1a2940;border-radius:9px;overflow:hidden;margin-top:8px}
#nexora-games .nx-clock-bar{height:100%;width:100%;background:linear-gradient(90deg,var(--green),var(--cyan));transition:width .25s linear}
#nexora-games .nx-clock-bar.nx-urgent{background:#ff5379}
@keyframes nx-pulse{to{opacity:.55}}
#nexora-games .nx-game-area{padding:8px;min-height:150px}
#nexora-games .nx-canvas-wrap{width:100%;max-width:400px;margin:auto}
#nexora-games canvas{display:block;width:100%;height:auto;max-height:65vh;border-radius:10px;background:#030914;border:1px solid #1b3854;touch-action:none}
#nexora-games .nx-message{text-align:center;min-height:18px;padding:3px 8px 6px;color:var(--cyan);font-size:11px}
#nexora-games .nx-controls{display:flex;justify-content:center;flex-wrap:wrap;gap:7px;padding:8px}
#nexora-games .nx-controller{padding:9px 10px;border-top:1px solid #18334d;background:linear-gradient(180deg,#071326,#040a16)}
#nexora-games .nx-controller-title{text-align:center;color:#a7c8ed;font-size:10px;font-weight:900;letter-spacing:1.5px;margin-bottom:7px}
#nexora-games .nx-controller-layout{display:grid;grid-template-columns:minmax(65px,.6fr) minmax(130px,1.4fr) minmax(65px,.6fr);align-items:center;gap:8px;max-width:750px;margin:auto}
#nexora-games .nx-instructions,#nexora-games .nx-pad-status{min-width:0;padding:7px;border:1px solid #17466b;border-radius:10px;background:#07182c;color:#a9c9ed;font-size:10px;line-height:1.4}
#nexora-games .nx-instructions .nx-hand{display:block;font-size:18px;margin-bottom:2px}
#nexora-games .nx-pad-status strong{display:block;color:#9bc9ff;margin-bottom:2px}
#nexora-games .nx-ready{color:var(--green);font-weight:800}
#nexora-games .nx-pad{position:relative;height:112px;width:100%;border:2px solid #087ca5;border-radius:14px;background:linear-gradient(90deg,transparent 49.6%,#1681a744 50%,transparent 50.5%),linear-gradient(transparent 49.6%,#1681a744 50%,transparent 50.5%),radial-gradient(ellipse at center,#123c5c,#071a30 75%);box-shadow:0 0 10px #00cfff22,inset 0 0 12px #00cfff14;overflow:hidden;touch-action:none;user-select:none;-webkit-user-select:none}
#nexora-games .nx-pad:before{content:"";position:absolute;inset:6px;border:1px solid #42caff22;border-radius:8px;pointer-events:none}
#nexora-games .nx-pad.nx-pad-active{border-color:var(--cyan);box-shadow:0 0 15px #00cfff55,inset 0 0 15px #00cfff24}
#nexora-games .nx-pad-knob{position:absolute;left:50%;top:50%;width:36px;height:36px;border:2px solid #25e7ff;border-radius:50%;background:radial-gradient(circle,#35e8ff 0 22%,#087fa7 27%,#063554 70%);box-shadow:0 0 0 6px #00d9ff19,0 0 12px #00d9ff88;transform:translate(-50%,-50%);pointer-events:none}
#nexora-games .nx-board{display:grid;gap:6px;max-width:260px;margin:6px auto}
#nexora-games .nx-ttt-board{grid-template-columns:repeat(3,minmax(0,1fr));width:min(100%,250px)}
#nexora-games .nx-cell{aspect-ratio:1;border:1px solid #2a415e;border-radius:10px;background:#0c192a;color:var(--cyan);font-size:clamp(22px,6vw,36px);font-weight:900;cursor:pointer}
#nexora-games .nx-cell.nx-o{color:var(--purple)}
#nexora-games .nx-result{text-align:center;color:var(--muted);font-size:11px;min-height:18px}
#nexora-games .nx-question{text-align:center;font-size:clamp(20px,6vw,32px);font-weight:900;margin:10px 0;color:var(--cyan)}
#nexora-games .nx-answer-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;max-width:380px;margin:10px auto}
#nexora-games .nx-answer{padding:11px 8px;border:1px solid var(--line);border-radius:10px;color:var(--text);background:#0c192a;font-weight:800;cursor:pointer}
#nexora-games .nx-answer:disabled{opacity:.5}
#nexora-games .nx-rps-buttons{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin:10px auto}
#nexora-games .nx-word{text-align:center;font-size:clamp(18px,5vw,26px);letter-spacing:5px;margin:10px 0;font-weight:900;overflow-wrap:anywhere}
#nexora-games .nx-letter-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;max-width:360px;margin:8px auto}
#nexora-games .nx-letter{min-height:36px;border:1px solid var(--line);border-radius:6px;background:#0d192b;color:var(--text);cursor:pointer;font-weight:800;font-size:11px}
#nexora-games .nx-letter:disabled{opacity:.3;cursor:default}
#nexora-games .nx-footer{text-align:center;color:#60758f;font-size:10px;padding:8px 0 2px}
@media(max-width:480px){#nexora-games .nx-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#nexora-games .nx-controller-layout{grid-template-columns:1fr;gap:6px}#nexora-games .nx-instructions{text-align:center;padding:4px 8px}#nexora-games .nx-instructions .nx-hand{display:inline;margin-right:6px;font-size:14px}#nexora-games .nx-pad-status{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 8px}#nexora-games .nx-pad-status strong{margin:0}#nexora-games .nx-pad{height:105px}#nexora-games .nx-match-score{gap:10px}}
@media(prefers-reduced-motion:reduce){#nexora-games *{animation:none!important;transition:none!important}}
`;
 document.head.appendChild(s);
}

function stopCurrent(){
 generation++;
 try{cleanupCurrent();}catch(e){console.warn('Arcade cleanup:',e);}
 cleanupCurrent=()=>{};
 activeGame=null;
}

function showHome(){
 stopCurrent();
 root.innerHTML=`
<div class="nx-shell">
<header class="nx-header"><div class="nx-brand"><div class="nx-logo">N</div><div><h1>REXWEB NEXORA</h1><p>ARCADE UNIVERSE · PLAY WITHOUT LIMITS</p></div></div><button class="nx-btn" data-refresh>↻ Refresh</button></header>
<h2 class="nx-title">Choose Your Game</h2>
<div class="nx-grid">${games.map(g=>`<button class="nx-card" data-open="${g.id}"><span class="nx-card-icon">${g.icon}</span><span class="nx-card-title">${esc(g.name)}</span><span class="nx-card-description">${esc(g.description)}</span><span class="nx-card-best">BEST: ${best(g.id)}</span>${['ttt','pong','rps'].includes(g.id)?`<span class="nx-card-best">MATCH: ${getRecord(g.id).you} : ${getRecord(g.id).computer}</span>`:''}</button>`).join('')}</div>
<footer class="nx-footer">REXWEB NEXORA · YOUR DIGITAL WORLD</footer>
</div>`;
 $$('[data-open]').forEach(b=>b.addEventListener('click',()=>openGame(b.dataset.open)));
 $('[data-refresh]').addEventListener('click',showHome);
}

function openGame(id){
 const game=games.find(g=>g.id===id);
 if(!game)return;

 stopCurrent();
 activeGame=id;
 const gen=generation;
 let score=0;

 root.innerHTML=`
<div class="nx-shell">
<header class="nx-header"><div class="nx-brand"><div class="nx-logo">N</div><div><h1>REXWEB NEXORA</h1><p>ARCADE UNIVERSE</p></div></div><button class="nx-btn" data-home>← Back</button></header>
<section class="nx-panel">
<div class="nx-game-top"><div class="nx-game-heading"><span style="font-size:24px">${game.icon}</span><div><h2>${esc(game.name)}</h2><p>${esc(game.description)}</p></div></div><div class="nx-stats"><div class="nx-stat">SCORE: <strong data-score>0</strong></div><div class="nx-stat">BEST: <strong data-best>${best(id)}</strong></div></div></div>
<div class="nx-game-area" data-area></div><div class="nx-message" data-message aria-live="polite"></div>
<section class="nx-controller" data-controller><div class="nx-controller-title" data-controller-title>TOUCH CONTROLLER</div><div class="nx-controller-layout"><div class="nx-instructions"><span class="nx-hand">☝️</span><span data-instructions>Drag to move</span></div><div class="nx-pad" data-pad aria-label="Live touchpad"><div class="nx-pad-knob" data-knob></div></div><div class="nx-pad-status"><div><strong>PAD STATUS</strong><span class="nx-ready" data-pad-state>● Ready</span></div><div>X: <span data-pad-x>0.50</span><br>Y: <span data-pad-y>0.50</span></div></div></div></section>
<div class="nx-controls"><button class="nx-btn nx-btn-primary" data-restart>↻ Restart</button><button class="nx-btn" data-pause>⏸ Pause</button><button class="nx-btn" data-home>▦ All Games</button></div>
</section><footer class="nx-footer">REXWEB NEXORA</footer>
</div>`;

 const area=$('[data-area]'),message=$('[data-message]'),scoreLabel=$('[data-score]'),bestLabel=$('[data-best]');
 const pad=$('[data-pad]'),knob=$('[data-knob]'),padState=$('[data-pad-state]'),padX=$('[data-pad-x]'),padY=$('[data-pad-y]');
 const instructions=$('[data-instructions]'),controllerSection=$('[data-controller]');
 const needsPad=['snake','pong','breakout','shooter','flappy'];
 controllerSection.hidden=!needsPad.includes(id);

 $$('[data-home]').forEach(b=>b.addEventListener('click',showHome));
 $('[data-restart]').addEventListener('click',()=>{if(activeGame===id)openGame(id);});

 function setMessage(t){if(message?.isConnected)message.textContent=t||'';}
 function setScore(n){
  score=Math.max(0,Math.floor(Number(n)||0));
  scoreLabel.textContent=score;
  if(score>best(id)){scores[id]=score;saveScores();}
  bestLabel.textContent=best(id);
 }
 function addScore(n=1){setScore(score+n);}
 function makeCanvas(w,h){
  const wrap=document.createElement('div');wrap.className='nx-canvas-wrap';
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  canvas.setAttribute('aria-label',game.name+' game area');
  wrap.appendChild(canvas);area.appendChild(wrap);
  return{canvas,ctx:canvas.getContext('2d')};
 }

 const controller={x:0,y:0,active:false,fire:false,jump:false,left:false,right:false,up:false,down:false,tap:false,jumpQueued:false,tapQueued:false,fireQueued:false,keys:new Set()};
 let localCleanups=[],animationFrame=0,timeoutIds=[],pointerId=null;
 let snakeDirection={x:1,y:0},snakeNextDirection={x:1,y:0};
 let boardTapHandler=null,mathTapHandler=null,rpsTapHandler=null,hangmanTapHandler=null;
 let paused=false,gameCleanup=()=>{};
 let countdownInterval=null,matchTimeLeft=60,matchActive=['ttt','pong','rps'].includes(id);
 let matchYou=0,matchComputer=0,matchDraws=0,matchEnded=false;
 let clockLabel=null,clockBar=null,matchScoreLabel=null,matchFinishHandler=null;
 let mathKeyHandler=null,rpsKeyHandler=null,hangmanKeyHandler=null;
 let matchAPI=null;

 function listen(target,event,handler,options){
  target.addEventListener(event,handler,options);
  localCleanups.push(()=>target.removeEventListener(event,handler,options));
 }
 function timeout(callback,ms){
  const t=setTimeout(()=>{
   timeoutIds=timeoutIds.filter(x=>x!==t);
   if(gen===generation&&activeGame===id)callback();
  },ms);
  timeoutIds.push(t);
  return t;
 }
 function frame(callback){
  let running=true,last=0,raf=0;
  function tick(time){
   if(!running||gen!==generation||activeGame!==id)return;
   raf=requestAnimationFrame(tick);
   animationFrame=raf;
   if(paused)return;
   const dt=last?Math.min((time-last)/1000,.04):0;
   last=time;
   callback(dt,time);
  }
  raf=requestAnimationFrame(tick);
  animationFrame=raf;
  return()=>{running=false;cancelAnimationFrame(raf);};
 }
 function setInstructions(t){instructions.textContent=t;}
 function updatePad(){
  knob.style.left=`${50+controller.x*40}%`;
  knob.style.top=`${50+controller.y*40}%`;
  padX.textContent=(.5+controller.x/2).toFixed(2);
  padY.textContent=(.5+controller.y/2).toFixed(2);
  padState.textContent=controller.active?'● Active':'● Ready';
  padState.style.color=controller.active?'#35e8ff':'#43f5a5';
  pad.classList.toggle('nx-pad-active',controller.active);
 }
 function resetPad(){
  controller.x=0;controller.y=0;controller.active=false;
  controller.left=controller.right=controller.up=controller.down=false;
  controller.fire=false;controller.jump=false;controller.tap=false;
  updatePad();
 }
 function pointerPosition(e){
  const r=pad.getBoundingClientRect();
  controller.x=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));
  controller.y=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2));
  controller.left=controller.x<-.18;controller.right=controller.x>.18;
  controller.up=controller.y<-.18;controller.down=controller.y>.18;
  controller.active=true;
  updatePad();
 }
 function steerSnake(x,y){
  if(Math.abs(x)>Math.abs(y)){
   if(x>.18)snakeNextDirection={x:1,y:0};
   if(x<-.18)snakeNextDirection={x:-1,y:0};
  }else{
   if(y>.18)snakeNextDirection={x:0,y:1};
   if(y<-.18)snakeNextDirection={x:0,y:-1};
  }
 }
 function guessLetter(letter){if(hangmanKeyHandler)hangmanKeyHandler(letter);}
 function playRps(move){if(rpsKeyHandler)rpsKeyHandler(move);}
 function chooseMathAnswer(index){if(mathKeyHandler)mathKeyHandler(index);}

 listen(pad,'pointerdown',e=>{
  e.preventDefault();
  pointerId=e.pointerId;
  try{pad.setPointerCapture(e.pointerId);}catch(_){}
  pointerPosition(e);
  if(id==='shooter'){controller.fire=true;controller.fireQueued=true;}
  else if(id==='runner'){controller.jump=true;controller.jumpQueued=true;}
  else if(id==='flappy'){controller.tap=true;controller.tapQueued=true;}
  else if(id==='snake')steerSnake(controller.x,controller.y);
  else if(id==='ttt'&&boardTapHandler)boardTapHandler(e);
  else if(id==='math'&&mathTapHandler)mathTapHandler(e);
  else if(id==='rps'&&rpsTapHandler)rpsTapHandler(e);
  else if(id==='hangman'&&hangmanTapHandler)hangmanTapHandler(e);
  else controller.tapQueued=true;
 });
 listen(pad,'pointermove',e=>{
  if(e.pointerId!==pointerId)return;
  e.preventDefault();
  pointerPosition(e);
  if(id==='snake')steerSnake(controller.x,controller.y);
  if(id==='shooter')controller.fire=true;
 });
 function endPointer(e){
  if(pointerId!==null&&e.pointerId!==pointerId)return;
  pointerId=null;
  resetPad();
 }
 listen(pad,'pointerup',endPointer);
 listen(pad,'pointercancel',endPointer);
 listen(pad,'lostpointercapture',endPointer);
 listen(pad,'contextmenu',e=>e.preventDefault());

 listen(window,'keydown',e=>{
  if(gen!==generation)return;
  const k=e.key.toLowerCase();
  controller.keys.add(k);
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)&&!e.target.closest('input,textarea,select'))e.preventDefault();
  controller.left=controller.keys.has('arrowleft')||controller.keys.has('a');
  controller.right=controller.keys.has('arrowright')||controller.keys.has('d');
  controller.up=controller.keys.has('arrowup')||controller.keys.has('w');
  controller.down=controller.keys.has('arrowdown')||controller.keys.has('s');

  if(k===' '||k==='arrowup'||k==='w'){
   if(id==='runner'){controller.jump=true;controller.jumpQueued=true;}
   if(id==='flappy'){controller.tap=true;controller.tapQueued=true;}
   if(id==='shooter'){controller.fire=true;controller.fireQueued=true;}
  }
  if(id==='snake'){
   if(k==='arrowup'||k==='w')steerSnake(0,-1);
   if(k==='arrowdown'||k==='s')steerSnake(0,1);
   if(k==='arrowleft'||k==='a')steerSnake(-1,0);
   if(k==='arrowright'||k==='d')steerSnake(1,0);
  }
  if(id==='math'&&/^[1-4]$/.test(k)&&mathKeyHandler)mathKeyHandler(k);
  if(id==='hangman'&&/^[a-z]$/.test(k)&&hangmanKeyHandler)hangmanKeyHandler(k.toUpperCase());
  if(id==='rps'){if(k==='r')playRps('rock');if(k==='p')playRps('paper');if(k==='s')playRps('scissors');}
 });
 listen(window,'keyup',e=>{
  controller.keys.delete(e.key.toLowerCase());
  controller.left=controller.keys.has('arrowleft')||controller.keys.has('a');
  controller.right=controller.keys.has('arrowright')||controller.keys.has('d');
  controller.up=controller.keys.has('arrowup')||controller.keys.has('w');
  controller.down=controller.keys.has('arrowdown')||controller.keys.has('s');
  if([' ','arrowup','w'].includes(e.key.toLowerCase())){
   controller.jump=false;
   controller.fire=false;
  }
 });

 function setupMatchCard(){
  if(!matchActive)return null;
  const card=document.createElement('section');
  card.className='nx-match-card';
  card.innerHTML=`
<div class="nx-match-label">HEAD-TO-HEAD MATCH</div>
<div class="nx-match-score"><span class="nx-you">YOU <b data-you-score>0</b></span><span class="nx-colon">:</span><span class="nx-computer">COMPUTER <b data-computer-score>0</b></span></div>
<div class="nx-match-meta"><span>Draws: <b data-draws>0</b></span><span>·</span><span>TIME LEFT: <b class="nx-clock" data-clock>01:00</b></span></div>
<div class="nx-clock-track"><div class="nx-clock-bar" data-clock-bar></div></div>`;
  area.appendChild(card);
  matchScoreLabel={
   you:$('[data-you-score]',card),
   computer:$('[data-computer-score]',card),
   draws:$('[data-draws]',card)
  };
  clockLabel=$('[data-clock]',card);
  clockBar=$('[data-clock-bar]',card);

  function updateMatch(){
   matchScoreLabel.you.textContent=matchYou;
   matchScoreLabel.computer.textContent=matchComputer;
   matchScoreLabel.draws.textContent=matchDraws;
  }
  function updateClock(){
   const n=Math.max(0,Math.ceil(matchTimeLeft));
   clockLabel.textContent=`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
   clockLabel.classList.toggle('nx-urgent',n<=10);
   clockBar.style.width=`${Math.max(0,Math.min(100,matchTimeLeft/60*100))}%`;
   clockBar.classList.toggle('nx-urgent',n<=10);
  }
  function addMatchResult(result){
   if(matchEnded)return;
   if(result==='you')matchYou++;
   else if(result==='computer')matchComputer++;
   else matchDraws++;
   updateMatch();
  }
  function finish(){
   if(matchEnded)return;
   matchEnded=true;
   clearInterval(countdownInterval);
   countdownInterval=null;
   if(matchYou>matchComputer)recordMatch(id,'you');
   else if(matchComputer>matchYou)recordMatch(id,'computer');
   else recordMatch(id,'draw');
   updateMatch();
   setMessage(`TIME UP! Final match score: YOU ${matchYou} : ${matchComputer} COMPUTER · Draws: ${matchDraws}`);
   if(pauseButton)pauseButton.disabled=true;
  }
  updateMatch();
  updateClock();
  countdownInterval=setInterval(()=>{
   if(gen!==generation||activeGame!==id||paused||matchEnded)return;
   matchTimeLeft=Math.max(0,matchTimeLeft-1);
   updateClock();
   if(matchTimeLeft<=0)finish();
  },1000);
  return{addMatchResult,updateMatch,finish};
 }

 matchAPI=setupMatchCard();
 let pauseButton=$('[data-pause]');

 function gameSnake(){
  setInstructions('Drag the pad to steer');
  const{ctx}=makeCanvas(300,300),size=15,grid=20;
  let snake=[{x:9,y:10},{x:8,y:10},{x:7,y:10}],food={x:14,y:10},alive=true,elapsed=0;
  snakeDirection={x:1,y:0};snakeNextDirection={x:1,y:0};

  function placeFood(){
   for(let i=0;i<500;i++){
    const f={x:Math.floor(Math.random()*grid),y:Math.floor(Math.random()*grid)};
    if(!snake.some(p=>p.x===f.x&&p.y===f.y)){food=f;return;}
   }
  }
  function draw(){
   ctx.fillStyle='#030914';ctx.fillRect(0,0,300,300);
   ctx.strokeStyle='#102035';
   for(let i=0;i<=grid;i++){
    ctx.beginPath();ctx.moveTo(i*size,0);ctx.lineTo(i*size,300);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,i*size);ctx.lineTo(300,i*size);ctx.stroke();
   }
   ctx.fillStyle='#ff5e89';ctx.shadowColor='#ff5e89';ctx.shadowBlur=10;
   ctx.beginPath();ctx.arc(food.x*size+7.5,food.y*size+7.5,5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
   snake.forEach((p,i)=>{ctx.fillStyle=i?'#1bc995':'#66ffd0';ctx.fillRect(p.x*size+1,p.y*size+1,size-2,size-2);});
  }
  function step(){
   if(!alive)return;
   const d=snakeNextDirection;
   if(!(d.x===-snakeDirection.x&&d.y===-snakeDirection.y))snakeDirection={...d};
   const h={x:snake[0].x+snakeDirection.x,y:snake[0].y+snakeDirection.y};
   if(h.x<0||h.y<0||h.x>=grid||h.y>=grid||snake.some((p,i)=>i>0&&p.x===h.x&&p.y===h.y)){
    alive=false;setMessage('Game over! Tap Restart.');return;
   }
   snake.unshift(h);
   if(h.x===food.x&&h.y===food.y){addScore(10);placeFood();}else snake.pop();
   draw();
  }
  const stop=frame(dt=>{elapsed+=dt;if(elapsed>=.12){elapsed=0;step();}});
  draw();
  return()=>{alive=false;stop();};
 }

 function gameTicTacToe(){
  setInstructions('Tap a square to play');
  const status=document.createElement('div');status.className='nx-result';status.textContent='Your turn — you are X.';
  const board=document.createElement('div');board.className='nx-board nx-ttt-board';
  board.innerHTML=Array.from({length:9},(_,i)=>`<button class="nx-cell" data-cell="${i}" aria-label="Square ${i+1}"></button>`).join('');
  area.append(status,board);
  const cells=$$('.nx-cell',board),wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let state=Array(9).fill(''),ended=false,computerTimer=null;

  function winner(){
   for(const line of wins){const[a,b,c]=line;if(state[a]&&state[a]===state[b]&&state[a]===state[c])return state[a];}
   return state.every(Boolean)?'draw':null;
  }
  function render(){cells.forEach((c,i)=>{c.textContent=state[i];c.disabled=ended||!!state[i]||matchEnded;c.classList.toggle('nx-o',state[i]==='O');});}
  function newRound(){
   if(matchEnded)return;
   state=Array(9).fill('');ended=false;
   status.textContent='Your turn — you are X.';
   render();
  }
  function finishRound(){
   const r=winner();if(!r)return false;
   ended=true;
   if(r==='X'){matchAPI.addMatchResult('you');addScore(1);status.textContent='You win this round! +1 point.';}
   else if(r==='O'){matchAPI.addMatchResult('computer');status.textContent='Computer wins this round.';}
   else{matchAPI.addMatchResult('draw');status.textContent='Draw!';}
   render();
   if(!matchEnded)timeout(newRound,850);
   return true;
  }
  function findMove(mark){
   for(let i=0;i<9;i++){
    if(state[i])continue;
    state[i]=mark;const yes=winner()===mark;state[i]='';
    if(yes)return i;
   }
   return-1;
  }
  function computerMove(){
   if(ended||matchEnded)return;
   let m=findMove('O');if(m<0)m=findMove('X');if(m<0&&!state[4])m=4;
   if(m<0){const a=[0,2,6,8].filter(i=>!state[i]);if(a.length)m=a[Math.floor(Math.random()*a.length)];}
   if(m<0){const a=state.map((v,i)=>v?-1:i).filter(i=>i>=0);if(a.length)m=a[Math.floor(Math.random()*a.length)];}
   if(m>=0)state[m]='O';
   render();
   if(!finishRound())status.textContent='Your turn — you are X.';
  }
  function play(i){
   if(ended||matchEnded||state[i])return;
   state[i]='X';render();
   if(finishRound())return;
   status.textContent='Computer thinking…';
   timeout(computerMove,220);
  }
  listen(board,'click',e=>{const c=e.target.closest('[data-cell]');if(c)play(+c.dataset.cell);});
  boardTapHandler=e=>{
   const r=pad.getBoundingClientRect();
   const col=Math.min(2,Math.max(0,Math.floor((e.clientX-r.left)/r.width*3)));
   const row=Math.min(2,Math.max(0,Math.floor((e.clientY-r.top)/r.height*3)));
   play(row*3+col);
  };
  return()=>{if(computerTimer)clearTimeout(computerTimer);boardTapHandler=null;};
 }

 function gamePong(){
  setInstructions('Drag up/down or use W/S to move');
  const{ctx}=makeCanvas(400,240);
  let playerY=90,enemyY=90,playerPoints=0,computerPoints=0;
  const pw=8,ph=55;
  let ball={x:200,y:120,vx:230,vy:Math.random()*130-65,r:6};

  function resetBall(direction){
   ball={x:200,y:120,vx:230*direction,vy:Math.random()*130-65,r:6};
  }
  function draw(){
   ctx.fillStyle='#030914';ctx.fillRect(0,0,400,240);
   ctx.strokeStyle='#1d3550';ctx.setLineDash([5,7]);ctx.beginPath();ctx.moveTo(200,0);ctx.lineTo(200,240);ctx.stroke();ctx.setLineDash([]);
   ctx.fillStyle='#35e8ff';ctx.fillRect(14,playerY,pw,ph);
   ctx.fillStyle='#9b6cff';ctx.fillRect(378,enemyY,pw,ph);
   ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#d9e8ff';ctx.font='bold 24px system-ui';ctx.textAlign='center';ctx.fillText(`${playerPoints} : ${computerPoints}`,200,30);
   ctx.font='10px system-ui';ctx.fillStyle='#35e8ff';ctx.fillText('YOU',45,15);ctx.fillStyle='#9b6cff';ctx.fillText('COMPUTER',350,15);
  }
  const stop=frame(dt=>{
   if(matchEnded){draw();return;}
   if(controller.active)playerY=(controller.y+1)/2*(240-ph);
   else{if(controller.up)playerY-=300*dt;if(controller.down)playerY+=300*dt;}
   playerY=Math.max(0,Math.min(240-ph,playerY));
   const target=ball.y-ph/2;
   enemyY+=Math.sign(target-enemyY)*Math.min(Math.abs(target-enemyY),190*dt);
   enemyY=Math.max(0,Math.min(240-ph,enemyY));
   ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
   if(ball.y<ball.r||ball.y>240-ball.r)ball.vy*=-1;
   if(ball.vx<0&&ball.x-ball.r<22&&ball.y>=playerY&&ball.y<=playerY+ph){
    ball.vx=Math.abs(ball.vx)*1.045;
    ball.vy+=(ball.y-(playerY+ph/2))/(ph/2)*65;
    ball.x=23;
   }
   if(ball.vx>0&&ball.x+ball.r>378&&ball.y>=enemyY&&ball.y<=enemyY+ph){
    ball.vx=-Math.abs(ball.vx)*1.025;
    ball.vy+=(ball.y-(enemyY+ph/2))/(ph/2)*45;
    ball.x=377;
   }
   if(ball.x<-10){computerPoints++;matchAPI.addMatchResult('computer');resetBall(1);}
   else if(ball.x>410){playerPoints++;matchAPI.addMatchResult('you');addScore(1);resetBall(-1);}
   draw();
  });
  return()=>stop();
 }

 function gameBreakout(){
  setInstructions('Drag left/right or use A/D');
  const{ctx}=makeCanvas(380,300);
  const cols=8,rows=4,bw=40,bh=14,gap=4;
  let paddleX=150,bricks=[],ball={x:190,y:220,vx:170,vy:-210,r:6},alive=true;
  const pw=72,ph=10;

  function resetBricks(){
   bricks=[];
   for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)bricks.push({x:18+c*(bw+gap),y:30+r*(bh+gap),w:bw,h:bh,alive:true,color:['#35e8ff','#9b6cff','#43f5a5','#ffbe55'][r]});
  }
  function draw(){
   ctx.fillStyle='#030914';ctx.fillRect(0,0,380,300);
   bricks.forEach(b=>{if(!b.alive)return;ctx.fillStyle=b.color;ctx.shadowColor=b.color;ctx.shadowBlur=6;ctx.fillRect(b.x,b.y,b.w,b.h);});
   ctx.shadowColor='#35e8ff';ctx.shadowBlur=10;ctx.fillStyle='#35e8ff';ctx.fillRect(paddleX,274,pw,ph);
   ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  }
  resetBricks();
  const stop=frame(dt=>{
   if(!alive){draw();return;}
   if(controller.active)paddleX=(controller.x+1)/2*(380-pw);
   else{if(controller.left)paddleX-=330*dt;if(controller.right)paddleX+=330*dt;}
   paddleX=Math.max(0,Math.min(380-pw,paddleX));
   ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
   if(ball.x<ball.r||ball.x>380-ball.r)ball.vx*=-1;
   if(ball.y<ball.r)ball.vy=Math.abs(ball.vy);
   if(ball.vy>0&&ball.y+ball.r>=274&&ball.y<=284&&ball.x>=paddleX&&ball.x<=paddleX+pw){
    ball.vy=-Math.abs(ball.vy);
    ball.vx+=(ball.x-(paddleX+pw/2))/(pw/2)*90;
    ball.y=268;
   }
   for(const b of bricks){
    if(b.alive&&ball.x+ball.r>b.x&&ball.x-ball.r<b.x+b.w&&ball.y+ball.r>b.y&&ball.y-ball.r<b.y+b.h){
     b.alive=false;ball.vy*=-1;addScore(10);break;
    }
   }
   if(bricks.every(b=>!b.alive)){alive=false;setMessage('Cleared all bricks!');}
   else if(ball.y>315){alive=false;setMessage('Ball lost! Tap Restart.');}
   draw();
  });
  return()=>{alive=false;stop();};
 }

 function gameRunner(){
  setInstructions('Tap game or press SPACE to jump');
  const{canvas,ctx}=makeCanvas(400,220),ground=180;
  const player={x:50,y:152,w:22,h:28,vy:0,jumping:false};
  let obstacles=[],alive=true,elapsed=0,spawn=0,distance=0;
  function jump(){if(alive&&!player.jumping){player.vy=-340;player.jumping=true;}}
  function draw(){
   ctx.fillStyle='#030914';ctx.fillRect(0,0,400,220);ctx.strokeStyle='#152b43';
   for(let i=0;i<10;i++){const x=((i*45-elapsed*100)%400+400)%400;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,ground);ctx.stroke();}
   ctx.strokeStyle='#35e8ff';ctx.beginPath();ctx.moveTo(0,ground);ctx.lineTo(400,ground);ctx.stroke();
   ctx.fillStyle='#43f5a5';ctx.shadowColor='#43f5a5';ctx.shadowBlur=8;ctx.fillRect(player.x,player.y,player.w,player.h);
   ctx.fillStyle='#ff6d9a';ctx.shadowColor='#ff6d9a';obstacles.forEach(o=>ctx.fillRect(o.x,o.y,o.w,o.h));ctx.shadowBlur=0;
   ctx.fillStyle='#d9e8ff';ctx.font='11px system-ui';ctx.fillText(`DIST ${Math.floor(distance)}`,10,18);
  }
  listen(canvas,'pointerdown',e=>{e.preventDefault();jump();});
  const stop=frame(dt=>{
   if(!alive){draw();return;}
   elapsed+=dt;distance+=dt*10;
   const speed=Math.min(360,235+elapsed*3.2);
   setScore(Math.floor(distance));
   if(controller.jumpQueued||controller.tapQueued||controller.jump||controller.tap){
    jump();controller.jump=controller.tap=false;controller.jumpQueued=controller.tapQueued=false;
   }
   if(player.jumping){
    player.vy+=900*dt;player.y+=player.vy*dt;
    if(player.y>=ground-player.h){player.y=ground-player.h;player.vy=0;player.jumping=false;}
   }
   spawn-=dt;
   if(spawn<=0){
    const h=18+Math.random()*20;
    obstacles.push({x:410,y:ground-h,w:14+Math.random()*10,h});
    spawn=Math.max(.48, .85-Math.min(.3,elapsed*.008))+Math.random()*.5;
   }
   obstacles.forEach(o=>o.x-=speed*dt);
   obstacles=obstacles.filter(o=>o.x+o.w>-5);
   for(const o of obstacles){
    if(player.x+player.w-3>o.x&&player.x+3<o.x+o.w&&player.y+player.h-2>o.y){
     alive=false;setMessage(`Game over! Distance: ${Math.floor(distance)}`);break;
    }
   }
   draw();
  });
  return()=>{alive=false;stop();};
 }

 function gameShooter(){
  setInstructions('Drag to steer; tap or hold to fire');
  const{canvas,ctx}=makeCanvas(380,260);
  const ship={x:190,y:220};
  let bullets=[],enemies=[],particles=[],spawn=0,fireTimer=0,elapsed=0,hull=3,alive=true;

  function fire(){if(!alive||fireTimer>0)return;bullets.push({x:ship.x,y:ship.y-14,vy:-430});fireTimer=.085;}
  function explode(x,y,color){
   for(let i=0;i<7;i++)particles.push({x,y,vx:(Math.random()-.5)*170,vy:(Math.random()-.5)*170,life:.25+Math.random()*.3,color});
  }
  function draw(){
   ctx.fillStyle='#030914';ctx.fillRect(0,0,380,260);
   for(let i=0;i<55;i++){
    const x=67*i%380,y=(97*i+elapsed*45)%260;
    ctx.fillStyle=i%4===0?'#35e8ff':'#546a8c';ctx.fillRect(x,y,1.5,1.5);
   }

   // Player rocket faces upward toward incoming enemies.
   ctx.save();
   ctx.translate(ship.x,ship.y);
   ctx.rotate(0);
   ctx.shadowColor='#35e8ff';ctx.shadowBlur=12;
   ctx.fillStyle='#35e8ff';
   ctx.beginPath();
   ctx.moveTo(0,-19);
   ctx.lineTo(12,12);
   ctx.lineTo(5,8);
   ctx.lineTo(0,13);
   ctx.lineTo(-5,8);
   ctx.lineTo(-12,12);
   ctx.closePath();
   ctx.fill();
   ctx.fillStyle='#eafcff';
   ctx.beginPath();ctx.ellipse(0,-4,4,7,0,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#ffb347';
   ctx.beginPath();ctx.moveTo(-4,12);ctx.lineTo(0,22+Math.random()*3);ctx.lineTo(4,12);ctx.closePath();ctx.fill();
   ctx.restore();

   ctx.fillStyle='#f6fdff';ctx.shadowColor='#35e8ff';ctx.shadowBlur=8;
   bullets.forEach(b=>ctx.fillRect(b.x-2,b.y-7,4,12));

   enemies.forEach(e=>{
    ctx.save();
    ctx.translate(e.x,e.y);
    ctx.rotate(Math.PI); // Enemy rockets face downward toward the player.
    ctx.shadowColor='#ff4f8b';ctx.shadowBlur=8;
    ctx.fillStyle='#ff4f8b';
    ctx.beginPath();
    ctx.moveTo(0,-15);ctx.lineTo(10,10);ctx.lineTo(4,7);
    ctx.lineTo(0,11);ctx.lineTo(-4,7);ctx.lineTo(-10,10);
    ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff0f5';ctx.beginPath();ctx.ellipse(0,-3,3,5,0,0,Math.PI*2);ctx.fill();
    ctx.restore();
   });

   particles.forEach(p=>{ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);});
   ctx.shadowBlur=0;ctx.fillStyle='#e6efff';ctx.font='bold 12px system-ui';
   ctx.fillText(`HULL ${'♥'.repeat(Math.max(0,hull))}`,10,18);
   ctx.fillText(`SCORE ${score}`,10,34);
  }

  const stop=frame(dt=>{
   elapsed+=dt;
   if(!alive){draw();return;}

   if(controller.active){
    ship.x=14+(controller.x+1)/2*(380-28);
    ship.y=25+(controller.y+1)/2*(260-45);
   }else{
    if(controller.left)ship.x-=370*dt;
    if(controller.right)ship.x+=370*dt;
    if(controller.up)ship.y-=330*dt;
    if(controller.down)ship.y+=330*dt;
   }
   ship.x=Math.max(14,Math.min(366,ship.x));
   ship.y=Math.max(25,Math.min(240,ship.y));

   fireTimer-=dt;
   if(controller.fire||controller.fireQueued||controller.keys.has(' ')||controller.keys.has('enter'))fire();
   controller.fireQueued=false;

   spawn-=dt;
   if(spawn<=0){
    enemies.push({x:18+Math.random()*344,y:-18,vy:95+Math.random()*65+elapsed*.9,dead:false});
    spawn=Math.max(.24,.68-elapsed*.008)+Math.random()*.14;
   }

   bullets.forEach(b=>b.y+=b.vy*dt);
   bullets=bullets.filter(b=>b.y>-20);

   enemies.forEach(e=>{
    e.y+=e.vy*dt;

    if(!e.dead&&Math.abs(e.x-ship.x)<20&&Math.abs(e.y-ship.y)<21){
     e.dead=true;hull--;explode(e.x,e.y,'#ff6d9a');
     if(hull<=0){alive=false;setMessage(`Rocket destroyed! Score: ${score}`);}
    }

    bullets.forEach(b=>{
     if(!b.dead&&!e.dead&&Math.abs(b.x-e.x)<16&&Math.abs(b.y-e.y)<17){
      b.dead=true;e.dead=true;addScore(10);explode(e.x,e.y,'#35e8ff');
     }
    });

    if(e.y>275&&!e.dead){
     e.dead=true;hull--;
     if(hull<=0){alive=false;setMessage(`Enemies broke through! Score: ${score}`);}
    }
   });

   bullets=bullets.filter(b=>!b.dead);
   enemies=enemies.filter(e=>!e.dead);
   particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;});
   particles=particles.filter(p=>p.life>0);
   draw();
  });

  return()=>{alive=false;stop();};
 }

 function gameMath(){
  setInstructions('Tap an answer or press 1–4');
  const status=document.createElement('div');status.className='nx-result';status.textContent='Solve correctly for points.';
  const question=document.createElement('div');question.className='nx-question';
  const answers=document.createElement('div');answers.className='nx-answer-grid';
  const streak=document.createElement('div');streak.className='nx-result';streak.textContent='Correct streak: 0';
  area.append(status,question,answers,streak);
  let answer=0,correctStreak=0,locked=false,choices=[];

  function newQuestion(){
   if(matchEnded)return;
   locked=false;status.textContent='Choose the correct answer.';
   const op=Math.floor(Math.random()*4);
   let a=1+Math.floor(Math.random()*15),b=1+Math.floor(Math.random()*15),symbol='+';
   if(op===0)answer=a+b;
   else if(op===1){if(b>a)[a,b]=[b,a];answer=a-b;symbol='−';}
   else if(op===2){a=1+Math.floor(Math.random()*10);b=1+Math.floor(Math.random()*10);answer=a*b;symbol='×';}
   else{b=1+Math.floor(Math.random()*9);answer=1+Math.floor(Math.random()*10);a=b*answer;symbol='÷';}
   question.textContent=`${a} ${symbol} ${b} = ?`;
   const opts=new Set([answer]);
   while(opts.size<4){opts.add(Math.max(0,answer+Math.floor(Math.random()*11)-5));}
   choices=[...opts].sort(()=>Math.random()-.5);
   answers.innerHTML=choices.map((v,i)=>`<button class="nx-answer" data-answer="${v}">${i+1}. ${v}</button>`).join('');
  }
  function chooseAnswer(i){
   if(locked||i<0||i>=choices.length)return;
   locked=true;
   if(Number(choices[i])===answer){correctStreak++;addScore(10);status.textContent='Correct! +10 pts';}
   else{correctStreak=0;status.textContent=`Answer was ${answer}`;}
   streak.textContent=`Correct streak: ${correctStreak}`;
   $$('[data-answer]',answers).forEach(b=>b.disabled=true);
   timeout(newQuestion,650);
  }
  listen(answers,'click',e=>{
   const b=e.target.closest('[data-answer]');
   if(b)chooseAnswer(choices.indexOf(Number(b.dataset.answer)));
  });
  mathTapHandler=e=>{
   const r=pad.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
   chooseAnswer(Math.min(3,Math.max(0,Math.floor(y*2)*2+Math.floor(x*2))));
  };
  mathKeyHandler=k=>chooseAnswer(Number(k)-1);
  newQuestion();
  return()=>{mathTapHandler=null;mathKeyHandler=null;};
 }

 function gameRPS(){
  setInstructions('Choose Rock, Paper, or Scissors');
  const status=document.createElement('div');status.className='nx-result';status.textContent='Make your move.';
  const buttons=document.createElement('div');buttons.className='nx-rps-buttons';
  buttons.innerHTML='<button class="nx-btn" data-rps="rock">✊ Rock</button><button class="nx-btn" data-rps="paper">✋ Paper</button><button class="nx-btn" data-rps="scissors">✌️ Scissors</button>';
  const result=document.createElement('div');result.className='nx-question';result.textContent='Ready?';
  const tally=document.createElement('div');tally.className='nx-result';tally.textContent='Wins: 0 · Draws: 0 · Losses: 0';
  area.append(status,buttons,result,tally);
  const moves=['rock','paper','scissors'],icons={rock:'✊',paper:'✋',scissors:'✌️'};
  let wins=0,draws=0,losses=0;

  function play(move){
   if(matchEnded)return;
   const computer=moves[Math.floor(Math.random()*3)];
   let msg;
   if(move===computer){draws++;matchAPI.addMatchResult('draw');msg='Draw!';}
   else if((move==='rock'&&computer==='scissors')||(move==='paper'&&computer==='rock')||(move==='scissors'&&computer==='paper')){
    wins++;matchAPI.addMatchResult('you');addScore(1);msg='You win!';
   }else{losses++;matchAPI.addMatchResult('computer');msg='Computer wins!';}
   result.textContent=`${icons[move]} vs ${icons[computer]}`;
   status.textContent=msg;
   tally.textContent=`YOU ${wins} : ${losses} COMPUTER · Draws: ${draws}`;
  }
  listen(buttons,'click',e=>{const b=e.target.closest('[data-rps]');if(b)play(b.dataset.rps);});
  rpsTapHandler=e=>{
   const x=(e.clientX-pad.getBoundingClientRect().left)/pad.getBoundingClientRect().width;
   play(x<1/3?'rock':x<2/3?'paper':'scissors');
  };
  rpsKeyHandler=key=>{
   if(key==='r')play('rock');
   if(key==='p')play('paper');
   if(key==='s')play('scissors');
  };
  return()=>{rpsTapHandler=null;rpsKeyHandler=null;};
 }

 function gameHangman(){
  setInstructions('Tap a letter or use your keyboard');
  const words=['GALAXY','PLANET','ROCKET','JUNGLE','PUZZLE','ARCADE','NEXORA','GAMING','NEBULA','PYTHON','COMPUTER','RAINBOW','DIAMOND','OCEAN','FUTURE'];
  let word='',guessed=new Set(),mistakes=0,ended=false;
  const status=document.createElement('div');status.className='nx-result';
  const drawing=document.createElement('div');drawing.className='nx-question';
  const display=document.createElement('div');display.className='nx-word';
  const letters=document.createElement('div');letters.className='nx-letter-grid';
  letters.innerHTML='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l=>`<button class="nx-letter" data-letter="${l}">${l}</button>`).join('');
  area.append(status,drawing,display,letters);

  function render(){
   display.textContent=word.split('').map(l=>guessed.has(l)?l:'_').join(' ');
   drawing.textContent=['○','◔','◑','◕','◉','☠','✖'][mistakes];
   $$('[data-letter]',letters).forEach(b=>b.disabled=ended||guessed.has(b.dataset.letter));
  }
  function reset(){
   word=words[Math.floor(Math.random()*words.length)];
   guessed=new Set();mistakes=0;ended=false;
   status.textContent='Guess the hidden word.';
   render();
  }
  function guess(letter){
   if(ended||guessed.has(letter)||!/^[A-Z]$/.test(letter))return;
   guessed.add(letter);
   if(!word.includes(letter))mistakes++;
   if(word.split('').every(l=>guessed.has(l))){
    ended=true;addScore(10);status.textContent=`Solved! Word: ${word}`;timeout(reset,1100);
   }else if(mistakes>=6){
    ended=true;status.textContent=`Game over! Word: ${word}`;timeout(reset,1400);
   }else status.textContent=`Mistakes: ${mistakes}/6`;
   render();
  }
  listen(letters,'click',e=>{const b=e.target.closest('[data-letter]');if(b)guess(b.dataset.letter);});
  hangmanTapHandler=e=>{
   const r=pad.getBoundingClientRect();
   const x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
   const i=Math.floor(y*4)*7+Math.floor(x*7);
   if(i>=0&&i<26)guess('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]);
  };
  hangmanKeyHandler=guess;
  reset();
  return()=>{hangmanTapHandler=null;hangmanKeyHandler=null;};
 }

 function gameDove(){
  setInstructions('Drag the pad to guide the dove up, down, left, and right');
  const{ctx}=makeCanvas(300,380);
  const dove={x:75,y:185,r:12};
  let obstacles=[],stars=[],elapsed=0,spawn=0,starSpawn=0,alive=true,started=false,passed=0,collected=0;
  const gap=140,pw=36,speed=145;

  function draw(){
   const sky=ctx.createLinearGradient(0,0,0,380);
   sky.addColorStop(0,'#071a3b');sky.addColorStop(.6,'#14518a');sky.addColorStop(1,'#77c7ee');
   ctx.fillStyle=sky;ctx.fillRect(0,0,300,380);
   for(let i=0;i<24;i++){ctx.fillStyle='#ffffff88';ctx.fillRect(31*i%300,59*i%190,2,2);}
   for(let i=0;i<4;i++){
    const x=((i*100-elapsed*12)%380+380)%380-35,y=55+i*48;
    ctx.fillStyle='#ffffff30';ctx.beginPath();ctx.arc(x,y,17,0,7);ctx.arc(x+18,y-8,20,0,7);ctx.arc(x+37,y,15,0,7);ctx.fill();
   }
   obstacles.forEach(o=>{
    ctx.fillStyle='#43f5a5';ctx.shadowColor='#43f5a5';ctx.shadowBlur=8;
    ctx.fillRect(o.x,0,pw,o.top);ctx.fillRect(o.x,o.top+gap,pw,380-o.top-gap);
    ctx.fillStyle='#20c98f';
    ctx.fillRect(o.x-3,o.top-7,pw+6,7);ctx.fillRect(o.x-3,o.top+gap,pw+6,7);
   });
   ctx.shadowBlur=0;
   stars.forEach(s=>{
    ctx.save();ctx.translate(s.x,s.y);ctx.rotate(elapsed*2);ctx.fillStyle='#ffe66d';ctx.shadowColor='#ffe66d';ctx.shadowBlur=12;
    ctx.font='21px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',0,0);ctx.restore();
   });
   ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='30px sans-serif';ctx.shadowColor='#fff';ctx.shadowBlur=10;ctx.fillText('🕊️',dove.x,dove.y);ctx.restore();
   ctx.fillStyle='#fff';ctx.font='bold 12px system-ui';ctx.fillText(`SCORE ${passed*10+collected*5}`,10,20);ctx.fillText(`STARS ${collected}`,10,37);
   if(!started&&alive){ctx.textAlign='center';ctx.fillText('DRAG THE PAD TO FLY',150,325);ctx.textAlign='start';}
  }

  const stop=frame(dt=>{
   elapsed+=dt;
   if(!alive){draw();return;}
   if(controller.active){
    started=true;
    dove.x=40+(controller.x+1)/2*145;
    dove.y=25+(controller.y+1)/2*330;
   }
   spawn-=dt;starSpawn-=dt;
   if(started&&spawn<=0){
    const max=380-gap-42;
    obstacles.push({x:310,top:42+Math.random()*(max-42),scored:false});
    spawn=Math.max(.95,1.35-elapsed*.003);
   }
   if(started&&starSpawn<=0){
    stars.push({x:310,y:40+Math.random()*300});
    starSpawn=.8+Math.random()*.65;
   }
   obstacles.forEach(o=>{
    o.x-=speed*dt;
    if(!o.scored&&o.x+pw<dove.x){o.scored=true;passed++;setScore(passed*10+collected*5);}
    if(dove.x+dove.r>o.x&&dove.x-dove.r<o.x+pw&&(dove.y-dove.r<o.top||dove.y+dove.r>o.top+gap)){
     alive=false;setMessage(`Dove Flight over! Score: ${score}`);
    }
   });
   stars.forEach(s=>{
    s.x-=speed*dt;
    if(!s.collected&&Math.abs(s.x-dove.x)<22&&Math.abs(s.y-dove.y)<24){
     s.collected=true;collected++;addScore(5);
    }
   });
   obstacles=obstacles.filter(o=>o.x+pw>-5);
   stars=stars.filter(s=>s.x>-25&&!s.collected);
   if(dove.y<dove.r||dove.y>380-dove.r||dove.x<dove.r||dove.x>300-dove.r){
    alive=false;setMessage(`Flight ended! Score: ${score}`);
   }
   draw();
  });
  return()=>{alive=false;stop();};
 }

 function makeGame(){
  switch(id){
   case'snake':return gameSnake();
   case'ttt':return gameTicTacToe();
   case'pong':return gamePong();
   case'breakout':return gameBreakout();
   case'runner':return gameRunner();
   case'shooter':return gameShooter();
   case'math':return gameMath();
   case'rps':return gameRPS();
   case'hangman':return gameHangman();
   case'flappy':return gameDove();
   default:area.textContent='Game unavailable.';return()=>{};
  }
 }

 listen(window,'keydown',e=>{
  if(gen!==generation||e.target.closest('input,textarea,select'))return;
  const k=e.key.toLowerCase();
  if(id==='math'&&/^[1-4]$/.test(k)&&mathKeyHandler)mathKeyHandler(k);
  if(id==='hangman'&&/^[a-z]$/.test(k)&&hangmanKeyHandler)hangmanKeyHandler(k.toUpperCase());
  if(id==='rps'&&['r','p','s'].includes(k))playRps(k==='r'?'rock':k==='p'?'paper':'scissors');
 });

 pauseButton.addEventListener('click',()=>{
  if(matchEnded&&matchActive)return;
  paused=!paused;
  pauseButton.textContent=paused?'▶ Resume':'⏸ Pause';
  setMessage(paused?'Game paused. Tap Resume to continue.':'Game resumed.');
  if(paused)resetPad();
 });

 try{
  gameCleanup=makeGame()||(()=>{});
 }catch(e){
  console.error(`Nexora ${id} error:`,e);
  area.innerHTML='<p class="nx-result">Game initialization failed.</p>';
  setMessage('Failed to start. Try Restart.');
 }

 updatePad();

 cleanupCurrent=()=>{
  try{gameCleanup();}catch(e){console.warn('Game cleanup:',e);}
  localCleanups.forEach(fn=>{try{fn();}catch(_){}});
  cancelAnimationFrame(animationFrame);
  timeoutIds.forEach(clearTimeout);
  if(countdownInterval)clearInterval(countdownInterval);
  controller.keys.clear();
  resetPad();
  boardTapHandler=mathTapHandler=rpsTapHandler=hangmanTapHandler=null;
  mathKeyHandler=rpsKeyHandler=hangmanKeyHandler=null;
 };
}

addStyles();
showHome();
})();