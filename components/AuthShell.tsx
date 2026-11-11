import Screen from '@/components/Screen';
import { organization } from '@/data/mock';
import CopyrightFooter from '@/components/CopyrightFooter';

export default function AuthShell({
  children,
  showCopyright = false,
}: {
  children: React.ReactNode;
  showCopyright?: boolean;
}) {
  return (
    <Screen>
      <main className="relative flex flex-1 flex-col justify-end overflow-hidden bg-brand-strong px-0 pt-16 sm:items-center sm:justify-center sm:px-6 sm:py-8">
        <div className="absolute inset-x-0 top-0 flex flex-col items-center px-5 pt-7 text-center sm:pt-10">
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xs font-bold text-white">
            {organization.logoInitials}
          </div>
          <p className="text-xs font-semibold text-white">{organization.name}</p>
          <p className="mt-0.5 text-[10px] text-white/65">Resident portal</p>
        </div>

        <section className="auth-drawer-enter relative z-10 max-h-[calc(100dvh-1rem)] min-h-[76dvh] w-full max-w-[460px] overflow-y-auto rounded-t-[28px] bg-surface px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_50px_rgba(0,0,0,0.16)] sm:max-h-[min(720px,calc(100dvh-4rem))] sm:min-h-0 sm:rounded-[28px] sm:px-8 sm:pb-8 sm:pt-4 sm:shadow-2xl">
          <div aria-hidden="true" className="mx-auto mb-4 h-1 w-10 rounded-full bg-line sm:mb-5" />
          {children}
          {showCopyright && <CopyrightFooter showAllRightsReserved className="mt-4" />}
        </section>
      </main>
    </Screen>
  );
}
