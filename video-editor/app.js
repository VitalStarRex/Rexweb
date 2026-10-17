(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const state = {
    media: [], clips: [], textItems: [], effects: [], selectedId: null,
    zoom: 80, playhead: 0, playing: false, currentPanel: 'media',
    speed: 1, rotation: 0, brightness: 100, contrast: 100, grayscale: 0,
    history: [], future: [], objectUrls: [], exportCancelled: false
  };
  const preview = $('preview'), photo = $('photoPreview'), overlay = $('textOverlay');
  let toastTimer, playbackTimer = null, activeMediaId = null, lastPreviewTime = 0;

  function toast(message) {
    const node = $('toast'); node.textContent = message; node.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('show'), 2800);
  }
  function fmt(seconds) {
    seconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
    const mins = Math.floor(seconds / 60), secs = Math.floor(seconds % 60);
    return String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0');
  }
  function makeId() { return 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
  function durationOf(media) { return media && media.duration && Number.isFinite(media.duration) ? media.duration : 5; }
  function mediaById(id) { return state.media.find(m => m.id === id); }
  function selectedClip() { return state.clips.find(c => c.id === state.selectedId) || null; }
  function totalDuration() {
    return state.clips.reduce((sum,c) => sum + Math.max(.1, Number(c.duration)||0), 0) || 0;
  }
  function clipStartAt(id) {
    let t = 0;
    for (const c of state.clips) { if (c.id === id) return t; t += c.duration; }
    return 0;
  }
  function snapshot() {
    state.history.push(JSON.stringify({clips:state.clips,textItems:state.textItems,effects:state.effects,selectedId:state.selectedId}));
    if (state.history.length > 30) state.history.shift();
    state.future = [];
    updateUndoRedo();
  }
  function restoreSnapshot(raw) {
    try {
      const d = JSON.parse(raw); state.clips=d.clips||[]; state.textItems=d.textItems||[]; state.effects=d.effects||[]; state.selectedId=d.selectedId||null;
      renderTimeline(); updateOverlay(); updateUndoRedo(); syncSelectedProperties();
    } catch(e) { toast('Could not restore that edit.'); }
  }
  function updateUndoRedo() { $('undoBtn').disabled = !state.history.length; $('redoBtn').disabled = !state.future.length; }
  function addMedia(file) {
    const url = URL.createObjectURL(file); state.objectUrls.push(url);
    const item = {id:makeId(),name:file.name,type:file.type.startsWith('video/')?'video':file.type.startsWith('image/')?'image':file.type.startsWith('audio/')?'audio':'other',url,size:file.size,duration:0,mime:file.type};
    state.media.push(item);
    if (item.type === 'video' || item.type === 'audio') {
      const probe = document.createElement(item.type); probe.preload='metadata'; probe.src=url;
      probe.onloadedmetadata = () => { item.duration = Number.isFinite(probe.duration) ? probe.duration : 0; renderMedia(); };
      probe.onerror = () => renderMedia();
    }
    renderMedia();
    if (item.type === 'video' || item.type === 'image') addClip(item.id);
    else if (item.type === 'audio') { snapshot(); state.clips.push({id:makeId(),mediaId:item.id,type:'audio',name:item.name,duration:durationOf(item),speed:1,volume:1,start:0,end:durationOf(item)}); renderTimeline(); }
  }
  function importFiles(files) {
    const valid = Array.from(files || []).filter(f => /^(video|image|audio)\//.test(f.type));
    if (!valid.length) { toast('Choose a video, photo, or audio file.'); return; }
    valid.forEach(addMedia);
    $('mediaInput').value = '';
    toast(valid.length + ' file' + (valid.length===1?'':'s') + ' imported.');
  }
  function addClip(mediaId) {
    const m = mediaById(mediaId); if (!m || !['video','image'].includes(m.type)) return;
    snapshot();
    const duration = m.type === 'image' ? 5 : durationOf(m);
    const clip = {id:makeId(),mediaId:m.id,type:m.type,name:m.name,duration,speed:1,volume:1,start:0,end:duration,rotation:0};
    state.clips.push(clip); state.selectedId=clip.id; renderTimeline(); selectClip(clip.id); setPlayhead(clipStartAt(clip.id), true);
  }
  function renderMedia() {
    const list=$('mediaList'); list.innerHTML='';
    if (!state.media.length) { list.innerHTML='<div class="empty-library">No media imported yet.</div>'; return; }
    state.media.forEach(m => {
      const item=document.createElement('div'); item.className='media-item';
      const icon=m.type==='video'?'▶':m.type==='image'?'▧':'♫';
      const info=document.createElement('div'); info.className='media-info';
      const name=document.createElement('strong'); name.textContent=m.name;
      const meta=document.createElement('small'); meta.textContent=m.type.toUpperCase()+' · '+(m.size/1024/1024).toFixed(1)+' MB';
      info.append(name,meta);
      const thumb=document.createElement('div'); thumb.className='media-thumb'; thumb.textContent=icon;
      const add=document.createElement('button'); add.className='media-add'; add.type='button'; add.textContent='＋'; add.title='Add to timeline';
      add.onclick=()=>{ if(m.type==='video'||m.type==='image') addClip(m.id); else { snapshot(); state.clips.push({id:makeId(),mediaId:m.id,type:'audio',name:m.name,duration:durationOf(m),speed:1,volume:1,start:0,end:durationOf(m)}); renderTimeline(); toast('Audio added to the audio track.'); } };
      item.append(thumb,info,add); list.append(item);
    });
  }
  function renderTimeline() {
    const zoom=state.zoom, total=Math.max(12,totalDuration()), pxPerSec=zoom/5;
    const innerWidth=Math.max(520,total*pxPerSec+80);
    $('timelineInner').style.width=(100+innerWidth)+'px';
    ['videoTrack','audioTrack','textTrack','effectsTrack'].forEach(id=>{ const n=$(id); n.innerHTML=''; });
    const video=$('videoTrack'), audio=$('audioTrack'), text=$('textTrack'), effects=$('effectsTrack');
    let cursor=0;
    state.clips.forEach(c=>{
      const lane=c.type==='audio'?audio:video;
      const el=document.createElement('button'); el.type='button'; el.className='timeline-clip '+(c.type==='image'?'photo':'')+(c.type==='audio'?' audio':'')+(c.id===state.selectedId?' selected':'');
      el.style.width=Math.max(40,c.duration*pxPerSec)+'px'; el.title=c.name+' · '+fmt(c.duration);
      const label=document.createElement('span'); label.textContent=(c.type==='audio'?'♫ ':c.type==='image'?'▧ ':'▶ ')+c.name;
      const dur=document.createElement('span'); dur.className='clip-duration'; dur.textContent=fmt(c.duration);
      el.append(label,dur); el.onclick=()=>{selectClip(c.id);setPlayhead(clipStartAt(c.id),true);};
      lane.append(el); cursor+=c.duration;
    });
    state.textItems.forEach(t=>{
      const el=document.createElement('button'); el.type='button'; el.className='timeline-clip text-clip'+(t.id===state.selectedId?' selected':'');
      el.style.width=Math.max(50,(t.duration||3)*pxPerSec)+'px'; el.textContent='T · '+(t.text||'Text overlay').slice(0,25); el.onclick=()=>{state.selectedId=t.id;renderTimeline();showPanel('text');populateTextPanel(t);}; text.append(el);
    });
    state.effects.forEach(e=>{const el=document.createElement('span');el.className='effect-chip';el.textContent=e.name;effects.append(el);});
    if(!video.children.length) video.innerHTML='<span class="lane-placeholder">Import video or photos</span>';
    if(!audio.children.length) audio.innerHTML='<span class="lane-placeholder">Add audio from the Audio tool</span>';
    if(!text.children.length) text.innerHTML='<span class="lane-placeholder">Text overlays appear here</span>';
    if(!effects.children.length) effects.innerHTML='<span class="lane-placeholder">Choose an effect to apply</span>';
    const maxWidth=100+innerWidth;
    $('ruler').innerHTML='';
    const seconds=Math.ceil(total+3);
    for(let s=0;s<=seconds;s+=Math.max(1,Math.round(80/pxPerSec))){
      const tick=document.createElement('span');tick.className='ruler-tick';tick.style.left=(s*pxPerSec)+'px';tick.textContent=fmt(s);$('ruler').append(tick);
    }
    $('playhead').style.left=(100+state.playhead*pxPerSec)+'px';
    $('clipCount').textContent=state.clips.length+' clip'+(state.clips.length===1?'':'s');
    $('durationTime').textContent=fmt(total);
    $('currentTime').textContent=fmt(state.playhead);
    $('timelineStatus').textContent=selectedClip()?('Selected: '+selectedClip().name):'Select a clip to edit it.';
    updateUndoRedo();
  }
  function selectClip(id) {
    state.selectedId=id; renderTimeline(); syncSelectedProperties();
    const c=state.clips.find(x=>x.id===id);
    if(c){ if(c.type==='audio') showPanel('audio'); else showPanel('media'); }
  }
  function syncSelectedProperties() {
    const c=selectedClip();
    $('timelineStatus').textContent=c?'Selected: '+c.name:'Select a clip to edit it.';
    if(c && c.type!=='audio') loadPreview(c);
  }
  function loadPreview(c) {
    const m=mediaById(c.mediaId); if(!m)return;
    activeMediaId=m.id; $('emptyState').classList.add('hidden'); preview.style.display='none';photo.style.display='none';
    if(m.type==='video'){
      if(preview.src!==m.url){preview.pause();preview.src=m.url;preview.load();}
      preview.style.display='block';preview.playbackRate=c.speed||1;preview.volume=Number(c.volume??1);
      try{preview.currentTime=Math.min(c.start||0,Math.max(0,(m.duration||1)-.05));}catch(e){}
    } else if(m.type==='image'){
      photo.src=m.url;photo.style.display='block';
    }
    applyPreviewStyle();
    updateOverlay();
    $('previewStatus').textContent=m.type==='image'?'Photo selected':'Video selected';
  }
  function applyPreviewStyle() {
    const filter=`brightness(${state.brightness}%) contrast(${state.contrast}%) grayscale(${state.grayscale}%)`;
    preview.style.filter=filter;photo.style.filter=filter;
    preview.style.transform=`rotate(${state.rotation}deg)`;photo.style.transform=`rotate(${state.rotation}deg)`;
  }
  function setPlayhead(time, updateMedia=false) {
    state.playhead=Math.max(0,Math.min(totalDuration(),Number(time)||0));
    if(updateMedia){
      let start=0, chosen=null;
      for(const c of state.clips){if(c.type!=='audio'&&state.playhead>=start&&state.playhead<=start+c.duration){chosen=c;break;}start+=c.duration;}
      if(chosen){if(chosen.id!==state.selectedId){state.selectedId=chosen.id;renderTimeline();syncSelectedProperties();}const m=mediaById(chosen.mediaId);if(m&&m.type==='video'&&preview.src===m.url){const local=Math.max(0,state.playhead-clipStartAt(chosen.id));try{preview.currentTime=Math.min((chosen.start||0)+local,Math.max(0,(m.duration||1)-.05));}catch(e){}}}
    }
    $('currentTime').textContent=fmt(state.playhead);$('playhead').style.left=(100+state.playhead*(state.zoom/5))+'px';
  }
  function updateOverlay() {
    const t=state.textItems.find(item=>state.playhead>=item.start && state.playhead<=item.start+item.duration) || state.textItems[state.textItems.length-1];
    overlay.textContent=t?t.text:'';overlay.style.color=t?t.color:'#ffffff';overlay.style.fontSize=(t?t.size:32)+'px';
    overlay.style.alignItems=t&&t.position==='top'?'flex-start':t&&t.position==='bottom'?'flex-end':'center';
    overlay.style.paddingTop=t&&t.position==='top'?'8%':'5%';overlay.style.paddingBottom=t&&t.position==='bottom'?'8%':'5%';
  }
  function showPanel(name) {
    state.currentPanel=name;
    document.querySelectorAll('.tool[data-panel]').forEach(b=>b.classList.toggle('active',b.dataset.panel===name));
    const titles={media:'Media Library',text:'Text & Captions',audio:'Audio Tools',effects:'Effects',filters:'Filters',stickers:'Stickers',captions:'Captions',transitions:'Transitions',settings:'Project Settings'};
    $('panelTitle').textContent=titles[name]||'Settings';
    renderPanel(name);
  }
  function panelField(label,control){return `<label class="field"><span>${label}</span>${control}</label>`;}
  function renderPanel(name) {
    const box=$('panelContent');
    if(name==='media'){box.innerHTML='<div class="media-toolbar"><p class="muted">Import files from your device. Media stays in this browser session unless you save the project file.</p><label class="btn btn-primary file-button">＋ Import media<input id="mediaInput" type="file" accept="video/*,image/*,audio/*" multiple></label></div><div id="mediaList" class="media-list"></div>'; $('mediaInput').addEventListener('change',e=>importFiles(e.target.files));renderMedia();return;}
    if(name==='text'||name==='captions'){box.innerHTML=`<div class="panel-grid">${panelField('Text',`<textarea id="textInput" placeholder="Type your title or caption..."></textarea>`)}${panelField('Text colour','<input id="textColor" type="color" value="#ffffff">')}${panelField('Font size','<input id="textSize" type="range" min="14" max="72" value="32">')}${panelField('Position','<select id="textPosition"><option value="center">Center</option><option value="top">Top</option><option value="bottom">Bottom</option></select>')}${panelField('Duration (seconds)','<input id="textDuration" type="number" min="1" max="120" value="3">')}</div><div class="panel-actions"><button class="btn btn-primary" id="addTextBtn" type="button">＋ Add text</button><button class="btn btn-quiet" id="updateTextBtn" type="button">Update selected text</button></div><p class="field-note">Text overlays are composited in the preview and included in browser-based export where supported.</p>`;
      $('addTextBtn').onclick=addText; $('updateTextBtn').onclick=updateText; return;}
    if(name==='audio'){box.innerHTML=`<p class="muted">Import an audio file using the media picker, then tap ＋ beside it to add it to the audio track.</p><div class="panel-grid">${panelField('Selected clip volume','<input id="audioVolume" type="range" min="0" max="1" step=".05" value="1">')}${panelField('Playback speed','<select id="audioSpeed"><option value=".5">0.5×</option><option value=".75">0.75×</option><option value="1" selected>1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2×</option></select>')}</div><div class="panel-actions"><label class="btn btn-primary file-button">＋ Import audio<input id="audioInput" type="file" accept="audio/*" multiple></label></div><p class="field-note">Audio clips can be added to the timeline. Full multi-track audio mixing may depend on browser capabilities.</p>`;
      $('audioInput').addEventListener('change',e=>importFiles(e.target.files));$('audioVolume').oninput=e=>{const c=selectedClip();if(c){c.volume=+e.target.value;if(c.type==='video')preview.volume=c.volume;}};$('audioSpeed').onchange=e=>{const c=selectedClip();if(c){c.speed=+e.target.value;if(c.type==='video')preview.playbackRate=c.speed;}};return;}
    if(name==='effects'||name==='filters'){box.innerHTML=`<div class="panel-grid">${panelField('Effect / filter','<select id="effectChoice"><option value="none">None</option><option value="cinema">Cinematic</option><option value="vivid">Vivid</option><option value="mono">Monochrome</option><option value="warm">Warm tone</option><option value="cool">Cool tone</option><option value="blur">Soft blur</option></select>')}${panelField('Intensity','<input id="effectIntensity" type="range" min="0" max="100" value="50">')}</div><div class="panel-actions"><button class="btn btn-primary" id="applyEffectBtn" type="button">Apply effect</button><button class="btn btn-quiet" id="resetEffectBtn" type="button">Reset preview</button></div><p class="field-note">Effects currently adjust the preview and record the chosen effect in the timeline. Export applies brightness, contrast, and grayscale; advanced effects may vary by browser.</p>`;
      $('applyEffectBtn').onclick=applyEffect;$('resetEffectBtn').onclick=()=>{state.brightness=100;state.contrast=100;state.grayscale=0;state.effects=[];applyPreviewStyle();renderTimeline();toast('Preview adjustments reset.');};return;}
    if(name==='stickers'){box.innerHTML='<p class="muted">Choose a simple sticker to add as a text overlay.</p><div class="panel-actions">'+['⭐','❤️','✨','🔥','🎉','😊','⚡','🌈'].map(s=>`<button class="mini-tool sticker-choice" type="button">${s}</button>`).join('')+'</div>';box.querySelectorAll('.sticker-choice').forEach(b=>b.onclick=()=>{snapshot();state.textItems.push({id:makeId(),text:b.textContent,color:'#ffffff',size:42,position:'center',start:state.playhead,duration:3});state.selectedId=state.textItems[state.textItems.length-1].id;renderTimeline();updateOverlay();toast('Sticker added to overlay track.');});return;}
    if(name==='transitions'){box.innerHTML='<p class="muted">Transitions between clips are not rendered yet. You can arrange clips in sequence and preview each clip using the timeline.</p><div class="panel-actions"><button class="btn btn-quiet" id="transitionInfo" type="button">How it works</button></div>'; $('transitionInfo').onclick=()=>toast('Transition rendering is not available in this build.');return;}
    box.innerHTML=`<div class="panel-grid">${panelField('Project name','<input id="projectTitleInput" type="text" value="'+$('projectName').textContent.replace(/"/g,'&quot;')+'">')}${panelField('Preview aspect ratio','<select id="panelAspect"><option>16:9</option><option>9:16</option><option>1:1</option><option>4:5</option></select>')}</div><div class="panel-actions"><button class="btn btn-primary" id="applyProjectSettings" type="button">Apply settings</button><button class="btn btn-quiet" id="openProjectBtn" type="button">Open saved project JSON</button></div><p class="field-note">Project JSON saves the edit structure and settings. Browser security means original media files must remain available locally; project JSON does not embed large video files.</p>`;
    $('panelAspect').value=$('aspect').value;$('applyProjectSettings').onclick=()=>{$('projectName').textContent=$('projectTitleInput').value.trim()||'Untitled Project';$('aspect').value=$('panelAspect').value;setAspect();toast('Project settings applied.');};$('openProjectBtn').onclick=()=>$('projectOpenInput').click();
  }
  function populateTextPanel(t){showPanel('text');$('textInput').value=t.text;$('textColor').value=t.color;$('textSize').value=t.size;$('textPosition').value=t.position;$('textDuration').value=t.duration;}
  function addText(){const text=$('textInput').value.trim();if(!text){toast('Type some text first.');return;}snapshot();const t={id:makeId(),text,color:$('textColor').value,size:+$('textSize').value,position:$('textPosition').value,start:state.playhead,duration:Math.max(1,+$('textDuration').value||3)};state.textItems.push(t);state.selectedId=t.id;renderTimeline();updateOverlay();toast('Text overlay added.');}
  function updateText(){const t=state.textItems.find(x=>x.id===state.selectedId);if(!t){toast('Select a text overlay on the timeline first.');return;}const text=$('textInput').value.trim();if(!text){toast('Type some text first.');return;}snapshot();Object.assign(t,{text,color:$('textColor').value,size:+$('textSize').value,position:$('textPosition').value,duration:Math.max(1,+$('textDuration').value||3)});renderTimeline();updateOverlay();toast('Text overlay updated.');}
  function applyEffect(){const choice=$('effectChoice').value,intensity=+$('effectIntensity').value/100;if(choice==='none'){state.brightness=100;state.contrast=100;state.grayscale=0;}if(choice==='cinema'){state.contrast=100+intensity*35;state.brightness=100-intensity*8;state.grayscale=0;}if(choice==='vivid'){state.contrast=100+intensity*25;state.brightness=100+intensity*8;state.grayscale=0;}if(choice==='mono'){state.grayscale=100*intensity;}if(choice==='warm'){state.brightness=100+intensity*7;state.grayscale=0;}if(choice==='cool'){state.contrast=100+intensity*10;state.grayscale=0;}if(choice==='blur'){preview.style.filter+=` blur(${intensity*2}px)`;photo.style.filter+=` blur(${intensity*2}px)`;}applyPreviewStyle();if(choice!=='none'){state.effects.push({id:makeId(),name:choice[0].toUpperCase()+choice.slice(1)});renderTimeline();}toast('Effect applied to preview.');}
  function setAspect(){const v=$('aspect').value;const ratio={'16:9':'16 / 9','9:16':'9 / 16','1:1':'1 / 1','4:5':'4 / 5'}[v]||'16 / 9';$('stage').style.aspectRatio=ratio;}
  function pausePlayback(){state.playing=false;preview.pause();clearInterval(playbackTimer);playbackTimer=null;$('playBtn').textContent='▶';$('playBtn').setAttribute('aria-label','Play');}
  function playPlayback(){if(!state.clips.length){toast('Import media before playing.');return;}state.playing=true;$('playBtn').textContent='Ⅱ';$('playBtn').setAttribute('aria-label','Pause');let last=performance.now();playbackTimer=setInterval(()=>{if(!state.playing)return;const now=performance.now();state.playhead+=(now-last)/1000;last=now;if(state.playhead>=totalDuration()){state.playhead=0;}setPlayhead(state.playhead,true);updateOverlay();const c=selectedClip(),m=c&&mediaById(c.mediaId);if(m&&m.type==='video'&&preview.paused){preview.play().catch(()=>{});}if(m&&m.type==='image'){preview.pause();} },100); }
  function togglePlayback(){if(state.playing)pausePlayback();else playPlayback();}
  function splitSelected(){const c=selectedClip();if(!c){toast('Select a timeline clip to split.');return;}const start=clipStartAt(c.id),local=state.playhead-start;if(local<.25||c.duration-local<.25){toast('Move the playhead inside the selected clip to split it.');return;}snapshot();const second={...c,id:makeId(),name:c.name+' (split)',duration:c.duration-local,start:(c.start||0)+local,end:c.end};c.duration=local;c.end=(c.start||0)+local;state.clips.splice(state.clips.indexOf(c)+1,0,second);renderTimeline();toast('Clip split into two timeline sections.');}
  function deleteSelected(){const id=state.selectedId;if(!id){toast('Select a clip or text overlay first.');return;}snapshot();const ci=state.clips.findIndex(c=>c.id===id);if(ci>=0)state.clips.splice(ci,1);else state.textItems=state.textItems.filter(t=>t.id!==id);state.selectedId=null;renderTimeline();updateOverlay();$('previewStatus').textContent='Ready';toast('Selected timeline item deleted.');}
  function duplicateSelected(){const c=selectedClip();if(c){snapshot();const copy={...c,id:makeId(),name:c.name+' copy'};state.clips.splice(state.clips.indexOf(c)+1,0,copy);state.selectedId=copy.id;renderTimeline();toast('Clip duplicated.');return;}const t=state.textItems.find(x=>x.id===state.selectedId);if(t){snapshot();const copy={...t,id:makeId(),start:t.start+t.duration};state.textItems.push(copy);state.selectedId=copy.id;renderTimeline();toast('Text overlay duplicated.');return;}toast('Select a clip or text overlay first.');}
  function changeSpeed(){const c=selectedClip();if(!c){toast('Select a clip first.');return;}const speeds=[.5,.75,1,1.25,1.5,2],next=speeds[(speeds.indexOf(c.speed||1)+1)%speeds.length];snapshot();c.speed=next;if(c.type==='video')preview.playbackRate=next;toast('Playback speed set to '+next+'×.');}
  function rotateSelected(){state.rotation=(state.rotation+90)%360;applyPreviewStyle();toast('Preview rotated '+state.rotation+'°.');}
  function adjustSelected(){showPanel('effects');}
  function trimSelected(){const c=selectedClip();if(!c){toast('Select a clip first.');return;}const newDur=prompt('Set clip duration in seconds (current '+c.duration.toFixed(1)+'):',String(Math.max(1,Math.round(c.duration))));if(newDur===null)return;const val=Number(newDur);if(!Number.isFinite(val)||val<=0){toast('Enter a duration greater than zero.');return;}snapshot();c.duration=Math.min(val,3600);c.end=(c.start||0)+c.duration;renderTimeline();toast('Clip duration updated.');}
  function cropSelected(){toast('Crop controls are not included in this browser build yet. Use the aspect-ratio selector for the output frame.');}
  function saveProject(){const project={app:'VITALSTAR VE PRO',version:1,projectName:$('projectName').textContent,aspect:$('aspect').value,brightness:state.brightness,contrast:state.contrast,grayscale:state.grayscale,rotation:state.rotation,clips:state.clips,textItems:state.textItems,effects:state.effects,media:state.media.map(m=>({id:m.id,name:m.name,type:m.type,size:m.size,mime:m.mime,duration:m.duration})),savedAt:new Date().toISOString()};const blob=new Blob([JSON.stringify(project,null,2)],{type:'application/json'});downloadBlob(blob,(project.projectName||'vitalstar-project').replace(/[^a-z0-9-_]+/gi,'-')+'.json');toast('Project structure saved as JSON. Media files are not embedded.');}
  function downloadBlob(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
  function openProject(file){const reader=new FileReader();reader.onload=()=>{try{const d=JSON.parse(reader.result);if(!d||!Array.isArray(d.clips))throw new Error('Invalid project');state.clips=d.clips;state.textItems=d.textItems||[];state.effects=d.effects||[];state.brightness=d.brightness||100;state.contrast=d.contrast||100;state.grayscale=d.grayscale||0;state.rotation=d.rotation||0;$('projectName').textContent=d.projectName||'Imported Project';$('aspect').value=d.aspect||'16:9';setAspect();state.selectedId=null;renderTimeline();applyPreviewStyle();toast('Project structure loaded. Re-import its original media to preview clips.');}catch(e){toast('That file is not a valid VITALSTAR project JSON.');}};reader.readAsText(file);}
  async function exportVideo(){
    if(!state.clips.some(c=>c.type==='video'||c.type==='image')){toast('Add a video or photo clip before exporting.');return;}
    if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){toast('Video export is not supported in this browser. Try the latest Chrome browser.');return;}
    const supported=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
    if(!supported){toast('This browser does not offer a supported WebM export format.');return;}
    const w=720,h=405,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d');const stream=canvas.captureStream(24);
    const recorder=new MediaRecorder(stream,{mimeType:supported});const chunks=[];
    recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
    const finished=new Promise((resolve,reject)=>{recorder.onstop=()=>resolve();recorder.onerror=()=>reject(new Error('Recorder error'));});
    const exportBtn=$('exportBtn');exportBtn.disabled=true;state.exportCancelled=false;
    const total=state.clips.filter(c=>c.type!=='audio').reduce((s,c)=>s+c.duration,0);
    if(total<=0){exportBtn.disabled=false;toast('No visual clips found.');return;}
    let elapsed=0;
    const drawBackground=()=>{ctx.fillStyle='#05070b';ctx.fillRect(0,0,w,h);};
    const drawOverlay=(time)=>{const t=state.textItems.find(x=>time>=x.start&&time<=x.start+x.duration);if(t){ctx.fillStyle=t.color||'#fff';ctx.font=`bold ${Math.min(64,t.size||32)}px sans-serif`;ctx.textAlign='center';ctx.textBaseline=t.position==='top'?'top':t.position==='bottom'?'bottom':'middle';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.fillText(t.text.slice(0,120),w/2,t.position==='top'?35:t.position==='bottom'?h-35:h/2,w*.9);ctx.shadowBlur=0;}};
    try{
      recorder.start(250);$('previewStatus').textContent='Exporting WebM…';
      for(const c of state.clips){
        if(c.type==='audio')continue;
        if(state.exportCancelled)break;
        const m=mediaById(c.mediaId);if(!m)continue;
        drawBackground();
        if(m.type==='image'){
          const img=new Image();img.src=m.url;await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;});
          const scale=Math.min(w/img.width,h/img.height),dw=img.width*scale,dh=img.height*scale;ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);
          const start=performance.now();
          while((performance.now()-start)/1000<c.duration&&!state.exportCancelled){drawBackground();ctx.drawImage(img,(w-dw)/2,(h-dh)/2,dw,dh);drawOverlay(elapsed+(performance.now()-start)/1000);await new Promise(r=>setTimeout(r,40));}
        }else{
          const v=document.createElement('video');v.src=m.url;v.muted=true;v.playsInline=true;v.preload='auto';
          await new Promise((res,rej)=>{v.onloadedmetadata=res;v.onerror=()=>rej(new Error('Could not load '+m.name));});
          try{v.currentTime=Math.max(0,c.start||0);}catch(e){}
          await new Promise(res=>{if(v.readyState>=2)res();else v.oncanplay=res;});
          const start=performance.now();v.playbackRate=c.speed||1;await v.play().catch(()=>{});
          while((performance.now()-start)/1000<c.duration&&!v.ended&&!state.exportCancelled){
            drawBackground();const scale=Math.min(w/v.videoWidth,h/v.videoHeight),dw=v.videoWidth*scale,dh=v.videoHeight*scale;
            ctx.save();ctx.translate(w/2,h/2);ctx.rotate((c.rotation||0)*Math.PI/180);ctx.filter=`brightness(${state.brightness}%) contrast(${state.contrast}%) grayscale(${state.grayscale}%)`;ctx.drawImage(v,-dw/2,-dh/2,dw,dh);ctx.restore();drawOverlay(elapsed+(performance.now()-start)/1000);
            await new Promise(r=>setTimeout(r,40));
          }v.pause();v.remove();
        }
        elapsed+=c.duration;
      }
      recorder.stop();await finished;
      if(chunks.length){const blob=new Blob(chunks,{type:supported});downloadBlob(blob,($('projectName').textContent||'vitalstar-video').replace(/[^a-z0-9-_]+/gi,'-')+'.webm');toast(state.exportCancelled?'Export cancelled; partial WebM downloaded.':'Export finished as WebM.');}
      else toast('Export produced no video data.');
    }catch(err){try{if(recorder.state!=='inactive')recorder.stop();}catch(e){}toast('Export failed: '+(err.message||'browser error'));}finally{stream.getTracks().forEach(t=>t.stop());exportBtn.disabled=false;$('previewStatus').textContent='Ready';}
  }
  function bind(){
    $('mediaInput').addEventListener('change',e=>importFiles(e.target.files));
    $('importFromEmpty').onclick=()=>{$('mediaInput').click();};
    document.querySelectorAll('.tool[data-panel]').forEach(b=>b.onclick=()=>showPanel(b.dataset.panel));
    $('toggleTools').onclick=()=>{const body=$('toolsBody'),hide=!body.classList.contains('hidden');body.classList.toggle('hidden',hide);$('toggleTools').textContent=hide?'Expand +':'Collapse −';$('toggleTools').setAttribute('aria-expanded',String(!hide));};
    $('collapsePanel').onclick=()=>{$('panelContent').classList.toggle('hidden');$('collapsePanel').textContent=$('panelContent').classList.contains('hidden')?'⌄':'⌃';};
    $('playBtn').onclick=togglePlayback;$('backFrame').onclick=()=>{pausePlayback();setPlayhead(Math.max(0,state.playhead-1),true);updateOverlay();};$('forwardFrame').onclick=()=>{pausePlayback();setPlayhead(Math.min(totalDuration(),state.playhead+1),true);updateOverlay();};
    $('aspect').onchange=setAspect;$('fullscreenBtn').onclick=()=>{const el=$('stage');if(!document.fullscreenElement&&el.requestFullscreen)el.requestFullscreen().catch(()=>toast('Fullscreen is not available here.'));else if(document.exitFullscreen)document.exitFullscreen();};
    $('splitBtn').onclick=splitSelected;$('deleteBtn').onclick=deleteSelected;$('duplicateBtn').onclick=duplicateSelected;$('speedTool').onclick=changeSpeed;$('rotateTool').onclick=rotateSelected;$('adjustTool').onclick=adjustSelected;$('cropTool').onclick=cropSelected;$('trimTool').onclick=trimSelected;
    $('zoomRange').oninput=e=>{state.zoom=+e.target.value;renderTimeline();};$('zoomIn').onclick=()=>{$('zoomRange').value=Math.min(180,+$('zoomRange').value+10);state.zoom=+$('zoomRange').value;renderTimeline();};$('zoomOut').onclick=()=>{$('zoomRange').value=Math.max(40,+$('zoomRange').value-10);state.zoom=+$('zoomRange').value;renderTimeline();};
    $('undoBtn').onclick=()=>{if(!state.history.length)return;state.future.push(JSON.stringify({clips:state.clips,textItems:state.textItems,effects:state.effects,selectedId:state.selectedId}));restoreSnapshot(state.history.pop());};
    $('redoBtn').onclick=()=>{if(!state.future.length)return;state.history.push(JSON.stringify({clips:state.clips,textItems:state.textItems,effects:state.effects,selectedId:state.selectedId}));restoreSnapshot(state.future.pop());};
    $('saveProject').onclick=$('saveProjectBottom').onclick=saveProject;$('exportBtn').onclick=$('exportBottom').onclick=exportVideo;
    $('newProject').onclick=()=>{if((state.clips.length||state.textItems.length)&&!confirm('Start a new project? Unsaved edits will be cleared.'))return;pausePlayback();state.clips=[];state.textItems=[];state.effects=[];state.selectedId=null;state.playhead=0;state.history=[];state.future=[];$('projectName').textContent='Untitled Project';preview.removeAttribute('src');preview.load();preview.style.display='none';photo.removeAttribute('src');photo.style.display='none';overlay.textContent='';$('emptyState').classList.remove('hidden');renderTimeline();toast('New project created.');};
    $('projectOpenInput').onchange=e=>{if(e.target.files[0])openProject(e.target.files[0]);e.target.value='';};
    preview.addEventListener('timeupdate',()=>{if(!state.playing&&preview.duration){$('previewStatus').textContent='Previewing';}});
    document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select'))return;if(e.code==='Space'){e.preventDefault();togglePlayback();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveProject();}});
    $('stage').addEventListener('click',()=>{if(state.clips.length&&!state.playing)togglePlayback();});
  }
  bind();renderMedia();renderTimeline();showPanel('media');setAspect();
})();