(() => {
'use strict';

function init() {
  const $ = id => document.getElementById(id);
  const grid = $('game-grid'), screen = $('game-screen');
  const area = $('play-area'), title = $('game-title');
  const help = $('game-help'), difficulty = $('difficulty');

  if (!grid || !screen || !area || !title || !help || !difficulty) {
    console.error('Extra Arcade: HTML elements missing.');
    return;
  }
  if (grid.dataset.nxReady === '1') return;
  grid.dataset.nxReady = '1';

  const games = [
    ['parkour','Cyber Parkour','⚡','RUN · JUMP','#35e8ff'],
    ['galaxy','Galaxy Defender','🚀','SPACE SHOOTER','#9b6cff'],
    ['reflex','Neon Reflex','🔮','DODGE · REACT','#ff4fd8'],
    ['racer','Street Racer','🏎️','TRAFFIC RACE','#ff5577'],
    ['zombie','Zombie Outbreak','🧟','SURVIVAL','#43f5a5'],
    ['dragon','Dragon Quest','🐉','MONSTER BATTLE','#ff9f43'],
    ['asteroid','Asteroid Rush','☄️','SPACE FLIGHT','#35e8ff'],
    ['ninja','Ninja Escape','🥷','ROOFTOP RUN','#9b6cff'],
    ['penalty','Penalty Pro','⚽','SHOOTOUT','#43f5a5'],
    ['hover','Hoverboard Rush','🛹','FUTURE RUN','#ff4fd8']
  ].map(([id,name,icon,type,color])=>({id,name,icon,type,color}));

  grid.replaceChildren();

  games.forEach(g=>{
    const b=document.createElement('button');
    b.type='button';
    b.className='game-card';
    b.style.setProperty('--glow',g.color);
    b.innerHTML=`<span class="game-art"></span><span class="game-icon">${g.icon}</span><span><span class="game-name">${g.name}</span><span class="game-type">${g.type}</span></span>`;
    b.addEventListener('click',()=>open(g.id));
    grid.appendChild(b);
  });

  let active=null, cleanups=[], raf=0, timer=0, token=0;
  let score=0,lives=3,time=60,ended=false;
  const factor=()=>({Easy:.75,Medium:1,Hard:1.3,Hardest:1.65}[difficulty.value]||1);

  function listen(el,event,fn,opts){
    el.addEventListener(event,fn,opts);
    cleanups.push(()=>el.removeEventListener(event,fn,opts));
  }

  function clear(){
    token++;
    cancelAnimationFrame(raf);
    clearInterval(timer);
    cleanups.forEach(fn=>{try{fn()}catch(_){}});
    cleanups=[];
    area.replaceChildren();
  }

  function close(){
    clear();
    active=null;
    screen.classList.remove('open');
    screen.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }

  function open(id){
    clear();
    active=id;
    screen.classList.add('open');
    screen.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
    const g=games.find(x=>x.id===id);
    if(!g)return;
    title.textContent=g.name;
    start(g,token);
  }

  $('back-button')?.addEventListener('click',close);
  $('restart-button')?.addEventListener('click',()=>{if(active)open(active)});
  difficulty.addEventListener('change',()=>{if(active)open(active)});
  listen(document,'keydown',e=>{
    if(e.key==='Escape'&&screen.classList.contains('open'))close();
  });

  function start(g,myToken){
    score=0;lives=3;time=60;ended=false;
    const speed=factor();

    const hud=document.createElement('div');
    hud.className='hud';
    const sc=document.createElement('span');
    const lv=document.createElement('span');
    const tm=document.createElement('span');
    hud.append(sc,lv,tm);

    const canvas=document.createElement('canvas');
    canvas.width=360;canvas.height=480;
    canvas.setAttribute('aria-label',g.name);

    const controls=document.createElement('div');
    controls.className='controls';
    const result=document.createElement('div');
    result.id='result-toast';
    area.append(hud,canvas,controls,result);

    const ctx=canvas.getContext('2d');
    if(!ctx){result.textContent='Canvas is not supported.';return;}

    function hudUpdate(){
      sc.textContent='Score: '+Math.floor(score);
      lv.textContent='Lives: '+lives;
      tm.textContent='Time: '+time+'s';
    }

    function button(label,fn){
      const b=document.createElement('button');
      b.type='button';b.className='control-btn';b.textContent=label;
      b.addEventListener('click',fn);controls.appendChild(b);return b;
    }

    function pad(fn){
      const p=document.createElement('div');
      p.style.cssText='width:100%;height:64px;position:relative;overflow:hidden;border:2px solid #35e8ff;border-radius:12px;background:linear-gradient(90deg,#101b30,#193650,#101b30);touch-action:none;user-select:none';
      p.innerHTML='<span style="position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;color:#b4c8df;font-size:12px;font-weight:800">DRAG LEFT OR RIGHT</span><span style="position:absolute;left:50%;top:50%;width:40px;height:40px;border:2px solid #35e8ff;border-radius:10px;background:#35e8ff44;transform:translate(-50%,-50%);pointer-events:none"></span>';
      controls.appendChild(p);
      const knob=p.lastElementChild;
      let down=false;
      function move(e){
        const r=p.getBoundingClientRect();
        const x=Math.max(-1,Math.min(1,((e.clientX-r.left)/r.width-.5)*2));
        knob.style.left=(50+x*38)+'%';fn(x);
      }
      function up(){down=false;knob.style.left='50%';fn(0)}
      listen(p,'pointerdown',e=>{down=true;p.setPointerCapture?.(e.pointerId);move(e)});
      listen(p,'pointermove',e=>{if(down)move(e)});
      listen(p,'pointerup',up);listen(p,'pointercancel',up);
    }

    function keys(map){
      listen(window,'keydown',e=>{
        const fn=map[e.key]||map[e.code];
        if(fn){e.preventDefault();fn()}
      });
    }

    function bg(){
      ctx.fillStyle='#070d1c';ctx.fillRect(0,0,360,480);
      ctx.strokeStyle='#162b43';ctx.lineWidth=1;
      for(let x=0;x<360;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,480);ctx.stroke()}
      for(let y=0;y<480;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(360,y);ctx.stroke()}
    }
    function text(t,x,y,size=16,color='#eef7ff'){
      ctx.fillStyle=color;ctx.font=`800 ${size}px system-ui,sans-serif`;
      ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x,y);
    }
    function rect(x,y,w,h,color,stroke=color){
      ctx.fillStyle=color;ctx.fillRect(x,y,w,h);
      ctx.strokeStyle=stroke;ctx.lineWidth=2;ctx.strokeRect(x,y,w,h);
    }
    function circle(x,y,r,color){
      ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
    }
    function finish(message){
      if(ended)return;
      ended=true;clearInterval(timer);
      result.textContent=message+' · Score '+Math.floor(score);
      bg();text(message,180,215,24,'#35e8ff');
      text('Score: '+Math.floor(score),180,255,19);
      text('Tap Restart to play again',180,290,13);
      hudUpdate();
    }

    timer=setInterval(()=>{
      if(myToken!==token||ended)return;
      time--;hudUpdate();
      if(time<=0)finish('TIME UP');
    },1000);
    hudUpdate();

    if(['parkour','reflex','ninja','hover'].includes(g.id)){
      help.textContent='Dodge obstacles. Move with the touchpad and tap JUMP to leap.';
      const s={x:180,y:380,vy:0,ground:true,obs:[],spawn:0,road:0};
      let steer=0;
      function jump(){if(!ended&&s.ground){s.vy=-11;s.ground=false}}
      button('◀',()=>s.x=Math.max(25,s.x-25));
      button('JUMP',jump);
      button('▶',()=>s.x=Math.min(335,s.x+25));
      pad(x=>steer=x);
      keys({ArrowLeft:()=>s.x=Math.max(25,s.x-22),ArrowRight:()=>s.x=Math.min(335,s.x+22),ArrowUp:jump,Space:jump});

      let last=0;
      function frame(t){
        if(myToken!==token||ended)return;
        const dt=Math.min(32,last?t-last:16);last=t;
        s.x=Math.max(25,Math.min(335,s.x+steer*dt*.24));
        s.spawn+=dt;s.road=(s.road+dt*.2)%40;
        if(s.spawn>Math.max(350,850/speed)){s.spawn=0;s.obs.push({x:25+Math.random()*310,y:-30,w:25,h:25})}
        s.vy+=dt*.00065*980;s.y+=s.vy*dt/16;
        if(s.y>=380){s.y=380;s.vy=0;s.ground=true}
        s.obs.forEach(o=>o.y+=dt*.22*speed);
        for(let i=s.obs.length-1;i>=0;i--){
          const o=s.obs[i];
          if(Math.abs(o.x-s.x)<25&&Math.abs(o.y-s.y)<28){s.obs.splice(i,1);lives--;if(lives<=0)finish('RUN OVER')}
          else if(o.y>420){s.obs.splice(i,1);score+=5}
        }
        bg();ctx.fillStyle='#102b42';ctx.fillRect(0,415,360,65);
        for(let x=-(s.road%40);x<360;x+=40)rect(x,420,23,4,'#35e8ff');
        s.obs.forEach(o=>rect(o.x,o.y,o.w,o.h,g.color));
        text(g.name.toUpperCase(),180,30,14);text(g.icon,s.x,s.y,28,g.color);
        hudUpdate();if(!ended)raf=requestAnimationFrame(frame);
      }
      raf=requestAnimationFrame(frame);

    }else if(['galaxy','asteroid'].includes(g.id)){
      help.textContent='Move your ship and shoot targets before they reach the bottom.';
      const s={x:180,shots:[],foes:[],spawn:0,fire:0};
      let steer=0,firing=true;
      button('FIRE ON/OFF',()=>firing=!firing);
      button('◀',()=>s.x=Math.max(18,s.x-24));
      button('SHOOT',()=>s.shots.push({x:s.x,y:405}));
      button('▶',()=>s.x=Math.min(342,s.x+24));
      pad(x=>steer=x);
      keys({ArrowLeft:()=>s.x=Math.max(18,s.x-16),ArrowRight:()=>s.x=Math.min(342,s.x+16),Space:()=>s.shots.push({x:s.x,y:405})});
      let last=0;
      function frame(t){
        if(myToken!==token||ended)return;
        const dt=Math.min(32,last?t-last:16);last=t;
        s.x=Math.max(18,Math.min(342,s.x+steer*dt*.24));
        s.spawn+=dt;s.fire+=dt;
        if(s.fire>250){s.fire=0;if(firing)s.shots.push({x:s.x,y:405})}
        if(s.spawn>Math.max(260,700/speed)){s.spawn=0;s.foes.push({x:15+Math.random()*330,y:-20})}
        s.shots.forEach(o=>o.y-=dt*.48);s.foes.forEach(o=>o.y+=dt*.1*speed);
        s.shots=s.shots.filter(o=>o.y>-15);
        for(let i=s.foes.length-1;i>=0;i--){
          const f=s.foes[i],j=s.shots.findIndex(o=>Math.abs(o.x-f.x)<20&&Math.abs(o.y-f.y)<20);
          if(j>=0){s.shots.splice(j,1);s.foes.splice(i,1);score+=10}
          else if(f.y>425){s.foes.splice(i,1);lives--;if(lives<=0)finish('SHIP LOST')}
        }
        bg();text(g.name.toUpperCase(),180,28,14);
        ctx.fillStyle='#35e8ff';ctx.beginPath();ctx.moveTo(s.x,395);ctx.lineTo(s.x-16,430);ctx.lineTo(s.x+16,430);ctx.closePath();ctx.fill();
        s.shots.forEach(o=>rect(o.x-2,o.y,4,12,'#43f5a5'));
        s.foes.forEach(o=>g.id==='asteroid'?circle(o.x,o.y,13,'#9b6cff'):text('👾',o.x,o.y,23));
        hudUpdate();if(!ended)raf=requestAnimationFrame(frame);
      }
      raf=requestAnimationFrame(frame);

    }else if(g.id==='racer'){
      help.textContent='Avoid traffic and keep your car on the road.';
      const s={x:180,cars:[],spawn:0,road:0};let steer=0;
      button('◀ STEER',()=>s.x=Math.max(58,s.x-24));
      button('▶ STEER',()=>s.x=Math.min(302,s.x+24));pad(x=>steer=x);
      keys({ArrowLeft:()=>s.x=Math.max(58,s.x-20),ArrowRight:()=>s.x=Math.min(302,s.x+20)});
      let last=0;
      function frame(t){
        if(myToken!==token||ended)return;
        const dt=Math.min(32,last?t-last:16);last=t;
        s.x=Math.max(58,Math.min(302,s.x+steer*dt*.24));s.spawn+=dt;s.road=(s.road+dt*.24)%44;
        if(s.spawn>Math.max(350,800/speed)){s.spawn=0;s.cars.push({x:60+Math.random()*240,y:-60})}
        s.cars.forEach(o=>o.y+=dt*.22*speed);
        for(let i=s.cars.length-1;i>=0;i--){const o=s.cars[i];
          if(Math.abs(o.x-s.x)<27&&o.y>350&&o.y<450){s.cars.splice(i,1);lives--;if(lives<=0)finish('CRASH!')}
          else if(o.y>500){s.cars.splice(i,1);score+=5}
        }
        bg();ctx.fillStyle='#222b3b';ctx.fillRect(38,0,284,480);
        ctx.fillStyle='#43f5a5';ctx.fillRect(43,0,4,480);ctx.fillRect(313,0,4,480);
        ctx.strokeStyle='white';ctx.setLineDash([25,19]);ctx.lineDashOffset=-s.road;ctx.beginPath();ctx.moveTo(180,0);ctx.lineTo(180,480);ctx.stroke();ctx.setLineDash([]);
        s.cars.forEach(o=>rect(o.x-13,o.y,26,46,'#ff5577'));
        rect(s.x-14,390,28,52,'#35e8ff');text('STREET RACER',180,28,14);
        score+=dt*.002;hudUpdate();if(!ended)raf=requestAnimationFrame(frame);
      }
      raf=requestAnimationFrame(frame);

    }else if(['zombie','dragon'].includes(g.id)){
      help.textContent='Move around the arena and attack enemies when they get close.';
      const s={x:180,y:240,foes:[],spawn:0};let steer=0;
      function attack(){const i=s.foes.findIndex(f=>Math.hypot(f.x-s.x,f.y-s.y)<78);if(i>=0){s.foes.splice(i,1);score+=10}}
      button('ATTACK',attack);button('↑',()=>s.y=Math.max(35,s.y-20));
      button('↓',()=>s.y=Math.min(445,s.y+20));button('◀',()=>s.x=Math.max(20,s.x-20));button('▶',()=>s.x=Math.min(340,s.x+20));
      pad(x=>steer=x);
      keys({ArrowUp:()=>s.y=Math.max(35,s.y-20),ArrowDown:()=>s.y=Math.min(445,s.y+20),ArrowLeft:()=>s.x=Math.max(20,s.x-20),ArrowRight:()=>s.x=Math.min(340,s.x+20),Space:attack});
      let last=0;
      function frame(t){
        if(myToken!==token||ended)return;
        const dt=Math.min(32,last?t-last:16);last=t;
        s.x=Math.max(20,Math.min(340,s.x+steer*dt*.23));s.spawn+=dt;
        if(s.spawn>Math.max(430,1050/speed)){s.spawn=0;const side=Math.floor(Math.random()*4);s.foes.push({x:side===0?5:side===1?355:Math.random()*360,y:side===2?5:side===3?475:Math.random()*480})}
        s.foes.forEach(f=>{const dx=s.x-f.x,dy=s.y-f.y,d=Math.hypot(dx,dy)||1;f.x+=dx/d*dt*.035*speed;f.y+=dy/d*dt*.035*speed});
        for(let i=s.foes.length-1;i>=0;i--)if(Math.hypot(s.foes[i].x-s.x,s.foes[i].y-s.y)<23){s.foes.splice(i,1);lives--;if(lives<=0)finish('GAME OVER')}
        bg();text(g.name.toUpperCase(),180,28,14);text(g.id==='zombie'?'🧍':'🛡️',s.x,s.y,28);
        s.foes.forEach(f=>text(g.id==='zombie'?'🧟':'🐉',f.x,f.y,24));
        score+=dt*.001;hudUpdate();if(!ended)raf=requestAnimationFrame(frame);
      }
      raf=requestAnimationFrame(frame);

    }else if(g.id==='penalty'){
      help.textContent='Choose a direction and shoot past the goalkeeper. You have five shots.';
      const s={keeper:180,aim:0,attempt:0,moving:false,dir:1};
      let last=0;
      function draw(){
        bg();ctx.strokeStyle='white';ctx.lineWidth=5;ctx.strokeRect(70,90,220,110);
        ctx.strokeStyle='#37516b';ctx.lineWidth=1;
        for(let x=85;x<290;x+=20){ctx.beginPath();ctx.moveTo(x,90);ctx.lineTo(x,200);ctx.stroke()}
        text('GOAL',180,70,14);text('🧤',s.keeper,175,26);text('⚽',180,375,28);text('SHOT '+Math.min(5,s.attempt+1)+' / 5',180,440,14);
      }
      function shoot(){
        if(ended||s.moving)return;s.moving=true;s.attempt++;
        const aim=s.aim||((Math.random()-.5)*100),start=performance.now();
        function anim(now){
          if(myToken!==token||ended)return;
          const p=Math.min(1,(now-start)/600);draw();circle(180+aim*p,365-240*p,8,'white');
          if(p<1){raf=requestAnimationFrame(anim);return}
          s.moving=false;
          if(Math.abs(180+aim-s.keeper)>34){score+=10;result.textContent='GOAL!'}else result.textContent='SAVED!';
          hudUpdate();if(s.attempt>=5)finish('SHOOTOUT COMPLETE');else draw();
        }
        raf=requestAnimationFrame(anim);
      }
      button('AIM LEFT',()=>s.aim=-70);button('AIM CENTER',()=>s.aim=0);
      button('AIM RIGHT',()=>s.aim=70);button('SHOOT',shoot);pad(x=>s.aim=x*90);
      function frame(t){
        if(myToken!==token||ended)return;
        const dt=Math.min(32,last?t-last:16);last=t;
        s.keeper+=s.dir*dt*.07*speed;if(s.keeper<100||s.keeper>260)s.dir*=-1;
        if(!s.moving)draw();raf=requestAnimationFrame(frame);
      }
      raf=requestAnimationFrame(frame);
    }
  }

  console.info('Extra Arcade initialized.');
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',init,{once:true});
}else{
  init();
}
})();