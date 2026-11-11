export default function CopyrightFooter({
  showAllRightsReserved = false,
  className = '',
}: {
  showAllRightsReserved?: boolean;
  className?: string;
}) {
  return (
    <footer className={`text-ink-muted/60 py-2 text-center text-[10px] ${className}`}>
      © {new Date().getFullYear()} Rezdnt
      {showAllRightsReserved && '. All rights reserved.'}
    </footer>
  );
}
