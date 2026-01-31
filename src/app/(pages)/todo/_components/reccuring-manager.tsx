/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Todo } from "@/generated/prisma/client";
import { IoRepeat, IoTrashOutline, IoPencil, IoCheckmark, IoClose, IoTimeOutline } from "react-icons/io5";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const RecurringManager = () => {
    const [templates, setTemplates] = useState<Todo[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // State untuk Editing
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editType, setEditType] = useState("DAILY");
    const [isSaving, setIsSaving] = useState(false);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/todo/templates");
            const data = await res.json();
            setTemplates(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            setEditingId(null); // Reset edit mode saat buka baru
        }
    }, [isOpen]);

    const handleDelete = async (id: string) => {
        if(!confirm("Stop this recurring task?")) return;
        try {
            await fetch(`/api/todo/templates?id=${id}`, { method: "DELETE" });
            setTemplates(prev => prev.filter(t => t.id !== id));
            toast.success("Schedule stopped");
        } catch (e) {
            toast.error("Failed to delete");
        }
    }

    // Mulai Edit
    const startEdit = (todo: Todo) => {
        setEditingId(todo.id);
        setEditTitle(todo.title);
        // @ts-ignore (Krena type di prisma enum, tp di state string)
        setEditType(todo.type); 
    };

    // Cancel Edit
    const cancelEdit = () => {
        setEditingId(null);
        setEditTitle("");
    };

    // Save Edit
    const saveEdit = async () => {
        if (!editTitle.trim()) return;
        setIsSaving(true);
        try {
            const res = await fetch("/api/todo/templates", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: editingId,
                    title: editTitle,
                    type: editType
                })
            });

            if (!res.ok) throw new Error();

            const updated = await res.json();

            // Update state lokal
            setTemplates(prev => prev.map(t => t.id === editingId ? updated : t));
            
            toast.success("Schedule updated!");
            setEditingId(null);
        } catch (e) {
            toast.error("Failed to update");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2 transition-colors">
                    <IoRepeat /> Manage Recurring
                </Button>
            </DialogTrigger>
             <DialogContent className="max-w-lg">
                 <DialogHeader>
                     <DialogTitle className="flex items-center gap-2">
                         <IoRepeat className="text-primary" /> Active Schedules
                     </DialogTitle>
                 </DialogHeader>
            
                 <div className="space-y-3 mt-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                     {loading ? (
                         <div className="flex justify-center py-8">
                             <IoTimeOutline className="animate-spin text-2xl text-muted-foreground" />
                         </div>
                     ) : templates.length === 0 ? (
                         <div className="text-center py-8 border-2 border-dashed border-border/50 rounded-xl">
                             <IoTimeOutline className="mx-auto text-2xl text-muted-foreground/50 mb-2" />
                             <p className="text-sm text-muted-foreground">No recurring tasks set.</p>
                         </div>
                     ) : (
                         templates.map(t => (
                             <div key={t.id} className={cn(
                                 "p-3 rounded-xl border transition-all duration-300",
                                 editingId === t.id 
                                     ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20" 
                                     : "border-border bg-card hover:border-primary/20"
                             )}>
                                 {editingId === t.id ? (
                                     // --- MODE EDIT ---
                                     <div className="flex flex-col gap-3">
                                         <div className="flex gap-2">
                                             <Input 
                                                 value={editTitle}
                                                 onChange={(e) => setEditTitle(e.target.value)}
                                                 className="h-8 text-sm bg-background"
                                                 placeholder="Task title..."
                                                 autoFocus
                                             />
                                             <Select value={editType} onValueChange={setEditType}>
                                                 <SelectTrigger className="w-[110px] h-8 text-xs">
                                                     <SelectValue />
                                                 </SelectTrigger>
                                                 <SelectContent>
                                                     <SelectItem value="DAILY">Daily</SelectItem>
                                                     <SelectItem value="WEEKLY">Weekly</SelectItem>
                                                     <SelectItem value="MONTHLY">Monthly</SelectItem>
                                                 </SelectContent>
                                             </Select>
                                         </div>
                                         <div className="flex justify-end gap-2">
                                             <Button 
                                                 size="sm" variant="ghost" className="h-7 px-2 text-xs" 
                                                 onClick={cancelEdit} disabled={isSaving}
                                             >
                                                 <IoClose className="mr-1" /> Cancel
                                             </Button>
                                             <Button 
                                                 size="sm" className="h-7 px-2 text-xs" 
                                                 onClick={saveEdit} disabled={isSaving}
                                             >
                                                 <IoCheckmark className="mr-1" /> {isSaving ? "Saving..." : "Save"}
                                             </Button>
                                         </div>
                                     </div>
                                 ) : (
                                     // --- MODE BACA ---
                                     <div className="flex items-center justify-between group">
                                         <div className="space-y-1">
                                             <p className="font-medium text-sm text-foreground">{t.title}</p>
                                             <div className="flex items-center gap-2">
                                                 <span className={cn(
                                                     "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                                     t.type === "DAILY" ? "bg-amber-500/10 text-amber-600" :
                                                     t.type === "WEEKLY" ? "bg-blue-500/10 text-blue-600" :
                                                     "bg-purple-500/10 text-purple-600"
                                                 )}>
                                                     {t.type}
                                                 </span>
                                                 <span className="text-[10px] text-muted-foreground">
                                                     Created: {new Date(t.createdAt).toLocaleDateString()}
                                                 </span>
                                             </div>
                                         </div>
                                         
                                         <div className="flex items-center gap-1 opacity-100 lg:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                             <Button 
                                                 variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                 onClick={() => startEdit(t)}
                                             >
                                                 <IoPencil size={14} />
                                             </Button>
                                             <Button 
                                                 variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                 onClick={() => handleDelete(t.id)}
                                             >
                                                 <IoTrashOutline size={14} />
                                             </Button>
                                         </div>
                                     </div>
                                 )}
                             </div>
                         ))
                     )}
                 </div>
             </DialogContent>
        </Dialog>
    );
};