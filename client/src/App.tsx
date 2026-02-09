import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Layout
import { AppSidebar, MobileHeader } from "@/components/layout/AppSidebar";

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Assets from "@/pages/Assets";
import AssetDetail from "@/pages/AssetDetail";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect handled by useAuth or simpler here
    setTimeout(() => setLocation("/login"), 0);
    return null;
  }

  return <Component />;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all duration-300">
        <MobileHeader />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/">
        {isAuthenticated ? (
          <AuthenticatedLayout>
            <Dashboard />
          </AuthenticatedLayout>
        ) : (
          <Login />
        )}
      </Route>
      
      <Route path="/assets">
        <ProtectedRoute component={() => (
          <AuthenticatedLayout>
            <Assets />
          </AuthenticatedLayout>
        )} />
      </Route>

      <Route path="/assets/:id">
        <ProtectedRoute component={() => (
          <AuthenticatedLayout>
            <AssetDetail />
          </AuthenticatedLayout>
        )} />
      </Route>

      <Route path="/admin">
        <ProtectedRoute component={() => (
          <AuthenticatedLayout>
            <Admin />
          </AuthenticatedLayout>
        )} />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
