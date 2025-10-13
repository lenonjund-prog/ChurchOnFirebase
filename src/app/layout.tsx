import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { SessionContextProvider } from '@/components/supabase-session-provider';
// Removido import de Script do next/script, pois o script do Stripe Buy Button não é mais necessário.

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ChurchOn',
  description: 'Gestão de igreja modelo SaaS',
  icons: {
    icon: '/favicon.png', // Apontando para o novo favicon PNG
  },
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
        {/* O script do Stripe Buy Button foi removido pois não é utilizado na implementação atual de pagamentos. */}
      </body>
    </html>
  );
}