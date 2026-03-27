import type { ColorSchemeName } from './types';

const COLOR_SCHEMES: Record<ColorSchemeName, (t: number) => string> = {
  rainbow: (t) => `${t * 360}, 72%, 55%`,
  ocean: (t) => `${180 + t * 60}, 70%, 55%`,
  sunset: (t) => `${(340 + t * 80) % 360}, 80%, 55%`,
  forest: (t) => `${80 + t * 80}, 65%, 50%`,
  neon: (t) => `${180 + t * 120}, 100%, 65%`,
  mono: () => `0, 0%, 100%`,
};

export function getColorForPosition(t: number, scheme: ColorSchemeName): string {
  return COLOR_SCHEMES[scheme](t);
}

export function getNodeColors(count: number, scheme: ColorSchemeName = 'rainbow'): string[] {
  const gen = COLOR_SCHEMES[scheme];
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(gen((i + 0.5) / count));
  }
  return colors;
}
