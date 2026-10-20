```javascript
(() => {
  'use strict';

  const ROOT = document.getElementById('nexora-games');
  if (!ROOT || document.getElementById('nx2-launcher')) return;

  const GAMES = [
    { id:'memory', icon:'🧠', name:'Memory Match', image:'photo-1516321318423-f06f85e504b3' },
    { id:'racing', icon:'🏎️', name:'Neon Racing', image:'photo-1492144534655-ae79c964c9d7' },
    { id:'tower', icon:'🗼', name:'Tower Stack', image:'photo-1511818966892-d7d671e672a2' },
    { id:'mine', icon:'💣', name:'Minefield Mystery', image:'photo-1518709268805-4e9042af9f23' },
    { id:'puzzle', icon:'🧩', name:'Sliding Puzzle', image:'photo-1513364776144-60967b0f800f' },
    { id:'alien', icon:'👾', name:'Alien Invasion', image:'photo-1446776811953-b23d57bd21aa' },
    { id:'zombie', icon:'🥷', name:'Ninja Shadow Strike', image:'photo-1519608487953-e999c86e7455' },
    { id:'word', icon:'🔤', name:'Word Scramble', image:'photo-1455390582262-044cdead277a' },
    { id:'hockey', icon:'🏒', name:'Air Hockey', image:'photo-1519861531473-9200262188bf' },
    { id:'maze', icon:'🌀', name:'Neon Maze', image:'photo-1519608487953-e999c86e7455' }
  ];

  const DIFFICULTIES = {
    Easy:{speed:.75,enemies:.65,time:1.4,memory:1.3},
    Medium:{speed:1,enemies:1,time:1,memory:1},
    Hard:{speed:1.35,enemies:1.4,time:.8,memory:.8},
    Hardest:{speed:1.75,enemies:1.9,time:.65,memory:.6}
  };

  let difficulty='Medium',currentGame=null,cleanupGame=null,animationFrame=0,timers=[],gameToken=0,savedOverflow='';

  const style=document.createElement('style');
  style.textContent=`
    #nx2-launcher,#nx2-overlay{font-family:system-ui,-apple-system,sans-serif;box-sizing:border-box}
    #nx2-launcher *,#nx2-overlay *{box-sizing:border-box}
    #nx2-launcher{width:100%;max-width:1100px;margin:14px auto 24px;color:var(--text,#eef5ff)}
    #nx2-launcher .nx2-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
    #nx2-launcher .nx2-heading h2{margin:0;font-size:clamp(17px,4vw,24px)}
    #nx2-launcher .nx2-heading p{margin:4px 0 0;font-size:11px;opacity:.7}
    #nx2-launcher .nx2-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));grid-template-rows:repeat(2,auto);gap:8px;width:100%}
    #nx2-launcher .nx2-card{position:relative;isolation:isolate;overflow:hidden;appearance:none;display:flex;min-width:0;min-height:100px;flex-direction:column;align-items:center;justify-content:center;gap:7px;padding:8px 3px;border:1px solid #294564;border-radius:12px;background:#091323;color:#fff;text-align:center;cursor:pointer;box-shadow:0 4px 12px #0005;-webkit-tap-highlight-color:transparent;transition:transform .15s,border-color .15s}
    #nx2-launcher .nx2-card::before{content:"";position:absolute;inset:0;z-index:-2;background-image:var(--nx2-image);background-size:cover;background-position:center;opacity:.65;transition:transform .25s}
    #nx2-launcher .nx2-card::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,#02081766,#020817ee 85%)}
    #nx2-launcher .nx2-card:active{transform:scale(.97)}
    #nx2-launcher .nx2-card:hover{border-color:#35e8ff;box-shadow:0 0 12px #35e8ff44}
    #nx2-launcher .nx2-icon{font-size:clamp(20px,4vw,30px);line-height:1;text-shadow:0 2px 8px #000}
    #nx2-launcher .nx2-name{display:block;width:100%;font-size:clamp(9px,1.7vw,12px);font-weight:800;line-height:1.2;overflow-wrap:anywhere;text-shadow:0 2px 5px #000}
    #nx2-overlay{position:fixed;inset:0;z-index:2147483000;display:none;flex-direction:column;overflow:auto;overscroll-behavior:contain;padding:max(9px,env(safe-area-inset-top)) 10px max(12px,env(safe-area-inset-bottom));background:#050914;color:#eef5ff}
    #nx2-overlay.nx2-active{display:flex}
    #nx2-overlay .nx2-topbar{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;max-width:850px;margin:0 auto 8px}
    #nx2-overlay .nx2-title{flex:1;min-width:0;margin:0;font-size:clamp(15px,4vw,22px);text-align:center;overflow-wrap:anywhere}
    #nx2-overlay .nx2-btn{appearance:none;border:1px solid #35e8ff;border-radius:9px;padding:8px 10px;background:#10283b;color:#e7fbff;font-size:12px;font-weight:800;cursor:pointer;touch-action:manipulation;white-space:nowrap}
    #nx2-overlay .nx2-content{width:100%;max-width:850px;margin:0 auto;text-align:center}
    #nx2-overlay .nx2-status{min-height:22px;margin:7px 0;color:#7cf4ff;font-size:13px;font-weight:700;line-height:1.5}
    #nx2-overlay .nx2-panel{width:100%;max-width:520px;margin:0 auto;padding:10px;border:1px solid #203957;border-radius:15px;background:linear-gradient(145deg,#0d192c,#070d19)}
    #nx2-overlay .nx2-board{display:grid;gap:6px;width:100%;max-width:390px;margin:10px auto}
    #nx2-overlay .nx2-cell{display:flex;min-width:0;aspect-ratio:1;align-items:center;justify-content:center;border:1px solid #294664;border-radius:8px;background:#101d32;color:#f1fbff;font-size:clamp(14px,5vw,27px);font-weight:800;cursor:pointer;touch-action:manipulation;user-select:none}
    #nx2-overlay .nx2-cell.nx2-selected{border-color:#35e8ff;background:#14354b}
    #nx2-overlay .nx2-cell.nx2-safe{background:#124333;border-color:#43f5a5}
    #nx2-overlay .nx2-cell.nx2-bomb{background:#51202c;border-color:#ff6687}
    #nx2-overlay .nx2-controls{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;margin:10px auto}
    #nx2-overlay .nx2-help{max-width:520px;margin:10px auto;color:#aebfd4;font-size:12px;line-height:1.5}
    #nx2-overlay canvas{display:block;width:100%;max-width:520px;height:auto;margin:8px auto;border:1px solid #25415f;border-radius:12px;background:#07101f;touch-action:none}
    #nx2-overlay .nx2-input{display:block;width:100%;max-width:320px;margin:10px auto;padding:12px;border:1px solid #34516f;border-radius:10px;background:#07101e;color:#fff;font-size:16px;text-align:center}
    #nx2-overlay .nx2-big{font-size:clamp(23px,7vw,38px);font-weight:900;letter-spacing:.08em}
    #nx2-overlay .nx2-small{color:#b5c6dc;font-size:12px}
    #nx2-overlay .nx2-difficulty{width:100%;max-width:520px;margin:0 auto 8px;border:1px solid #263d5c;border-radius:11px;background:#0a1424;text-align:left}
    #nx2-overlay .nx2-difficulty summary{display:flex;justify-content:space-between;padding:10px 12px;color:#dffaff;font-size:12px;font-weight:800;cursor:pointer;list-style:none}
    #nx2-overlay .nx2-difficulty summary::after{content:'+';color:#35e8ff;font-size:18px}
    #nx2-overlay .nx2-difficulty[open] summary::after{content:'−'}
    #nx2-overlay .nx2-difficulty-options{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;padding:0 8px 9px}
    #nx2-overlay .nx2-difficulty-option{padding:9px 3px;border:1px solid #29415f;border-radius:8px;background:#101d32;color:#dce9f8;font-size:10px;font-weight:800;cursor:pointer}
    #nx2-overlay .nx2-difficulty-option[aria-pressed="true"]{border-color:#35e8ff;background:#12364a;color:#8ff7ff}
    #nx2-overlay .nx2-touch-area{display:flex;align-items:center;justify-content:center;gap:12px;width:100%;max-width:520px;margin:12px auto 5px;touch-action:none;user-select:none;-webkit-user-select:none}
    #nx2-overlay .nx2-pad-wrap{flex:1;min-width:0}
    #nx2-overlay .nx2-pad{position:relative;width:100%;height:clamp(100px,29vw,150px);border:3px solid #087f9d;border-radius:26px;background:radial-gradient(ellipse at center,#102e45 0,#0a1b2e 65%,#07101d 100%);box-shadow:inset 0 0 18px #0008,0 0 10px #00dfff33;touch-action:none;overflow:hidden}
    #nx2-overlay .nx2-pad::before,#nx2-overlay .nx2-pad::after{position:absolute;content:'';background:#16425b88;pointer-events:none}
    #nx2-overlay .nx2-pad::before{width:1px;height:100%;left:50%;top:0}
    #nx2-overlay .nx2-pad::after{height:1px;width:100%;top:50%;left:0}
    #nx2-overlay .nx2-pad-inner{position:absolute;inset:10px;border:1px solid #1b4058;border-radius:16px;pointer-events:none}
    #nx2-overlay .nx2-knob{position:absolute;left:50%;top:50%;width:clamp(48px,14vw,70px);height:clamp(48px,14vw,70px);border:3px solid #35e8ff;border-radius:50%;background:radial-gradient(circle at 35% 30%,#35e8ff,#07516d 70%);box-shadow:0 0 12px #35e8ff99,inset 0 0 8px #35e8ff55;transform:translate(-50%,-50%);pointer-events:none}
    #nx2-overlay .nx2-knob::after{content:'';position:absolute;width:30%;height:30%;left:35%;top:35%;border-radius:50%;background:#5cf5ff;box-shadow:0 0 12px #35e8ff}
    #nx2-overlay .nx2-pad-hint{display:block;margin-top:5px;color:#8da6bf;font-size:10px;text-align:center}
    #nx2-overlay .nx2-fire{width:clamp(68px,19vw,88px);height:clamp(68px,19vw,88px);flex:0 0 auto;border:2px solid #ff6687;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ff718d,#81213f);color:#fff;font-size:12px;font-weight:900;box-shadow:0 0 14px #ff668733;touch-action:none}
    #nx2-overlay .nx2-fire.nx2-firing{transform:scale(.94);box-shadow:0 0 24px #ff6687aa}
    @media(max-width:420px){#nx2-launcher{margin-top:10px}#nx2-launcher .nx2-grid{gap:5px}#nx2-launcher .nx2-card{min-height:78px;padding:6px 2px;gap:5px;border-radius:9px}#nx2-launcher .nx2-name{font-size:9px}#nx2-overlay{padding-left:6px;padding-right:6px}#nx2-overlay .nx2-panel{padding:7px}#nx2-overlay .nx2-board{gap:4px}#nx2-overlay .nx2-topbar{gap:5px}#nx2-overlay .nx2-btn{padding:8px 7px;font-size:11px}}
    @media(max-width:340px){#nx2-overlay .nx2-touch-area{gap:7px}#nx2-overlay .nx2-pad{height:94px}#nx2-overlay .nx2-fire{width:58px;height:58px;font-size:9px}}
  `;
  document.head.appendChild(style);

  const launcher=document.createElement('section');
  launcher.id='nx2-launcher';
  launcher.setAttribute('aria-label','Additional Nexora arcade games');
  launcher.innerHTML=`
    <div class="nx2-heading"><div><h2>⚡ EXTRA ARCADE</h2><p>Choose a game to play</p></div></div>
    <div class="nx2-grid">${GAMES.map(g=>`
      <button class="nx2-card" type="button" data-nx2-game="${g.id}"
        style="--nx2-image:url('https://images.unsplash.com/${g.image}?auto=format&fit=crop&w=500&q=75')">
        <span class="nx2-icon">${g.icon}</span><span class="nx2-name">${g.name}</span>
      </button>`).join('')}
    </div>`;
  ROOT.parentNode.insertBefore(launcher,ROOT);

  const overlay=document.createElement('section');
  overlay.id='nx2-overlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.innerHTML=`
    <div class="nx2-topbar">
      <button class="nx2-btn" id="nx2-back" type="button">← Games</button>
      <h2 class="nx2-title" id="nx2-game-title">Nexora Game</h2>
      <button class="nx2-btn" id="nx2-restart" type="button">↻ Restart</button>
    </div>
    <details class="nx2-difficulty" id="nx2-difficulty-menu">
      <summary><span>⚙ DIFFICULTY</span><span id="nx2-difficulty-label">Medium</span></summary>
      <div class="nx2-difficulty-options">${Object.keys(DIFFICULTIES).map(n=>`<button class="nx2-difficulty-option" type="button" data-nx2-difficulty="${n}" aria-pressed="${n===difficulty}">${n}</button>`).join('')}</div>
    </details>
    <div class="nx2-content" id="nx2-content"></div>`;
  document.body.appendChild(overlay);

  const content=overlay.querySelector('#nx2-content');
  const title=overlay.querySelector('#nx2-game-title');
  const backButton=overlay.querySelector('#nx2-back');
  const restartButton=overlay.querySelector('#nx2-restart');
  const difficultyMenu=overlay.querySelector('#nx2-difficulty-menu');
  const difficultyLabel=overlay.querySelector('#nx2-difficulty-label');

  function later(fn,delay){
    const token=gameToken;
    const id=setTimeout(()=>{
      timers=timers.filter(t=>t!==id);
      if(token===gameToken&&overlay.classList.contains('nx2-active'))fn();
    },delay);
    timers.push(id);
    return id;
  }

  function clearGame(){
    gameToken++;
    if(animationFrame){cancelAnimationFrame(animationFrame);animationFrame=0;}
    timers.forEach(clearTimeout);timers=[];
    if(typeof cleanupGame==='function'){try{cleanupGame();}catch(e){console.warn(e);}}
    cleanupGame=null;
    content.innerHTML='';
  }

  function shell(message){
    content.innerHTML=`<div class="nx2-panel"><div class="nx2-status" aria-live="polite">${message||''}</div><div id="nx2-game-area"></div><div class="nx2-controls" id="nx2-controls"></div><div class="nx2-help" id="nx2-help"></div></div>`;
    return {area:content.querySelector('#nx2-game-area'),controls:content.querySelector('#nx2-controls'),help:content.querySelector('#nx2-help')};
  }

  function status(message){const el=content.querySelector('.nx2-status');if(el)el.textContent=message;}
  function button(label,action){const el=document.createElement('button');el.type='button';el.className='nx2-btn';el.textContent=label;el.addEventListener('click',action);return el;}
  function activeDifficulty(){return DIFFICULTIES[difficulty];}

  function addTouchpad(container,onMove,options={}){
    const wrap=document.createElement('div');wrap.className='nx2-touch-area';
    const padWrap=document.createElement('div');padWrap.className='nx2-pad-wrap';
    const pad=document.createElement('div');pad.className='nx2-pad';pad.setAttribute('role','application');pad.setAttribute('aria-label','Directional joystick');
    const inner=document.createElement('div');inner.className='nx2-pad-inner';
    const knob=document.createElement('div');knob.className='nx2-knob';
    pad.append(inner,knob);padWrap.appendChild(pad);
    const hint=document.createElement('span');hint.className='nx2-pad-hint';hint.textContent='DRAG TO MOVE';padWrap.appendChild(hint);wrap.appendChild(padWrap);
    let fireButton=null,fireInterval=0;
    function stopFiring(){if(fireInterval){clearInterval(fireInterval);fireInterval=0;}if(fireButton)fireButton.classList.remove('nx2-firing');if(options.onFireEnd)options.onFireEnd();}
    if(options.fire){
      fireButton=document.createElement('button');fireButton.type='button';fireButton.className='nx2-fire';fireButton.textContent=options.fireLabel||'FIRE';
      const start=e=>{e.preventDefault();if(fireInterval)return;fireButton.classList.add('nx2-firing');if(options.onFire)options.onFire();fireInterval=setInterval(()=>{if(options.onFire)options.onFire();},options.fireRate||150);};
      fireButton.addEventListener('pointerdown',start);['pointerup','pointercancel','lostpointercapture'].forEach(n=>fireButton.addEventListener(n,stopFiring));fireButton.addEventListener('contextmenu',e=>e.preventDefault());wrap.appendChild(fireButton);
    }
    container.appendChild(wrap);
    let pointerId=null;
    function resetPad(){knob.style.left='50%';knob.style.top='50%';if(pointerId!==null){pointerId=null;onMove(0,0,false);}}
    function update(e){
      const r=pad.getBoundingClientRect();
      const rx=Math.max(30,r.width*.43),ry=Math.max(30,r.height*.43);
      let dx=(e.clientX-(r.left+r.width/2))/rx,dy=(e.clientY-(r.top+r.height/2))/ry;
      const len=Math.hypot(dx,dy);if(len>1){dx/=len;dy/=len;}
      if(Math.abs(dx)<.08)dx=0;if(Math.abs(dy)<.08)dy=0;
      knob.style.left=`${50+dx*39}%`;knob.style.top=`${50+dy*39}%`;onMove(dx,dy,true);
    }
    pad.addEventListener('pointerdown',e=>{e.preventDefault();pointerId=e.pointerId;try{pad.setPointerCapture(pointerId);}catch(_){}update(e);});
    pad.addEventListener('pointermove',e=>{if(pointerId!==e.pointerId)return;e.preventDefault();update(e);});
    pad.addEventListener('pointerup',e=>{if(pointerId===e.pointerId)resetPad();});
    pad.addEventListener('pointercancel',resetPad);pad.addEventListener('lostpointercapture',resetPad);
    return {wrap,pad,fireButton,stopFiring};
  }

  function openGame(id){
    const game=GAMES.find(g=>g.id===id);if(!game)return;
    clearGame();currentGame=id;title.textContent=`${game.icon} ${game.name}`;
    overlay.classList.add('nx2-active');savedOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
    overlay.querySelectorAll('[data-nx2-difficulty]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.nx2Difficulty===difficulty?'true':'false'));
    difficultyLabel.textContent=difficulty;
    try{
      switch(id){
        case'memory':startMemory();break;
        case'racing':startRacing();break;
        case'tower':startTower();break;
        case'mine':startMine();break;
        case'puzzle':startPuzzle();break;
        case'alien':startAlien();break;
        case'zombie':startNinja();break;
        case'word':startWord();break;
        case'hockey':startHockey();break;
        case'maze':startMaze();break;
      }
    }catch(e){
      console.error('Nexora game error:',e);
      content.innerHTML='<div class="nx2-panel"><p>The game encountered an error.</p><button class="nx2-btn" id="nx2-error-retry" type="button">Try again</button></div>';
      content.querySelector('#nx2-error-retry').addEventListener('click',()=>openGame(id));
    }
  }

  function closeGame(){clearGame();currentGame=null;overlay.classList.remove('nx2-active');document.body.style.overflow=savedOverflow;}
  backButton.addEventListener('click',closeGame);
  restartButton.addEventListener('click',()=>{if(currentGame)openGame(currentGame);});
  launcher.addEventListener('click',e=>{const card=e.target.closest('[data-nx2-game]');if(card)openGame(card.dataset.nx2Game);});
  difficultyMenu.addEventListener('click',e=>{
    const opt=e.target.closest('[data-nx2-difficulty]');if(!opt)return;
    difficulty=opt.dataset.nx2Difficulty;difficultyLabel.textContent=difficulty;
    overlay.querySelectorAll('[data-nx2-difficulty]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.nx2Difficulty===difficulty?'true':'false'));
    difficultyMenu.open=false;if(currentGame)openGame(currentGame);
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('nx2-active'))closeGame();});

  function startMemory(){
    const ui=shell('Find matching pairs.');
    const icons=['🚀','👾','💎','🐉','⚡','🌙','🎯','🪐'];
    const count=Math.max(3,Math.min(8,Math.round(icons.length*activeDifficulty().memory)));
    const chosen=icons.slice(0,count);let cards=[],opened=[],matched=0,moves=0,locked=false;
    const board=document.createElement('div');board.className='nx2-board';board.style.gridTemplateColumns='repeat(4,minmax(0,1fr))';ui.area.appendChild(board);
    const info=document.createElement('div');info.className='nx2-small';ui.area.appendChild(info);
    function draw(){
      board.innerHTML='';
      cards.forEach((card,i)=>{
        const el=document.createElement('button');el.type='button';el.className='nx2-cell';el.textContent=card.open||card.matched?card.icon:'?';
        if(card.matched)el.classList.add('nx2-safe');
        el.addEventListener('click',()=>{
          if(locked||card.open||card.matched)return;
          card.open=true;opened.push(i);draw();if(opened.length!==2)return;
          moves++;locked=true;const[a,b]=opened;
          if(cards[a].icon===cards[b].icon){cards[a].matched=cards[b].matched=true;matched+=2;opened=[];locked=false;draw();status(matched===cards.length?`🏆 All pairs matched in ${moves} moves!`:'Good match!');}
          else later(()=>{cards[a].open=cards[b].open=false;opened=[];locked=false;draw();status('Keep looking for matching pairs.');},700);
        });
        board.appendChild(el);
      });
      info.textContent=`Moves: ${moves} · Pairs: ${matched/2}/${chosen.length}`;
    }
    function reset(){cards=[...chosen,...chosen].sort(()=>Math.random()-.5).map(icon=>({icon,open:false,matched:false}));opened=[];matched=0;moves=0;locked=false;draw();status('Find all matching pairs.');}
    ui.help.textContent='Match every pair. Difficulty changes the number of pairs.';reset();
  }

  function startRacing(){
    const ui=shell('Race against traffic and avoid collisions.');
    const canvas=document.createElement('canvas');canvas.width=360;canvas.height=520;ui.area.appendChild(canvas);const ctx=canvas.getContext('2d');
    let x=180,traffic=[],score=0,remaining=3600,alive=true,last=0,spawn=0,road=0,elapsed=0,inputX=0,inputActive=false,left=false,right=false;
    function car(x,y,w,h,color,player=false){
      ctx.save();ctx.translate(x,y);ctx.fillStyle='#05070b';
      for(const tx of [-w/2-3,w/2-4]){ctx.fillRect(tx,10,7,18);ctx.fillRect(tx,h-26,7,18);}
      ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(-w/2,0,w,h,8);ctx.fill();
      ctx.fillStyle='#071626';ctx.beginPath();ctx.roundRect(-w/2+5,h*.29,w-10,h*.23,4);ctx.fill();
      ctx.fillStyle='#102b41';ctx.fillRect(-w/2+6,h*.57,w-12,h*.14);
      ctx.fillStyle='#ff244f';ctx.fillRect(-w/2+3,h-7,7,4);ctx.fillRect(w/2-10,h-7,7,4);
      if(player){ctx.shadowBlur=12;ctx.shadowColor='#35e8ff';ctx.strokeStyle='#35e8ff';ctx.strokeRect(-w/2,0,w,h);ctx.fillStyle='#fff';ctx.fillRect(-2,8,4,12);}
      ctx.restore();
    }
    function draw(){
      ctx.fillStyle='#07101f';ctx.fillRect(0,0,360,520);ctx.fillStyle='#0a281e';ctx.fillRect(0,0,35,520);ctx.fillRect(325,0,35,520);
      ctx.fillStyle='#292e38';ctx.fillRect(35,0,290,520);ctx.fillStyle='#ddd';ctx.fillRect(39,0,3,520);ctx.fillRect(318,0,3,520);
      for(let y=-45;y<560;y+=82){const yy=(y+road)%560;ctx.fillRect(128,yy,4,37);ctx.fillRect(228,yy,4,37);}
      traffic.forEach(c=>car(c.x,c.y,c.w,c.h,c.color));car(x,410,35,64,'#19a9ff',true);
      ctx.fillStyle='#030812dd';ctx.fillRect(43,8,112,25);ctx.fillRect(205,8,112,25);ctx.fillStyle='#fff';ctx.font='bold 12px system-ui';ctx.fillText(`SCORE ${Math.floor(score)}`,51,24);
      ctx.fillStyle='#8ff7ff';ctx.fillText(`TIME ${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(Math.floor(remaining%60)).padStart(2,'0')}`,211,24);
      if(!alive){ctx.fillStyle='#030812dd';ctx.fillRect(35,180,290,130);ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 23px system-ui';ctx.fillText(remaining<=0?'RACE COMPLETE':'RACE OVER',180,226);ctx.font='bold 15px system-ui';ctx.fillText(`Score: ${Math.floor(score)}`,180,258);ctx.textAlign='left';}
    }
    function reset(){x=180;traffic=[];score=0;remaining=3600;alive=true;last=0;spawn=0;road=0;elapsed=0;status('Race time: 60:00');draw();animationFrame=requestAnimationFrame(tick);}
    function tick(t){
      if(!alive)return;const dt=Math.min(40,last?t-last:16.7);last=t;const d=activeDifficulty();elapsed+=dt;remaining=Math.max(0,3600-elapsed/1000);road=(road+2.5*dt/16.7)%82;
      const steer=inputActive?inputX:(left?-1:0)+(right?1:0);x=Math.max(62,Math.min(298,x+steer*5.5*dt/16.7));
      spawn+=dt;if(spawn>=Math.max(300,850/d.enemies)){spawn=0;const lanes=[80,180,280];traffic.push({x:lanes[Math.floor(Math.random()*3)],y:-90,w:31,h:57,speed:(1.5+Math.random()*2.2)*d.speed,color:['#e63946','#e8b339','#9b6cff','#43a4ff','#e8edf5'][Math.floor(Math.random()*5)]});}
      for(const c of traffic){c.y+=(2.5+c.speed)*dt/16.7;if(Math.abs(x-c.x)<28&&410<c.y+c.h-8&&474>c.y+8){alive=false;status(`Collision! Score: ${Math.floor(score)}`);}}
      traffic=traffic.filter(c=>c.y<560);score+=dt*.018;if(remaining<=0){remaining=0;alive=false;status(`🏁 You completed the 60-minute race! Score: ${Math.floor(score)}`);}
      draw();if(alive)animationFrame=requestAnimationFrame(tick);
    }
    const kd=e=>{if(currentGame!=='racing')return;if(['ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')left=true;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')right=true;};
    const ku=e=>{if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')left=false;if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')right=false;};
    window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);cleanupGame=()=>{window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);};
    addTouchpad(ui.controls,(a,b,on)=>{inputX=a;inputActive=on;});ui.help.textContent='Drag the wide joystick left or right to steer. Avoid traffic for the full 60-minute countdown.';reset();
  }

  function startTower(){
    const ui=shell('Position the moving block and tap DROP.');
    const canvas=document.createElement('canvas');canvas.width=360;canvas.height=450;ui.area.appendChild(canvas);const ctx=canvas.getContext('2d');
    let blocks,moving,score,direction,running,speed,steer=0;
    function draw(){ctx.fillStyle='#07101f';ctx.fillRect(0,0,360,450);ctx.strokeStyle='#15324d';for(let y=0;y<450;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(360,y);ctx.stroke();}blocks.forEach((b,i)=>{ctx.fillStyle=i%2?'#9b6cff':'#35e8ff';ctx.fillRect(b.x,b.y,b.w,28);});if(running){ctx.fillStyle='#43f5a5';ctx.fillRect(moving.x,moving.y,moving.w,28);}}
    function drop(){if(!running)return;const p=blocks[blocks.length-1],l=Math.max(p.x,moving.x),r=Math.min(p.x+p.w,moving.x+moving.w),w=r-l;if(w<=0){running=false;status(`Tower fell! Height: ${score}`);draw();return;}blocks.push({x:l,w,y:moving.y});score++;speed=2.2*activeDifficulty().speed+score*.08;if(moving.y<45){blocks.forEach(b=>b.y+=28);moving.y+=28;}moving={x:direction>0?0:360-w,w,y:moving.y-35};direction*=-1;status(`Blocks stacked: ${score}`);draw();}
    function reset(){blocks=[{x:70,w:220,y:400}];moving={x:0,w:220,y:365};score=0;direction=1;running=true;speed=2.2*activeDifficulty().speed;animationFrame=requestAnimationFrame(tick);}
    function tick(){if(!running)return;moving.x+=speed*direction+steer*2;moving.x=Math.max(0,Math.min(360-moving.w,moving.x));if(moving.x<=0)direction=1;if(moving.x+moving.w>=360)direction=-1;draw();animationFrame=requestAnimationFrame(tick);}
    const kd=e=>{if(currentGame==='tower'&&(e.key===' '||e.key==='Enter')){e.preventDefault();drop();}};window.addEventListener('keydown',kd);cleanupGame=()=>window.removeEventListener('keydown',kd);
    ui.controls.appendChild(button('DROP BLOCK',drop));addTouchpad(ui.controls,(x)=>{steer=x*3.5;});ui.help.textContent='Build the tallest tower possible. Higher difficulty increases speed.';reset();
  }

  function startMine(){
    const ui=shell('Reveal safe tiles and avoid hidden mines.');const size=6,board=document.createElement('div');board.className='nx2-board';board.style.gridTemplateColumns=`repeat(${size},minmax(0,1fr))`;ui.area.appendChild(board);
    let count,mines,revealed,finished,safe;
    function neighbors(i){const r=Math.floor(i/size),c=i%size,a=[];for(let y=r-1;y<=r+1;y++)for(let x=c-1;x<=c+1;x++)if(y>=0&&x>=0&&y<size&&x<size&&(y!==r||x!==c))a.push(y*size+x);return a;}
    function draw(show=false){board.innerHTML='';for(let i=0;i<36;i++){const el=document.createElement('button');el.type='button';el.className='nx2-cell';if(revealed.has(i)){if(mines.has(i)){el.textContent='💣';el.classList.add('nx2-bomb');}else{el.classList.add('nx2-safe');const n=neighbors(i).filter(j=>mines.has(j)).length;el.textContent=n||'·';}}else if(show&&mines.has(i)){el.textContent='💣';el.classList.add('nx2-bomb');}else el.textContent='?';el.addEventListener('click',()=>reveal(i));board.appendChild(el);}}
    function reveal(i){if(finished||revealed.has(i))return;revealed.add(i);if(mines.has(i)){finished=true;status('💥 Mine found! Restart to try again.');draw(true);return;}safe++;if(safe===36-count){finished=true;status('🏆 You cleared the minefield!');}else status(`Safe tiles: ${safe}/${36-count}`);draw();}
    function reset(){count=Math.max(4,Math.min(25,Math.round(7*activeDifficulty().enemies)));mines=new Set();revealed=new Set();finished=false;safe=0;while(mines.size<count)mines.add(Math.floor(Math.random()*36));status(`Mines hidden: ${count}`);draw();}
    ui.help.textContent='Numbers show how many mines touch a tile. Higher difficulty adds more mines.';reset();
  }

  function startPuzzle(){
    const ui=shell('Arrange the numbers in order using the empty space.');
    let tiles=[],moves=0,finished=false;
    const board=document.createElement('div');board.className='nx2-board';board.style.gridTemplateColumns='repeat(4,minmax(0,1fr))';ui.area.appendChild(board);
    function solved(){return tiles.every((n,i)=>n===(i===15?0:i+1));}
    function draw(){
      board.innerHTML='';
      tiles.forEach((n,i)=>{
        const cell=document.createElement('button');cell.type='button';cell.className='nx2-cell';
        cell.textContent=n||'';
        if(!n){cell.style.background='#030914';cell.style.border='2px dashed #35e8ff55';cell.setAttribute('aria-label','Empty space');}
        cell.addEventListener('click',()=>move(i));board.appendChild(cell);
      });
      status(finished?`🏆 Puzzle solved in ${moves} moves!`:`Moves: ${moves} · Arrange 1–15 in order.`);
    }
    function move(i){
      if(finished)return;
      const empty=tiles.indexOf(0),r=Math.floor(i/4),c=i%4,er=Math.floor(empty/4),ec=empty%4;
      if(Math.abs(r-er)+Math.abs(c-ec)!==1)return;
      [tiles[i],tiles[empty]]=[tiles[empty],tiles[i]];moves++;
      if(solved())finished=true;draw();
    }
    function reset(){
      tiles=Array.from({length:16},(_,i)=>(i+1)%16);moves=0;finished=false;
      let previous=-1;
      const scramble=Math.round(180*activeDifficulty().speed);
      for(let i=0;i<scramble;i++){
        const empty=tiles.indexOf(0),r=Math.floor(empty/4),c=empty%4,opts=[];
        if(r>0&&empty-4!==previous)opts.push(empty-4);
        if(r<3&&empty+4!==previous)opts.push(empty+4);
        if(c>0&&empty-1!==previous)opts.push(empty-1);
        if(c<3&&empty+1!==previous)opts.push(empty+1);
        const next=opts.length?opts[Math.floor(Math.random()*opts.length)]:previous;
        previous=empty;[tiles[empty],tiles[next]]=[tiles[next],tiles[empty]];
      }
      draw();status('Puzzle shuffled. Tap a tile beside the empty slot.');
    }
    ui.controls.appendChild(button('Shuffle Puzzle',reset));
    ui.help.textContent='Tap a tile beside the empty space. Every shuffle is solvable. Arrange the numbers from 1 to 15 to win.';reset();
  }

  function startAlien(){
    const ui=shell('Pilot your jet, dodge enemy fire and hold FIRE to shoot.');
    const canvas=document.createElement('canvas');canvas.width=360;canvas.height=480;ui.area.appendChild(canvas);const ctx=canvas.getContext('2d');
    let player,aliens,shots,enemyShots,score,lives,alive,lastShot,lastTime,mx=0,my=0,firing=false,stars,wave;
    function drawJet(x,y){
      ctx.save();ctx.translate(x,y);ctx.shadowBlur=16;ctx.shadowColor='#35e8ff';ctx.fillStyle='#35e8ff';ctx.beginPath();ctx.moveTo(-5,13);ctx.lineTo(0,30);ctx.lineTo(5,13);ctx.fill();ctx.shadowBlur=0;
      ctx.fillStyle='#536c88';ctx.strokeStyle='#c6edff';ctx.beginPath();ctx.moveTo(-5,-2);ctx.lineTo(-30,12);ctx.lineTo(-25,19);ctx.lineTo(-7,14);ctx.lineTo(7,14);ctx.lineTo(25,19);ctx.lineTo(30,12);ctx.lineTo(5,-2);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#b8c9dc';ctx.beginPath();ctx.moveTo(0,-25);ctx.lineTo(5,-13);ctx.lineTo(7,7);ctx.lineTo(4,17);ctx.lineTo(0,20);ctx.lineTo(-4,17);ctx.lineTo(-7,7);ctx.lineTo(-5,-13);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#07384d';ctx.strokeStyle='#35e8ff';ctx.beginPath();ctx.moveTo(0,-17);ctx.lineTo(3,-10);ctx.lineTo(2,2);ctx.lineTo(-2,2);ctx.lineTo(-3,-10);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
    }
    function drawAlien(a){
      ctx.save();ctx.translate(a.x,a.y);ctx.shadowBlur=8;ctx.shadowColor='#ff6687';ctx.fillStyle=a.color;ctx.beginPath();ctx.moveTo(-12,-5);ctx.lineTo(-8,-11);ctx.lineTo(-3,-7);ctx.lineTo(3,-7);ctx.lineTo(8,-11);ctx.lineTo(12,-5);ctx.lineTo(10,5);ctx.lineTo(5,9);ctx.lineTo(-5,9);ctx.lineTo(-10,5);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.fillRect(-6,-3,3,4);ctx.fillRect(3,-3,3,4);ctx.restore();
    }
    function reset(){
      player={x:180,y:420};aliens=[];shots=[];enemyShots=[];score=0;lives=3;alive=true;lastShot=0;lastTime=0;mx=0;my=0;firing=false;wave=1;
      stars=Array.from({length:70},()=>({x:Math.random()*360,y:Math.random()*480,s:.5+Math.random()*1.5,v:.5+Math.random()*2}));
      spawnWave();animationFrame=requestAnimationFrame(tick);
    }
    function spawnWave(){
      const d=activeDifficulty(),rows=difficulty==='Easy'?2:difficulty==='Medium'?3:4,cols=difficulty==='Hardest'?9:8;
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)aliens.push({
        x:22+c*(316/(cols-1)),y:38+r*30,
        startX:22+c*(316/(cols-1)),row:r,alive:true,
        hp:difficulty==='Hardest'?3:difficulty==='Hard'?2:1,
        color:['#d82e64','#9b6cff','#ff9e43'][r%3],
        shot:Math.random()*900
      });
    }
    function fire(){if(alive)shots.push({x:player.x,y:player.y-22,speed:10});}
    function tick(time){
      if(!alive)return;
      const dt=Math.min(40,lastTime?time-lastTime:16.7);lastTime=time;const d=activeDifficulty();
      player.x=Math.max(24,Math.min(336,player.x+mx*5.5*d.speed*dt/16.7));
      player.y=Math.max(275,Math.min(450,player.y+my*4.5*d.speed*dt/16.7));
      if(firing&&time-lastShot>Math.max(75,125/d.speed)){fire();lastShot=time;}
      shots.forEach(s=>s.y-=s.speed*dt/16.7);shots=shots.filter(s=>s.y>-10);
      enemyShots.forEach(s=>{
        s.y+=s.speed*dt/16.7;
        if(Math.hypot(s.x-player.x,s.y-player.y)<20){s.y=600;lives--;if(lives<=0)alive=false;}
      });
      enemyShots=enemyShots.filter(s=>s.y<500);
      aliens.forEach(a=>{
        if(!a.alive)return;
        a.x=a.startX+Math.sin(time/(330/d.enemies)+a.row)*24*d.enemies;
        a.y+=.025*d.enemies*dt/16.7;
        a.shot-=dt;
        if(a.shot<=0){
          enemyShots.push({x:a.x,y:a.y+8,speed:(3+Math.random()*1.8)*d.enemies});
          a.shot=Math.max(240,1050/d.enemies+Math.random()*450);
        }
        for(const s of shots){
          if(Math.abs(s.x-a.x)<16&&Math.abs(s.y-a.y)<16){
            s.y=-100;a.hp--;
            if(a.hp<=0){a.alive=false;score+=10;}
          }
        }
        if(a.y>player.y-26){a.alive=false;lives--;if(lives<=0)alive=false;}
      });
      ctx.fillStyle='#050a17';ctx.fillRect(0,0,360,480);
      stars.forEach(s=>{s.y+=s.v*dt/16.7;if(s.y>480){s.y=0;s.x=Math.random()*360;}ctx.fillStyle='#9dbedc';ctx.globalAlpha=.35+s.s*.25;ctx.fillRect(s.x,s.y,s.s,s.s);});ctx.globalAlpha=1;
      aliens.forEach(a=>{if(a.alive)drawAlien(a);});
      ctx.fillStyle='#35e8ff';shots.forEach(s=>ctx.fillRect(s.x-2,s.y,4,12));
      ctx.fillStyle='#ff6687';enemyShots.forEach(s=>{ctx.beginPath();ctx.arc(s.x,s.y,4,0,Math.PI*2);ctx.fill();});
      drawJet(player.x,player.y);
      ctx.fillStyle='#fff';ctx.font='bold 12px system-ui';ctx.fillText(`SCORE ${score}`,10,18);ctx.fillText(`LIVES ${'♥'.repeat(Math.max(0,lives))}`,245,18);
      const remaining=aliens.filter(a=>a.alive).length;
      if(remaining===0&&alive){
        wave++;
        if(wave>5){alive=false;status(`🏆 Earth is safe! Final score: ${score}`);}
        else{spawnWave();status(`⚠️ Wave ${wave}! Enemy attacks intensified.`);}
      }
      if(!alive){status(lives<=0?`Game over! Score: ${score}. Restart to try again.`:`🏆 You survived! Score: ${score}`);return;}
      status(`Score: ${score} · Lives: ${lives} · Wave: ${wave} · Enemies: ${remaining}`);
      animationFrame=requestAnimationFrame(tick);
    }
    const kd=e=>{
      if(currentGame!=='alien')return;
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();
      if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')mx=-1;
      if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')mx=1;
      if(e.key==='ArrowUp'||e.key.toLowerCase()==='w')my=-1;
      if(e.key==='ArrowDown'||e.key.toLowerCase()==='s')my=1;
      if(e.code==='Space')firing=true;
    };
    const ku=e=>{
      if(['ArrowLeft','ArrowRight','a','d'].includes(e.key))mx=0;
      if(['ArrowUp','ArrowDown','w','s'].includes(e.key))my=0;
      if(e.code==='Space')firing=false;
    };
    window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
    cleanupGame=()=>{window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);firing=false;};
    addTouchpad(ui.controls,(x,y)=>{mx=x;my=y;},{fire:true,fireLabel:'FIRE',fireRate:110,onFire:()=>{firing=true;fire();lastShot=performance.now();},onFireEnd:()=>{firing=false;}});
    ui.help.textContent='Move with the cyan joystick and hold FIRE. Aliens shoot faster, tougher enemies take multiple hits, and five increasingly difficult waves await you.';
    reset();
  }

  // Ninja Shadow Strike replaces Target Master.
  function startNinja(){
    const ui=shell('Strike targets, collect coins and dodge traps. Survive as long as possible.');
    const canvas=document.createElement('canvas');canvas.width=360;canvas.height=480;ui.area.appendChild(canvas);
    const ctx=canvas.getContext('2d');
    let ninja,targets,coins,traps,score,lives,alive,lastTime,spawnTimer,coinTimer,trapTimer,mx=0,my=0,attacking=false,lastAttack=0,elapsed=0,particles=[];
    function reset(){
      ninja={x:180,y:380,r:13,invulnerable:0};
      targets=[];coins=[];traps=[];particles=[];
      score=0;lives=5;alive=true;lastTime=0;spawnTimer=0;coinTimer=0;trapTimer=0;
      mx=0;my=0;attacking=false;lastAttack=0;elapsed=0;
      animationFrame=requestAnimationFrame(tick);
    }
    function spawnTarget(){
      const d=activeDifficulty(),edge=Math.random()<.5?0:360;
      targets.push({x:edge?edge:0,y:45+Math.random()*220,r:12,hp:difficulty==='Hardest'?3:difficulty==='Hard'?2:1,
        speed:(1.1+Math.random()*1.4)*d.enemies,phase:Math.random()*6.28,attack:Math.random()*500});
    }
    function spawnCoin(){coins.push({x:20+Math.random()*320,y:55+Math.random()*300,r:7,spin:Math.random()*6});}
    function spawnTrap(){traps.push({x:18+Math.random()*324,y:45+Math.random()*320,r:10,life:6000+Math.random()*3000});}
    function slash(){
      if(!alive)return;
      particles.push({x:ninja.x,y:ninja.y,life:180,slash:true});
      targets.forEach(t=>{
        if(Math.hypot(t.x-ninja.x,t.y-ninja.y)<54){
          t.hp--;t.hit=130;
          if(t.hp<=0){t.dead=true;score+=10;}
        }
      });
      targets=targets.filter(t=>!t.dead);
      traps.forEach(t=>{if(Math.hypot(t.x-ninja.x,t.y-ninja.y)<42)t.disabled=900;});
    }
    function tick(time){
      if(!alive)return;
      const dt=Math.min(40,lastTime?time-lastTime:16.7);lastTime=time;elapsed+=dt;
      const d=activeDifficulty();
      ninja.x=Math.max(15,Math.min(345,ninja.x+mx*4.3*d.speed*dt/16.7));
      ninja.y=Math.max(35,Math.min(455,ninja.y+my*4.3*d.speed*dt/16.7));
      if(attacking&&time-lastAttack>Math.max(180,360/d.speed)){slash();lastAttack=time;}
      spawnTimer+=dt;coinTimer+=dt;trapTimer+=dt;
      if(spawnTimer>Math.max(240,850/d.enemies)){spawnTimer=0;spawnTarget();}
      if(coinTimer>Math.max(500,1450/d.enemies)){coinTimer=0;spawnCoin();}
      if(trapTimer>Math.max(800,2500/d.enemies)){trapTimer=0;spawnTrap();}
      targets.forEach(t=>{
        const dx=ninja.x-t.x,dy=ninja.y-t.y,len=Math.hypot(dx,dy)||1;
        t.x+=dx/len*t.speed*dt/16.7;t.y+=dy/len*t.speed*dt/16.7;
        if(t.hit>0)t.hit-=dt;
        if(len<ninja.r+t.r+2&&ninja.invulnerable<=0){lives--;ninja.invulnerable=900;if(lives<=0)alive=false;}
      });
      ninja.invulnerable=Math.max(0,ninja.invulnerable-dt);
      coins.forEach(c=>{c.spin+=dt*.008;if(Math.hypot(c.x-ninja.x,c.y-ninja.y)<ninja.r+c.r+3){c.collected=true;score+=25;particles.push({x:c.x,y:c.y,life:350,coin:true});}});
      coins=coins.filter(c=>!c.collected);
      traps.forEach(t=>{
        t.life-=dt;if(t.disabled>0)t.disabled-=dt;
        if(t.disabled<=0&&Math.hypot(t.x-ninja.x,t.y-ninja.y)<ninja.r+t.r&&ninja.invulnerable<=0){lives--;ninja.invulnerable=900;if(lives<=0)alive=false;}
      });
      traps=traps.filter(t=>t.life>0);
      particles.forEach(p=>p.life-=dt);particles=particles.filter(p=>p.life>0);

      const grad=ctx.createLinearGradient(0,0,360,480);grad.addColorStop(0,'#080d20');grad.addColorStop(1,'#170b27');ctx.fillStyle=grad;ctx.fillRect(0,0,360,480);
      ctx.strokeStyle='#292047';ctx.lineWidth=1;
      for(let x=0;x<360;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,480);ctx.stroke();}
      for(let y=0;y<480;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(360,y);ctx.stroke();}
      ctx.fillStyle='#35e8ff22';ctx.fillRect(0,0,360,30);
      coins.forEach(c=>{
        ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.spin);
        ctx.shadowBlur=12;ctx.shadowColor='#ffdf5d';ctx.fillStyle='#ffdf5d';
        ctx.beginPath();ctx.arc(0,0,c.r,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#9a6512';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillText('$',0,4);ctx.restore();
      });
      traps.forEach(t=>{
        if(t.disabled>0)return;
        ctx.save();ctx.translate(t.x,t.y);ctx.rotate(elapsed*.001);
        ctx.shadowBlur=12;ctx.shadowColor='#ff456e';ctx.fillStyle='#ff456e';
        ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?t.r*.55:t.r;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);}ctx.closePath();ctx.fill();ctx.restore();
      });
      targets.forEach(t=>{
        ctx.save();ctx.translate(t.x,t.y);
        ctx.shadowBlur=12;ctx.shadowColor=t.hit>0?'#fff':'#ff456e';
        ctx.fillStyle=t.hit>0?'#fff':'#8f2449';
        ctx.beginPath();ctx.arc(0,0,t.r,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle='#ff9ab4';ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle='#fff';ctx.fillRect(-5,-3,3,3);ctx.fillRect(3,-3,3,3);
        if(t.hp>1){ctx.fillStyle='#fff';ctx.font='bold 9px system-ui';ctx.textAlign='center';ctx.fillText(t.hp,0,-17);}
        ctx.restore();
      });
      particles.forEach(p=>{
        ctx.save();ctx.globalAlpha=Math.max(0,p.life/350);
        if(p.slash){
          ctx.strokeStyle='#35e8ff';ctx.lineWidth=5;ctx.shadowBlur=16;ctx.shadowColor='#35e8ff';
          ctx.beginPath();ctx.arc(p.x,p.y,43,-.9,.9);ctx.stroke();
        }else if(p.coin){
          ctx.fillStyle='#ffdf5d';ctx.font='bold 15px system-ui';ctx.textAlign='center';ctx.fillText('+25',p.x,p.y-p.life*.035);
        }
        ctx.restore();
      });
      if(ninja.invulnerable<=0||Math.floor(time/90)%2===0){
        ctx.save();ctx.translate(ninja.x,ninja.y);
        ctx.shadowBlur=15;ctx.shadowColor='#35e8ff';
        ctx.fillStyle='#141b34';ctx.beginPath();ctx.arc(0,0,ninja.r+3,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#202b48';ctx.fillRect(-10,-5,20,18);
        ctx.fillStyle='#35e8ff';ctx.fillRect(-9,-9,18,7);
        ctx.fillStyle='#fff';ctx.fillRect(-6,-7,4,2);ctx.fillRect(3,-7,4,2);
        ctx.strokeStyle='#c9faff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(7,5);ctx.lineTo(19,-7);ctx.stroke();
        ctx.restore();
      }
      ctx.fillStyle='#fff';ctx.font='bold 12px system-ui';ctx.textAlign='left';
      ctx.fillText(`SCORE ${score}`,10,19);ctx.fillText(`LIVES ${'♥'.repeat(Math.max(0,lives))}`,210,19);
      if(!alive){
        ctx.fillStyle='#030817dd';ctx.fillRect(25,175,310,120);
        ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='bold 22px system-ui';ctx.fillText('SHADOW STRIKE OVER',180,216);
        ctx.font='bold 15px system-ui';ctx.fillText(`Score: ${score}`,180,246);
        ctx.font='12px system-ui';ctx.fillText(`Survived ${Math.floor(elapsed/1000)} seconds`,180,270);
        ctx.textAlign='left';status(`🥷 Game over! Score: ${score}. Restart to strike again.`);return;
      }
      status(`Score: ${score} · Lives: ${lives} · Targets: ${targets.length} · ${Math.floor(elapsed/1000)}s`);
      animationFrame=requestAnimationFrame(tick);
    }
    const kd=e=>{
      if(currentGame!=='zombie')return;
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();
      if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')mx=-1;
      if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')mx=1;
      if(e.key==='ArrowUp'||e.key.toLowerCase()==='w')my=-1;
      if(e.key==='ArrowDown'||e.key.toLowerCase()==='s')my=1;
      if(e.code==='Space')attacking=true;
    };
    const ku=e=>{
      if(['ArrowLeft','ArrowRight','a','d'].includes(e.key))mx=0;
      if(['ArrowUp','ArrowDown','w','s'].includes(e.key))my=0;
      if(e.code==='Space')attacking=false;
    };
    window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
    cleanupGame=()=>{window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);attacking=false;};
    addTouchpad(ui.controls,(x,y)=>{mx=x;my=y;},{fire:true,fireLabel:'STRIKE',fireRate:250,onFire:()=>{attacking=true;slash();lastAttack=performance.now();},onFireEnd:()=>{attacking=false;}});
    ui.help.textContent='Move with the cyan joystick. Hold STRIKE to slash nearby targets. Collect gold coins for bonus points and dodge red traps. Enemies become faster and tougher as difficulty increases.';
    reset();
  }

  function startWord(){
    const ui=shell('Unscramble the letters to discover the hidden word.');
    const words=['PLANET','ROCKET','GALAXY','PUZZLE','ARCADE','ENERGY','NEBULA','GAMING','DRAGON','COSMIC','SHIELD','TARGET','LASERS','JUNGLE','RACING'];
    let answer='',score=0,round=0;
    const scrambled=document.createElement('div');scrambled.className='nx2-big';
    const input=document.createElement('input');input.className='nx2-input';input.type='text';input.autocomplete='off';input.maxLength=12;input.placeholder='Type your answer';
    const result=document.createElement('div');result.className='nx2-small';ui.area.append(scrambled,input,result);
    function next(){answer=words[Math.floor(Math.random()*words.length)];let mix=answer;while(mix===answer)mix=answer.split('').sort(()=>Math.random()-.5).join('');scrambled.textContent=mix;input.value='';result.textContent=`Round ${++round}`;status(`Score: ${score}`);}
    function check(){if(input.value.trim().toUpperCase()===answer){score+=10;result.textContent='Correct! +10 points';status(`Score: ${score}`);later(next,650);}else result.textContent='Not quite. Try again!';}
    input.addEventListener('keydown',e=>{if(e.key==='Enter')check();});ui.controls.append(button('Check answer',check),button('Skip word',next));ui.help.textContent='Each correct answer earns 10 points.';next();
  }

  function startHockey(){
    const ui=shell('Move your paddle with the joystick and score goals.');
    const canvas=document.createElement('canvas');canvas.width=360;canvas.height=500;ui.area.appendChild(canvas);const ctx=canvas.getContext('2d');
    let player,cpu,puck,ps,cs,running,last;
    function resetPuck(dir=1){puck={x:180,y:250,vx:(Math.random()*3-1.5)*dir,vy:3*dir,r:9};}
    function reset(){player={x:180,y:420,r:22};cpu={x:180,y:80,r:22};ps=cs=0;running=true;last=0;resetPuck();animationFrame=requestAnimationFrame(tick);}
    function tick(t){if(!running)return;const dt=Math.min(40,last?t-last:16.7);last=t;const d=activeDifficulty();cpu.x+=Math.sign(puck.x-cpu.x)*Math.min(2.1*d.speed,dt*.08*d.speed);cpu.x=Math.max(cpu.r,Math.min(360-cpu.r,cpu.x));puck.x+=puck.vx*dt/16.7;puck.y+=puck.vy*dt/16.7;if(puck.x<puck.r||puck.x>360-puck.r)puck.vx*=-1;
      [player,cpu].forEach(p=>{const dx=puck.x-p.x,dy=puck.y-p.y,dist=Math.hypot(dx,dy);if(dist<puck.r+p.r&&dist>0){puck.vx=dx/dist*4*d.speed;puck.vy=dy/dist*4*d.speed;}});
      if(puck.y< -5){ps++;resetPuck(1);}if(puck.y>505){cs++;resetPuck(-1);}
      ctx.fillStyle='#07101f';ctx.fillRect(0,0,360,500);ctx.strokeStyle='#35e8ff';ctx.strokeRect(8,8,344,484);ctx.beginPath();ctx.moveTo(8,250);ctx.lineTo(352,250);ctx.stroke();ctx.fillStyle='#9b6cff';ctx.beginPath();ctx.arc(cpu.x,cpu.y,cpu.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#43f5a5';ctx.beginPath();ctx.arc(player.x,player.y,player.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff6687';ctx.beginPath();ctx.arc(puck.x,puck.y,puck.r,0,Math.PI*2);ctx.fill();status(`You: ${ps} · Computer: ${cs}`);
      if(ps>=5||cs>=5){running=false;status(ps>=5?'🏆 You won the match!':'Computer won. Try again!');return;}animationFrame=requestAnimationFrame(tick);}
    addTouchpad(ui.controls,(x,y,active)=>{if(active){player.x=Math.max(player.r,Math.min(360-player.r,player.x+x*5));player.y=Math.max(275,Math.min(500-player.r,player.y+y*5));}});
    ui.help.textContent='Drag the joystick to move. First to five goals wins.';reset();
  }

  function startMaze(){
    const ui=shell('Navigate through the maze to reach the green exit.');
    const canvas=document.createElement('canvas');canvas.width=360;canvas.height=360;ui.area.appendChild(canvas);const ctx=canvas.getContext('2d');
    let size,grid,player,exit,cell,steps,finished,lastMove=0,queued=null,moveTimer=0;
    const dirs=[{dx:0,dy:-1,wall:0,op:2},{dx:1,dy:0,wall:1,op:3},{dx:0,dy:1,wall:2,op:0},{dx:-1,dy:0,wall:3,op:1}];
    function generate(){
      size=difficulty==='Easy'?9:difficulty==='Medium'?13:difficulty==='Hard'?17:21;cell=360/size;
      grid=Array.from({length:size},()=>Array.from({length:size},()=>({visited:false,walls:[true,true,true,true]})));
      const stack=[{x:0,y:0}];grid[0][0].visited=true;
      while(stack.length){
        const p=stack[stack.length-1],opts=dirs.filter(d=>p.x+d.dx>=0&&p.y+d.dy>=0&&p.x+d.dx<size&&p.y+d.dy<size&&!grid[p.y+d.dy][p.x+d.dx].visited);
        if(!opts.length){stack.pop();continue;}
        const d=opts[Math.floor(Math.random()*opts.length)],x=p.x+d.dx,y=p.y+d.dy;
        grid[p.y][p.x].walls[d.wall]=false;grid[y][x].walls[d.op]=false;grid[y][x].visited=true;stack.push({x,y});
      }
      player={x:0,y:0};exit={x:size-1,y:size-1};steps=0;finished=false;lastMove=0;queued=null;
    }
    function draw(){
      ctx.fillStyle='#040a14';ctx.fillRect(0,0,360,360);
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const c=grid[y][x],px=x*cell,py=y*cell;ctx.fillStyle='#0b1829';ctx.fillRect(px,py,cell,cell);
        ctx.strokeStyle='#35e8ff';ctx.lineWidth=Math.max(1.2,3-size/12);
        if(c.walls[0]){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+cell,py);ctx.stroke();}
        if(c.walls[1]){ctx.beginPath();ctx.moveTo(px+cell,py);ctx.lineTo(px+cell,py+cell);ctx.stroke();}
        if(c.walls[2]){ctx.beginPath();ctx.moveTo(px,py+cell);ctx.lineTo(px+cell,py+cell);ctx.stroke();}
        if(c.walls[3]){ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,py+cell);ctx.stroke();}
      }
      ctx.fillStyle='#43f5a5';ctx.fillRect(exit.x*cell+cell*.2,exit.y*cell+cell*.2,cell*.6,cell*.6);
      ctx.fillStyle='#ff6687';ctx.beginPath();ctx.arc(player.x*cell+cell/2,player.y*cell+cell/2,Math.max(3,cell*.27),0,Math.PI*2);ctx.fill();
    }
    function move(dx,dy){
      if(finished)return false;
      const idx=dirs.findIndex(d=>d.dx===dx&&d.dy===dy);
      if(idx<0||grid[player.y][player.x].walls[idx])return false;
      player.x+=dx;player.y+=dy;steps++;
      if(player.x===exit.x&&player.y===exit.y){finished=true;status(`🏆 You escaped the maze in ${steps} moves!`);}
      else status(`Moves: ${steps} · Find the green exit.`);
      draw();return true;
    }
    function request(dx,dy){if(finished)return;const now=performance.now();if(now-lastMove<105){queued={dx,dy};return;}lastMove=now;queued=null;move(dx,dy);}
    const kd=e=>{
      if(currentGame!=='maze')return;
      const map={ArrowUp:[0,-1],ArrowRight:[1,0],ArrowDown:[0,1],ArrowLeft:[-1,0],w:[0,-1],d:[1,0],s:[0,1],a:[-1,0]};
      const d=map[e.key];if(d){e.preventDefault();request(...d);}
    };
    window.addEventListener('keydown',kd);cleanupGame=()=>{window.removeEventListener('keydown',kd);clearInterval(moveTimer);};
    addTouchpad(ui.controls,(x,y,active)=>{if(!active||finished){queued=null;return;}if(Math.abs(x)<.3&&Math.abs(y)<.3)return;if(Math.abs(x)>Math.abs(y))request(x>0?1:-1,0);else request(0,y>0?1:-1);});
    moveTimer=setInterval(()=>{if(queued&&!finished&&performance.now()-lastMove>=105){const d=queued;queued=null;request(d.dx,d.dy);}},35);
    ui.help.textContent='Drag the joystick in the direction you want to travel. Every maze is randomly generated.';generate();draw();
  }
})();
```
