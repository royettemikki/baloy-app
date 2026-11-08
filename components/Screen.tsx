export default function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-surface-muted px-0 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
      <div className="resident-shell mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col overflow-hidden bg-surface shadow-none sm:min-h-[calc(100dvh-2.5rem)] sm:rounded-[26px] sm:border sm:border-line/70 sm:shadow-[0_10px_34px_rgba(0,0,0,0.07)] lg:min-h-[calc(100dvh-3rem)]">
        {children}
      </div>
    </div>
  );
}
