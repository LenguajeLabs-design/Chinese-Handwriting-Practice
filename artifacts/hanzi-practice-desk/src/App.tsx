import { useEffect, useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";
import { PracticeScreen } from "@/pages/PracticeScreen";
import { CustomListScreen } from "@/pages/CustomListScreen";
import { ProgressScreen } from "@/pages/ProgressScreen";
import { DecksScreen } from "@/pages/DecksScreen";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

const queryClient = new QueryClient();

function Router() {
  const routerMode = import.meta.env.VITE_ROUTER_MODE;
  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin).toString();
  const [, setLocation] = useLocation();
  const [authCallbackState, setAuthCallbackState] = useState<"idle" | "loading" | "error">(
    "idle",
  );

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const client = getSupabaseClient();
    const code = new URLSearchParams(window.location.search).get("code");
    if (!client || !code) return;

    let cancelled = false;
    setAuthCallbackState("loading");

    client.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (cancelled) return;
        if (error) {
          setAuthCallbackState("error");
          return;
        }

        const destination =
          routerMode === "hash" ? `${baseUrl}#/progress` : `${baseUrl}progress`;
        window.history.replaceState({}, "", destination);
        setLocation("/progress", { replace: true });
        setAuthCallbackState("idle");
      })
      .catch(() => {
        if (!cancelled) {
          setAuthCallbackState("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [baseUrl, routerMode, setLocation]);

  if (authCallbackState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="app-surface-strong max-w-md w-full p-8 text-center">
          <p className="eyebrow mb-3">Cloud Sync</p>
          <h1 className="text-2xl font-medium mb-3">Signing you in...</h1>
          <p className="text-muted-foreground">
            Hang tight while we finish your Google sign-in and return you to
            Progress.
          </p>
        </div>
      </div>
    );
  }

  if (authCallbackState === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="app-surface-strong max-w-md w-full p-8 text-center">
          <p className="eyebrow mb-3">Cloud Sync</p>
          <h1 className="text-2xl font-medium mb-3">Google sign-in hit a snag</h1>
          <p className="text-muted-foreground">
            Refresh this page, return to Progress, and try Continue with Google
            once more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={PracticeScreen} />
        <Route path="/decks" component={DecksScreen} />
        <Route path="/custom" component={CustomListScreen} />
        <Route path="/progress" component={ProgressScreen} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  const routerMode = import.meta.env.VITE_ROUTER_MODE;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter
          base={import.meta.env.BASE_URL.replace(/\/$/, "")}
          hook={routerMode === "hash" ? useHashLocation : undefined}
        >
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
