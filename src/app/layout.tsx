import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';
import { SessionContextProvider } from '@/components/supabase-session-provider';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
// Removido: import { usePathname } from 'next/navigation'; // Importar usePathname

// Declaração global para o Crisp Chat
declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'ChurchOn - Gestão de Igrejas Simplificada',
  description: 'A plataforma completa para a gestão da sua comunidade. Simplifique a administração, engaje seus membros e foque no que realmente importa.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // A lógica de forçar o tema light já é tratada dentro do ThemeProvider
  // const pathname = usePathname(); // Obter o pathname
  
  // // Definir as rotas que devem SEMPRE ser light
  // const publicPaths = [
  //   '/',
  //   '/login',
  //   '/register',
  //   '/forgot-password',
  //   '/update-password',
  //   '/privacy',
  //   '/terms',
  // ];

  // // Forçar o tema light se a rota atual estiver nas publicPaths
  // const forceLightMode = publicPaths.includes(pathname);

  return (
    <html lang="pt-BR" className="scroll-smooth" suppressHydrationWarning>
      <body className={`antialiased ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          // A propriedade forcedTheme é agora gerenciada internamente pelo ThemeProvider
          // forcedTheme={forceLightMode ? "light" : undefined} 
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
      </body>
    </html>
  );
}