/* eslint-disable react-hooks/static-components */
"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getFrameComponent } from "../frames/registry";

interface AvatarFrameProps {
  src: string;
  alt: string;
  frameAsset: string;
  sizeClass?: string;
  className?: string;
}

export const AvatarFrame = ({ 
  src, 
  alt, 
  frameAsset, 
  sizeClass = "w-24 h-24",
  className 
}: AvatarFrameProps) => {
  
  // 1. Ambil komponen frame dari registry (Neon, Gold, dll)
  const SelectedFrame = getFrameComponent(frameAsset);

  return (
    // 2. Render Frame dengan wrapper ukuran
    <SelectedFrame className={cn(sizeClass, className)}>
       {/* 3. Masukkan Gambar (Children) */}
       <Image 
         src={src} 
         alt={alt} 
         fill 
         className="object-cover" 
       />
    </SelectedFrame>
  );
};