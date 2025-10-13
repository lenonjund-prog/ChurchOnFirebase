"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

interface ParallaxBackgroundProps {
  src: string;
  alt: string;
  speed?: number; // Controla a velocidade do efeito parallax
}

export function ParallaxBackground({ src, alt, speed = 0.3 }: ParallaxBackgroundProps) {
  const [offsetY, setOffsetY] = useState(0);

  const handleScroll = () => {
    setOffsetY(window.scrollY);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        style={{
          transform: `translateY(${offsetY * speed}px)`,
          transition: 'transform 0.1s ease-out', // Adiciona uma transição suave
        }}
        priority
      />
    </div>
  );
}