import { state, createNodes } from './state';
import { AudioEngine } from './audio';
import { Renderer } from './renderer';
import { bindControls } from './controls';
import { getNoteForNode, SCALES } from './music';

const audio = new AudioEngine();
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const renderer = new Renderer(canvas);

createNodes(state);
bindControls(state, audio, renderer);

renderer.start(state, (nodeIndex) => {
  const { scale, root, octave } = state.config;
  const note = getNoteForNode(nodeIndex, state.nodes.length, SCALES[scale], root, octave);
  audio.triggerNote(nodeIndex, note);
});
