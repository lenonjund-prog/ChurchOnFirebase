import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import { SessionContextProvider } from '@/components/supabase-session-provider';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ChurchOn - Gestão de Igrejas Simplificada',
  description: 'A plataforma completa para a gestão da sua comunidade. Simplifique a administração, engaje seus membros e foque no que realmente importa.',
  manifest: '/manifest.json', // Adicionado o link para o manifest
  appleWebApp: { // Adicionado meta tags para iOS PWA
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ChurchOn',
    startupImage: [
      '/logo.png', // Pode ser uma imagem de splash screen mais elaborada
    ],
  },
};

// Declaração global para o objeto Crisp no window
declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
    deferredPrompt: any; // Adicionado para o evento beforeinstallprompt
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/logo.png" /> {/* Ícone para iOS */}
      </head>
      <body className={`antialiased ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          // A lógica de forcedTheme será movida para dentro do ThemeProvider
        >
          <SessionContextProvider>
            {children}
          </SessionContextProvider>
        </ThemeProvider>
        <Toaster />
        <Script id="crisp-chat-script" strategy="lazyOnload">
          {`
            window.$crisp=[];
            window.CRISP_WEBSITE_ID="42a3a783-6681-4f21-8cbe-4981d22f4894";
            (function(){
              var d=document;
              var s=d.createElement("script");
              s.src="https://client.crisp.chat/l.js";
              s.async=1;
              d.getElementsByTagName("head")[0].appendChild(s);
            })();
          `}
        </Script>
        {/* Script para capturar o evento beforeinstallprompt */}
        <Script id="pwa-install-prompt-script" strategy="beforeInteractive">
          {`
            window.addEventListener('beforeinstallprompt', (e) => {
              // Previne que o mini-infobar apareça automaticamente
              e.preventDefault();
              // Armazena o evento para que possa ser acionado mais tarde
              window.deferredPrompt = e;
              console.log('beforeinstallprompt event fired and stored.');
            });
          `}
        </Script>
      </body>
    </html>
  );
}