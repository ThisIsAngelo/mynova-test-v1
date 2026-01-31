"use client";

import Container from "@/components/container";
import { cn } from "@/lib/utils";
import { noteApi } from "@/services/note-service";
import gsap from "gsap";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoArrowBack, IoArrowDown, IoArrowUp, IoCloudDoneOutline, IoTimeOutline, IoMenuOutline, IoCloseOutline } from "react-icons/io5";
import { toast } from "sonner";

// TIPTAP IMPORTS
import CharacterCount from '@tiptap/extension-character-count';
import { Color } from '@tiptap/extension-color';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EditorToolbar } from "../_components/editor-toolbar";
import { TableOfContents } from "../_components/table-of-contents";

interface NoteEditorPageProps {
    params: Promise<{ id: string }>;
}

export default function NoteEditorPage({ params }: NoteEditorPageProps) {
    const { id } = use(params);
    const router = useRouter();

    // Data State
    const [title, setTitle] = useState("");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // UI State
    const [showScrollButtons, setShowScrollButtons] = useState(false);
    const [isToolbarVisible, setIsToolbarVisible] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // [NEW] Untuk Mobile Sidebar

    // Refs
    const titleRef = useRef("");
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastScrollY = useRef(0);

    // --- TIPTAP SETUP ---
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'Start writing...',
                emptyEditorClass: 'is-editor-empty before:content-[attr(data-placeholder)] before:text-muted-foreground/30 before:float-left before:pointer-events-none',
            }),
            CharacterCount.configure({ limit: null }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            LinkExtension.configure({ openOnClick: false, autolink: true }),
            TextStyle,
            Color,
        ],
        editorProps: {
            attributes: {
                // [UPDATED] CSS Styles untuk "Multi-page feel"
                // min-h-[1000px] agar mirip rasio A4
                class: 'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[1000px] py-12 px-8 sm:px-16 leading-relaxed',
            },
        },
        onUpdate: ({ editor }) => {
            if (isReady) triggerSave(titleRef.current, editor.getHTML());
        },
        immediatelyRender: false,
    });

    // --- FETCH DATA (SAMA) ---
    useEffect(() => {
        let isMounted = true;
        const fetchNote = async () => {
            try {
                const res = await fetch(`/api/notes/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) {
                        setTitle(data.title);
                        titleRef.current = data.title;
                        setLastSaved(new Date(data.updatedAt));
                        if (editor && !editor.isDestroyed) {
                            editor.commands.setContent(data.content || "", { emitUpdate: false });
                        }
                        setIsReady(true);
                    }
                } else {
                    toast.error("Note not found");
                    router.push("/notes");
                }
            } catch (error) {
                console.error(error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        if (editor) fetchNote();
        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, router, editor]);

    const [isReady, setIsReady] = useState(false);
    useEffect(() => { titleRef.current = title; }, [title]);

    // --- SCROLL LOGIC ---
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setShowScrollButtons(currentScrollY > 300);
            if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
                setIsToolbarVisible(false);
            } else {
                setIsToolbarVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // --- ANIMATION ENTRY ---
    useEffect(() => {
        if (!loading) {
            gsap.fromTo(".paper-sheet", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" });
            gsap.fromTo(".sidebar-nav", { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: "power2.out" });
        }
    }, [loading]);

    // --- HANDLERS (SAMA) ---
    const handleTitleChange = (newTitle: string) => {
        setTitle(newTitle);
        if (isReady) triggerSave(newTitle, editor?.getHTML() || "");
    };

    const triggerSave = (t: string, c: string) => {
        setSaving(true);
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await noteApi.updateNote(id, t, c);
                setLastSaved(new Date());
            } catch (error) { console.error("Failed"); } 
            finally { setSaving(false); }
        }, 1500);
    };

    const handleBack = async () => {
        if (saving) {
            const toastId = toast.loading("Saving changes...");
            if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
            try {
                await noteApi.updateNote(id, titleRef.current, editor?.getHTML() || "");
                toast.dismiss(toastId);
                router.push("/notes");
            } catch (e) {
                toast.dismiss(toastId);
                toast.error("Failed to save.");
            }
        } else {
            router.push("/notes");
        }
    };

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    const scrollToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    const chars = editor?.storage.characterCount?.characters() || 0;
    const words = editor?.storage.characterCount?.words() || 0;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <AiOutlineLoading3Quarters className="animate-spin text-3xl" />
                <span className="text-xs font-mono uppercase tracking-widest">Opening Notebook...</span>
            </div>
        </div>
    );

    return (
        <main className="min-h-screen transition-colors duration-300">
            
            {/* [NEW] MAIN LAYOUT GRID */}
            {/* Kiri: Main Content (Scrollable) | Kanan: Sidebar (Sticky) */}
            
            <Container className="max-w-[1400px] px-0 sm:px-4 md:px-6 pt-24 pb-20">
                
                <div className="flex flex-col lg:flex-row gap-8 items-start relative">
                    
                    {/* --- COLUMN 1: EDITOR (MAIN) --- */}
                    <div className="flex-1 w-full min-w-0">

                        {/* HEADER */}
                        <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
                            <button onClick={handleBack} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer group px-3 py-1.5 rounded-lg hover:bg-muted/50">
                                <IoArrowBack className="group-hover:-translate-x-1 transition-transform" /> Back
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-xs font-mono font-medium bg-background/50 border border-border/50 px-3 py-1.5 rounded-full backdrop-blur-sm shadow-sm">
                                    {saving ? (
                                        <>
                                            <AiOutlineLoading3Quarters className="animate-spin text-amber-500" />
                                            <span className="text-amber-500">Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <IoCloudDoneOutline className="text-muted-foreground" />
                                            <span className="text-muted-foreground">Saved</span>
                                        </>
                                    )}
                                </div>
                                {/* Mobile Menu Toggle */}
                                <button 
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                    className="lg:hidden p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground"
                                >
                                    <IoMenuOutline size={20} />
                                </button>
                            </div>
                        </div>

                        {/* TITLE */}
                        <div className="mb-8 px-4 sm:px-2 max-w-4xl mx-auto">
                            <input
                                value={title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Untitled Note"
                                className="w-full bg-transparent text-3xl sm:text-5xl font-heading font-bold text-foreground placeholder:text-muted-foreground/20 outline-none p-0 focus:ring-0 text-left tracking-tight border-none"
                                disabled={!isReady}
                            />
                        </div>

                        {/* THE PAPER (VISUAL UPGRADE) */}
                        <div className="paper-sheet relative mx-auto w-full max-w-[850px] bg-card border border-border/40 sm:rounded-none sm:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] dark:shadow-none min-h-[1100px] flex flex-col mb-10">
                            
                            {/* Toolbar Sticky */}
                            <div className={cn(
                                "sticky top-20 z-30 transition-transform duration-500 bg-card/95 backdrop-blur border-b border-border/40",
                                isToolbarVisible ? "translate-y-0" : "-translate-y-[250%]"
                            )}>
                                <EditorToolbar editor={editor} />
                            </div>

                            {/* Editor Area */}
                            <div className="flex-1 bg-card cursor-text" onClick={() => editor?.commands.focus()}>
                                <EditorContent editor={editor} />
                            </div>

                        </div>
                        
                        {/* Status Footer (Floating di bawah paper) */}
                        <div className="max-w-[850px] mx-auto px-4 flex justify-between items-center text-[10px] text-muted-foreground font-mono uppercase tracking-wider opacity-60">
                            <div className="flex gap-4">
                                <span>{words} WORDS</span>
                                <span>|</span>
                                <span>{chars} CHARS</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <IoTimeOutline />
                                <span>{lastSaved ? `Last edit ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Ready"}</span>
                            </div>
                        </div>

                    </div>


                    {/* --- COLUMN 2: SIDEBAR NAV (STICKY) --- */}
                    {/* Desktop Sidebar */}
                    <aside className="sidebar-nav hidden lg:block w-64 sticky top-32 shrink-0 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar pr-2">
                         <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 shadow-sm">
                            <TableOfContents editor={editor} />
                         </div>
                    </aside>

                    {/* Mobile Sidebar (Drawer) */}
                    {isSidebarOpen && (
                        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex justify-end" onClick={() => setIsSidebarOpen(false)}>
                            <div 
                                className="w-3/4 max-w-sm h-full bg-card border-l border-border p-6 shadow-2xl animate-in slide-in-from-right duration-300"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg">Table of Contents</h3>
                                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-muted-foreground"><IoCloseOutline size={24} /></button>
                                </div>
                                <TableOfContents editor={editor} />
                            </div>
                        </div>
                    )}

                </div>
            </Container>

            {/* FLOATING ACTION BUTTONS */}
            <div className={cn("fixed bottom-8 right-6 sm:right-8 z-50 flex flex-col gap-3 transition-all duration-500", showScrollButtons ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none")}>
                <button onClick={scrollToTop} className="p-3 rounded-full bg-card border border-border shadow-lg text-muted-foreground hover:text-primary transition-all active:scale-90"><IoArrowUp size={20} /></button>
                <button onClick={scrollToBottom} className="p-3 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 transition-all active:scale-90"><IoArrowDown size={20} /></button>
            </div>
        </main>
    );
}