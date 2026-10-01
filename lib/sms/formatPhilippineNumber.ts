export function formatPhilippineNumber(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('09')) {
    return digits;
  }
  if (digits.length === 12 && digits.startsWith('639')) {
    return `0${digits.slice(2)}`;
  }
  return null;
}
