"use client";

import { useState } from "react";
import { Wishlist } from "@/generated/prisma/client";
import { IoTrashOutline, IoLink, IoPencil, IoCheckmarkCircleOutline, IoCloseCircleOutline } from "react-icons/io5";
import { getYouTubeId } from "@/lib/youtube";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface WishlistCardProps {
  item: Wishlist;
  onUpdate: (id: string, title: string, url: string, desc: string) => void;
  onDelete: (id: string) => void;
}

export const WishlistCard = ({ item, onUpdate, onDelete }: WishlistCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editUrl, setEditUrl] = useState(item.url);
  const [editDesc, setEditDesc] = useState(item.description || "");

  const handleSave = () => {
      if(!editTitle.trim() || !editUrl.trim()) return;
      onUpdate(item.id, editTitle, editUrl, editDesc);
      setIsEditing(false);
  };

  const handleCancel = () => {
      setEditTitle(item.title); setEditUrl(item.url); setEditDesc(item.description || "");
      setIsEditing(false);
  };

  const currentUrl = isEditing ? editUrl : item.url;
  const youtubeId = getYouTubeId(currentUrl);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 h-full">
      
      {/* --- MEDIA SECTION --- */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted border-b border-border/50">
        {youtubeId ? (
          <div className="relative h-full w-full group/media">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?controls=1&modestbranding=1`} 
                title={item.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className={cn("h-full w-full object-cover", isEditing && "opacity-40 blur-[2px]")}
              />
              <div className="absolute inset-0 pointer-events-none group-hover/media:bg-black/10 transition-colors" />
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={currentUrl} 
            alt={item.title} 
            className={cn(
                "h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105",
                isEditing && "opacity-40 blur-[2px]"
            )}
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2070&auto=format&fit=crop"; }}
          />
        )}
        
        {/* Actions Overlay */}
        {!isEditing && (
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                <button onClick={() => setIsEditing(true)} className="p-2 rounded-full bg-background/90 backdrop-blur text-foreground hover:text-primary shadow-sm border border-border cursor-pointer transition-colors">
                    <IoPencil size={14} />
                </button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button className="p-2 rounded-full bg-background/90 backdrop-blur text-foreground hover:text-destructive shadow-sm border border-border cursor-pointer transition-colors">
                            <IoTrashOutline size={14} />
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Item?</AlertDialogTitle>
                            <AlertDialogDescription>Remove &quot;{item.title}&quot; from your wishlist?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        )}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="relative flex flex-1 flex-col p-5 sm:p-6 gap-3">
        
        {isEditing ? (
            <div className="space-y-3 flex-1 animate-in fade-in zoom-in-95">
                <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-background border border-input rounded-lg px-3 py-2 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20" placeholder="Title" autoFocus />
                <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="w-full bg-background border border-input rounded-lg px-3 py-2 text-xs text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20" placeholder="URL" />
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="w-full bg-background border border-input rounded-lg px-3 py-2 text-xs text-muted-foreground outline-none focus:ring-2 focus:ring-primary/20 resize-none" placeholder="Description" rows={2} />
                <div className="flex gap-2 justify-end pt-1">
                    <button onClick={handleSave} className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"><IoCheckmarkCircleOutline size={20} /></button>
                    <button onClick={handleCancel} className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"><IoCloseCircleOutline size={20} /></button>
                </div>
            </div>
        ) : (
            <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-bold tracking-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                    </h3>
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors p-1" title="Open Link">
                        <IoLink size={16} />
                    </a>
                </div>
                {item.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                    </p>
                )}
            </div>
        )}
      </div>
    </div>
  );
};