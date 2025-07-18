import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AudioSphere - Revolutionary Music Platform',
  description: 'The next-generation music streaming platform that surpasses Spotify',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ResponsiveLayout>
            {children}
          </ResponsiveLayout>
        </Providers>
      </body>
    </html>
  );
}
