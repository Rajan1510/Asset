import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  LogOut,
  Building2
} from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const [location] = useLocation();
  const { data: settings } = useSettings();
  const { user, logout } = useAuth();
  
  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/assets", label: "Assets", icon: Package },
    { href: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen fixed left-0 top-0 z-50 border-r border-sidebar-border hidden md:flex">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-sidebar-primary rounded-lg text-sidebar-primary-foreground">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight line-clamp-1">
            {settings?.company_name || "Asset Manager"}
          </h1>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 font-medium",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive && "text-sidebar-primary")} />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-sidebar-border/50">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 border border-sidebar-foreground/10">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-sidebar-accent text-sidebar-accent-foreground">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-sidebar-border bg-transparent"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>
    </aside>
  );
}

export function MobileHeader() {
  const { data: settings } = useSettings();
  const { logout } = useAuth();
  
  return (
    <div className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-primary rounded-md text-primary-foreground">
          <Building2 className="w-5 h-5" />
        </div>
        <span className="font-bold font-display">{settings?.company_name || "Asset Manager"}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={() => logout()}>
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );
}
