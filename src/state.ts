import type { AppState, PolyNode } from './types';

export function getNodeColors(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (i / count) * 300 + 30;
    const sat = 70 + Math.sin(i * 0.8) * 20;
    const light = 55 + Math.cos(i * 0.5) * 15;
    colors.push(`hsl(${hue}, ${sat}%, ${light}%)`);
  }
  return colors;
}

export function createNodes(state: AppState): void {
  const n = state.config.nodeCount;
  const colors = getNodeColors(n);
  state.nodes = [];
  for (let i = 0; i < n; i++) {
    state.nodes.push({
      index: i,
      beats: i + 2,
      color: colors[i],
      progress: 0,
      lastBounceDir: null,
    });
  }
}

export const state: AppState = {
  playing: false,
  startTime: 0,
  nodes: [],
  ripples: [],
  trails: [],
  config: {
    nodeCount: 30,
    speed: 40,
    scale: 'pentatonic',
    root: 'C',
    octave: 4,
    bounceMode: 'center',
  },
};
