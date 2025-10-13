"use client";

import React from "react";
import Image from "next/image"; // Importar o componente Image do Next.js

// Quando usamos 'fill', não precisamos passar width e height diretamente para o Image,
// pois ele preencherá o elemento pai.
interface IgrejaSaaSLogoProps extends Omit<React.ComponentProps<typeof Image>, 'width' | 'height' | 'fill' | 'src' | 'alt'> {
  className?: string; // Para aplicar estilos diretamente à imagem dentro do seu contêiner
  src: string; // Tornar src uma prop obrigatória
  alt: string; // Tornar alt uma prop obrigatória
}

export function IgrejaSaaSLogo({ className, src, alt, ...props }: IgrejaSaaSLogoProps) {
  return (
    // O componente Image com 'fill' precisa de um pai com 'position: relative' e dimensões definidas.
    <Image
      src={src} // Usar a prop src
      alt={alt} // Usar a prop alt
      fill // Faz a imagem preencher o elemento pai
      className={className} // Manter classes de estilo passadas via props
      priority // Carregar a logo com alta prioridade
      {...props}
    />
  );
}