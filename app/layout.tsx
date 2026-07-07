import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'TriLog',
  description: 'Triathlon training tracker',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F2F4F7' },
    { media: '(prefers-color-scheme: dark)', color: '#0B1015' },
  ],
};

// Applies the persisted theme before first paint to avoid a flash of the
// wrong theme. Runs inline, synchronously, ahead of hydration.
const themeBootScript =
  "(function(){try{var t=localStorage.getItem('trilog-theme');" +
  "if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}})();";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={dmSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
