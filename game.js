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
{id:'breakout',name:'Brick Breaker',icon:'🧱',description:'Destroy every brick. Three chances to miss.'},
{id:'runner',name:'Endless Runner',icon:'🏃',description:'Jump over obstacles.'},
{id:'shooter',name:'Nexora Jet Strike',icon:'🚀',description:'Survive for one minute and launch your jet to victory.'},
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
#nexora-games .nx-lives{display:flex;justify-content:center;align-items:center;gap:8px;flex-wrap:wrap;margin:8px auto;padding:8px 12px;max-width:380px;border:1px solid #285078;border-radius:10px;background:#07182c;font-size:13px;font-weight:800}
#nexora-games .nx-life-icon{font-size:18px;letter-spacing:3px}
#nexora-games .nx-victory{position:absolute;inset:0;display:grid;place-items:center;text-align:center;background:#020817e8;z-index:5;border-radius:10px;padding:18px}
#nexora-games .nx-victory h3{font-size:clamp(23px,6vw,36px);color:var(--cyan);margin:0 0 10px;text-shadow:0 0 18px #35e8ff88}
#nexora-games .nx-victory p{font-size:14px;color:#eafcff;margin:0}
#nexora-games .nx-canvas-wrap{position:relative;width:100%;max-width:400px;margin:auto}
@keyframes nx-pulse{to{opacity:.55}}
#nexora-games .nx-game-area{padding:8px;min-height:150px}
#nexora-games canvas{display:block;width:100%;height:auto;max-height:65vh;border-radius:10px;background:#030914;border:1px solid #1b3854;touch-action:none}
#nexora-games .nx-message{text-align:center;min-height:18px;padding:3px 8px 6px;color:var(--cyan);font-size:11px}
#nexora-games .nx-controls{display:flex;justify-content:center;flex-wrap:wrap;gap:7px;padding:8px}
#nexora-games .nx-controller{padding:9px;border-top:1px solid #18334d;background:linear-gradient(180deg,#071326,#040a16)}
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
#nexora-games .nx-runner-controls{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;padding:10px 8px 14px}
#nexora-games .nx-jump-button{min-width:150px;min-height:52px;padding:12px 24px;border:1px solid #35e8ff;border-radius:13px;background:linear-gradient(135deg,#35e8ff,#168bc5);color:#001019;font-size:16px;font-weight:1000;letter-spacing:1px;box-shadow:0 5px 0 #075078,0 0 18px #35e8ff35;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none}
#nexora-games .nx-jump-button:active{transform:translateY(3px);box-shadow:0 2px 0 #075078,0 0 18px #35e8ff55}
#nexora-games .nx-jump-button:disabled{opacity:.5;cursor:not-allowed;box-shadow:none}
#nexora-games .nx-runner-hint{width:100%;text-align:center;color:var(--muted);font-size:11px}

/* Enhanced Tic-Tac-Toe, Math Challenge, and Hangman styles. */
#nexora-games .nx-result{width:fit-content;max-width:100%;margin:12px auto;padding:10px 16px;border:1px solid var(--line);border-radius:12px;background:var(--panel2);color:var(--text);font-size:13px;font-weight:750;text-align:center;line-height:1.5;box-shadow:0 5px 18px #00000012}
#nexora-games .nx-board{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;width:min(100%,360px);margin:16px auto;padding:10px;border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,var(--panel2),var(--panel));box-shadow:0 12px 32px #00000024}
#nexora-games .nx-cell{display:grid;place-items:center;aspect-ratio:1;min-width:0;border:1px solid var(--line);border-radius:15px;background:var(--bg);color:var(--cyan);font-size:clamp(36px,10vw,62px);font-weight:950;cursor:pointer;transition:background .18s,border-color .18s,transform .18s,box-shadow .18s}
#nexora-games .nx-cell:not(:disabled):hover{border-color:var(--cyan);background:var(--panel2);box-shadow:0 0 15px #35e8ff1c;transform:translateY(-2px)}
#nexora-games .nx-cell:disabled{cursor:default;opacity:1}
#nexora-games .nx-cell.nx-o{color:var(--purple)}
#nexora-games .nx-ttt-board{touch-action:manipulation}
#nexora-games .nx-question{width:fit-content;max-width:100%;margin:14px auto;padding:16px 24px;border:1px solid #27809a;border-radius:16px;background:linear-gradient(145deg,var(--panel2),var(--panel));color:var(--cyan);font-size:clamp(26px,7vw,42px);font-weight:950;letter-spacing:1px;text-align:center;box-shadow:0 8px 28px #00000020}
#nexora-games .nx-answer-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;width:min(100%,460px);margin:14px auto}
#nexora-games .nx-answer{min-height:56px;padding:12px;border:1px solid var(--line);border-radius:13px;background:var(--panel2);color:var(--text);font-size:clamp(15px,4vw,19px);font-weight:850;cursor:pointer;transition:transform .15s,border-color .15s,background .15s}
#nexora-games .nx-answer:not(:disabled):hover{transform:translateY(-2px);border-color:var(--cyan);background:var(--panel)}
#nexora-games .nx-answer:disabled{cursor:default;opacity:.78}
#nexora-games .nx-answer.nx-correct{background:#123c30;border-color:var(--green);color:var(--green)}
#nexora-games .nx-answer.nx-wrong{background:#421e32;border-color:#ff718f;color:#ff9db1}
#nexora-games .nx-math-toolbar{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:12px auto}
#nexora-games .nx-math-toolbar label{color:var(--muted);font-size:12px;font-weight:750}
#nexora-games .nx-math-difficulty{min-height:40px;padding:7px 12px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);color:var(--text);font:inherit}
#nexora-games .nx-math-dashboard{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;width:min(100%,460px);margin:12px auto}
#nexora-games .nx-math-stat{padding:10px 5px;border:1px solid var(--line);border-radius:12px;background:var(--panel2);text-align:center;min-width:0}
#nexora-games .nx-math-stat strong{display:block;color:var(--cyan);font-size:clamp(18px,5vw,25px);font-variant-numeric:tabular-nums}
#nexora-games .nx-math-stat span{display:block;margin-top:3px;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.5px;text-transform:uppercase}
#nexora-games .nx-math-progress{width:min(100%,460px);height:7px;margin:12px auto;overflow:hidden;border-radius:99px;background:var(--panel2)}
#nexora-games .nx-math-progress span{display:block;width:100%;height:100%;border-radius:inherit;background:linear-gradient(90deg,var(--green),var(--cyan));transition:width .2s}
#nexora-games .nx-word{width:100%;margin:18px auto;padding:20px 8px;border:1px solid var(--line);border-radius:16px;background:linear-gradient(145deg,var(--panel2),var(--panel));color:var(--cyan);font-size:clamp(23px,7vw,38px);font-weight:950;letter-spacing:clamp(4px,2vw,11px);text-align:center;overflow-wrap:anywhere;box-shadow:0 10px 28px #00000020}
#nexora-games .nx-hangman-art{display:grid;place-items:center;width:min(100%,230px);min-height:150px;margin:14px auto;border:1px solid var(--line);border-radius:16px;background:var(--panel2)}
#nexora-games .nx-hangman-art svg{display:block;width:100%;max-height:190px}
#nexora-games .nx-letter-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px;width:min(100%,460px);margin:14px auto}
#nexora-games .nx-letter{display:grid;place-items:center;min-width:0;min-height:40px;padding:4px 0;border:1px solid var(--line);border-radius:9px;background:var(--panel2);color:var(--text);font-size:clamp(12px,3.5vw,16px);font-weight:900;cursor:pointer;transition:transform .15s,border-color .15s,background .15s}
#nexora-games .nx-letter:not(:disabled):hover{transform:translateY(-2px);border-color:var(--cyan);background:var(--panel)}
#nexora-games .nx-letter:disabled{opacity:.4;cursor:default}
#nexora-games .nx-letter.nx-letter-correct{border-color:var(--green);background:#123c30;color:var(--green);opacity:1}
#nexora-games .nx-letter.nx-letter-wrong{border-color:#ff718f;background:#421e32;color:#ff9db1;opacity:.8}
#nexora-games .nx-hangman-meta{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:10px auto;color:var(--muted);font-size:12px}
#nexora-games .nx-hangman-meta strong{color:var(--cyan)}
#nexora-games .nx-game-action-row{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:12px auto}
#nexora-games .nx-game-action-row .nx-btn{min-width:120px}
#nexora-games .nx-game-over{padding:18px;border:1px solid var(--line);border-radius:15px;background:var(--panel2);text-align:center}
#nexora-games .nx-game-over h3{margin:0 0 8px;color:var(--cyan);font-size:clamp(20px,5vw,28px)}
#nexora-games .nx-game-over p{margin:5px 0;color:var(--muted);font-size:13px}
#nexora-games .nx-game-over .nx-btn{margin-top:12px}
#nexora-games .nx-footer{margin-top:12px;padding:10px;text-align:center;color:var(--muted);font-size:10px;letter-spacing:1px}
@media(min-width:600px){
 #nexora-games .nx-game-area{padding:16px}
 #nexora-games .nx-board{gap:12px;padding:14px}
 #nexora-games .nx-cell{border-radius:18px}
 #nexora-games .nx-letter-grid{gap:8px}
 #nexora-games .nx-letter{min-height:45px;border-radius:11px}
}
@media(max-width:480px){
 #nexora-games .nx-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
 #nexora-games .nx-controller-layout{grid-template-columns:1fr;gap:6px}
 #nexora-games .nx-instructions{text-align:center;padding:4px 8px}
 #nexora-games .nx-instructions .nx-hand{display:inline;margin-right:6px;font-size:14px}
 #nexora-games .nx-pad-status{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:5px 8px}
 #nexora-games .nx-pad-status strong{margin:0}
 #nexora-games .nx-pad{height:105px}
 #nexora-games .nx-match-score{gap:10px}
 #nexora-games .nx-jump-button{width:min(100%,320px);min-height:58px;font-size:18px}
 #nexora-games .nx-board{width:min(100%,330px);gap:7px;padding:8px;border-radius:15px}
 #nexora-games .nx-cell{border-radius:11px}
 #nexora-games .nx-answer-grid{gap:8px}
 #nexora-games .nx-answer{min-height:52px;padding:10px 5px}
 #nexora-games .nx-letter-grid{gap:5px}
 #nexora-games .nx-letter{min-height:38px;border-radius:8px}
 #nexora-games .nx-word{padding:16px 5px}
 #nexora-games .nx-question{padding:14px 18px}
 #nexora-games .nx-math-dashboard{gap:5px}
 #nexora-games .nx-math-stat{padding:9px 3px}
}
@media(max-width:340px){
 #nexora-games .nx-letter-grid{grid-template-columns:repeat(6,minmax(0,1fr))}
 #nexora-games .nx-answer-grid{grid-template-columns:1fr}
 #nexora-games .nx-math-stat span{font-size:9px}
}
@media(prefers-reduced-motion:reduce){#nexora-games *{animation:none!important;transition:none!important}}
`;
 document.head.appendChild(s);
}

/* Dark/light mode is controlled entirely by index.html. */
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
  return{canvas,ctx:canvas.getContext('2d'),wrap};
 }

 const controller={x:0,y:0,active:false,fire:false,jump:false,left:false,right:false,up:false,down:false,tap:false,jumpQueued:false,tapQueued:false,fireQueued:false,keys:new Set()};
 let localCleanups=[],animationFrame=0,timeoutIds=[],pointerId=null;
 let snakeDirection={x:1,y:0},snakeNextDirection={x:1,y:0};
 let boardTapHandler=null,mathTapHandler=null,rpsTapHandler=null,hangmanTapHandler=null;
 let paused=false,gameCleanup=()=>{};
 let countdownInterval=null,matchTimeLeft=60,matchActive=['ttt','pong','rps'].includes(id);
 let matchYou=0,matchComputer=0,matchDraws=0,matchEnded=false;
 let clockLabel=null,clockBar=null,matchScoreLabel=null;
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
  board.setAttribute('role','group');
  board.setAttribute('aria-label','Tic-Tac-Toe board');
  board.innerHTML=Array.from({length:9},(_,i)=>`<button type="button" class="nx-cell" data-cell="${i}" aria-label="Square ${i+1}" aria-pressed="false"></button>`).join('');
  const actions=document.createElement('div');actions.className='nx-game-action-row';
  actions.innerHTML='<button type="button" class="nx-btn nx-btn-primary" data-new-round>↻ New Round</button>';
  area.append(status,board,actions);
  const cells=$$('.nx-cell',board),wins=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let state=Array(9).fill(''),ended=false,roundToken=0;

  function winner(){
   for(const line of wins){
    const[a,b,c]=line;
    if(state[a]&&state[a]===state[b]&&state[a]===state[c])return{mark:state[a],line};
   }
   return state.every(Boolean)?{mark:'draw',line:[]}:null;
  }
  function render(){
   cells.forEach((c,i)=>{
    c.textContent=state[i];
    c.disabled=ended||!!state[i]||matchEnded;
    c.setAttribute('aria-pressed',String(!!state[i]));
    c.setAttribute('aria-label',`Square ${i+1}${state[i]?`, ${state[i]}`:''}`);
    c.classList.toggle('nx-o',state[i]==='O');
    c.classList.toggle('nx-winner',!!winningLine.includes(i));
   });
  }
  let winningLine=[];
  function newRound(){
   roundToken++;
   state=Array(9).fill('');
   ended=false;
   winningLine=[];
   status.textContent=matchEnded?'Match complete. Restart to play again.':'Your turn — you are X.';
   render();
  }
  function finishRound(){
   const r=winner();if(!r)return false;
   ended=true;
   winningLine=r.line;
   if(r.mark==='X'){matchAPI.addMatchResult('you');addScore(1);status.textContent='🎉 You win this round! +1 point.';}
   else if(r.mark==='O'){matchAPI.addMatchResult('computer');status.textContent='Computer wins this round. Try another strategy!';}
   else{matchAPI.addMatchResult('draw');status.textContent='🤝 It is a draw!';}
   render();
   if(!matchEnded){
    const token=roundToken;
    timeout(()=>{if(token===roundToken)newRound();},1100);
   }
   return true;
  }
  function findMove(mark){
   for(let i=0;i<9;i++){
    if(state[i])continue;
    state[i]=mark;const yes=winner()?.mark===mark;state[i]='';
    if(yes)return i;
   }
   return-1;
  }
  function computerMove(){
   if(ended||matchEnded)return;
   let m=findMove('O');
   if(m<0)m=findMove('X');
   if(m<0&&!state[4])m=4;
   if(m<0){
    const a=[0,2,6,8].filter(i=>!state[i]);
    if(a.length)m=a[Math.floor(Math.random()*a.length)];
   }
   if(m<0){
    const a=state.map((v,i)=>v?-1:i).filter(i=>i>=0);
    if(a.length)m=a[Math.floor(Math.random()*a.length)];
   }
   if(m>=0)state[m]='O';
   render();
   if(!finishRound())status.textContent='Your turn — you are X.';
  }
  function play(i){
   if(ended||matchEnded||state[i])return;
   state[i]='X';render();
   if(finishRound())return;
   status.textContent='🤖 Computer thinking…';
   timeout(computerMove,350);
  }
  listen(board,'click',e=>{
   const c=e.target.closest('[data-cell]');
   if(c)play(+c.dataset.cell);
  });
  listen(actions,'click',()=>newRound());
  boardTapHandler=e=>{
   const r=pad.getBoundingClientRect();
   const col=Math.min(2,Math.max(0,Math.floor((e.clientX-r.left)/r.width*3)));
   const row=Math.min(2,Math.max(0,Math.floor((e.clientY-r.top)/r.height*3)));
   play(row*3+col);
  };
  return()=>{roundToken++;boardTapHandler=null;};
 }

 /* Pong computer speed is reduced slightly. */
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
   const aiSpeed=155;
   enemyY+=Math.sign(target-enemyY)*Math.min(Math.abs(target-enemyY),aiSpeed*dt);
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

 /* Brick Breaker gives the player three misses. */
 function gameBreakout(){
  setInstructions('Drag left/right or use A/D');
  const{ctx,wrap}=makeCanvas(380,300);
  const cols=8,rows=4,bw=40,bh=14,gap=4;
  let paddleX=150,bricks=[],ball={x:190,y:220,vx:170,vy:-210,r:6},alive=true;
  const pw=72,ph=10;
  let misses=0;
  const maxMisses=3;
  let livesDisplay=document.createElement('div');
  livesDisplay.className='nx-lives';
  livesDisplay.innerHTML=`<span>CHANCES LEFT</span><span class="nx-life-icon" data-lives>❤️❤️❤️</span>`;
  wrap.before(livesDisplay);
  const livesLabel=$('[data-lives]',livesDisplay);

  function updateLives(){
   const remaining=maxMisses-misses;
   livesLabel.textContent='❤️'.repeat(remaining)+'🖤'.repeat(misses);
   livesDisplay.setAttribute('aria-label',`${remaining} chances remaining`);
  }
  function resetBall(){
   ball={x:paddleX+pw/2,y:258,vx:(Math.random()<.5?-1:1)*(145+Math.random()*30),vy:-205,r:6};
  }
  function resetBricks(){
   bricks=[];
   for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)bricks.push({x:18+c*(bw+gap),y:30+r*(bh+gap),w:bw,h:bh,alive:true,color:['#35e8ff','#9b6cff','#43f5a5','#ffbe55'][r]});
  }
  function draw(){
   ctx.fillStyle='#030914';ctx.fillRect(0,0,380,300);
   bricks.forEach(b=>{if(!b.alive)return;ctx.fillStyle=b.color;ctx.shadowColor=b.color;ctx.shadowBlur=6;ctx.fillRect(b.x,b.y,b.w,b.h);});
   ctx.shadowColor='#35e8ff';ctx.shadowBlur=10;ctx.fillStyle='#35e8ff';ctx.fillRect(paddleX,274,pw,ph);
   ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
   ctx.fillStyle='#eafcff';ctx.font='bold 11px system-ui';ctx.textAlign='left';
   ctx.fillText(`MISSES ${misses}/${maxMisses}`,10,290);
  }
  resetBricks();
  resetBall();
  updateLives();
  const stop=frame(dt=>{
   if(!alive){draw();return;}
   if(controller.active)paddleX=(controller.x+1)/2*(380-pw);
   else{if(controller.left)paddleX-=330*dt;if(controller.right)paddleX+=330*dt;}
   paddleX=Math.max(0,Math.min(380-pw,paddleX));
   ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;
   if(ball.x<ball.r){ball.x=ball.r;ball.vx=Math.abs(ball.vx);}
   if(ball.x>380-ball.r){ball.x=380-ball.r;ball.vx=-Math.abs(ball.vx);}
   if(ball.y<ball.r){ball.y=ball.r;ball.vy=Math.abs(ball.vy);}
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
   if(bricks.every(b=>!b.alive)){
    alive=false;setMessage('🏆 BRILLIANT! You destroyed every brick!');
   }else if(ball.y>305){
    misses++;updateLives();
    if(misses>=maxMisses){
     alive=false;setMessage(`GAME OVER! You used all 3 chances. Final score: ${score}. Tap Restart to try again.`);
    }else{
     setMessage(`Miss ${misses} of ${maxMisses}. ${maxMisses-misses} chance${maxMisses-misses===1?'':'s'} remaining!`);
     resetBall();
    }
   }
   draw();
  });
  return()=>{alive=false;stop();};
 }

 /* Endless Runner: visible mobile jump button, touch, and keyboard controls. */
 function gameRunner(){
  setInstructions('Tap JUMP or press SPACE / ↑');
  const{canvas,ctx}=makeCanvas(400,220),ground=180;
  const player={x:48,y:ground-42,w:34,h:42,vy:0,jumping:false};
  let obstacles=[],alive=true,elapsed=0,spawn=0,distance=0,groundOffset=0;

  const controls=document.createElement('div');
  controls.className='nx-runner-controls';
  controls.innerHTML=`
   <button type="button" class="nx-jump-button" data-runner-jump aria-label="Jump over obstacles">⬆ JUMP</button>
   <div class="nx-runner-hint">Tap the button to jump · Keyboard: SPACE or ARROW UP</div>`;
  canvas.closest('.nx-canvas-wrap').after(controls);
  const jumpButton=$('[data-runner-jump]',controls);

  function jump(){
   if(!alive||paused)return;
   if(!player.jumping){
    player.vy=-430;
    player.jumping=true;
   }
  }

  listen(jumpButton,'pointerdown',e=>{
   e.preventDefault();
   jump();
  });
  listen(jumpButton,'click',e=>{
   e.preventDefault();
   jump();
  });

  function drawDino(){
   const x=player.x,y=player.y;
   ctx.save();
   ctx.fillStyle='#e8eef7';ctx.shadowColor='#35e8ff';ctx.shadowBlur=4;
   ctx.fillRect(x+4,y+15,22,20);
   ctx.fillRect(x+17,y+3,17,17);
   ctx.fillRect(x+26,y+12,9,7);
   ctx.fillRect(x,y+20,8,8);
   ctx.fillStyle='#030914';ctx.fillRect(x+27,y+7,3,3);
   ctx.fillStyle='#e8eef7';
   if(player.jumping){ctx.fillRect(x+7,y+33,7,9);ctx.fillRect(x+20,y+33,7,9);}
   else if(Math.floor(elapsed*12)%2===0){ctx.fillRect(x+7,y+33,7,9);ctx.fillRect(x+21,y+33,7,5);ctx.fillRect(x+18,y+38,10,4);}
   else{ctx.fillRect(x+7,y+33,7,5);ctx.fillRect(x+4,y+38,10,4);ctx.fillRect(x+21,y+33,7,9);}
   ctx.restore();
  }

  function drawCactus(o){
   ctx.save();ctx.fillStyle='#43f5a5';ctx.shadowColor='#43f5a5';ctx.shadowBlur=3;
   ctx.fillRect(o.x+6,o.y,o.w-12,o.h);
   if(o.w>18){ctx.fillRect(o.x,o.y+o.h*.38,7,6);ctx.fillRect(o.x,o.y+o.h*.25,6,o.h*.25);ctx.fillRect(o.x+o.w-7,o.y+o.h*.55,7,6);ctx.fillRect(o.x+o.w-6,o.y+o.h*.4,6,o.h*.2);}
   ctx.restore();
  }

  function draw(){
   ctx.fillStyle='#030914';ctx.fillRect(0,0,400,220);
   ctx.fillStyle='#a7b6c9';
   for(let i=0;i<35;i++)ctx.fillRect((i*67)%400,25+(i*31)%95,2,2);
   ctx.strokeStyle='#dce5f1';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,ground);ctx.lineTo(400,ground);ctx.stroke();
   ctx.fillStyle='#73849a';
   for(let i=0;i<18;i++){const x=((i*31-groundOffset)%420+420)%420;ctx.fillRect(x,ground+8+(i%3)*3,12+(i%4)*3,1.5);}
   obstacles.forEach(drawCactus);drawDino();
   ctx.fillStyle='#e8eef7';ctx.font='bold 11px monospace';ctx.textAlign='right';
   ctx.fillText(`HI ${String(Math.floor(distance)).padStart(5,'0')}`,390,18);
   ctx.fillText(`SCORE ${String(Math.floor(distance)).padStart(5,'0')}`,390,33);
   ctx.textAlign='left';
   if(!alive){
    ctx.fillStyle='#e8eef7';ctx.font='bold 18px monospace';ctx.textAlign='center';
    ctx.fillText('GAME OVER',200,90);ctx.font='11px monospace';
    ctx.fillText('TAP RESTART TO RUN AGAIN',200,108);ctx.textAlign='left';
   }
  }

  listen(canvas,'pointerdown',e=>{e.preventDefault();jump();});

  const stop=frame(dt=>{
   if(!alive){draw();return;}
   elapsed+=dt;distance+=dt*10;groundOffset=(groundOffset+dt*250)%420;
   const speed=Math.min(430,260+elapsed*4.2);
   setScore(Math.floor(distance));

   if(controller.jumpQueued||controller.tapQueued||controller.jump||controller.tap){
    jump();
    controller.jump=controller.tap=false;
    controller.jumpQueued=controller.tapQueued=false;
   }

   if(player.jumping){
    player.vy+=1150*dt;
    player.y+=player.vy*dt;
    if(player.y>=ground-player.h){
     player.y=ground-player.h;player.vy=0;player.jumping=false;
    }
   }

   spawn-=dt;
   if(spawn<=0){
    const h=23+Math.random()*19,w=16+Math.random()*13;
    obstacles.push({x:410,y:ground-h,w,h});
    spawn=Math.max(.52,1.05-Math.min(.38,elapsed*.009))+Math.random()*.38;
   }

   obstacles.forEach(o=>o.x-=speed*dt);
   obstacles=obstacles.filter(o=>o.x+o.w>-5);

   for(const o of obstacles){
    const hitX=player.x+player.w-5>o.x+2&&player.x+5<o.x+o.w-2;
    const hitY=player.y+player.h-4>o.y+3;
    if(hitX&&hitY){
     alive=false;
     jumpButton.disabled=true;
     setMessage(`Game over! Distance: ${Math.floor(distance)}`);
     break;
    }
   }
   draw();
  });

  draw();
  return()=>{alive=false;stop();};
 }

 /* Nexora Jet Strike: exactly four lives and a 60-second countdown. */
 function gameShooter(){
  setInstructions('Drag to steer; tap or hold to fire');
  const{canvas,ctx,wrap}=makeCanvas(380,260);
  const ship={x:190,y:220};
  let bullets=[],enemies=[],particles=[],spawn=0,fireTimer=0,elapsed=0;
  let hull=4,alive=true,timeLeft=60,jetWon=false,jetX=-80,jetY=120,jetScale=1;
  const maxLives=4;

  const livesDisplay=document.createElement('div');
  livesDisplay.className='nx-lives';
  livesDisplay.innerHTML='<span>JET LIVES</span><span class="nx-life-icon" data-jet-lives>❤️❤️❤️❤️</span><strong data-jet-lives-count>4 / 4</strong>';
  wrap.before(livesDisplay);
  const livesIcons=$('[data-jet-lives]',livesDisplay);
  const livesCount=$('[data-jet-lives-count]',livesDisplay);

  const countdownLabel=document.createElement('div');
  countdownLabel.className='nx-lives';
  countdownLabel.innerHTML='<span>MISSION TIME</span><strong data-jet-time>01:00</strong>';
  livesDisplay.after(countdownLabel);
  const timerText=$('[data-jet-time]',countdownLabel);

  function updateLives(){
   const remaining=Math.max(0,hull);
   livesIcons.textContent='❤️'.repeat(remaining)+'🖤'.repeat(maxLives-remaining);
   livesCount.textContent=`${remaining} / ${maxLives}`;
   livesDisplay.setAttribute('aria-label',`${remaining} of ${maxLives} lives remaining`);
   livesCount.style.color=remaining<=1?'#ff718f':'#43f5a5';
  }

  function updateTimer(){
   const t=Math.max(0,Math.ceil(timeLeft));
   timerText.textContent=`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
   timerText.style.color=t<=10?'#ff718f':'#43f5a5';
  }

  function fire(){
   if(!alive||jetWon||fireTimer>0)return;
   bullets.push({x:ship.x,y:ship.y-14,vy:-430});
   fireTimer=.085;
  }

  function explode(x,y,color){
   for(let i=0;i<7;i++)particles.push({x,y,vx:(Math.random()-.5)*170,vy:(Math.random()-.5)*170,life:.25+Math.random()*.3,color});
  }

  function drawVictoryJet(){
   ctx.save();
   ctx.translate(jetX,jetY);
   ctx.scale(jetScale,jetScale);
   ctx.shadowColor='#35e8ff';ctx.shadowBlur=18;
   ctx.fillStyle='#35e8ff';
   ctx.beginPath();
   ctx.moveTo(35,0);ctx.lineTo(-18,-13);ctx.lineTo(-8,-3);ctx.lineTo(-25,5);ctx.lineTo(-7,7);ctx.lineTo(-18,15);ctx.lineTo(35,0);ctx.fill();
   ctx.fillStyle='#eafcff';ctx.fillRect(-8,-4,19,3);
   ctx.fillStyle='#ffb347';ctx.beginPath();ctx.moveTo(-20,-4);ctx.lineTo(-39,0);ctx.lineTo(-20,4);ctx.closePath();ctx.fill();
   ctx.restore();
  }

  function draw(){
   ctx.fillStyle='#030914';ctx.fillRect(0,0,380,260);
   for(let i=0;i<55;i++){
    const x=67*i%380,y=(97*i+elapsed*45)%260;
    ctx.fillStyle=i%4===0?'#35e8ff':'#546a8c';ctx.fillRect(x,y,1.5,1.5);
   }

   if(jetWon){
    drawVictoryJet();
    ctx.save();ctx.textAlign='center';
    ctx.fillStyle='#35e8ff';ctx.shadowColor='#35e8ff';ctx.shadowBlur=14;
    ctx.font='bold 23px system-ui';ctx.fillText('MISSION COMPLETE!',190,45);
    ctx.shadowBlur=0;ctx.fillStyle='#eafcff';ctx.font='13px system-ui';
    ctx.fillText('SURVIVED FOR ONE MINUTE',190,66);
    ctx.fillText('YOUR NEXORA JET IS TAKING OFF!',190,88);
    ctx.restore();
    particles.forEach(p=>{ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);});
    return;
   }

   ctx.save();ctx.translate(ship.x,ship.y);
   ctx.shadowColor='#35e8ff';ctx.shadowBlur=12;ctx.fillStyle='#35e8ff';
   ctx.beginPath();ctx.moveTo(0,-19);ctx.lineTo(12,12);ctx.lineTo(5,8);ctx.lineTo(0,13);ctx.lineTo(-5,8);ctx.lineTo(-12,12);ctx.closePath();ctx.fill();
   ctx.fillStyle='#eafcff';ctx.beginPath();ctx.ellipse(0,-4,4,7,0,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#ffb347';ctx.beginPath();ctx.moveTo(-4,12);ctx.lineTo(0,22+Math.random()*3);ctx.lineTo(4,12);ctx.closePath();ctx.fill();
   ctx.restore();

   ctx.fillStyle='#f6fdff';ctx.shadowColor='#35e8ff';ctx.shadowBlur=8;
   bullets.forEach(b=>ctx.fillRect(b.x-2,b.y-7,4,12));
   enemies.forEach(e=>{
    ctx.save();ctx.translate(e.x,e.y);ctx.rotate(Math.PI);
    ctx.shadowColor='#ff4f8b';ctx.shadowBlur=8;ctx.fillStyle='#ff4f8b';
    ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(10,10);ctx.lineTo(4,7);ctx.lineTo(0,11);ctx.lineTo(-4,7);ctx.lineTo(-10,10);ctx.closePath();ctx.fill();
    ctx.fillStyle='#fff0f5';ctx.beginPath();ctx.ellipse(0,-3,3,5,0,0,Math.PI*2);ctx.fill();ctx.restore();
   });

   particles.forEach(p=>{ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,3,3);});
   ctx.shadowBlur=0;ctx.fillStyle='#e6efff';ctx.font='bold 12px system-ui';
   ctx.fillText(`LIVES ${'♥'.repeat(Math.max(0,hull))}${'♡'.repeat(maxLives-Math.max(0,hull))}`,10,18);
   ctx.fillText(`SCORE ${score}`,10,34);

   if(!alive){
    ctx.fillStyle='#ff718f';ctx.font='bold 22px system-ui';ctx.textAlign='center';
    ctx.fillText('MISSION FAILED',190,118);
    ctx.fillStyle='#eafcff';ctx.font='12px system-ui';
    ctx.fillText(hull<=0?'You lost all four lives.':'Mission ended.',190,139);
    ctx.textAlign='left';
   }
  }

  function victory(){
   if(jetWon||!alive)return;
   jetWon=true;
   alive=false;
   bullets=[];enemies=[];
   setScore(score+100);
   setMessage('🏆 YOU WIN! You survived for one minute. Watch your Nexora jet zoom off!');
   controller.fire=false;
   controller.fireQueued=false;
   countdownLabel.innerHTML='<span>MISSION STATUS</span><strong style="color:#35e8ff">VICTORY!</strong>';
   let launchStart=null;
   function launch(time){
    if(gen!==generation||activeGame!==id||!jetWon)return;
    if(launchStart===null)launchStart=time;
    const t=Math.min(1,(time-launchStart)/1800);
    jetX=-35+t*470;
    jetY=150-t*100;
    jetScale=1+t*.8;
    draw();
    if(t<1)requestAnimationFrame(launch);
    else setMessage('🚀 NEXORA JET LAUNCHED! Mission accomplished. Tap Restart to play again.');
   }
   requestAnimationFrame(launch);
  }

  function loseLife(messageText){
   if(!alive||jetWon)return;
   hull=Math.max(0,hull-1);
   updateLives();
   if(hull<=0){
    alive=false;
    controller.fire=false;
    controller.fireQueued=false;
    setMessage(`${messageText} You lost all four lives. Final score: ${score}. Tap Restart to try again.`);
   }else{
    setMessage(`${messageText} ${hull} ${hull===1?'life':'lives'} remaining.`);
   }
  }

  const stop=frame(dt=>{
   elapsed+=dt;
   if(jetWon){draw();return;}
   if(!alive){draw();return;}

   timeLeft=Math.max(0,timeLeft-dt);
   updateTimer();

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
     e.dead=true;
     explode(e.x,e.y,'#ff6d9a');
     loseLife('Your jet was hit!');
    }

    bullets.forEach(b=>{
     if(!b.dead&&!e.dead&&Math.abs(b.x-e.x)<16&&Math.abs(b.y-e.y)<17){
      b.dead=true;e.dead=true;addScore(10);explode(e.x,e.y,'#35e8ff');
     }
    });

    if(e.y>275&&!e.dead){
     e.dead=true;
     loseLife('An enemy broke through!');
    }
   });

   bullets=bullets.filter(b=>!b.dead);
   enemies=enemies.filter(e=>!e.dead);
   particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;});
   particles=particles.filter(p=>p.life>0);

   if(timeLeft<=0&&alive){victory();return;}
   draw();
  });

  updateLives();
  updateTimer();
  return()=>{alive=false;stop();};
 }

 function gameMath(){
  setInstructions('Tap an answer or press 1–4');

  const toolbar=document.createElement('div');
  toolbar.className='nx-math-toolbar';
  toolbar.innerHTML=`
   <label for="nx-math-level">DIFFICULTY</label>
   <select class="nx-math-difficulty" id="nx-math-level" aria-label="Math difficulty">
    <option value="easy">Easy</option>
    <option value="medium" selected>Medium</option>
    <option value="hard">Hard</option>
   </select>`;

  const dashboard=document.createElement('div');
  dashboard.className='nx-math-dashboard';
  dashboard.innerHTML=`
   <div class="nx-math-stat"><strong data-math-score>0</strong><span>Points</span></div>
   <div class="nx-math-stat"><strong data-math-streak>0</strong><span>Streak</span></div>
   <div class="nx-math-stat"><strong data-math-accuracy>100%</strong><span>Accuracy</span></div>`;

  const status=document.createElement('div');
  status.className='nx-result';
  status.setAttribute('aria-live','polite');
  status.textContent='Solve the question to earn points.';

  const progress=document.createElement('div');
  progress.className='nx-math-progress';
  progress.setAttribute('role','progressbar');
  progress.setAttribute('aria-label','Question timer');
  progress.setAttribute('aria-valuemin','0');
  progress.setAttribute('aria-valuemax','15');
  progress.innerHTML='<span data-math-progress></span>';

  const timer=document.createElement('div');
  timer.className='nx-result';
  timer.textContent='⏱ 15 seconds';

  const question=document.createElement('div');
  question.className='nx-question';
  question.setAttribute('aria-label','Math question');

  const answers=document.createElement('div');
  answers.className='nx-answer-grid';

  const actions=document.createElement('div');
  actions.className='nx-game-action-row';
  actions.innerHTML='<button type="button" class="nx-btn" data-math-skip>Skip Question →</button>';

  area.append(toolbar,dashboard,status,timer,progress,question,answers,actions);

  const levelSelect=$('#nx-math-level',toolbar);
  const scoreValue=$('[data-math-score]',dashboard);
  const streakValue=$('[data-math-streak]',dashboard);
  const accuracyValue=$('[data-math-accuracy]',dashboard);
  const progressFill=$('[data-math-progress]',progress);

  let answer=0,correctStreak=0,locked=false,choices=[],questionToken=0;
  let questions=0,correctAnswers=0,roundScore=0,timeLeft=15,timerInterval=null;
  const roundDuration=15;

  function updateDashboard(){
   scoreValue.textContent=roundScore;
   streakValue.textContent=correctStreak;
   accuracyValue.textContent=questions?`${Math.round(correctAnswers/questions*100)}%`:'100%';
  }

  function stopTimer(){
   if(timerInterval!==null){clearInterval(timerInterval);timerInterval=null;}
  }

  function finishRound(){
   locked=true;
   stopTimer();
   answers.querySelectorAll('button').forEach(b=>b.disabled=true);
   levelSelect.disabled=false;
   actions.innerHTML='<button type="button" class="nx-btn nx-btn-primary" data-math-again>↻ Play Again</button>';
   status.textContent=`⏱ Time's up! You scored ${roundScore} points.`;
   question.textContent='ROUND COMPLETE';
   timer.textContent=`${questions} questions · ${correctAnswers} correct`;
   progressFill.style.width='0%';
   progress.setAttribute('aria-valuenow','0');
   setMessage(`Math Challenge finished. Score: ${roundScore}.`);
  }

  function startTimer(){
   stopTimer();
   timeLeft=roundDuration;
   function renderTimer(){
    timer.textContent=`⏱ ${timeLeft} second${timeLeft===1?'':'s'} left`;
    progressFill.style.width=`${timeLeft/roundDuration*100}%`;
    progress.setAttribute('aria-valuenow',String(timeLeft));
    timer.style.color=timeLeft<=5?'#ff718f':'';
   }
   renderTimer();
   timerInterval=setInterval(()=>{
    if(gen!==generation||activeGame!==id){stopTimer();return;}
    if(paused)return;
    timeLeft=Math.max(0,timeLeft-1);
    renderTimer();
    if(timeLeft<=0)finishRound();
   },1000);
  }

  function randomInt(min,max){
   return Math.floor(Math.random()*(max-min+1))+min;
  }

  function makeProblem(){
   const level=levelSelect.value;
   const range=level==='easy'?10:level==='hard'?50:20;
   const opCount=level==='easy'?3:level==='hard'?5:4;
   const op=Math.floor(Math.random()*(level==='easy'?3:4));
   let a,b,symbol;

   if(op===0){
    a=randomInt(1,range);b=randomInt(1,range);
    answer=a+b;symbol='+';
   }else if(op===1){
    a=randomInt(1,range);b=randomInt(1,range);
    if(b>a)[a,b]=[b,a];
    answer=a-b;symbol='−';
   }else if(op===2){
    const limit=level==='easy'?5:level==='hard'?15:10;
    a=randomInt(1,limit);b=randomInt(1,limit);
    answer=a*b;symbol='×';
   }else{
    b=randomInt(2,level==='hard'?12:9);
    answer=randomInt(1,level==='hard'?20:10);
    a=b*answer;symbol='÷';
   }

   return{a,b,symbol,answer,opCount};
  }

  function newQuestion(){
   if(questions>=30){finishRound();return;}
   locked=false;
   questionToken++;
   const p=makeProblem();
   answer=p.answer;
   question.textContent=`${p.a} ${p.symbol} ${p.b} = ?`;
   question.setAttribute('aria-label',`${p.a} ${p.symbol} ${p.b}, what is the answer?`);
   status.textContent='Choose the correct answer.';
   answers.innerHTML='';

   const options=new Set([answer]);
   let attempts=0;
   while(options.size<4&&attempts++<100){
    const offset=randomInt(1,p.opCount*2);
    const candidate=Math.random()<.5?answer+offset:answer-offset;
    if(candidate>=0&&candidate!==answer)options.add(candidate);
   }
   while(options.size<4){
    let candidate=randomInt(0,Math.max(20,answer+20));
    if(candidate!==answer)options.add(candidate);
   }
 choices=[...options].sort(()=>Math.random()-.5);
   answers.innerHTML=choices.map((v,i)=>`
    <button type="button" class="nx-answer" data-answer="${v}" aria-label="Option ${i+1}: ${v}">
     <span>${i+1}.</span> ${v}
    </button>`).join('');

   startTimer();
  }

  function chooseAnswer(index){
   if(locked||index<0||index>=choices.length)return;
   locked=true;
   questions++;
   const selected=choices[index];
   const buttons=$$('[data-answer]',answers);

   buttons.forEach((b,i)=>{
    b.disabled=true;
    if(Number(b.dataset.answer)===answer)b.classList.add('nx-correct');
    if(i===index&&selected!==answer)b.classList.add('nx-wrong');
   });

   if(selected===answer){
    correctAnswers++;
    correctStreak++;
    const base=levelSelect.value==='easy'?10:levelSelect.value==='hard'?20:15;
    const bonus=Math.min(15,(correctStreak-1)*2);
    const points=base+bonus;
    roundScore+=points;
    addScore(points);
    status.textContent=`✓ Correct! +${points} points${bonus?` (including ${bonus} streak bonus)`:''}`;
    status.style.color='var(--green)';
   }else{
    correctStreak=0;
    status.textContent=`Not quite. The correct answer is ${answer}.`;
    status.style.color='#ff718f';
   }

   updateDashboard();
   stopTimer();

   const token=questionToken;
   timeout(()=>{
    if(token!==questionToken)return;
    status.style.color='';
    if(questions>=30)finishRound();
    else newQuestion();
   },750);
  }

  listen(answers,'click',e=>{
   const b=e.target.closest('[data-answer]');
   if(b)chooseAnswer(choices.indexOf(Number(b.dataset.answer)));
  });

  listen(toolbar,'change',e=>{
   if(e.target!==levelSelect)return;
   if(locked&&questions>=30)return;
   questionToken++;
   questions=0;
   correctAnswers=0;
   correctStreak=0;
   roundScore=0;
   updateDashboard();
   newQuestion();
  });

  listen(actions,'click',e=>{
   if(e.target.closest('[data-math-skip]')){
    if(locked)return;
    questions++;
    correctStreak=0;
    updateDashboard();
    stopTimer();
    status.textContent=`Skipped. The answer was ${answer}.`;
    locked=true;
    const token=++questionToken;
    timeout(()=>{
     if(token!==questionToken)return;
     if(questions>=30)finishRound();
     else newQuestion();
    },450);
   }
   if(e.target.closest('[data-math-again]')){
    questionToken++;
    questions=0;
    correctAnswers=0;
    correctStreak=0;
    roundScore=0;
    levelSelect.disabled=false;
    actions.innerHTML='<button type="button" class="nx-btn" data-math-skip>Skip Question →</button>';
    updateDashboard();
    newQuestion();
   }
  });

  mathTapHandler=e=>{
   const r=pad.getBoundingClientRect();
   const x=(e.clientX-r.left)/r.width;
   const y=(e.clientY-r.top)/r.height;
   const col=Math.min(1,Math.max(0,Math.floor(x*2)));
   const row=Math.min(1,Math.max(0,Math.floor(y*2)));
   chooseAnswer(row*2+col);
  };

  mathKeyHandler=k=>chooseAnswer(Number(k)-1);
  updateDashboard();
  newQuestion();

  return()=>{
   stopTimer();
   questionToken++;
   mathTapHandler=null;
   mathKeyHandler=null;
  };
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
   else if((move==='rock'&&computer==='scissors')||(move==='paper'&&computer==='rock')||(move==='scissors'&&computer==='paper')){wins++;matchAPI.addMatchResult('you');addScore(1);msg='You win!';}
   else{losses++;matchAPI.addMatchResult('computer');msg='Computer wins!';}
   result.textContent=`${icons[move]} vs ${icons[computer]}`;
   status.textContent=msg;
   tally.textContent=`YOU ${wins} : ${losses} COMPUTER · Draws: ${draws}`;
  }
  listen(buttons,'click',e=>{const b=e.target.closest('[data-rps]');if(b)play(b.dataset.rps);});
  rpsTapHandler=e=>{const x=(e.clientX-pad.getBoundingClientRect().left)/pad.getBoundingClientRect().width;play(x<1/3?'rock':x<2/3?'paper':'scissors');};
  rpsKeyHandler=key=>{if(key==='r')play('rock');if(key==='p')play('paper');if(key==='s')play('scissors');};
  return()=>{rpsTapHandler=null;rpsKeyHandler=null;};
 }

 function gameHangman(){
  setInstructions('Tap a letter or use your keyboard');

  const words=[
   {word:'GALAXY',hint:'A huge collection of stars'},
   {word:'PLANET',hint:'A world that orbits a star'},
   {word:'ROCKET',hint:'A vehicle used to reach space'},
   {word:'JUNGLE',hint:'A dense tropical forest'},
   {word:'PUZZLE',hint:'A problem that needs solving'},
   {word:'ARCADE',hint:'A place filled with video games'},
   {word:'NEXORA',hint:'The name of this digital universe'},
   {word:'GAMING',hint:'Playing interactive video games'},
   {word:'NEBULA',hint:'A cloud of gas and dust in space'},
   {word:'PYTHON',hint:'A popular programming language'},
   {word:'COMPUTER',hint:'An electronic device for processing data'},
   {word:'RAINBOW',hint:'A colourful arc in the sky'},
   {word:'DIAMOND',hint:'A very hard precious gemstone'},
   {word:'OCEAN',hint:'A vast body of salt water'},
   {word:'FUTURE',hint:'The time that has not happened yet'},
   {word:'JAVASCRIPT',hint:'A language used to make websites interactive'},
   {word:'BROWSER',hint:'An app used to explore the web'},
   {word:'KEYBOARD',hint:'A device used to type'},
   {word:'ELEPHANT',hint:'A large animal with a trunk'},
   {word:'LIGHTNING',hint:'A bright electrical flash during a storm'},
   {word:'ASTRONAUT',hint:'A person trained to travel into space'},
   {word:'VOLCANO',hint:'A mountain that can erupt'},
   {word:'BUTTERFLY',hint:'An insect with colourful wings'},
   {word:'WATERFALL',hint:'Water dropping from a height'}
  ];

  const status=document.createElement('div');
  status.className='nx-result';
  status.setAttribute('aria-live','polite');

  const drawing=document.createElement('div');
  drawing.className='nx-hangman-art';

  const display=document.createElement('div');
  display.className='nx-word';
  display.setAttribute('aria-label','Hidden word');

  const meta=document.createElement('div');
  meta.className='nx-hangman-meta';

  const letters=document.createElement('div');
  letters.className='nx-letter-grid';
  letters.setAttribute('aria-label','Letter choices');
  letters.innerHTML='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(l=>`<button type="button" class="nx-letter" data-letter="${l}" aria-label="Guess ${l}">${l}</button>`).join('');

  const actions=document.createElement('div');
  actions.className='nx-game-action-row';
  actions.innerHTML='<button type="button" class="nx-btn nx-btn-primary" data-hangman-new>↻ New Word</button><button type="button" class="nx-btn" data-hangman-hint>💡 Reveal Hint</button>';

  area.append(status,drawing,display,meta,letters,actions);

  let word='',hint='',guessed=new Set(),mistakes=0,ended=false,hintShown=false;
  let rounds=0,solved=0,previousWord='',roundToken=0;
  const maxMistakes=6;

  function drawingMarkup(){
   const parts=[
    '',
    '<circle cx="110" cy="38" r="17" />',
    '<path d="M110 55 V112" />',
    '<path d="M110 68 L82 91" />',
    '<path d="M110 68 L138 91" />',
    '<path d="M110 112 L85 145" />',
    '<path d="M110 112 L135 145" />'
   ];

   return`
    <svg viewBox="0 0 210 175" role="img" aria-label="Hangman progress: ${mistakes} of ${maxMistakes} incorrect guesses" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
     <g stroke="var(--muted)" opacity=".7">
      <path d="M35 155 H165"/>
      <path d="M58 155 V18 H110 V21"/>
     </g>
     <g stroke="${mistakes>=maxMistakes?'#ff718f':'var(--cyan)'}">${parts.slice(0,mistakes+1).join('')}</g>
    </svg>`;
  }

  function render(){
   display.textContent=word.split('').map(l=>guessed.has(l)?l:'_').join(' ');
   display.setAttribute('aria-label',word.split('').map(l=>guessed.has(l)?l:'hidden letter').join(', '));
   drawing.innerHTML=drawingMarkup();

   const remaining=maxMistakes-mistakes;
   meta.innerHTML=`
    <span>❤️ Chances left: <strong>${remaining}</strong></span>
    <span>·</span>
    <span>Words solved: <strong>${solved}</strong></span>
    <span>·</span>
    <span>Round: <strong>${rounds}</strong></span>`;

   $$('[data-letter]',letters).forEach(b=>{
    const letter=b.dataset.letter;
    b.disabled=ended||guessed.has(letter);
    b.classList.toggle('nx-letter-correct',guessed.has(letter)&&word.includes(letter));
    b.classList.toggle('nx-letter-wrong',guessed.has(letter)&&!word.includes(letter));
   });

   const hintButton=$('[data-hangman-hint]',actions);
   if(hintButton){
    hintButton.disabled=ended||hintShown;
    hintButton.textContent=hintShown?'💡 Hint Revealed':'💡 Reveal Hint';
   }
  }
  function reset(){
   roundToken++;
   const available=words.filter(w=>w.word!==previousWord);
   const chosen=available[Math.floor(Math.random()*available.length)]||words[0];
   word=chosen.word;
   hint=chosen.hint;
   previousWord=word;
   guessed=new Set();
   mistakes=0;
   ended=false;
   hintShown=false;
   rounds++;
   status.style.color='';
   status.textContent='Guess the hidden word. Each incorrect letter costs one chance.';
   render();
   setMessage('');
  }

  function endRound(won){
   ended=true;
   if(won){
    solved++;
    const points=Math.max(5,20-mistakes*2);
    addScore(points);
    status.style.color='var(--green)';
    status.textContent=`🎉 Excellent! You solved ${word} and earned ${points} points.`;
    setMessage(`Word solved! +${points} points.`);
   }else{
    status.style.color='#ff718f';
    status.textContent=`Round over! The word was ${word}.`;
    setMessage(`The hidden word was ${word}. Try another!`);
   }
   render();
  }

  function guess(letter){
   letter=String(letter).toUpperCase();
   if(ended||guessed.has(letter)||!/^[A-Z]$/.test(letter))return;

   guessed.add(letter);
   if(!word.includes(letter))mistakes++;

   if(word.split('').every(l=>guessed.has(l))){
    endRound(true);
   }else if(mistakes>=maxMistakes){
    endRound(false);
   }else{
    status.style.color='';
    status.textContent=word.includes(letter)
     ?`✓ Good guess! "${letter}" is in the word.`
     :`"${letter}" is not in the word. Keep trying!`;
    render();
   }
  }
  listen(letters,'click',e=>{
   const b=e.target.closest('[data-letter]');
   if(b)guess(b.dataset.letter);
  });

  listen(actions,'click',e=>{
   if(e.target.closest('[data-hangman-new]'))reset();
   if(e.target.closest('[data-hangman-hint]')&&!ended&&!hintShown){
    hintShown=true;
    status.textContent=`💡 Hint: ${hint}`;
    render();
   }
  });
  hangmanTapHandler=e=>{
   const r=pad.getBoundingClientRect();
   const x=(e.clientX-r.left)/r.width;
   const y=(e.clientY-r.top)/r.height;
   const col=Math.min(6,Math.max(0,Math.floor(x*7)));
   const row=Math.min(3,Math.max(0,Math.floor(y*4)));
   const i=row*7+col;
   if(i>=0&&i<26)guess('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]);
  };

  hangmanKeyHandler=guess;
  reset();

  return()=>{
   roundToken++;
   hangmanTapHandler=null;
   hangmanKeyHandler=null;
  };
 }
 /* Mirrored dove facing right. */
 function gameDove(){
  setInstructions('Drag the pad to guide the dove up, down, left, and right');
  const{ctx}=makeCanvas(300,380);
  const dove={x:75,y:185,r:12};
  let obstacles=[],stars=[],elapsed=0,spawn=0,starSpawn=0,alive=true,started=false,passed=0,collected=0;
  const gap=140,pw=36,baseSpeed=225;
  function draw(){
   const sky=ctx.createLinearGradient(0,0,0,380);
   sky.addColorStop(0,'#071a3b');sky.addColorStop(.6,'#14518a');sky.addColorStop(1,'#77c7ee');
   ctx.fillStyle=sky;ctx.fillRect(0,0,300,380);
   for(let i=0;i<24;i++){ctx.fillStyle='#ffffff88';ctx.fillRect(31*i%300,59*i%190,2,2);}
   for(let i=0;i<4;i++){const x=((i*100-elapsed*12)%380+380)%380-35,y=55+i*48;ctx.fillStyle='#ffffff30';ctx.beginPath();ctx.arc(x,y,17,0,7);ctx.arc(x+18,y-8,20,0,7);ctx.arc(x+37,y,15,0,7);ctx.fill();}
   obstacles.forEach(o=>{ctx.fillStyle='#43f5a5';ctx.shadowColor='#43f5a5';ctx.shadowBlur=8;ctx.fillRect(o.x,0,pw,o.top);ctx.fillRect(o.x,o.top+gap,pw,380-o.top-gap);ctx.fillStyle='#20c98f';ctx.fillRect(o.x-3,o.top-7,pw+6,7);ctx.fillRect(o.x-3,o.top+gap,pw+6,7);});
   ctx.shadowBlur=0;
   stars.forEach(s=>{ctx.save();ctx.translate(s.x,s.y);ctx.rotate(elapsed*2);ctx.fillStyle='#ffe66d';ctx.shadowColor='#ffe66d';ctx.shadowBlur=12;ctx.font='21px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('★',0,0);ctx.restore();});
   ctx.save();ctx.translate(dove.x,dove.y);ctx.scale(-1,1);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='30px sans-serif';ctx.shadowColor='#fff';ctx.shadowBlur=10;ctx.fillText('🕊️',0,0);ctx.restore();
   ctx.fillStyle='#fff';ctx.font='bold 12px system-ui';ctx.fillText(`SCORE ${passed*10+collected*5}`,10,20);ctx.fillText(`STARS ${collected}`,10,37);
   if(!started&&alive){ctx.textAlign='center';ctx.fillText('DRAG THE PAD TO FLY',150,325);ctx.textAlign='start';}
  }
  const stop=frame(dt=>{
   elapsed+=dt;if(!alive){draw();return;}
   if(controller.active){started=true;dove.x=40+(controller.x+1)/2*145;dove.y=25+(controller.y+1)/2*330;}
   const speed=Math.min(360,baseSpeed+elapsed*2.5);
   spawn-=dt;starSpawn-=dt;
   if(started&&spawn<=0){const max=380-gap-42;obstacles.push({x:310,top:42+Math.random()*(max-42),scored:false});spawn=Math.max(.72,1.15-elapsed*.004);}
   if(started&&starSpawn<=0){stars.push({x:310,y:40+Math.random()*300});starSpawn=.65+Math.random()*.5;}
   obstacles.forEach(o=>{o.x-=speed*dt;if(!o.scored&&o.x+pw<dove.x){o.scored=true;passed++;setScore(passed*10+collected*5);}if(dove.x+dove.r>o.x&&dove.x-dove.r<o.x+pw&&(dove.y-dove.r<o.top||dove.y+dove.r>o.top+gap)){alive=false;setMessage(`Dove Flight over! Score: ${score}`);}});
   stars.forEach(s=>{s.x-=speed*dt;if(!s.collected&&Math.abs(s.x-dove.x)<22&&Math.abs(s.y-dove.y)<24){s.collected=true;collected++;addScore(5);}});
   obstacles=obstacles.filter(o=>o.x+pw>-5);stars=stars.filter(s=>s.x>-25&&!s.collected);
   if(dove.y<dove.r||dove.y>380-dove.r||dove.x<dove.r||dove.x>300-dove.r){alive=false;setMessage(`Flight ended! Score: ${score}`);}
   draw();
  });
  draw();
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