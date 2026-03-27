import { useState } from 'react';
import type { AppConfig, ScaleName, NoteName, ColorSchemeName } from './types';
import { Dropdown, type DropdownOption } from './Dropdown';
import { getColorForPosition } from './utils';

const SCALE_OPTIONS: DropdownOption<ScaleName>[] = [
  { value: 'pentatonic', label: 'Pentatonic' },
  { value: 'ionian', label: 'Ionian' },
  { value: 'lydian', label: 'Lydian' },
  { value: 'blues', label: 'Blues' },
  { value: 'whole_tone', label: 'Whole Tone' },
  { value: 'chromatic', label: 'Chromatic' },
];

const KEY_OPTIONS: DropdownOption<NoteName>[] = (
  ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as NoteName[]
).map(k => ({ value: k, label: k }));

function ColorSwatch({ scheme }: { scheme: ColorSchemeName }) {
  const stops = [0.1, 0.3, 0.5, 0.7, 0.9].map(t => `hsl(${getColorForPosition(t, scheme)})`);
  return <span className="color-swatch" style={{ background: `linear-gradient(to right, ${stops.join(', ')})` }} />;
}

const COLOR_SCHEME_NAMES: ColorSchemeName[] = ['rainbow', 'sunset', 'forest', 'ocean', 'neon', 'mono'];
const COLOR_LABELS: Record<ColorSchemeName, string> = {
  rainbow: 'Rainbow', ocean: 'Ocean', forest: 'Forest', sunset: 'Sunset',
  neon: 'Neon', mono: 'Mono',
};
const COLOR_OPTIONS: DropdownOption<ColorSchemeName>[] = COLOR_SCHEME_NAMES.map(s => ({
  value: s,
  label: COLOR_LABELS[s],
  icon: <ColorSwatch scheme={s} />,
}));

function randomizeConfig(): Partial<AppConfig> {
  return {
    nodeCount: Math.floor(Math.random() * 49) + 2,
    speed: Math.floor(Math.random() * 100) + 1,
    reverb: Math.floor(Math.random() * 101),
    scale: SCALE_OPTIONS[Math.floor(Math.random() * SCALE_OPTIONS.length)].value,
    root: KEY_OPTIONS[Math.floor(Math.random() * KEY_OPTIONS.length)].value,
    bounceMode: Math.random() > 0.5 ? 'edge' : 'center',
    colorScheme: COLOR_SCHEME_NAMES[Math.floor(Math.random() * COLOR_SCHEME_NAMES.length)],
  };
}

interface ControlsProps {
  config: AppConfig;
  playing: boolean;
  onConfigChange: (update: Partial<AppConfig>) => void;
  onPlay: () => void;
}

export function Controls({ config, playing, onConfigChange, onPlay }: ControlsProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <div className="controls">
        <button
          className="play-btn"
          title="Play / Reset"
          onClick={onPlay}
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ display: playing ? 'none' : 'block' }}
          >
            <polygon points="6,3 20,12 6,21" />
          </svg>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            style={{ display: playing ? 'block' : 'none' }}
          >
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
          </svg>
        </button>

        <div className="control-divider desktop-only" />

        <div className="control-group desktop-only">
          <label>Nodes</label>
          <div className="row">
            <input
              type="range"
              min={2}
              max={50}
              value={config.nodeCount}
              onChange={e => onConfigChange({ nodeCount: parseInt(e.target.value) })}
            />
            <span className="val">{config.nodeCount}</span>
          </div>
        </div>

        <div className="control-group desktop-only">
          <label>Speed</label>
          <div className="row">
            <input
              type="range"
              min={1}
              max={100}
              value={config.speed}
              onChange={e => onConfigChange({ speed: parseInt(e.target.value) })}
            />
            <span className="val">{config.speed}%</span>
          </div>
        </div>

        <div className="control-group desktop-only">
          <label>Reverb</label>
          <div className="row">
            <input
              type="range"
              min={0}
              max={100}
              value={config.reverb}
              onChange={e => onConfigChange({ reverb: parseInt(e.target.value) })}
            />
            <span className="val">{config.reverb}%</span>
          </div>
        </div>

        <div className="control-divider desktop-only" />

        <div className="control-group">
          <label>Scale</label>
          <Dropdown value={config.scale} options={SCALE_OPTIONS} onChange={v => onConfigChange({ scale: v })} />
        </div>

        <div className="control-group desktop-only">
          <label>Key</label>
          <Dropdown value={config.root} options={KEY_OPTIONS} onChange={v => onConfigChange({ root: v })} />
        </div>

        <div className="control-group desktop-only">
          <label>Color</label>
          <Dropdown value={config.colorScheme} options={COLOR_OPTIONS} onChange={v => onConfigChange({ colorScheme: v })} />
        </div>

        <div className="control-divider desktop-only" />

        <div className="control-group">
          <label>Start Position</label>
          <div className="row">
            <span className="switch-label">Center</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={config.bounceMode === 'edge'}
                onChange={e => onConfigChange({ bounceMode: e.target.checked ? 'edge' : 'center' })}
              />
              <span className="switch-slider" />
            </label>
            <span className="switch-label">Edge</span>
          </div>
        </div>

        <div className="control-divider desktop-only" />

        <div className="control-group desktop-only">
          <label>crazy style</label>
          <button
            className="random-btn"
            onClick={() => onConfigChange(randomizeConfig())}
          >
            Randomize
          </button>
        </div>

        <button
          className={`sheet-toggle${sheetOpen ? ' open' : ''}`}
          onClick={() => setSheetOpen(v => !v)}
          aria-label="More controls"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6,15 12,9 18,15" />
          </svg>
        </button>
      </div>

      {/* Bottom sheet for mobile */}
      <div
        className={`sheet-backdrop${sheetOpen ? ' visible' : ''}`}
        onClick={() => setSheetOpen(false)}
      />
      <div className={`bottom-sheet${sheetOpen ? ' open' : ''}`}>
        <div className="sheet-handle" onClick={() => setSheetOpen(false)}>
          <div className="sheet-handle-bar" />
        </div>
        <div className="sheet-content">
          <div className="sheet-row sheet-controls">
            <div className="control-group">
              <label>Scale</label>
              <Dropdown value={config.scale} options={SCALE_OPTIONS} onChange={v => onConfigChange({ scale: v })} />
            </div>

            <div className="control-group">
              <label>Key</label>
              <Dropdown value={config.root} options={KEY_OPTIONS} onChange={v => onConfigChange({ root: v })} />
            </div>

            <div className="control-group">
              <label>Color</label>
              <Dropdown value={config.colorScheme} options={COLOR_OPTIONS} onChange={v => onConfigChange({ colorScheme: v })} />
            </div>

            <div className="control-group">
              <label>Start Position</label>
              <div className="row">
                <span className="switch-label">Center</span>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={config.bounceMode === 'edge'}
                    onChange={e => onConfigChange({ bounceMode: e.target.checked ? 'edge' : 'center' })}
                  />
                  <span className="switch-slider" />
                </label>
                <span className="switch-label">Edge</span>
              </div>
            </div>
          </div>

          <div className="control-group">
            <label>Nodes</label>
            <div className="touch-target">
              <div className="row">
                <input
                  type="range"
                  min={2}
                  max={50}
                  value={config.nodeCount}
                  onChange={e => onConfigChange({ nodeCount: parseInt(e.target.value) })}
                />
                <span className="val">{config.nodeCount}</span>
              </div>
            </div>
          </div>

          <div className="control-group">
            <label>Speed</label>
            <div className="touch-target">
              <div className="row">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={config.speed}
                  onChange={e => onConfigChange({ speed: parseInt(e.target.value) })}
                />
                <span className="val">{config.speed}%</span>
              </div>
            </div>
          </div>

          <div className="control-group">
            <label>Reverb</label>
            <div className="touch-target">
              <div className="row">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={config.reverb}
                  onChange={e => onConfigChange({ reverb: parseInt(e.target.value) })}
                />
                <span className="val">{config.reverb}%</span>
              </div>
            </div>
          </div>

          <div className="sheet-row">
            <button
              className="random-btn sheet-random"
              onClick={() => onConfigChange(randomizeConfig())}
            >
              Randomize
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
