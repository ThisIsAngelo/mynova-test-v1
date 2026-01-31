'use client';

import ReactLenis from "lenis/react";
import { useEffect, useState } from "react";

interface ClientLenisProps {
  children: React.ReactNode;
}

export function ClientLenis({ children }: ClientLenisProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  // Define options directly inside the client component
  const defaultLenisOptions = {
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical" as const,
    smoothWheel: true,
    smoothTouch: true,
    touchMultiplier: 2,
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <>{children}</>;
  }

  return <ReactLenis root options={defaultLenisOptions}>{children}</ReactLenis>;
}