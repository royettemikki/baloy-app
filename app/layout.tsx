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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
