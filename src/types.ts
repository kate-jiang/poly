export type ScaleName = 'pentatonic' | 'major' | 'minor' | 'dorian' | 'mixolydian' | 'blues' | 'chromatic' | 'whole_tone';
export type BounceMode = 'center' | 'edge';
export type NoteName = 'C' | 'C#' | 'D' | 'Eb' | 'E' | 'F' | 'F#' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

export interface PolyNode {
  index: number;
  beats: number;
  color: string;
  progress: number;
  lastBounceDir: 'up' | 'down' | null;
}

export interface Ripple {
  x: number;
  y: number;
  time: number;
  color: string;
}

export interface Trail {
  x: number;
  y: number;
  time: number;
  color: string;
}

export interface AppConfig {
  nodeCount: number;
  speed: number;
  scale: ScaleName;
  root: NoteName;
  octave: number;
  bounceMode: BounceMode;
}

export interface AppState {
  playing: boolean;
  startTime: number;
  nodes: PolyNode[];
  ripples: Ripple[];
  trails: Trail[];
  config: AppConfig;
}
