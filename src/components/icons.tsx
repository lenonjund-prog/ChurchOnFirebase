import React, { type SVGProps } from "react";
import Image, { ImageProps } from "next/image"; // Importar o componente Image e ImageProps do Next.js

interface IgrejaSaaSLogoProps extends Omit<ImageProps, 'src' | 'alt'> {
  width?: number; // Definir width como number
  height?: number; // Definir height como number
}

export function IgrejaSaaSLogo({ width = 48, height = 48, className, ...props }: IgrejaSaaSLogoProps) {
  return (
    <Image
      src="/logo.png" // Caminho para a nova logo
      alt="ChurchOn Logo"
      width={width} // Usar width das props
      height={height} // Usar height das props
      className={className} // Manter classes de estilo passadas via props
      priority // Carregar a logo com alta prioridade
      {...props}
    />
  );
}