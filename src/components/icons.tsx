import React, { type SVGProps } from "react";
import Image from "next/image"; // Importar o componente Image do Next.js

export function IgrejaSaaSLogo(props: SVGProps<SVGSVGElement>) {
  // As props de SVG não são diretamente aplicáveis a uma imagem,
  // mas podemos passar className e style para o componente Image.
  const { className, style, ...rest } = props;

  return (
    <Image
      src="/logo.png" // Caminho para a nova logo PNG
      alt="ChurchOn Logo"
      width={props.width || 32} // Definir um tamanho padrão ou usar o passado via props
      height={props.height || 32} // Definir um tamanho padrão ou usar o passado via props
      className={className}
      style={style}
      {...rest}
    />
  );
}