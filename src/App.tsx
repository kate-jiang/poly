import { useState, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import type { AppConfig } from './types';
import { AudioEngine } from './audio';
import { getNoteForNode, SCALES } from './music';
import { Canvas } from './Canvas';
import { Controls } from './Controls';
import { LabelsPanel } from './LabelsPanel';

const DEFAULT_CONFIG: AppConfig = {
  nodeCount: 30,
  speed: 40,
  scale: 'pentatonic',
  root: 'C',
  bounceMode: 'center',
  reverb: 40,
};

export function App() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<AudioEngine | null>(null);

  const handleBounce = useCallback((nodeIndex: number, currentConfig: AppConfig) => {
    const audio = audioRef.current;
    if (!audio) return;
    const { scale, root } = currentConfig;
    const note = getNoteForNode(nodeIndex, currentConfig.nodeCount, SCALES[scale], root, 4);
    audio.triggerNote(nodeIndex, note);
  }, []);

  const handlePlay = useCallback(async () => {
    if (!playing) {
      try {
        if (!audioRef.current) audioRef.current = new AudioEngine();
        audioRef.current.init();
        await Tone.start();
        audioRef.current.rebuild(config.nodeCount);
      } catch (e) {
        console.warn('Audio init failed:', e);
      }
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  }, [playing, config.nodeCount]);

  const handleConfigChange = useCallback((update: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...update }));
    if (update.nodeCount !== undefined) {
      audioRef.current?.rebuild(update.nodeCount);
    }
    if (update.reverb !== undefined) {
      audioRef.current?.setReverb(update.reverb / 133);
    }
  }, []);

  return (
    <>
      <div className="title-area">
        <h1>POLY</h1>
        <p>visualizer</p>
      </div>
      <LabelsPanel config={config} />
      <Canvas
        config={config}
        playing={playing}
        onBounce={handleBounce}
      />
      <Controls
        config={config}
        playing={playing}
        onConfigChange={handleConfigChange}
        onPlay={handlePlay}
      />
    </>
  );
}
