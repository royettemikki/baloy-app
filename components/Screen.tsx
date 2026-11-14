export default function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="resident-screen min-h-dvh px-0 sm:px-4 sm:py-5 lg:px-6 lg:py-6">
      <div className="resident-shell mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col overflow-hidden bg-surface shadow-none sm:min-h-[calc(100dvh-2.5rem)] sm:rounded-[28px] sm:border sm:border-line/70 sm:shadow-[0_24px_80px_rgba(15,35,28,0.12)] lg:min-h-[calc(100dvh-3rem)]">
        {children}
      </div>
    </div>
  );
}
