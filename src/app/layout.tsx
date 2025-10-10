import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { SessionContextProvider } from '@/components/supabase-session-provider';
import Script from 'next/script'; // Importar Script do next/script

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
        {/* Script para o Stripe Buy Button */}
        <Script
          async
          src="https://js.stripe.com/v3/buy-button.js"
          strategy="lazyOnload" // Carrega o script de forma otimizada
        />
      </body>
    </html>
  );
}