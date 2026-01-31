/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Editor } from "@tiptap/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { IoListOutline } from "react-icons/io5";

interface TableOfContentsProps {
  editor: Editor | null;
}

export const TableOfContents = ({ editor }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<{ level: number; text: string; id: string; pos: number }[]>([]);

  useEffect(() => {
    if (!editor) return;

    const updateHeadings = () => {
      const transaction = editor.state.tr;
      const newHeadings: any[] = [];

      editor.state.doc.descendants((node, pos) => {
        if (node.type.name === "heading") {
          const level = node.attrs.level;
          const text = node.textContent;
          
          if (text) {
            newHeadings.push({
              level,
              text,
              id: `heading-${pos}`,
              pos, // Save Node Positionn
            });
          }
        }
      });

      setHeadings(newHeadings);
    };

    updateHeadings();
    editor.on("update", updateHeadings);

    return () => {
      editor.off("update", updateHeadings);
    };
  }, [editor]);

  // [UPDATED] Logic Scroll yang Lebih Presisi
  const handleScrollToHeading = (pos: number) => {
    if (!editor) return;
    
    // 1. Pindahkan fokus/kursor ke posisi heading tersebut
    // Kita tambah +1 biar kursor masuk ke dalam teksnya, bukan di wrapper node
    editor.commands.setTextSelection(pos + 1);
    
    // 2. Cari Element DOM yang Benar
    const { node } = editor.view.domAtPos(pos + 1);
    
    // Cek: Apakah 'node' ini Element (H1/H2) atau TextNode?
    // Kalau TextNode, kita ambil parent-nya (H1/H2-nya)
    const elementToScroll = node instanceof HTMLElement ? node : node.parentElement;

    if (elementToScroll) {
        // 3. Scroll Native Browser
        elementToScroll.scrollIntoView({ 
            behavior: "smooth", 
            block: "start" // Scroll biar heading ada di bagian atas layar
        });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
        <IoListOutline size={14} />
        <span>Outline</span>
      </div>

      <div className="flex justify-start items-center text-xs">
        {headings.length === 0 &&
            <p>No Headings defined yet.</p>
        }
      </div>
      
      <div className="flex flex-col gap-1 border-l border-border/50 ml-1.5">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => handleScrollToHeading(heading.pos)}
            className={cn(
              "text-left text-sm py-1 pl-4 border-l -ml-[1px] transition-colors hover:text-amber-600 truncate w-full",
              heading.level === 1 ? "font-semibold text-foreground border-transparent hover:border-amber-500/50" : 
              heading.level === 2 ? "text-muted-foreground border-transparent pl-6 hover:border-amber-500/50" : 
              "text-muted-foreground/70 text-xs pl-8 border-transparent hover:border-amber-500/50"
            )}
          >
            {heading.text}
          </button>
        ))}
      </div>
    </div>
  );
};