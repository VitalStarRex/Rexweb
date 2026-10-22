(() => {
  'use strict';

  /* REXWEB NEXORA — EXTRA ARCADE
     Standalone and #nexora-games compatible.
     Ten games, mobile controls, difficulty, timers and restart.
  */

  if (window.__REXWEB_NEXORA_EXTRA_ARCADE__) return;
  window.__REXWEB_NEXORA_EXTRA_ARCADE__ = true;

  const boot = () => {
    try {
      if (document.getElementById('nx2-launcher')) return;

      const games = [
        {id:'memory', icon:'🧠', name:'Memory Match', img:'photo-1516321318423-f06f85e504b3'},
        {id:'racing', icon:'🏎️', name:'Neon Racing', img:'photo-1492144534655-ae79c964c9d7'},
        {id:'puzzle', icon:'🧩', name:'Sliding Puzzle', img:'photo-1513364776144-60967b0f800f'},
        {id:'alien', icon:'👾', name:'Alien Invasion', img:'photo-1446776811953-b23d57bd21aa'},
        {id:'zombie', icon:'🧟', name:'Zombie Survival', img:'photo-1518709268805-4e9042af9f23'},
        {id:'word', icon:'🔤', name:'Word Scramble', img:'photo-1455390582262-044cdead277a'},
        {id:'maze', icon:'🌀', name:'Neon Maze', img:'photo-1519608487953-e999c86e7455'},
        {id:'parkour', icon:'⚡', name:'Cyber Parkour', img:'photo-1519608487953-e999c86e7455'},
        {id:'galaxy', icon:'🚀', name:'Galaxy Defender', img:'photo-1446776811953-b23d57bd21aa'},
        {id:'reflex', icon:'🔮', name:'Neon Reflex', img:'photo-1519608487953-e999c86e7455'}
      ];

      const root = document.getElementById('nexora-games') ||
        document.querySelector('[data-extra-arcade]') ||
        document.querySelector('main') ||
        document.querySelector('#app') || document.body;

      const launcher = document.createElement('section');
      launcher.id = 'nx2-launcher';

      launcher.innerHTML = `
        <style>
          #nx2-launcher,#nx2-overlay{font-family:Arial,sans-serif;box-sizing:border-box}
          #nx2-launcher * ,#nx2-overlay *{box-sizing:border-box}
          #nx2-launcher{width:100%;margin:18px auto;color:#eef7ff}
          #nx2-launcher h2{color:#35e8ff;font-size:25px;margin:0 0 6px}
          #nx2-launcher p{color:#9eafc9;font-size:12px;margin:0 0 14px}
          #nx2-launcher .nx2-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}
          #nx2-launcher .nx2-card{position:relative;isolation:isolate;overflow:hidden;aspect-ratio:1/1.1;min-width:0;padding:4px 2px;border:1px solid #35e8ff90;border-radius:10px;background:#10182b;color:white;display:flex;align-items:flex-end;justify-content:center;text-align:center;cursor:pointer}
          #nx2-launcher .nx2-card:before{content:"";position:absolute;inset:0;z-index:-2;background-image:var(--bg);background-size:cover;background-position:center}
          #nx2-launcher .nx2-card:after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,#03071315,#030713eF)}
          #nx2-launcher .nx2-card:active{border-color:#9b6cff}
          #nx2-launcher .nx2-card span{display:block;text-shadow:0 2px 5px #000}
          #nx2-launcher .nx2-icon{font-size:clamp(20px,5vw,30px);margin-bottom:4px}
          #nx2-launcher .nx2-name{font-size:clamp(8px,2.2vw,12px);font-weight:bold;line-height:1.2;overflow-wrap:anywhere}
          #nx2-overlay{position:fixed;inset:0;z-index:2147483000;background:#050914;color:#eef7ff;display:none;flex-direction:column;overflow:auto;overscroll-behavior:contain}
          #nx2-overlay.open{display:flex}
          #nx2-overlay button{cursor:pointer;touch-action:manipulation}
          #nx2-overlay .top{position:sticky;top:0;z-index:10;display:flex;align-items:center;gap:6px;padding:9px 7px;background:#0b1222;border-bottom:1px solid #35e8ff55}
          #nx2-overlay .top button,#nx2-overlay summary{padding:9px 8px;border-radius:9px;background:#111d32;border:1px solid #35e8ff80;color:#35e8ff;font-weight:bold;font-size:12px}
          #nx2-overlay .game-title{flex:1;min-width:0;text-align:center;font-weight:bold;font-size:13px;overflow-wrap:anywhere}
          #nx2-overlay details{position:relative}
          #nx2-overlay summary{list-style:none;white-space:nowrap}
          #nx2-overlay summary::-webkit-details-marker{display:none}
          #nx2-overlay .levels{position:absolute;right:0;top:40px;width:110px;background:#0b1222;border:1px solid #35e8ff70;padding:5px;border-radius:8px}
          #nx2-overlay .levels button{display:block;width:100%;margin:3px 0;padding:8px;background:#111d32;color:white;border:1px solid #28405a;border-radius:6px}
          #nx2-overlay #nx2-game-area{width:100%;max-width:650px;margin:0 auto;padding:12px;display:flex;align-items:center;flex-direction:column;gap:10px}
          #nx2-overlay canvas{display:block;width:min(100%,380px);height:auto;max-height:57vh;border:1px solid #35e8ff80;border-radius:10px;background:#080f20;touch-action:none}
          #nx2-overlay #nx2-controls{width:100%;max-width:520px;padding:5px 12px;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:8px}
          #nx2-overlay .action{min-height:42px;padding:10px 14px;background:#101b30;color:#35e8ff;border:1px solid #35e8ff;border-radius:10px;font-weight:bold}
          #nx2-overlay .pad{position:relative;width:100%;height:105px;border:2px solid #35e8ff;border-radius:18px;background:linear-gradient(135deg,#14233c,#080e1d);touch-action:none;overflow:hidden;box-shadow:inset 0 0 18px #35e8ff20}
          #nx2-overlay .knob{position:absolute;left:50%;top:50%;width:48px;height:48px;transform:translate(-50%,-50%);border:2px solid #35e8ff;border-radius:12px;background:#35e8ff40;pointer-events:none}
          #nx2-overlay #nx2-help{max-width:650px;margin:0 auto;padding:8px 15px 22px;text-align:center;color:#9eafc9;font-size:12px;line-height:1.5}
          #nx2-overlay input{max-width:95%;padding:12px;background:#101b30;color:white;border:1px solid #35e8ff;border-radius:8px;font-size:16px}
          @media(max-width:420px){#nx2-launcher .nx2-grid{gap:5px}#nx2-launcher .nx2-card{border-radius:7px}#nx2-launcher .nx2-name{font-size:8px}#nx2-overlay .top{gap:4px}#nx2-overlay .top button,#nx2-overlay summary{font-size:10px;padding:9px 5px}#nx2-overlay .game-title{font-size:11px}}
        </style>
        <h2>⚡ EXTRA ARCADE</h2>
        <p>Ten additional games. New challenges. More fun.</p>
        <div class="nx2-grid"></div>`;

      const overlay = document.createElement('div');
      overlay.id = 'nx2-overlay';
      overlay.setAttribute('role','dialog');
      overlay.setAttribute('aria-modal','true');
      overlay.innerHTML = `
        <div class="top">
          <button id="nx2-back">← Games</button>
          <div class="game-title" id="nx2-title">Extra Arcade</div>
          <details id="nx2-diff"><summary>Difficulty</summary>
            <div class="levels">
              <button data-level="Easy">Easy</button>
              <button data-level="Medium">Medium</button>
              <button data-level="Hard">Hard</button>
              <button data-level="Hardest">Hardest</button>
            </div>
          </details>
          <button id="nx2-restart">↻ Restart</button>
        </div>
        <div id="nx2-game-area"></div>
        <div id="nx2-controls"></div>
        <div id="nx2-help"></div>`;

      const host = root === document.body ? document.body : root.parentNode;
      host.insertBefore(launcher,root === document.body ? null : root);
      document.body.appendChild(overlay);

      const grid = launcher.querySelector('.nx2-grid');
      const area = overlay.querySelector('#nx2-game-area');
      const controls = overlay.querySelector('#nx2-controls');
      const help = overlay.querySelector('#nx2-help');
      const title = overlay.querySelector('#nx2-title');
      const diffMenu = overlay.querySelector('#nx2-diff');

      games.forEach(g => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'nx2-card';
        b.style.setProperty('--bg',`url("https://images.unsplash.com/${g.img}?auto=format&fit=crop&w=450&q=75")`);
        b.innerHTML = `<span><span class="nx2-icon">${g.icon}</span><span class="nx2-name">${g.name}</span></span>`;
        b.addEventListener('click',() => openGame(g.id));
        grid.appendChild(b);
      });

      let current = '', level = 'Medium', timer = 0, raf = 0;
      let handlers = [], state = {}, canvas, ctx, input;
      const settings = {
        Easy:{enemy:.65,speed:.8},
        Medium:{enemy:1,speed:1},
        Hard:{enemy:1.4,speed:1},
        Hardest:{enemy:1.9,speed:1}
      };

      function listen(target,event,fn,opts){
        target.addEventListener(event,fn,opts);
        handlers.push(() => target.removeEventListener(event,fn,opts));
      }
      function clear(){
        cancelAnimationFrame(raf);
        clearInterval(timer);
        timer=0;
        handlers.splice(0).forEach(fn=>{try{fn()}catch(_){}});
        area.replaceChildren();
        controls.replaceChildren();
        help.textContent='';
        state={};
        canvas=null;ctx=null;input=null;
      }
      function showHelp(s){help.textContent=s}
      function button(text,fn){
        const b=document.createElement('button');
        b.className='action';b.textContent=text;b.type='button';
        b.addEventListener('click',fn);controls.appendChild(b);return b;
      }
      function makeCanvas(w=360,h=500){
        canvas=document.createElement('canvas');
        canvas.width=w;canvas.height=h;
        canvas.style.width=`min(100%,${w}px)`;
        ctx=canvas.getContext('2d');
        if(!ctx)throw Error('Canvas is not supported by this browser.');
        area.appendChild(canvas);
      }
      function background(){
        ctx.fillStyle='#070d1c';ctx.fillRect(0,0,canvas.width,canvas.height);
      }
      function text(s,x,y,size=18,color='#eef7ff'){
        ctx.fillStyle=color;ctx.font=`bold ${size}px Arial`;
        ctx.textAlign='center';ctx.fillText(s,x,y);
      }
      function endMessage(s){
        ctx.fillStyle='#030713d9';ctx.fillRect(0,0,canvas.width,canvas.height);
        text(s,canvas.width/2,canvas.height/2,24,'#35e8ff');
        text('Tap Restart to play again',canvas.width/2,canvas.height/2+30,13);
      }
      function addPad(fn){
        const pad=document.createElement('div');
        pad.className='pad';
        const knob=document.createElement('div');knob.className='knob';
        pad.appendChild(knob);controls.appendChild(pad);
        let active=false;
        const move=e=>{
          const r=pad.getBoundingClientRect();
          const x=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));
          const y=Math.max(-1,Math.min(1,((e.clientY-r.top)/r.height-.5)*2));
          knob.style.left=(50+x*35)+'%';knob.style.top=(50+y*28)+'%';
          fn(Math.abs(x)<.12?0:x,Math.abs(y)<.12?0:y);
        };
        const release=()=>{active=false;knob.style.left='50%';knob.style.top='50%';fn(0,0)};
        listen(pad,'pointerdown',e=>{active=true;pad.setPointerCapture?.(e.pointerId);move(e)});
        listen(pad,'pointermove',e=>{if(active)move(e)});
        listen(pad,'pointerup',release);listen(pad,'pointercancel',release);
        return pad;
      }
      function keys(map){
        listen(window,'keydown',e=>{
          if(map[e.key]){e.preventDefault();map[e.key]();}
        });
      }
      function clock(seconds,onEnd){
        state.time=seconds;
        timer=setInterval(()=>{
          if(!overlay.classList.contains('open'))return;
          state.time--;
          if(state.time<=0){clearInterval(timer);timer=0;onEnd()}
        },1000);
      }
      function openGame(id){
        clear();current=id;
        const game=games.find(g=>g.id===id);
        if(!game)return;
        title.textContent=game.name;
        diffMenu.open=false;
        overlay.classList.add('open');
        document.body.style.overflow='hidden';
        try{start(id)}catch(e){console.error('Extra Arcade error:',e);area.textContent='Game error: '+e.message}
      }
      function closeGame(){
        clear();overlay.classList.remove('open');
        document.body.style.overflow='';
        current='';
      }
      function start(id){
        switch(id){
          case 'memory': memory();break;
          case 'racing': racing();break;
          case 'puzzle': puzzle();break;
          case 'alien': alien();break;
          case 'zombie': zombie();break;
          case 'word': wordGame();break;
          case 'maze': maze();break;
          case 'parkour': parkour();break;
          case 'galaxy': galaxy();break;
          case 'reflex': reflex();break;
          default: throw Error('Unknown game');
        }
      }

      function memory(){
        makeCanvas(340,390);
        const symbols=['🚀','🐉','🌟','🎮','💎','🪐','⚡','👾'];
        state.deck=[];state.open=[];state.match=new Set();state.lock=false;
        function reset(){
          state.deck=[...symbols,...symbols].sort(()=>Math.random()-.5);
          state.open=[];state.match=new Set();state.lock=false;draw();
        }
        function draw(){
          background();
          for(let i=0;i<16;i++){
            const x=8+i%4*82,y=8+Math.floor(i/4)*91;
            ctx.fillStyle=state.match.has(i)?'#16443d':'#10213a';
            ctx.fillRect(x,y,76,84);ctx.strokeStyle='#35e8ff';ctx.strokeRect(x,y,76,84);
            text(state.match.has(i)||state.open.includes(i)?state.deck[i]:'?',x+38,y+49,25);
          }
          text(`Pairs ${state.match.size/2}/8`,170,382,14);
          if(state.match.size===16)endMessage('YOU WIN!');
        }
        listen(canvas,'click',e=>{
          if(state.lock||state.match.size===16)return;
          const r=canvas.getBoundingClientRect();
          const x=(e.clientX-r.left)*340/r.width,y=(e.clientY-r.top)*390/r.height;
          const c=Math.floor((x-8)/82),row=Math.floor((y-8)/91),i=row*4+c;
          if(c<0||c>3||row<0||row>3||state.match.has(i)||state.open.includes(i))return;
          state.open.push(i);draw();
          if(state.open.length===2){
            state.lock=true;
            const pair=[...state.open];
            setTimeout(()=>{
              if(current!=='memory')return;
              if(state.deck[pair[0]]===state.deck[pair[1]])pair.forEach(n=>state.match.add(n));
              state.open=[];state.lock=false;draw();
            },550);
          }
        });
        button('New Deal',reset);
        showHelp('Tap two cards to find all eight matching pairs.');
        reset();
      }

      function racing(){
        makeCanvas(360,500);
        Object.assign(state,{x:180,obs:[],score:0,alive:true,last:0,road:0,keys:{}});
        const factor=settings[level].enemy;
        function reset(){Object.assign(state,{x:180,obs:[],score:0,alive:true,last:0,road:0});draw()}
        function draw(){
          background();
          ctx.fillStyle='#252b3b';ctx.fillRect(35,0,290,500);
          ctx.fillStyle='#17202f';ctx.fillRect(45,0,270,500);
          ctx.strokeStyle='#f3f8ff';ctx.lineWidth=4;ctx.setLineDash([28,22]);
          ctx.lineDashOffset=-state.road;ctx.beginPath();ctx.moveTo(180,0);ctx.lineTo(180,500);ctx.stroke();ctx.setLineDash([]);
          state.obs.forEach(o=>car(o.x,o.y,'#ff426c'));
          car(state.x,410,'#35e8ff');
          text(`Score ${state.score}  Time ${state.time??60}s`,180,25,16);
          if(!state.alive)endMessage('RACE OVER');
        }
        function car(x,y,color){
          ctx.fillStyle='#050914';ctx.fillRect(x-18,y-4,36,50);
          ctx.fillStyle=color;ctx.fillRect(x-14,y,28,44);
          ctx.fillStyle='#bfefff';ctx.fillRect(x-9,y+7,18,10);
          ctx.fillStyle='#ffefaa';ctx.fillRect(x-11,y+35,6,5);ctx.fillRect(x+5,y+35,6,5);
          ctx.fillStyle='#111';ctx.fillRect(x-19,y+8,5,12);ctx.fillRect(x+14,y+8,5,12);
        }
        function frame(t){
          if(current!=='racing'||!state.alive)return;
          const dt=Math.min(35,state.last?t-state.last:16);state.last=t;
          state.road=(state.road+dt*.35)%50;
          if(Math.random()<dt*.00065*factor)state.obs.push({x:65+Math.random()*230,y:-55});
          state.obs.forEach(o=>o.y+=dt*.23*factor);
          state.obs=state.obs.filter(o=>o.y<520);
          const dir=(state.keys.l?-1:0)+(state.keys.r?1:0);
          state.x=Math.max(60,Math.min(300,state.x+dir*dt*.35));
          if(state.dx)state.x=Math.max(60,Math.min(300,state.x+state.dx*dt*.35));
          if(state.obs.some(o=>Math.abs(o.x-state.x)<27&&o.y>370&&o.y<460))state.alive=false;
          state.score+=dt/100;draw();raf=requestAnimationFrame(frame);
        }
        addPad(x=>state.dx=x);
        keys({ArrowLeft:()=>state.x-=15,a:()=>state.x-=15,ArrowRight:()=>state.x+=15,d:()=>state.x+=15});
        listen(window,'keydown',e=>{if(e.key==='ArrowLeft'||e.key==='a')state.keys.l=true;if(e.key==='ArrowRight'||e.key==='d')state.keys.r=true});
        listen(window,'keyup',e=>{if(e.key==='ArrowLeft'||e.key==='a')state.keys.l=false;if(e.key==='ArrowRight'||e.key==='d')state.keys.r=false});
        button('◀',()=>state.x-=20);button('▶',()=>state.x+=20);
        showHelp('Steer your car with the wide touchpad or arrow keys. Avoid traffic. Survive for 60 seconds to win.');
        reset();clock(60,()=>{state.alive=false;draw()});raf=requestAnimationFrame(frame);
      }

      function puzzle(){
        makeCanvas(340,390);
        function reset(){
          state.tiles=[1,2,3,4,5,6,7,8,0];state.moves=0;state.won=false;
          for(let n=0;n<250;n++){
            const z=state.tiles.indexOf(0),opts=[z-3,z+3,...(z%3?[z-1]:[]),...(z%3<2?[z+1]:[])].filter(i=>i>=0&&i<9);
            const j=opts[Math.floor(Math.random()*opts.length)];
            [state.tiles[z],state.tiles[j]]=[state.tiles[j],state.tiles[z]];
          }
          if(state.tiles.every((v,i)=>v===(i+1)%9))return reset();
          draw();
        }
        function draw(){
          background();
          state.tiles.forEach((v,i)=>{
            const x=24+i%3*98,y=22+Math.floor(i/3)*98;
            ctx.fillStyle=v?'#102a43':'#050914';ctx.fillRect(x,y,88,88);
            ctx.strokeStyle='#35e8ff';ctx.strokeRect(x,y,88,88);
            if(v)text(String(v),x+44,y+54,30);
          });
          text(`Moves ${state.moves}`,170,330,16);
          if(state.won)endMessage('PUZZLE SOLVED!');
        }
        listen(canvas,'click',e=>{
          if(state.won)return;
          const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*340/r.width,y=(e.clientY-r.top)*390/r.height;
          const c=Math.floor((x-24)/98),row=Math.floor((y-22)/98),i=row*3+c,z=state.tiles.indexOf(0);
          if(c<0||c>2||row<0||row>2||Math.abs(i%3-z%3)+Math.abs(Math.floor(i/3)-Math.floor(z/3))!==1)return;
          [state.tiles[i],state.tiles[z]]=[state.tiles[z],state.tiles[i]];state.moves++;
          state.won=state.tiles.every((v,j)=>v===(j+1)%9);draw();
        });
        button('Shuffle / Restart',reset);
        showHelp('Slide adjacent numbers into order. The empty square is the space for each move.');
        reset();
      }

      function alien(){
        makeCanvas(360,500);
        Object.assign(state,{x:180,shots:[],foes:[],score:0,lives:3,alive:true,last:0,spawn:0,dx:0});
        const factor=settings[level].enemy;
        function reset(){Object.assign(state,{x:180,shots:[],foes:[],score:0,lives:3,alive:true,last:0,spawn:0});draw()}
        function shoot(){if(state.alive)state.shots.push({x:state.x,y:415})}
        function draw(){
          background();
          ctx.fillStyle='#35e8ff';ctx.fillRect(state.x-14,435,28,25);
          ctx.fillStyle='#9b6cff';state.shots.forEach(s=>ctx.fillRect(s.x-2,s.y,4,11));
          state.foes.forEach(a=>{ctx.fillStyle='#ff5577';ctx.fillRect(a.x-13,a.y,26,22);text('👾',a.x,a.y+18,20)});
          text(`Score ${state.score}  Lives ${state.lives}`,180,25,15);
          if(!state.alive)endMessage('GAME OVER');
        }
        function frame(t){
          if(current!=='alien'||!state.alive)return;
          const dt=Math.min(35,state.last?t-state.last:16);state.last=t;state.spawn+=dt;
          if(state.spawn>Math.max(220,750/factor)){state.spawn=0;state.foes.push({x:20+Math.random()*320,y:-20})}
          state.x=Math.max(18,Math.min(342,state.x+state.dx*dt*.28));
          state.shots.forEach(s=>s.y-=dt*.5);
          state.foes.forEach(a=>a.y+=dt*.065*factor);
          for(let i=state.foes.length-1;i>=0;i--){
            const a=state.foes[i],hit=state.shots.findIndex(s=>Math.abs(s.x-a.x)<20&&Math.abs(s.y-a.y)<25);
            if(hit>=0){state.shots.splice(hit,1);state.foes.splice(i,1);state.score+=10}
            else if(a.y>420){state.foes.splice(i,1);state.lives--}
          }
          if(state.foes.some(a=>Math.abs(a.x-state.x)<23&&a.y>405)){state.lives--;state.foes=state.foes.filter(a=>!(Math.abs(a.x-state.x)<23&&a.y>405))}
          state.shots=state.shots.filter(s=>s.y>0);
          if(state.lives<=0)state.alive=false;
          draw();raf=requestAnimationFrame(frame);
        }
        addPad(x=>state.dx=x);
        const fire=button('AUTO FIRE: ON',()=>{state.auto=!state.auto;fire.textContent=state.auto?'AUTO FIRE: ON':'AUTO FIRE: OFF'});
        state.auto=true;
        button('FIRE',shoot);
        listen(window,'keydown',e=>{if(e.key==='ArrowLeft')state.x-=12;if(e.key==='ArrowRight')state.x+=12;if(e.code==='Space')shoot()});
        const auto=setInterval(()=>{if(current==='alien'&&state.auto&&state.alive)shoot()},160);
        handlers.push(()=>clearInterval(auto));
        showHelp('Your ship fires automatically. Move left and right to defeat incoming alien waves.');
        reset();raf=requestAnimationFrame(frame);
      }

      function zombie(){
        makeCanvas(360,500);
        Object.assign(state,{x:180,y:250,z:[],score:0,lives:3,alive:true,last:0,spawn:0,dx:0,dy:0});
        const factor=settings[level].enemy;
        function reset(){Object.assign(state,{x:180,y:250,z:[],score:0,lives:3,alive:true,last:0,spawn:0,dx:0,dy:0});draw()}
        function attack(){
          if(!state.alive)return;
          let i=-1,best=75;
          state.z.forEach((z,j)=>{const d=Math.hypot(z.x-state.x,z.y-state.y);if(d<best){best=d;i=j}});
          if(i>=0){state.z.splice(i,1);state.score+=10;draw()}
        }
        function draw(){
          background();
          ctx.strokeStyle='#172943';
          for(let x=20;x<360;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,500);ctx.stroke()}
          for(let y=20;y<500;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(360,y);ctx.stroke()}
          text('🧍',state.x,state.y,25);state.z.forEach(z=>text('🧟',z.x,z.y,24));
          text(`Score ${state.score}  Lives ${state.lives}`,180,22,14);
          if(!state.alive)endMessage('GAME OVER');
        }
        function frame(t){
          if(current!=='zombie'||!state.alive)return;
          const dt=Math.min(35,state.last?t-state.last:16);state.last=t;state.spawn+=dt;
          if(state.spawn>Math.max(350,1000/factor)){
            state.spawn=0;const side=Math.floor(Math.random()*4);
            state.z.push({x:side===0?0:side===1?360:Math.random()*360,y:side===2?0:side===3?500:Math.random()*500})
          }
          state.x=Math.max(12,Math.min(348,state.x+state.dx*dt*.2));
          state.y=Math.max(30,Math.min(485,state.y+state.dy*dt*.2));
          state.z.forEach(z=>{const dx=state.x-z.x,dy=state.y-z.y,d=Math.hypot(dx,dy)||1;z.x+=dx/d*dt*.035*factor;z.y+=dy/d*dt*.035*factor});
          state.z=state.z.filter(z=>{if(Math.hypot(z.x-state.x,z.y-state.y)<20){state.lives--;return false}return true});
          state.score+=dt/500;
          if(state.lives<=0)state.alive=false;
          draw();raf=requestAnimationFrame(frame);
        }
        addPad((x,y)=>{state.dx=x;state.dy=y});
        button('ATTACK',attack);
        keys({ArrowLeft:()=>state.x-=12,ArrowRight:()=>state.x+=12,ArrowUp:()=>state.y-=12,ArrowDown:()=>state.y+=12});
        showHelp('Move around the arena and attack nearby zombies. Avoid contact to survive.');
        reset();raf=requestAnimationFrame(frame);
      }

      function wordGame(){
        makeCanvas(340,390);
        const words=['PLANET','GALAXY','ROCKET','ARCADE','JUNGLE','PUZZLE','NEBULA','DRAGON','SHIELD','COSMOS','COMPUTER','CYBER'];
        input=document.createElement('input');input.placeholder='Type your answer';input.maxLength=20;input.autocomplete='off';input.setAttribute('aria-label','Word answer');area.appendChild(input);
        Object.assign(state,{score:0,round:0,word:'',scramble:''});
        function next(){
          state.word=words[Math.floor(Math.random()*words.length)];
          do{state.scramble=state.word.split('').sort(()=>Math.random()-.5).join('')}while(state.scramble===state.word);
          input.value='';input.disabled=false;draw();input.focus();
        }
        function draw(){background();text('UNSCRAMBLE THE WORD',170,75,17);text(state.scramble,170,150,30,'#35e8ff');text(`Score ${state.score}`,170,205,17);text(`Round ${state.round+1}/10`,170,240,14)}
        function submit(){
          if(input.disabled)return;
          if(input.value.trim().toUpperCase()===state.word){
            state.score+=10;state.round++;input.disabled=true;draw();
            if(state.round>=10){endMessage(`FINAL SCORE ${state.score}`);return}
            setTimeout(()=>{if(current==='word')next()},500);
          }else{input.value='';input.placeholder='Try again!'}
        }
        listen(input,'keydown',e=>{if(e.key==='Enter')submit()});
        button('SUBMIT',submit);button('New Word',next);
        showHelp('Unscramble each word. Solve ten words to complete the challenge.');
        next();
      }

      function maze(){
        makeCanvas(360,440);
        const N=15,C=22,O=15,Y=35;
        function reset(){
          state.grid=Array.from({length:N},()=>Array(N).fill(1));
          function carve(x,y){
            state.grid[y][x]=0;
            const dirs=[[0,-2],[2,0],[0,2],[-2,0]].sort(()=>Math.random()-.5);
            dirs.forEach(([dx,dy])=>{
              const nx=x+dx,ny=y+dy;
              if(nx>0&&nx<N-1&&ny>0&&ny<N-1&&state.grid[ny][nx]===1){
                state.grid[y+dy/2][x+dx/2]=0;carve(nx,ny)
              }
            });
          }
          carve(1,1);state.grid[N-2][N-2]=0;state.player={x:1,y:1};state.moves=0;state.won=false;draw();
        }
        function draw(){
          background();
          for(let y=0;y<N;y++)for(let x=0;x<N;x++){
            ctx.fillStyle=state.grid[y][x]?'#24324b':'#091426';
            ctx.fillRect(O+x*C,Y+y*C,C-1,C-1);
          }
          ctx.fillStyle='#43f5a5';ctx.fillRect(O+(N-2)*C+4,Y+(N-2)*C+4,C-8,C-8);
          text('🌀',O+state.player.x*C+C/2,Y+state.player.y*C+C/1.4,16);
          text(`Moves ${state.moves}`,180,410,15);
          if(state.won)endMessage('MAZE ESCAPED!');
        }
        function move(dx,dy){
          if(state.won)return;
          const x=state.player.x+dx,y=state.player.y+dy;
          if(x<0||y<0||x>=N||y>=N||state.grid[y][x])return;
          state.player={x,y};state.moves++;
          if(x===N-2&&y===N-2)state.won=true;
          draw();
        }
        listen(window,'keydown',e=>{
          const m={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]};
          if(m[e.key]){e.preventDefault();move(...m[e.key])}
        });
        addPad((x,y)=>{
          if(Math.abs(x)>Math.abs(y)&&Math.abs(x)>.55)move(x>0?1:-1,0);
          else if(Math.abs(y)>.55)move(0,y>0?1:-1);
        });
        ['↑','↓','←','→'].forEach((s,i)=>button(s,()=>move([[0,-1],[0,1],[-1,0],[1,0]][i][0],[[0,-1],[0,1],[-1,0],[1,0]][i][1])));
        button('New Maze',reset);
        showHelp('Navigate the connected maze to the green exit. Use the touchpad or arrow keys.');
        reset();
      }

      function parkour(){
        makeCanvas(360,500);
        Object.assign(state,{x:70,y:370,vy:0,obs:[],score:0,alive:true,last:0,spawn:0,ground:370});
        function reset(){Object.assign(state,{x:70,y:370,vy:0,obs:[],score:0,alive:true,last:0,spawn:0,ground:370});draw()}
        function jump(){if(state.y>=state.ground-1)state.vy=-390}
        function draw(){
          background();
          ctx.strokeStyle='#172943';ctx.lineWidth=2;
          for(let x=0;x<360;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,500);ctx.stroke()}
          ctx.fillStyle='#101d34';ctx.fillRect(0,410,360,90);
          ctx.fillStyle='#35e8ff';ctx.fillRect(state.x-12,state.y-35,24,35);
          state.obs.forEach(o=>{ctx.fillStyle=o.type?'#ff5577':'#9b6cff';ctx.fillRect(o.x,410-o.h,o.w,o.h)});
          text(`Energy ${Math.floor(state.score)}  Time ${state.time??90}s`,180,25,15);
          if(!state.alive)endMessage('RUN OVER');
        }
        function frame(t){
          if(current!=='parkour'||!state.alive)return;
          const dt=Math.min(.035,state.last?(t-state.last)/1000:.016);state.last=t;state.spawn+=dt;
          if(state.spawn>.95){state.spawn=0;state.obs.push({x:370,w:20+Math.random()*18,h:25+Math.random()*55,type:Math.random()>.5?1:0})}
          state.vy+=900*dt;state.y+=state.vy*dt;
          if(state.y>state.ground){state.y=state.ground;state.vy=0}
          state.obs.forEach(o=>o.x-=220*settings[level].enemy*dt);
          if(state.obs.some(o=>o.x<state.x+12&&o.x+o.w>state.x-12&&state.y>410-o.h))state.alive=false;
          state.obs=state.obs.filter(o=>o.x>-40);state.score+=dt*10;
          draw();raf=requestAnimationFrame(frame);
        }
        listen(canvas,'pointerdown',jump);
        button('JUMP',jump);
        keys({ArrowUp:jump,' ':jump,w:jump});
        showHelp('Jump over laser barriers and obstacles. Survive the 90-second challenge.');
        reset();clock(90,()=>{state.alive=false;draw()});raf=requestAnimationFrame(frame);
      }

      function galaxy(){
        makeCanvas(360,500);
        Object.assign(state,{x:180,shots:[],foes:[],score:0,alive:true,last:0,spawn:0,dx:0});
        function reset(){Object.assign(state,{x:180,shots:[],foes:[],score:0,alive:true,last:0,spawn:0,dx:0});draw()}
        function shoot(){if(state.alive)state.shots.push({x:state.x,y:425})}
        function draw(){
          background();
          for(let i=0;i<50;i++){ctx.fillStyle='#647aa5';ctx.fillRect((i*83)%360,(i*127)%500,2,2)}
          ctx.fillStyle='#35e8ff';ctx.beginPath();ctx.moveTo(state.x,420);ctx.lineTo(state.x-18,452);ctx.lineTo(state.x+18,452);ctx.closePath();ctx.fill();
          ctx.fillStyle='#9b6cff';state.shots.forEach(s=>ctx.fillRect(s.x-2,s.y,4,12));
          state.foes.forEach(a=>{ctx.fillStyle='#ff5577';ctx.beginPath();ctx.arc(a.x,a.y,a.r,0,7);ctx.fill()});
          text(`Score ${state.score}  Time ${state.time??60}s`,180,25,15);
          if(!state.alive)endMessage('MISSION COMPLETE');
        }
        function frame(t){
          if(current!=='galaxy'||!state.alive)return;
          const dt=Math.min(35,state.last?t-state.last:16);state.last=t;state.spawn+=dt;
          if(state.spawn>Math.max(180,600/settings[level].enemy)){state.spawn=0;state.foes.push({x:20+Math.random()*320,y:-15,r:10+Math.random()*7})}
          state.x=Math.max(18,Math.min(342,state.x+state.dx*dt*.25));
          state.shots.forEach(s=>s.y-=dt*.5);
          state.foes.forEach(a=>a.y+=dt*.06*settings[level].enemy);
          for(let i=state.foes.length-1;i>=0;i--){
            const a=state.foes[i],j=state.shots.findIndex(s=>Math.hypot(s.x-a.x,s.y-a.y)<a.r+5);
            if(j>=0){state.shots.splice(j,1);state.foes.splice(i,1);state.score+=10}
            else if(a.y>500){state.foes.splice(i,1);state.score=Math.max(0,state.score-5)}
            else if(Math.hypot(a.x-state.x,a.y-440)<a.r+12){state.alive=false}
          }
          state.shots=state.shots.filter(s=>s.y>0);
          draw();raf=requestAnimationFrame(frame);
        }
        addPad(x=>state.dx=x);
        const fire=button('AUTO FIRE: ON',()=>{state.auto=!state.auto;fire.textContent=state.auto?'AUTO FIRE: ON':'AUTO FIRE: OFF'});
        state.auto=true;
        const auto=setInterval(()=>{if(current==='galaxy'&&state.auto)shoot()},150);
        handlers.push(()=>clearInterval(auto));
        button('FIRE',shoot);
        showHelp('Pilot your spaceship, dodge enemy ships and fire automatically. Survive for 60 seconds.');
        reset();clock(60,()=>{state.alive=false;draw()});raf=requestAnimationFrame(frame);
      }

      function reflex(){
        makeCanvas(360,500);
        Object.assign(state,{x:180,obs:[],score:0,alive:true,last:0,spawn:0});
        function reset(){Object.assign(state,{x:180,obs:[],score:0,alive:true,last:0,spawn:0});draw()}
        function draw(){
          background();
          for(let y=0;y<500;y+=25){ctx.strokeStyle='#15233e';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(360,y);ctx.stroke()}
          ctx.fillStyle='#101d34';ctx.fillRect(35,0,290,500);
          ctx.strokeStyle='#35e8ff';ctx.lineWidth=2;ctx.strokeRect(35,0,290,500);
          state.obs.forEach(o=>{ctx.fillStyle=o.c;ctx.fillRect(o.x,o.y,o.w,o.h)});
          ctx.fillStyle='#35e8ff';ctx.beginPath();ctx.arc(state.x,425,14,0,7);ctx.fill();
          text(`Score ${state.score}  Time ${state.time??60}s`,180,25,15);
          if(!state.alive)endMessage('REFLEX OVER');
        }
        function frame(t){
          if(current!=='reflex'||!state.alive)return;
          const dt=Math.min(35,state.last?t-state.last:16);state.last=t;state.spawn+=dt;
          if(state.spawn>Math.max(180,550/settings[level].enemy)){
            state.spawn=0;state.obs.push({x:50+Math.random()*260,y:-25,w:18+Math.random()*25,h:18+Math.random()*25,c:Math.random()>.5?'#ff5577':'#9b6cff'})
          }
          state.obs.forEach(o=>o.y+=dt*.22*settings[level].enemy);
          if(state.obs.some(o=>state.x>o.x-14&&state.x<o.x+o.w+14&&425>o.y-14&&425<o.y+o.h+14))state.alive=false;
          state.obs=state.obs.filter(o=>o.y<510);state.score+=dt/100;
          draw();raf=requestAnimationFrame(frame);
        }
        addPad(x=>state.x=Math.max(50,Math.min(310,state.x+x*dtSpeed())));
        function dtSpeed(){return 10}
        button('◀',()=>state.x-=20);button('▶',()=>state.x+=20);
        showHelp('Dodge the neon obstacles. Stay alive as the speed and difficulty increase.');
        reset();clock(60,()=>{state.alive=false;draw()});raf=requestAnimationFrame(frame);
      }

      overlay.querySelector('#nx2-back').addEventListener('click',closeGame);
      overlay.querySelector('#nx2-restart').addEventListener('click',()=>{if(current)openGame(current)});
      overlay.querySelectorAll('[data-level]').forEach(b=>b.addEventListener('click',()=>{
        level=b.dataset.level;diffMenu.open=false;if(current)openGame(current);
      }));
      listen(document,'keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))closeGame()});

      console.info('REXWEB NEXORA Extra Arcade initialized.');
    } catch(error) {
      window.__REXWEB_NEXORA_EXTRA_ARCADE__ = false;
      console.error('REXWEB NEXORA Extra Arcade initialization error:',error);
      const box=document.getElementById('loading-error')||document.createElement('div');
      box.id='loading-error';
      box.style.cssText='margin:12px;padding:14px;background:#24101b;color:#ffb4c4;border:1px solid #713149;border-radius:10px;white-space:pre-wrap';
      box.textContent='Extra Arcade initialization error: '+error.message;
      (document.getElementById('nexora-games')||document.body).appendChild(box);
    }
  };

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',boot,{once:true});
  }else{
    boot();
  }
})();