"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { usePathname } from 'next/navigation'; // Importar usePathname

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const pathname = usePathname();

  // Definir as rotas que devem SEMPRE ser light
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/update-password',
    '/privacy',
    '/terms',
  ];

  // Forçar o tema light se a rota atual estiver nas publicPaths
  const forceLightMode = publicPaths.includes(pathname);

  return (
    <NextThemesProvider {...props} forcedTheme={forceLightMode ? "light" : undefined}>
      {children}
    </NextThemesProvider>
  )
}