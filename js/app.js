/**
 * ZenStudy 澄境 · 單人沉浸式讀書空間
 * Main Controller & Orchestration Module
 */

const StorageInstance = window.Storage || (typeof Storage !== 'undefined' ? Storage : null);
const AudioEngineClass = window.AudioEngine || (typeof AudioEngine !== 'undefined' ? AudioEngine : null);
const TimerEngineClass = window.TimerEngine || (typeof TimerEngine !== 'undefined' ? TimerEngine : null);

// Inspiring Focus & Mindset Quotes
const FOCUS_QUOTES = [
  { text: "專注不是一昧前進，而是懂得排除無關緊要的雜念。", author: "馬可·奧理略《沉思錄》" },
  { text: "少，但是更好 (Less, but better)。", author: "迪特·拉姆斯 (Dieter Rams)" },
  { text: "心流不是被動發生的，而是當你全神貫注於眼前事物時的副產物。", author: "米哈里·契克森米哈伊" },
  { text: "平靜的心智是抵禦外界混亂最強大的武器。", author: "羅曼·羅蘭" },
  { text: "美來自於恰如其分的秩序與純粹。", author: "包浩斯設計宣言" },
  { text: "每完成一顆番茄鐘，都是對未來自己的一份溫柔承諾。", author: "ZenStudy 澄境" },
  { text: "沉靜下來，世界自會為你騰出深度思考的空間。", author: "梭羅《湖濱散記》" }
];

class App {
  constructor() {
    this.storage = window.Storage;
    this.audio = new window.AudioEngine();
    this.settings = this.storage.getSettings();

    this.timer = new window.TimerEngine({
      workDuration: this.settings.pomodoroWork * 60,
      shortBreakDuration: this.settings.pomodoroShortBreak * 60,
      longBreakDuration: this.settings.pomodoroLongBreak * 60,
      longBreakInterval: this.settings.longBreakInterval || 4,
      autoStartBreaks: this.settings.autoStartBreaks,
      autoStartPomodoro: this.settings.autoStartPomodoro,
      onTick: (state) => this.handleTimerTick(state),
      onComplete: (state) => this.handleTimerComplete(state),
      onStageChange: (state) => this.handleStageChange(state)
    });

    this.activeTaskId = this.settings.activeTaskId || null;
    this.taskFilter = 'all';
    this.currentQuoteIndex = 0;

    this.init();
  }

  init() {
    this.bindDOM();
    this.initAudioMixerUI();
    this.initScenesUI();
    this.initClock();
    this.initQuote();
    this.initTasksUI();
    this.initNotesUI();
    this.initStatsUI();
    this.initSettingsUI();
    this.applyVisualPreferences();
    this.bindKeyboardShortcuts();
    this.requestNotificationPermission();

    // Initial timer tick display
    this.handleTimerTick(this.timer.getState());
  }

  bindDOM() {
    // Top Bar elements
    this.clockEl = document.getElementById('live-clock');
    this.quickScenesEl = document.getElementById('quick-scenes');
    this.btnZenMode = document.getElementById('btn-zen-mode');
    this.btnFullscreen = document.getElementById('btn-fullscreen');
    this.btnZenExit = document.getElementById('btn-zen-exit');

    // Drawer Buttons
    this.btnOpenTasks = document.getElementById('btn-open-tasks');
    this.btnOpenNotes = document.getElementById('btn-open-notes');
    this.btnOpenScenes = document.getElementById('btn-open-scenes');
    this.btnOpenStats = document.getElementById('btn-open-stats');
    this.btnOpenSettings = document.getElementById('btn-open-settings');
    this.drawerBackdrop = document.getElementById('drawer-backdrop');

    // Timer Elements
    this.activeTaskPill = document.getElementById('active-task-pill');
    this.activeTaskTag = document.getElementById('active-task-tag');
    this.activeTaskTitle = document.getElementById('active-task-title');
    this.activeTaskPoms = document.getElementById('active-task-poms');

    this.digitalTimeEl = document.getElementById('digital-time');
    this.statusSubtitleEl = document.getElementById('status-subtitle');
    this.ringCircle = document.getElementById('ring-circle');
    this.btnTimerToggle = document.getElementById('btn-timer-toggle');
    this.btnTimerReset = document.getElementById('btn-timer-reset');
    this.btnTimerSkip = document.getElementById('btn-timer-skip');

    this.modeTabs = document.querySelectorAll('.mode-tab');
    this.stageTabs = document.querySelectorAll('#pomodoro-stage-tabs .stage-tab');
    this.pomodoroStageTabs = document.getElementById('pomodoro-stage-tabs');
    this.countdownPresets = document.getElementById('countdown-presets');

    // Quote Elements
    this.quoteText = document.getElementById('quote-text');
    this.quoteAuthor = document.getElementById('quote-author');
    this.btnRefreshQuote = document.getElementById('btn-refresh-quote');

    // Bottom Sound Dock Elements
    this.soundChipsContainer = document.getElementById('sound-chips-container');
    this.btnToggleLofi = document.getElementById('btn-toggle-lofi');
    this.btnMuteToggle = document.getElementById('btn-mute-toggle');
    this.muteIcon = document.getElementById('mute-icon');
    this.masterVolumeSlider = document.getElementById('master-volume-slider');
    this.bgBrightnessSlider = document.getElementById('bg-brightness-slider');
    this.bgBlurSlider = document.getElementById('bg-blur-slider');

    // Background Layer
    this.bgLayer = document.getElementById('bg-layer');

    // Setup Drawer Open/Close Listeners
    const drawers = [
      { btn: this.btnOpenTasks, id: 'drawer-tasks' },
      { btn: this.btnOpenNotes, id: 'drawer-notes' },
      { btn: this.btnOpenScenes, id: 'drawer-scenes' },
      { btn: this.btnOpenStats, id: 'drawer-stats' },
      { btn: this.btnOpenSettings, id: 'drawer-settings' }
    ];

    drawers.forEach(({ btn, id }) => {
      btn.addEventListener('click', () => this.openDrawer(id));
    });

    document.querySelectorAll('.drawer-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const drawerId = btn.getAttribute('data-close');
        this.closeDrawer(drawerId);
      });
    });

    this.drawerBackdrop.addEventListener('click', () => this.closeAllDrawers());

    // Timer Controls Listeners
    this.btnTimerToggle.addEventListener('click', () => {
      this.audio.ensureContext();
      this.timer.toggle();
    });

    this.btnTimerReset.addEventListener('click', () => this.timer.reset());
    this.btnTimerSkip.addEventListener('click', () => this.timer.skip());

    // Timer Mode Tab Switching
    this.modeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const mode = tab.dataset.mode;
        this.modeTabs.forEach(t => t.classList.toggle('active', t === tab));
        this.timer.setMode(mode);

        if (mode === 'pomodoro') {
          this.pomodoroStageTabs.style.display = 'flex';
          this.countdownPresets.style.display = 'none';
        } else if (mode === 'countdown') {
          this.pomodoroStageTabs.style.display = 'none';
          this.countdownPresets.style.display = 'flex';
        } else {
          this.pomodoroStageTabs.style.display = 'none';
          this.countdownPresets.style.display = 'none';
        }
      });
    });

    // Pomodoro Stage Sub-tab Switching
    this.stageTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const stage = tab.dataset.stage;
        this.stageTabs.forEach(t => t.classList.toggle('active', t === tab));
        this.timer.setPomodoroStage(stage);
      });
    });

    // Countdown Preset Buttons
    document.querySelectorAll('#countdown-presets .stage-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#countdown-presets .stage-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.timer.setCountdownDuration(btn.dataset.mins);
      });
    });

    // Active Task pill click -> open tasks drawer
    this.activeTaskPill.addEventListener('click', () => this.openDrawer('drawer-tasks'));

    // Zen Mode & Fullscreen
    this.btnZenMode.addEventListener('click', () => this.toggleZenMode());
    this.btnZenExit.addEventListener('click', () => this.toggleZenMode(false));
    this.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());

    // Quote Refresh
    this.btnRefreshQuote.addEventListener('click', () => this.nextQuote());
  }

  // ==========================================
  // Drawer Management
  // ==========================================
  openDrawer(drawerId) {
    this.closeAllDrawers();
    const drawer = document.getElementById(drawerId);
    if (drawer) {
      drawer.classList.add('open');
      this.drawerBackdrop.classList.add('open');
      if (drawerId === 'drawer-stats') this.renderStats();
    }
  }

  closeDrawer(drawerId) {
    const drawer = document.getElementById(drawerId);
    if (drawer) drawer.classList.remove('open');
    this.drawerBackdrop.classList.remove('open');
  }

  closeAllDrawers() {
    document.querySelectorAll('.slide-drawer').forEach(d => d.classList.remove('open'));
    this.drawerBackdrop.classList.remove('open');
  }

  // ==========================================
  // Audio Mixer & Sound Controls
  // ==========================================
  initAudioMixerUI() {
    this.soundChipsContainer.innerHTML = '';

    this.audio.trackConfigs.forEach(track => {
      const chip = document.createElement('div');
      chip.className = 'sound-chip';
      chip.id = `chip-${track.id}`;
      chip.title = track.name;

      chip.innerHTML = `
        <span class="track-icon">${track.icon}</span>
        <span class="track-name">${track.name}</span>
        <input type="range" class="track-slider" min="0" max="1" step="0.05" value="0">
      `;

      const slider = chip.querySelector('.track-slider');
      slider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.audio.setTrackVolume(track.id, val);
        chip.classList.toggle('active', val > 0);
      });

      this.soundChipsContainer.appendChild(chip);
    });

    // Procedural Lofi Piano Button
    this.btnToggleLofi.addEventListener('click', () => {
      const active = this.audio.toggleProceduralLofi();
      this.btnToggleLofi.classList.toggle('active', active);
      this.showToast(active ? '🎵 暖光 Lofi 和弦已啟動' : '已關閉 Lofi 音樂');
    });

    // Master Mute Button
    this.btnMuteToggle.addEventListener('click', () => {
      const muted = this.audio.toggleMute();
      this.muteIcon.textContent = muted ? '🔇' : '🔊';
      this.btnMuteToggle.classList.toggle('active', muted);
      this.showToast(muted ? '已靜音' : '解除靜音');
    });

    // Master Volume Slider
    this.masterVolumeSlider.addEventListener('input', (e) => {
      this.audio.setMasterVolume(parseFloat(e.target.value));
    });

    // Visual Ambience Sliders (Brightness & Blur)
    this.bgBrightnessSlider.value = this.settings.backgroundBrightness;
    this.bgBlurSlider.value = this.settings.backgroundBlur;

    this.bgBrightnessSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      this.settings.backgroundBrightness = val;
      this.storage.saveSettings({ backgroundBrightness: val });
      this.applyVisualPreferences();
    });

    this.bgBlurSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      this.settings.backgroundBlur = val;
      this.storage.saveSettings({ backgroundBlur: val });
      this.applyVisualPreferences();
    });
  }

  applyVisualPreferences() {
    const brightness = (this.settings.backgroundBrightness || 65) / 100;
    const blur = this.settings.backgroundBlur || 0;
    this.bgLayer.style.filter = `brightness(${brightness}) blur(${blur}px)`;
  }

  // ==========================================
  // Scenes & Visual Atmosphere
  // ==========================================
  initScenesUI() {
    this.renderScenes();

    // Custom Scene Add Form
    const formAddScene = document.getElementById('form-add-scene');
    formAddScene.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('scene-input-name').value.trim();
      const url = document.getElementById('scene-input-url').value.trim();
      const cat = document.getElementById('scene-input-cat').value.trim() || '個人自訂';

      if (!name || !url) return;
      this.storage.addCustomScene(name, url, cat);
      formAddScene.reset();
      this.renderScenes();
      this.showToast(`✨ 自訂場景「${name}」已儲存！`);
    });

    // Apply Active Scene
    this.applyScene(this.settings.activeSceneId || 'rainy-cafe');
  }

  renderScenes() {
    const allScenes = this.storage.getAllScenes();
    const builtinScenes = this.storage.getBuiltinScenes();
    const customScenes = this.storage.getCustomScenes();

    // 1. Render Quick Pills in Top Bar
    this.quickScenesEl.innerHTML = '';
    builtinScenes.forEach(scene => {
      const pill = document.createElement('button');
      pill.className = `scene-pill ${scene.id === this.settings.activeSceneId ? 'active' : ''}`;
      pill.textContent = scene.name;
      pill.addEventListener('click', () => this.applyScene(scene.id));
      this.quickScenesEl.appendChild(pill);
    });

    // 2. Render Built-in Grid in Drawer
    const scenesGrid = document.getElementById('scenes-grid');
    scenesGrid.innerHTML = '';
    builtinScenes.forEach(scene => {
      const card = this.createSceneCard(scene);
      scenesGrid.appendChild(card);
    });

    // 3. Render Custom Grid in Drawer
    const customGrid = document.getElementById('custom-scenes-grid');
    customGrid.innerHTML = '';
    if (customScenes.length === 0) {
      customGrid.innerHTML = `<div style="grid-column: span 2; font-size: 0.8rem; color: var(--text-subtle); padding: 0.8rem; text-align: center;">尚未建立自訂場景，點擊上方展開表單新增</div>`;
    } else {
      customScenes.forEach(scene => {
        const card = this.createSceneCard(scene, true);
        customGrid.appendChild(card);
      });
    }
  }

  createSceneCard(scene, isCustom = false) {
    const card = document.createElement('div');
    card.className = `scene-card ${scene.id === this.settings.activeSceneId ? 'active' : ''}`;
    card.id = `card-scene-${scene.id}`;

    card.innerHTML = `
      <img src="${scene.thumbnail}" alt="${scene.name}" class="scene-card-img" loading="lazy">
      <div class="scene-card-info">
        <span>${scene.name}</span>
        ${isCustom ? `<button class="btn-del-scene" title="刪除自訂場景" style="color: var(--accent-rose); font-size: 0.85rem;">🗑️</button>` : `<span style="font-size: 0.72rem; color: var(--text-muted);">${scene.category}</span>`}
      </div>
    `;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-del-scene')) {
        e.stopPropagation();
        if (confirm(`確定要刪除自訂場景「${scene.name}」嗎？`)) {
          this.storage.deleteCustomScene(scene.id);
          this.renderScenes();
          this.showToast('自訂場景已刪除');
        }
        return;
      }
      this.applyScene(scene.id);
    });

    return card;
  }

  applyScene(sceneId) {
    const allScenes = this.storage.getAllScenes();
    const scene = allScenes.find(s => s.id === sceneId) || allScenes[0];
    if (!scene) return;

    this.settings.activeSceneId = scene.id;
    this.storage.saveSettings({ activeSceneId: scene.id });

    // Smooth background crossfade
    this.bgLayer.style.opacity = '0.4';
    setTimeout(() => {
      this.bgLayer.style.backgroundImage = `url("${scene.backgroundUrl}")`;
      this.bgLayer.style.opacity = '1';
    }, 200);

    // Update Pill & Card Active States
    document.querySelectorAll('.scene-pill').forEach(pill => {
      pill.classList.toggle('active', pill.textContent === scene.name);
    });
    document.querySelectorAll('.scene-card').forEach(card => {
      card.classList.toggle('active', card.id === `card-scene-${scene.id}`);
    });
  }

  // ==========================================
  // Timer Callbacks & Ring Updating
  // ==========================================
  handleTimerTick(state) {
    this.digitalTimeEl.textContent = state.timeString;
    this.btnTimerToggle.textContent = state.isRunning ? '暫停' : '開始專注';

    // SVG Circular Progress: radius 105 -> circumference = 2 * PI * 105 = 659.734
    const circumference = 659.734;
    const offset = circumference * (1 - state.progress);
    this.ringCircle.style.strokeDashoffset = offset;

    // Update Browser Tab Title
    const modeLabel = state.mode === 'pomodoro'
      ? (state.stage === 'work' ? '專注中' : '休息中')
      : (state.mode === 'countdown' ? '倒數中' : '自主學習中');
    document.title = state.isRunning
      ? `(${state.timeString}) ${modeLabel} · ZenStudy`
      : 'ZenStudy 澄境 · 單人沉浸式讀書空間';

    // Subtitle Status
    if (state.mode === 'pomodoro') {
      if (state.stage === 'work') {
        this.statusSubtitleEl.textContent = state.isRunning ? '沉靜入定 · 專注心流' : '準備好即可點擊開始';
      } else if (state.stage === 'shortBreak') {
        this.statusSubtitleEl.textContent = '小憩片刻 · 喝口水舒展身心';
      } else {
        this.statusSubtitleEl.textContent = '長休充能 · 犒賞專注的自己';
      }
    } else if (state.mode === 'countdown') {
      this.statusSubtitleEl.textContent = '倒數限時衝刺模式';
    } else {
      this.statusSubtitleEl.textContent = `自主計時中 · 累計 ${Math.floor(state.elapsedSeconds / 60)} 分鐘`;
    }
  }

  handleTimerComplete(event) {
    // 1. Play Chime Alarm
    this.audio.playAlarm(this.settings.alarmSound || 'singing-bowl');

    // 2. Browser Push Notification
    this.sendNotification(
      event.prevStage === 'work' ? '專注時段完成！' : '休息時間結束！',
      event.prevStage === 'work' ? '很棒的深度專注！喝口水準備休息吧。' : '休息結束，準備開啟下一個專注循環！'
    );

    // 3. If work completed, record history and increment task
    if (event.prevStage === 'work' && !event.wasSkipped) {
      const activeTask = this.getActiveTask();
      const taskTitle = activeTask ? activeTask.title : '自主學習閱讀';

      this.storage.addHistoryRecord({
        mode: 'pomodoro',
        durationMinutes: event.completedFocusMinutes || 25,
        taskId: this.activeTaskId,
        taskTitle
      });

      if (this.activeTaskId) {
        this.storage.incrementTaskPomodoro(this.activeTaskId);
        this.renderTasks();
      }

      this.renderStats();
      this.showToast(`🎉 完成一顆番茄鐘！已累計記錄至專注數據。`);
    } else if (event.mode === 'countdown') {
      this.showToast(`⏰ 倒數計時完成！`);
    }
  }

  handleStageChange(state) {
    this.stageTabs.forEach(t => t.classList.toggle('active', t.dataset.stage === state.stage));
    if (state.stage === 'work') {
      this.ringCircle.style.stroke = 'var(--accent-primary)';
    } else {
      this.ringCircle.style.stroke = 'var(--accent-emerald)';
    }
  }

  // ==========================================
  // Tasks CRUD Module
  // ==========================================
  initTasksUI() {
    const formAddTask = document.getElementById('form-add-task');
    formAddTask.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('task-input-title').value;
      const tag = document.getElementById('task-input-tag').value;
      const poms = document.getElementById('task-input-poms').value;

      const created = this.storage.addTask(title, poms, tag);
      formAddTask.reset();
      document.getElementById('task-input-poms').value = 1;

      if (!this.activeTaskId) {
        this.setActiveTask(created.id);
      }
      this.renderTasks();
      this.showToast('✅ 任務已新增');
    });

    // Task Filter Tabs
    document.querySelectorAll('#task-filters .stage-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#task-filters .stage-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.taskFilter = tab.dataset.filter;
        this.renderTasks();
      });
    });

    this.renderTasks();
  }

  getActiveTask() {
    const tasks = this.storage.getTasks();
    return tasks.find(t => t.id === this.activeTaskId) || null;
  }

  setActiveTask(id) {
    this.activeTaskId = id;
    this.settings.activeTaskId = id;
    this.storage.saveSettings({ activeTaskId: id });
    this.renderTasks();
  }

  renderTasks() {
    const tasks = this.storage.getTasks();
    const listEl = document.getElementById('tasks-list');
    listEl.innerHTML = '';

    // Filter tasks
    let filtered = tasks;
    if (this.taskFilter === 'active') filtered = tasks.filter(t => !t.done);
    else if (this.taskFilter === 'completed') filtered = tasks.filter(t => t.done);

    if (filtered.length === 0) {
      listEl.innerHTML = `<div style="text-align: center; color: var(--text-subtle); padding: 1.5rem; font-size: 0.85rem;">目前沒有待辦任務</div>`;
    } else {
      filtered.forEach(task => {
        const item = document.createElement('div');
        const isActive = task.id === this.activeTaskId;
        item.className = `task-item ${task.done ? 'done' : ''} ${isActive ? 'active-focus' : ''}`;

        item.innerHTML = `
          <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} title="標記完成">
          <div class="task-info">
            <span class="task-title">${task.title}</span>
            <div class="task-meta">
              <span class="task-badge-tag">${task.tag}</span>
              <span>🍅 ${task.completed || 0} / ${task.estimated || 1} 番茄</span>
            </div>
          </div>
          <div class="task-actions">
            ${!isActive ? `<button class="glass-btn btn-set-active" style="padding: 0.3rem 0.6rem; font-size: 0.72rem;">選取</button>` : `<span style="font-size: 0.72rem; color: var(--accent-primary); font-weight: 600;">專注中</span>`}
            <button class="btn-del-task" title="刪除任務" style="color: var(--text-subtle); padding: 0.2rem 0.4rem; font-size: 0.85rem;">🗑️</button>
          </div>
        `;

        // Checkbox toggle
        item.querySelector('.task-checkbox').addEventListener('change', () => {
          this.storage.toggleTaskDone(task.id);
          this.renderTasks();
        });

        // Select as active task
        const btnSet = item.querySelector('.btn-set-active');
        if (btnSet) {
          btnSet.addEventListener('click', () => {
            this.setActiveTask(task.id);
            this.showToast(`🎯 當前專注任務已切換為「${task.title}」`);
          });
        }

        // Delete task
        item.querySelector('.btn-del-task').addEventListener('click', () => {
          if (confirm(`確定要刪除「${task.title}」嗎？`)) {
            this.storage.deleteTask(task.id);
            if (this.activeTaskId === task.id) {
              const remaining = this.storage.getTasks();
              this.setActiveTask(remaining.length ? remaining[0].id : null);
            }
            this.renderTasks();
            this.showToast('任務已刪除');
          }
        });

        listEl.appendChild(item);
      });
    }

    // Update Top Stage Active Task Pill
    const activeTask = this.getActiveTask();
    if (activeTask) {
      this.activeTaskTag.textContent = activeTask.tag;
      this.activeTaskTitle.textContent = activeTask.title;
      this.activeTaskPoms.textContent = `🍅 ${activeTask.completed || 0}/${activeTask.estimated || 1}`;
      this.activeTaskPill.style.display = 'flex';
    } else {
      this.activeTaskTag.textContent = '自由';
      this.activeTaskTitle.textContent = '自主專注閱讀';
      this.activeTaskPoms.textContent = '🍅 點擊選取任務';
    }
  }

  // ==========================================
  // Notes CRUD Module (Sticky Notes)
  // ==========================================
  initNotesUI() {
    const btnAddNote = document.getElementById('btn-add-note');
    btnAddNote.addEventListener('click', () => {
      const colors = ['amber', 'sage', 'sky', 'rose'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      this.storage.addNote('新便箋', '', randomColor);
      this.renderNotes();
      this.showToast('📝 已新增便箋');
    });

    this.renderNotes();
  }

  renderNotes() {
    const notes = this.storage.getNotes();
    const container = document.getElementById('notes-container');
    container.innerHTML = '';

    notes.forEach(note => {
      const card = document.createElement('div');
      card.className = `note-card ${note.color || 'amber'}`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <input type="text" class="note-card-title" value="${note.title}" placeholder="便箋標題...">
          <button class="btn-del-note" title="刪除便箋" style="color: var(--text-subtle); font-size: 0.8rem;">✕</button>
        </div>
        <textarea class="note-card-content" placeholder="隨手寫下靈感、閱讀重點或待查資料...">${note.content}</textarea>
        <div class="note-card-footer">
          <span>${new Date(note.updatedAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })} 更新</span>
          <div style="display: flex; gap: 0.3rem;">
            ${['amber', 'sage', 'sky', 'rose'].map(c => `
              <span class="color-dot" data-color="${c}" style="width: 10px; height: 10px; border-radius: 50%; background: var(--accent-${c === 'amber' ? 'warm' : (c === 'sage' ? 'emerald' : (c === 'sky' ? 'primary' : 'rose'))}); cursor: pointer; opacity: ${note.color === c ? 1 : 0.4};"></span>
            `).join('')}
          </div>
        </div>
      `;

      // Live update on input with debounce
      const titleInput = card.querySelector('.note-card-title');
      const contentTextarea = card.querySelector('.note-card-content');

      titleInput.addEventListener('input', () => {
        this.storage.updateNote(note.id, { title: titleInput.value });
      });

      contentTextarea.addEventListener('input', () => {
        this.storage.updateNote(note.id, { content: contentTextarea.value });
      });

      // Color picker
      card.querySelectorAll('.color-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          const newColor = dot.dataset.color;
          this.storage.updateNote(note.id, { color: newColor });
          this.renderNotes();
        });
      });

      // Delete note
      card.querySelector('.btn-del-note').addEventListener('click', () => {
        this.storage.deleteNote(note.id);
        this.renderNotes();
        this.showToast('便箋已刪除');
      });

      container.appendChild(card);
    });
  }

  // ==========================================
  // Stats & Data Backup Module (CRUD)
  // ==========================================
  initStatsUI() {
    this.renderStats();

    // Clear History Button
    document.getElementById('btn-clear-history').addEventListener('click', () => {
      if (confirm('確定要清空所有專注歷史紀錄嗎？')) {
        this.storage.clearHistory();
        this.renderStats();
        this.showToast('歷史紀錄已清空');
      }
    });

    // JSON Backup Export
    document.getElementById('btn-export-backup').addEventListener('click', () => {
      const json = this.storage.exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ZenStudy_Backup_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast('📥 備份檔案已匯出！');
    });

    // JSON Backup Import
    const fileImport = document.getElementById('file-import-backup');
    fileImport.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = this.storage.importAllData(event.target.result);
        if (result.success) {
          this.renderTasks();
          this.renderNotes();
          this.renderScenes();
          this.renderStats();
          this.showToast('📤 備份資料匯入成功！');
        } else {
          alert('匯入失敗：' + result.error);
        }
      };
      reader.readAsText(file);
      fileImport.value = '';
    });
  }

  renderStats() {
    const stats = this.storage.getStats();
    document.getElementById('stat-today-mins').textContent = stats.todayMinutes;
    document.getElementById('stat-total-poms').textContent = stats.completedPomodoros;
    document.getElementById('stat-total-mins').textContent = stats.totalMinutes;
    document.getElementById('stat-total-sessions').textContent = stats.totalSessions;

    // Render History Log List
    const history = this.storage.getHistory();
    const historyList = document.getElementById('history-list');
    historyList.innerHTML = '';

    if (history.length === 0) {
      historyList.innerHTML = `<div style="text-align: center; color: var(--text-subtle); padding: 1rem; font-size: 0.8rem;">尚無專注紀錄，完成一次計時後將自動記錄</div>`;
    } else {
      history.slice(0, 30).forEach(item => {
        const row = document.createElement('div');
        row.className = 'history-item';
        row.innerHTML = `
          <div>
            <span style="font-weight: 600; color: var(--text-main);">${item.taskTitle}</span>
            <div style="font-size: 0.7rem; color: var(--text-muted);">${item.dateStr} ${item.timeStr} · ${item.mode === 'pomodoro' ? '番茄鐘' : '自訂時長'}</div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.8rem;">
            <span style="color: var(--accent-primary); font-family: var(--font-mono); font-weight: 600;">+${item.durationMinutes}m</span>
            <button class="btn-del-history" title="刪除此紀錄" style="color: var(--text-subtle); cursor: pointer;">✕</button>
          </div>
        `;

        row.querySelector('.btn-del-history').addEventListener('click', () => {
          this.storage.deleteHistoryRecord(item.id);
          this.renderStats();
        });

        historyList.appendChild(row);
      });
    }
  }

  // ==========================================
  // Settings Module
  // ==========================================
  initSettingsUI() {
    const workInput = document.getElementById('setting-work-time');
    const shortBreakInput = document.getElementById('setting-short-break');
    const longBreakInput = document.getElementById('setting-long-break');
    const alarmSelect = document.getElementById('setting-alarm-sound');
    const autoBreaksCheck = document.getElementById('setting-auto-breaks');
    const autoPomodoroCheck = document.getElementById('setting-auto-pomodoro');

    workInput.value = this.settings.pomodoroWork;
    shortBreakInput.value = this.settings.pomodoroShortBreak;
    longBreakInput.value = this.settings.pomodoroLongBreak;
    alarmSelect.value = this.settings.alarmSound || 'singing-bowl';
    autoBreaksCheck.checked = this.settings.autoStartBreaks;
    autoPomodoroCheck.checked = this.settings.autoStartPomodoro;

    // Test Chime Button
    document.getElementById('btn-test-chime').addEventListener('click', () => {
      this.audio.playAlarm(alarmSelect.value);
    });

    // Save Settings
    document.getElementById('btn-save-settings').addEventListener('click', () => {
      const updated = {
        pomodoroWork: parseInt(workInput.value) || 25,
        pomodoroShortBreak: parseInt(shortBreakInput.value) || 5,
        pomodoroLongBreak: parseInt(longBreakInput.value) || 15,
        alarmSound: alarmSelect.value,
        autoStartBreaks: autoBreaksCheck.checked,
        autoStartPomodoro: autoPomodoroCheck.checked
      };

      this.settings = this.storage.saveSettings(updated);
      this.timer.setSettings(this.settings);
      this.closeDrawer('drawer-settings');
      this.showToast('⚙️ 偏好設定已更新！');
    });
  }

  // ==========================================
  // Clock, Quotes, Keyboard & Zen Mode
  // ==========================================
  initClock() {
    const updateTime = () => {
      const now = new Date();
      this.clockEl.textContent = now.toLocaleTimeString('zh-TW', { hour12: false });
    };
    updateTime();
    setInterval(updateTime, 1000);
  }

  initQuote() {
    this.renderQuote();
  }

  nextQuote() {
    this.currentQuoteIndex = (this.currentQuoteIndex + 1) % FOCUS_QUOTES.length;
    this.renderQuote();
  }

  renderQuote() {
    const q = FOCUS_QUOTES[this.currentQuoteIndex];
    this.quoteText.textContent = q.text;
    this.quoteAuthor.textContent = `— ${q.author}`;
  }

  toggleZenMode(force) {
    const isZen = force !== undefined ? force : !document.body.classList.contains('zen-mode');
    document.body.classList.toggle('zen-mode', isZen);
    this.btnZenMode.classList.toggle('active', isZen);
    if (isZen) {
      this.closeAllDrawers();
      this.showToast('進入極簡專注模式 (按 Z 或 Esc 退出)');
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ignore shortcuts if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        this.audio.ensureContext();
        this.timer.toggle();
      } else if (e.key === 'z' || e.key === 'Z') {
        this.toggleZenMode();
      } else if (e.key === 'Escape') {
        this.toggleZenMode(false);
        this.closeAllDrawers();
      } else if (e.key === 'f' || e.key === 'F') {
        this.toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        this.btnMuteToggle.click();
      }
    });
  }

  requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      // Will request upon first timer start
      window.addEventListener('click', () => {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
      }, { once: true });
    }
  }

  sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=128&q=80'
      });
    }
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
}

// Start Application on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  window.zenStudyApp = new App();
});
