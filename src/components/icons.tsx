import React, { type SVGProps } from "react";
import Image from "next/image"; // Importar o componente Image do Next.js

export function IgrejaSaaSLogo(props: SVGProps<SVGSVGElement>) {
  // Definimos um tamanho padrão grande o suficiente para a maior exibição da logo (md:h-48 md:w-48 = 192px)
  const optimizedSize = 192; 

  return (
    <Image
      src="/logo.png" // Caminho para a nova logo
      alt="ChurchOn Logo"
      width={optimizedSize} // Define a largura para otimização do Next.js
      height={optimizedSize} // Define a altura para otimização do Next.js
      className={props.className} // Manter classes de estilo passadas via props para controle de layout
      priority // Carregar a logo com alta prioridade
    />
  );
}