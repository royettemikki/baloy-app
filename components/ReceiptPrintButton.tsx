'use client';

export default function ReceiptPrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="w-full rounded-xl bg-brand py-3.5 text-sm font-medium text-on-brand print:hidden"
    >
      Download / Print receipt
    </button>
  );
}
