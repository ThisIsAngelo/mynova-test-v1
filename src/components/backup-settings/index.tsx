"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IoCloudDownloadOutline, IoCloudUploadOutline, IoSettingsOutline, IoWarning } from "react-icons/io5";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

export function BackupSettings() {
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingImport, setLoadingImport] = useState(false);
  const [fileToImport, setFileToImport] = useState<File | null>(null);
  const [showConfirmImport, setShowConfirmImport] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isAnyLoading = loadingExport || loadingImport;

  // HANDLE EXPORT
  const handleExport = async () => {
    setLoadingExport(true);
    try {
      const res = await fetch("/api/backup/export");
      if (!res.ok) throw new Error("Export failed");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mynova-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Backup downloaded successfully!");
    } catch (error) {
      toast.error("Failed to export data.");
    } finally {
      setLoadingExport(false);
    }
  };

  // HANDLE FILE SELECT (TRIGGER IMPORT CONFIRM)
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileToImport(e.target.files[0]);
      setShowConfirmImport(true); // Buka Alert Konfirmasi
      e.target.value = ""; // Reset input biar bisa pilih file sama lagi
    }
  };

  // HANDLE IMPORT EXECUTION (AFTER CONFIRM)
  const handleImport = async () => {
    if (!fileToImport) return;
    setShowConfirmImport(false); // Tutup alert
    setLoadingImport(true);

    try {
      const text = await fileToImport.text();
      const json = JSON.parse(text);

      const res = await fetch("/api/backup/import", {
        method: "POST",
        body: JSON.stringify(json),
      });

      if (!res.ok) throw new Error("Import failed");

      toast.success("Data restored successfully! Refreshing...", {
        duration: 2000,
      });
      
      // Reload page agar data baru tampil
      setTimeout(() => window.location.reload(), 2000);

    } catch (error) {
      console.error(error);
      toast.error("Invalid backup file or corrupted data.");
      setLoadingImport(false); // Stop loading only on error
    } finally {
      setFileToImport(null);
    }
  };

  return (
    <>
      {/* 1. MAIN TRIGGER BUTTON (Di Profile Page) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest font-bold">
            <IoSettingsOutline size={14} /> Backup & Data
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Data Management</DialogTitle>
            <DialogDescription>
              Export your progress to a JSON file or restore from a backup.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            
            {/* EXPORT BUTTON */}
            <Button 
              onClick={handleExport} 
              disabled={isAnyLoading}
              variant="outline"
              className="w-full justify-between h-auto py-4 px-6 border-border/60 hover:border-primary/50 hover:bg-secondary/30 transition-all group"
            >
              <div className="flex flex-col items-start gap-1">
                <span className="font-bold flex items-center gap-2">
                   <IoCloudDownloadOutline className="text-primary group-hover:scale-110 transition-transform" size={18} /> 
                   Export Data
                </span>
                <span className="text-xs text-muted-foreground font-normal">Download current progress as JSON</span>
              </div>
              {loadingExport && <Loader2 className="animate-spin text-muted-foreground" size={18} />}
            </Button>

            {/* IMPORT BUTTON (Hidden Input Trick) */}
            <div>
                <input
                    type="file"
                    accept=".json"
                    id="import-backup"
                    className="hidden"
                    onChange={onFileChange}
                    disabled={isAnyLoading}
                />
                <label htmlFor="import-backup" className="w-full cursor-pointer">
                    <div className={`
                        flex items-center justify-between w-full py-4 px-6 rounded-md border border-border/60 transition-all
                        ${isAnyLoading ? 'opacity-50 cursor-not-allowed bg-muted' : 'hover:border-destructive/50 hover:bg-destructive/5 cursor-pointer group'}
                    `}>
                        <div className="flex flex-col items-start gap-1">
                            <span className="font-bold flex items-center gap-2 text-destructive">
                                <IoCloudUploadOutline className="group-hover:scale-110 transition-transform" size={18} /> 
                                Import Data
                            </span>
                            <span className="text-xs text-muted-foreground font-normal">Restore from JSON file (Overwrite)</span>
                        </div>
                        {loadingImport && <Loader2 className="animate-spin text-destructive" size={18} />}
                    </div>
                </label>
            </div>

          </div>
        </DialogContent>
      </Dialog>

      {/* 2. CONFIRMATION ALERT (Muncul setelah pilih file) */}
      <AlertDialog open={showConfirmImport} onOpenChange={setShowConfirmImport}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
               <IoWarning /> Warning: Overwrite Data?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will <b>PERMANENTLY DELETE</b> your current data (Todos, Goals, Stats) and replace it with the data from the backup file.
              <br/><br/>
              Your actual account (Email/Login) will remain safe.
              <br/><br/>
              <b>Are you sure you want to proceed?</b>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFileToImport(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleImport}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Overwrite My Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}