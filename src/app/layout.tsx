import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { SessionContextProvider } from '@/components/supabase-session-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChurchOn',
  description: 'Gestão de igreja modelo SaaS',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning={true}
      >
        <SessionContextProvider>
          {children}
        </SessionContextProvider>
        <Toaster />
      </body>
    </html>
  );
}