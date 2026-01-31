import { cn } from "@/lib/utils";

export const DefaultFrame = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className="relative w-full h-full rounded-full overflow-hidden z-10 border border-border bg-background shadow-sm">
        {children}
      </div>
    </div>
  );
};