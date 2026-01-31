"use client";

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
import { Note } from "@/generated/prisma/client";
import { noteApi } from "@/services/note-service";
import gsap from "gsap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoAdd, IoDocumentTextOutline, IoTimeOutline, IoTrashOutline } from "react-icons/io5";
import { toast } from "sonner";

interface NotesBoardProps {
    initialNotes: Note[];
}

export const NotesBoard = ({ initialNotes }: NotesBoardProps) => {
    const [notes, setNotes] = useState(initialNotes);
    const [isCreating, setIsCreating] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useEffect(() => {
        setNotes(initialNotes);
    }, [initialNotes]);

    // Animasi Masuk
    useLayoutEffect(() => {
        if (!containerRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".note-item",
                { y: 30, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, stagger: 0.05, ease: "power3.out" }
            );
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            const newNote = await noteApi.createNote("Untitled Note", "");
            router.push(`/notes/${newNote.id}`);
        } catch (error) {
            toast.error("Failed to create note");
            setIsCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        const prevNotes = [...notes];
        setNotes(prev => prev.filter(n => n.id !== id));

        try {
            await noteApi.deleteNote(id);
            toast.success("Note Deleted.");
        } catch (error) {
            setNotes(prevNotes);
            toast.error("Failed to delete");
        }
    };

    // Helper format date
    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
    };

    return (
        <div className="w-full pb-10" ref={containerRef}>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">

                {/* --- CREATE NEW BUTTON CARD --- */}
                <div
                    onClick={!isCreating ? handleCreate : undefined}
                    className="note-item group relative flex flex-col items-center justify-center min-h-[180px] rounded-3xl border-2 border-dashed border-border/60 bg-muted/5 hover:bg-muted/10 hover:border-amber-500/50 cursor-pointer transition-all duration-300"
                >
                    <div className="relative z-10 w-16 h-16 rounded-2xl bg-card border border-border shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                        {isCreating ? (
                            <AiOutlineLoading3Quarters className="animate-spin text-muted-foreground" size={24} />
                        ) : (
                            <IoAdd className="text-muted-foreground group-hover:text-amber-600 transition-colors" size={32} />
                        )}
                    </div>
                    <p className="relative z-10 mt-5 font-medium text-muted-foreground group-hover:text-foreground transition-colors">Create New Note</p>
                </div>

                {/* --- NOTE LIST CARDS --- */}
                {notes.map((note) => (
                    // WRAPPER CARD (Bukan Link)
                    <div key={note.id} className="note-item group relative flex flex-col justify-between h-full min-h-[180px] rounded-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 hover:-translate-y-1.5 hover:border-amber-500/30 overflow-hidden">

                        {/* 1. CLICKABLE AREA (Link) - Hanya membungkus bagian atas */}
                        <Link href={`/notes/${note.id}`} className="flex-1 p-6 cursor-pointer">
                            <div className="flex flex-col gap-4 h-full">
                                <div className="flex items-start justify-between gap-2">
                                    <IoDocumentTextOutline className="text-amber-500/20 group-hover:text-amber-500/60 transition-colors shrink-0 mt-1" size={24} />
                                </div>

                                {/* Title Only (Big & Bold) */}
                                <h3 className="text-xl sm:text-2xl font-heading font-bold text-foreground leading-tight group-hover:text-amber-600 transition-colors break-words">
                                    {note.title || "Untitled Note"}
                                </h3>
                            </div>
                        </Link>

                        {/* 2. FOOTER AREA (Non-Link) - Delete ada di sini */}
                        <div className="px-6 py-4 border-t border-border/40 bg-muted/5 flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-muted-foreground/60 uppercase tracking-wide">
                                <IoTimeOutline size={14} />
                                <span>{formatDate(note.updatedAt)}</span>
                            </div>

                            {/* DELETE BUTTON (Aman karena di luar Link) */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button
                                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all duration-200 cursor-pointer"
                                        title="Delete Note"
                                    >
                                        <IoTrashOutline size={16} />
                                    </button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            &quot;{note.title}&quot; will be permanently deleted. This action cannot be undone.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => handleDelete(note.id)}
                                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer border-none"
                                        >
                                            Delete Note
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                    </div>
                ))}
            </div>
        </div>
    );
};