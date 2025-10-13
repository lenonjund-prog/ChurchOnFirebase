import type { Metadata } from 'next';
// Removidas as importações de Playfair_Display e PT_Sans
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import { SessionContextProvider } from '@/components/supabase-session-provider'; // Importar o SessionContextProvider

// Removidas as definições das fontes
// const playfair = Playfair_Display({
//   subsets: ['latin'],
//   variable: '--font-playfair',
//   display: 'swap',
// });

// const ptSans = PT_Sans({
//   subsets: ['latin'],
//   weight: ['400', '700'],
//   variable: '--font-pt-sans',
//   display: 'swap',
// });

export const metadata: Metadata = {
  title: 'ChurchOn - Gestão de Igrejas Simplificada',
  description: 'A plataforma completa para a gestão da sua comunidade. Simplifique a administração, engaje seus membros e foque no que realmente importa.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth"> {/* Removidas as classes de fonte */}
      <body className="font-body antialiased">
        <SessionContextProvider> {/* Envolvendo o children com SessionContextProvider */}
          {children}
        </SessionContextProvider>
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
      </body>
    </html>
  );
}