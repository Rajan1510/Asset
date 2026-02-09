import { useState } from "react";
import { Link } from "wouter";
import { useAssets, useDeleteAsset } from "@/hooks/use-assets";
import { AssetFormDialog } from "@/components/assets/AssetFormDialog";
import { CsvImportDialog } from "@/components/assets/CsvImportDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Download,
  Loader2
} from "lucide-react";
import type { Asset, InsertAsset } from "@shared/schema";
import Papa from "papaparse";

export default function Assets() {
  const [search, setSearch] = useState("");
  const { data: assets, isLoading } = useAssets(search);
  const deleteAsset = useDeleteAsset();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<(InsertAsset & { id: number }) | undefined>(undefined);
  
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteAsset.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleCreate = () => {
    setEditingAsset(undefined);
    setIsFormOpen(true);
  };

  const handleExport = () => {
    if (!assets) return;
    const csv = Papa.unparse(assets);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `assets_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "Working": return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100";
      case "Under Repair": return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100";
      case "Not Working": return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-8 animate-in-fade">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Assets</h2>
          <p className="text-muted-foreground mt-1">Manage your equipment inventory.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreate} className="shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl shadow-sm border border-border/50">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search assets..." 
            className="pl-9 bg-background/50 border-border/50 focus:bg-background transition-colors"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <CsvImportDialog />
          <Button variant="outline" onClick={handleExport} disabled={!assets?.length}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="font-semibold">Sr. No</TableHead>
              <TableHead className="font-semibold">Item Name</TableHead>
              <TableHead className="font-semibold">Assigned To</TableHead>
              <TableHead className="font-semibold">Condition</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex justify-center items-center h-full">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                </TableCell>
              </TableRow>
            ) : assets && assets.length > 0 ? (
              assets.map((asset) => (
                <TableRow key={asset.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">{asset.sr_no || "-"}</TableCell>
                  <TableCell>
                    <Link href={`/assets/${asset.id}`}>
                      <span className="font-medium text-foreground hover:text-primary hover:underline cursor-pointer block">
                        {asset.item_name}
                      </span>
                    </Link>
                    <span className="text-xs text-muted-foreground block">{asset.model}</span>
                  </TableCell>
                  <TableCell>
                    {asset.assigned_to ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {asset.assigned_to[0]}
                        </div>
                        <span className="text-sm">{asset.assigned_to}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getConditionColor(asset.working_condition)}>
                      {asset.working_condition}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {asset.is_available ? (
                      <Badge variant="default" className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none shadow-none font-medium">Available</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-100">In Use</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <Link href={`/assets/${asset.id}`}>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem onClick={() => handleEdit(asset)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(asset.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No assets found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AssetFormDialog 
        open={isFormOpen} 
        onOpenChange={setIsFormOpen}
        assetToEdit={editingAsset}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the asset and remove its history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
