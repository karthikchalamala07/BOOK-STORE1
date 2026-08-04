class SoundSynth {
  private ctx: AudioContext | null = null;
  private pianoInterval: any = null;
  private masterVolume: GainNode | null = null;
  
  // Wooden Ambient hum and creaks state
  private woodHumOsc: OscillatorNode | null = null;
  private woodHumGain: GainNode | null = null;
  private woodCreakTimeout: any = null;

  constructor() {
    // Initialized on interaction
  }

  private init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    this.ctx = new AudioContextClass();
    this.masterVolume = this.ctx.createGain();
    this.masterVolume.gain.setValueAtTime(0.12, this.ctx.currentTime); // Keep soft and low
    this.masterVolume.connect(this.ctx.destination);
  }

  playPianoNote(frequency: number, duration: number = 4.5) {
    this.init();
    if (!this.ctx || !this.masterVolume) return;
    
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    osc1.type = "sine";
    osc2.type = "triangle";
    
    osc1.frequency.value = frequency;
    osc2.frequency.value = frequency * 2; // Octave harmonic
    
    // Lowpass filter to emulate soft warm piano tone
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(700, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.20, this.ctx.currentTime + 0.15); // soft start
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    
    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterVolume);
    
    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + duration);
    osc2.stop(this.ctx.currentTime + duration);
  }

  playLogoChime() {
    this.init();
    if (!this.ctx || !this.masterVolume) return;
    
    // Golden major 7th chime sequence (sparkles) - gentler volumes
    const notes = [523.25, 659.25, 783.99, 987.77, 1318.51]; // C5, E5, G5, B5, E6
    notes.forEach((freq, index) => {
      setTimeout(() => {
        if (!this.ctx || !this.masterVolume) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const bandpass = this.ctx.createBiquadFilter();
        
        osc.type = "sine";
        osc.frequency.value = freq;
        
        bandpass.type = "bandpass";
        bandpass.frequency.value = freq;
        bandpass.Q.value = 1.0;
        
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.05); // softer chime
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.8);
        
        osc.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(this.masterVolume);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 1.8);
      }, index * 100);
    });
  }

  playPageRustle() {
    this.init();
    if (!this.ctx || !this.masterVolume) return;
    
    // Emulate page rustle with audio buffer noise
    const bufferSize = this.ctx.sampleRate * 0.4; // 0.4s
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill buffer with noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.5;
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.05, this.ctx.currentTime + 0.05); // softer page rustle
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterVolume);
    
    noise.start();
  }

  playWoodCreak() {
    this.init();
    if (!this.ctx || !this.masterVolume) return;
    
    // Generate low-frequency brown-like noise for friction
    const bufferSize = this.ctx.sampleRate * 1.0; // 1s creak
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.015 * white)) / 1.015; // low-pass brown noise
      lastOut = data[i];
      // Inject tiny wood friction clicks
      if (Math.random() < 0.004) {
        data[i] += (Math.random() - 0.5) * 0.25;
      }
    }
    
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(140, this.ctx.currentTime); // low wood frequency
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);
    
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.025, this.ctx.currentTime + 0.15); // extremely subtle
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.9);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterVolume);
    
    noise.start();
  }

  startWoodAmbientHum() {
    this.init();
    if (!this.ctx || !this.masterVolume || this.woodHumOsc) return;

    // Create a 55Hz (G1) low frequency acoustic room hum
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(55, this.ctx.currentTime);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(75, this.ctx.currentTime); // cut high harmonic

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.015, this.ctx.currentTime + 3.0); // very soft background hum

    // Breathing modulator to make it wave slightly
    const modulator = this.ctx.createOscillator();
    const modGain = this.ctx.createGain();
    modulator.frequency.value = 0.12; // slow breathing rate
    modGain.gain.value = 0.004;

    modulator.connect(modGain);
    modGain.connect(gain.gain);
    modulator.start();

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterVolume);

    osc.start();

    this.woodHumOsc = osc;
    this.woodHumGain = gain;

    // Periodically play subtle wood creaks
    const scheduleNextCreak = () => {
      const delay = 4000 + Math.random() * 8000; // between 4s and 12s
      this.woodCreakTimeout = setTimeout(() => {
        this.playWoodCreak();
        scheduleNextCreak();
      }, delay);
    };
    scheduleNextCreak();
  }

  startPianoAmbience() {
    this.init();
    if (this.pianoInterval) return;
    
    // Loops soft piano progression chords
    const chords = [
      [220.00, 261.63, 329.63, 392.00, 493.88], // Am9
      [174.61, 261.63, 349.23, 392.00, 440.00], // Fmaj7
      [261.63, 329.63, 392.00, 493.88, 523.25], // Cmaj9
      [196.00, 293.66, 392.00, 440.00, 493.88]  // G6
    ];
    
    let chordIdx = 0;
    const playChord = () => {
      if (!this.ctx) return;
      const notes = chords[chordIdx];
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playPianoNote(freq, 5.0);
        }, idx * 180); // slower arpeggio
      });
      chordIdx = (chordIdx + 1) % chords.length;
    };
    
    playChord();
    this.pianoInterval = setInterval(playChord, 6000); // 6 seconds loop interval

    // Start ambient wood hum + creaks at the same time
    this.startWoodAmbientHum();
  }

  stopAll() {
    if (this.pianoInterval) {
      clearInterval(this.pianoInterval);
      this.pianoInterval = null;
    }
    if (this.woodCreakTimeout) {
      clearTimeout(this.woodCreakTimeout);
      this.woodCreakTimeout = null;
    }
    if (this.woodHumOsc) {
      try {
        this.woodHumOsc.stop();
      } catch (e) {}
      this.woodHumOsc = null;
    }
    this.woodHumGain = null;

    if (this.masterVolume && this.ctx) {
      this.masterVolume.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.2);
      const activeCtx = this.ctx;
      setTimeout(() => {
        try {
          activeCtx.close();
        } catch (e) {}
      }, 1300);
      this.ctx = null;
    }
  }
}

export const soundSynth = new SoundSynth();
