import { useState } from "react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { useUsers, useToggleAdmin } from "@/hooks/use-admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Admin() {
  const { data: settings, isLoading: loadingSettings } = useSettings();
  const { data: users, isLoading: loadingUsers } = useUsers();
  const updateSettings = useUpdateSettings();
  const toggleAdmin = useToggleAdmin();
  const { toast } = useToast();

  const [companyName, setCompanyName] = useState("");

  // Update local state when settings load
  if (settings && companyName === "" && !loadingSettings) {
    setCompanyName(settings.company_name);
  }

  const handleSaveSettings = async () => {
    try {
      await updateSettings.mutateAsync({ company_name: companyName });
      toast({ title: "Settings saved", description: "Company name updated successfully." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" });
    }
  };

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleAdmin.mutateAsync(userId);
      toast({ 
        title: "Role updated", 
        description: `User is ${!currentStatus ? "now an admin" : "no longer an admin"}.` 
      });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update role.", variant: "destructive" });
    }
  };

  if (loadingSettings || loadingUsers) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in-fade">
      <div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Admin Panel</h2>
        <p className="text-muted-foreground mt-1">Manage general settings and user roles.</p>
      </div>

      <div className="grid gap-8">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure basic application information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="companyName">Company Name</Label>
              <div className="flex gap-2">
                <Input 
                  id="companyName" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)} 
                />
                <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
                  {updateSettings.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This name will appear in the sidebar and page titles.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage user roles and access permissions.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {users?.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={`https://ui-avatars.com/api/?name=${user.username || 'User'}&background=random`} />
                      <AvatarFallback>{user.username?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.username || "Unknown User"}</p>
                      <p className="text-sm text-muted-foreground">{user.email || "No email"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`admin-${user.id}`} className="text-sm cursor-pointer">
                        {user.isAdmin ? (
                          <span className="flex items-center text-primary font-medium">
                            <ShieldCheck className="w-3 h-3 mr-1" />
                            Admin
                          </span>
                        ) : (
                          <span className="text-muted-foreground">User</span>
                        )}
                      </Label>
                      <Switch 
                        id={`admin-${user.id}`}
                        checked={user.isAdmin}
                        onCheckedChange={() => handleToggleAdmin(user.id, user.isAdmin)}
                        disabled={toggleAdmin.isPending}
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {(!users || users.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No users found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
