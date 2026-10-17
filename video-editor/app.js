/* ==========================================================
   VITALSTAR VE PRO — VIDEO EDITOR ENGINE
   RexWeb Nexora
   Features:
   - Video, image and audio import
   - Timeline clip selection and playback
   - Split, delete, undo and redo
   - Playback speed control
   - Text overlays and animations
   - Brightness, contrast and grayscale
   - Rotation controls
   - Project save and restore
   - Responsive timeline and preview
   - Honest export status
   ========================================================== */

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];

  const STORAGE_KEY = "vitalstar_ve_pro_project_v2";

  const state = {
    media: [],
    clips: [],
    selectedClipId: null,
    currentPanel: "media",
    nextId: 1,
    zoom: 1,
    playing: false,
    history: [],
    historyIndex: -1,
    projectName: "My Video Project",
    playhead: 0,
    speed: 1,
    adjustments: {
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      rotation: 0
    },
    animationFrame: null,
    lastTick: 0,
    toastTimer: null,
    objectUrls: new Set()
  };

  const el = {
    newProject: $("#newProject"),
    saveProject: $("#saveProject"),
    exportBtn: $("#exportBtn"),
    projectName: $("#projectName"),
    aspect: $("#aspect"),

    mediaInput: $("#mediaInput"),
    mediaList: $("#mediaList"),
    panelTitle: $("#panelTitle"),
    panelContent: $("#panelContent"),

    stage: $("#stage"),
    preview: $("#preview"),
    photoPreview: $("#photoPreview"),
    emptyState: $("#emptyState"),
    textOverlay: $("#textOverlay"),

    backFrame: $("#backFrame"),
    playBtn: $("#playBtn"),
    forwardFrame: $("#forwardFrame"),
    timeReadout: $("#timeReadout"),
    undoBtn: $("#undoBtn"),
    redoBtn: $("#redoBtn"),

    splitBtn: $("#splitBtn"),
    deleteBtn: $("#deleteBtn"),
    zoomOut: $("#zoomOut"),
    zoomIn: $("#zoomIn"),
    zoomRange: $("#zoomRange"),

    videoTrack: $("#videoTrack"),
    textTrack: $("#textTrack"),
    audioTrack: $("#audioTrack"),
    ruler: $("#ruler"),
    playhead: $("#playhead"),
    clipCount: $("#clipCount"),
    currentTime: $("#currentTime"),

    toast: $("#toast")
  };

  const missing = Object.entries(el)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missing.length) {
    console.warn(
      "Vitalstar VE Pro: Some HTML elements were not found:",
      missing.join(", ")
    );
  }

  function notify(message, duration = 2600) {
    if (!el.toast) {
      console.log("[Vitalstar VE Pro]", message);
      return;
    }

    el.toast.textContent = message;
    el.toast.classList.add("show");

    clearTimeout(state.toastTimer);

    state.toastTimer = setTimeout(() => {
      el.toast.classList.remove("show");
    }, duration);
  }

  function makeId() {
    return state.nextId++;
  }

  function formatTime(seconds) {
    seconds = Math.max(0, Number(seconds) || 0);

    const minutes = Math.floor(seconds / 60);
    const remaining = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(remaining).padStart(2, "0") +
      "." +
      String(frames).padStart(2, "0")
    );
  }

  function getSelectedClip() {
    return state.clips.find(
      (clip) => clip.id === state.selectedClipId
    ) || null;
  }

  function getMedia(mediaId) {
    return state.media.find((item) => item.id === mediaId) || null;
  }

  function getClipDuration(clip) {
    return Math.max(0.1, (clip.end || 0) - (clip.start || 0));
  }

  function getTimelineDuration() {
    if (!state.clips.length) return 0;

    return Math.max(
      0,
      ...state.clips.map((clip) => Number(clip.end) || 0)
    );
  }

  function createObjectUrl(file) {
    const url = URL.createObjectURL(file);
    state.objectUrls.add(url);
    return url;
  }

  function revokeObjectUrl(url) {
    if (!url || !state.objectUrls.has(url)) return;

    URL.revokeObjectURL(url);
    state.objectUrls.delete(url);
  }

  function captureSnapshot() {
    return JSON.stringify({
      clips: state.clips,
      selectedClipId: state.selectedClipId,
      nextId: state.nextId,
      projectName: state.projectName,
      adjustments: state.adjustments,
      speed: state.speed
    });
  }

  function saveHistory() {
    const snapshot = captureSnapshot();

    if (
      state.history[state.historyIndex] === snapshot
    ) {
      return;
    }

    state.history = state.history.slice(
      0,
      state.historyIndex + 1
    );

    state.history.push(snapshot);

    if (state.history.length > 60) {
      state.history.shift();
    }

    state.historyIndex = state.history.length - 1;

    updateUndoRedoButtons();
  }

  function restoreSnapshot(snapshot) {
    try {
      const data = JSON.parse(snapshot);

      state.clips = Array.isArray(data.clips)
        ? data.clips
        : [];

      state.selectedClipId = data.selectedClipId ?? null;
      state.nextId = Math.max(
        Number(data.nextId) || 1,
        state.nextId
      );

      state.projectName =
        data.projectName || "My Video Project";

      state.adjustments = {
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        rotation: 0,
        ...(data.adjustments || {})
      };

      state.speed = Number(data.speed) || 1;

      if (el.projectName) {
        el.projectName.textContent = state.projectName;
      }

      renderTimeline();
      updatePreview();
      applyAdjustments();
      updateUndoRedoButtons();
    } catch (error) {
      console.error("Could not restore edit history:", error);
    }
  }

  function updateUndoRedoButtons() {
    if (el.undoBtn) {
      el.undoBtn.disabled = state.historyIndex <= 0;
    }

    if (el.redoBtn) {
      el.redoBtn.disabled =
        state.historyIndex >= state.history.length - 1;
    }
  }

  function undo() {
    if (state.historyIndex <= 0) {
      notify("Nothing to undo.");
      return;
    }

    state.historyIndex--;
    restoreSnapshot(state.history[state.historyIndex]);
    notify("Undo successful.");
  }

  function redo() {
    if (state.historyIndex >= state.history.length - 1) {
      notify("Nothing to redo.");
      return;
    }

    state.historyIndex++;
    restoreSnapshot(state.history[state.historyIndex]);
    notify("Redo successful.");
  }

  /* ----------------------------------------------------------
     MEDIA IMPORT
     ---------------------------------------------------------- */

  function detectMediaType(file) {
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("audio/")) return "audio";

    return null;
  }

  function importFiles(fileList) {
    const files = [...fileList];

    if (!files.length) return;

    let imported = 0;

    for (const file of files) {
      const type = detectMediaType(file);

      if (!type) {
        continue;
      }

      const item = {
        id: makeId(),
        name: file.name,
        type,
        file,
        url: createObjectUrl(file),
        duration: type === "image" ? 5 : 0,
        size: file.size,
        mime: file.type
      };

      state.media.push(item);
      imported++;

      if (type === "video" || type === "audio") {
        readMediaDuration(item);
      }
    }

    renderMediaList();

    if (el.mediaInput) {
      el.mediaInput.value = "";
    }

    if (imported) {
      notify(
        `${imported} media file${imported === 1 ? "" : "s"} imported.`
      );

      switchPanel("media");
    } else {
      notify("Choose a supported video, image or audio file.");
    }
  }

  function readMediaDuration(item) {
    const probe = document.createElement(
      item.type === "audio" ? "audio" : "video"
    );

    probe.preload = "metadata";
    probe.src = item.url;

    probe.addEventListener(
      "loadedmetadata",
      () => {
        if (
          Number.isFinite(probe.duration) &&
          probe.duration > 0
        ) {
          item.duration = probe.duration;
          renderMediaList();
        }

        probe.removeAttribute("src");
        probe.load();
      },
      { once: true }
    );

    probe.addEventListener(
      "error",
      () => {
        console.warn("Could not read media metadata:", item.name);
      },
      { once: true }
    );
  }

  function renderMediaList() {
    if (!el.mediaList) return;

    el.mediaList.innerHTML = "";

    if (!state.media.length) {
      const empty = document.createElement("div");
      empty.className = "empty-media";
      empty.textContent = "Import videos, photos or audio to begin.";
      el.mediaList.appendChild(empty);
      return;
    }

    state.media.forEach((item) => {
      const card = document.createElement("div");
      card.className = "media-item";
      card.dataset.mediaId = item.id;

      const icon = document.createElement("span");
      icon.className = "media-icon";
      icon.textContent =
        item.type === "video"
          ? "🎬"
          : item.type === "image"
            ? "🖼️"
            : "🎵";

      const info = document.createElement("div");
      info.className = "media-info";

      const name = document.createElement("div");
      name.className = "media-name";
      name.textContent = item.name;
      name.title = item.name;

      const meta = document.createElement("small");
      meta.textContent =
        item.type.toUpperCase() +
        (item.duration ? ` • ${formatTime(item.duration)}` : "");

      info.append(name, meta);

      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "media-add";
      addButton.textContent = "+";
      addButton.title = "Add to timeline";

      addButton.addEventListener("click", () => {
        addMediaToTimeline(item.id);
      });

      card.append(icon, info, addButton);

      card.addEventListener("dblclick", () => {
        addMediaToTimeline(item.id);
      });

      el.mediaList.appendChild(card);
    });
  }

  /* ----------------------------------------------------------
     TIMELINE
     ---------------------------------------------------------- */

  function addMediaToTimeline(mediaId) {
    const item = getMedia(mediaId);

    if (!item) {
      notify("Media file not found.");
      return;
    }

    const duration =
      item.type === "image"
        ? 5
        : Math.max(0.1, Number(item.duration) || 5);

    const start = getTimelineDuration();

    const clip = {
      id: makeId(),
      mediaId: item.id,
      name: item.name,
      type: item.type,
      start,
      end: start + duration,
      duration,
      text: "",
      textColor: "#ffffff",
      textSize: 32,
      textAnimation: "none",
      volume: 1,
      muted: false,
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      rotation: 0
    };

    state.clips.push(clip);
    state.selectedClipId = clip.id;
    state.playhead = clip.start;

    saveHistory();
    renderTimeline();
    updatePreview();
    renderSelectedClipProperties();

    notify("Clip added to timeline.");
  }

  function selectClip(clipId) {
    const clip = state.clips.find(
      (item) => item.id === Number(clipId)
    );

    if (!clip) return;

    state.selectedClipId = clip.id;
    state.playhead = clip.start;

    renderTimeline();
    updatePreview();
    renderSelectedClipProperties();
  }

  function deleteSelectedClip() {
    const clip = getSelectedClip();

    if (!clip) {
      notify("Select a timeline clip first.");
      return;
    }

    stopPlayback();

    state.clips = state.clips.filter(
      (item) => item.id !== clip.id
    );

    state.selectedClipId = null;

    saveHistory();
    renderTimeline();
    updatePreview();
    renderSelectedClipProperties();

    notify("Clip deleted.");
  }

  function splitSelectedClip() {
    const clip = getSelectedClip();

    if (!clip) {
      notify("Select a clip to split.");
      return;
    }

    const splitAt = state.playhead;

    if (
      splitAt <= clip.start + 0.05 ||
      splitAt >= clip.end - 0.05
    ) {
      notify("Move the playhead inside the selected clip first.");
      return;
    }

    const originalEnd = clip.end;

    const second = {
      ...clip,
      id: makeId(),
      name: clip.name,
      start: splitAt,
      end: originalEnd
    };

    clip.end = splitAt;

    state.clips.push(second);
    state.selectedClipId = second.id;

    saveHistory();
    renderTimeline();
    updatePreview();
    renderSelectedClipProperties();

    notify("Clip split successfully.");
  }

  function renderTimeline() {
    renderTrack(el.videoTrack, ["video", "image"]);
    renderTrack(el.textTrack, ["text"]);
    renderTrack(el.audioTrack, ["audio"]);

    renderRuler();
    updatePlayheadUI();

    if (el.clipCount) {
      el.clipCount.textContent =
        `${state.clips.length} clip${state.clips.length === 1 ? "" : "s"}`;
    }
  }

  function renderTrack(track, types) {
    if (!track) return;

    track.innerHTML = "";

    const clips = state.clips.filter((clip) => {
      if (types.includes("text")) {
        return clip.type !== "audio" && Boolean(clip.text);
      }

      return types.includes(clip.type);
    });

    if (!clips.length) {
      const empty = document.createElement("div");
      empty.className = "track-empty";
      empty.textContent =
        types.includes("audio")
          ? "Add audio here"
          : types.includes("text")
            ? "Text overlays appear here"
            : "Add video or images here";

      track.appendChild(empty);
      return;
    }

    clips.forEach((clip) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "timeline-clip";
      item.dataset.clipId = clip.id;

      if (clip.id === state.selectedClipId) {
        item.classList.add("selected");
      }

      const left = Math.max(0, clip.start * state.zoom * 30);
      const width = Math.max(
        48,
        getClipDuration(clip) * state.zoom * 30
      );

      item.style.position = "absolute";
      item.style.left = `${left}px`;
      item.style.width = `${width}px`;
      item.style.overflow = "hidden";

      const label = document.createElement("span");
      label.className = "clip-label";

      if (clip.type === "text") {
        label.textContent = `T: ${clip.text}`;
      } else {
        label.textContent = clip.name;
      }

      item.appendChild(label);

      item.addEventListener("click", (event) => {
        event.stopPropagation();
        selectClip(clip.id);
      });

      item.addEventListener("dblclick", (event) => {
        event.stopPropagation();
        selectClip(clip.id);
        renderSelectedClipProperties();
      });

      track.appendChild(item);
    });

    track.style.position = "relative";
    track.style.minWidth =
      `${Math.max(600, getTimelineDuration() * state.zoom * 30 + 100)}px`;
  }

  function renderRuler() {
    if (!el.ruler) return;

    el.ruler.innerHTML = "";

    const duration = Math.max(10, getTimelineDuration());
    const interval = duration > 120 ? 10 : duration > 60 ? 5 : 1;

    for (let seconds = 0; seconds <= duration; seconds += interval) {
      const tick = document.createElement("span");
      tick.className = "ruler-tick";
      tick.style.position = "absolute";
      tick.style.left = `${seconds * state.zoom * 30}px`;
      tick.textContent = `${seconds}s`;

      el.ruler.appendChild(tick);
    }

    el.ruler.style.position = "relative";
    el.ruler.style.minWidth =
      `${Math.max(600, duration * state.zoom * 30 + 100)}px`;
  }

  function updatePlayheadUI() {
    const position = state.playhead * state.zoom * 30;

    if (el.playhead) {
      el.playhead.style.left = `${position}px`;
    }

    if (el.currentTime) {
      el.currentTime.textContent = formatTime(state.playhead);
    }

    if (el.timeReadout) {
      el.timeReadout.textContent =
        `${formatTime(state.playhead)} / ${formatTime(getTimelineDuration())}`;
    }
  }

  function setZoom(value) {
    state.zoom = Math.min(4, Math.max(0.25, Number(value) || 1));

    if (el.zoomRange) {
      el.zoomRange.value = String(state.zoom);
    }

    renderTimeline();
  }

  /* ----------------------------------------------------------
     PREVIEW
     ---------------------------------------------------------- */

  function findClipAtTime(time) {
    return state.clips.find(
      (clip) => time >= clip.start && time < clip.end
    ) || null;
  }

  function updatePreview() {
    const clip = findClipAtTime(state.playhead);

    if (!clip) {
      if (el.preview) {
        el.preview.pause();
        el.preview.hidden = true;
      }

      if (el.photoPreview) {
        el.photoPreview.hidden = true;
      }

      if (el.emptyState) {
        el.emptyState.hidden = false;
      }

      if (el.textOverlay) {
        el.textOverlay.textContent = "";
        el.textOverlay.hidden = true;
      }

      updatePlayheadUI();
      return;
    }

    const item = getMedia(clip.mediaId);

    if (!item) {
      if (el.emptyState) {
        el.emptyState.hidden = false;
        el.emptyState.textContent =
          "This clip's original media is unavailable. Re-import the file.";
      }

      return;
    }

    if (el.emptyState) {
      el.emptyState.hidden = true;
    }

    if (clip.type === "video") {
      showVideo(item, clip);
    } else if (clip.type === "image") {
      showImage(item);
    } else if (clip.type === "audio") {
      if (el.emptyState) {
        el.emptyState.hidden = false;
        el.emptyState.textContent =
          "Audio clip selected. Audio playback is available while playing the timeline.";
      }
    }

    updateTextOverlay(clip);
    applyAdjustments(clip);
    updatePlayheadUI();
  }

  function showVideo(item, clip) {
    if (!el.preview) return;

    if (el.photoPreview) {
      el.photoPreview.hidden = true;
    }

    el.preview.hidden = false;

    if (el.preview.dataset.mediaId !== String(item.id)) {
      el.preview.pause();
      el.preview.src = item.url;
      el.preview.dataset.mediaId = String(item.id);
      el.preview.load();
    }

    const localTime = Math.max(
      0,
      state.playhead - clip.start
    );

    try {
      if (
        Math.abs(el.preview.currentTime - localTime) > 0.4
      ) {
        el.preview.currentTime = Math.min(
          localTime,
          Number.isFinite(el.preview.duration)
            ? Math.max(0, el.preview.duration - 0.05)
            : localTime
        );
      }
    } catch (_) {
      // Metadata may not have loaded yet.
    }

    el.preview.playbackRate = state.speed;
  }

  function showImage(item) {
    if (el.preview) {
      el.preview.pause();
      el.preview.hidden = true;
    }

    if (el.photoPreview) {
      el.photoPreview.src = item.url;
      el.photoPreview.hidden = false;
    }
  }

  function updateTextOverlay(clip) {
    if (!el.textOverlay) return;

    const text = clip.text || "";

    el.textOverlay.textContent = text;
    el.textOverlay.hidden = !text;

    el.textOverlay.style.color =
      clip.textColor || "#ffffff";

    el.textOverlay.style.fontSize =
      `${Math.max(10, Number(clip.textSize) || 32)}px`;

    el.textOverlay.style.animation = "none";
    el.textOverlay.classList.remove(
      "text-fade-in",
      "text-slide-in",
      "text-zoom-in",
      "text-bounce"
    );

    const animationClasses = {
      fade: "text-fade-in",
      slide: "text-slide-in",
      zoom: "text-zoom-in",
      bounce: "text-bounce"
    };

    const animationClass =
      animationClasses[clip.textAnimation];

    if (animationClass && text) {
      void el.textOverlay.offsetWidth;
      el.textOverlay.classList.add(animationClass);
    }
  }

  function applyAdjustments(clip = getSelectedClip()) {
    if (!el.stage) return;

    const brightness = clip
      ? Number(clip.brightness ?? state.adjustments.brightness)
      : state.adjustments.brightness;

    const contrast = clip
      ? Number(clip.contrast ?? state.adjustments.contrast)
      : state.adjustments.contrast;

    const grayscale = clip
      ? Number(clip.grayscale ?? state.adjustments.grayscale)
      : state.adjustments.grayscale;

    const rotation = clip
      ? Number(clip.rotation ?? state.adjustments.rotation)
      : state.adjustments.rotation;

    el.stage.style.filter =
      `brightness(${brightness}%) ` +
      `contrast(${contrast}%) ` +
      `grayscale(${grayscale}%)`;

    const media = el.preview && !el.preview.hidden
      ? el.preview
      : el.photoPreview;

    if (media) {
      media.style.transform = `rotate(${rotation}deg)`;
    }
  }

  /* ----------------------------------------------------------
     PLAYBACK
     ---------------------------------------------------------- */

  function setSpeed(speed) {
    state.speed = Math.max(
      0.25,
      Math.min(2, Number(speed) || 1)
    );

    if (el.preview) {
      el.preview.playbackRate = state.speed;
    }

    if (el.panelContent) {
      const control = $("#speedControl");
      if (control) control.value = String(state.speed);
    }

    saveHistory();
    notify(`Playback speed: ${state.speed}×`);
  }

  function togglePlayback() {
    if (state.playing) {
      stopPlayback();
    } else {
      startPlayback();
    }
  }

  function startPlayback() {
    if (!state.clips.length) {
      notify("Add a video or image to the timeline first.");
      return;
    }

    if (state.playhead >= getTimelineDuration()) {
      state.playhead = 0;
    }

    state.playing = true;
    state.lastTick = performance.now();

    if (el.playBtn) {
      el.playBtn.textContent = "❚❚";
      el.playBtn.setAttribute("aria-label", "Pause playback");
    }

    if (el.preview && !el.preview.hidden) {
      el.preview.playbackRate = state.speed;
      el.preview.play().catch(() => {
        // The timeline clock still operates if autoplay is blocked.
      });
    }

    state.animationFrame = requestAnimationFrame(playbackTick);
  }

  function stopPlayback() {
    state.playing = false;

    if (state.animationFrame) {
      cancelAnimationFrame(state.animationFrame);
      state.animationFrame = null;
    }

    if (el.preview) {
      el.preview.pause();
    }

    if (el.playBtn) {
      el.playBtn.textContent = "▶";
      el.playBtn.setAttribute("aria-label", "Play");
    }
  }

  function playbackTick(now) {
    if (!state.playing) return;

    const delta = Math.min(
      0.1,
      Math.max(0, (now - state.lastTick) / 1000)
    );

    state.lastTick = now;

    state.playhead += delta * state.speed;

    if (state.playhead >= getTimelineDuration()) {
      state.playhead = getTimelineDuration();
      updatePreview();
      stopPlayback();
      return;
    }

    const activeClip = findClipAtTime(state.playhead);
    const currentMedia = activeClip
      ? getMedia(activeClip.mediaId)
      : null;

    if (
      activeClip &&
      activeClip.type === "video" &&
      currentMedia &&
      el.preview &&
      el.preview.dataset.mediaId !== String(currentMedia.id)
    ) {
      updatePreview();

      if (state.playing) {
        el.preview.play().catch(() => {});
      }
    } else {
      updatePreview();
    }

    state.animationFrame = requestAnimationFrame(playbackTick);
  }

  function seek(seconds) {
    stopPlayback();

    const duration = getTimelineDuration();

    state.playhead = Math.max(
      0,
      Math.min(duration, state.playhead + seconds)
    );

    const clip = findClipAtTime(state.playhead);

    if (clip) {
      state.selectedClipId = clip.id;
    }

    updatePreview();
    renderTimeline();
    renderSelectedClipProperties();
  }

  /* ----------------------------------------------------------
     TEXT EDITING
     ---------------------------------------------------------- */

  function addText() {
    const text = prompt("Enter your text overlay:");

    if (text === null || !text.trim()) return;

    const clip = getSelectedClip();

    if (clip && clip.type !== "audio") {
      clip.text = text.trim();
      clip.textColor = clip.textColor || "#ffffff";
      clip.textSize = clip.textSize || 32;
      clip.textAnimation = clip.textAnimation || "none";

      saveHistory();
      renderTimeline();
      updatePreview();

      notify("Text overlay updated.");
      return;
    }

    const duration = 5;
    const start = state.playhead;

    const textClip = {
      id: makeId(),
      mediaId: null,
      name: "Text Overlay",
      type: "text",
      start,
      end: start + duration,
      duration,
      text: text.trim(),
      textColor: "#ffffff",
      textSize: 32,
      textAnimation: "none"
    };

    state.clips.push(textClip);
    state.selectedClipId = textClip.id;

    saveHistory();
    renderTimeline();
    updatePreview();
    renderSelectedClipProperties();

    notify("Text overlay added.");
  }

  function updateSelectedText(value) {
    const clip = getSelectedClip();

    if (!clip || clip.type === "audio") {
      notify("Select a video, image or text clip first.");
      return;
    }

    clip.text = value;

    saveHistory();
    renderTimeline();
    updatePreview();
  }

  /* ----------------------------------------------------------
     EFFECTS AND ADJUSTMENTS
     ---------------------------------------------------------- */

  function setAdjustment(name, value) {
    const clip = getSelectedClip();
    const numericValue = Number(value);

    if (clip && clip.type !== "audio") {
      clip[name] = numericValue;
    } else {
      state.adjustments[name] = numericValue;
    }

    saveHistory();
    applyAdjustments(clip);
  }

  function resetAdjustments() {
    state.adjustments = {
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      rotation: 0
    };

    const clip = getSelectedClip();

    if (clip && clip.type !== "audio") {
      clip.brightness = 100;
      clip.contrast = 100;
      clip.grayscale = 0;
      clip.rotation = 0;
    }

    saveHistory();
    applyAdjustments(clip);
    switchPanel("adjust");

    notify("Adjustments reset.");
  }

  function rotatePreview(degrees = 90) {
    const clip = getSelectedClip();

    if (clip && clip.type !== "audio") {
      clip.rotation = (
        (Number(clip.rotation) || 0) + degrees + 360
      ) % 360;
    } else {
      state.adjustments.rotation = (
        state.adjustments.rotation + degrees + 360
      ) % 360;
    }

    saveHistory();
    applyAdjustments(clip);
    notify("Preview rotation updated.");
  }

  function toggleGrayscale() {
    const clip = getSelectedClip();

    const current = clip
      ? Number(clip.grayscale) || 0
      : state.adjustments.grayscale;

    setAdjustment("grayscale", current === 100 ? 0 : 100);
  }

  /* ----------------------------------------------------------
     CLIP PROPERTIES
     ---------------------------------------------------------- */

  function renderSelectedClipProperties() {
    const host = $("#clipProperties");
    if (!host) return;

    host.innerHTML = "";

    const clip = getSelectedClip();

    if (!clip) {
      host.textContent = "Select a timeline clip to edit its properties.";
      return;
    }

    const heading = document.createElement("h3");
    heading.textContent = "Selected Clip";
    host.appendChild(heading);

    const name = document.createElement("p");
    name.textContent = clip.name;
    name.className = "selected-clip-name";
    host.appendChild(name);

    const makeLabel = (text, control) => {
      const label = document.createElement("label");
      label.className = "editor-field";
      label.append(document.createTextNode(text), control);
      host.appendChild(label);
    };

    if (clip.type !== "audio") {
      const textInput = document.createElement("textarea");
      textInput.value = clip.text || "";
      textInput.placeholder = "Type overlay text...";
      textInput.rows = 2;
      textInput.addEventListener("change", () => {
        clip.text = textInput.value;
        saveHistory();
        renderTimeline();
        updatePreview();
      });

      makeLabel("Text overlay", textInput);

      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.value = clip.textColor || "#ffffff";

      colorInput.addEventListener("input", () => {
        clip.textColor = colorInput.value;
        updatePreview();
      });

      colorInput.addEventListener("change", saveHistory);
      makeLabel("Text color", colorInput);

      const sizeInput = document.createElement("input");
      sizeInput.type = "range";
      sizeInput.min = "12";
      sizeInput.max = "96";
      sizeInput.value = String(clip.textSize || 32);

      sizeInput.addEventListener("input", () => {
        clip.textSize = Number(sizeInput.value);
        updatePreview();
      });

      sizeInput.addEventListener("change", saveHistory);
      makeLabel("Text size", sizeInput);

      const animation = document.createElement("select");

      [
        ["none", "None"],
        ["fade", "Fade In"],
        ["slide", "Slide In"],
        ["zoom", "Zoom In"],
        ["bounce", "Bounce"]
      ].forEach(([value, label]) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        animation.appendChild(option);
      });

      animation.value = clip.textAnimation || "none";

      animation.addEventListener("change", () => {
        clip.textAnimation = animation.value;
        saveHistory();
        updatePreview();
      });

      makeLabel("Text animation", animation);

      const brightnessInput = document.createElement("input");
      brightnessInput.type = "range";
      brightnessInput.min = "25";
      brightnessInput.max = "200";
      brightnessInput.value = String(clip.brightness ?? 100);

      brightnessInput.addEventListener("input", () => {
        clip.brightness = Number(brightnessInput.value);
        applyAdjustments(clip);
      });

      brightnessInput.addEventListener("change", saveHistory);
      makeLabel("Brightness", brightnessInput);

      const contrastInput = document.createElement("input");
      contrastInput.type = "range";
      contrastInput.min = "25";
      contrastInput.max = "200";
      contrastInput.value = String(clip.contrast ?? 100);

      contrastInput.addEventListener("input", () => {
        clip.contrast = Number(contrastInput.value);
        applyAdjustments(clip);
      });

      contrastInput.addEventListener("change", saveHistory);
      makeLabel("Contrast", contrastInput);

      const grayscaleInput = document.createElement("input");
      grayscaleInput.type = "range";
      grayscaleInput.min = "0";
      grayscaleInput.max = "100";
      grayscaleInput.value = String(clip.grayscale ?? 0);

      grayscaleInput.addEventListener("input", () => {
        clip.grayscale = Number(grayscaleInput.value);
        applyAdjustments(clip);
      });

      grayscaleInput.addEventListener("change", saveHistory);
      makeLabel("Grayscale", grayscaleInput);
    }

    if (clip.type === "audio" || clip.type === "video") {
      const volumeInput = document.createElement("input");
      volumeInput.type = "range";
      volumeInput.min = "0";
      volumeInput.max = "1";
      volumeInput.step = "0.05";
      volumeInput.value = String(clip.volume ?? 1);

      volumeInput.addEventListener("input", () => {
        clip.volume = Number(volumeInput.value);

        if (el.preview) {
          el.preview.volume = clip.volume;
        }
      });

      volumeInput.addEventListener("change", saveHistory);
      makeLabel("Volume", volumeInput);
    }

    const startInput = document.createElement("input");
    startInput.type = "number";
    startInput.min = "0";
    startInput.step = "0.1";
    startInput.value = String(clip.start);

    startInput.addEventListener("change", () => {
      const newStart = Math.max(0, Number(startInput.value) || 0);
      const duration = getClipDuration(clip);

      clip.start = newStart;
      clip.end = newStart + duration;

      state.playhead = clip.start;

      saveHistory();
      renderTimeline();
      updatePreview();
      renderSelectedClipProperties();
    });

    makeLabel("Start (seconds)", startInput);

    const endInput = document.createElement("input");
    endInput.type = "number";
    endInput.min = String(clip.start + 0.1);
    endInput.step = "0.1";
    endInput.value = String(clip.end);

    endInput.addEventListener("change", () => {
      const newEnd = Math.max(
        clip.start + 0.1,
        Number(endInput.value) || clip.end
      );

      clip.end = newEnd;

      saveHistory();
      renderTimeline();
      updatePreview();
      renderSelectedClipProperties();
    });

    makeLabel("End (seconds)", endInput);
  }

  /* ----------------------------------------------------------
     PANELS
     ---------------------------------------------------------- */

  function switchPanel(panel) {
    state.currentPanel = panel;

    $$(".tool-btn[data-panel]").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.panel === panel
      );
    });

    if (el.panelTitle) {
      const titles = {
        media: "Media",
        text: "Text",
        audio: "Audio",
        effects: "Effects",
        adjust: "Adjust"
      };

      el.panelTitle.textContent = titles[panel] || "Tools";
    }

    if (!el.panelContent) return;

    el.panelContent.innerHTML = "";

    if (panel === "media") {
      const description = document.createElement("p");
      description.textContent =
        "Import videos, photos and audio, then add them to your timeline.";

      el.panelContent.appendChild(description);

      const importButton = document.createElement("button");
      importButton.type = "button";
      importButton.className = "primary-btn";
      importButton.textContent = "＋ Import Media";

      importButton.addEventListener("click", () => {
        el.mediaInput?.click();
      });

      el.panelContent.appendChild(importButton);

      if (el.mediaList) {
        el.panelContent.appendChild(el.mediaList);
      }
    }

    if (panel === "text") {
      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "primary-btn";
      addButton.textContent = "＋ Add Text";
      addButton.addEventListener("click", addText);

      el.panelContent.appendChild(addButton);

      const note = document.createElement("p");
      note.textContent =
        "Select a video, photo or text clip to change its text, color, size and animation.";

      el.panelContent.appendChild(note);
    }

    if (panel === "audio") {
      const importButton = document.createElement("button");
      importButton.type = "button";
      importButton.className = "primary-btn";
      importButton.textContent = "＋ Import Audio";

      importButton.addEventListener("click", () => {
        if (el.mediaInput) {
          el.mediaInput.accept = "audio/*";
          el.mediaInput.click();

          setTimeout(() => {
            el.mediaInput.accept = "video/*,image/*,audio/*";
          }, 1000);
        }
      });

      el.panelContent.appendChild(importButton);

      const note = document.createElement("p");
      note.textContent =
        "Import audio, then tap + beside the file to add it to the timeline.";

      el.panelContent.appendChild(note);

      const audioItems = state.media.filter(
        (item) => item.type === "audio"
      );

      audioItems.forEach((item) => {
        const row = document.createElement("div");
        row.className = "audio-item";

        const label = document.createElement("span");
        label.textContent = item.name;

        const addButton = document.createElement("button");
        addButton.type = "button";
        addButton.textContent = "+ Add";
        addButton.addEventListener("click", () => {
          addMediaToTimeline(item.id);
        });

        row.append(label, addButton);
        el.panelContent.appendChild(row);
      });
    }

    if (panel === "effects") {
      addPanelButton(
        el.panelContent,
        "Rotate 90°",
        () => rotatePreview(90)
      );

      addPanelButton(
        el.panelContent,
        "Rotate 180°",
        () => rotatePreview(180)
      );

      addPanelButton(
        el.panelContent,
        "Toggle Grayscale",
        toggleGrayscale
      );

      addPanelButton(
        el.panelContent,
        "Reset Adjustments",
        resetAdjustments
      );

      const note = document.createElement("p");
      note.textContent =
        "Effects in this version affect the editor preview. They are not yet rendered into an exported video file.";

      el.panelContent.appendChild(note);
    }

    if (panel === "adjust") {
      const clip = getSelectedClip();

      addRangeControl(
        el.panelContent,
        "Brightness",
        25,
        200,
        clip?.brightness ?? state.adjustments.brightness,
        (value) => setAdjustment("brightness", value)
      );

      addRangeControl(
        el.panelContent,
        "Contrast",
        25,
        200,
        clip?.contrast ?? state.adjustments.contrast,
        (value) => setAdjustment("contrast", value)
      );

      addRangeControl(
        el.panelContent,
        "Grayscale",
        0,
        100,
        clip?.grayscale ?? state.adjustments.grayscale,
        (value) => setAdjustment("grayscale", value)
      );

      addPanelButton(
        el.panelContent,
        "Reset Adjustments",
        resetAdjustments
      );
    }

    const properties = document.createElement("div");
    properties.id = "clipProperties";
    properties.className = "clip-properties";

    el.panelContent.appendChild(properties);

    renderSelectedClipProperties();
  }

  function addPanelButton(parent, text, callback) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tool-action";
    button.textContent = text;
    button.addEventListener("click", callback);

    parent.appendChild(button);
  }

  function addRangeControl(
    parent,
    labelText,
    min,
    max,
    initial,
    callback
  ) {
    const label = document.createElement("label");
    label.className = "editor-field";

    const text = document.createElement("span");
    text.textContent = `${labelText}: ${initial}%`;

    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.value = String(initial);

    input.addEventListener("input", () => {
      text.textContent = `${labelText}: ${input.value}%`;
      callback(input.value);
    });

    label.append(text, input);
    parent.appendChild(label);
  }

  /* ----------------------------------------------------------
     SAVE AND RESTORE
     ---------------------------------------------------------- */

  function saveProject() {
    const project = {
      version: 2,
      projectName: state.projectName,
      aspect: el.aspect?.value || "9:16",
      clips: state.clips,
      selectedClipId: state.selectedClipId,
      nextId: state.nextId,
      adjustments: state.adjustments,
      speed: state.speed,
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(project)
      );

      notify(
        "Project settings saved. Original media files must be re-imported after a page reload."
      );
    } catch (error) {
      console.error("Project save failed:", error);

      notify(
        "Could not save project. Browser storage may be full."
      );
    }
  }

  function restoreProject() {
    let raw;

    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error("Project storage unavailable:", error);
      return;
    }

    if (!raw) return;

    try {
      const project = JSON.parse(raw);

      state.projectName =
        project.projectName || "My Video Project";

      state.clips = Array.isArray(project.clips)
        ? project.clips
        : [];

      state.selectedClipId =
        project.selectedClipId ?? null;

      state.nextId = Math.max(
        Number(project.nextId) || 1,
        ...state.clips.map((clip) => clip.id + 1),
        1
      );

      state.adjustments = {
        brightness: 100,
        contrast: 100,
        grayscale: 0,
        rotation: 0,
        ...(project.adjustments || {})
      };

      state.speed = Number(project.speed) || 1;

      if (el.projectName) {
        el.projectName.textContent = state.projectName;
      }

      if (el.aspect && project.aspect) {
        el.aspect.value = project.aspect;
        applyAspectRatio(project.aspect);
      }

      renderTimeline();
      updatePreview();
      applyAdjustments();

      notify(
        "Project settings restored. Re-import missing media to continue editing."
      );
    } catch (error) {
      console.error("Project restore failed:", error);
      notify("Saved project could not be restored.");
    }
  }

  function createNewProject() {
    const proceed = confirm(
      "Start a new project? Save your current project first if you need it later."
    );

    if (!proceed) return;

    stopPlayback();

    state.clips = [];
    state.selectedClipId = null;
    state.playhead = 0;
    state.projectName = "My Video Project";

    state.adjustments = {
      brightness: 100,
      contrast: 100,
      grayscale: 0,
      rotation: 0
    };

    if (el.projectName) {
      el.projectName.textContent = state.projectName;
    }

    saveHistory();
    renderTimeline();
    updatePreview();
    renderSelectedClipProperties();

    notify("New project created.");
  }

  /* ----------------------------------------------------------
     ASPECT RATIO
     ---------------------------------------------------------- */

  function applyAspectRatio(ratio) {
    if (!el.stage) return;

    const ratios = {
      "9:16": "9 / 16",
      "16:9": "16 / 9",
      "1:1": "1 / 1",
      "4:5": "4 / 5"
    };

    el.stage.style.aspectRatio =
      ratios[ratio] || "9 / 16";
  }

  /* ----------------------------------------------------------
     EXPORT
     ---------------------------------------------------------- */

  function exportProject() {
    if (!state.clips.length) {
      notify("Add clips to the timeline before exporting.");
      return;
    }

    notify(
      "MP4 rendering is not implemented in this browser-only version. Your edits are not being exported as a finished video yet.",
      5000
    );
  }

  /* ----------------------------------------------------------
     EVENTS
     ---------------------------------------------------------- */

  function bindEvents() {
    el.mediaInput?.addEventListener("change", (event) => {
      importFiles(event.target.files || []);
    });

    el.newProject?.addEventListener(
      "click",
      createNewProject
    );

    el.saveProject?.addEventListener(
      "click",
      saveProject
    );

    el.exportBtn?.addEventListener(
      "click",
      exportProject
    );

    el.playBtn?.addEventListener(
      "click",
      togglePlayback
    );

    el.backFrame?.addEventListener("click", () => {
      seek(-1 / 30);
    });

    el.forwardFrame?.addEventListener("click", () => {
      seek(1 / 30);
    });

    el.undoBtn?.addEventListener("click", undo);
    el.redoBtn?.addEventListener("click", redo);

    el.splitBtn?.addEventListener(
      "click",
      splitSelectedClip
    );

    el.deleteBtn?.addEventListener(
      "click",
      deleteSelectedClip
    );

    el.zoomOut?.addEventListener("click", () => {
      setZoom(state.zoom / 1.25);
    });

    el.zoomIn?.addEventListener("click", () => {
      setZoom(state.zoom * 1.25);
    });

    el.zoomRange?.addEventListener("input", (event) => {
      setZoom(event.target.value);
    });

    el.aspect?.addEventListener("change", (event) => {
      applyAspectRatio(event.target.value);
    });

    el.projectName?.addEventListener("click", () => {
      const name = prompt(
        "Enter project name:",
        state.projectName
      );

      if (name === null || !name.trim()) return;

      state.projectName = name.trim();
      el.projectName.textContent = state.projectName;

      saveHistory();
    });

    $$(".tool-btn[data-panel]").forEach((button) => {
      button.addEventListener("click", () => {
        switchPanel(button.dataset.panel);
      });
    });

    /*
      Clicking the timeline ruler or track background moves
      the playhead to the corresponding time.
    */

    [el.ruler, el.videoTrack, el.textTrack, el.audioTrack]
      .filter(Boolean)
      .forEach((track) => {
        track.addEventListener("click", (event) => {
          if (event.target.closest(".timeline-clip")) return;

          const rect = track.getBoundingClientRect();

          const x =
            event.clientX -
            rect.left +
            (track.scrollLeft || 0);

          state.playhead = Math.max(
            0,
            x / (state.zoom * 30)
          );

          state.playhead = Math.min(
            state.playhead,
            getTimelineDuration()
          );

          const clip = findClipAtTime(state.playhead);

          if (clip) {
            state.selectedClipId = clip.id;
          }

          updatePreview();
          renderTimeline();
          renderSelectedClipProperties();
        });
      });

    /*
      Keep preview video playback synchronized with the
      timeline when the user manually seeks the video.
    */

    el.preview?.addEventListener("timeupdate", () => {
      if (!state.playing) return;

      const clip = findClipAtTime(state.playhead);

      if (!clip || clip.type !== "video") return;

      const localTime = el.preview.currentTime;

      state.playhead = clip.start + localTime;
      updatePlayheadUI();
    });

    el.preview?.addEventListener("ended", () => {
      if (!state.playing) return;

      const clip = findClipAtTime(state.playhead);
      if (!clip) return;

      state.playhead = Math.min(
        clip.end,
        state.playhead + 0.03
      );
    });

    document.addEventListener("keydown", (event) => {
      const target = event.target;

      if (
        target &&
        (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable
        )
      ) {
        return;
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "z"
      ) {
        event.preventDefault();

        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
      }

      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "y"
      ) {
        event.preventDefault();
        redo();
      }

      if (event.code === "Space") {
        event.preventDefault();
        togglePlayback();
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        deleteSelectedClip();
      }
    });

    /*
      Prevent accidentally leaving the page while editing.
      This warning cannot recover media files after a reload.
    */

    window.addEventListener("beforeunload", (event) => {
      if (state.clips.length && state.media.length) {
        event.preventDefault();
        event.returnValue = "";
      }
    });
  }

  /* ----------------------------------------------------------
     INITIALIZATION
     ---------------------------------------------------------- */

  function initialize() {
    bindEvents();

    if (el.mediaInput) {
      el.mediaInput.accept = "video/*,image/*,audio/*";
      el.mediaInput.multiple = true;
    }

    if (el.zoomRange) {
      el.zoomRange.value = String(state.zoom);
    }

    applyAspectRatio(el.aspect?.value || "9:16");

    renderMediaList();
    renderTimeline();

    state.history = [];
    state.historyIndex = -1;
    saveHistory();

    restoreProject();

    switchPanel("media");

    /*
      Add a playback speed selector to the transport bar
      if the HTML doesn't already contain one.
    */

    createSpeedControl();

    console.log("Vitalstar VE Pro initialized.");
  }

  function createSpeedControl() {
    if (!el.playBtn || $("#speedControl")) return;

    const select = document.createElement("select");
    select.id = "speedControl";
    select.className = "speed-control";
    select.title = "Playback speed";
    select.setAttribute("aria-label", "Playback speed");

    [
      ["0.25", "0.25×"],
      ["0.5", "0.5×"],
      ["0.75", "0.75×"],
      ["1", "1×"],
      ["1.25", "1.25×"],
      ["1.5", "1.5×"],
      ["1.75", "1.75×"],
      ["2", "2×"]
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });

    select.value = String(state.speed);

    select.addEventListener("change", () => {
      setSpeed(select.value);
    });

    el.playBtn.insertAdjacentElement("afterend", select);
  }

  initialize();
})();