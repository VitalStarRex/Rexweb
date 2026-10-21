(() => {
  'use strict';

  /*
   * REXWEB NEXORA — EXTRA ARCADE
   * Supports #nexora-games and standalone HTML pages.
   * Includes visible initialization errors for easier debugging.
   */

  function initNexoraExtraArcade() {
    if (document.getElementById('nx2-launcher')) return;

    let ROOT = document.getElementById('nexora-games');

    if (!ROOT) {
      ROOT = document.createElement('section');
      ROOT.id = 'nexora-games';
      ROOT.style.cssText = 'width:100%;min-height:1px;';
      (document.querySelector('main') ||
        document.querySelector('#app') ||
        document.body).appendChild(ROOT);
    }

    const GAMES = [
      { id:'memory', icon:'🧠', name:'Memory Match', image:'photo-1516321318423-f06f85e504b3' },
      { id:'racing', icon:'🏎️', name:'Neon Racing', image:'photo-1492144534655-ae79c964c9d7' },
      { id:'tower', icon:'🗼', name:'Tower Stack', image:'photo-1511818966892-d7d671e672a2' },
      { id:'mine', icon:'💣', name:'Minefield Mystery', image:'photo-1518709268805-4e9042af9f23' },
      { id:'puzzle', icon:'🧩', name:'Sliding Puzzle', image:'photo-1513364776144-60967b0f800f' },
      { id:'alien', icon:'👾', name:'Alien Invasion', image:'photo-1446776811953-b23d57bd21aa' },
      { id:'zombie', icon:'🧟', name:'Zombie Survival', image:'photo-1518709268805-4e9042af9f23' },
      { id:'word', icon:'🔤', name:'Word Scramble', image:'photo-1455390582262-044cdead277a' },
      { id:'hockey', icon:'🏒', name:'Air Hockey', image:'photo-1519861531473-9200262188bf' },
      { id:'maze', icon:'🌀', name:'Neon Maze', image:'photo-1519608487953-e999c86e7455' }
    ];

    const launcher = document.createElement('section');
    launcher.id = 'nx2-launcher';

    launcher.innerHTML = `
      <style>
        #nx2-launcher {
          color:#eef7ff;
          font-family:Arial,sans-serif;
          width:100%;
          margin:18px auto;
          box-sizing:border-box;
        }
        #nx2-launcher * {box-sizing:border-box}
        #nx2-launcher .nx2-heading {
          color:#35e8ff;
          font-size:clamp(19px,4vw,27px);
          font-weight:800;
          margin:0 0 5px;
          text-shadow:0 0 12px #35e8ff55;
        }
        #nx2-launcher .nx2-subtitle {
          color:#9eafc9;
          font-size:12px;
          margin:0 0 14px;
        }
        #nx2-launcher .nx2-grid {
          display:grid;
          grid-template-columns:repeat(5,minmax(0,1fr));
          gap:7px;
          width:100%;
        }
        #nx2-launcher .nx2-card {
          position:relative;
          overflow:hidden;
          min-width:0;
          aspect-ratio:1/1.08;
          border:1px solid #35e8ff80;
          border-radius:10px;
          background:#10182b;
          color:#fff;
          cursor:pointer;
          display:flex;
          align-items:flex-end;
          justify-content:center;
          padding:5px 2px;
          text-align:center;
          isolation:isolate;
          box-shadow:0 0 8px #35e8ff12;
          -webkit-tap-highlight-color:transparent;
        }
        #nx2-launcher .nx2-card::before {
          content:"";
          position:absolute;
          inset:0;
          z-index:-2;
          background-image:var(--nx2-bg);
          background-size:cover;
          background-position:center;
          transition:transform .2s;
        }
        #nx2-launcher .nx2-card::after {
          content:"";
          position:absolute;
          inset:0;
          z-index:-1;
          background:linear-gradient(180deg,#03071325 5%,#03071365 45%,#030713f5 100%);
        }
        #nx2-launcher .nx2-card:active::before {
          transform:scale(1.08);
        }
        #nx2-launcher .nx2-card:focus-visible {
          outline:2px solid #9b6cff;
          outline-offset:2px;
        }
        #nx2-launcher .nx2-card-content {
          width:100%;
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:4px;
        }
        #nx2-launcher .nx2-icon {
          font-size:clamp(20px,5vw,30px);
          line-height:1.1;
          filter:drop-shadow(0 2px 5px #000);
        }
        #nx2-launcher .nx2-name {
          font-size:clamp(8px,2.1vw,11px);
          font-weight:800;
          line-height:1.15;
          overflow-wrap:anywhere;
          text-shadow:0 2px 5px #000;
        }
        #nx2-overlay {
          position:fixed;
          inset:0;
          z-index:2147483000;
          display:none;
          flex-direction:column;
          background:#050914;
          color:#eef7ff;
          font-family:Arial,sans-serif;
          overflow:auto;
          overscroll-behavior:contain;
        }
        #nx2-overlay.nx2-visible {display:flex}
        #nx2-overlay .nx2-topbar {
          display:flex;
          align-items:center;
          gap:8px;
          padding:10px;
          background:#0b1222;
          border-bottom:1px solid #35e8ff55;
          position:sticky;
          top:0;
          z-index:5;
        }
        #nx2-overlay .nx2-topbar button,
        #nx2-overlay .nx2-difficulty summary {
          background:#111d32;
          color:#35e8ff;
          border:1px solid #35e8ff80;
          border-radius:8px;
          padding:9px 10px;
          font-weight:700;
          cursor:pointer;
          font-size:12px;
        }
        #nx2-overlay .nx2-game-title {
          flex:1;
          min-width:0;
          text-align:center;
          font-size:15px;
          font-weight:800;
          overflow-wrap:anywhere;
        }
        #nx2-overlay .nx2-difficulty {position:relative}
        #nx2-overlay .nx2-difficulty summary {list-style:none}
        #nx2-overlay .nx2-difficulty summary::-webkit-details-marker {display:none}
        #nx2-overlay .nx2-difficulty[open] .nx2-options {
          position:absolute;
          top:calc(100% + 5px);
          right:0;
          width:125px;
          padding:5px;
          background:#0b1222;
          border:1px solid #35e8ff70;
          border-radius:8px;
          display:grid;
          gap:5px;
        }
        #nx2-overlay .nx2-options button {
          width:100%;
          background:#111d32;
          color:#eef7ff;
          border:1px solid #283a57;
          padding:8px;
          border-radius:6px;
        }
        #nx2-overlay #nx2-game-area {
          width:100%;
          max-width:850px;
          margin:0 auto;
          padding:12px;
          flex:1;
          display:flex;
          flex-direction:column;
          align-items:center;
          justify-content:flex-start;
          gap:12px;
        }
        #nx2-overlay #nx2-game-area canvas {
          display:block;
          max-width:100%;
          height:auto;
          border:1px solid #35e8ff70;
          border-radius:10px;
          background:#080f20;
          touch-action:none;
        }
        #nx2-overlay #nx2-controls {
          width:100%;
          max-width:520px;
          display:flex;
          justify-content:center;
          align-items:center;
          flex-wrap:wrap;
          gap:10px;
          padding:8px;
        }
        #nx2-overlay #nx2-help {
          color:#9eafc9;
          font-size:12px;
          line-height:1.5;
          text-align:center;
          max-width:700px;
          padding:0 12px 16px;
          margin:0 auto;
        }
        #nx2-overlay .nx2-touch-area {
          width:100%;
          max-width:520px;
          padding:6px;
        }
        #nx2-overlay .nx2-pad {
          position:relative;
          height:100px;
          width:100%;
          border:2px solid #35e8ff;
          border-radius:18px;
          background:linear-gradient(135deg,#111e35,#080e1d);
          box-shadow:inset 0 0 18px #35e8ff18,0 0 12px #35e8ff15;
          touch-action:none;
          overflow:hidden;
        }
        #nx2-overlay .nx2-pad-inner {
          position:absolute;
          inset:0;
          background:radial-gradient(ellipse,#35e8ff12,transparent 70%);
        }
        #nx2-overlay .nx2-knob {
          position:absolute;
          left:50%;
          top:50%;
          width:48px;
          height:48px;
          border-radius:12px;
          transform:translate(-50%,-50%);
          border:2px solid #35e8ff;
          background:#35e8ff35;
          box-shadow:0 0 14px #35e8ff60;
          pointer-events:none;
        }
        #nx2-overlay .nx2-action {
          min-width:72px;
          min-height:42px;
          padding:10px 14px;
          color:#35e8ff;
          background:#101b30;
          border:1px solid #35e8ff;
          border-radius:10px;
          font-weight:800;
          touch-action:none;
        }
        #nx2-overlay .nx2-action:active {background:#18364a}
        @media(max-width:420px) {
          #nx2-launcher .nx2-grid {gap:5px}
          #nx2-launcher .nx2-card {border-radius:7px;padding:4px 1px}
          #nx2-launcher .nx2-name {font-size:8px}
          #nx2-overlay .nx2-topbar {gap:5px;padding:7px}
          #nx2-overlay .nx2-topbar button,
          #nx2-overlay .nx2-difficulty summary {padding:8px 6px;font-size:11px}
          #nx2-overlay .nx2-game-title {font-size:12px}
        }
      </style>
      <h2 class="nx2-heading">⚡ EXTRA ARCADE</h2>
      <p class="nx2-subtitle">Ten more games. Choose your next challenge.</p>
      <div class="nx2-grid" id="nx2-grid"></div>
    `;

    const overlay = document.createElement('div');
    overlay.id = 'nx2-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Extra Arcade game');

    overlay.innerHTML = `
      <div class="nx2-topbar">
        <button type="button" id="nx2-back">← Games</button>
        <div class="nx2-game-title" id="nx2-title">Extra Arcade</div>
        <details class="nx2-difficulty">
          <summary>Difficulty</summary>
          <div class="nx2-options">
            <button type="button" data-level="Easy">Easy</button>
            <button type="button" data-level="Medium">Medium</button>
            <button type="button" data-level="Hard">Hard</button>
            <button type="button" data-level="Hardest">Hardest</button>
          </div>
        </details>
        <button type="button" id="nx2-restart">↻ Restart</button>
      </div>
      <div id="nx2-game-area"></div>
      <div id="nx2-controls"></div>
      <div id="nx2-help"></div>
    `;

    /*
     * Insert the launcher before building game handlers.
     * This ensures the page visibly initializes even if a game
     * implementation later throws an error.
     */
    const host = ROOT.parentNode || document.body;
    host.insertBefore(launcher, ROOT);
    document.body.appendChild(overlay);

    const area = overlay.querySelector('#nx2-game-area');
    const controls = overlay.querySelector('#nx2-controls');
    const help = overlay.querySelector('#nx2-help');
    const title = overlay.querySelector('#nx2-title');
    const difficultyMenu = overlay.querySelector('.nx2-difficulty');

    let currentGame = null;
    let difficulty = 'Medium';
    let cleanup = null;
    let gameToken = 0;

    const DIFFICULTIES = {
      Easy: { speed:.75, enemy:.65, time:1.4, count:1.3 },
      Medium: { speed:1, enemy:1, time:1, count:1 },
      Hard: { speed:1, enemy:1.4, time:.8, count:.8 },
      Hardest: { speed:1, enemy:1.9, time:.6, count:.6 }
    };

    function later(fn, delay) {
      const token = gameToken;
      return setTimeout(() => {
        if (token === gameToken && overlay.classList.contains('nx2-visible')) {
          fn();
        }
      }, delay);
    }

    function clearGame() {
      gameToken++;
      if (typeof cleanup === 'function') {
        try { cleanup(); } catch (error) { console.error(error); }
      }
      cleanup = null;
      area.replaceChildren();
      controls.replaceChildren();
      help.textContent = '';
    }

    function showOverlay() {
      overlay.classList.add('nx2-visible');
      document.body.style.overflow = 'hidden';
    }

    function closeGame() {
      clearGame();
      overlay.classList.remove('nx2-visible');
      document.body.style.overflow = '';
      currentGame = null;
      launcher.scrollIntoView({ block:'nearest', behavior:'smooth' });
    }

    function setHelp(text) {
      help.textContent = text || '';
    }

    function shell(name, width=360, height=480) {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = 'min(100%,' + width + 'px)';
      canvas.style.maxHeight = '65vh';
      canvas.style.objectFit = 'contain';
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas is not supported by this browser.');
      area.appendChild(canvas);
      return { canvas, ctx, wrap:area };
    }

    function addButton(label, callback, className='nx2-action') {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = className;
      button.textContent = label;
      button.addEventListener('click', callback);
      controls.appendChild(button);
      return button;
    }

    function addTouchpad(onMove, options={}) {
      const touchArea = document.createElement('div');
      touchArea.className = 'nx2-touch-area';
      const pad = document.createElement('div');
      pad.className = 'nx2-pad';
      const inner = document.createElement('div');
      inner.className = 'nx2-pad-inner';
      const knob = document.createElement('div');
      knob.className = 'nx2-knob';
      pad.append(inner, knob);
      touchArea.appendChild(pad);
      controls.appendChild(touchArea);

      let active = false;
      const deadzone = options.deadzone || .12;

      function move(event) {
        const rect = pad.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1,
          ((event.clientX - rect.left) / rect.width - .5) * 2));
        const y = Math.max(-1, Math.min(1,
          ((event.clientY - rect.top) / rect.height - .5) * 2));
        const dx = Math.abs(x) < deadzone ? 0 : x;
        const dy = Math.abs(y) < deadzone ? 0 : y;
        knob.style.left = (50 + x * 35) + '%';
        knob.style.top = (50 + y * 28) + '%';
        onMove(dx, dy);
      }

      function release() {
        active = false;
        knob.style.left = '50%';
        knob.style.top = '50%';
        onMove(0, 0);
      }

      pad.addEventListener('pointerdown', event => {
        active = true;
        try { pad.setPointerCapture(event.pointerId); } catch (_) {}
        move(event);
      });
      pad.addEventListener('pointermove', event => {
        if (active) move(event);
      });
      pad.addEventListener('pointerup', release);
      pad.addEventListener('pointercancel', release);
      return { pad, release };
    }

    function makeCanvasBackground(ctx, width, height) {
      ctx.fillStyle = '#070d1c';
      ctx.fillRect(0, 0, width, height);
    }

    function drawText(ctx, text, x, y, size=18, color='#eef7ff') {
      ctx.fillStyle = color;
      ctx.font = `bold ${size}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(text, x, y);
    }

    function finishMessage(ctx, width, height, text) {
      ctx.fillStyle = '#030713bb';
      ctx.fillRect(0, 0, width, height);
      drawText(ctx, text, width/2, height/2, 24, '#35e8ff');
      drawText(ctx, 'Tap Restart to play again', width/2, height/2+34, 13);
    }

    function openGame(id) {
      const game = GAMES.find(item => item.id === id);
      if (!game) return;

      clearGame();
      currentGame = id;
      title.textContent = game.name;
      showOverlay();
      difficultyMenu.open = false;

      try {
        startGame(id);
      } catch (error) {
        console.error('Extra Arcade game failed:', id, error);
        area.textContent = 'This game encountered an error: ' + error.message;
      }
    }

    function startGame(id) {
      switch (id) {
        case 'memory': startMemory(); break;
        case 'racing': startRacing(); break;
        case 'tower': startTower(); break;
        case 'mine': startMine(); break;
        case 'puzzle': startPuzzle(); break;
        case 'alien': startAlien(); break;
        case 'zombie': startZombie(); break;
        case 'word': startWord(); break;
        case 'hockey': startHockey(); break;
        case 'maze': startMaze(); break;
        default: throw new Error('Unknown game: ' + id);
      }
    }

    function startMemory() {
      const symbols = ['🚀','🐉','🌟','🎮','💎','🪐','⚡','👾'];
      let deck = [], opened = [], matched = new Set(), locked = false;
      const { canvas, ctx } = shell('memory', 340, 390);

      function reset() {
        deck = [...symbols, ...symbols].sort(() => Math.random() - .5);
        opened = [];
        matched = new Set();
        locked = false;
        render();
      }

      function render() {
        makeCanvasBackground(ctx, 340, 390);
        for (let i=0;i<16;i++) {
          const x=10+(i%4)*82, y=10+Math.floor(i/4)*94;
          ctx.fillStyle = matched.has(i) ? '#16443d' :
            opened.includes(i) ? '#15334a' : '#101b30';
          ctx.fillRect(x,y,72,82);
          ctx.strokeStyle = '#35e8ff';
          ctx.strokeRect(x,y,72,82);
          drawText(ctx, matched.has(i)||opened.includes(i)?deck[i]:'?',x+36,y+49,27);
        }
        drawText(ctx, `Pairs: ${matched.size/2}/8`,170,386,14);
        if (matched.size===16) finishMessage(ctx,340,390,'YOU WIN!');
      }

      canvas.addEventListener('click', event => {
        if (locked || matched.size===16) return;
        const r=canvas.getBoundingClientRect();
        const x=(event.clientX-r.left)*340/r.width;
        const y=(event.clientY-r.top)*390/r.height;
        const col=Math.floor((x-10)/82), row=Math.floor((y-10)/94);
        const i=row*4+col;
        if (col<0||col>3||row<0||row>3||matched.has(i)||opened.includes(i)) return;
        opened.push(i);
        render();
        if (opened.length===2) {
          locked=true;
          later(() => {
            if (deck[opened[0]]===deck[opened[1]]) {
              matched.add(opened[0]); matched.add(opened[1]);
            }
            opened=[];
            locked=false;
            render();
          }, 650);
        }
      });
      addButton('New Deal', reset);
      setHelp('Tap two cards to find matching pairs.');
      reset();
    }

    function startRacing() {
      const { canvas, ctx } = shell('racing', 340, 480);
      let player=170, road=0, obstacles=[], score=0, alive=true;
      let left=false, right=false, keys=new Set(), last=0;
      const factor=DIFFICULTIES[difficulty].enemy;

      function reset() {
        player=170; road=0; obstacles=[]; score=0; alive=true; last=0;
        render();
      }

      function render() {
        makeCanvasBackground(ctx,340,480);
        ctx.fillStyle='#252b3b'; ctx.fillRect(35,0,270,480);
        ctx.strokeStyle='#e9f7ff'; ctx.setLineDash([24,18]); ctx.lineWidth=3;
        ctx.lineDashOffset=-road; ctx.beginPath(); ctx.moveTo(170,0); ctx.lineTo(170,480); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle='#35e8ff'; ctx.fillRect(player-14,400,28,52);
        ctx.fillStyle='#ff5577';
        obstacles.forEach(o=>ctx.fillRect(o.x-14,o.y,28,48));
        drawText(ctx,`Score ${score}`,170,25,16);
        if (!alive) finishMessage(ctx,340,480,`CRASH! Score ${score}`);
      }

      function frame(t) {
        if (!alive || currentGame!=='racing') return;
        if (!last) last=t;
        const dt=Math.min(32,t-last); last=t;
        road=(road+dt*.25)%42;
        if (Math.random()<.025*factor) obstacles.push({x:65+Math.random()*210,y:-50});
        obstacles.forEach(o=>o.y+=dt*.22*factor);
        obstacles=obstacles.filter(o=>o.y<500);
        if (keys.has('ArrowLeft')||left) player-=dt*.22;
        if (keys.has('ArrowRight')||right) player+=dt*.22;
        player=Math.max(52,Math.min(288,player));
        obstacles.forEach(o=>{
          if (Math.abs(o.x-player)<26&&o.y>365&&o.y<450) alive=false;
        });
        score+=Math.floor(dt/16);
        render();
        requestAnimationFrame(frame);
      }

      const keydown=e=>{keys.add(e.key); if(['ArrowLeft','ArrowRight'].includes(e.key))e.preventDefault();};
      const keyup=e=>keys.delete(e.key);
      window.addEventListener('keydown',keydown);
      window.addEventListener('keyup',keyup);
      addTouchpad(x=>{left=x<-.15;right=x>.15;});
      addButton('◀',()=>player=Math.max(52,player-20));
      addButton('▶',()=>player=Math.min(288,player+20));
      setHelp('Steer with the wide touchpad or arrow keys. Avoid other cars.');
      reset();
      requestAnimationFrame(frame);
      cleanup=()=>{window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);};
    }

    function startTower() {
      const {canvas,ctx}=shell('tower',340,440);
      let blocks=[], moving=null, score=0, direction=1, alive=true, last=0;
      const speed=DIFFICULTIES[difficulty].enemy;

      function reset() {
        blocks=[{x:60,y:390,w:220}];
        moving={x:0,y:350,w:220};
        score=0; direction=1; alive=true; last=0;
        render();
      }

      function render() {
        makeCanvasBackground(ctx,340,440);
        blocks.forEach(b=>{ctx.fillStyle='#9b6cff';ctx.fillRect(b.x,b.y,b.w,34);});
        if(moving){ctx.fillStyle='#35e8ff';ctx.fillRect(moving.x,moving.y,moving.w,34);}
        drawText(ctx,`Blocks ${score}`,170,24,16);
        if(!alive)finishMessage(ctx,340,440,`TOWER ${score}`);
      }

      function frame(t) {
        if(!alive||currentGame!=='tower')return;
        if(!last)last=t;
        const dt=Math.min(32,t-last);last=t;
        if(moving){
          moving.x+=direction*dt*.16*speed;
          if(moving.x<0){moving.x=0;direction=1;}
          if(moving.x+moving.w>340){moving.x=340-moving.w;direction=-1;}
        }
        render();
        requestAnimationFrame(frame);
      }

      function drop() {
        if(!alive||!moving)return;
        const prev=blocks[blocks.length-1];
        const left=Math.max(prev.x,moving.x);
        const right=Math.min(prev.x+prev.w,moving.x+moving.w);
        if(right-left<8){alive=false;moving=null;render();return;}
        blocks.push({x:left,y:prev.y-36,w:right-left});
        score++;
        if(blocks.length>10)blocks.shift();
        moving={x:0,y:prev.y-72,w:right-left};
        direction=1;
        render();
      }

      canvas.addEventListener('click',drop);
      addButton('DROP BLOCK',drop);
      setHelp('Tap the screen or DROP BLOCK to stack each moving block.');
      reset();
      requestAnimationFrame(frame);
    }

    function startMine() {
      const {canvas,ctx}=shell('mine',340,390);
      let mines=[], revealed=new Set(), flags=new Set(), ended=false;
      const n=8,total=64,mineCount=10;
      function reset(){
        mines=new Set();
        while(mines.size<mineCount)mines.add(Math.floor(Math.random()*total));
        revealed=new Set();flags=new Set();ended=false;render();
      }
      function count(i){
        let c=0,x=i%n,y=Math.floor(i/n);
        for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
          if(!dx&&!dy)continue;
          const xx=x+dx,yy=y+dy;
          if(xx>=0&&xx<n&&yy>=0&&yy<n&&mines.has(yy*n+xx))c++;
        }
        return c;
      }
      function reveal(i){
        if(ended||flags.has(i)||revealed.has(i))return;
        revealed.add(i);
        if(mines.has(i)){ended=true;render();return;}
        if(count(i)===0){
          const x=i%n,y=Math.floor(i/n);
          for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
            const xx=x+dx,yy=y+dy;
            if(xx>=0&&xx<n&&yy>=0&&yy<n)reveal(yy*n+xx);
          }
        }
        if(revealed.size===total-mineCount)ended=true;
        render();
      }
      function render(){
        makeCanvasBackground(ctx,340,390);
        for(let i=0;i<total;i++){
          const x=10+(i%n)*40,y=20+Math.floor(i/n)*44;
          ctx.fillStyle=revealed.has(i)?'#182840':'#101b30';
          ctx.fillRect(x,y,36,40);
          ctx.strokeStyle='#35e8ff55';ctx.strokeRect(x,y,36,40);
          if(revealed.has(i)){
            if(mines.has(i))drawText(ctx,'💣',x+18,y+26,18);
            else if(count(i))drawText(ctx,String(count(i)),x+18,y+26,16,'#35e8ff');
          }else if(flags.has(i))drawText(ctx,'🚩',x+18,y+26,18);
        }
        if(ended)finishMessage(ctx,340,390,
          [...revealed].some(i=>mines.has(i))?'BOOM!':'CLEARED!');
      }
      canvas.addEventListener('click',e=>{
        const r=canvas.getBoundingClientRect();
        const x=(e.clientX-r.left)*340/r.width,y=(e.clientY-r.top)*390/r.height;
        const col=Math.floor((x-10)/40),row=Math.floor((y-20)/44);
        if(col<0||col>=n||row<0||row>=n)return;
        reveal(row*n+col);
      });
      canvas.addEventListener('contextmenu',e=>{
        e.preventDefault();
        const r=canvas.getBoundingClientRect();
        const col=Math.floor(((e.clientX-r.left)*340/r.width-10)/40);
        const row=Math.floor(((e.clientY-r.top)*390/r.height-20)/44);
        const i=row*n+col;
        if(i<0||i>=total||ended||revealed.has(i))return;
        flags.has(i)?flags.delete(i):flags.add(i);render();
      });
      addButton('Restart Board',reset);
      setHelp('Tap a tile to reveal it. Long-press or right-click to mark a suspected mine.');
      reset();
    }

    function startPuzzle() {
      const {canvas,ctx}=shell('puzzle',340,390);
      let tiles=[],moves=0,solved=false;
      function reset(){
        tiles=[1,2,3,4,5,6,7,8,0];
        for(let i=0;i<1000;i++){
          const empty=tiles.indexOf(0);
          const neighbors=[empty-3,empty+3,
            ...(empty%3?[empty-1]:[]),
            ...(empty%3<2?[empty+1]:[])].filter(j=>j>=0&&j<9);
          const j=neighbors[Math.floor(Math.random()*neighbors.length)];
          [tiles[empty],tiles[j]]=[tiles[j],tiles[empty]];
        }
        moves=0;solved=false;render();
      }
      function render(){
        makeCanvasBackground(ctx,340,390);
        for(let i=0;i<9;i++){
          const x=25+(i%3)*98,y=25+Math.floor(i/3)*98;
          if(tiles[i]){
            ctx.fillStyle='#102a43';ctx.fillRect(x,y,88,88);
            ctx.strokeStyle='#35e8ff';ctx.lineWidth=2;ctx.strokeRect(x,y,88,88);
            drawText(ctx,String(tiles[i]),x+44,y+54,28);
          }else{
            ctx.fillStyle='#050914';ctx.fillRect(x,y,88,88);
            ctx.strokeStyle='#273c56';ctx.strokeRect(x,y,88,88);
          }
        }
        drawText(ctx,`Moves: ${moves}`,170,340,16);
        if(solved)finishMessage(ctx,340,390,'PUZZLE SOLVED!');
      }
      function click(e){
        if(solved)return;
        const r=canvas.getBoundingClientRect();
        const x=(e.clientX-r.left)*340/r.width,y=(e.clientY-r.top)*390/r.height;
        const col=Math.floor((x-25)/98),row=Math.floor((y-25)/98);
        if(col<0||col>2||row<0||row>2)return;
        const i=row*3+col,empty=tiles.indexOf(0);
        if(Math.abs(i%3-empty%3)+Math.abs(Math.floor(i/3)-Math.floor(empty/3))!==1)return;
        [tiles[i],tiles[empty]]=[tiles[empty],tiles[i]];
        moves++;
        solved=tiles.every((v,j)=>v===(j+1)%9);
        render();
      }
      canvas.addEventListener('click',click);
      addButton('Shuffle / Restart',reset);
      setHelp('Slide numbered tiles into order. The empty square is the space for each move.');
      reset();
    }

    function startAlien() {
      const {canvas,ctx}=shell('alien',340,480);
      let player=170,shots=[],aliens=[],enemyShots=[],score=0,lives=3,alive=true,last=0,spawn=0;
      const factor=DIFFICULTIES[difficulty].enemy;
      let firing=false,fireTimer=null;
      function reset(){
        player=170;shots=[];aliens=[];enemyShots=[];score=0;lives=3;alive=true;last=0;spawn=0;
        render();
      }
      function render(){
        makeCanvasBackground(ctx,340,480);
        ctx.fillStyle='#35e8ff';ctx.fillRect(player-14,425,28,30);
        ctx.fillStyle='#9b6cff';shots.forEach(s=>ctx.fillRect(s.x-2,s.y,4,10));
        aliens.forEach(a=>drawText(ctx,'👾',a.x,a.y,22));
        enemyShots.forEach(s=>ctx.fillRect(s.x-2,s.y,4,10));
        drawText(ctx,`Score ${score}   Lives ${lives}`,170,22,14);
        if(!alive)finishMessage(ctx,340,480,`GAME OVER · ${score}`);
      }
      function shoot(){if(alive)shots.push({x:player,y:415});}
      function frame(t){
        if(!alive||currentGame!=='alien')return;
        if(!last)last=t;
        const dt=Math.min(32,t-last);last=t;spawn+=dt;
        if(spawn>Math.max(250,900/factor)){
          spawn=0;aliens.push({x:15+Math.random()*310,y:-10+Math.random()*30});
        }
        shots.forEach(s=>s.y-=dt*.45);
        aliens.forEach(a=>a.y+=dt*.055*factor);
        enemyShots.forEach(s=>s.y+=dt*.16*factor);
        for(let i=aliens.length-1;i>=0;i--){
          const a=aliens[i];
          if(Math.abs(a.x-player)<22&&a.y>405&&a.y<465){lives--;aliens.splice(i,1);continue;}
          const hit=shots.findIndex(s=>Math.abs(s.x-a.x)<18&&Math.abs(s.y-a.y)<18);
          if(hit>=0){shots.splice(hit,1);aliens.splice(i,1);score+=10;continue;}
          if(a.y>480){aliens.splice(i,1);lives--;}
        }
        if(enemyShots.some(s=>s.y>420&&Math.abs(s.x-player)<18)){
          lives--;
          enemyShots=enemyShots.filter(s=>s.y<420||Math.abs(s.x-player)>=18);
        }
        shots=shots.filter(s=>s.y>-10);enemyShots=enemyShots.filter(s=>s.y<490);
        if(lives<=0)alive=false;
        render();requestAnimationFrame(frame);
      }
      addTouchpad(x=>{player=Math.max(18,Math.min(322,player+x*5));});
      const fire=addButton('HOLD FIRE',()=>shoot());
      const down=()=>{if(!firing){firing=true;shoot();fireTimer=setInterval(shoot,160);}};
      const up=()=>{firing=false;clearInterval(fireTimer);};
      fire.addEventListener('pointerdown',down);
      fire.addEventListener('pointerup',up);
      fire.addEventListener('pointerleave',up);
      fire.addEventListener('pointercancel',up);
      const keydown=e=>{
        if(e.key==='ArrowLeft')player=Math.max(18,player-12);
        if(e.key==='ArrowRight')player=Math.min(322,player+12);
        if(e.code==='Space'){e.preventDefault();shoot();}
      };
      window.addEventListener('keydown',keydown);
      setHelp('Move with the touchpad. Hold FIRE to shoot the incoming aliens.');
      reset();requestAnimationFrame(frame);
      cleanup=()=>{up();window.removeEventListener('keydown',keydown);};
    }

    function startZombie() {
      const {canvas,ctx}=shell('zombie',340,480);
      let player={x:170,y:240},zombies=[],score=0,lives=3,alive=true,last=0,attack=0;
      const factor=DIFFICULTIES[difficulty].enemy;
      function reset(){
        player={x:170,y:240};zombies=[];score=0;lives=3;alive=true;last=0;attack=0;render();
      }
      function render(){
        makeCanvasBackground(ctx,340,480);
        ctx.strokeStyle='#172943';
        for(let x=20;x<340;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,480);ctx.stroke();}
        for(let y=20;y<480;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(340,y);ctx.stroke();}
        drawText(ctx,'🧍',player.x,player.y,25);
        zombies.forEach(z=>drawText(ctx,'🧟',z.x,z.y,23));
        drawText(ctx,`Score ${score}   Lives ${lives}`,170,20,14);
        if(!alive)finishMessage(ctx,340,480,`SURVIVED: ${score}`);
      }
      function move(x,y){
        if(!alive)return;
        player.x=Math.max(15,Math.min(325,player.x+x*14));
        player.y=Math.max(35,Math.min(460,player.y+y*14));
        render();
      }
      function frame(t){
        if(!alive||currentGame!=='zombie')return;
        if(!last)last=t;
        const dt=Math.min(32,t-last);last=t;attack+=dt;
        if(attack>Math.max(300,1000/factor)){
          attack=0;
          const side=Math.floor(Math.random()*4);
          zombies.push({
            x:side===0?0:side===1?340:Math.random()*340,
            y:side===2?0:side===3?480:Math.random()*480
          });
        }
        zombies.forEach(z=>{
          const dx=player.x-z.x,dy=player.y-z.y,d=Math.hypot(dx,dy)||1;
          z.x+=dx/d*dt*.035*factor;z.y+=dy/d*dt*.035*factor;
        });
        zombies=zombies.filter(z=>{
          if(Math.hypot(z.x-player.x,z.y-player.y)<22){lives--;return false;}
          return true;
        });
        if(lives<=0)alive=false;
        score+=Math.floor(dt/50);
        render();requestAnimationFrame(frame);
      }
      addTouchpad(move);
      addButton('ATTACK',()=>{
        if(!alive)return;
        const i=zombies.findIndex(z=>Math.hypot(z.x-player.x,z.y-player.y)<75);
        if(i>=0){zombies.splice(i,1);score+=10;render();}
      });
      setHelp('Move using the wide touchpad. Tap ATTACK when zombies get close.');
      reset();requestAnimationFrame(frame);
    }

    function startWord() {
      const {canvas,ctx}=shell('word',340,390);
      const words=['PLANET','GALAXY','ROCKET','ARCADE','JUNGLE','PUZZLE','NEBULA','DRAGON','SHIELD','COSMOS'];
      let word='',scrambled='',score=0,round=0;
      const input=document.createElement('input');
      input.type='text';input.autocomplete='off';input.placeholder='Type your answer';
      input.maxLength=16;
      input.setAttribute('aria-label','Your word answer');
      input.style.cssText='width:min(100%,300px);padding:12px;border-radius:8px;background:#101b30;color:#fff;border:1px solid #35e8ff;font-size:16px;';
      area.appendChild(input);
      function next(){
        word=words[Math.floor(Math.random()*words.length)];
        scrambled=word.split('').sort(()=>Math.random()-.5).join('');
        if(scrambled===word)scrambled=word.slice(1)+word[0];
        input.value='';input.disabled=false;render();
        input.focus();
      }
      function render(){
        makeCanvasBackground(ctx,340,390);
        drawText(ctx,'UNSCRAMBLE THE WORD',170,75,17);
        drawText(ctx,scrambled,170,155,30,'#35e8ff');
        drawText(ctx,`Score ${score}`,170,205,17);
        drawText(ctx,`Round ${round+1}`,170,240,14);
      }
      function submit(){
        if(input.disabled)return;
        if(input.value.trim().toUpperCase()===word){
          score+=10;round++;input.disabled=true;render();
          if(round>=10){finishMessage(ctx,340,390,`FINAL SCORE ${score}`);return;}
          later(next,600);
        }else{
          input.value='';
          input.placeholder='Try again!';
        }
      }
      addButton('SUBMIT',submit);
      input.addEventListener('keydown',e=>{if(e.key==='Enter')submit();});
      setHelp('Unscramble the letters. Solve ten words to complete the challenge.');
      next();
    }

    function startHockey() {
      const {canvas,ctx}=shell('hockey',340,480);
      let px=170,py=385,ex=170,ey=95,bx=170,by=240,vx=2.1,vy=2.5,score=0,enemy=0,alive=true,last=0;
      const factor=DIFFICULTIES[difficulty].enemy;
      function reset(){
        px=170;py=385;ex=170;ey=95;bx=170;by=240;vx=2.1;vy=2.5;score=0;enemy=0;alive=true;last=0;render();
      }
      function render(){
        makeCanvasBackground(ctx,340,480);
        ctx.strokeStyle='#35e8ff';ctx.lineWidth=3;ctx.strokeRect(8,8,324,464);
        ctx.beginPath();ctx.moveTo(8,240);ctx.lineTo(332,240);ctx.stroke();
        ctx.beginPath();ctx.arc(170,240,48,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle='#35e8ff';ctx.beginPath();ctx.arc(px,py,22,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#ff5577';ctx.beginPath();ctx.arc(ex,ey,22,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(bx,by,10,0,Math.PI*2);ctx.fill();
        drawText(ctx,`${score} : ${enemy}`,170,235,17);
        if(!alive)finishMessage(ctx,340,480,`FINAL ${score} : ${enemy}`);
      }
      function move(x,y){
        px=Math.max(25,Math.min(315,px+x*15));
        py=Math.max(255,Math.min(445,py+y*15));
      }
      function frame(t){
        if(!alive||currentGame!=='hockey')return;
        if(!last)last=t;
        const dt=Math.min(32,t-last);last=t;
        bx+=vx*dt*.06;by+=vy*dt*.06;
        if(bx<18||bx>322)vx*=-1;
        if(by<18||by>462)vy*=-1;
        ex+=(bx-ex)*Math.min(.08,dt*.0025*factor);
        ey+=(by-ey)*Math.min(.08,dt*.0025*factor);
        if(Math.hypot(bx-px,by-py)<30&&by>250){vy=-Math.abs(vy);score++;}
        if(Math.hypot(bx-ex,by-ey)<30&&by<230){vy=Math.abs(vy);enemy++;}
        if(by<18){score++;bx=170;by=240;vy=Math.abs(vy);}
        if(by>462){enemy++;bx=170;by=240;vy=-Math.abs(vy);}
        if(score>=7||enemy>=7)alive=false;
        render();requestAnimationFrame(frame);
      }
      addTouchpad(move);
      addButton('◀',()=>move(-1,0));
      addButton('▶',()=>move(1,0));
      setHelp('Move your neon striker with the touchpad. Score seven goals before the computer.');
      reset();requestAnimationFrame(frame);
    }

    function startMaze() {
      const {canvas,ctx}=shell('maze',340,440);
      const N=13;
      let grid=[],player={x:1,y:1},moves=0,won=false;
      function reset(){
        grid=Array.from({length:N},()=>Array(N).fill(1));
        function carve(x,y){
          grid[y][x]=0;
          const dirs=[[0,-2],[2,0],[0,2],[-2,0]].sort(()=>Math.random()-.5);
          for(const [dx,dy] of dirs){
            const nx=x+dx,ny=y+dy;
            if(nx>0&&nx<N-1&&ny>0&&ny<N-1&&grid[ny][nx]===1){
              grid[y+dy/2][x+dx/2]=0;
              carve(nx,ny);
            }
          }
        }
        carve(1,1);
        grid[N-2][N-2]=0;
        grid[N-2][N-3]=0;
        player={x:1,y:1};moves=0;won=false;render();
      }
      function render(){
        makeCanvasBackground(ctx,340,440);
        const cell=24,ox=14,oy=40;
        for(let y=0;y<N;y++)for(let x=0;x<N;x++){
          ctx.fillStyle=grid[y][x]?'#24324b':'#0b1425';
          ctx.fillRect(ox+x*cell,oy+y*cell,cell-1,cell-1);
        }
        ctx.fillStyle='#43f5a5';
        ctx.fillRect(ox+(N-2)*cell+4,oy+(N-2)*cell+4,cell-9,cell-9);
        drawText(ctx,'🌀',ox+player.x*cell+12,oy+player.y*cell+18,17);
        drawText(ctx,`Moves: ${moves}`,170,370,15);
        if(won)finishMessage(ctx,340,440,'MAZE ESCAPED!');
      }
      function move(dx,dy){
        if(won)return;
        const x=player.x+dx,y=player.y+dy;
        if(x<0||x>=N||y<0||y>=N||grid[y][x])return;
        player={x,y};moves++;
        if(x===N-2&&y===N-2)won=true;
        render();
      }
      const keydown=e=>{
        const map={ArrowUp:[0,-1],w:[0,-1],ArrowDown:[0,1],s:[0,1],ArrowLeft:[-1,0],a:[-1,0],ArrowRight:[1,0],d:[1,0]};
        if(map[e.key]){e.preventDefault();move(...map[e.key]);}
      };
      window.addEventListener('keydown',keydown);
      addTouchpad((x,y)=>{
        if(Math.abs(x)>Math.abs(y)&&Math.abs(x)>.45)move(x>0?1:-1,0);
        else if(Math.abs(y)>.45)move(0,y>0?1:-1);
      });
      addButton('↑',()=>move(0,-1));
      addButton('↓',()=>move(0,1));
      addButton('←',()=>move(-1,0));
      addButton('→',()=>move(1,0));
      addButton('New Maze',reset);
      setHelp('Find the green exit. Use the touchpad, arrow buttons, or keyboard. Every maze is generated with connected paths.');
      reset();
      cleanup=()=>window.removeEventListener('keydown',keydown);
    }

    GAMES.forEach(game => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'nx2-card';
      card.dataset.game = game.id;
      card.style.setProperty(
        '--nx2-bg',
        `url("https://images.unsplash.com/${game.image}?auto=format&fit=crop&w=400&q=75")`
      );
      card.innerHTML = `
        <span class="nx2-card-content">
          <span class="nx2-icon">${game.icon}</span>
          <span class="nx2-name">${game.name}</span>
        </span>
      `;
      card.addEventListener('click', () => openGame(game.id));
      launcher.querySelector('#nx2-grid').appendChild(card);
    });

    overlay.querySelector('#nx2-back').addEventListener('click', closeGame);
    overlay.querySelector('#nx2-restart').addEventListener('click', () => {
      if(currentGame)openGame(currentGame);
    });

    difficultyMenu.querySelectorAll('[data-level]').forEach(button => {
      button.addEventListener('click', () => {
        difficulty=button.dataset.level;
        difficultyMenu.open=false;
        if(currentGame)openGame(currentGame);
      });
    });

    document.addEventListener('keydown', event => {
      if(event.key==='Escape'&&overlay.classList.contains('nx2-visible'))closeGame();
    });

    console.info('RexWeb Nexora Extra Arcade initialized successfully.');
  }

  function showInitError(error) {
    console.error('Extra Arcade initialization failed:', error);

    const message = 'Extra Arcade initialization error: ' +
      (error && error.message ? error.message : String(error));

    let box = document.getElementById('loading-error');
    if (!box) {
      box = document.createElement('div');
      box.id = 'loading-error';
      (document.getElementById('nexora-games') || document.body).appendChild(box);
    }

    box.className = 'error';
    box.setAttribute('role', 'alert');
    box.style.cssText =
      'display:block;margin:16px auto;padding:14px;max-width:600px;' +
      'color:#ffb4c4;background:#24101b;border:1px solid #713149;' +
      'border-radius:10px;white-space:pre-wrap;overflow-wrap:anywhere;';
    box.textContent = message;
  }

  function boot() {
    try {
      initNexoraExtraArcade();
    } catch (error) {
      showInitError(error);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once:true });
  } else {
    boot();
  }
})();