export function getNodeColors(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (i / count) * 300 + 30;
    const sat = 70 + Math.sin(i * 0.8) * 20;
    const light = 55 + Math.cos(i * 0.5) * 15;
    colors.push(`${hue}, ${sat}%, ${light}%`);
  }
  return colors;
}
