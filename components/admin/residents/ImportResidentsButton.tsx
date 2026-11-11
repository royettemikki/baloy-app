'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { importResidentsAction, previewResidentsImportAction } from '@/app/actions/admin';
import { downloadCsv } from '@/lib/csv';
import { MAX_RESIDENT_IMPORT_ROWS, parseResidentCsv } from '@/lib/residentImport';
import type { PreparedResidentImportRow, ResidentImportInputRow } from '@/lib/residentImport';
import { IconFileText, IconX } from '@/components/Icons';

const MAX_FILE_SIZE_BYTES = 1_000_000;

function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export default function ImportResidentsButton({
  requiresLotArea = false,
}: {
  requiresLotArea?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<PreparedResidentImportRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const validCount = rows.filter((row) => !row.error).length;
  const invalidCount = rows.length - validCount;

  function reset() {
    setRows([]);
    setFileName('');
    setError(null);
    setResultMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function close() {
    if (pending) return;
    setOpen(false);
    reset();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    reset();
    setFileName(file.name);
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Choose a CSV file.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('The CSV must be 1 MB or smaller.');
      return;
    }

    let csvRows: string[][];
    try {
      csvRows = parseResidentCsv(await file.text());
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : 'Could not read the CSV file.');
      return;
    }

    if (csvRows.length < 2) {
      setError('Add a header row and at least one resident.');
      return;
    }

    const headers = csvRows[0].map(normalizeHeader);
    const fullNameIndex = headers.indexOf('fullname');
    const emailIndex = headers.indexOf('email');
    const unitIndex = headers.indexOf('unit');
    const lotAreaIndex = headers.indexOf('lotareasqm');
    const knownHeaders = new Set(['fullname', 'email', 'unit', 'lotareasqm']);

    if (headers.some((header) => !header)) {
      setError('Every CSV column needs a header.');
      return;
    }
    if (new Set(headers).size !== headers.length) {
      setError('The CSV contains duplicate column headers.');
      return;
    }
    if (headers.some((header) => !knownHeaders.has(header))) {
      setError(
        'Unsupported columns found. Use the downloadable template to check the required format.',
      );
      return;
    }
    if (fullNameIndex < 0 || emailIndex < 0 || unitIndex < 0) {
      setError(
        'Required columns are Full Name, Email, and Unit. Lot Area Sqm is optional unless dues are area-based.',
      );
      return;
    }

    const dataRows = csvRows.slice(1);
    if (dataRows.length > MAX_RESIDENT_IMPORT_ROWS) {
      setError(`Import up to ${MAX_RESIDENT_IMPORT_ROWS} residents at a time.`);
      return;
    }

    const malformedRow = dataRows.findIndex((row) => row.length > headers.length);
    if (malformedRow >= 0) {
      setError(`Row ${malformedRow + 2} has more values than there are column headers.`);
      return;
    }

    const inputRows: ResidentImportInputRow[] = dataRows.map((row, index) => ({
      rowNumber: index + 2,
      fullName: row[fullNameIndex] ?? '',
      email: row[emailIndex] ?? '',
      unit: row[unitIndex] ?? '',
      lotAreaSqm: lotAreaIndex < 0 ? '' : (row[lotAreaIndex] ?? ''),
    }));

    startTransition(async () => {
      const preview = await previewResidentsImportAction(inputRows);
      if ('error' in preview) {
        setError(preview.error ?? 'Unable to validate this resident file.');
        return;
      }
      setRows(preview.rows);
    });
  }

  function handleImport() {
    setError(null);
    startTransition(async () => {
      const result = await importResidentsAction(
        rows
          .filter((row) => !row.error)
          .map((row) => ({
            rowNumber: row.rowNumber,
            fullName: row.fullName,
            email: row.email,
            unit: row.unit,
            lotAreaSqm: row.lotAreaSqm === null ? '' : String(row.lotAreaSqm),
          })),
      );
      if (result.error) {
        setError(result.error);
        return;
      }

      setResultMessage(
        `Imported ${result.createdCount} resident${result.createdCount === 1 ? '' : 's'} as pending invites${
          result.skippedCount
            ? `. ${result.skippedCount} duplicate row${result.skippedCount === 1 ? ' was' : 's were'} skipped`
            : ''
        }.`,
      );
      setRows([]);
      setFileName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hover:border-brand/30 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-semibold text-ink-soft shadow-sm transition-colors hover:text-brand-strong"
      >
        <IconFileText width={16} height={16} />
        Import residents
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex animate-fadeIn justify-end bg-overlay"
          onClick={close}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="resident-import-title"
            onClick={(event) => event.stopPropagation()}
            className="no-scrollbar h-full w-full max-w-2xl animate-slideInRight overflow-y-auto bg-surface p-5 shadow-2xl sm:p-7"
          >
            <header className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-strong">
                  Resident directory
                </p>
                <h2 id="resident-import-title" className="mt-1 text-xl font-semibold text-ink">
                  Import residents
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  Upload a CSV, review every row, then confirm the import.
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close resident import"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted text-ink-soft"
              >
                <IconX width={15} height={15} />
              </button>
            </header>

            <div className="border-brand/15 bg-brand-soft/40 mb-4 rounded-2xl border p-4">
              <p className="text-xs font-semibold text-ink">What this import does</p>
              <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                Creates pending resident accounts with one-time invite links. It does not create
                passwords, send invitation emails, or import historical charges or payments. Lot
                area is saved on a new property and can fill a missing area on an existing one.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                Residents with the same unit are linked to one property and share its dues history.
                Choose the primary voter from the resident actions after importing.
              </p>
              <button
                type="button"
                onClick={() =>
                  downloadCsv(
                    'resident-import-template.csv',
                    ['Full Name', 'Email', 'Unit', 'Lot Area Sqm'],
                    [],
                  )
                }
                className="mt-3 text-xs font-semibold text-brand-strong hover:underline"
              >
                Download CSV template
              </button>
            </div>

            <label className="bg-surface-muted/50 hover:border-brand/40 hover:bg-brand-soft/20 flex cursor-pointer flex-col items-center rounded-2xl border border-dashed border-line px-4 py-6 text-center transition-colors">
              <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-brand-strong shadow-sm">
                <IconFileText width={18} height={18} />
              </span>
              <span className="text-sm font-semibold text-ink">
                {fileName || 'Choose a resident CSV'}
              </span>
              <span className="mt-1 text-[11px] text-ink-muted">
                Full Name, Email, Unit, Lot Area Sqm · up to 500 residents · 1 MB max
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>

            {requiresLotArea && (
              <p className="mt-2 text-[11px] text-warning">
                Community dues are area-based, so every resident must have a lot area.
              </p>
            )}

            {error && (
              <p
                role="alert"
                className="mt-3 rounded-xl bg-danger-soft px-3 py-2 text-xs text-danger"
              >
                {error}
              </p>
            )}

            {resultMessage && (
              <div className="mt-4 rounded-xl bg-brand-soft px-3.5 py-3">
                <p className="text-sm font-semibold text-brand-strong">{resultMessage}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  Review each pending invite and share its activation link from the resident
                  directory.
                </p>
              </div>
            )}

            {pending && (
              <p className="mt-4 text-xs text-ink-muted" aria-live="polite">
                Checking resident rows…
              </p>
            )}

            {rows.length > 0 && (
              <section className="mt-5">
                <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-ink">Import preview</h3>
                    <p className="mt-0.5 text-[11px] text-ink-muted">
                      {validCount} ready · {invalidCount} need{invalidCount === 1 ? 's' : ''}{' '}
                      attention
                    </p>
                  </div>
                  <span className="text-[10px] text-ink-muted">
                    No accounts are created until you confirm.
                  </span>
                </div>
                <div className="max-h-[42vh] overflow-auto rounded-xl border border-line">
                  <table className="w-full min-w-[560px] text-left text-xs">
                    <thead className="sticky top-0 bg-surface-muted text-[10px] uppercase tracking-wide text-ink-muted">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Row</th>
                        <th className="px-3 py-2 font-semibold">Resident</th>
                        <th className="px-3 py-2 font-semibold">Unit</th>
                        <th className="px-3 py-2 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {rows.map((row) => (
                        <tr key={row.rowNumber} className={row.error ? 'bg-danger-soft/25' : ''}>
                          <td className="px-3 py-2 tabular-nums text-ink-muted">{row.rowNumber}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-ink">{row.fullName || '—'}</p>
                            <p className="text-[10px] text-ink-muted">{row.email || 'No email'}</p>
                          </td>
                          <td className="px-3 py-2 text-ink-soft">{row.unit || '—'}</td>
                          <td className="max-w-[220px] px-3 py-2">
                            {row.error ? (
                              <span className="text-[10px] text-danger">{row.error}</span>
                            ) : (
                              <span className="rounded-full bg-brand-soft px-2 py-1 text-[10px] font-semibold text-brand-strong">
                                Ready
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      reset();
                    }}
                    disabled={pending}
                    className="min-h-10 rounded-xl border border-line px-4 text-xs font-semibold text-ink-soft"
                  >
                    Clear preview
                  </button>
                  <button
                    type="button"
                    onClick={handleImport}
                    disabled={pending || validCount === 0}
                    className="min-h-10 rounded-xl bg-brand px-4 text-xs font-semibold text-on-brand shadow-sm disabled:opacity-50"
                  >
                    {pending
                      ? 'Importing…'
                      : `Import ${validCount} resident${validCount === 1 ? '' : 's'}`}
                  </button>
                </div>
              </section>
            )}
          </section>
        </div>
      )}
    </>
  );
}
