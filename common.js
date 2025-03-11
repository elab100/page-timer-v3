export function FormatDuration(d) {
  if (d < 0) return "?";
  const divisor = d < 3600000 ? [60000, 1000] : [3600000, 60000];
  const pad = x => x < 10 ? "0" + x : x.toString();
  return `${Math.floor(d / divisor[0])}:${pad(Math.floor((d % divisor[0]) / divisor[1]))}`;
}