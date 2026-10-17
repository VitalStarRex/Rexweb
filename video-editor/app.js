(() => {
  'use strict';

  const $ = id => document.getElementById(id);

  const state = {
    media: [],
    clips: [],
    textItems: [],
    effects: [],
    selectedId: null,
    zoom: 80,
    playhead: 0,
    playing: false,
    currentPanel: 'media',
    speed: 1,
    rotation: 0,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    history: [],
    future: [],
    objectUrls: [],
    exportCancelled: false
  };

  const preview = $('preview');
  const photo = $('photoPreview');
  const overlay = $('textOverlay');

  let toastTimer;
  let playbackTimer = null;
  let activeMediaId = null;

  // ==========================================
  // NOTIFICATIONS AND UTILITIES
  // ==========================================

  function toast(message) {
    const node = $('toast');
    if (!node) return;

    node.textContent = message;
    node.classList.add('show');

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      node.classList.remove('show');
    }, 2800);
  }

  function fmt(seconds) {
    seconds = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return String(mins).padStart(2, '0') + ':' +
      String(secs).padStart(2, '0');
  }

  function makeId() {
    return 'id-' + Date.now().toString(36) +
      Math.random().toString(36).slice(2, 7);
  }

  function durationOf(media) {
    return media && media.duration && Number.isFinite(media.duration)
      ? media.duration
      : 5;
  }

  function mediaById(id) {
    return state.media.find(m => m.id === id);
  }

  function selectedClip() {
    return state.clips.find(c => c.id === state.selectedId) || null;
  }

  function selectedText() {
    return state.textItems.find(t => t.id === state.selectedId) || null;
  }

  function totalDuration() {
    return state.clips.reduce(
      (sum, c) => sum + Math.max(0.1, Number(c.duration) || 0),
      0
    );
  }

  function clipStartAt(id) {
    let time = 0;

    for (const clip of state.clips) {
      if (clip.id === id) return time;
      time += Number(clip.duration) || 0;
    }

    return 0;
  }

  function currentClipAt(time) {
    let start = 0;

    for (const clip of state.clips) {
      const end = start + clip.duration;

      if (
        clip.type !== 'audio' &&
        time >= start &&
        (time < end || time === totalDuration())
      ) {
        return clip;
      }

      start = end;
    }

    return null;
  }

  // ==========================================
  // UNDO AND REDO
  // ==========================================

  function snapshot() {
    state.history.push(JSON.stringify({
      clips: state.clips,
      textItems: state.textItems,
      effects: state.effects,
      selectedId: state.selectedId,
      brightness: state.brightness,
      contrast: state.contrast,
      grayscale: state.grayscale,
      rotation: state.rotation
    }));

    if (state.history.length > 40) {
      state.history.shift();
    }

    state.future = [];
    updateUndoRedo();
  }

  function restoreSnapshot(raw) {
    try {
      const data = JSON.parse(raw);

      state.clips = data.clips || [];
      state.textItems = data.textItems || [];
      state.effects = data.effects || [];
      state.selectedId = data.selectedId || null;

      state.brightness = data.brightness ?? 100;
      state.contrast = data.contrast ?? 100;
      state.grayscale = data.grayscale ?? 0;
      state.rotation = data.rotation ?? 0;

      renderTimeline();
      updateOverlay();
      applyPreviewStyle();
      updateUndoRedo();
      syncSelectedProperties();

    } catch (error) {
      toast('Could not restore that edit.');
    }
  }

  function updateUndoRedo() {
    $('undoBtn').disabled = !state.history.length;
    $('redoBtn').disabled = !state.future.length;
  }

  function undo() {
    if (!state.history.length) return;

    state.future.push(JSON.stringify({
      clips: state.clips,
      textItems: state.textItems,
      effects: state.effects,
      selectedId: state.selectedId,
      brightness: state.brightness,
      contrast: state.contrast,
      grayscale: state.grayscale,
      rotation: state.rotation
    }));

    restoreSnapshot(state.history.pop());
    toast('Undo successful.');
  }

  function redo() {
    if (!state.future.length) return;

    state.history.push(JSON.stringify({
      clips: state.clips,
      textItems: state.textItems,
      effects: state.effects,
      selectedId: state.selectedId,
      brightness: state.brightness,
      contrast: state.contrast,
      grayscale: state.grayscale,
      rotation: state.rotation
    }));

    restoreSnapshot(state.future.pop());
    toast('Redo successful.');
  }

  // ==========================================
  // MEDIA IMPORT
  // ==========================================

  function addMedia(file) {
    const url = URL.createObjectURL(file);

    state.objectUrls.push(url);

    const type = file.type.startsWith('video/')
      ? 'video'
      : file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('audio/')
          ? 'audio'
          : 'other';

    const media = {
      id: makeId(),
      name: file.name,
      type,
      url,
      file,
      size: file.size,
      duration: 0,
      mime: file.type
    };

    state.media.push(media);

    if (type === 'video' || type === 'audio') {
      const probe = document.createElement(type);

      probe.preload = 'metadata';
      probe.src = url;

      probe.onloadedmetadata = () => {
        media.duration = Number.isFinite(probe.duration)
          ? probe.duration
          : 0;

        renderMedia();
      };

      probe.onerror = renderMedia;
    }

    renderMedia();

    if (type === 'video' || type === 'image') {
      addClip(media.id);
    } else if (type === 'audio') {
      addAudioClip(media.id);
    }
  }

  function importFiles(files) {
    const valid = Array.from(files || []).filter(file =>
      /^(video|image|audio)\//.test(file.type)
    );

    if (!valid.length) {
      toast('Choose a video, photo, or audio file.');
      return;
    }

    valid.forEach(addMedia);

    const input = $('mediaInput');
    if (input) input.value = '';

    toast(valid.length + ' file' +
      (valid.length === 1 ? '' : 's') + ' imported.');
  }

  function addAudioClip(mediaId) {
    const media = mediaById(mediaId);
    if (!media) return;

    snapshot();

    const duration = durationOf(media);

    const clip = {
      id: makeId(),
      mediaId: media.id,
      type: 'audio',
      name: media.name,
      duration,
      speed: 1,
      volume: 1,
      start: 0,
      end: duration
    };

    state.clips.push(clip);

    renderTimeline();
    toast('Audio added to the timeline.');
  }

  function renderMedia() {
    const list = $('mediaList');
    if (!list) return;

    list.innerHTML = '';

    if (!state.media.length) {
      list.innerHTML =
        '<div class="empty-library">No media imported yet.</div>';
      return;
    }

    state.media.forEach(media => {
      const item = document.createElement('div');
      item.className = 'media-item';

      const icon = media.type === 'video'
        ? '▶'
        : media.type === 'image'
          ? '▧'
          : '♫';

      const thumb = document.createElement('div');
      thumb.className = 'media-thumb';
      thumb.textContent = icon;

      const info = document.createElement('div');
      info.className = 'media-info';

      const name = document.createElement('strong');
      name.textContent = media.name;

      const meta = document.createElement('small');
      meta.textContent =
        media.type.toUpperCase() + ' · ' +
        (media.size / 1024 / 1024).toFixed(1) + ' MB';

      info.append(name, meta);

      const add = document.createElement('button');
      add.className = 'media-add';
      add.type = 'button';
      add.textContent = '＋';
      add.title = 'Add to timeline';

      add.onclick = () => {
        if (media.type === 'video' || media.type === 'image') {
          addClip(media.id);
        } else if (media.type === 'audio') {
          addAudioClip(media.id);
        }
      };

      item.append(thumb, info, add);
      list.append(item);
    });
  }

  // ==========================================
  // CLIPS AND TIMELINE
  // ==========================================

  function addClip(mediaId) {
    const media = mediaById(mediaId);

    if (!media || !['video', 'image'].includes(media.type)) {
      return;
    }

    snapshot();

    const duration = media.type === 'image'
      ? 5
      : durationOf(media);

    const clip = {
      id: makeId(),
      mediaId: media.id,
      type: media.type,
      name: media.name,
      duration,
      speed: 1,
      volume: 1,
      start: 0,
      end: duration,
      rotation: 0
    };

    state.clips.push(clip);
    state.selectedId = clip.id;

    renderTimeline();
    selectClip(clip.id);
    setPlayhead(clipStartAt(clip.id), true);

    toast('Clip added to timeline.');
  }

  function renderTimeline() {
    const zoom = state.zoom;
    const pxPerSec = zoom / 5;
    const total = Math.max(12, totalDuration());
    const contentWidth = Math.max(520, total * pxPerSec + 80);

    $('timelineInner').style.width = (100 + contentWidth) + 'px';

    const video = $('videoTrack');
    const audio = $('audioTrack');
    const text = $('textTrack');
    const effects = $('effectsTrack');

    [video, audio, text, effects].forEach(track => {
      track.innerHTML = '';
    });

    state.clips.forEach(clip => {
      const lane = clip.type === 'audio' ? audio : video;

      const element = document.createElement('button');

      element.type = 'button';
      element.className = 'timeline-clip';

      if (clip.type === 'image') element.classList.add('photo');
      if (clip.type === 'audio') element.classList.add('audio');

      if (clip.id === state.selectedId) {
        element.classList.add('selected');
      }

      element.style.width =
        Math.max(40, clip.duration * pxPerSec) + 'px';

      element.title = clip.name + ' · ' + fmt(clip.duration);

      const label = document.createElement('span');

      label.textContent =
        (clip.type === 'audio'
          ? '♫ '
          : clip.type === 'image'
            ? '▧ '
            : '▶ ') + clip.name;

      const duration = document.createElement('span');
      duration.className = 'clip-duration';
      duration.textContent = fmt(clip.duration);

      element.append(label, duration);

      element.onclick = () => {
        selectClip(clip.id);
        setPlayhead(clipStartAt(clip.id), true);
      };

      lane.append(element);
    });

    state.textItems.forEach(item => {
      const element = document.createElement('button');

      element.type = 'button';
      element.className = 'timeline-clip text-clip';

      if (item.id === state.selectedId) {
        element.classList.add('selected');
      }

      element.style.width =
        Math.max(50, (item.duration || 3) * pxPerSec) + 'px';

      element.textContent = 'T · ' + (item.text || 'Text overlay').slice(0, 25);

      element.onclick = () => {
        state.selectedId = item.id;
        renderTimeline();
        showPanel('text');
        populateTextPanel(item);
      };

      text.append(element);
    });

    state.effects.forEach(effect => {
      const element = document.createElement('span');

      element.className = 'effect-chip';
      element.textContent = effect.name;

      effects.append(element);
    });

    if (!video.children.length) {
      video.innerHTML =
        '<span class="lane-placeholder">Import video or photos</span>';
    }

    if (!audio.children.length) {
      audio.innerHTML =
        '<span class="lane-placeholder">Add audio from the Audio tool</span>';
    }

    if (!text.children.length) {
      text.innerHTML =
        '<span class="lane-placeholder">Text overlays appear here</span>';
    }

    if (!effects.children.length) {
      effects.innerHTML =
        '<span class="lane-placeholder">Choose an effect to apply</span>';
    }

    const ruler = $('ruler');
    ruler.innerHTML = '';

    const seconds = Math.ceil(totalDuration() + 3);
    const interval = Math.max(1, Math.round(80 / pxPerSec));

    for (let second = 0; second <= seconds; second += interval) {
      const tick = document.createElement('span');

      tick.className = 'ruler-tick';
      tick.style.left = (second * pxPerSec) + 'px';
      tick.textContent = fmt(second);

      ruler.append(tick);
    }

    $('playhead').style.left =
      (100 + state.playhead * pxPerSec) + 'px';

    $('clipCount').textContent =
      state.clips.length + ' clip' +
      (state.clips.length === 1 ? '' : 's');

    $('durationTime').textContent = fmt(totalDuration());
    $('currentTime').textContent = fmt(state.playhead);

    const clip = selectedClip();

    $('timelineStatus').textContent = clip
      ? 'Selected: ' + clip.name
      : selectedText()
        ? 'Selected text overlay'
        : 'Select a clip to edit it.';

    updateUndoRedo();
  }

  function selectClip(id) {
    state.selectedId = id;

    renderTimeline();
    syncSelectedProperties();

    const clip = selectedClip();

    if (clip) {
      showPanel(clip.type === 'audio' ? 'audio' : 'media');
    }
  }

  function syncSelectedProperties() {
    const clip = selectedClip();

    $('timelineStatus').textContent = clip
      ? 'Selected: ' + clip.name
      : 'Select a clip to edit it.';

    if (clip && clip.type !== 'audio') {
      loadPreview(clip);
    }
  }

  // ==========================================
  // PREVIEW MONITOR
  // ==========================================

  function loadPreview(clip) {
    const media = mediaById(clip.mediaId);
    if (!media) return;

    activeMediaId = media.id;

    $('emptyState').classList.add('hidden');

    preview.style.display = 'none';
    photo.style.display = 'none';

    if (media.type === 'video') {
      if (preview.src !== media.url) {
        preview.pause();
        preview.src = media.url;
        preview.load();
      }

      preview.style.display = 'block';
      preview.playbackRate = clip.speed || 1;
      preview.volume = Number(clip.volume ?? 1);

      try {
        preview.currentTime = Math.min(
          clip.start || 0,
          Math.max(0, (media.duration || 1) - 0.05)
        );
      } catch (error) {}
    } else if (media.type === 'image') {
      photo.src = media.url;
      photo.style.display = 'block';
    }

    applyPreviewStyle();
    updateOverlay();

    $('previewStatus').textContent =
      media.type === 'image' ? 'Photo selected' : 'Video selected';
  }

  function applyPreviewStyle() {
    const filter =
      `brightness(${state.brightness}%) ` +
      `contrast(${state.contrast}%) ` +
      `grayscale(${state.grayscale}%)`;

    preview.style.filter = filter;
    photo.style.filter = filter;

    const rotation = `rotate(${state.rotation}deg)`;

    preview.style.transform = rotation;
    photo.style.transform = rotation;
  }

  function setPlayhead(time, updateMedia = false) {
    state.playhead = Math.max(
      0,
      Math.min(totalDuration(), Number(time) || 0)
    );

    if (updateMedia) {
      const clip = currentClipAt(state.playhead);

      if (clip) {
        if (clip.id !== state.selectedId) {
          state.selectedId = clip.id;
          renderTimeline();
          syncSelectedProperties();
        }

        const media = mediaById(clip.mediaId);

        if (media && media.type === 'video' && preview.src === media.url) {
          const localTime = state.playhead - clipStartAt(clip.id);

          try {
            preview.currentTime = Math.min(
              (clip.start || 0) + localTime * (clip.speed || 1),
              Math.max(0, (media.duration || 1) - 0.05)
            );
          } catch (error) {}
        }
      }
    }

    $('currentTime').textContent = fmt(state.playhead);

    $('playhead').style.left =
      (100 + state.playhead * (state.zoom / 5)) + 'px';

    updateOverlay();
  }

  function updateOverlay() {
    const item = state.textItems.find(text =>
      state.playhead >= text.start &&
      state.playhead <= text.start + text.duration
    );

    overlay.textContent = item ? item.text : '';

    overlay.style.color = item ? item.color : '#ffffff';
    overlay.style.fontSize = (item ? item.size : 32) + 'px';

    overlay.style.alignItems =
      item && item.position === 'top'
        ? 'flex-start'
        : item && item.position === 'bottom'
          ? 'flex-end'
          : 'center';

    overlay.style.paddingTop =
      item && item.position === 'top' ? '8%' : '5%';

    overlay.style.paddingBottom =
      item && item.position === 'bottom' ? '8%' : '5%';
  }

  // ==========================================
  // EDITING PANELS
  // ==========================================

  function showPanel(name) {
    state.currentPanel = name;

    document.querySelectorAll('.tool[data-panel]').forEach(button => {
      button.classList.toggle('active', button.dataset.panel === name);
    });

    const titles = {
      media: 'Media Library',
      text: 'Text & Captions',
      audio: 'Audio Tools',
      effects: 'Effects',
      filters: 'Filters',
      stickers: 'Stickers',
      captions: 'Captions',
      transitions: 'Transitions',
      settings: 'Project Settings'
    };

    $('panelTitle').textContent = titles[name] || 'Settings';

    renderPanel(name);
  }

  function panelField(label, control) {
    const wrapper = document.createElement('label');
    wrapper.className = 'field';

    const title = document.createElement('span');
    title.textContent = label;

    wrapper.append(title);

    const template = document.createElement('template');
    template.innerHTML = control.trim();

    wrapper.append(template.content.cloneNode(true));

    return wrapper;
  }

  function addPanelField(grid, label, control) {
    grid.append(panelField(label, control));
  }

  function renderPanel(name) {
    const box = $('panelContent');

    box.innerHTML = '';

    if (name === 'media') {
      const toolbar = document.createElement('div');
      toolbar.className = 'media-toolbar';

      const message = document.createElement('p');
      message.className = 'muted';
      message.textContent =
        'Import videos, photos, and audio files from your device.';

      const label = document.createElement('label');
      label.className = 'btn btn-primary file-button';
      label.append(document.createTextNode('＋ Import media'));

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*,image/*,audio/*';
      input.multiple = true;

      input.onchange = event => importFiles(event.target.files);

      label.append(input);
      toolbar.append(message, label);

      const list = document.createElement('div');
      list.id = 'mediaList';
      list.className = 'media-list';

      box.append(toolbar, list);

      renderMedia();
      return;
    }

    if (name === 'text' || name === 'captions') {
      const grid = document.createElement('div');
      grid.className = 'panel-grid';

      addPanelField(grid, 'Text',
        '<textarea id="textInput" placeholder="Type your title or caption..."></textarea>');

      addPanelField(grid, 'Text colour',
        '<input id="textColor" type="color" value="#ffffff">');

      addPanelField(grid, 'Font size',
        '<input id="textSize" type="range" min="14" max="72" value="32">');

      addPanelField(grid, 'Position',
        '<select id="textPosition">' +
        '<option value="center">Center</option>' +
        '<option value="top">Top</option>' +
        '<option value="bottom">Bottom</option></select>');

      addPanelField(grid, 'Duration (seconds)',
        '<input id="textDuration" type="number" min="1" max="120" value="3">');

      const actions = document.createElement('div');
      actions.className = 'panel-actions';

      const addButton = document.createElement('button');
      addButton.className = 'btn btn-primary';
      addButton.textContent = '＋ Add text';
      addButton.type = 'button';
      addButton.onclick = addText;

      const updateButton = document.createElement('button');
      updateButton.className = 'btn btn-quiet';
      updateButton.textContent = 'Update selected text';
      updateButton.type = 'button';
      updateButton.onclick = updateText;

      actions.append(addButton, updateButton);

      box.append(grid, actions);
      return;
    }

    if (name === 'audio') {
      const message = document.createElement('p');
      message.className = 'muted';
      message.textContent =
        'Import audio and use the plus button to add it to the timeline.';

      const grid = document.createElement('div');
      grid.className = 'panel-grid';

      addPanelField(grid, 'Selected clip volume',
        '<input id="audioVolume" type="range" min="0" max="1" step=".05" value="1">');

      addPanelField(grid, 'Playback speed',
        '<select id="audioSpeed">' +
        '<option value=".5">0.5×</option>' +
        '<option value=".75">0.75×</option>' +
        '<option value="1" selected>1×</option>' +
        '<option value="1.25">1.25×</option>' +
        '<option value="1.5">1.5×</option>' +
        '<option value="2">2×</option></select>');

      const actions = document.createElement('div');
      actions.className = 'panel-actions';

      const label = document.createElement('label');
      label.className = 'btn btn-primary file-button';
      label.append(document.createTextNode('＋ Import audio'));

      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';
      input.multiple = true;
      input.onchange = event => importFiles(event.target.files);

      label.append(input);
      actions.append(label);

      box.append(message, grid, actions);

      $('audioVolume').oninput = event => {
        const clip = selectedClip();

        if (!clip) return;

        clip.volume = Number(event.target.value);

        if (clip.type === 'video') {
          preview.volume = clip.volume;
        }
      };

      $('audioSpeed').onchange = event => {
        const clip = selectedClip();

        if (!clip) return;

        clip.speed = Number(event.target.value);

        if (clip.type === 'video') {
          preview.playbackRate = clip.speed;
        }
      };

      return;
    }

    if (name === 'effects' || name === 'filters') {
      const grid = document.createElement('div');
      grid.className = 'panel-grid';

      addPanelField(grid, 'Effect / filter',
        '<select id="effectChoice">' +
        '<option value="none">None</option>' +
        '<option value="cinema">Cinematic</option>' +
        '<option value="vivid">Vivid</option>' +
        '<option value="mono">Monochrome</option>' +
        '<option value="warm">Warm tone</option>' +
        '<option value="cool">Cool tone</option>' +
        '<option value="blur">Soft blur</option></select>');

      addPanelField(grid, 'Intensity',
        '<input id="effectIntensity" type="range" min="0" max="100" value="50">');

      const actions = document.createElement('div');
      actions.className = 'panel-actions';

      const apply = document.createElement('button');
      apply.className = 'btn btn-primary';
      apply.textContent = 'Apply effect';
      apply.onclick = applyEffect;

      const reset = document.createElement('button');
      reset.className = 'btn btn-quiet';
      reset.textContent = 'Reset adjustments';

      reset.onclick = () => {
        snapshot();

        state.brightness = 100;
        state.contrast = 100;
        state.grayscale = 0;
        state.effects = [];

        applyPreviewStyle();
        renderTimeline();

        toast('Adjustments reset.');
      };

      actions.append(apply, reset);
      box.append(grid, actions);

      return;
    }

    if (name === 'stickers') {
      const message = document.createElement('p');
      message.className = 'muted';
      message.textContent = 'Add stickers to your video overlay.';

      const actions = document.createElement('div');
      actions.className = 'panel-actions';

      ['⭐', '❤️', '✨', '🔥', '🎉', '😊', '⚡', '🌈'].forEach(sticker => {
        const button = document.createElement('button');

        button.className = 'mini-tool';
        button.type = 'button';
        button.textContent = sticker;

        button.onclick = () => {
          snapshot();

          const item = {
            id: makeId(),
            text: sticker,
            color: '#ffffff',
            size: 42,
            position: 'center',
            start: state.playhead,
            duration: 3
          };

          state.textItems.push(item);
          state.selectedId = item.id;

          renderTimeline();
          updateOverlay();

          toast('Sticker added.');
        };

        actions.append(button);
      });

      box.append(message, actions);
      return;
    }

    if (name === 'transitions') {
      const message = document.createElement('p');
      message.className = 'muted';
      message.textContent =
        'Arrange clips in sequence. Advanced transition rendering is not implemented in this version.';

      box.append(message);
      return;
    }

    if (name === 'settings') {
      const grid = document.createElement('div');
      grid.className = 'panel-grid';

      addPanelField(grid, 'Project name',
        '<input id="projectTitleInput" type="text">');

      addPanelField(grid, 'Preview aspect ratio',
        '<select id="panelAspect">' +
        '<option value="16:9">16:9</option>' +
        '<option value="9:16">9:16</option>' +
        '<option value="1:1">1:1</option>' +
        '<option value="4:5">4:5</option></select>');

      const titleInput = $('projectTitleInput');
      titleInput.value = $('projectName').textContent;

      const aspectInput = $('panelAspect');
      aspectInput.value = $('aspect').value;

      const actions = document.createElement('div');
      actions.className = 'panel-actions';

      const apply = document.createElement('button');
      apply.className = 'btn btn-primary';
      apply.textContent = 'Apply settings';

      apply.onclick = () => {
        $('projectName').textContent =
          titleInput.value.trim() || 'Untitled Project';

        $('aspect').value = aspectInput.value;

        setAspect();
        toast('Project settings updated.');
      };

      const open = document.createElement('button');
      open.className = 'btn btn-quiet';
      open.textContent = 'Open project JSON';
      open.onclick = () => $('projectOpenInput').click();

      actions.append(apply, open);
      box.append(grid, actions);

      return;
    }
  }

  // ==========================================
  // TEXT OVERLAYS
  // ==========================================

  function populateTextPanel(item) {
    showPanel('text');

    $('textInput').value = item.text;
    $('textColor').value = item.color;
    $('textSize').value = item.size;
    $('textPosition').value = item.position;
    $('textDuration').value = item.duration;
  }

  function addText() {
    const text = $('textInput').value.trim();

    if (!text) {
      toast('Type some text first.');
      return;
    }

    snapshot();

    const item = {
      id: makeId(),
      text,
      color: $('textColor').value,
      size: Number($('textSize').value),
      position: $('textPosition').value,
      start: state.playhead,
      duration: Math.max(1, Number($('textDuration').value) || 3)
    };

    state.textItems.push(item);
    state.selectedId = item.id;

    renderTimeline();
    updateOverlay();

    toast('Text overlay added.');
  }

  function updateText() {
    const item = selectedText();

    if (!item) {
      toast('Select a text overlay first.');
      return;
    }

    const text = $('textInput').value.trim();

    if (!text) {
      toast('Type some text first.');
      return;
    }

    snapshot();

    Object.assign(item, {
      text,
      color: $('textColor').value,
      size: Number($('textSize').value),
      position: $('textPosition').value,
      duration: Math.max(1, Number($('textDuration').value) || 3)
    });

    renderTimeline();
    updateOverlay();

    toast('Text overlay updated.');
  }

  // ==========================================
  // FILTERS AND EFFECTS
  // ==========================================

  function applyEffect() {
    const choice = $('effectChoice').value;
    const intensity = Number($('effectIntensity').value) / 100;

    snapshot();

    if (choice === 'none') {
      state.brightness = 100;
      state.contrast = 100;
      state.grayscale = 0;
    }

    if (choice === 'cinema') {
      state.contrast = 100 + intensity * 35;
      state.brightness = 100 - intensity * 8;
      state.grayscale = 0;
    }

    if (choice === 'vivid') {
      state.contrast = 100 + intensity * 25;
      state.brightness = 100 + intensity * 8;
      state.grayscale = 0;
    }

    if (choice === 'mono') {
      state.grayscale = 100 * intensity;
    }

    if (choice === 'warm') {
      state.brightness = 100 + intensity * 7;
      state.contrast = 100 + intensity * 4;
      state.grayscale = 0;
    }

    if (choice === 'cool') {
      state.contrast = 100 + intensity * 10;
      state.grayscale = 0;
    }

    if (choice === 'blur') {
      state.effects = state.effects.filter(effect => effect.name !== 'Blur');
      state.effects.push({
        id: makeId(),
        name: 'Blur',
        intensity
      });
    } else if (choice !== 'none') {
      state.effects.push({
        id: makeId(),
        name: choice[0].toUpperCase() + choice.slice(1),
        intensity
      });
    }

    applyPreviewStyle();
    renderTimeline();

    toast('Effect applied to preview.');
  }

  function setAspect() {
    const ratio = {
      '16:9': '16 / 9',
      '9:16': '9 / 16',
      '1:1': '1 / 1',
      '4:5': '4 / 5'
    }[$('aspect').value] || '16 / 9';

    $('stage').style.aspectRatio = ratio;
  }

  // ==========================================
  // PLAYBACK
  // ==========================================

  function pausePlayback() {
    state.playing = false;

    preview.pause();

    clearInterval(playbackTimer);
    playbackTimer = null;

    $('playBtn').textContent = '▶';
    $('playBtn').setAttribute('aria-label', 'Play');
  }

  function playPlayback() {
    if (!state.clips.length) {
      toast('Import media before playing.');
      return;
    }

    state.playing = true;

    $('playBtn').textContent = 'Ⅱ';
    $('playBtn').setAttribute('aria-label', 'Pause');

    let last = performance.now();

    playbackTimer = setInterval(() => {
      if (!state.playing) return;

      const now = performance.now();
      state.playhead += (now - last) / 1000;
      last = now;

      if (state.playhead >= totalDuration()) {
        state.playhead = 0;
      }

      setPlayhead(state.playhead, true);

      const clip = currentClipAt(state.playhead);
      const media = clip && mediaById(clip.mediaId);

      if (media && media.type === 'video') {
        if (preview.paused) preview.play().catch(() => {});
      } else {
        preview.pause();
      }

      updateOverlay();

    }, 100);
  }

  function togglePlayback() {
    if (state.playing) pausePlayback();
    else playPlayback();
  }

  // ==========================================
  // CLIP TOOLS
  // ==========================================

  function splitSelected() {
    const clip = selectedClip();

    if (!clip) {
      toast('Select a clip first.');
      return;
    }

    const start = clipStartAt(clip.id);
    const local = state.playhead - start;

    if (local < 0.25 || clip.duration - local < 0.25) {
      toast('Move the playhead inside the selected clip to split it.');
      return;
    }

    snapshot();

    const second = {
      ...clip,
      id: makeId(),
      name: clip.name + ' (split)',
      duration: clip.duration - local,
      start: (clip.start || 0) + local
    };

    clip.duration = local;
    clip.end = (clip.start || 0) + local;

    state.clips.splice(
      state.clips.indexOf(clip) + 1,
      0,
      second
    );

    renderTimeline();
    toast('Clip split.');
  }

  function deleteSelected() {
    const id = state.selectedId;

    if (!id) {
      toast('Select a clip or overlay first.');
      return;
    }

    snapshot();

    state.clips = state.clips.filter(clip => clip.id !== id);
    state.textItems = state.textItems.filter(item => item.id !== id);

    state.selectedId = null;

    renderTimeline();
    updateOverlay();

    toast('Selected item deleted.');
  }

  function duplicateSelected() {
    const clip = selectedClip();

    if (clip) {
      snapshot();

      const copy = {
        ...clip,
        id: makeId(),
        name: clip.name + ' copy'
      };

      state.clips.splice(state.clips.indexOf(clip) + 1, 0, copy);
      state.selectedId = copy.id;

      renderTimeline();

      toast('Clip duplicated.');
      return;
    }

    const item = selectedText();

    if (item) {
      snapshot();

      const copy = {
        ...item,
        id: makeId(),
        start: item.start + item.duration
      };

      state.textItems.push(copy);
      state.selectedId = copy.id;

      renderTimeline();

      toast('Text overlay duplicated.');
      return;
    }

    toast('Select a clip or text overlay first.');
  }

  function changeSpeed() {
    const clip = selectedClip();

    if (!clip) {
      toast('Select a clip first.');
      return;
    }

    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const current = speeds.indexOf(clip.speed || 1);
    const next = speeds[(current + 1) % speeds.length];

    snapshot();

    clip.speed = next;

    if (clip.type === 'video') {
      preview.playbackRate = next;
    }

    toast('Speed set to ' + next + '×.');
  }

  function rotateSelected() {
    snapshot();

    state.rotation = (state.rotation + 90) % 360;

    applyPreviewStyle();

    toast('Preview rotated ' + state.rotation + '°.');
  }

  function adjustSelected() {
    showPanel('effects');
  }

  function trimSelected() {
    const clip = selectedClip();

    if (!clip) {
      toast('Select a clip first.');
      return;
    }

    const value = prompt(
      'Set clip duration in seconds:',
      String(Math.max(1, Math.round(clip.duration)))
    );

    if (value === null) return;

    const duration = Number(value);

    if (!Number.isFinite(duration) || duration <= 0) {
      toast('Enter a valid duration.');
      return;
    }

    snapshot();

    clip.duration = Math.min(duration, 3600);
    clip.end = (clip.start || 0) + clip.duration;

    renderTimeline();

    toast('Clip duration updated.');
  }

  function cropSelected() {
    const clip = selectedClip();

    if (!clip) {
      toast('Select a clip before cropping.');
      return;
    }

    const stage = $('stage');

    stage.classList.toggle('crop-preview');

    toast('Use the aspect ratio selector to change the frame shape.');
  }

  // ==========================================
  // SAVE AND OPEN PROJECT
  // ==========================================

  function saveProject() {
    const project = {
      app: 'VITALSTAR VE PRO',
      version: 2,
      projectName: $('projectName').textContent,
      aspect: $('aspect').value,
      brightness: state.brightness,
      contrast: state.contrast,
      grayscale: state.grayscale,
      rotation: state.rotation,
      clips: state.clips,
      textItems: state.textItems,
      effects: state.effects,

      media: state.media.map(media => ({
        id: media.id,
        name: media.name,
        type: media.type,
        size: media.size,
        mime: media.mime,
        duration: media.duration
      })),

      savedAt: new Date().toISOString()
    };

    const blob = new Blob(
      [JSON.stringify(project, null, 2)],
      { type: 'application/json' }
    );

    downloadBlob(
      blob,
      (project.projectName || 'vitalstar-project')
        .replace(/[^a-z0-9-_]+/gi, '-') + '.json'
    );

    toast('Project saved as JSON.');
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;

    document.body.append(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function openProject(file) {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);

        if (!data || !Array.isArray(data.clips)) {
          throw new Error('Invalid project');
        }

        state.clips = data.clips;
        state.textItems = data.textItems || [];
        state.effects = data.effects || [];

        state.brightness = data.brightness ?? 100;
        state.contrast = data.contrast ?? 100;
        state.grayscale = data.grayscale ?? 0;
        state.rotation = data.rotation ?? 0;

        $('projectName').textContent =
          data.projectName || 'Imported Project';

        $('aspect').value = data.aspect || '16:9';

        setAspect();

        state.selectedId = null;
        state.history = [];
        state.future = [];

        renderTimeline();
        applyPreviewStyle();

        toast('Project opened. Re-import the original media files to preview it.');

      } catch (error) {
        toast('Invalid VITALSTAR project file.');
      }
    };

    reader.readAsText(file);
  }

  // ==========================================
  // VIDEO EXPORT — WEBM
  // ==========================================

  async function exportVideo() {
    const visualClips = state.clips.filter(clip =>
      clip.type === 'video' || clip.type === 'image'
    );

    if (!visualClips.length) {
      toast('Add a video or photo before exporting.');
      return;
    }

    if (
      !window.MediaRecorder ||
      !HTMLCanvasElement.prototype.captureStream
    ) {
      toast('WebM export is unsupported in this browser.');
      return;
    }

    const mimeType = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ].find(type => MediaRecorder.isTypeSupported(type));

    if (!mimeType) {
      toast('No supported WebM export format found.');
      return;
    }

    const aspect = $('aspect').value;

    let width = 720;
    let height = 405;

    if (aspect === '9:16') {
      width = 405;
      height = 720;
    } else if (aspect === '1:1') {
      width = 600;
      height = 600;
    } else if (aspect === '4:5') {
      width = 576;
      height = 720;
    }

    const canvas = document.createElement('canvas');

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    const stream = canvas.captureStream(24);

    let recorder;

    try {
      recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4000000
      });
    } catch (error) {
      stream.getTracks().forEach(track => track.stop());
      toast('Could not initialize video export.');
      return;
    }

    const chunks = [];

    recorder.ondataavailable = event => {
      if (event.data && event.data.size) {
        chunks.push(event.data);
      }
    };

    const finished = new Promise((resolve, reject) => {
      recorder.onstop = resolve;
      recorder.onerror = () => reject(new Error('Recorder error'));
    });

    const buttons = [
      $('exportBtn'),
      $('exportBottom')
    ];

    buttons.forEach(button => {
      if (button) button.disabled = true;
    });

    state.exportCancelled = false;

    const total = visualClips.reduce(
      (sum, clip) => sum + clip.duration,
      0
    );

    let elapsed = 0;

    function drawBackground() {
      ctx.fillStyle = '#05070b';
      ctx.fillRect(0, 0, width, height);
    }

    function drawImageContain(image) {
      const scale = Math.min(
        width / image.width,
        height / image.height
      );

      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;

      ctx.drawImage(
        image,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight
      );
    }

    function drawText(time) {
      const item = state.textItems.find(text =>
        time >= text.start &&
        time <= text.start + text.duration
      );

      if (!item) return;

      ctx.save();

      ctx.fillStyle = item.color || '#ffffff';

      ctx.font = `bold ${Math.min(64, item.size || 32)}px sans-serif`;

      ctx.textAlign = 'center';

      ctx.textBaseline =
        item.position === 'top'
          ? 'top'
          : item.position === 'bottom'
            ? 'bottom'
            : 'middle';

      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;

      const y =
        item.position === 'top'
          ? 35
          : item.position === 'bottom'
            ? height - 35
            : height / 2;

      ctx.fillText(
        item.text.slice(0, 120),
        width / 2,
        y,
        width * 0.9
      );

      ctx.restore();
    }

    async function wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    try {
      recorder.start(250);

      $('previewStatus').textContent = 'Exporting WebM…';

      for (const clip of visualClips) {
        if (state.exportCancelled) break;

        const media = mediaById(clip.mediaId);

        if (!media) continue;

        const start = performance.now();

        if (media.type === 'image') {
          const image = new Image();

          image.src = media.url;

          await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = () => reject(
              new Error('Could not load ' + media.name)
            );
          });

          while (
            (performance.now() - start) / 1000 < clip.duration &&
            !state.exportCancelled
          ) {
            drawBackground();

            ctx.save();

            ctx.filter =
              `brightness(${state.brightness}%) ` +
              `contrast(${state.contrast}%) ` +
              `grayscale(${state.grayscale}%)`;

            drawImageContain(image);

            ctx.restore();

            drawText(elapsed + (performance.now() - start) / 1000);

            await wait(40);
          }

        } else {
          const video = document.createElement('video');

          video.src = media.url;
          video.muted = true;
          video.playsInline = true;
          video.preload = 'auto';

          await new Promise((resolve, reject) => {
            video.onloadedmetadata = resolve;
            video.onerror = () => reject(
              new Error('Could not load ' + media.name)
            );
          });

          const sourceStart = Math.max(0, clip.start || 0);

          await new Promise(resolve => {
            video.onseeked = resolve;

            try {
              video.currentTime = sourceStart;
            } catch (error) {
              resolve();
            }
          });

          await new Promise(resolve => {
            if (video.readyState >= 2) {
              resolve();
            } else {
              video.oncanplay = resolve;
            }
          });

          video.playbackRate = clip.speed || 1;

          await video.play().catch(() => {});

          while (
            (performance.now() - start) / 1000 < clip.duration &&
            !video.ended &&
            !state.exportCancelled
          ) {
            drawBackground();

            if (video.videoWidth && video.videoHeight) {
              const scale = Math.min(
                width / video.videoWidth,
                height / video.videoHeight
              );

              const drawWidth = video.videoWidth * scale;
              const drawHeight = video.videoHeight * scale;

              ctx.save();

              ctx.translate(width / 2, height / 2);

              ctx.rotate(
                (clip.rotation || state.rotation) * Math.PI / 180
              );

              ctx.filter =
                `brightness(${state.brightness}%) ` +
                `contrast(${state.contrast}%) ` +
                `grayscale(${state.grayscale}%)`;

              ctx.drawImage(
                video,
                -drawWidth / 2,
                -drawHeight / 2,
                drawWidth,
                drawHeight
              );

              ctx.restore();
            }

            drawText(elapsed + (performance.now() - start) / 1000);

            await wait(40);
          }

          video.pause();
          video.remove();
        }

        elapsed += clip.duration;
      }

      if (recorder.state !== 'inactive') {
        recorder.stop();
      }

      await finished;

      if (chunks.length) {
        const blob = new Blob(chunks, {
          type: mimeType
        });

        downloadBlob(
          blob,
          ($('projectName').textContent || 'vitalstar-video')
            .replace(/[^a-z0-9-_]+/gi, '-') + '.webm'
        );

        toast(
          state.exportCancelled
            ? 'Export stopped. Partial video downloaded.'
            : 'Video exported successfully as WebM.'
        );

      } else {
        toast('Export produced no video data.');
      }

    } catch (error) {
      try {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      } catch (ignored) {}

      toast('Export failed: ' + (error.message || 'browser error'));

    } finally {
      stream.getTracks().forEach(track => track.stop());

      buttons.forEach(button => {
        if (button) button.disabled = false;
      });

      $('previewStatus').textContent = 'Ready';
    }
  }

  // ==========================================
  // NEW PROJECT
  // ==========================================

  function newProject() {
    if (
      (state.clips.length || state.textItems.length) &&
      !confirm('Start a new project? Unsaved edits will be cleared.')
    ) {
      return;
    }

    pausePlayback();

    state.clips = [];
    state.textItems = [];
    state.effects = [];
    state.selectedId = null;
    state.playhead = 0;
    state.history = [];
    state.future = [];
    state.brightness = 100;
    state.contrast = 100;
    state.grayscale = 0;
    state.rotation = 0;

    $('projectName').textContent = 'Untitled Project';

    preview.removeAttribute('src');
    preview.load();
    preview.style.display = 'none';

    photo.removeAttribute('src');
    photo.style.display = 'none';

    overlay.textContent = '';

    $('emptyState').classList.remove('hidden');

    applyPreviewStyle();
    renderTimeline();

    toast('New project created.');
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================

  function bind() {
    $('mediaInput').addEventListener('change', event => {
      importFiles(event.target.files);
    });

    $('importFromEmpty').onclick = () => {
      $('mediaInput').click();
    };

    document.querySelectorAll('.tool[data-panel]').forEach(button => {
      button.onclick = () => showPanel(button.dataset.panel);
    });

    $('toggleTools').onclick = () => {
      const body = $('toolsBody');
      const hide = !body.classList.contains('hidden');

      body.classList.toggle('hidden', hide);

      $('toggleTools').textContent = hide ? 'Expand +' : 'Collapse −';

      $('toggleTools').setAttribute(
        'aria-expanded',
        String(!hide)
      );
    };

    $('collapsePanel').onclick = () => {
      const content = $('panelContent');

      content.classList.toggle('hidden');

      $('collapsePanel').textContent =
        content.classList.contains('hidden') ? '⌄' : '⌃';
    };

    $('playBtn').onclick = togglePlayback;

    $('backFrame').onclick = () => {
      pausePlayback();
      setPlayhead(Math.max(0, state.playhead - 1), true);
    };

    $('forwardFrame').onclick = () => {
      pausePlayback();
      setPlayhead(Math.min(totalDuration(), state.playhead + 1), true);
    };

    $('aspect').onchange = setAspect;

    $('fullscreenBtn').onclick = () => {
      const stage = $('stage');

      if (!document.fullscreenElement && stage.requestFullscreen) {
        stage.requestFullscreen().catch(() => {
          toast('Fullscreen is not available here.');
        });
      } else if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    };

    $('splitBtn').onclick = splitSelected;
    $('deleteBtn').onclick = deleteSelected;
    $('duplicateBtn').onclick = duplicateSelected;
    $('speedTool').onclick = changeSpeed;
    $('rotateTool').onclick = rotateSelected;
    $('adjustTool').onclick = adjustSelected;
    $('cropTool').onclick = cropSelected;
    $('trimTool').onclick = trimSelected;

    $('undoBtn').onclick = undo;
    $('redoBtn').onclick = redo;

    $('zoomRange').oninput = event => {
      state.zoom = Number(event.target.value);
      renderTimeline();
    };

    $('zoomIn').onclick = () => {
      $('zoomRange').value = Math.min(
        180,
        Number($('zoomRange').value) + 10
      );

      state.zoom = Number($('zoomRange').value);
      renderTimeline();
    };

    $('zoomOut').onclick = () => {
      $('zoomRange').value = Math.max(
        40,
        Number($('zoomRange').value) - 10
      );

      state.zoom = Number($('zoomRange').value);
      renderTimeline();
    };

    $('saveProject').onclick = saveProject;
    $('saveProjectBottom').onclick = saveProject;

    $('exportBtn').onclick = exportVideo;
    $('exportBottom').onclick = exportVideo;

    $('newProject').onclick = newProject;

    $('projectOpenInput').onchange = event => {
      const file = event.target.files[0];

      if (file) openProject(file);

      event.target.value = '';
    };

    preview.addEventListener('timeupdate', () => {
      if (!state.playing && preview.duration) {
        $('previewStatus').textContent = 'Previewing';
      }
    });

    document.addEventListener('keydown', event => {
      if (event.target.matches('input, textarea, select')) return;

      if (event.code === 'Space') {
        event.preventDefault();
        togglePlayback();
      }

      if ((event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveProject();
      }

      if ((event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === 'z') {
        event.preventDefault();
        undo();
      }

      if ((event.ctrlKey || event.metaKey) &&
          event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
      }

      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelected();
      }
    });

    $('stage').addEventListener('click', event => {
      if (event.target.closest('button')) return;

      if (state.clips.length && !state.playing) {
        togglePlayback();
      }
    });
  }

  // ==========================================
  // INITIALIZE APP
  // ==========================================

  bind();
  renderMedia();
  renderTimeline();
  showPanel('media');
  setAspect();
  updateUndoRedo();

})();