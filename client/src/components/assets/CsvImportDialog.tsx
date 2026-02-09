import { useState } from "react";
import Papa from "papaparse";
import { useImportAssets } from "@/hooks/use-assets";
import { insertAssetSchema, type InsertAsset } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileUp, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export function CsvImportDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ total: number } | null>(null);
  const importAssets = useImportAssets();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setStats(null);
    }
  };

  const handleUpload = () => {
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Map CSV fields to schema fields if necessary (simple mapping assumed here)
          // Also handle basic transformation like string "TRUE" to boolean
          const parsedData = results.data.map((row: any) => {
            return {
              item_name: row.item_name || row["Item Name"],
              model: row.model || row["Model"],
              serial_number: row.serial_number || row["Serial Number"] || row["Serial"],
              assigned_to: row.assigned_to || row["Assigned To"] || row["User"],
              profile: row.profile || row["Profile"],
              company: row.company || row["Company"],
              working_condition: row.working_condition || row["Condition"] || "Working",
              is_available: 
                String(row.is_available || row["Available"]).toLowerCase() === "true" || 
                String(row.is_available || row["Available"]).toLowerCase() === "yes",
              notes: row.notes || row["Notes"],
              sr_no: row.sr_no || row["Sr No"] || row["Sr. No"],
            };
          });

          // Validate against schema
          const validData: InsertAsset[] = [];
          
          for (const item of parsedData) {
            const result = insertAssetSchema.safeParse(item);
            if (result.success) {
              validData.push(result.data);
            } else {
              console.warn("Skipping invalid row:", item, result.error);
            }
          }

          if (validData.length === 0) {
            setError("No valid assets found in CSV. Please check headers.");
            return;
          }

          await importAssets.mutateAsync(validData);
          setStats({ total: validData.length });
          toast({
            title: "Import Successful",
            description: `Successfully imported ${validData.length} assets.`,
          });
          
          // Reset after short delay
          setTimeout(() => {
            setOpen(false);
            setFile(null);
            setStats(null);
          }, 2000);

        } catch (err) {
          setError("Failed to process CSV data.");
          console.error(err);
        }
      },
      error: (err) => {
        setError("Error parsing CSV file: " + err.message);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="w-4 h-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Assets</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import assets.
            Required headers: item_name, model.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileUp className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {file ? file.name : "Click to upload CSV"}
                </p>
              </div>
              <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
            </label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {stats && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>Imported {stats.total} assets successfully.</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || importAssets.isPending || !!stats}
          >
            {importAssets.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : "Start Import"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
