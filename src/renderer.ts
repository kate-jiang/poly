import type { AppConfig, PolyNode, Ripple, Trail } from './types';
import { getNodeColors } from './utils';

function hsla(hslInner: string, alpha: number): string {
  return `hsla(${hslInner}, ${alpha})`;
}

function hsl(hslInner: string): string {
  return `hsl(${hslInner})`;
}

interface CircleGeometry {
  center: { x: number; y: number };
  radius: number;
}

function computeCircle(w: number, h: number): CircleGeometry {
  const short = Math.min(w, h);
  const scale = short < 600 ? 0.4 : 0.28;
  return {
    center: { x: w * 0.5, y: h * 0.5 },
    radius: short * scale,
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

  private nodes: PolyNode[] = [];
  private ripples: Ripple[] = [];
  private trails: Trail[] = [];
  private playing = false;
  private startTime = 0;
  private config: AppConfig;
  private w = 0;
  private h = 0;
  private mobile = false;
  private bgGradient: CanvasGradient | null = null;
  private frameCount = 0;

  constructor(canvas: HTMLCanvasElement, config: AppConfig) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = config;
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.mobile = Math.min(w, h) < 600;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.w = w;
    this.h = h;
    this.bgGradient = this.buildBgGradient(w, h);
  }

  private buildBgGradient(w: number, h: number): CanvasGradient {
    const grad = this.ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.7);
    grad.addColorStop(0, '#101018');
    grad.addColorStop(0.5, '#08080e');
    grad.addColorStop(1, '#030306');
    return grad;
  }

  updateConfig(config: AppConfig): void {
    this.config = config;
  }

  setPlaying(playing: boolean): void {
    this.playing = playing;
    if (playing) {
      this.startTime = performance.now();
      this.nodes.forEach(n => { n.lastBounceDir = null; });
    } else {
      this.startTime = 0;
    }
  }

  rebuildNodes(count: number): void {
    const colors = getNodeColors(count);
    this.nodes = [];
    for (let i = 0; i < count; i++) {
      this.nodes.push({
        index: i,
        beats: i + 2,
        color: colors[i],
        progress: 0,
        lastBounceDir: null,
      });
    }
    this.ripples = [];
    this.trails = [];
  }

  start(onBounce: (nodeIndex: number, config: AppConfig) => void): void {
    const draw = (timestamp: number) => {
      this.frameCount++;
      this.animFrameId = requestAnimationFrame(draw);
      this.render(timestamp, onBounce);
    };
    this.animFrameId = requestAnimationFrame(draw);
  }

  stop(): void {
    cancelAnimationFrame(this.animFrameId);
  }

  private render(timestamp: number, onBounce: (nodeIndex: number, config: AppConfig) => void): void {
    const ctx = this.ctx;
    const W = this.w;
    const H = this.h;

    // --- Background ---
    ctx.fillStyle = this.bgGradient!;
    ctx.fillRect(0, 0, W, H);

    const circle = computeCircle(W, H);
    const { center, radius } = circle;
    const n = this.nodes.length;

    // Time
    const edgeMode = this.config.bounceMode === 'edge';
    const cycleDuration = (edgeMode ? 3200 : 1600) / this.config.speed;
    let elapsed = 0;
    if (this.playing) {
      elapsed = (timestamp - this.startTime) / 1000;
    }

    // === Phase 1: Compute all node positions & handle bounce detection ===
    const frames: NodeFrame[] = [];
    this.nodes.forEach((node, i) => {
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
        if (this.playing && node.lastBounceDir && bounceDir !== node.lastBounceDir) {
          const edgeDist = dist > 0 ? radius : -radius;
          const bx = center.x + Math.cos(angle) * edgeDist;
          const by = center.y + Math.sin(angle) * edgeDist;
          if (this.ripples.length < (this.mobile ? 30 : 100)) {
            this.ripples.push({ x: bx, y: by, time: timestamp, color: node.color });
          }
          onBounce(i, this.config);
        }
        node.lastBounceDir = bounceDir;
      } else {
        const sinVal = Math.sin(phase);
        const bounce = Math.abs(sinVal);
        dist = bounce * radius;

        const bounceDir: 'up' | 'down' = sinVal >= 0 ? 'up' : 'down';
        if (this.playing && node.lastBounceDir && bounceDir !== node.lastBounceDir) {
          const bx = center.x + Math.cos(angle) * radius * (bounce < 0.15 ? 0 : bounce);
          const by = center.y + Math.sin(angle) * radius * (bounce < 0.15 ? 0 : bounce);
          if (this.ripples.length < (this.mobile ? 30 : 100)) {
            this.ripples.push({ x: bx, y: by, time: timestamp, color: node.color });
          }
          onBounce(i, this.config);
        }
        node.lastBounceDir = bounceDir;
      }

      const x = center.x + Math.cos(angle) * dist;
      const y = center.y + Math.sin(angle) * dist;
      const proximity = Math.abs(dist) / radius;
      frames.push({ x, y, dist, angle, proximity });

      if (!this.mobile && this.playing && this.frameCount % 2 === 0) {
        this.trails.push({ x, y, time: timestamp, color: node.color });
      }
    });

    // === Phase 2: Draw layers back-to-front ===

    // --- Track lines (subtle radial guides) ---
    if (this.mobile) {
      // Batched single path — uniform color, no per-node gradients
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const { angle } = frames[i];
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        if (edgeMode) {
          ctx.moveTo(center.x - cosA * radius, center.y - sinA * radius);
          ctx.lineTo(center.x + cosA * radius, center.y + sinA * radius);
        } else {
          ctx.moveTo(center.x, center.y);
          ctx.lineTo(center.x + cosA * radius, center.y + sinA * radius);
        }
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    } else {
      this.nodes.forEach((node, i) => {
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
    }

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
    this.nodes.forEach((node, i) => {
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

    // --- Trails (soft glow) ---
    const trailLife = Math.max(0.1, 0.7 / (this.config.speed / 40));
    this.trails = this.trails.filter(t => {
      const age = (timestamp - t.time) / 1000;
      if (age > trailLife) return false;
      const alpha = 1 - age / trailLife;
      const size = 4 + 3 * alpha;
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
    this.ripples = this.ripples.filter(r => {
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

    // --- Node glow layer (skip on mobile — expensive radial gradients) ---
    if (!this.mobile) {
      this.nodes.forEach((node, i) => {
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
    }

    // --- Lines from center to node ---
    this.nodes.forEach((node, i) => {
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
    this.nodes.forEach((node, i) => {
      const { x, y, proximity } = frames[i];
      const nodeSize = this.mobile ? 3.5 + proximity * 3 : 5 + proximity * 4;

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
      nf.addColorStop(0.35, hsl(node.color));
      nf.addColorStop(1, hsla(node.color, 0.85));
      ctx.fillStyle = nf;
      ctx.fill();
    });
  }
}
