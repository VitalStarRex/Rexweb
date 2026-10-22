(() => {
'use strict';

function init() {
  const $ = id => document.getElementById(id);
  const grid = $('game-grid');
  const screen = $('game-screen');
  const area = $('play-area');
  const title = $('game-title');
  const help = $('game-help');
  const difficultySelect = $('difficulty');
  const back = $('back-button');
  const restart = $('restart-button');

  if (!grid || !screen || !area || !title || !help || !difficultySelect) {
    console.error('Nexora Arcade: Required HTML elements are missing.');
    return;
  }

  if (grid.dataset.ready === 'yes') return;
  grid.dataset.ready = 'yes';

  const games = [
    {id:'parkour',name:'Cyber Parkour',icon:'⚡',type:'RUN · JUMP',color:'#35e8ff',mode:'runner'},
    {id:'galaxy',name:'Galaxy Defender',icon:'🚀',type:'SPACE SHOOTER',color:'#9b6cff',mode:'shooter'},
    {id:'reflex',name:'Neon Reflex',icon:'🔮',type:'DODGE · REACT',color:'#ff4fd8',mode:'runner'},
    {id:'racer',name:'Street Racer',icon:'🏎️',type:'TRAFFIC RACE',color:'#ff5577',mode:'racer'},
    {id:'zombie',name:'Zombie Outbreak',icon:'🧟',type:'SURVIVAL',color:'#43f5a5',mode:'arena'},
    {id:'dragon',name:'Dragon Quest',icon:'🐉',type:'MONSTER BATTLE',color:'#ff9f43',mode:'arena'},
    {id:'asteroid',name:'Asteroid Rush',icon:'☄️',type:'SPACE FLIGHT',color:'#35e8ff',mode:'shooter'},
    {id:'ninja',name:'Ninja Escape',icon:'🥷',type:'ROOFTOP RUN',color:'#9b6cff',mode:'runner'},
    {id:'penalty',name:'Penalty Pro',icon:'⚽',type:'SHOOTOUT',color:'#43f5a5',mode:'penalty'},
    {id:'hover',name:'Hoverboard Rush',icon:'🛹',type:'FUTURE RUN',color:'#ff4fd8',mode:'runner'}
  ];

  grid.replaceChildren();

  games.forEach(game => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'game-card';
    card.style.setProperty('--glow', game.color);
    card.innerHTML =
      '<span class="game-art"></span>' +
      '<span class="game-icon">' + game.icon + '</span>' +
      '<span><span class="game-name">' + game.name +
      '</span><span class="game-type">' + game.type + '</span></span>';
    card.addEventListener('click', () => openGame(game.id));
    grid.appendChild(card);
  });

  let active = null;
  let cleanup = [];
  let raf = 0;
  let timer = 0;
  let runToken = 0;
  let score = 0;
  let lives = 3;
  let seconds = 60;
  let ended = false;

  const factors = {Easy:.72,Medium:1,Hard:1.3,Hardest:1.65};

  function listen(target, event, fn, options) {
    target.addEventListener(event, fn, options);
    cleanup.push(() => target.removeEventListener(event, fn, options));
  }

  function clearGame() {
    runToken++;
    cancelAnimationFrame(raf);
    clearInterval(timer);
    cleanup.forEach(fn => {
      try { fn(); } catch (_) {}
    });
    cleanup = [];
    area.replaceChildren();
  }

  function closeGame() {
    clearGame();
    active = null;
    screen.classList.remove('open');
    screen.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  function openGame(id) {
    clearGame();
    active = id;
    screen.classList.add('open');
    screen.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';

    const game = games.find(g => g.id === id);
    if (!game) return;

    title.textContent = game.name;
    difficultySelect.value = difficultySelect.value || 'Medium';
    startGame(game);
  }

  if (back) back.addEventListener('click', closeGame);
  if (restart) restart.addEventListener('click', () => {
    if (active) openGame(active);
  });

  difficultySelect.addEventListener('change', () => {
    if (active) openGame(active);
  });

  listen(document,'keydown',e => {
    if (e.key === 'Escape' && screen.classList.contains('open')) closeGame();
  });

  function startGame(game) {
    const token = runToken;
    score = 0;
    lives = 3;
    seconds = game.mode === 'penalty' ? 60 : 60;
    ended = false;

    const factor = factors[difficultySelect.value] || 1;

    const hud = document.createElement('div');
    hud.className = 'hud';

    const scoreText = document.createElement('span');
    const livesText = document.createElement('span');
    const timeText = document.createElement('span');

    hud.append(scoreText,livesText,timeText);

    const canvas = document.createElement('canvas');
    canvas.width = 360;
    canvas.height = 480;
    canvas.setAttribute('aria-label',game.name + ' playing area');

    const controls = document.createElement('div');
    controls.className = 'controls';

    const result = document.createElement('div');
    result.id = 'result-toast';

    area.append(hud,canvas,controls,result);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      result.textContent = 'Canvas is unavailable in this browser.';
      return;
    }

    function updateHUD() {
      scoreText.textContent = 'Score: ' + Math.floor(score);
      livesText.textContent = 'Lives: ' + lives;
      timeText.textContent = 'Time: ' + seconds + 's';
    }

    function button(label,fn) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'control-btn';
      b.textContent = label;
      b.addEventListener('click',fn);
      controls.appendChild(b);
      return b;
    }

    function pad(fn) {
      const p = document.createElement('div');
      p.style.cssText =
        'width:100%;height:68px;position:relative;overflow:hidden;' +
        'border:2px solid #35e8ff;border-radius:13px;' +
        'background:linear-gradient(90deg,#101b30,#193650,#101b30);' +
        'touch-action:none;user-select:none';

      p.innerHTML =
        '<span style="position:absolute;inset:0;display:grid;place-items:center;' +
        'pointer-events:none;color:#b4c8df;font-size:12px;font-weight:800">' +
        'DRAG LEFT OR RIGHT</span>' +
        '<span style="position:absolute;left:50%;top:50%;width:42px;height:42px;' +
        'border:2px solid #35e8ff;border-radius:12px;background:#35e8ff44;' +
        'transform:translate(-50%,-50%);pointer-events:none"></span>';

      controls.appendChild(p);
      const knob = p.lastElementChild;
      let down = false;

      function move(e) {
        const r = p.getBoundingClientRect();
        const x = Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));
        knob.style.left = (50+x*38)+'%';
        fn(x);
      }

      function up() {
        down = false;
        knob.style.left = '50%';
        fn(0);
      }

      listen(p,'pointerdown',e => {
        down = true;
        if (p.setPointerCapture) p.setPointerCapture(e.pointerId);
        move(e);
      });
      listen(p,'pointermove',e => { if (down) move(e); });
      listen(p,'pointerup',up);
      listen(p,'pointercancel',up);
      return up;
    }

    function keyMap(mapping) {
      listen(window,'keydown',e => {
        const fn = mapping[e.key] || mapping[e.code];
        if (fn) {
          e.preventDefault();
          fn();
        }
      });
    }

    function background() {
      ctx.fillStyle = '#070d1c';
      ctx.fillRect(0,0,360,480);
      ctx.strokeStyle = '#152a42';
      ctx.lineWidth = 1;
      for (let x=0;x<360;x+=30) {
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,480); ctx.stroke();
      }
      for (let y=0;y<480;y+=30) {
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(360,y); ctx.stroke();
      }
    }

    function text(value,x,y,size=16,color='#eef7ff') {
      ctx.fillStyle = color;
      ctx.font = '800 '+size+'px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(value,x,y);
    }

    function rect(x,y,w,h,color,stroke=color) {
      ctx.fillStyle = color;
      ctx.fillRect(x,y,w,h);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.strokeRect(x,y,w,h);
    }

    function circle(x,y,r,color) {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fill();
    }

    function finish(message) {
      if (ended) return;
      ended = true;
      clearInterval(timer);
      result.textContent = message + ' · Score ' + Math.floor(score);
      background();
      text(message,180,215,24,'#35e8ff');
      text('Score: '+Math.floor(score),180,255,19);
      text('Tap Restart to play again',180,290,13);
      updateHUD();
    }

    timer = setInterval(() => {
      if (token !== runToken || ended) return;
      seconds--;
      updateHUD();
      if (seconds <= 0) finish('TIME UP');
    },1000);

    updateHUD();

    if (game.mode === 'runner') {
      help.textContent = 'Move left and right to dodge obstacles. Tap JUMP to leap over danger.';
      const s = {x:180,y:380,vy:0,ground:true,obs:[],spawn:0,road:0};
      let moveX = 0;

      button('◀',() => s.x=Math.max(25,s.x-28));
      button('JUMP',() => {
        if (!ended && s.ground) { s.vy=-11; s.ground=false; }
      });
      button('▶',() => s.x=Math.min(335,s.x+28));
      pad(x => moveX=x);

      keyMap({
        ArrowLeft:() => s.x=Math.max(25,s.x-22),
        ArrowRight:() => s.x=Math.min(335,s.x+22),
        ArrowUp:() => { if (s.ground) {s.vy=-11;s.ground=false;} },
        Space:() => { if (s.ground) {s.vy=-11;s.ground=false;} }
      });

      let last = 0;
      function frame(t) {
        if (token !== runToken || ended) return;
        const dt = Math.min(32,last ? t-last : 16);
        last=t;
        s.x=Math.max(25,Math.min(335,s.x+moveX*dt*.24));
        s.road=(s.road+dt*.22)%40;
        s.spawn+=dt;

        if (s.spawn > Math.max(350,850/factor)) {
          s.spawn=0;
          s.obs.push({x:25+Math.random()*310,y:-30,w:24+Math.random()*18,h:25});
        }

        s.vy+=dt*.00065*980;
        s.y+=s.vy*dt/16;
        if (s.y>=380) {s.y=380;s.vy=0;s.ground=true;}

        s.obs.forEach(o=>o.y+=dt*.22*factor);

        for (let i=s.obs.length-1;i>=0;i--) {
          const o=s.obs[i];
          if (Math.abs(o.x-s.x)<25 && Math.abs(o.y-s.y)<28) {
            s.obs.splice(i,1);
            lives--;
            if (lives<=0) finish('RUN OVER');
          } else if (o.y>420) {
            s.obs.splice(i,1);
            score+=5;
          }
        }

        background();
        ctx.fillStyle='#102b42';
        ctx.fillRect(0,415,360,65);
        for(let x=-(s.road%40);x<360;x+=40) rect(x,420,23,4,'#35e8ff');
        s.obs.forEach(o=>rect(o.x,o.y,o.w,o.h,game.color));
        text(game.name.toUpperCase(),180,30,15);
        text(game.icon,s.x,s.y,27,game.color);
        updateHUD();
        if (!ended) raf=requestAnimationFrame(frame);
      }
      raf=requestAnimationFrame(frame);

    } else if (game.mode === 'shooter') {
      help.textContent = 'Move your ship, shoot incoming targets, and prevent them reaching the bottom.';
      const s={x:180,shots:[],foes:[],spawn:0,fire:0};
      let moveX=0, firing=true;

      button('FIRE: ON',e=>{
        firing=!firing;
        e.currentTarget.textContent=firing?'FIRE: ON':'FIRE: OFF';
      });
      pad(x=>moveX=x);
      button('◀',()=>s.x=Math.max(18,s.x-25));
      button('SHOOT',()=>s.shots.push({x:s.x,y:405}));
      button('▶',()=>s.x=Math.min(342,s.x+25));

      keyMap({
        ArrowLeft:()=>s.x=Math.max(18,s.x-16),
        ArrowRight:()=>s.x=Math.min(342,s.x+16),
        Space:()=>s.shots.push({x:s.x,y:405})
      });

      let last=0;
      function frame(t) {
        if(token!==runToken||ended)return;
        const dt=Math.min(32,last?t-last:16);last=t;
        s.x=Math.max(18,Math.min(342,s.x+moveX*dt*.24));
        s.spawn+=dt;s.fire+=dt;

        if(s.fire>240){s.fire=0;if(firing)s.shots.push({x:s.x,y:405});}
        if(s.spawn>Math.max(260,700/factor)){
          s.spawn=0;
          s.foes.push({x:15+Math.random()*330,y:-20});
        }

        s.shots.forEach(o=>o.y-=dt*.48);
        s.foes.forEach(o=>o.y+=dt*.1*factor);
        s.shots=s.shots.filter(o=>o.y>-15);

        for(let i=s.foes.length-1;i>=0;i--){
          const f=s.foes[i];
          const j=s.shots.findIndex(o=>Math.abs(o.x-f.x)<20&&Math.abs(o.y-f.y)<20);
          if(j>=0){s.shots.splice(j,1);s.foes.splice(i,1);score+=10;}
          else if(f.y>425){s.foes.splice(i,1);lives--;if(lives<=0)finish('SHIP LOST');}
        }

        background();
        text(game.name.toUpperCase(),180,28,14);
        ctx.fillStyle='#35e8ff';
        ctx.beginPath();ctx.moveTo(s.x,395);ctx.lineTo(s.x-16,430);ctx.lineTo(s.x+16,430);ctx.closePath();ctx.fill();
        s.shots.forEach(o=>rect(o.x-2,o.y,4,12,'#43f5a5'));
        s.foes.forEach(o=>{
          if(game.id==='asteroid'){circle(o.x,o.y,13,'#9b6cff');circle(o.x-3,o.y-3,4,'#49336e');}
          else text('👾',o.x,o.y,23);
        });
        updateHUD();
        if(!ended)raf=requestAnimationFrame(frame);
      }
      raf=requestAnimationFrame(frame);

    } else if (game.mode === 'racer') {
      help.textContent='Steer your car to avoid traffic. Survive as long as you can.';
      const s={x:180,cars:[],spawn:0,road:0};
      let moveX=0;
      button('◀ STEER',()=>s.x=Math.max(58,s.x-25));
      button('▶ STEER',()=>s.x=Math.min(302,s.x+25));
      pad(x=>moveX=x);

      keyMap({
        ArrowLeft:()=>s.x=Math.max(58,s.x-20),
        ArrowRight:()=>s.x=Math.min(302,s.x+20)
      });

      let last=0;
      function frame(t){
        if(token!==runToken||ended)return;
        const dt=Math.min(32,last?t-last:16);last=t;
        s.x=Math.max(58,Math.min(302,s.x+moveX*dt*.24));
        s.road=(s.road+dt*.24)%44;s.spawn+=dt;

        if(s.spawn>Math.max(350,800/factor)){
          s.spawn=0;
          s.cars.push({x:60+Math.random()*240,y:-60});
        }
        s.cars.forEach(o=>o.y+=dt*.22*factor);

        for(let i=s.cars.length-1;i>=0;i--){
          const o=s.cars[i];
          if(Math.abs(o.x-s.x)<27&&o.y>350&&o.y<450){
            s.cars.splice(i,1);lives--;
            if(lives<=0)finish('CRASH!');
          } else if(o.y>500){s.cars.splice(i,1);score+=5;}
        }

        background();
        ctx.fillStyle='#222b3b';ctx.fillRect(38,0,284,480);
        ctx.fillStyle='#43f5a5';ctx.fillRect(43,0,4,480);ctx.fillRect(313,0,4,480);
        ctx.strokeStyle='#eef7ff';ctx.lineWidth=3;ctx.setLineDash([25,19]);
        ctx.lineDashOffset=-s.road;ctx.beginPath();ctx.moveTo(180,0);ctx.lineTo(180,480);ctx.stroke();ctx.setLineDash([]);
        s.cars.forEach(o=>{
          rect(o.x-13,o.y,26,46,'#ff5577','#ffc1cf');
          ctx.fillStyle='#171c29';ctx.fillRect(o.x-8,o.y+7,16,10);
        });
        rect(s.x-14,390,28,52,'#35e8ff','#b8f8ff');
        ctx.fillStyle='#101b30';ctx.fillRect(s.x-8,399,16,12);
        text('STREET RACER',180,28,15);
        score+=dt*.002;
        updateHUD();
        if(!ended)raf=requestAnimationFrame(frame);
      }
      raf=requestAnimationFrame(frame);

    } else if (game.mode === 'arena') {
      help.textContent='Move around the arena. Tap ATTACK when an enemy is close. Avoid contact.';
      const s={x:180,y:240,foes:[],spawn:0};
      let moveX=0;

      function attack(){
        if(ended)return;
        const i=s.foes.findIndex(f=>Math.hypot(f.x-s.x,f.y-s.y)<78);
        if(i>=0){s.foes.splice(i,1);score+=10;}
      }

      button('ATTACK',attack);
      button('↑',()=>s.y=Math.max(45,s.y-20));
      button('↓',()=>s.y=Math.min(440,s.y+20));
      button('◀',()=>s.x=Math.max(20,s.x-20));
      button('▶',()=>s.x=Math.min(340,s.x+20));
      pad(x=>moveX=x);

      keyMap({
        ArrowUp:()=>s.y=Math.max(45,s.y-20),
        ArrowDown:()=>s.y=Math.min(440,s.y+20),
        ArrowLeft:()=>s.x=Math.max(20,s.x-20),
        ArrowRight:()=>s.x=Math.min(340,s.x+20),
        Space:attack
      });

      let last=0;
      function frame(t){
        if(token!==runToken||ended)return;
        const dt=Math.min(32,last?t-last:16);last=t;
        s.x=Math.max(20,Math.min(340,s.x+moveX*dt*.23));
        s.spawn+=dt;

        if(s.spawn>Math.max(430,1050/factor)){
          s.spawn=0;
          const side=Math.floor(Math.random()*4);
          s.foes.push({
            x:side===0?5:side===1?355:Math.random()*360,
            y:side===2?5:side===3?475:Math.random()*480
          });
        }

        s.foes.forEach(f=>{
          const dx=s.x-f.x,dy=s.y-f.y,d=Math.hypot(dx,dy)||1;
          f.x+=dx/d*dt*.035*factor;
          f.y+=dy/d*dt*.035*factor;
        });

        for(let i=s.foes.length-1;i>=0;i--){
          if(Math.hypot(s.foes[i].x-s.x,s.foes[i].y-s.y)<23){
            s.foes.splice(i,1);lives--;
            if(lives<=0)finish(game.id==='zombie'?'OVERRUN':'QUEST ENDED');
          }
        }

        background();
        text(game.name.toUpperCase(),180,28,14);
        text(game.id==='zombie'?'🧍':'🛡️',s.x,s.y,27);
        s.foes.forEach(f=>text(game.id==='zombie'?'🧟':'🐉',f.x,f.y,24));
        score+=dt*.001;
        updateHUD();
        if(!ended)raf=requestAnimationFrame(frame);
      }
      raf=requestAnimationFrame(frame);

    } else if (game.mode === 'penalty') {
      help.textContent='Aim left, center, or right, then shoot. Score as many goals as possible in five attempts.';
      const s={keeper:180,aim:0,attempt:0,moving:false,direction:1};
      let last=0;

      function drawGoal(){
        background();
        ctx.strokeStyle='#eef7ff';ctx.lineWidth=5;ctx.strokeRect(70,90,220,110);
        ctx.strokeStyle='#37516b';ctx.lineWidth=1;
        for(let x=85;x<290;x+=20){ctx.beginPath();ctx.moveTo(x,90);ctx.lineTo(x,200);ctx.stroke();}
        for(let y=110;y<200;y+=20){ctx.beginPath();ctx.moveTo(70,y);ctx.lineTo(290,y);ctx.stroke();}
        text('GOAL',180,70,14);
        text('🧤',s.keeper,177,25);
        text('⚽',180,375,28);
        text('SHOT '+Math.min(5,s.attempt+1)+' / 5',180,440,15);
      }

      function shoot(){
        if(ended||s.moving)return;
        s.moving=true;s.attempt++;
        const aim=s.aim||((Math.random()-.5)*100);
        const start=performance.now();

        function animate(now){
          if(token!==runToken||ended)return;
          const p=Math.min(1,(now-start)/600);
          drawGoal();
          circle(180+aim*p,365-240*p,Math.max(5,10-3*p),'#fff');

          if(p<1){raf=requestAnimationFrame(animate);return;}
          s.moving=false;

          if(Math.abs(180+aim-s.keeper)>34){score+=10;result.textContent='GOAL!';}
          else result.textContent='SAVED!';

          updateHUD();
          if(s.attempt>=5)finish('SHOOTOUT COMPLETE');
          else drawGoal();
        }
        raf=requestAnimationFrame(animate);
      }

      button('AIM LEFT',()=>s.aim=-70);
      button('AIM CENTER',()=>s.aim=0);
      button('AIM RIGHT',()=>s.aim=70);
      button('SHOOT',shoot);
      pad(x=>s.aim=x*90);

      function frame(t){
        if(token!==runToken||ended)return;
        const dt=Math.min(32,last?t-last:16);last=t;
        s.keeper+=s.direction*dt*.07*factor;
        if(s.keeper<100||s.keeper>260)s.direction*=-1;
        if(!s.moving)drawGoal();
        raf=requestAnimationFrame(frame);
      }
      raf=requestAnimationFrame(frame);
    }
  }

  console.info('Nexora Extra Arcade ready: '+games.length+' games.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded',init,{once:true});
} else {
  init();
}
})();