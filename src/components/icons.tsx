import React from "react";
import Image from "next/image"; // Importar o componente Image do Next.js

// Quando usamos 'fill', não precisamos passar width e height diretamente para o Image,
// pois ele preencherá o elemento pai.
interface IgrejaSaaSLogoProps extends Omit<React.ComponentProps<typeof Image>, 'width' | 'height' | 'fill'> {
  className?: string; // Para aplicar estilos diretamente à imagem dentro do seu contêiner
}

export function IgrejaSaaSLogo({ className, ...props }: IgrejaSaaSLogoProps) {
  return (
    // O componente Image com 'fill' precisa de um pai com 'position: relative' e dimensões definidas.
    <Image
      src="/logo.png" // Caminho para a nova logo
      alt="ChurchOn Logo"
      fill // Faz a imagem preencher o elemento pai
      className={className} // Manter classes de estilo passadas via props
      priority // Carregar a logo com alta prioridade
      {...props}
    />
  );
}