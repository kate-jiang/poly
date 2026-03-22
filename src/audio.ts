import * as Tone from 'tone';

export class AudioEngine {
  private synths: Tone.Synth[] = [];
  private reverb: Tone.Reverb | null = null;
  private compressor: Tone.Compressor | null = null;
  private limiter: Tone.Limiter | null = null;
  private ready = false;
  private static contextConfigured = false;

  init(): void {
    if (this.ready) return;
    if (!AudioEngine.contextConfigured) {
      const rawCtx = new AudioContext({ latencyHint: 'playback', sampleRate: 44100 });
      Tone.setContext(new Tone.Context(rawCtx));
      AudioEngine.contextConfigured = true;
    }
    this.limiter = new Tone.Limiter(-2).toDestination();
    this.reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).connect(this.limiter);
    this.compressor = new Tone.Compressor({
      threshold: -24,
      ratio: 8,
      attack: 0.003,
      release: 0.15,
    }).connect(this.reverb);
    this.ready = true;
  }

  rebuild(count: number): void {
    if (!this.ready || !this.compressor) return;
    this.synths.forEach(s => s.dispose());
    this.synths = [];

    const vol = -10 * Math.log10(count);
    for (let i = 0; i < count; i++) {
      const s = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.25, sustain: 0, release: 0.4 },
        volume: vol,
      }).connect(this.compressor);
      this.synths.push(s);
    }
  }

  triggerNote(index: number, note: string): void {
    if (!this.ready || index >= this.synths.length) return;
    try {
      const now = Tone.now() + 0.02;
      this.synths[index].triggerAttackRelease(note, '16n', now);
    } catch (e) {
      console.warn('triggerNote:', e);
    }
  }

  setReverb(wet: number): void {
    if (this.reverb) {
      this.reverb.wet.value = wet;
    }
  }

  dispose(): void {
    this.synths.forEach(s => s.dispose());
    this.synths = [];
    this.compressor?.dispose();
    this.reverb?.dispose();
    this.limiter?.dispose();
    this.compressor = null;
    this.reverb = null;
    this.limiter = null;
    this.ready = false;
  }
}
