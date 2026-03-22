export function getNodeColors(count: number): string[] {
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = ((i + 0.5) / count) * 360;
    const sat = 72;
    const light = 55;
    colors.push(`${hue}, ${sat}%, ${light}%`);
  }
  return colors;
}
