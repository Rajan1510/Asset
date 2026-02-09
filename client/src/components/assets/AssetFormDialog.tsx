import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAssetSchema, type InsertAsset } from "@shared/schema";
import { useCreateAsset, useUpdateAsset } from "@/hooks/use-assets";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

interface AssetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assetToEdit?: InsertAsset & { id: number };
}

export function AssetFormDialog({ open, onOpenChange, assetToEdit }: AssetFormDialogProps) {
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();
  const isEditing = !!assetToEdit;

  const form = useForm<InsertAsset>({
    resolver: zodResolver(insertAssetSchema),
    defaultValues: {
      item_name: "",
      model: "",
      serial_number: "",
      assigned_to: "",
      profile: "",
      company: "",
      working_condition: "Working",
      is_available: true,
      notes: "",
      sr_no: "",
    },
  });

  useEffect(() => {
    if (assetToEdit) {
      form.reset({
        ...assetToEdit,
        serial_number: assetToEdit.serial_number || "",
        assigned_to: assetToEdit.assigned_to || "",
        profile: assetToEdit.profile || "",
        company: assetToEdit.company || "",
        notes: assetToEdit.notes || "",
        sr_no: assetToEdit.sr_no || "",
      });
    } else {
      form.reset({
        item_name: "",
        model: "",
        serial_number: "",
        assigned_to: "",
        profile: "",
        company: "",
        working_condition: "Working",
        is_available: true,
        notes: "",
        sr_no: "",
      });
    }
  }, [assetToEdit, form, open]);

  const onSubmit = async (data: InsertAsset) => {
    try {
      if (isEditing) {
        await updateAsset.mutateAsync({ id: assetToEdit.id, ...data });
      } else {
        await createAsset.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  const isPending = createAsset.isPending || updateAsset.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Asset" : "Add New Asset"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="item_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. MacBook Pro" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model / Config *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. M2 Pro, 16GB" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sr_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sr. No</FormLabel>
                    <FormControl>
                      <Input placeholder="Internal Asset ID" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serial_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial / Part No.</FormLabel>
                    <FormControl>
                      <Input placeholder="Manufacturer Serial" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned User</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. John Doe" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="profile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department / Profile</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Engineering" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company / Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Dell, Apple" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="working_condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Working">Working</SelectItem>
                        <SelectItem value="Not Working">Not Working</SelectItem>
                        <SelectItem value="Under Repair">Under Repair</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-muted/20">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Available for assignment</FormLabel>
                    <div className="text-xs text-muted-foreground">
                      Enable if this asset is currently in stock.
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional remarks..." 
                      className="resize-none h-20"
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-primary text-primary-foreground">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Save Changes" : "Create Asset"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
