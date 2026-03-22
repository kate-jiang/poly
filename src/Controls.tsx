import { useState } from 'react';
import type { AppConfig, ScaleName, NoteName } from './types';

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
          className={`play-btn${playing ? ' playing' : ''}`}
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
              max={40}
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
          <div className="select-wrap">
            <select
              value={config.scale}
              onChange={e => onConfigChange({ scale: e.target.value as ScaleName })}
            >
              <option value="pentatonic">Pentatonic</option>
              <option value="ionian">Ionian</option>
              <option value="lydian">Lydian</option>
              <option value="blues">Blues</option>
              <option value="whole_tone">Whole Tone</option>
              <option value="chromatic">Chromatic</option>
            </select>
          </div>
        </div>

        <div className="control-group desktop-only">
          <label>Key</label>
          <div className="select-wrap">
            <select
              value={config.root}
              onChange={e => onConfigChange({ root: e.target.value as NoteName })}
            >
              <option value="C">C</option>
              <option value="C#">C#</option>
              <option value="D">D</option>
              <option value="Eb">Eb</option>
              <option value="E">E</option>
              <option value="F">F</option>
              <option value="F#">F#</option>
              <option value="G">G</option>
              <option value="Ab">Ab</option>
              <option value="A">A</option>
              <option value="Bb">Bb</option>
              <option value="B">B</option>
            </select>
          </div>
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
              <div className="select-wrap">
                <select
                  value={config.scale}
                  onChange={e => onConfigChange({ scale: e.target.value as ScaleName })}
                >
                  <option value="pentatonic">Pentatonic</option>
                  <option value="ionian">Ionian</option>
                  <option value="lydian">Lydian</option>
                  <option value="blues">Blues</option>
                  <option value="whole_tone">Whole Tone</option>
                  <option value="chromatic">Chromatic</option>
                </select>
              </div>
            </div>

            <div className="control-group">
              <label>Key</label>
              <div className="select-wrap">
                <select
                  value={config.root}
                  onChange={e => onConfigChange({ root: e.target.value as NoteName })}
                >
                  <option value="C">C</option>
                  <option value="C#">C#</option>
                  <option value="D">D</option>
                  <option value="Eb">Eb</option>
                  <option value="E">E</option>
                  <option value="F">F</option>
                  <option value="F#">F#</option>
                  <option value="G">G</option>
                  <option value="Ab">Ab</option>
                  <option value="A">A</option>
                  <option value="Bb">Bb</option>
                  <option value="B">B</option>
                </select>
              </div>
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
                  max={40}
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
        </div>
      </div>
    </>
  );
}
