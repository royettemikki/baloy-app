import type { Metadata } from 'next';
import './globals.css';
import Providers from './providers';
import { organization } from '@/data/mock';

export const metadata: Metadata = {
  title: `${organization.name} — Resident Portal`,
  description: 'HOA resident portal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeScript = `(() => { try { const t = localStorage.getItem('theme'); if (t === 'dark' || t === 'light') { document.documentElement.classList.add('theme-' + t); document.documentElement.style.colorScheme = t; } } catch (_) {} })()`;

  return (
    <html lang='en'>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap'
          rel='stylesheet'
        />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
