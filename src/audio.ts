import * as Tone from 'tone';

export class AudioEngine {
  private synths: Tone.Synth[] = [];
  private reverb: Tone.Reverb | null = null;
  private compressor: Tone.Compressor | null = null;
  private ready = false;

  init(): void {
    if (this.ready) return;
    this.reverb = new Tone.Reverb({ decay: 2.5, wet: 0.3 }).toDestination();
    this.compressor = new Tone.Compressor(-20, 4).connect(this.reverb);
    this.ready = true;
  }

  rebuild(count: number): void {
    if (!this.ready || !this.compressor) return;
    this.synths.forEach(s => s.dispose());
    this.synths = [];

    for (let i = 0; i < count; i++) {
      const s = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.25, sustain: 0, release: 0.4 },
      }).connect(this.compressor);
      this.synths.push(s);
    }
  }

  triggerNote(index: number, note: string): void {
    if (!this.ready || index >= this.synths.length) return;
    try {
      this.synths[index].triggerAttackRelease(note, '16n');
    } catch {}
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
    this.compressor = null;
    this.reverb = null;
    this.ready = false;
  }
}
