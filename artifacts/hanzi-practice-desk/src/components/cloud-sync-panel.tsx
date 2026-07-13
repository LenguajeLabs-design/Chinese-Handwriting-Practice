import { Cloud, Download, LogOut, ShieldCheck, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
    isBusy,
    statusMessage,
    errorMessage,
    autoSyncEnabled,
    remoteSnapshot,
    cloudIsNewer,
    uploadSnapshot,
    restoreSnapshot,
    signInWithGoogle,
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
            <p className="eyebrow mb-2">Cloud Sync</p>
            <h2 className="text-xl font-medium mb-2">Sync across devices</h2>
            <p className="section-copy">
              Add your Supabase URL and anon key as{" "}
              <code>VITE_SUPABASE_URL</code> and{" "}
              <code>VITE_SUPABASE_ANON_KEY</code> to turn on account-based sync.
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
          <p className="eyebrow mb-2">Cloud Sync</p>
          <h2 className="text-xl font-medium mb-2">Keep progress in one place</h2>
          <p className="section-copy">
            Sign in once, sync this device to Supabase, and restore the same
            study progress on your iPad, phone, or computer.
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
        <div className="rounded-[22px] border border-white/80 bg-white/72 p-4 space-y-3">
          <div>
            <div className="font-medium">Continue with Google</div>
            <div className="text-sm text-muted-foreground mt-1">
              Use the same Google account on each device for a smoother sign-in
              and more reliable syncing.
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:max-w-md">
            <Button
              type="button"
              onClick={signInWithGoogle}
              disabled={isBusy}
              className="h-12 rounded-full px-6"
            >
              <GoogleMark />
              Continue with Google
            </Button>
            <p className="text-xs text-muted-foreground">
              After you sign in once, you can sync this device and restore the
              same progress on your iPad, phone, or computer.
            </p>
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
                Latest cloud sync
              </div>
              <div className="font-medium mt-1">
                {formatTimestamp(latestBackupAt)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Auto-sync</div>
              <div className="font-medium mt-1">
                {autoSyncEnabled
                  ? "On for this device"
                  : "Off until first cloud save"}
              </div>
            </div>
          </div>

          {cloudIsNewer ? (
            <Alert className="border-amber-200 bg-amber-50 text-amber-950">
              <AlertTitle>Cloud progress looks newer</AlertTitle>
              <AlertDescription>
                Another device may have newer study progress. Restore it here
                before making lots of new changes on this device.
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
              Sync This Device
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

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      focusable="false"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4A9.6 9.6 0 0 0 2.4 12 9.6 9.6 0 0 0 12 21.6c5.5 0 9.1-3.8 9.1-9.2 0-.6-.1-1.1-.2-1.5H12Z"
      />
      <path
        fill="#4285F4"
        d="M3.5 7.4 6.7 9.7A6 6 0 0 1 12 6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.3 14.7 2.4 12 2.4c-3.7 0-6.8 2.1-8.5 5Z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.6c2.6 0 4.8-.9 6.4-2.4l-3-2.4c-.8.6-1.9 1.1-3.4 1.1a6 6 0 0 1-5.7-4L3 16.3a9.6 9.6 0 0 0 9 5.3Z"
      />
      <path
        fill="#34A853"
        d="M3 16.3 6.3 14A6 6 0 0 1 6 12c0-.7.1-1.4.3-2L3 7.4A9.5 9.5 0 0 0 2.4 12c0 1.6.4 3.1.6 4.3Z"
      />
    </svg>
  );
}
