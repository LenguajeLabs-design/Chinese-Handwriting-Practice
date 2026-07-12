import { useEffect, useMemo, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import {
  exportStoreSnapshot,
  getStoreMetadata,
  importStoreSnapshot,
  markCloudSyncCompleted,
  subscribeToStore,
  type StorageSnapshot,
} from "@/lib/store";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

const CLOUD_SYNC_TABLE = "hanzi_progress_snapshots";
const AUTO_SYNC_KEY = "hanzi_cloud_auto_sync";

interface CloudSnapshotRow {
  snapshot: StorageSnapshot;
  updated_at: string;
  user_id: string;
}

function readAutoSyncEnabled(): boolean {
  if (typeof localStorage === "undefined") return false;
  return localStorage.getItem(AUTO_SYNC_KEY) === "true";
}

function saveAutoSyncEnabled(value: boolean) {
  localStorage.setItem(AUTO_SYNC_KEY, value ? "true" : "false");
}

export function useCloudSync() {
  const client = useMemo(() => getSupabaseClient(), []);
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(readAutoSyncEnabled);
  const [remoteSnapshot, setRemoteSnapshot] = useState<CloudSnapshotRow | null>(
    null,
  );
  const autoSaveTimerRef = useRef<number | null>(null);

  const localMetadata = getStoreMetadata();
  const localUpdatedAt = localMetadata.lastUpdatedAt;
  const remoteUpdatedAt = remoteSnapshot?.snapshot.metadata.lastUpdatedAt
    ? remoteSnapshot.snapshot.metadata.lastUpdatedAt
    : (remoteSnapshot?.updated_at ?? null);

  const cloudIsNewer =
    Boolean(remoteUpdatedAt) &&
    (!localUpdatedAt ||
      new Date(remoteUpdatedAt!).getTime() >
        new Date(localUpdatedAt).getTime());

  async function refreshRemoteSnapshot(activeUser: User) {
    if (!client) return null;

    const { data, error } = await client
      .from(CLOUD_SYNC_TABLE)
      .select("user_id, updated_at, snapshot")
      .eq("user_id", activeUser.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const row = (data as CloudSnapshotRow | null) ?? null;
    setRemoteSnapshot(row);
    return row;
  }

  async function uploadSnapshot(options?: { silent?: boolean }) {
    if (!client || !user) return;

    if (!options?.silent) {
      setIsBusy(true);
      setErrorMessage(null);
      setStatusMessage(null);
    }

    try {
      const snapshot = exportStoreSnapshot();
      const savedAt = new Date().toISOString();
      const { data, error } = await client
        .from(CLOUD_SYNC_TABLE)
        .upsert(
          {
            user_id: user.id,
            snapshot,
            updated_at: savedAt,
          },
          { onConflict: "user_id" },
        )
        .select("user_id, updated_at, snapshot")
        .single();

      if (error) throw error;

      const row = data as CloudSnapshotRow;
      markCloudSyncCompleted(row.updated_at);
      setRemoteSnapshot(row);
      setAutoSyncEnabled(true);
      saveAutoSyncEnabled(true);

      if (!options?.silent) {
        setStatusMessage("This device is now backed up to Supabase.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cloud backup failed.";
      setErrorMessage(message);
    } finally {
      if (!options?.silent) {
        setIsBusy(false);
      }
    }
  }

  async function restoreSnapshot() {
    if (!client || !user) return;

    setIsBusy(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const latestRow = await refreshRemoteSnapshot(user);
      const latestSnapshot = latestRow?.snapshot;
      if (!latestSnapshot) {
        setErrorMessage("No cloud backup was found for this account yet.");
        return;
      }

      importStoreSnapshot(latestSnapshot);
      markCloudSyncCompleted(latestRow?.updated_at);
      setAutoSyncEnabled(true);
      saveAutoSyncEnabled(true);
      setStatusMessage("Cloud progress restored to this device.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cloud restore failed.";
      setErrorMessage(message);
    } finally {
      setIsBusy(false);
    }
  }

  async function sendMagicLink() {
    if (!client) return;

    setIsBusy(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.href,
        },
      });

      if (error) throw error;

      setStatusMessage("Check your email on this device to finish sign-in.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not send sign-in link.";
      setErrorMessage(message);
    } finally {
      setIsBusy(false);
    }
  }

  async function signOut() {
    if (!client) return;

    setIsBusy(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const { error } = await client.auth.signOut();
      if (error) throw error;
      setAutoSyncEnabled(false);
      saveAutoSyncEnabled(false);
      setRemoteSnapshot(null);
      setStatusMessage("Signed out of cloud sync on this device.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not sign out.";
      setErrorMessage(message);
    } finally {
      setIsBusy(false);
    }
  }

  useEffect(() => {
    if (!client) return;

    client.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    if (!client || !user) return;

    refreshRemoteSnapshot(user).catch((error) => {
      const message =
        error instanceof Error ? error.message : "Could not load cloud backup.";
      setErrorMessage(message);
    });
  }, [client, user]);

  useEffect(() => {
    if (!client || !user || !autoSyncEnabled) return;

    return subscribeToStore(() => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = window.setTimeout(() => {
        uploadSnapshot({ silent: true });
      }, 1200);
    });
  }, [client, user, autoSyncEnabled]);

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  return {
    configured,
    session,
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
  };
}
