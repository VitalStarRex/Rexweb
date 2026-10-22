```javascript
(() => {
  'use strict';

  /* REXWEB NEXORA — EXTRA ARCADE
     10 playable games, mobile controls, search, categories,
     favorites, recent games, difficulty, timers and power-ups.
  */

  function boot() {
    if (document.getElementById('nx2-launcher')) return;

    const ROOT = document.getElementById('nexora-games') ||
      document.querySelector('main') ||
      document.querySelector('#app') ||
      document.body;

    const GAMES = [
      {id:'memory',icon:'🧠',name:'Memory Match',cat:'Puzzle',image:'photo-1516321318423-f06f85e504b3'},
      {id:'racing',icon:'🏎️',name:'Neon Racing',cat:'Racing',image:'photo-1492144534655-ae79c964c9d7'},
      {id:'puzzle',icon:'🧩',name:'Sliding Puzzle',cat:'Puzzle',image:'photo-1513364776144-60967b0f800f'},
      {id:'alien',icon:'👾',name:'Alien Invasion',cat:'Action',image:'photo-1446776811953-b23d57bd21aa'},
      {id:'zombie',icon:'🧟',name:'Zombie Survival',cat:'Action',image:'photo-1518709268805-4e9042af9f23'},
      {id:'word',icon:'🔤',name:'Word Scramble',cat:'Puzzle',image:'photo-1455390582262-044cdead277a'},
      {id:'maze',icon:'🌀',name:'Neon Maze',cat:'Adventure',image:'photo-1519608487953-e999c86e7455'},
      {id:'parkour',icon:'⚡',name:'Cyber Parkour',cat:'Adventure',image:'photo-1519608487953-e999c86e7455'},
      {id:'galaxy',icon:'🚀',name:'Galaxy Defender',cat:'Action',image:'photo-1446776811953-b23d57bd21aa'},
      {id:'reflex',icon:'🔮',name:'Neon Reflex',cat:'Arcade',image:'photo-1519608487953-e999c86e7455'}
    ];

    const DIFF = {
      Easy:{enemy:.7,speed:.8,time:1.35},
      Medium:{enemy:1,speed:1,time:1},
      Hard:{enemy:1.4,speed:1.1,time:.8},
      Hardest:{enemy:1.8,speed:1.2,time:.65}
    };

    const $ = (s,r=document)=>r.querySelector(s);
    const launcher=document.createElement('section');
    launcher.id='nx2-launcher';

    launcher.innerHTML=`
      <style>
      #nx2-launcher,#nx2-overlay{font-family:Arial,sans-serif;box-sizing:border-box}
      #nx2-launcher * ,#nx2-overlay *{box-sizing:border-box}
      #nx2-launcher{width:100%;margin:18px auto;color:#eef7ff}
      #nx2-launcher .nx2-heading{font-size:clamp(20px,4vw,28px);color:#35e8ff;margin:0 0 5px;text-shadow:0 0 12px #35e8ff55}
      #nx2-launcher .nx2-subtitle{color:#9eafc9;font-size:12px;margin:0 0 12px}
      #nx2-launcher .nx2-tools{display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:12px}
      #nx2-launcher input,#nx2-launcher select,#nx2-launcher .nx2-filter{min-width:0;width:100%;padding:10px;border:1px solid #28465e;border-radius:9px;background:#0b1425;color:#eef7ff;font-size:13px}
      #nx2-launcher .nx2-cats{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}
      #nx2-launcher .nx2-filter{width:auto;cursor:pointer;padding:7px 10px}
      #nx2-launcher .nx2-filter.active{background:#123449;border-color:#35e8ff;color:#35e8ff}
      #nx2-launcher .nx2-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}
      #nx2-launcher .nx2-card{position:relative;min-width:0;aspect-ratio:1/1.12;border:1px solid #35e8ff80;border-radius:10px;background:#10182b;color:#fff;cursor:pointer;display:flex;align-items:flex-end;justify-content:center;padding:5px 2px;text-align:center;isolation:isolate;overflow:hidden;-webkit-tap-highlight-color:transparent}
      #nx2-launcher .nx2-card:before{content:"";position:absolute;inset:0;z-index:-2;background-image:var(--nx2-bg);background-size:cover;background-position:center;transition:transform .2s}
      #nx2-launcher .nx2-card:after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,#03071330,#030713f5)}
      #nx2-launcher .nx2-card:active:before{transform:scale(1.07)}
      #nx2-launcher .nx2-card-content{display:flex;flex-direction:column;align-items:center;gap:4px;width:100%}
      #nx2-launcher .nx2-icon{font-size:clamp(20px,5vw,30px)}
      #nx2-launcher .nx2-name{font-size:clamp(8px,2vw,11px);font-weight:800;line-height:1.15;overflow-wrap:anywhere;text-shadow:0 2px 5px #000}
      #nx2-launcher .nx2-star{position:absolute;right:3px;top:3px;background:#07101dcc;border:0;color:#ffe16b;border-radius:7px;font-size:17px;padding:2px 5px;cursor:pointer}
      #nx2-launcher .nx2-empty{grid-column:1/-1;text-align:center;padding:25px;color:#9eafc9}
      #nx2-overlay{position:fixed;inset:0;z-index:2147483000;display:none;flex-direction:column;background:#050914;color:#eef7ff;overflow:auto;overscroll-behavior:contain}
      #nx2-overlay.nx2-visible{display:flex}
      #nx2-overlay button{font-family:inherit;cursor:pointer}
      #nx2-overlay .nx2-topbar{display:flex;align-items:center;gap:6px;padding:9px;background:#0b1222;border-bottom:1px solid #35e8ff55;position:sticky;top:0;z-index:5}
      #nx2-overlay .nx2-topbar button,#nx2-overlay summary{background:#111d32;color:#35e8ff;border:1px solid #35e8ff80;border-radius:8px;padding:9px 8px;font-size:12px;font-weight:800;white-space:nowrap}
      #nx2-overlay .nx2-game-title{flex:1;min-width:0;text-align:center;font-size:14px;font-weight:800}
      #nx2-overlay .nx2-difficulty{position:relative}
      #nx2-overlay summary{list-style:none}
      #nx2-overlay summary::-webkit-details-marker{display:none}
      #nx2-overlay .nx2-options{position:absolute;top:calc(100% + 4px);right:0;width:115px;padding:5px;background:#0b1222;border:1px solid #35e8ff70;border-radius:8px;display:grid;gap:5px}
      #nx2-overlay .nx2-options button{color:#eef7ff;border:1px solid #28465e;background:#111d32;border-radius:6px;padding:8px}
      #nx2-overlay #nx2-game-area{width:100%;max-width:850px;margin:0 auto;padding:12px;display:flex;flex-direction:column;align-items:center;gap:10px}
      #nx2-overlay canvas{display:block;max-width:100%;height:auto;border:1px solid #35e8ff70;border-radius:10px;background:#080f20;touch-action:none}
      #nx2-overlay #nx2-controls{width:100%;max-width:520px;display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:8px;padding:6px}
      #nx2-overlay .nx2-help{color:#9eafc9;font-size:12px;line-height:1.5;text-align:center;max-width:700px;padding:0 14px 18px;margin:auto}
      #nx2-overlay .nx2-pad{position:relative;height:90px;width:100%;border:2px solid #35e8ff;border-radius:17px;background:linear-gradient(135deg,#111e35,#080e1d);touch-action:none;overflow:hidden}
      #nx2-overlay .nx2-knob{position:absolute;left:50%;top:50%;width:44px;height:44px;border-radius:12px;transform:translate(-50%,-50%);border:2px solid #35e8ff;background:#35e8ff35;box-shadow:0 0 14px #35e8ff60;pointer-events:none}
      #nx2-overlay .nx2-action{min-width:68px;min-height:42px;padding:10px 12px;color:#35e8ff;background:#101b30;border:1px solid #35e8ff;border-radius:10px;font-weight:800;touch-action:manipulation}
      #nx2-overlay .nx2-action:active{background:#18364a}
      #nx2-overlay .nx2-answer{width:min(100%,300px);padding:12px;border-radius:8px;background:#101b30;color:white;border:1px solid #35e8ff;font-size:16px}
      @media(max-width:420px){#nx2-launcher .nx2-grid{gap:5px}#nx2-launcher .nx2-card{border-radius:7px}#nx2-launcher .nx2-name{font-size:8px}#nx2-overlay .nx2-topbar{gap:4px;padding:6px}#nx2-overlay .nx2-topbar button,#nx2-overlay summary{padding:8px 5px;font-size:10px}#nx2-overlay .nx2-game-title{font-size:11px}}
      </style>
      <h2 class="nx2-heading">⚡ EXTRA ARCADE</h2>
      <p class="nx2-subtitle">Ten more games. Choose your next challenge.</p>
      <div class="nx2-tools">
        <input id="nx2-search" type="search" placeholder="🔎 Search games..." aria-label="Search games">
        <select id="nx2-category" aria-label="Game category">
          <option value="All">All categories</option><option>Puzzle</option><option>Racing</option><option>Action</option><option>Adventure</option><option>Arcade</option>
        </select>
      </div>
      <div class="nx2-cats">
        <button class="nx2-filter active" data-view="all">All games</button>
        <button class="nx2-filter" data-view="favorites">⭐ Favorites</button>
        <button class="nx2-filter" data-view="recent">Recently played</button>
      </div>
      <div class="nx2-grid" id="nx2-grid"></div>`;

    const overlay=document.createElement('div');
    overlay.id='nx2-overlay';
    overlay.setAttribute('role','dialog');
    overlay.setAttribute('aria-modal','true');
    overlay.setAttribute('aria-label','Extra Arcade game');
    overlay.innerHTML=`
      <div class="nx2-topbar">
        <button id="nx2-back">← Games</button>
        <div class="nx2-game-title" id="nx2-title">Extra Arcade</div>
        <details class="nx2-difficulty"><summary>Difficulty</summary><div class="nx2-options">
          <button data-level="Easy">Easy</button><button data-level="Medium">Medium</button><button data-level="Hard">Hard</button><button data-level="Hardest">Hardest</button>
        </div></details>
        <button id="nx2-restart">↻ Restart</button>
      </div>
      <div id="nx2-game-area"></div><div id="nx2-controls"></div><p class="nx2-help" id="nx2-help"></p>`;

    const host=ROOT.parentNode||document.body;
    if(ROOT===document.body){document.body.appendChild(launcher);}
    else host.insertBefore(launcher,ROOT);
    document.body.appendChild(overlay);

    const area=$('#nx2-game-area',overlay),controls=$('#nx2-controls',overlay);
    const help=$('#nx2-help',overlay),title=$('#nx2-title',overlay);
    const difficultyMenu=$('.nx2-difficulty',overlay);
    const grid=$('#nx2-grid',launcher);

    let current=null,difficulty='Medium',cleanup=null,token=0;
    let view='all',query='',category='All';
    let favorites=new Set(),recent=[];
    let bestScores={};

    try{favorites=new Set(JSON.parse(localStorage.getItem('nx2-favorites')||'[]'));}catch(_){}
    try{recent=JSON.parse(localStorage.getItem('nx2-recent')||'[]');}catch(_){}
    try{bestScores=JSON.parse(localStorage.getItem('nx2-best')||'{}');}catch(_){}

    function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(_){}}
    function scoreBest(id,score){bestScores[id]=Math.max(bestScores[id]||0,score);save('nx2-best',bestScores);}
    function drawCards(){
      grid.replaceChildren();
      const list=GAMES.filter(g=>
        (view!=='favorites'||favorites.has(g.id))&&
        (view!=='recent'||recent.includes(g.id))&&
        (category==='All'||g.cat===category)&&
        (g.name+' '+g.cat).toLowerCase().includes(query.toLowerCase())
      );
      if(!list.length){const empty=document.createElement('div');empty.className='nx2-empty';empty.textContent='No games found. Try another search or category.';grid.appendChild(empty);return;}
      list.forEach(g=>{
        const card=document.createElement('button');card.type='button';card.className='nx2-card';
        card.style.setProperty('--nx2-bg',`url("https://images.unsplash.com/${g.image}?auto=format&fit=crop&w=400&q=75")`);
        const content=document.createElement('span');content.className='nx2-card-content';
        const icon=document.createElement('span');icon.className='nx2-icon';icon.textContent=g.icon;
        const name=document.createElement('span');name.className='nx2-name';name.textContent=g.name;
        content.append(icon,name);card.appendChild(content);
        const star=document.createElement('span');star.className='nx2-star';star.textContent=favorites.has(g.id)?'★':'☆';
        star.setAttribute('role','button');star.setAttribute('aria-label',favorites.has(g.id)?'Remove favorite':'Add favorite');
        star.addEventListener('click',e=>{e.stopPropagation();favorites.has(g.id)?favorites.delete(g.id):favorites.add(g.id);save('nx2-favorites',[...favorites]);drawCards();});
        card.appendChild(star);card.addEventListener('click',()=>openGame(g.id));grid.appendChild(card);
      });
    }

    $('#nx2-search',launcher).addEventListener('input',e=>{query=e.target.value;drawCards();});
    $('#nx2-category',launcher).addEventListener('change',e=>{category=e.target.value;drawCards();});
    launcher.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{
      view=b.dataset.view;
      launcher.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));
      drawCards();
    }));

    function setHelp(s){help.textContent=s||'';}
    function later(fn,ms){
      const t=token;
      return setTimeout(()=>{if(t===token&&overlay.classList.contains('nx2-visible'))fn();},ms);
    }
    function clearGame(){
      token++;
      if(cleanup){try{cleanup();}catch(e){console.error(e);}}
      cleanup=null;area.replaceChildren();controls.replaceChildren();help.textContent='';
    }
    function showOverlay(){overlay.classList.add('nx2-visible');document.body.style.overflow='hidden';}
    function closeGame(){
      clearGame();overlay.classList.remove('nx2-visible');document.body.style.overflow='';current=null;
      launcher.scrollIntoView({block:'nearest',behavior:'smooth'});
    }
    function canvasGame(w=340,h=480){
      const c=document.createElement('canvas');c.width=w;c.height=h;
      c.style.width=`min(100%,${w}px)`;c.style.maxHeight='65vh';
      const x=c.getContext('2d');if(!x)throw Error('Canvas unavailable');
      area.appendChild(c);return {c,x,w,h};
    }
    function button(text,fn){
      const b=document.createElement('button');b.type='button';b.className='nx2-action';b.textContent=text;b.addEventListener('click',fn);controls.appendChild(b);return b;
    }
    function pad(fn){
      const p=document.createElement('div');p.className='nx2-pad';
      const k=document.createElement('div');k.className='nx2-knob';p.appendChild(k);
      controls.appendChild(p);
      let active=false,pid=null;
      function release(){active=false;pid=null;k.style.left='50%';k.style.top='50%';fn(0,0);}
      function move(e){
        const r=p.getBoundingClientRect();
        const a=Math.max(-1,Math.min(1,2*(e.clientX-r.left)/r.width-1));
        const b=Math.max(-1,Math.min(1,2*(e.clientY-r.top)/r.height-1));
        k.style.left=(50+a*35)+'%';k.style.top=(50+b*30)+'%';fn(a,b);
      }
      p.addEventListener('pointerdown',e=>{active=true;pid=e.pointerId;p.setPointerCapture(pid);move(e);});
      p.addEventListener('pointermove',e=>{if(active&&e.pointerId===pid)move(e);});
      p.addEventListener('pointerup',release);p.addEventListener('pointercancel',release);
      return {release};
    }
    function bg(x,w,h){
      x.fillStyle='#070d1c';x.fillRect(0,0,w,h);
      const g=x.createRadialGradient(w/2,h/2,5,w/2,h/2,h);
      g.addColorStop(0,'#10213a');g.addColorStop(1,'#050914');
      x.fillStyle=g;x.fillRect(0,0,w,h);
    }
    function text(x,s,a,b,size=16,color='#eef7ff'){
      x.fillStyle=color;x.font=`bold ${size}px Arial`;x.textAlign='center';x.fillText(s,a,b);
    }
    function finish(x,w,h,s){
      x.fillStyle='#030713dd';x.fillRect(0,0,w,h);
      text(x,s,w/2,h/2,24,'#35e8ff');text(x,'Tap Restart to play again',w/2,h/2+32,13);
    }
    function timerUI(x,w,time){
      text(x,'TIME '+Math.max(0,Math.ceil(time)),w-55,23,14,time<10?'#ff5577':'#35e8ff');
    }
    function openGame(id){
      const g=GAMES.find(x=>x.id===id);if(!g)return;
      clearGame();current=id;title.textContent=g.name;showOverlay();difficultyMenu.open=false;
      recent=[id,...recent.filter(x=>x!==id)].slice(0,10);save('nx2-recent',recent);
      drawCards();
      try{startGame(id);}catch(e){console.error(e);area.textContent='Game error: '+e.message;}
    }
    function startGame(id){
      const fn={
        memory:startMemory,racing:startRacing,puzzle:startPuzzle,alien:startAlien,
        zombie:startZombie,word:startWord,maze:startMaze,parkour:startParkour,
        galaxy:startGalaxy,reflex:startReflex
      }[id];
      if(!fn)throw Error('Unknown game '+id);fn();
    }

    /* MEMORY MATCH */
    function startMemory(){
      const {c,x,w,h}=canvasGame(340,410),symbols=['🚀','🐉','🌟','🎮','💎','🪐','⚡','👾'];
      let deck=[],opened=[],matched=new Set(),locked=false,moves=0,time=90,over=false,last=0;
      function reset(){deck=[...symbols,...symbols].sort(()=>Math.random()-.5);opened=[];matched=new Set();locked=false;moves=0;time=90*DIFF[difficulty].time;over=false;last=0;render();}
      function render(){
        bg(x,w,h);
        for(let i=0;i<16;i++){
          const a=10+i%4*82,b=30+Math.floor(i/4)*90;
          x.fillStyle=matched.has(i)?'#16443d':opened.includes(i)?'#15334a':'#101b30';
          x.fillRect(a,b,72,78);x.strokeStyle='#35e8ff';x.strokeRect(a,b,72,78);
          text(x,matched.has(i)||opened.includes(i)?deck[i]:'?',a+36,b+47,25);
        }
        text(x,`Pairs ${matched.size/2}/8 · Moves ${moves}`,170,397,13);
        timerUI(x,w,time);
        if(matched.size===16||time<=0){over=true;finish(x,w,h,matched.size===16?'YOU WIN!':'TIME UP');scoreBest('memory',matched.size/2);}
      }
      function click(e){
        if(over||locked)return;
        const r=c.getBoundingClientRect(),a=(e.clientX-r.left)*w/r.width,b=(e.clientY-r.top)*h/r.height;
        const col=Math.floor((a-10)/82),row=Math.floor((b-30)/90),i=row*4+col;
        if(col<0||col>3||row<0||row>3||matched.has(i)||opened.includes(i))return;
        opened.push(i);render();
        if(opened.length===2){moves++;locked=true;
          const pair=deck[opened[0]]===deck[opened[1]];
          later(()=>{if(pair){matched.add(opened[0]);matched.add(opened[1]);}opened=[];locked=false;render();},pair?350:650);
        }
      }
      c.addEventListener('click',click);
      function frame(t){if(current!=='memory'||over)return;if(!last)last=t;const dt=Math.min(.1,(t-last)/1000);last=t;time-=dt;if(time<=0)time=0;render();requestAnimationFrame(frame);}
      button('New Deal',reset);setHelp('Tap two cards to match all eight pairs before the timer expires.');reset();requestAnimationFrame(frame);
    }

    /* NEON RACING — drawn cars, smooth steering and collision detection */
    function startRacing(){
      const {c,x,w,h}=canvasGame(340,500);
      let player=170,road=0,cars=[],score=0,time=60,alive=true,last=0,steer=0,keys=new Set(),spawn=0,inv=0;
      const d=DIFF[difficulty];
      function car(px,py,color,scale=1){
        x.save();x.translate(px,py);x.scale(scale,scale);
        x.fillStyle='#050914';x.fillRect(-15,-24,6,15);x.fillRect(9,-24,6,15);x.fillRect(-15,11,6,15);x.fillRect(9,11,6,15);
        x.fillStyle=color;x.beginPath();x.moveTo(-10,-29);x.lineTo(10,-29);x.lineTo(15,-15);x.lineTo(13,24);x.lineTo(8,29);x.lineTo(-8,29);x.lineTo(-13,24);x.lineTo(-15,-15);x.closePath();x.fill();
        x.fillStyle='#162d44';x.fillRect(-9,-17,18,11);x.fillRect(-9,3,18,8);
        x.fillStyle='#fff2b3';x.fillRect(-11,-27,5,3);x.fillRect(6,-27,5,3);
        x.fillStyle='#ff334e';x.fillRect(-11,22,5,3);x.fillRect(6,22,5,3);
        x.restore();
      }
      function reset(){player=170;road=0;cars=[];score=0;time=60*d.time;alive=true;last=0;steer=0;spawn=0;inv=0;render();}
      function render(){
        bg(x,w,h);x.fillStyle='#111827';x.fillRect(30,0,280,h);
        x.fillStyle='#f2f4ff';for(let y=-45;y<h;y+=55){x.fillRect(166,y+road,4,27);}
        x.fillStyle='#ff5577';x.fillRect(30,0,4,h);x.fillRect(306,0,4,h);
        cars.forEach(a=>car(a.x,a.y,'#ff4778',.88));car(player,420,'#35e8ff');
        text(x,'SCORE '+score,70,22,14);timerUI(x,w,time);
        if(!alive||time<=0)finish(x,w,h,time<=0?'RACE COMPLETE':'CRASH! SCORE '+score);
      }
      function keydown(e){if(['ArrowLeft','ArrowRight','a','d'].includes(e.key)){keys.add(e.key);e.preventDefault();}}
      function keyup(e){keys.delete(e.key);}
      window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);
      pad(a=>steer=a);
      button('◀',()=>player=Math.max(52,player-24));button('▶',()=>player=Math.min(288,player+24));
      function frame(t){
        if(current!=='racing'||!alive)return;
        if(!last)last=t;const dt=Math.min(32,t-last);last=t;
        time=Math.max(0,time-dt/1000);road=(road+dt*.22)%55;spawn+=dt;
        const direction=(keys.has('ArrowLeft')||keys.has('a')?-1:0)+(keys.has('ArrowRight')||keys.has('d')?1:0);
        player+=((steer||direction)*dt*.25);
        player=Math.max(50,Math.min(290,player));
        if(spawn>Math.max(350,850/d.enemy)){spawn=0;cars.push({x:55+Math.random()*230,y:-35});}
        cars.forEach(a=>a.y+=dt*.18*d.speed*d.enemy);
        cars=cars.filter(a=>a.y<h+40);
        for(const a of cars){if(Math.abs(a.x-player)<23&&Math.abs(a.y-420)<44){alive=false;break;}}
        score+=Math.floor(dt/35);
        render();
        if(time<=0){alive=false;render();scoreBest('racing',score);return;}
        requestAnimationFrame(frame);
      }
      setHelp('Steer with the wide touchpad or arrow keys. Avoid traffic, survive the countdown, and set a high score.');
      reset();requestAnimationFrame(frame);
      cleanup=()=>{window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);};
    }

    /* SLIDING PUZZLE — guaranteed-solvable shuffle */
    function startPuzzle(){
      const {c,x,w,h}=canvasGame(340,400);
      let tiles=[],moves=0,solved=false,started=0;
      function reset(){
        tiles=[1,2,3,4,5,6,7,8,0];
        for(let n=0;n<180;n++){
          const e=tiles.indexOf(0),r=Math.floor(e/3),col=e%3;
          const ns=[];if(r)ns.push(e-3);if(r<2)ns.push(e+3);if(col)ns.push(e-1);if(col<2)ns.push(e+1);
          const j=ns[Math.floor(Math.random()*ns.length)];[tiles[e],tiles[j]]=[tiles[j],tiles[e]];
        }
        moves=0;solved=false;started=performance.now();render();
      }
      function render(){
        bg(x,w,h);
        for(let i=0;i<9;i++){
          const a=25+i%3*98,b=25+Math.floor(i/3)*98;
          x.fillStyle=tiles[i]?'#102a43':'#050914';x.fillRect(a,b,88,88);
          x.strokeStyle='#35e8ff';x.strokeRect(a,b,88,88);
          if(tiles[i])text(x,String(tiles[i]),a+44,b+54,28);
        }
        text(x,`Moves: ${moves}`,170,335,16);
        text(x,`Time: ${Math.floor((performance.now()-started)/1000)}s`,170,365,13);
        if(solved)finish(x,w,h,'PUZZLE SOLVED!');
      }
      function click(e){
        if(solved)return;
        const r=c.getBoundingClientRect(),a=(e.clientX-r.left)*w/r.width,b=(e.clientY-r.top)*h/r.height;
        const col=Math.floor((a-25)/98),row=Math.floor((b-25)/98);
        if(col<0||col>2||row<0||row>2)return;
        const i=row*3+col,empty=tiles.indexOf(0);
        if(Math.abs(i%3-empty%3)+Math.abs(Math.floor(i/3)-Math.floor(empty/3))!==1)return;
        [tiles[i],tiles[empty]]=[tiles[empty],tiles[i]];moves++;
        solved=tiles.every((v,j)=>v===(j+1)%9);render();
        if(solved)scoreBest('puzzle',Math.max(0,500-moves));
      }
      c.addEventListener('click',click);button('Shuffle / Restart',reset);
      setHelp('Slide adjacent tiles into numerical order. Every shuffle is generated using legal moves, so the puzzle remains solvable.');reset();
    }

    /* ALIEN INVASION — automatic fire, waves, enemy shots and power-ups */
    function startAlien(){
      const {c,x,w,h}=canvasGame(340,480);
      let player=170,shots=[],aliens=[],enemyShots=[],power=[],score=0,lives=3,time=60,alive=true,last=0,spawn=0,fire=0,keys=new Set();
      const d=DIFF[difficulty];
      function reset(){player=170;shots=[];aliens=[];enemyShots=[];power=[];score=0;lives=3;time=60*d.time;alive=true;last=0;spawn=0;fire=0;render();}
      function ship(px,py){
        x.fillStyle='#35e8ff';x.beginPath();x.moveTo(px,py-19);x.lineTo(px+15,py+13);x.lineTo(px,py+7);x.lineTo(px-15,py+13);x.closePath();x.fill();
        x.fillStyle='#9b6cff';x.fillRect(px-4,py+6,8,12);
      }
      function render(){
        bg(x,w,h);ship(player,430);
        x.fillStyle='#9b6cff';shots.forEach(s=>x.fillRect(s.x-2,s.y,4,12));
        aliens.forEach(a=>{text(x,a.boss?'👹':'👾',a.x,a.y,22);});
        x.fillStyle='#ff5577';enemyShots.forEach(s=>x.fillRect(s.x-2,s.y,4,10));
        power.forEach(p=>text(x,'💎',p.x,p.y,17));
        text(x,`Score ${score} · Lives ${lives}`,100,22,13);timerUI(x,w,time);
        if(!alive||time<=0)finish(x,w,h,time<=0?'WAVE COMPLETE':'GAME OVER · '+score);
      }
      function shoot(){shots.push({x:player,y:410});}
      function resetKeys(e){if(['ArrowLeft','ArrowRight','a','d'].includes(e.key))keys.add(e.key);}
      function keyup(e){keys.delete(e.key);}
      function frame(t){
        if(current!=='alien'||!alive)return;
        if(!last)last=t;const dt=Math.min(32,t-last);last=t;time=Math.max(0,time-dt/1000);spawn+=dt;fire+=dt;
        if(fire>150){shoot();fire=0;}
        if(spawn>Math.max(250,850/d.enemy)){
          spawn=0;const boss=score>100&&Math.random()<.12;
          aliens.push({x:20+Math.random()*300,y:-20,hp:boss?5:1,boss});
        }
        if(Math.random()<.004*d.enemy)enemyShots.push({x:20+Math.random()*300,y:25});
        shots.forEach(s=>s.y-=dt*.5);enemyShots.forEach(s=>s.y+=dt*.18*d.enemy);
        aliens.forEach(a=>a.y+=dt*(a.boss?.035:.07)*d.enemy);
        for(let i=aliens.length-1;i>=0;i--){
          const a=aliens[i],j=shots.findIndex(s=>Math.abs(s.x-a.x)<19&&Math.abs(s.y-a.y)<20);
          if(j>=0){shots.splice(j,1);a.hp--;if(a.hp<=0){score+=a.boss?50:10;if(Math.random()<.12)power.push({x:a.x,y:a.y});aliens.splice(i,1);}continue;}
          if(a.y>410){lives--;aliens.splice(i,1);}
        }
        enemyShots=enemyShots.filter(s=>{if(s.y>405&&Math.abs(s.x-player)<18){lives--;return false;}return s.y<490;});
        power=power.filter(p=>{p.y+=dt*.08;if(Math.abs(p.x-player)<22&&p.y>405){lives=Math.min(5,lives+1);return false;}return p.y<490;});
        if(keys.has('ArrowLeft')||keys.has('a'))player-=dt*.22;
        if(keys.has('ArrowRight')||keys.has('d'))player+=dt*.22;
        player=Math.max(18,Math.min(322,player));shots=shots.filter(s=>s.y>-15);
        if(lives<=0||time<=0){alive=false;scoreBest('alien',score);}
        render();if(alive)requestAnimationFrame(frame);
      }
      window.addEventListener('keydown',resetKeys);window.addEventListener('keyup',keyup);
      pad(a=>{player=Math.max(18,Math.min(322,player+a*dtSafe()));});
      function dtSafe(){return 7;}
      button('FIRE: AUTO',()=>{if(alive)shoot();});
      setHelp('Your ship fires automatically. Move left and right, avoid enemy shots, collect gems and survive the countdown.');
      reset();requestAnimationFrame(frame);
      cleanup=()=>{window.removeEventListener('keydown',resetKeys);window.removeEventListener('keyup',keyup);};
    }

    /* ZOMBIE SURVIVAL — chase AI, health, attacks, waves and timer */
    function startZombie(){
      const {c,x,w,h}=canvasGame(340,480);
      let p={x:170,y:240},zs=[],score=0,health=100,time=90,alive=true,last=0,spawn=0,attack=0,ax=0,ay=0;
      const d=DIFF[difficulty];
      function reset(){p={x:170,y:240};zs=[];score=0;health=100;time=90*d.time;alive=true;last=0;spawn=0;attack=0;ax=0;ay=0;render();}
      function render(){
        bg(x,w,h);
        x.strokeStyle='#172943';for(let a=20;a<w;a+=40){x.beginPath();x.moveTo(a,0);x.lineTo(a,h);x.stroke();}
        for(let b=20;b<h;b+=40){x.beginPath();x.moveTo(0,b);x.lineTo(w,b);x.stroke();}
        text(x,'🧍',p.x,p.y,27);zs.forEach(z=>text(x,'🧟',z.x,z.y,24));
        x.fillStyle='#25334a';x.fillRect(12,34,100,8);x.fillStyle='#43f5a5';x.fillRect(12,34,100*health/100,8);
        text(x,`Score ${score}`,170,20,13);timerUI(x,w,time);
        if(!alive||time<=0)finish(x,w,h,time<=0?'YOU SURVIVED!':'GAME OVER · '+score);
      }
      function move(a,b){ax=a;ay=b;}
      function frame(t){
        if(current!=='zombie'||!alive)return;
        if(!last)last=t;const dt=Math.min(32,t-last);last=t;time=Math.max(0,time-dt/1000);spawn+=dt;attack+=dt;
        p.x=Math.max(15,Math.min(325,p.x+ax*dt*.17));p.y=Math.max(40,Math.min(465,p.y+ay*dt*.17));
        if(spawn>Math.max(300,1200/d.enemy)){spawn=0;const side=Math.floor(Math.random()*4);zs.push({x:side===0?0:side===1?340:Math.random()*340,y:side===2?0:side===3?480:Math.random()*480,hp:1});}
        zs.forEach(z=>{const dx=p.x-z.x,dy=p.y-z.y,dist=Math.hypot(dx,dy)||1;z.x+=dx/dist*dt*.035*d.enemy;z.y+=dy/dist*dt*.035*d.enemy;if(dist<25&&attack>500){health-=8;attack=0;}});
        zs=zs.filter(z=>{if(z.hp<=0){score+=10;return false;}return true;});
        score+=Math.floor(dt/180);
        if(health<=0||time<=0){alive=false;scoreBest('zombie',score);}
        render();if(alive)requestAnimationFrame(frame);
      }
      pad(move);
      button('ATTACK',()=>{
        if(!alive)return;
        let best=-1,dist=75;
        zs.forEach((z,i)=>{const n=Math.hypot(z.x-p.x,z.y-p.y);if(n<dist){dist=n;best=i;}});
        if(best>=0){zs.splice(best,1);score+=10;render();}
      });
      setHelp('Move with the touchpad. Attack nearby zombies, protect your health and survive the timer.');
      reset();requestAnimationFrame(frame);
    }

    /* WORD SCRAMBLE */
    function startWord(){
      const {c,x,w,h}=canvasGame(340,390);
      const words=['PLANET','GALAXY','ROCKET','ARCADE','JUNGLE','PUZZLE','NEBULA','DRAGON','SHIELD','COSMOS','COMPUTER','ROBOT','ENERGY','MONSTER'];
      let word='',scrambled='',score=0,round=0,time=90,over=false,last=0;
      const input=document.createElement('input');input.className='nx2-answer';input.placeholder='Type your answer';input.maxLength=20;input.autocomplete='off';input.setAttribute('aria-label','Word answer');area.appendChild(input);
      function next(){
        word=words[Math.floor(Math.random()*words.length)];
        do{scrambled=word.split('').sort(()=>Math.random()-.5).join('');}while(scrambled===word);
        input.value='';input.disabled=false;render();
      }
      function reset(){score=0;round=0;time=90*DIFF[difficulty].time;over=false;last=0;next();}
      function render(){
        bg(x,w,h);text(x,'UNSCRAMBLE THE WORD',170,70,17);
        text(x,scrambled,170,145,30,'#35e8ff');text(x,`Score ${score}`,170,200,17);
        text(x,`Round ${round+1}/10`,170,235,14);timerUI(x,w,time);
        if(over)finish(x,w,h,time<=0?'TIME UP':'FINAL SCORE '+score);
      }
      function submit(){
        if(over||input.disabled)return;
        if(input.value.trim().toUpperCase()===word){
          score+=10;round++;input.disabled=true;
          if(round>=10){over=true;scoreBest('word',score);render();}
          else{render();later(next,450);}
        }else{input.value='';input.placeholder='Not quite — try again';}
      }
      input.addEventListener('keydown',e=>{if(e.key==='Enter')submit();});
      button('SUBMIT',submit);button('HINT',()=>{if(!over)input.placeholder='Starts with '+word[0]+'…';});
      function frame(t){if(current!=='word'||over)return;if(!last)last=t;time=Math.max(0,time-Math.min(.1,(t-last)/1000));last=t;if(time<=0){over=true;scoreBest('word',score);}render();if(!over)requestAnimationFrame(frame);}
      setHelp('Unscramble ten words before time runs out. Use hints when you get stuck.');reset();requestAnimationFrame(frame);
    }

    /* NEON MAZE — connected randomized maze and timed navigation */
    function startMaze(){
      const {c,x,w,h}=canvasGame(340,440),N=15,cell=21,ox=12,oy=45;
      let grid=[],p={x:1,y:1},moves=0,time=120,won=false,last=0;
      function reset(){
        grid=Array.from({length:N},()=>Array(N).fill(1));
        function carve(a,b){
          grid[b][a]=0;
          const ds=[[0,-2],[2,0],[0,2],[-2,0]].sort(()=>Math.random()-.5);
          ds.forEach(([dx,dy])=>{const nx=a+dx,ny=b+dy;if(nx>0&&nx<N-1&&ny>0&&ny<N-1&&grid[ny][nx]===1){grid[b+dy/2][a+dx/2]=0;carve(nx,ny);}});
        }
        carve(1,1);grid[N-2][N-2]=0;grid[N-2][N-3]=0;
        p={x:1,y:1};moves=0;time=120*DIFF[difficulty].time;won=false;last=0;render();
      }
      function render(){
        bg(x,w,h);
        for(let b=0;b<N;b++)for(let a=0;a<N;a++){x.fillStyle=grid[b][a]?'#26344c':'#081323';x.fillRect(ox+a*cell,oy+b*cell,cell-1,cell-1);}
        x.fillStyle='#43f5a5';x.fillRect(ox+(N-2)*cell+4,oy+(N-2)*cell+4,cell-9,cell-9);
        text(x,'🌀',ox+p.x*cell+10,oy+p.y*cell+16,16);text(x,'Moves '+moves,170,390,14);timerUI(x,w,time);
        if(won||time<=0)finish(x,w,h,won?'MAZE ESCAPED!':'TIME UP');
      }
      function move(dx,dy){
        if(won||time<=0)return;
        const a=p.x+dx,b=p.y+dy;
        if(a<0||a>=N||b<0||b>=N||grid[b][a])return;
        p={x:a,y:b};moves++;if(a===N-2&&b===N-2){won=true;scoreBest('maze',Math.max(0,1000-moves));}render();
      }
      const key=e=>{
        const m={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
        if(m[e.key]){e.preventDefault();move(...m[e.key]);}
      };
      window.addEventListener('keydown',key);
      let lastMove=0;
      pad((a,b)=>{
        if(Math.max(Math.abs(a),Math.abs(b))<.6){lastMove=0;return;}
        const now=performance.now();if(now-lastMove<160)return;lastMove=now;
        if(Math.abs(a)>Math.abs(b))move(a>0?1:-1,0);else move(0,b>0?1:-1);
      });
      button('↑',()=>move(0,-1));button('↓',()=>move(0,1));button('←',()=>move(-1,0));button('→',()=>move(1,0));button('New Maze',reset);
      function frame(t){if(current!=='maze'||won||time<=0)return;if(!last)last=t;time=Math.max(0,time-Math.min(.1,(t-last)/1000));last=t;render();if(time>0&&!won)requestAnimationFrame(frame);}
      setHelp('Reach the green exit. Every maze has a connected route. Use the touchpad, direction buttons or keyboard.');
      reset();requestAnimationFrame(frame);cleanup=()=>window.removeEventListener('keydown',key);
    }

    /* CYBER PARKOUR — jump, platforms, obstacles and collectibles */
    function startParkour(){
      const {c,x,w,h}=canvasGame(340,460);
      let player={x:65,y:330,vy:0},platforms=[],obstacles=[],orbs=[],score=0,time=90,alive=true,last=0,scroll=0,ground=true,move=0;
      const d=DIFF[difficulty];
      function reset(){
        player={x:65,y:330,vy:0};platforms=[{x:0,y:370,w:340}];obstacles=[];orbs=[];score=0;time=90*d.time;alive=true;last=0;scroll=0;ground=true;move=0;render();
      }
      function jump(){if(ground&&alive){player.vy=-8;ground=false;}}
      function render(){
        bg(x,w,h);
        x.strokeStyle='#172b4a';for(let a=0;a<340;a+=28){x.beginPath();x.moveTo(a,0);x.lineTo(a,460);x.stroke();}
        platforms.forEach(p=>{x.fillStyle='#35e8ff';x.fillRect(p.x,p.y,p.w,7);});
        obstacles.forEach(o=>{x.fillStyle='#ff5577';x.fillRect(o.x,o.y,o.w,o.h);});
        orbs.forEach(o=>text(x,'💎',o.x,o.y,16));
        text(x,'🏃',player.x,player.y,26);text(x,'Score '+score,65,22,14);timerUI(x,w,time);
        if(!alive||time<=0)finish(x,w,h,time<=0?'STAGE COMPLETE':'GAME OVER · '+score);
      }
      function frame(t){
        if(current!=='parkour'||!alive)return;
        if(!last)last=t;const dt=Math.min(32,t-last);last=t;time=Math.max(0,time-dt/1000);
        player.x=Math.max(15,Math.min(325,player.x+move*dt*.16));
        const oldY=player.y;player.vy+=dt*.00042;player.y+=player.vy*dt*.06;ground=false;
        platforms.forEach(p=>{p.x-=dt*.08*d.speed;if(oldY<=p.y&&player.y>=p.y&&player.x+8>=p.x&&player.x-8<=p.x+p.w&&player.vy>=0){player.y=p.y;player.vy=0;ground=true;}});
        platforms=platforms.filter(p=>p.x+p.w>0);
        if(platforms.length<5)platforms.push({x:350,y:260+Math.random()*110,w:55+Math.random()*65});
        if(Math.random()<.012*d.enemy)obstacles.push({x:350,y:335,w:15,h:30});
        if(Math.random()<.009)orbs.push({x:350,y:280+Math.random()*65});
        obstacles.forEach(o=>o.x-=dt*.1*d.speed);orbs.forEach(o=>o.x-=dt*.1*d.speed);
        if(obstacles.some(o=>player.x+8>o.x&&player.x-8<o.x+o.w&&player.y+7>o.y&&player.y-18<o.y+o.h))alive=false;
        orbs=orbs.filter(o=>{if(Math.hypot(player.x-o.x,player.y-o.y)<23){score+=10;return false;}return o.x>-20;});
        obstacles=obstacles.filter(o=>o.x>-30);score+=Math.floor(dt/100);
        if(player.y>470)alive=false;
        render();if(time<=0){alive=false;scoreBest('parkour',score);render();return;}if(alive)requestAnimationFrame(frame);
      }
      pad(a=>move=a);
      button('JUMP',jump);button('←',()=>player.x=Math.max(15,player.x-20));button('→',()=>player.x=Math.min(325,player.x+20));
      const key=e=>{if(e.code==='Space'||e.key==='ArrowUp'){e.preventDefault();jump();}if(e.key==='ArrowLeft')move=-1;if(e.key==='ArrowRight')move=1;};
      const keyup=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key))move=0;};
      window.addEventListener('keydown',key);window.addEventListener('keyup',keyup);
      setHelp('Run, jump across glowing platforms, dodge laser traps and collect gems. Use JUMP or Space.');
      reset();requestAnimationFrame(frame);cleanup=()=>{window.removeEventListener('keydown',key);window.removeEventListener('keyup',keyup);};
    }

    /* GALAXY DEFENDER — ship, automatic fire, enemy waves and boss */
    function startGalaxy(){
      const {c,x,w,h}=canvasGame(340,480);
      let p=170,shots=[],enemies=[],score=0,lives=3,time=60,alive=true,last=0,spawn=0,fire=0,keys=new Set();
      const d=DIFF[difficulty];
      function reset(){p=170;shots=[];enemies=[];score=0;lives=3;time=60*d.time;alive=true;last=0;spawn=0;fire=0;render();}
      function ship(px,py){
        x.fillStyle='#9b6cff';x.beginPath();x.moveTo(px,py-22);x.lineTo(px+17,py+16);x.lineTo(px,py+8);x.lineTo(px-17,py+16);x.closePath();x.fill();
        x.fillStyle='#35e8ff';x.fillRect(px-4,py+5,8,17);x.fillStyle='#ffb45e';x.fillRect(px-3,py+18,6,8);
      }
      function render(){
        bg(x,w,h);
        for(let i=0;i<35;i++){x.fillStyle='#d6e9ff';x.fillRect((i*71)%w,(i*97)%h,1.5,1.5);}
        ship(p,425);x.fillStyle='#35e8ff';shots.forEach(s=>x.fillRect(s.x-2,s.y,4,12));
        enemies.forEach(e=>{text(x,e.boss?'👹':'🛸',e.x,e.y,e.boss?34:23);if(e.boss){x.fillStyle='#ff5577';x.fillRect(e.x-24,e.y-23,48*Math.max(0,e.hp/8),3);}});
        text(x,`Score ${score} · Lives ${lives}`,100,22,13);timerUI(x,w,time);
        if(!alive||time<=0)finish(x,w,h,time<=0?'MISSION COMPLETE':'SHIP LOST · '+score);
      }
      function shoot(){shots.push({x:p,y:405});}
      function kd(e){keys.add(e.key);}
      function ku(e){keys.delete(e.key);}
      function frame(t){
        if(current!=='galaxy'||!alive)return;
        if(!last)last=t;const dt=Math.min(32,t-last);last=t;time=Math.max(0,time-dt/1000);spawn+=dt;fire+=dt;
        if(fire>130){shoot();fire=0;}
        if(spawn>Math.max(250,900/d.enemy)){
          spawn=0;enemies.push({x:20+Math.random()*300,y:-20,hp:score>120&&Math.random()<.12?8:1,boss:false});
        }
        shots.forEach(s=>s.y-=dt*.5);
        enemies.forEach(e=>e.y+=dt*(e.hp>1?.025:.07)*d.enemy);
        for(let i=enemies.length-1;i>=0;i--){
          const e=enemies[i],j=shots.findIndex(s=>Math.abs(s.x-e.x)<20&&Math.abs(s.y-e.y)<20);
          if(j>=0){shots.splice(j,1);e.hp--;if(e.hp<=0){score+=e.boss?60:10;enemies.splice(i,1);}continue;}
          if(e.y>405){lives--;enemies.splice(i,1);}
        }
        if(keys.has('ArrowLeft')||keys.has('a'))p-=dt*.2;
        if(keys.has('ArrowRight')||keys.has('d'))p+=dt*.2;
        p=Math.max(18,Math.min(322,p));shots=shots.filter(s=>s.y>-15);
        if(lives<=0||time<=0){alive=false;scoreBest('galaxy',score);}
        render();if(alive)requestAnimationFrame(frame);
      }
      window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
      pad(a=>p=Math.max(18,Math.min(322,p+a*7)));
      button('FIRE · AUTO',shoot);
      setHelp('Your jet fires automatically. Steer through enemy waves, defeat tougher ships and protect your three lives.');
      reset();requestAnimationFrame(frame);cleanup=()=>{window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);};
    }

    /* NEON REFLEX — dodge lanes, collect points, progressive speed */
    function startReflex(){
      const {c,x,w,h}=canvasGame(340,460);
      let lane=1,obstacles=[],score=0,time=45,alive=true,last=0,spawn=0,keys=new Set();
      const d=DIFF[difficulty];
      function reset(){lane=1;obstacles=[];score=0;time=45*d.time;alive=true;last=0;spawn=0;render();}
      function render(){
        bg(x,w,h);
        x.strokeStyle='#1c4960';x.lineWidth=1;
        for(let a=0;a<340;a+=25){x.beginPath();x.moveTo(a,0);x.lineTo(170+(a-170)*.3,h);x.stroke();}
        x.fillStyle='#101b30';x.fillRect(55,30,230,390);
        x.strokeStyle='#35e8ff';x.setLineDash([14,12]);x.beginPath();x.moveTo(132,30);x.lineTo(132,420);x.moveTo(208,30);x.lineTo(208,420);x.stroke();x.setLineDash([]);
        obstacles.forEach(o=>{x.fillStyle=o.good?'#43f5a5':'#ff5577';x.fillRect(72+o.lane*76,o.y,44,24);});
        x.fillStyle='#35e8ff';x.beginPath();x.moveTo(170+(lane-1)*76,365);x.lineTo(153+(lane-1)*76,393);x.lineTo(187+(lane-1)*76,393);x.closePath();x.fill();
        text(x,'Score '+score,65,22,14);timerUI(x,w,time);
        if(!alive||time<=0)finish(x,w,h,time<=0?'ROUND COMPLETE':'GAME OVER · '+score);
      }
      function shift(n){lane=Math.max(0,Math.min(2,lane+n));}
      const kd=e=>{if(e.key==='ArrowLeft'||e.key==='a'){shift(-1);e.preventDefault();}if(e.key==='ArrowRight'||e.key==='d'){shift(1);e.preventDefault();}};
      window.addEventListener('keydown',kd);
      pad(a=>{if(a<-.55)shift(-1);else if(a>.55)shift(1);});
      button('◀',()=>shift(-1));button('▶',()=>shift(1));
      function frame(t){
        if(current!=='reflex'||!alive)return;
        if(!last)last=t;const dt=Math.min(32,t-last);last=t;time=Math.max(0,time-dt/1000);spawn+=dt;
        if(spawn>Math.max(220,650/(d.enemy+score/250))){spawn=0;obstacles.push({lane:Math.floor(Math.random()*3),y:20,good:Math.random()<.2});}
        obstacles.forEach(o=>o.y+=dt*.16*d.speed*(1+score/300));
        for(const o of obstacles){if(o.y>340&&o.y<395&&o.lane===lane){if(o.good){score+=5;o.y=500;}else alive=false;}}
        obstacles=obstacles.filter(o=>{if(o.y>420){if(!o.good)score++;return false;}return true;});
        score+=Math.floor(dt/150);
        if(time<=0){alive=false;scoreBest('reflex',score);}
        render();if(alive)requestAnimationFrame(frame);
      }
      setHelp('Switch between three lanes to avoid pink obstacles. Green energy blocks give bonus points. Survive the countdown.');
      reset();requestAnimationFrame(frame);cleanup=()=>window.removeEventListener('keydown',kd);
    }

    $('#nx2-back',overlay).addEventListener('click',closeGame);
    $('#nx2-restart',overlay).addEventListener('click',()=>{if(current)openGame(current);});
    difficultyMenu.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>{
      difficulty=b.dataset.level;difficultyMenu.open=false;if(current)openGame(current);
    }));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('nx2-visible'))closeGame();});
    drawCards();
    console.info('REXWEB NEXORA Extra Arcade ready.');
  }

  function showError(error){
    console.error('Extra Arcade initialization failed:',error);
    const box=document.getElementById('loading-error')||document.createElement('div');
    box.id='loading-error';box.setAttribute('role','alert');
    box.style.cssText='display:block;margin:16px auto;padding:14px;max-width:600px;color:#ffb4c4;background:#24101b;border:1px solid #713149;border-radius:10px;overflow-wrap:anywhere';
    box.textContent='Extra Arcade initialization error: '+(error?.message||String(error));
    (document.getElementById('nexora-games')||document.body).appendChild(box);
  }
  function run(){try{boot();}catch(e){showError(e);}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();
```
