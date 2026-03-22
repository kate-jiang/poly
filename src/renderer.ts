import type { AppState } from './types';

function hsla(hslStr: string, alpha: number): string {
  const match = hslStr.match(/hsl\(([^)]+)\)/);
  if (!match) return hslStr;
  return `hsla(${match[1]}, ${alpha})`;
}

interface CircleGeometry {
  center: { x: number; y: number };
  radius: number;
}

function computeCircle(w: number, h: number): CircleGeometry {
  return {
    center: { x: w * 0.5, y: h * 0.5 },
    radius: Math.min(w, h) * 0.28,
  };
}

interface NodeFrame {
  x: number;
  y: number;
  dist: number;
  angle: number;
  proximity: number;
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  start(state: AppState, onBounce: (nodeIndex: number) => void): void {
    const draw = (timestamp: number) => {
      this.animFrameId = requestAnimationFrame(draw);
      this.render(timestamp, state, onBounce);
    };
    this.animFrameId = requestAnimationFrame(draw);
  }

  stop(): void {
    cancelAnimationFrame(this.animFrameId);
  }

  private render(timestamp: number, state: AppState, onBounce: (nodeIndex: number) => void): void {
    const ctx = this.ctx;
    const W = window.innerWidth;
    const H = window.innerHeight;

    // --- Background ---
    const grad = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.7);
    grad.addColorStop(0, '#101018');
    grad.addColorStop(0.5, '#08080e');
    grad.addColorStop(1, '#030306');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    const circle = computeCircle(W, H);
    const { center, radius } = circle;
    const n = state.nodes.length;

    // Time
    const edgeMode = state.config.bounceMode === 'edge';
    const cycleDuration = (edgeMode ? 3200 : 1600) / state.config.speed;
    let elapsed = 0;
    if (state.playing) {
      elapsed = (timestamp - state.startTime) / 1000;
    }

    // === Phase 1: Compute all node positions & handle bounce detection ===
    const frames: NodeFrame[] = [];
    state.nodes.forEach((node, i) => {
      const angle = (i / n) * Math.PI * 2;
      const freq = node.beats;
      const phase = (elapsed / cycleDuration) * freq * Math.PI;

      let dist: number;
      if (edgeMode) {
        const edgePhase = phase * 2;
        const t = ((edgePhase / Math.PI) % 2 + 2) % 2;
        const tri = 2 * Math.abs(t - 1) - 1;
        dist = tri * Math.abs(tri) * radius;

        const sinVal2 = Math.sin(edgePhase);
        const bounceDir: 'up' | 'down' = sinVal2 >= 0 ? 'up' : 'down';
        if (state.playing && node.lastBounceDir && bounceDir !== node.lastBounceDir) {
          const edgeDist = dist > 0 ? radius : -radius;
          const bx = center.x + Math.cos(angle) * edgeDist;
          const by = center.y + Math.sin(angle) * edgeDist;
          state.ripples.push({ x: bx, y: by, time: timestamp, color: node.color });
          onBounce(i);
        }
        node.lastBounceDir = bounceDir;
      } else {
        const sinVal = Math.sin(phase);
        const bounce = Math.abs(sinVal);
        dist = bounce * radius;

        const bounceDir: 'up' | 'down' = sinVal >= 0 ? 'up' : 'down';
        if (state.playing && node.lastBounceDir && bounceDir !== node.lastBounceDir) {
          const bx = center.x + Math.cos(angle) * radius * (bounce < 0.15 ? 0 : bounce);
          const by = center.y + Math.sin(angle) * radius * (bounce < 0.15 ? 0 : bounce);
          state.ripples.push({ x: bx, y: by, time: timestamp, color: node.color });
          onBounce(i);
        }
        node.lastBounceDir = bounceDir;
      }

      const x = center.x + Math.cos(angle) * dist;
      const y = center.y + Math.sin(angle) * dist;
      const proximity = Math.abs(dist) / radius;
      frames.push({ x, y, dist, angle, proximity });

      if (state.playing && Math.random() > 0.5) {
        state.trails.push({ x, y, time: timestamp, color: node.color });
      }
    });

    // === Phase 2: Draw layers back-to-front ===

    // --- Track lines (subtle radial guides) ---
    state.nodes.forEach((node, i) => {
      const { angle } = frames[i];
      ctx.beginPath();
      if (edgeMode) {
        const x1 = center.x - Math.cos(angle) * radius;
        const y1 = center.y - Math.sin(angle) * radius;
        const x2 = center.x + Math.cos(angle) * radius;
        const y2 = center.y + Math.sin(angle) * radius;
        const tg = ctx.createLinearGradient(x1, y1, x2, y2);
        tg.addColorStop(0, hsla(node.color, 0.06));
        tg.addColorStop(0.45, 'transparent');
        tg.addColorStop(0.55, 'transparent');
        tg.addColorStop(1, hsla(node.color, 0.06));
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = tg;
      } else {
        const x2 = center.x + Math.cos(angle) * radius;
        const y2 = center.y + Math.sin(angle) * radius;
        const tg = ctx.createLinearGradient(center.x, center.y, x2, y2);
        tg.addColorStop(0, 'transparent');
        tg.addColorStop(1, hsla(node.color, 0.06));
        ctx.moveTo(center.x, center.y);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = tg;
      }
      ctx.lineWidth = 0.5;
      ctx.stroke();
    });

    // --- Circle outline with soft glow ---
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 8;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(center.x, center.y, radius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // --- Tick marks at edge for each node ---
    state.nodes.forEach((node, i) => {
      const { angle } = frames[i];
      const tx = center.x + Math.cos(angle) * radius;
      const ty = center.y + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(tx, ty, 2, 0, Math.PI * 2);
      ctx.fillStyle = hsla(node.color, 0.25);
      ctx.fill();
    });

    // --- Center decoration ---
    for (let r = 3; r <= 10; r += 3.5) {
      ctx.beginPath();
      ctx.arc(center.x, center.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 - r * 0.005})`;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(center.x, center.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fill();

    // --- Trails (soft radial-gradient dots) ---
    const trailLife = Math.max(0.15, 1.2 / (state.config.speed / 20));
    state.trails = state.trails.filter(t => {
      const age = (timestamp - t.time) / 1000;
      if (age > trailLife) return false;
      const alpha = (1 - age / trailLife);
      const size = 3 + 3 * alpha;
      const tg = ctx.createRadialGradient(t.x, t.y, 0, t.x, t.y, size);
      tg.addColorStop(0, hsla(t.color, alpha * 0.35));
      tg.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
      ctx.fillStyle = tg;
      ctx.fill();
      return true;
    });

    // --- Ripples (single ring + glow in edge mode) ---
    state.ripples = state.ripples.filter(r => {
      const age = (timestamp - r.time) / 1000;
      if (age > 2.0) return false;
      const t = age / 2.0;
      const alpha = (1 - t) * (1 - t);
      const size = 5 + age * 45;
      ctx.beginPath();
      ctx.arc(r.x, r.y, size, 0, Math.PI * 2);
      ctx.strokeStyle = hsla(r.color, alpha * 0.4);
      ctx.lineWidth = 1.5 * alpha;
      ctx.stroke();

      if (edgeMode) {
        const glowSize = 10 + age * 50;
        const gg = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, glowSize);
        gg.addColorStop(0, hsla(r.color, alpha * 0.12));
        gg.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(r.x, r.y, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = gg;
        ctx.fill();
      }

      return true;
    });

    // --- Node glow layer ---
    state.nodes.forEach((node, i) => {
      const { x, y, proximity } = frames[i];
      const fade = proximity * proximity;
      const glowSize = 22 + proximity * 18;
      const gg = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
      gg.addColorStop(0, hsla(node.color, 0.08 * fade));
      gg.addColorStop(0.5, hsla(node.color, 0.03 * fade));
      gg.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, glowSize, 0, Math.PI * 2);
      ctx.fillStyle = gg;
      ctx.fill();
    });

    // --- Lines from center to node ---
    state.nodes.forEach((node, i) => {
      const { x, y } = frames[i];
      ctx.beginPath();
      ctx.moveTo(center.x, center.y);
      ctx.lineTo(x, y);
      const lg = ctx.createLinearGradient(center.x, center.y, x, y);
      lg.addColorStop(0, 'rgba(255,255,255,0.02)');
      lg.addColorStop(0.6, hsla(node.color, 0.12));
      lg.addColorStop(1, hsla(node.color, 0.3));
      ctx.strokeStyle = lg;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // --- Node circles ---
    state.nodes.forEach((node, i) => {
      const { x, y, proximity } = frames[i];
      const nodeSize = 5 + proximity * 4;

      // Outer ring
      ctx.beginPath();
      ctx.arc(x, y, nodeSize + 2, 0, Math.PI * 2);
      ctx.strokeStyle = hsla(node.color, 0.2 + proximity * 0.15);
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Main fill with highlight gradient
      ctx.beginPath();
      ctx.arc(x, y, nodeSize, 0, Math.PI * 2);
      const nf = ctx.createRadialGradient(
        x - nodeSize * 0.25, y - nodeSize * 0.25, 0,
        x, y, nodeSize
      );
      nf.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
      nf.addColorStop(0.35, node.color);
      nf.addColorStop(1, hsla(node.color, 0.85));
      ctx.fillStyle = nf;
      ctx.fill();
    });
  }
}
