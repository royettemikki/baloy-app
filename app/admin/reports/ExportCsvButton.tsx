'use client';

import Button from '@/components/ui/Button';
import { downloadCsv } from '@/lib/csv';

export default function ExportCsvButton({
  filename,
  headers,
  rows,
}: {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
}) {
  return (
    <Button size="sm" variant="secondary" onClick={() => downloadCsv(filename, headers, rows)}>
      Export CSV
    </Button>
  );
}
