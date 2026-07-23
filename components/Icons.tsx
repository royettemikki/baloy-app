import { SVGProps } from 'react';

function base(props: SVGProps<SVGSVGElement>) {
  return { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, ...props };
}

export function IconHome(props: SVGProps<SVGSVGElement>) {
  return <svg {...base(props)}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>;
}
export function IconMegaphone(props: SVGProps<SVGSVGElement>) {
  return <svg {...base(props)}><path d="M3 11v3a1 1 0 001 1h2l6 4V6l-6 4H4a1 1 0 00-1 1z" /><path d="M16 8a4 4 0 010 8" /></svg>;
}
export function IconBallot(props: SVGProps<SVGSVGElement>) {
  return <svg {...base(props)}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 12l2.5 2.5L16 9" /></svg>;
}
export function IconCard(props: SVGProps<SVGSVGElement>) {
  return <svg {...base(props)}><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>;
}
export function IconUser(props: SVGProps<SVGSVGElement>) {
  return <svg {...base(props)}><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" /></svg>;
}
export function IconCheck(props: SVGProps<SVGSVGElement>) {
  return <svg {...base(props)}><polyline points="20 6 9 17 4 12" /></svg>;
}
export function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return <svg {...base(props)}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
}
export function IconBell(props: SVGProps<SVGSVGElement>) {
  return <svg {...base(props)}><path d="M6 8a6 6 0 1112 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8z" /><path d="M10 19a2 2 0 004 0" /></svg>;
}
export function IconTool(props: SVGProps<SVGSVGElement>) {
  return <svg {...base(props)}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" /></svg>;
}
export function IconParty(props: SVGProps<SVGSVGElement>) {
  return <svg {...base(props)}><path d="M5.8 11.3L2 22l10.7-3.8" /><path d="M4 3h.01M22 8h.01M15 2h.01M22 20h.01" /><path d="M17.5 12.5c.9-1.5 2-4 1-6.5-2.5-1-5 .1-6.5 1-1.5.9-3.5 3.5-4 5l9.5.5z" /></svg>;
}
export function IconShield(props: SVGProps<SVGSVGElement>) {
  return <svg {...base(props)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
}
export function IconFileText(props: SVGProps<SVGSVGElement>) {
  return <svg {...base(props)}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /></svg>;
}
