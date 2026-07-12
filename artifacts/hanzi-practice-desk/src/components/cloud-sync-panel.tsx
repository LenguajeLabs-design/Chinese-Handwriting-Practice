import { Cloud, Download, LogOut, ShieldCheck, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCloudSync } from "@/hooks/use-cloud-sync";

function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "Not yet";

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CloudSyncPanel() {
  const {
    configured,
    user,
    email,
    setEmail,
    isBusy,
    statusMessage,
    errorMessage,
    autoSyncEnabled,
    remoteSnapshot,
    cloudIsNewer,
    uploadSnapshot,
    restoreSnapshot,
    sendMagicLink,
    signOut,
  } = useCloudSync();
  const latestBackupAt =
    remoteSnapshot?.snapshot.metadata.lastUpdatedAt ??
    remoteSnapshot?.updated_at;

  if (!configured) {
    return (
      <div className="app-surface-strong p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Cloud className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="eyebrow mb-2">Cloud Backup</p>
            <h2 className="text-xl font-medium mb-2">Sync across devices</h2>
            <p className="section-copy">
              Add your Supabase URL and anon key as{" "}
              <code>VITE_SUPABASE_URL</code> and{" "}
              <code>VITE_SUPABASE_ANON_KEY</code> to turn on cloud backup.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-surface-strong p-5 md:p-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="eyebrow mb-2">Cloud Backup</p>
          <h2 className="text-xl font-medium mb-2">Keep your progress safe</h2>
          <p className="section-copy">
            Sign in once, back up this device, and restore the same study
            progress on any other iPad or computer.
          </p>
        </div>
      </div>

      {statusMessage ? (
        <Alert className="border-primary/20 bg-primary/5">
          <AlertTitle>Cloud sync update</AlertTitle>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      ) : null}

      {errorMessage ? (
        <Alert variant="destructive">
          <AlertTitle>Cloud sync needs attention</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      {!user ? (
        <div className="space-y-4">
          <div className="rounded-[22px] border border-white/80 bg-white/72 p-4 space-y-3">
            <div>
              <div className="font-medium">Sign in with email</div>
              <div className="text-sm text-muted-foreground mt-1">
                Use the same email on each device. Supabase will send you a
                magic link instead of a password.
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 rounded-2xl bg-white/84 border-white/85"
              />
              <Button
                type="button"
                onClick={sendMagicLink}
                disabled={isBusy || !email.trim()}
                className="h-12 rounded-full px-6"
              >
                Email Sign-In Link
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[22px] border border-white/80 bg-white/72 p-4 grid sm:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Signed in as</div>
              <div className="font-medium mt-1 break-all">{user.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Latest cloud backup
              </div>
              <div className="font-medium mt-1">
                {formatTimestamp(latestBackupAt)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Auto-backup</div>
              <div className="font-medium mt-1">
                {autoSyncEnabled
                  ? "On for this device"
                  : "Off until first backup"}
              </div>
            </div>
          </div>

          {cloudIsNewer ? (
            <Alert className="border-amber-200 bg-amber-50 text-amber-950">
              <AlertTitle>Cloud backup looks newer</AlertTitle>
              <AlertDescription>
                Another device may have newer progress. Restore it here before
                making lots of new changes on this device.
              </AlertDescription>
            </Alert>
          ) : null}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              onClick={() => uploadSnapshot()}
              disabled={isBusy}
              className="h-12 rounded-full px-6"
            >
              <Upload className="w-4 h-4" />
              Back Up This Device
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={restoreSnapshot}
              disabled={isBusy || !remoteSnapshot}
              className="h-12 rounded-full px-6"
            >
              <Download className="w-4 h-4" />
              Restore Cloud Progress
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={signOut}
              disabled={isBusy}
              className="h-12 rounded-full px-6"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
