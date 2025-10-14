import React, { type SVGProps } from "react";
import Image from "next/image"; // Importar o componente Image do Next.js

export function IgrejaSaaSLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <Image
      src="/logo.png" // Caminho para a nova logo
      alt="ChurchOn Logo"
      width={props.width ? parseInt(props.width.toString()) : 48} // Usar width e height das props ou valores padrão
      height={props.height ? parseInt(props.height.toString()) : 48}
      className={props.className} // Manter classes de estilo passadas via props
      priority // Carregar a logo com alta prioridade
    />
  );
}