import { BlobFrame } from "./blob-frame";
import { BrutalistFrame } from "./brutalist-frame";
import { DefaultFrame } from "./default-frame";
import { EclipseFrame } from "./eclipse-frame";
import { GlassFrame } from "./glass-frame";
import { GoldFrame } from "./gold-frame";
import { GradientFrame } from "./gradient-frame";
import { MinimalFrame } from "./minimal-frame";
import { NeonFrame } from "./neon-frame";
import { OrbitFrame } from "./orbit-frame";
import { TechFrame } from "./tech-frame";


// Tipe komponen frame
type FrameComponent = React.ComponentType<{ children: React.ReactNode; className?: string }>;

export const FRAME_REGISTRY: Record<string, FrameComponent> = {
  "minimal": MinimalFrame,
  "neon": NeonFrame,
  "gradient": GradientFrame,
  "glass": GlassFrame,
  "gold": GoldFrame,
  "none": DefaultFrame,

  "orbit": OrbitFrame,
  "blob": BlobFrame,
  "tech": TechFrame,
  "brutalist": BrutalistFrame,
  "eclipse": EclipseFrame,
};

export const getFrameComponent = (assetKey: string | null | undefined): FrameComponent => {
  if (!assetKey) return DefaultFrame;
  return FRAME_REGISTRY[assetKey] || DefaultFrame;
};