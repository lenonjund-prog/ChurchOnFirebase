import type {Metadata} from 'next';
import { Inter } from 'next/font/google'; // Importar a fonte Inter
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] }); // Definir a instância da fonte

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
      {/* As tags <head> e <link> para a fonte Inter serão gerenciadas automaticamente pelo next/font */}
      <body
        className={`${inter.className} antialiased`} // Aplicar a classe da fonte ao body
        suppressHydrationWarning={true}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}