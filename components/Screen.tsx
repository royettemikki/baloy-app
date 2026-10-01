export default function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-muted px-0 sm:px-4 sm:py-8">
      <div className="mx-auto flex h-dvh w-full max-w-md flex-col overflow-hidden bg-surface shadow-none sm:h-[calc(100dvh-4rem)] sm:max-h-[900px] sm:rounded-[24px] sm:border sm:border-line sm:shadow-xl">
        {children}
      </div>
    </div>
  );
}
