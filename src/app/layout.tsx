import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PookieProvider } from '@/context/PookieContext';

export const metadata: Metadata = {
  title: 'Pookie Dashboard 🎀',
  description:
    'A cute anime-coded dashboard for your Pookie apps — starting with a private friend-group expense & IOU tracker for food courts, cafes, and treats.',
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎀</text></svg>",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FFF7FB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Fredoka:wght@600;700&family=Baloo+2:wght@600;700;800&family=Nunito:wght@400;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-pookie-bg text-pookie-text antialiased min-h-screen">
        <PookieProvider>{children}</PookieProvider>
      </body>
    </html>
  );
}
