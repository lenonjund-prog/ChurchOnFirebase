import React from "react";
import Image from "next/image"; // Importar o componente Image do Next.js

// Ajustado para estender React.ImgHTMLAttributes para compatibilidade com next/image
interface IgrejaSaaSLogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'width' | 'height'> {
  width?: number; // Especificar que width é um número
  height?: number; // Especificar que height é um número
  className?: string; // Manter className como string
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