/**
 * ZenStudy - Storage & Data Management Module (CRUD)
 * Handles LocalStorage persistence, backup export/import, and history tracking.
 */

const STORAGE_KEYS = {
  TASKS: 'zenstudy_tasks',
  NOTES: 'zenstudy_notes',
  CUSTOM_SCENES: 'zenstudy_custom_scenes',
  HISTORY: 'zenstudy_history',
  SETTINGS: 'zenstudy_settings',
  MIXER_PRESETS: 'zenstudy_mixer_presets'
};

const DEFAULT_TASKS = [
  { id: 'task-1', title: '閱讀商業設計概論第三章', estimated: 3, completed: 1, tag: '課程', done: false, createdAt: Date.now() - 86400000 },
  { id: 'task-2', title: '準備期末專案簡報投影片大綱', estimated: 2, completed: 0, tag: '專案', done: false, createdAt: Date.now() - 36000000 },
  { id: 'task-3', title: '整理本週專注筆記與靈感便箋', estimated: 1, completed: 1, tag: '日常', done: true, createdAt: Date.now() - 7200000 }
];

const DEFAULT_NOTES = [
  {
    id: 'note-1',
    title: '專注空間美學反思',
    content: '打造沉浸式體驗的關鍵在於：\n1. 視覺留白與適度暗色調，減少螢幕發光刺激\n2. 自然環境音的層次疊加（如：小雨 + 遠處壁爐）\n3. 即時記錄靈感，不打斷目前的思緒流。',
    color: 'amber',
    updatedAt: Date.now() - 3600000
  },
  {
    id: 'note-2',
    title: '期末 Demo 驗證清單',
    content: '✓ 檢查 8 款預設場景切換流暢度\n✓ 測試 Web Audio 白噪音混音與音量保存\n✓ 驗證番茄鐘、倒數計時與碼表模式\n✓ 確保任務與便簽 CRUD 完整保存於 LocalStorage',
    color: 'sage',
    updatedAt: Date.now() - 7200000
  }
];

const DEFAULT_SETTINGS = {
  pomodoroWork: 25,
  pomodoroShortBreak: 5,
  pomodoroLongBreak: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoro: false,
  alarmSound: 'singing-bowl',
  alarmVolume: 0.8,
  activeSceneId: 'rainy-cafe',
  backgroundBrightness: 65,
  backgroundBlur: 0,
  activeTaskId: 'task-1'
};

const DEFAULT_BUILTIN_SCENES = [
  {
    id: 'rainy-cafe',
    name: '雨天咖啡廳',
    category: '室內氛圍',
    thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80',
    backgroundUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=2000&q=85',
    isCustom: false,
    theme: 'warm'
  },
  {
    id: 'tokyo-night',
    name: '深夜東京',
    category: '城市夜景',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80',
    backgroundUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=2000&q=85',
    isCustom: false,
    theme: 'neon'
  },
  {
    id: 'forest-cabin',
    name: '森林木屋',
    category: '自然寧靜',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
    backgroundUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=2000&q=85',
    isCustom: false,
    theme: 'cool'
  },
  {
    id: 'starlit-library',
    name: '星光圖書館',
    category: '古典雅緻',
    thumbnail: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80',
    backgroundUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2000&q=85',
    isCustom: false,
    theme: 'warm'
  },
  {
    id: 'sunset-beach',
    name: '黃昏海灘',
    category: '自然寧靜',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    backgroundUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85',
    isCustom: false,
    theme: 'warm'
  },
  {
    id: 'cozy-fireplace',
    name: '壁爐微光',
    category: '室內氛圍',
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    backgroundUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=85',
    isCustom: false,
    theme: 'warm'
  },
  {
    id: 'cyber-space',
    name: '賽博專注艙',
    category: '科技未來',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    backgroundUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=85',
    isCustom: false,
    theme: 'neon'
  },
  {
    id: 'zen-garden',
    name: '禪意庭園',
    category: '古典雅緻',
    thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80',
    backgroundUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=2000&q=85',
    isCustom: false,
    theme: 'cool'
  }
];

const Storage = {
  // ---- Tasks CRUD ----
  getTasks() {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) {
      this.saveTasks(DEFAULT_TASKS);
      return DEFAULT_TASKS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TASKS;
    }
  },

  saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  },

  addTask(title, estimated = 1, tag = '專案') {
    const tasks = this.getTasks();
    const newTask = {
      id: 'task-' + Date.now(),
      title: title.trim(),
      estimated: Number(estimated) || 1,
      completed: 0,
      tag: tag.trim() || '專案',
      done: false,
      createdAt: Date.now()
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  },

  updateTask(id, updates) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      this.saveTasks(tasks);
      return tasks[index];
    }
    return null;
  },

  toggleTaskDone(id) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.done = !task.done;
      this.saveTasks(tasks);
      return task;
    }
    return null;
  },

  incrementTaskPomodoro(id) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = (task.completed || 0) + 1;
      this.saveTasks(tasks);
      return task;
    }
    return null;
  },

  deleteTask(id) {
    let tasks = this.getTasks();
    tasks = tasks.filter(t => t.id !== id);
    this.saveTasks(tasks);
  },

  // ---- Notes CRUD ----
  getNotes() {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      this.saveNotes(DEFAULT_NOTES);
      return DEFAULT_NOTES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_NOTES;
    }
  },

  saveNotes(notes) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  addNote(title, content, color = 'amber') {
    const notes = this.getNotes();
    const newNote = {
      id: 'note-' + Date.now(),
      title: (title || '無標題便箋').trim(),
      content: content.trim(),
      color,
      updatedAt: Date.now()
    };
    notes.unshift(newNote);
    this.saveNotes(notes);
    return newNote;
  },

  updateNote(id, updates) {
    const notes = this.getNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updates, updatedAt: Date.now() };
      this.saveNotes(notes);
      return notes[index];
    }
    return null;
  },

  deleteNote(id) {
    let notes = this.getNotes();
    notes = notes.filter(n => n.id !== id);
    this.saveNotes(notes);
  },

  // ---- Scenes Management (Built-in + Custom CRUD) ----
  getBuiltinScenes() {
    return DEFAULT_BUILTIN_SCENES;
  },

  getCustomScenes() {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_SCENES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  getAllScenes() {
    return [...this.getBuiltinScenes(), ...this.getCustomScenes()];
  },

  addCustomScene(name, backgroundUrl, category = '個人自訂', theme = 'warm') {
    const customScenes = this.getCustomScenes();
    const newScene = {
      id: 'custom-' + Date.now(),
      name: name.trim(),
      category: category.trim() || '個人自訂',
      thumbnail: backgroundUrl.trim(),
      backgroundUrl: backgroundUrl.trim(),
      isCustom: true,
      theme
    };
    customScenes.push(newScene);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SCENES, JSON.stringify(customScenes));
    return newScene;
  },

  deleteCustomScene(id) {
    let customScenes = this.getCustomScenes();
    customScenes = customScenes.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_SCENES, JSON.stringify(customScenes));
  },

  // ---- Focus History CRUD ----
  getHistory() {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  addHistoryRecord(record) {
    const history = this.getHistory();
    const newRecord = {
      id: 'rec-' + Date.now(),
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString('zh-TW'),
      timeStr: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
      mode: record.mode || 'pomodoro',
      durationMinutes: record.durationMinutes || 25,
      taskId: record.taskId || null,
      taskTitle: record.taskTitle || '自由自主學習'
    };
    history.unshift(newRecord);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    return newRecord;
  },

  deleteHistoryRecord(id) {
    let history = this.getHistory();
    history = history.filter(h => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },

  clearHistory() {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify([]));
  },

  getStats() {
    const history = this.getHistory();
    const todayStr = new Date().toLocaleDateString('zh-TW');
    const todayRecords = history.filter(h => h.dateStr === todayStr);

    const todayMinutes = todayRecords.reduce((acc, cur) => acc + (cur.durationMinutes || 0), 0);
    const totalMinutes = history.reduce((acc, cur) => acc + (cur.durationMinutes || 0), 0);
    const completedPomodoros = history.filter(h => h.mode === 'pomodoro').length;

    return {
      todayMinutes,
      totalMinutes,
      totalSessions: history.length,
      completedPomodoros
    };
  },

  // ---- Settings ----
  getSettings() {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return { ...DEFAULT_SETTINGS };
    }
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },

  saveSettings(settings) {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    let current = DEFAULT_SETTINGS;
    if (raw) {
      try {
        current = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      } catch {}
    }
    const merged = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    return merged;
  },

  // ---- Backup Export / Import ----
  exportAllData() {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tasks: this.getTasks(),
      notes: this.getNotes(),
      customScenes: this.getCustomScenes(),
      history: this.getHistory(),
      settings: this.getSettings()
    };
    return JSON.stringify(backup, null, 2);
  },

  importAllData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (Array.isArray(data.tasks)) this.saveTasks(data.tasks);
      if (Array.isArray(data.notes)) this.saveNotes(data.notes);
      if (Array.isArray(data.customScenes)) {
        localStorage.setItem(STORAGE_KEYS.CUSTOM_SCENES, JSON.stringify(data.customScenes));
      }
      if (Array.isArray(data.history)) {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
      }
      if (data.settings && typeof data.settings === 'object') {
        this.saveSettings(data.settings);
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};

window.Storage = Storage;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
