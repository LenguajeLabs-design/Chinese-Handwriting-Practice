let sharedContext: AudioContext | null = null;
let noiseBuffer: AudioBuffer | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!sharedContext) {
    sharedContext = new AudioContextClass();
  }
  return sharedContext;
}

function getNoiseBuffer(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer;
  const length = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  noiseBuffer = buffer;
  return buffer;
}

export class WritingSoundEngine {
  private ctx: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private gain: GainNode | null = null;
  private lastX = 0;
  private lastY = 0;
  private active = false;

  private ensureContext() {
    if (!this.ctx) {
      this.ctx = getContext();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  start(x: number, y: number) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.stop();

    const source = ctx.createBufferSource();
    source.buffer = getNoiseBuffer(ctx);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2200;
    filter.Q.value = 0.7;

    const gain = ctx.createGain();
    gain.gain.value = 0;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.012, now + 0.03);

    source.start();

    this.source = source;
    this.filter = filter;
    this.gain = gain;
    this.lastX = x;
    this.lastY = y;
    this.active = true;
  }

  move(x: number, y: number) {
    if (!this.active || !this.ctx || !this.filter || !this.gain) return;

    const dx = x - this.lastX;
    const dy = y - this.lastY;
    const speed = Math.min(Math.sqrt(dx * dx + dy * dy), 40);
    this.lastX = x;
    this.lastY = y;

    const now = this.ctx.currentTime;
    const targetFreq = 1800 + speed * 30 + Math.random() * 200;
    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.linearRampToValueAtTime(targetFreq, now + 0.05);

    const targetGain = speed > 0.5 ? 0.014 : 0.006;
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.linearRampToValueAtTime(targetGain, now + 0.04);
  }

  stop() {
    if (this.gain && this.ctx) {
      const now = this.ctx.currentTime;
      this.gain.gain.cancelScheduledValues(now);
      this.gain.gain.setValueAtTime(this.gain.gain.value, now);
      this.gain.gain.linearRampToValueAtTime(0, now + 0.08);
    }

    const source = this.source;
    if (source) {
      setTimeout(() => {
        try {
          source.stop();
          source.disconnect();
        } catch {}
      }, 100);
    }

    this.source = null;
    this.filter = null;
    this.gain = null;
    this.active = false;
  }
}
