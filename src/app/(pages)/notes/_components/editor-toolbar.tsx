/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/static-components */
"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Editor } from "@tiptap/react";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import { FaBold, FaItalic } from "react-icons/fa6";
import { IoMdQuote } from "react-icons/io";
import {
    IoCodeWorking,
    IoColorPaletteOutline,
    IoHappyOutline, IoLinkOutline,
    IoList, IoListOutline,
    IoRemove,
    IoReturnDownBack, IoReturnDownForward,
} from "react-icons/io5";
import {
    LuAlignCenter,
    LuAlignJustify,
    LuAlignLeft,
    LuAlignRight,
    LuChevronDown,
    LuStrikethrough, LuType
} from "react-icons/lu";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface EditorToolbarProps {
    editor: Editor | null;
}

export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
    const { resolvedTheme } = useTheme(); 
    
    // States
    const [linkUrl, setLinkUrl] = useState("");
    const [linkText, setLinkText] = useState(""); 
    const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

    // --- LINK LOGIC ---
    const openLinkDialog = useCallback(() => {
        if (!editor) return;
        
        const previousUrl = editor.getAttributes('link').href;
        const { from, to, empty } = editor.state.selection;
        
        // Ambil text yang diseleksi untuk default value input text
        let selectedText = "";
        if (!empty) {
            selectedText = editor.state.doc.textBetween(from, to, ' ');
        }

        setLinkUrl(previousUrl || "");
        setLinkText(selectedText || ""); 
        setIsLinkDialogOpen(true);
    }, [editor]);

   const saveLink = useCallback(() => {
        if (!editor) return;

        // 1. Jika URL kosong, hapus link
        if (linkUrl === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            setIsLinkDialogOpen(false);
            return;
        }

        // 2. Logic Insert Link & Escape (STRICT VERSION)
        editor
            .chain()
            .focus()
            .extendMarkRange('link') // Seleksi link lama
            .deleteSelection()       // [FIX] Hapus dulu biar bersih
            .insertContent({         // Insert ulang sebagai node baru
                type: 'text',
                text: linkText || linkUrl,
                marks: [
                    {
                        type: 'link',
                        attrs: {
                            href: linkUrl,
                            target: '_blank',
                        },
                    },
                ],
            })
            .unsetMark('link') // [FIX] Matikan mark link untuk ketikan berikutnya
            .run();

        setIsLinkDialogOpen(false);
    }, [editor, linkUrl, linkText]);

    // --- EMOJI LOGIC ---
    const onEmojiClick = useCallback((emojiData: any) => {
        if (!editor) return;
        
        editor.chain().insertContent(emojiData.emoji).run();
    }, [editor]);


    if (!editor) return null;

    // --- HELPER COMPONENT ---
    const ToolbarBtn = ({ 
        onClick, isActive = false, children, title, disabled = false, className
    }: { onClick?: () => void; isActive?: boolean; children: React.ReactNode; title: string; disabled?: boolean; className?: string; }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "p-2 rounded-lg text-sm transition-all duration-200 cursor-pointer flex items-center justify-center min-w-[32px] min-h-[32px]",
                isActive ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                disabled && "opacity-30 cursor-not-allowed",
                className
            )}
        >
            {children}
        </button>
    );

    const Separator = () => <div className="w-[1px] h-6 bg-border/40 mx-1.5 self-center" />;

    return (
        <div className="w-full bg-background/95 backdrop-blur-xl px-2 py-2 flex flex-wrap gap-1 items-center justify-center md:justify-start transition-all">
            
            {/* 1. HISTORY */}
            <div className="flex gap-0.5">
                <ToolbarBtn title="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
                    <IoReturnDownBack size={18} />
                </ToolbarBtn>
                <ToolbarBtn title="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
                    <IoReturnDownForward size={18} />
                </ToolbarBtn>
            </div>

            <Separator />

            {/* 2. HEADING DROPDOWN */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground text-sm font-medium transition-colors cursor-pointer min-w-[100px] justify-between outline-none">
                        <span className="flex items-center gap-2">
                            <LuType size={16} />
                            {editor.isActive('heading', { level: 1 }) ? 'H1' :
                             editor.isActive('heading', { level: 2 }) ? 'H2' :
                             editor.isActive('heading', { level: 3 }) ? 'H3' :
                             editor.isActive('heading', { level: 4 }) ? 'H4' :
                             editor.isActive('heading', { level: 5 }) ? 'H5' :
                             editor.isActive('heading', { level: 6 }) ? 'H6' :
                             'Text'}
                        </span>
                        <LuChevronDown size={14} className="opacity-50" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40 cursor-pointer max-h-[300px] overflow-y-auto">
                    <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()} className="cursor-pointer">
                        Paragraph
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="font-bold text-2xl cursor-pointer">
                        Heading 1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="font-bold text-xl cursor-pointer">
                        Heading 2
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="font-bold text-lg cursor-pointer">
                        Heading 3
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className="font-bold text-base cursor-pointer">
                        Heading 4
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()} className="font-bold text-sm cursor-pointer text-muted-foreground">
                        Heading 5
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()} className="font-bold text-xs cursor-pointer text-muted-foreground">
                        Heading 6
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Separator />

            {/* 3. TEXT STYLE */}
            <div className="flex gap-0.5">
                <ToolbarBtn title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
                    <FaBold size={16} />
                </ToolbarBtn>
                <ToolbarBtn title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
                    <FaItalic size={16} />
                </ToolbarBtn>
                <ToolbarBtn title="Strike" onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
                    <LuStrikethrough size={18} />
                </ToolbarBtn>
                <ToolbarBtn title="Code" onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')}>
                    <IoCodeWorking size={18} />
                </ToolbarBtn>
            </div>

            <Separator />

            {/* 4. COLOR PICKER */}
            <div className="flex items-center">
                 <label className="cursor-pointer p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center relative group">
                    <input
                        type="color"
                        onInput={(event: React.ChangeEvent<HTMLInputElement>) => editor.chain().focus().setColor(event.target.value).run()}
                        value={editor.getAttributes('textStyle').color || '#000000'}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <IoColorPaletteOutline size={18} />
                    <div 
                        className="h-1 w-4 absolute bottom-1.5 rounded-full ring-1 ring-background" 
                        style={{ backgroundColor: editor.getAttributes('textStyle').color || 'currentColor' }}
                    />
                </label>
            </div>

            <Separator />

            {/* 5. ALIGNMENT */}
            <div className="flex gap-0.5">
                <ToolbarBtn title="Align Left" onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })}>
                    <LuAlignLeft size={18} />
                </ToolbarBtn>
                <ToolbarBtn title="Align Center" onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })}>
                    <LuAlignCenter size={18} />
                </ToolbarBtn>
                <ToolbarBtn title="Align Right" onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })}>
                    <LuAlignRight size={18} />
                </ToolbarBtn>
                <ToolbarBtn title="Justify" onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })}>
                    <LuAlignJustify size={18} />
                </ToolbarBtn>
            </div>

            <Separator />

            {/* 6. LISTS & EXTRAS */}
            <div className="flex gap-0.5">
                <ToolbarBtn title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
                    <IoListOutline size={18} />
                </ToolbarBtn>
                <ToolbarBtn title="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
                    <IoList size={18} />
                </ToolbarBtn>
                
                {/* --- LINK BUTTON --- */}
                <ToolbarBtn title="Insert Link" onClick={openLinkDialog} isActive={editor.isActive('link')}>
                    <IoLinkOutline size={18} />
                </ToolbarBtn>

                {/* --- EMOJI PICKER POPUP --- */}
                <Popover>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            title="Insert Emoji"
                            className="p-2 rounded-lg text-sm transition-all duration-200 cursor-pointer flex items-center justify-center min-w-[32px] min-h-[32px] text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                            <IoHappyOutline size={18} />
                        </button>
                    </PopoverTrigger>
                    {/* Focus tidak boleh pindah ke editor, jadi popover tetap buka */}
                    <PopoverContent 
                        className="w-full p-0 border-none bg-transparent shadow-none" 
                        sideOffset={10} 
                        onOpenAutoFocus={(e) => e.preventDefault()} // Mencegah fokus lari
                    >
                        <EmojiPicker 
                            onEmojiClick={onEmojiClick}
                            theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
                            emojiStyle={EmojiStyle.NATIVE}
                            width={320}
                            height={400}
                            previewConfig={{ showPreview: false }} 
                            lazyLoadEmojis={true}
                        />
                    </PopoverContent>
                </Popover>

                <ToolbarBtn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
                    <IoMdQuote size={18} />
                </ToolbarBtn>
                <ToolbarBtn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    <IoRemove size={18} />
                </ToolbarBtn>
            </div>

            {/* --- LINK DIALOG --- */}
            <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Insert Link</DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="text" className="text-sm font-medium leading-none">Text to display</label>
                            <input
                                id="text"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                                placeholder="Example: Click Here"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors border-border focus:ring-1 focus:ring-ring"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="link" className="text-sm font-medium leading-none">URL</label>
                            <input
                                id="link"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors border-border focus:ring-1 focus:ring-ring"
                                autoFocus
                                onKeyDown={(e) => { if (e.key === 'Enter') saveLink(); }}
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex flex-row justify-end gap-2">
                        <DialogClose asChild><Button type="button" variant="secondary" size="sm">Cancel</Button></DialogClose>
                        <Button type="button" onClick={saveLink} size="sm">Save Link</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};