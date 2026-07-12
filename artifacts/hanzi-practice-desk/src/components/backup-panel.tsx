import { useRef, useState, type ChangeEvent } from "react";
import { Download, FileUp, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  exportStoreSnapshot,
  importStoreSnapshot,
  type StorageSnapshot,
} from "@/lib/store";

function createBackupFilename() {
  const date = new Date().toISOString().slice(0, 10);
  return `hanzi-practice-backup-${date}.json`;
}

function isValidSnapshot(value: unknown): value is StorageSnapshot {
  if (!value || typeof value !== "object") return false;

  const snapshot = value as Partial<StorageSnapshot>;
  return (
    typeof snapshot.version === "number" &&
    typeof snapshot.exportedAt === "string" &&
    typeof snapshot.deviceLabel === "string" &&
    typeof snapshot.activeDeckId === "string" &&
    typeof snapshot.progress === "object" &&
    snapshot.progress !== null &&
    Array.isArray(snapshot.decks) &&
    typeof snapshot.hskState === "object" &&
    snapshot.hskState !== null
  );
}

export function BackupPanel() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    try {
      const snapshot = exportStoreSnapshot();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = createBackupFilename();
      link.click();
      URL.revokeObjectURL(url);

      setErrorMessage(null);
      setStatusMessage("Backup downloaded. Keep this JSON file somewhere safe.");
    } catch {
      setStatusMessage(null);
      setErrorMessage("Couldn’t create a backup file right now.");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as unknown;

      if (!isValidSnapshot(parsed)) {
        throw new Error("invalid-backup");
      }

      importStoreSnapshot(parsed);
      setErrorMessage(null);
      setStatusMessage(
        "Backup imported. Your decks, progress, and HSK study state have been restored.",
      );
    } catch {
      setStatusMessage(null);
      setErrorMessage(
        "That file doesn’t look like a valid Hanzi Practice backup.",
      );
    }
  };

  return (
    <div className="app-surface-strong p-5 md:p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="eyebrow mb-2">Backup</p>
          <h2 className="text-xl font-medium mb-2">Keep your study data safe</h2>
          <p className="section-copy">
            Download one backup file with your progress, custom decks, and HSK
            study state, then import it on another device whenever you need it.
          </p>
        </div>
      </div>

      {statusMessage ? (
        <Alert className="border-primary/20 bg-primary/5">
          <AlertTitle>Backup ready</AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Backup needs attention</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <div className="rounded-[22px] border border-white/80 bg-white/72 p-4 md:p-5 space-y-4">
        <div className="grid gap-2">
          <div className="font-medium">One file, full restore</div>
          <div className="text-sm text-muted-foreground">
            Each backup contains everything stored on this device so you can
            move your practice history without signing in.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            type="button"
            onClick={handleDownloadBackup}
            className="h-12 rounded-full px-6"
          >
            <Download className="w-4 h-4" />
            Download Backup
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleImportClick}
            className="h-12 rounded-full px-6"
          >
            <FileUp className="w-4 h-4" />
            Import Backup
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportBackup}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
}
