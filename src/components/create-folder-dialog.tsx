"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { toast } from "sonner";

interface Folder {
  id: string;
  name: string | null;
  notes: Array<{ id: string; title: string | null }>;
  children: Folder[];
}

interface Props {
  folders: Folder[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateFolderDialog({ folders, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: Props) {
  const [folderName, setFolderName] = useState("");
  const [parentId, setParentId] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();

  const open = controlledOpen ?? isOpen;
  const onOpenChange = setControlledOpen ?? setIsOpen;

  const { mutate: createFolder, isPending } = api.notes.createFolder.useMutation({
    onSuccess: () => {
      // Reset form
      setFolderName("");
      setParentId(undefined);
      // Close dialog
      onOpenChange(false);
      // Invalidate directory query to refresh folder list
      utils.notes.getDirectory.invalidate();
      // Show success message
      toast.success("Folder created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create folder: ${error.message}`);
    },
  });

  // Recursively flatten folders for select options
  const flattenFolders = (folders: Folder[], prefix = ""): React.ReactElement[] => {
    return folders.flatMap((folder) => [
      <SelectItem key={folder.id} value={folder.id}>
        {prefix + (folder.name || "Untitled Folder")}
      </SelectItem>,
      ...flattenFolders(folder.children, `${prefix}${folder.name || "Untitled Folder"} / `),
    ]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    createFolder({ name: folderName, parentId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Folder Name</Label>
            <Input
              id="name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="parent">Parent Folder (Optional)</Label>
            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a parent folder" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Root</SelectLabel>
                  <SelectItem value="---root">Root</SelectItem>
                  <SelectLabel>Folders</SelectLabel>
                  {flattenFolders(folders)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
