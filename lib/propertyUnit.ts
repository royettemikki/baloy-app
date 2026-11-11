export function normalizePropertyUnit(unit: string) {
  return unit.trim().replace(/\s+/g, ' ').toLowerCase();
}
