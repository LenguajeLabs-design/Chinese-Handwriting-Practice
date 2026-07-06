import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Layout } from "@/components/Layout";
import { PracticeScreen } from "@/pages/PracticeScreen";
import { CustomListScreen } from "@/pages/CustomListScreen";
import { ProgressScreen } from "@/pages/ProgressScreen";
import { DecksScreen } from "@/pages/DecksScreen";

const queryClient = new QueryClient();

function Router() {
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
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
