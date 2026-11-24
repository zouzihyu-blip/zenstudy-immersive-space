/**
 * ZenStudy - High-Fidelity Web Audio Synthesis & Sound Mixer Engine
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.tracks = {};
    this.lofiPlayer = null;
    this.lofiPlaying = false;
    this.proceduralLofiActive = false;
    this.lofiTimer = null;

    this.trackConfigs = [
      { id: 'rain', name: '細雨連綿', icon: '🌧️', volume: 0 },
      { id: 'cafe', name: '咖啡漫談', icon: '☕', volume: 0 },
      { id: 'fireplace', name: '溫暖壁爐', icon: '🪵', volume: 0 },
      { id: 'waves', name: '寧靜海浪', icon: '🌊', volume: 0 },
      { id: 'keyboard', name: '機械鍵盤', icon: '⌨️', volume: 0 },
      { id: 'nature', name: '森林蟲鳴', icon: '🍃', volume: 0 },
      { id: 'thunder', name: '遠處雷鳴', icon: '⚡', volume: 0 },
      { id: 'whitenoise', name: '深度白噪', icon: '📻', volume: 0 }
    ];
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.trackConfigs.forEach(cfg => {
      this.initTrack(cfg.id);
    });
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  initTrack(id) {
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    gainNode.connect(this.masterGain);

    this.tracks[id] = {
      gainNode,
      volume: 0,
      active: false,
      sources: []
    };
  }

  createNoiseBuffer(type = 'white', seconds = 5) {
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (type === 'white') {
        output[i] = white * 0.15;
      } else if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      } else if (type === 'brown') {
        lastOut = (lastOut + (0.02 * white)) / 1.02;
        output[i] = lastOut * 0.6;
      }
    }
    return buffer;
  }

  startTrackSynth(id) {
    const track = this.tracks[id];
    if (!track || track.active) return;
    track.active = true;

    if (id === 'rain') {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer('pink', 6);
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(track.gainNode);
      noise.start();
      track.sources.push(noise);

    } else if (id === 'fireplace') {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer('brown', 6);
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(track.gainNode);
      noise.start();
      track.sources.push(noise);

      const crackleInterval = setInterval(() => {
        if (!track.active || track.volume === 0) return;
        if (Math.random() > 0.4) {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800 + Math.random() * 2400, this.ctx.currentTime);

          g.gain.setValueAtTime(0.08 * Math.random(), this.ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.04);

          osc.connect(g);
          g.connect(track.gainNode);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.05);
        }
      }, 120);
      track.timer = crackleInterval;

    } else if (id === 'waves') {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer('pink', 8);
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      const swellGain = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(swellGain.gain);

      noise.connect(filter);
      filter.connect(swellGain);
      swellGain.connect(track.gainNode);

      noise.start();
      lfo.start();
      track.sources.push(noise, lfo);

    } else if (id === 'cafe') {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer('pink', 6);
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(550, this.ctx.currentTime);
      filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(track.gainNode);
      noise.start();
      track.sources.push(noise);

    } else if (id === 'whitenoise') {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer('white', 5);
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3500, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(track.gainNode);
      noise.start();
      track.sources.push(noise);

    } else if (id === 'keyboard') {
      const keyInterval = setInterval(() => {
        if (!track.active || track.volume === 0) return;
        if (Math.random() > 0.25) {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300 + Math.random() * 400, this.ctx.currentTime);

          g.gain.setValueAtTime(0.06, this.ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.03);

          osc.connect(g);
          g.connect(track.gainNode);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.04);
        }
      }, 160);
      track.timer = keyInterval;

    } else if (id === 'nature') {
      const noise = this.ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer('pink', 5);
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(2200, this.ctx.currentTime);

      noise.connect(filter);
      filter.connect(track.gainNode);
      noise.start();
      track.sources.push(noise);

      const chirpInterval = setInterval(() => {
        if (!track.active || track.volume === 0) return;
        if (Math.random() > 0.65) {
          this.playBirdChirp(track.gainNode);
        }
      }, 2500);
      track.timer = chirpInterval;

    } else if (id === 'thunder') {
      const thunderInterval = setInterval(() => {
        if (!track.active || track.volume === 0) return;
        if (Math.random() > 0.5) {
          this.playThunderRumble(track.gainNode);
        }
      }, 10000);
      track.timer = thunderInterval;
    }
  }

  playBirdChirp(targetGain) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const now = this.ctx.currentTime;
    osc.type = 'sine';
    const baseFreq = 2600 + Math.random() * 600;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.18);

    g.gain.setValueAtTime(0.03, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(g);
    g.connect(targetGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playThunderRumble(targetGain) {
    if (!this.ctx) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer('brown', 4);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    const g = this.ctx.createGain();
    const now = this.ctx.currentTime;
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.2, now + 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

    noise.connect(filter);
    filter.connect(g);
    g.connect(targetGain);
    noise.start(now);
    noise.stop(now + 4);
  }

  setTrackVolume(id, volume) {
    this.ensureContext();
    const vol = Math.max(0, Math.min(1, Number(volume) || 0));
    const track = this.tracks[id];
    if (!track) return;

    track.volume = vol;
    if (vol > 0 && !track.active) {
      this.startTrackSynth(id);
    }

    if (this.ctx && track.gainNode) {
      track.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      track.gainNode.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.1);
    }
  }

  setMasterVolume(volume) {
    this.ensureContext();
    const vol = Math.max(0, Math.min(1, Number(volume) || 0));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : vol, this.ctx.currentTime + 0.1);
    }
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : 0.85;
      this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(target, this.ctx.currentTime + 0.15);
    }
    return this.isMuted;
  }

  playAlarm(type = 'singing-bowl') {
    this.ensureContext();
    const now = this.ctx.currentTime;

    if (type === 'singing-bowl') {
      const baseFreq = 220;
      const harmonics = [1, 2.76, 5.4, 8.9];
      const gains = [0.4, 0.15, 0.08, 0.03];

      harmonics.forEach((h, i) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq * h, now);

        g.gain.setValueAtTime(gains[i], now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);

        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 4.6);
      });

    } else if (type === 'soft-bell') {
      [659.25, 987.77].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        g.gain.setValueAtTime(0.25, now + idx * 0.15);
        g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 2.8);

        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 3.0);
      });

    } else {
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        g.gain.setValueAtTime(0.2, now + idx * 0.12);
        g.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);

        osc.connect(g);
        g.connect(this.masterGain);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.3);
      });
    }
  }

  toggleProceduralLofi() {
    this.ensureContext();
    this.proceduralLofiActive = !this.proceduralLofiActive;

    if (this.proceduralLofiActive) {
      const chords = [
        [174.61, 261.63, 329.63, 392.00],
        [146.83, 220.00, 261.63, 329.63],
        [130.81, 196.00, 246.94, 293.66],
        [164.81, 246.94, 311.13, 392.00]
      ];
      let step = 0;

      const playChord = () => {
        if (!this.proceduralLofiActive) return;
        const currentChord = chords[step % chords.length];
        step++;

        currentChord.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          const g = this.ctx.createGain();
          const now = this.ctx.currentTime;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(700, now);

          g.gain.setValueAtTime(0.08, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

          osc.connect(filter);
          filter.connect(g);
          g.connect(this.masterGain);

          osc.start(now);
          osc.stop(now + 4.0);
        });

        this.lofiTimer = setTimeout(playChord, 4200);
      };

      playChord();
    } else {
      if (this.lofiTimer) {
        clearTimeout(this.lofiTimer);
        this.lofiTimer = null;
      }
    }
    return this.proceduralLofiActive;
  }
}

window.AudioEngine = AudioEngine;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioEngine;
}
