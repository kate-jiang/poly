import { useRef, useEffect } from 'react';
import type { AppConfig } from './types';
import { Renderer } from './renderer';

interface CanvasProps {
  config: AppConfig;
  playing: boolean;
  onBounce: (nodeIndex: number, config: AppConfig) => void;
}

export function Canvas({ config, playing, onBounce }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);

  // Mount: create renderer, start loop
  useEffect(() => {
    const renderer = new Renderer(canvasRef.current!, config);
    rendererRef.current = renderer;
    renderer.start(onBounce);
    return () => renderer.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync config
  useEffect(() => {
    rendererRef.current?.updateConfig(config);
  }, [config]);

  // Sync playing
  useEffect(() => {
    rendererRef.current?.setPlaying(playing);
  }, [playing]);

  // Rebuild nodes when count changes
  useEffect(() => {
    rendererRef.current?.rebuildNodes(config.nodeCount);
  }, [config.nodeCount]);

  return <canvas ref={canvasRef} id="canvas" />;
}
