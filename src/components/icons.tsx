import React, { type SVGProps } from "react";

export function IgrejaSaaSLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor" // Usa a cor do texto atual, que será controlada pelo Tailwind
    >
      <circle cx="50" cy="50" r="50" />
    </svg>
  );
}