/* =====================================================
   VITALSTAR VE PRO
   Browser-based video editing prototype
   ===================================================== */

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  const preview = $("#preview");
  const photoPreview = $("#photoPreview");
  const emptyState = $("#emptyState");
  const stage = $("#stage");
  const mediaInput = $("#mediaInput");
  const mediaList = $("#mediaList");
  const videoTrack = $("#videoTrack");
  const textTrack = $("#textTrack");
  const audioTrack = $("#audioTrack");
  const playBtn = $("#playBtn");
  const textOverlay = $("#textOverlay");
  const toast = $("#toast");

  const STORAGE_KEY = "vitalstar_ve_pro_project_v1";

  let media = [];
  let clips = [];
  let selectedClipId = null;
  let currentPanel = "media";
  let nextId = 1;
  let zoom = 100;
  let toastTimer = null;

  let history = [];
  let historyIndex = -1;

  const panelNames = {
    media: "Media",
    text: "Text",
    audio: "Audio",
    effects: "Effects",
    adjust: "Adjust"
  };

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      seconds = 0;
    }

    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      String(secs).padStart(2, "0")
    );
  }

  function formatPreciseTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
      seconds = 0;
    }

    const minutes = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(2).padStart(5, "0");

    return (
      String(minutes).padStart(2, "0") +
      ":" +
      secs
    );
  }

  function createId() {
    return "clip-" + nextId++;
  }

  function getSelectedClip() {
    return clips.find((clip) => clip.id === selectedClipId) || null;
  }

  function selectedMedia() {
    const clip = getSelectedClip();

    if (!clip) return null;

    return media.find((item) => item.id === clip.mediaId) || null;
  }

  function updateButtons() {
    const selected = Boolean(getSelectedClip());

    $("#splitBtn").disabled = !selected;
    $("#deleteBtn").disabled = !selected;

    $("#undoBtn").disabled = historyIndex <= 0;
    $("#redoBtn").disabled =
      historyIndex < 0 || historyIndex >= history.length - 1;
  }

  function saveHistory() {
    const snapshot = JSON.stringify({
      clips,
      selectedClipId,
      nextId
    });

    if (historyIndex < history.length - 1) {
      history = history.slice(0, historyIndex + 1);
    }

    if (history[history.length - 1] !== snapshot) {
      history.push(snapshot);

      if (history.length > 40) {
        history.shift();
      }

      historyIndex = history.length - 1;
    }

    updateButtons();
  }

  function restoreHistory(index) {
    if (index < 0 || index >= history.length) return;

    try {
      const state = JSON.parse(history[index]);

      clips = state.clips || [];
      selectedClipId = state.selectedClipId || null;
      nextId = state.nextId || 1;

      historyIndex = index;

      renderTimeline();
      updateButtons();
    } catch (error) {
      console.error("Unable to restore history:", error);
    }
  }

  function undo() {
    if (historyIndex > 0) {
      restoreHistory(historyIndex - 1);
      notify("Undo complete");
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      restoreHistory(historyIndex + 1);
      notify("Redo complete");
    }
  }

  function createMediaItem(file) {
    const id = "media-" + Date.now() + "-" + Math.random();

    const item = {
      id,
      file,
      name: file.name,
      type: file.type.startsWith("audio/")
        ? "audio"
        : file.type.startsWith("image/")
          ? "image"
          : "video",
      url: URL.createObjectURL(file),
      duration: 0
    };

    media.push(item);

    if (item.type === "video" || item.type === "audio") {
      const element = document.createElement(
        item.type === "video" ? "video" : "audio"
      );

      element.preload = "metadata";
      element.src = item.url;

      element.addEventListener("loadedmetadata", () => {
        item.duration = Number.isFinite(element.duration)
          ? element.duration
          : 0;

        renderMedia();
      }, { once: true });
    }

    return item;
  }

  function importFiles(files) {
    const incoming = Array.from(files || []);

    if (!incoming.length) return;

    let imported = 0;

    incoming.forEach((file) => {
      const allowed =
        file.type.startsWith("video/") ||
        file.type.startsWith("image/") ||
        file.type.startsWith("audio/");

      if (!allowed) return;

      createMediaItem(file);
      imported++;
    });

    renderMedia();

    if (imported > 0) {
      notify(imported + " file(s) imported");
    } else {
      notify("Choose a supported video, image, or audio file");
    }
  }

  function renderMedia() {
    mediaList.replaceChildren();

    if (!media.length) {
      const message = document.createElement("p");
      message.className = "muted";
      message.textContent = "Your imported files will appear here.";
      mediaList.appendChild(message);
      return;
    }

    media.forEach((item) => {
      const card = document.createElement("div");
      card.className = "media-item";

      let thumbnail;

      if (item.type === "image") {
        thumbnail = document.createElement("img");
        thumbnail.src = item.url;
        thumbnail.alt = item.name;
      } else {
        thumbnail = document.createElement("div");
        thumbnail.style.height = "76px";
        thumbnail.style.display = "grid";
        thumbnail.style.placeItems = "center";
        thumbnail.style.background = "#101d31";
        thumbnail.style.fontSize = "24px";
        thumbnail.textContent =
          item.type === "audio" ? "♫" : "▶";
      }

      const name = document.createElement("div");
      name.className = "media-name";
      name.textContent = item.name;
      name.title = item.name;

      const addButton = document.createElement("button");
      addButton.textContent =
        item.type === "audio" ? "+ Add audio" : "+ Add to timeline";

      addButton.addEventListener("click", () => {
        addMediaToTimeline(item.id);
      });

      card.append(thumbnail, name, addButton);
      mediaList.appendChild(card);
    });
  }

  function addMediaToTimeline(mediaId) {
    const item = media.find((entry) => entry.id === mediaId);

    if (!item) return;

    const clip = {
      id: createId(),
      mediaId: item.id,
      name: item.name,
      type: item.type,
      start: 0,
      end: item.duration || 5,
      duration: item.duration || 5,
      text: "",
      volume: 1
    };

    clips.push(clip);
    selectedClipId = clip.id;

    saveHistory();
    renderTimeline();

    if (item.type === "video" || item.type === "image") {
      loadPreview(clip.id);
    }

    notify("Added to timeline");
  }

  function loadPreview(clipId) {
    const clip = clips.find((entry) => entry.id === clipId);

    if (!clip) return;

    const item = media.find((entry) => entry.id === clip.mediaId);

    if (!item) return;

    selectedClipId = clip.id;

    if (item.type === "video") {
      photoPreview.hidden = true;
      photoPreview.removeAttribute("src");

      preview.hidden = false;

      if (preview.src !== item.url) {
        preview.src = item.url;
      }

      preview.currentTime = Math.min(
        clip.start || 0,
        Number.isFinite(preview.duration) ? preview.duration : 0
      );

      emptyState.hidden = true;

      preview.play().catch(() => {
        // Autoplay may be blocked by the browser.
      });
    } else if (item.type === "image") {
      preview.pause();
      preview.hidden = true;

      photoPreview.src = item.url;
      photoPreview.hidden = false;

      emptyState.hidden = true;
    } else {
      notify("Audio added. Select a video clip to preview.");
    }

    if (clip.type === "text") {
      textOverlay.textContent = clip.text || "Your text";
      textOverlay.hidden = false;
    } else if (clip.type !== "audio") {
      textOverlay.hidden = true;
    }

    renderTimeline();
    updateButtons();
  }

  function addText() {
    const value = prompt("Enter the text you want to add:");

    if (value === null || !value.trim()) return;

    const clip = {
      id: createId(),
      mediaId: null,
      name: value.trim(),
      type: "text",
      start: preview.currentTime || 0,
      end: (preview.currentTime || 0) + 5,
      duration: 5,
      text: value.trim()
    };

    clips.push(clip);
    selectedClipId = clip.id;

    textOverlay.textContent = clip.text;
    textOverlay.hidden = false;

    saveHistory();
    renderTimeline();

    notify("Text overlay added");
  }

  function renderTimeline() {
    videoTrack.replaceChildren();
    textTrack.replaceChildren();
    audioTrack.replaceChildren();

    const tracks = {
      video: videoTrack,
      image: videoTrack,
      text: textTrack,
      audio: audioTrack
    };

    const sorted = [...clips].sort((a, b) => a.start - b.start);

    sorted.forEach((clip) => {
      const container = tracks[clip.type];

      if (!container) return;

      const button = document.createElement("button");
      button.className = "timeline-clip";

      if (clip.type === "text") {
        button.classList.add("text-clip");
      }

      if (clip.type === "audio") {
        button.classList.add("audio-clip");
      }

      if (clip.id === selectedClipId) {
        button.classList.add("selected");
      }

      button.textContent = clip.name;
      button.title = clip.name;

      const width = Math.max(
        75,
        (Math.max(1, clip.duration || 5) * zoom * 3)
      );

      button.style.width = width + "px";
      button.style.flex = "0 0 " + width + "px";

      button.addEventListener("click", () => {
        selectedClipId = clip.id;

        if (clip.type === "video" || clip.type === "image") {
          loadPreview(clip.id);
        } else if (clip.type === "text") {
          textOverlay.textContent = clip.text;
          textOverlay.hidden = false;
        } else {
          renderTimeline();
        }

        updateButtons();
      });

      container.appendChild(button);
    });

    Object.values(tracks).forEach((track) => {
      if (!track.children.length) {
        const placeholder = document.createElement("span");
        placeholder.className = "track-placeholder";
        placeholder.textContent =
          track === videoTrack
            ? "Add videos and photos here"
            : track === textTrack
              ? "Text overlays appear here"
              : "Audio clips appear here";

        track.appendChild(placeholder);
      }
    });

    $("#clipCount").textContent =
      clips.length + (clips.length === 1 ? " clip" : " clips");

    updateTime();
    updateButtons();
  }

  function updateTime() {
    const current = preview.currentTime || 0;
    const duration = Number.isFinite(preview.duration)
      ? preview.duration
      : 0;

    $("#timeReadout").textContent =
      formatTime(current) + " / " + formatTime(duration);

    $("#currentTime").textContent = formatPreciseTime(current);

    const playhead = $("#playhead");

    if (playhead) {
      const offset = 70 + current * zoom * 3;
      playhead.style.left = offset + "px";
    }
  }

  function splitClip() {
    const clip = getSelectedClip();

    if (!clip) {
      notify("Select a clip first");
      return;
    }

    if (clip.type === "text" || clip.type === "audio") {
      notify("Splitting this clip type is not supported yet");
      return;
    }

    const cutTime = preview.currentTime || 0;

    if (cutTime <= clip.start || cutTime >= clip.end) {
      notify("Move the playhead inside the selected clip first");
      return;
    }

    const originalEnd = clip.end;

    const secondClip = {
      ...clip,
      id: createId(),
      start: cutTime,
      end: originalEnd,
      duration: originalEnd - cutTime,
      name: clip.name + " (2)"
    };

    clip.end = cutTime;
    clip.duration = cutTime - clip.start;

    clips.push(secondClip);
    selectedClipId = secondClip.id;

    saveHistory();
    renderTimeline();

    notify("Clip split");
  }

  function deleteSelected() {
    const clip = getSelectedClip();

    if (!clip) return;

    clips = clips.filter((entry) => entry.id !== clip.id);
    selectedClipId = null;

    if (clip.type === "text") {
      textOverlay.hidden = true;
    }

    saveHistory();
    renderTimeline();

    notify("Clip removed from timeline");
  }

  function setAspect(value) {
    stage.classList.remove("landscape", "square", "social");

    if (value === "16:9") {
      stage.classList.add("landscape");
    } else if (value === "1:1") {
      stage.classList.add("square");
    } else if (value === "4:5") {
      stage.classList.add("social");
    }
  }

  function switchPanel(panel) {
    currentPanel = panel;

    document.querySelectorAll(".tool").forEach((button) => {
      button.classList.toggle(
        "active",
        button.dataset.panel === panel
      );
    });

    $("#panelTitle").textContent = panelNames[panel] || "Tools";

    const content = $("#panelContent");
    content.replaceChildren();

    if (panel === "media") {
      const description = document.createElement("p");
      description.className = "muted";
      description.textContent = "Import and organize your media.";

      const label = document.createElement("label");
      label.className = "import-btn";
      label.textContent = "＋ Import media";

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "video/*,image/*,audio/*";
      input.multiple = true;
      input.hidden = true;

      input.addEventListener("change", () => {
        importFiles(input.files);
      });

      label.appendChild(input);

      content.append(description, label, mediaList);
      return;
    }

    if (panel === "text") {
      addPanelButton(content, "＋ Add text overlay", addText);

      const info = document.createElement("p");
      info.className = "muted";
      info.textContent =
        "Add a text clip, then select it in the timeline.";

      content.appendChild(info);
      return;
    }

    if (panel === "audio") {
      const label = document.createElement("label");
      label.className = "import-btn";
      label.textContent = "♫ Import audio";

      const input = document.createElement("input");
      input.type = "file";
      input.accept = "audio/*";
      input.multiple = true;
      input.hidden = true;

      input.addEventListener("change", () => {
        importFiles(input.files);
      });

      label.appendChild(input);
      content.appendChild(label);

      const info = document.createElement("p");
      info.className = "muted";
      info.textContent =
        "Import audio files and add them to the audio track.";

      content.appendChild(info);
      return;
    }

    if (panel === "effects") {
      addPanelButton(content, "↻ Rotate preview", rotatePreview);
      addPanelButton(content, "◐ Grayscale", toggleGrayscale);
      addPanelButton(content, "✦ Reset effects", resetEffects);

      const info = document.createElement("p");
      info.className = "muted";
      info.textContent =
        "These are preview effects. They do not permanently render a video.";

      content.appendChild(info);
      return;
    }

    if (panel === "adjust") {
      addRangeControl(content, "Brightness", 50, 150, 100, (value) => {
        stage.style.filter = "brightness(" + value + "%)";
      });

      addRangeControl(content, "Contrast", 50, 200, 100, (value) => {
        stage.style.filter += " contrast(" + value + "%)";
      });

      const reset = document.createElement("button");
      reset.textContent = "Reset adjustments";
      reset.addEventListener("click", resetEffects);

      content.appendChild(reset);
    }
  }

  function addPanelButton(container, label, action) {
    const button = document.createElement("button");
    button.textContent = label;
    button.style.width = "100%";
    button.style.marginBottom = "10px";

    button.addEventListener("click", action);

    container.appendChild(button);
  }

  function addRangeControl(container, label, min, max, initial, action) {
    const wrapper = document.createElement("div");
    wrapper.style.marginBottom = "18px";

    const title = document.createElement("label");
    title.textContent = label;
    title.style.display = "block";
    title.style.marginBottom = "8px";

    const range = document.createElement("input");
    range.type = "range";
    range.min = min;
    range.max = max;
    range.value = initial;
    range.style.width = "100%";

    const valueText = document.createElement("small");
    valueText.className = "muted";
    valueText.textContent = initial + "%";

    range.addEventListener("input", () => {
      valueText.textContent = range.value + "%";
      action(Number(range.value));
    });

    wrapper.append(title, range, valueText);
    container.appendChild(wrapper);
  }

  function rotatePreview() {
    stage.style.transform =
      stage.style.transform === "rotate(180deg)"
        ? ""
        : "rotate(180deg)";

    notify("Preview rotation toggled");
  }

  function toggleGrayscale() {
    stage.style.filter =
      stage.style.filter.includes("grayscale")
        ? ""
        : "grayscale(100%)";

    notify("Preview effect toggled");
  }

  function resetEffects() {
    stage.style.filter = "";
    stage.style.transform = "";

    notify("Preview adjustments reset");
  }

  function saveProject() {
    const project = {
      name: $("#projectName").textContent,
      aspect: $("#aspect").value,
      clips: clips.map((clip) => ({
        id: clip.id,
        mediaId: clip.mediaId,
        name: clip.name,
        type: clip.type,
        start: clip.start,
        end: clip.end,
        duration: clip.duration,
        text: clip.text || "",
        volume: clip.volume ?? 1
      })),
      savedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      notify("Project draft saved in this browser");
    } catch (error) {
      console.error(error);
      notify("Unable to save project in browser storage");
    }
  }

  function newProject() {
    const proceed = confirm(
      "Start a new project? Unsaved timeline changes will be lost."
    );

    if (!proceed) return;

    preview.pause();
    preview.removeAttribute("src");
    preview.load();

    photoPreview.removeAttribute("src");
    photoPreview.hidden = true;

    preview.hidden = true;
    emptyState.hidden = false;
    textOverlay.hidden = true;

    clips = [];
    selectedClipId = null;
    history = [];
    historyIndex = -1;

    $("#projectName").textContent = "Untitled project";

    saveHistory();
    renderTimeline();

    notify("New project created");
  }

  function exportProject() {
    notify(
      "This prototype does not render MP4 yet. Save your project draft instead."
    );
  }

  function seek(seconds) {
    if (!Number.isFinite(preview.duration)) return;

    preview.currentTime = Math.max(
      0,
      Math.min(preview.duration, preview.currentTime + seconds)
    );
  }

  function setZoom(value) {
    zoom = Math.max(50, Math.min(160, Number(value) || 100));

    $("#zoomRange").value = zoom;

    renderTimeline();
  }

  /* EVENT LISTENERS */

  mediaInput.addEventListener("change", () => {
    importFiles(mediaInput.files);
    mediaInput.value = "";
  });

  playBtn.addEventListener("click", () => {
    if (preview.hidden || !preview.src) {
      notify("Import a video and add it to the timeline first");
      return;
    }

    if (preview.paused) {
      preview.play().catch(() => {
        notify("Tap play again to start the video");
      });
    } else {
      preview.pause();
    }
  });

  preview.addEventListener("play", () => {
    playBtn.textContent = "Ⅱ";
  });

  preview.addEventListener("pause", () => {
    playBtn.textContent = "▶";
  });

  preview.addEventListener("timeupdate", updateTime);
  preview.addEventListener("loadedmetadata", updateTime);

  $("#backFrame").addEventListener("click", () => seek(-5));
  $("#forwardFrame").addEventListener("click", () => seek(5));

  $("#splitBtn").addEventListener("click", splitClip);
  $("#deleteBtn").addEventListener("click", deleteSelected);

  $("#undoBtn").addEventListener("click", undo);
  $("#redoBtn").addEventListener("click", redo);

  $("#saveProject").addEventListener("click", saveProject);
  $("#newProject").addEventListener("click", newProject);
  $("#exportBtn").addEventListener("click", exportProject);

  $("#aspect").addEventListener("change", (event) => {
    setAspect(event.target.value);
  });

  $("#zoomRange").addEventListener("input", (event) => {
    setZoom(event.target.value);
  });

  $("#zoomIn").addEventListener("click", () => {
    setZoom(zoom + 10);
  });

  $("#zoomOut").addEventListener("click", () => {
    setZoom(zoom - 10);
  });

  document.querySelectorAll(".tool").forEach((button) => {
    button.addEventListener("click", () => {
      switchPanel(button.dataset.panel);
    });
  });

  /* INITIALIZE */

  preview.hidden = true;
  photoPreview.hidden = true;
  emptyState.hidden = false;

  renderMedia();
  renderTimeline();
  saveHistory();
  switchPanel("media");

})();