import { normalizePropertyUnit } from '@/lib/propertyUnit';

export type ResidentImportInputRow = {
  rowNumber: number;
  fullName: string;
  email: string;
  unit: string;
  lotAreaSqm: string;
};

export type PreparedResidentImportRow = {
  rowNumber: number;
  fullName: string;
  email: string;
  unit: string;
  lotAreaSqm: number | null;
  error: string | null;
};

export const MAX_RESIDENT_IMPORT_ROWS = 500;

export function prepareResidentImportRows(
  rows: ResidentImportInputRow[],
  existingEmails: Set<string>,
  requiresLotArea: boolean | Set<string>,
  existingLotAreas: Map<string, number | null> = new Map(),
): PreparedResidentImportRow[] {
  const seenEmails = new Set<string>();
  const seenLotAreas = new Map<string, number>();

  return rows.map((row) => {
    const fullName = row.fullName.trim();
    const email = row.email.trim().toLowerCase();
    const unit = row.unit.trim();
    const normalizedUnit = normalizePropertyUnit(unit);
    const rowRequiresLotArea =
      typeof requiresLotArea === 'boolean' ? requiresLotArea : requiresLotArea.has(normalizedUnit);
    const lotAreaInput = row.lotAreaSqm.trim();
    const lotAreaSqm = lotAreaInput ? Number(lotAreaInput) : null;
    let error: string | null = null;

    if (!fullName || fullName.length > 120) {
      error = 'Name is required and must be 120 characters or fewer.';
    } else if (!unit || unit.length > 40) {
      error = 'Unit is required and must be 40 characters or fewer.';
    } else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      error = 'Enter a valid email address.';
    } else if (existingEmails.has(email)) {
      error = 'This email already belongs to an account.';
    } else if (seenEmails.has(email)) {
      error = 'This email appears more than once in the file.';
    } else if (
      lotAreaInput &&
      (!Number.isFinite(lotAreaSqm) ||
        lotAreaSqm === null ||
        lotAreaSqm <= 0 ||
        lotAreaSqm > 99999999 ||
        !/^\d+(\.\d{1,2})?$/.test(lotAreaInput))
    ) {
      error = 'Lot area must be a positive number with up to 2 decimal places.';
    } else if (
      lotAreaSqm !== null &&
      existingLotAreas.get(normalizedUnit) != null &&
      lotAreaSqm !== existingLotAreas.get(normalizedUnit)
    ) {
      error = 'Lot area does not match the existing property record.';
    } else if (
      lotAreaSqm !== null &&
      seenLotAreas.has(normalizedUnit) &&
      lotAreaSqm !== seenLotAreas.get(normalizedUnit)
    ) {
      error = 'Residents for the same property must use the same lot area.';
    } else if (
      rowRequiresLotArea &&
      lotAreaSqm === null &&
      existingLotAreas.get(normalizedUnit) == null
    ) {
      error = 'Lot area is required for area-based community dues.';
    }

    if (email) seenEmails.add(email);
    if (lotAreaSqm !== null && !error) seenLotAreas.set(normalizedUnit, lotAreaSqm);

    return {
      rowNumber: row.rowNumber,
      fullName,
      email,
      unit,
      lotAreaSqm: error ? null : lotAreaSqm,
      error,
    };
  });
}

export function parseResidentCsv(csv: string): string[][] {
  const input = csv.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let fieldClosed = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (inQuotes) {
      if (character === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        inQuotes = false;
        fieldClosed = true;
      } else {
        field += character;
      }
      continue;
    }

    if (character === ',' || character === '\n') {
      row.push(field.trim());
      field = '';
      fieldClosed = false;
      if (character === '\n') {
        if (row.some((cell) => cell !== '')) rows.push(row);
        row = [];
      }
      continue;
    }

    if (character === '"') {
      if (field.length > 0 || fieldClosed) {
        throw new Error('CSV contains a misplaced quote.');
      }
      inQuotes = true;
      continue;
    }

    if (fieldClosed && character.trim() !== '') {
      throw new Error('CSV contains text after a closing quote.');
    }
    field += character;
  }

  if (inQuotes) throw new Error('CSV contains an unclosed quoted field.');

  row.push(field.trim());
  if (row.some((cell) => cell !== '')) rows.push(row);
  return rows;
}
