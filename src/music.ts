import type { ScaleName, NoteName } from './types';

export const SCALES: Record<ScaleName, readonly number[]> = {
  pentatonic: [0, 2, 4, 7, 9],
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  blues: [0, 3, 5, 6, 7, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  whole_tone: [0, 2, 4, 6, 8, 10],
};

export const NOTE_NAMES: readonly NoteName[] = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];

export function getNoteForNode(index: number, count: number, scale: readonly number[], root: NoteName, baseOctave: number): string {
  const rootIdx = NOTE_NAMES.indexOf(root);
  const centered = index - Math.floor(count / 2);
  const scaleIdx = ((centered % scale.length) + scale.length) % scale.length;
  const octaveOffset = Math.floor(centered / scale.length);
  const midi = rootIdx + scale[scaleIdx] + (baseOctave + octaveOffset) * 12;
  const noteName = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12);
  return `${noteName}${octave}`;
}
