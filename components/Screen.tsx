export default function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex justify-center bg-surface-muted">
      <div className="w-full max-w-md bg-surface h-dvh sm:h-auto sm:max-h-[90dvh] sm:my-8 sm:rounded-card sm:border sm:border-line overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}
