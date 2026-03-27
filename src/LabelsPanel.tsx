import { useState } from 'react';
import type { AppConfig } from './types';
import { getNodeColors } from './utils';
import { getNoteForNode, SCALES } from './music';

interface LabelsPanelProps {
  config: AppConfig;
}

export function LabelsPanel({ config }: LabelsPanelProps) {
  const [open, setOpen] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  );

  const { nodeCount, scale, root, colorScheme } = config;
  const octave = 4;
  const colors = getNodeColors(nodeCount, colorScheme);

  const labels = [];
  for (let i = 0; i < nodeCount; i++) {
    const note = getNoteForNode(i, nodeCount, SCALES[scale], root, octave);
    labels.push({ note, color: colors[i] });
  }

  return (
    <div className="labels-wrapper">
      <button
        className={`labels-toggle${open ? ' open' : ''}`}
        onClick={() => setOpen(v => !v)}
      >
        Notes <span className="chevron">&#9660;</span>
      </button>
      <div className={`node-labels${open ? ' visible' : ''}`}>
        {labels.map((l, i) => (
          <div key={i} className="node-label">
            <span style={{ color: `hsl(${l.color})` }}>{l.note}</span>
            <span className="node-dot" style={{ background: `hsl(${l.color})` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
