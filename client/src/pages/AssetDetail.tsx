import { useAsset } from "@/hooks/use-assets";
import { Link, useRoute } from "wouter";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  Briefcase, 
  Building,
  Activity,
  FileText,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export default function AssetDetail() {
  const [match, params] = useRoute("/assets/:id");
  const id = params ? parseInt(params.id) : 0;
  const { data: asset, isLoading } = useAsset(id);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <h2 className="text-xl font-semibold">Asset not found</h2>
        <Link href="/assets">
          <Button variant="outline">Back to Assets</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in-slide-up max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/assets">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-display text-slate-900">{asset.item_name}</h1>
          <p className="text-muted-foreground">{asset.model}</p>
        </div>
        <div className="ml-auto">
          <Badge className={asset.is_available ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>
            {asset.is_available ? "Available" : "Assigned"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Asset Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Serial Number</p>
                <p className="font-mono text-sm">{asset.serial_number || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Internal ID (Sr. No)</p>
                <p className="font-mono text-sm">{asset.sr_no || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Condition</p>
                <p>{asset.working_condition}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Company/Vendor</p>
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span>{asset.company || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Currently Assigned To</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                    {asset.assigned_to?.[0] || "?"}
                  </div>
                  <span>{asset.assigned_to || "Unassigned"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground font-medium">Profile/Department</p>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span>{asset.profile || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {asset.notes && (
            <Card className="shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                  {asset.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-1">
          <Card className="h-full shadow-sm border-border/50 bg-slate-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                History Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {asset.changes?.map((change, i) => (
                  <div key={change.id} className="relative flex items-start group">
                    <div className="absolute left-0 h-5 w-5 rounded-full border border-slate-200 bg-white group-hover:border-primary group-hover:scale-110 transition-all z-10" />
                    <div className="ml-8 space-y-1">
                      <p className="text-sm font-medium leading-none text-slate-900">
                        Updated <span className="text-primary font-mono">{change.field_name}</span>
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1 bg-white p-2 rounded border border-border shadow-sm">
                         <div className="flex items-center gap-2 text-red-500 line-through opacity-70">
                           <span className="w-6 font-semibold">Old:</span> 
                           {change.old_value || <span className="italic">Empty</span>}
                         </div>
                         <div className="flex items-center gap-2 text-green-600 font-medium">
                           <span className="w-6 font-semibold text-slate-500">New:</span> 
                           {change.new_value || <span className="italic">Empty</span>}
                         </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                        <User className="w-3 h-3" />
                        {change.changed_by}
                        <span className="mx-1">•</span>
                        <Calendar className="w-3 h-3" />
                        {format(new Date(change.changed_at!), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
                
                {(!asset.changes || asset.changes.length === 0) && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No history recorded yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
