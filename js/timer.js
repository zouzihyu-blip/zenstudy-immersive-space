/**
 * ZenStudy - Precision Timer Engine
 */

class TimerEngine {
  constructor(options = {}) {
    this.options = {
      workDuration: 25 * 60,
      shortBreakDuration: 5 * 60,
      longBreakDuration: 15 * 60,
      longBreakInterval: 4,
      autoStartBreaks: false,
      autoStartPomodoro: false,
      ...options
    };

    this.mode = 'pomodoro';
    this.pomodoroStage = 'work';
    this.isRunning = false;

    this.timeRemaining = this.options.workDuration;
    this.totalDuration = this.options.workDuration;
    this.elapsedSeconds = 0;

    this.timerId = null;
    this.expectedEndTime = null;
    this.stopwatchStartTime = null;
    this.pomodorosCompletedInCycle = 0;

    this.onTick = options.onTick || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onStageChange = options.onStageChange || (() => {});
  }

  setSettings(newSettings) {
    if (newSettings.pomodoroWork) {
      this.options.workDuration = newSettings.pomodoroWork * 60;
    }
    if (newSettings.pomodoroShortBreak) {
      this.options.shortBreakDuration = newSettings.pomodoroShortBreak * 60;
    }
    if (newSettings.pomodoroLongBreak) {
      this.options.longBreakDuration = newSettings.pomodoroLongBreak * 60;
    }
    if (newSettings.autoStartBreaks !== undefined) {
      this.options.autoStartBreaks = newSettings.autoStartBreaks;
    }
    if (newSettings.autoStartPomodoro !== undefined) {
      this.options.autoStartPomodoro = newSettings.autoStartPomodoro;
    }

    if (!this.isRunning && this.mode === 'pomodoro') {
      this.reset();
    }
  }

  setMode(mode) {
    if (this.isRunning) {
      this.pause();
    }
    this.mode = mode;
    this.reset();
  }

  setPomodoroStage(stage) {
    if (this.isRunning) {
      this.pause();
    }
    this.pomodoroStage = stage;
    if (stage === 'work') {
      this.totalDuration = this.options.workDuration;
    } else if (stage === 'shortBreak') {
      this.totalDuration = this.options.shortBreakDuration;
    } else if (stage === 'longBreak') {
      this.totalDuration = this.options.longBreakDuration;
    }
    this.timeRemaining = this.totalDuration;
    this.onStageChange(this.getState());
    this.onTick(this.getState());
  }

  setCountdownDuration(minutes) {
    if (this.isRunning) {
      this.pause();
    }
    this.totalDuration = Math.max(1, Number(minutes) || 1) * 60;
    this.timeRemaining = this.totalDuration;
    this.onTick(this.getState());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    if (this.mode === 'stopwatch') {
      this.stopwatchStartTime = Date.now() - (this.elapsedSeconds * 1000);
    } else {
      this.expectedEndTime = Date.now() + (this.timeRemaining * 1000);
    }

    this.timerId = setInterval(() => this.tick(), 250);
    this.tick();
  }

  pause() {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.onTick(this.getState());
  }

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  }

  reset() {
    this.pause();
    if (this.mode === 'pomodoro') {
      if (this.pomodoroStage === 'work') {
        this.totalDuration = this.options.workDuration;
      } else if (this.pomodoroStage === 'shortBreak') {
        this.totalDuration = this.options.shortBreakDuration;
      } else {
        this.totalDuration = this.options.longBreakDuration;
      }
      this.timeRemaining = this.totalDuration;
    } else if (this.mode === 'countdown') {
      this.timeRemaining = this.totalDuration;
    } else if (this.mode === 'stopwatch') {
      this.elapsedSeconds = 0;
    }
    this.onTick(this.getState());
  }

  skip() {
    if (this.mode === 'pomodoro') {
      this.pause();
      this.handlePomodoroCompletion(true);
    }
  }

  tick() {
    const now = Date.now();

    if (this.mode === 'stopwatch') {
      this.elapsedSeconds = Math.floor((now - this.stopwatchStartTime) / 1000);
      this.onTick(this.getState());
      return;
    }

    const remainingMs = Math.max(0, this.expectedEndTime - now);
    this.timeRemaining = Math.ceil(remainingMs / 1000);

    if (this.timeRemaining <= 0) {
      this.pause();
      this.timeRemaining = 0;
      this.onTick(this.getState());

      if (this.mode === 'pomodoro') {
        this.handlePomodoroCompletion(false);
      } else {
        this.onComplete(this.getState());
      }
    } else {
      this.onTick(this.getState());
    }
  }

  handlePomodoroCompletion(wasSkipped = false) {
    const prevStage = this.pomodoroStage;
    const completedFocusMinutes = Math.round(this.options.workDuration / 60);

    if (prevStage === 'work') {
      this.pomodorosCompletedInCycle++;
      const isLongBreak = (this.pomodorosCompletedInCycle % this.options.longBreakInterval === 0);
      this.pomodoroStage = isLongBreak ? 'longBreak' : 'shortBreak';
      this.totalDuration = isLongBreak ? this.options.longBreakDuration : this.options.shortBreakDuration;
      this.timeRemaining = this.totalDuration;

      this.onComplete({
        ...this.getState(),
        prevStage: 'work',
        wasSkipped,
        completedFocusMinutes
      });

      this.onStageChange(this.getState());

      if (this.options.autoStartBreaks && !wasSkipped) {
        setTimeout(() => this.start(), 1000);
      }
    } else {
      this.pomodoroStage = 'work';
      this.totalDuration = this.options.workDuration;
      this.timeRemaining = this.totalDuration;

      this.onComplete({
        ...this.getState(),
        prevStage: 'break',
        wasSkipped
      });

      this.onStageChange(this.getState());

      if (this.options.autoStartPomodoro && !wasSkipped) {
        setTimeout(() => this.start(), 1000);
      }
    }
    this.onTick(this.getState());
  }

  getState() {
    let displaySeconds = this.timeRemaining;
    if (this.mode === 'stopwatch') {
      displaySeconds = this.elapsedSeconds;
    }

    const hrs = Math.floor(displaySeconds / 3600);
    const mins = Math.floor((displaySeconds % 3600) / 60);
    const secs = displaySeconds % 60;

    let timeString = '';
    if (hrs > 0) {
      timeString = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      timeString = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    let progress = 0;
    if (this.mode === 'stopwatch') {
      progress = 1;
    } else if (this.totalDuration > 0) {
      progress = Math.max(0, Math.min(1, 1 - (this.timeRemaining / this.totalDuration)));
    }

    return {
      mode: this.mode,
      stage: this.pomodoroStage,
      isRunning: this.isRunning,
      timeRemaining: this.timeRemaining,
      elapsedSeconds: this.elapsedSeconds,
      totalDuration: this.totalDuration,
      timeString,
      progress,
      pomodorosCompletedInCycle: this.pomodorosCompletedInCycle
    };
  }
}

window.TimerEngine = TimerEngine;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TimerEngine;
}
