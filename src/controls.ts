import * as Tone from 'tone';
import type { AppState, ScaleName, NoteName } from './types';
import { AudioEngine } from './audio';
import { Renderer } from './renderer';
import { createNodes, getNodeColors } from './state';
import { getNoteForNode, SCALES } from './music';

function $(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function updateLabels(state: AppState): void {
  const container = $('nodeLabels');
  const { nodeCount, scale, root, octave } = state.config;
  const colors = getNodeColors(nodeCount);
  container.innerHTML = '';
  for (let i = 0; i < nodeCount; i++) {
    const note = getNoteForNode(i, nodeCount, SCALES[scale], root, octave);
    const div = document.createElement('div');
    div.className = 'node-label';
    div.innerHTML = `<span style="color:${colors[i]}">${note}</span><span class="node-dot" style="background:${colors[i]}"></span>`;
    container.appendChild(div);
  }
}

export function bindControls(state: AppState, audio: AudioEngine, _renderer: Renderer): void {
  const playBtn = $('playBtn') as HTMLButtonElement;
  const playIcon = $('playIcon');
  const resetIcon = $('resetIcon');

  let lastClickTime = 0;
  playBtn.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastClickTime < 300) return;
    lastClickTime = now;
    state.nodes.forEach(n => { n.lastBounceDir = null; });
    if (!state.playing) {
      audio.init();
      Tone.start();
      audio.rebuild(state.config.nodeCount);
      state.playing = true;
      state.startTime = performance.now();
      playBtn.classList.add('playing');
      playIcon.style.display = 'none';
      resetIcon.style.display = 'block';
    } else {
      state.playing = false;
      state.startTime = 0;
      playBtn.classList.remove('playing');
      playIcon.style.display = 'block';
      resetIcon.style.display = 'none';
    }
  });

  ($('nodeCount') as HTMLInputElement).addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    $('nodeCountVal').textContent = val;
    state.config.nodeCount = parseInt(val);
    createNodes(state);
    updateLabels(state);
    audio.rebuild(state.config.nodeCount);
  });

  ($('speed') as HTMLInputElement).addEventListener('input', (e) => {
    const val = (e.target as HTMLInputElement).value;
    $('speedVal').textContent = val + '%';
    state.config.speed = parseInt(val);
  });

  ($('scaleSelect') as HTMLSelectElement).addEventListener('change', (e) => {
    state.config.scale = (e.target as HTMLSelectElement).value as ScaleName;
    updateLabels(state);
  });

  ($('rootSelect') as HTMLSelectElement).addEventListener('change', (e) => {
    state.config.root = (e.target as HTMLSelectElement).value as NoteName;
    updateLabels(state);
  });

  ($('bounceMode') as HTMLInputElement).addEventListener('change', (e) => {
    state.config.bounceMode = (e.target as HTMLInputElement).checked ? 'edge' : 'center';
  });

  // Labels panel toggle
  const labelsToggle = $('labelsToggle') as HTMLButtonElement;
  const nodeLabels = $('nodeLabels');
  const isDesktop = window.matchMedia('(min-width: 768px)').matches;
  if (isDesktop) {
    nodeLabels.classList.add('visible');
    labelsToggle.classList.add('open');
  }
  labelsToggle.addEventListener('click', () => {
    const isOpen = nodeLabels.classList.toggle('visible');
    labelsToggle.classList.toggle('open', isOpen);
  });

  // Initial labels
  updateLabels(state);
}
