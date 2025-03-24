"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export function CreateNoteDialog({ folders, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [folderId, setFolderId] = useState<string | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();

  const open = controlledOpen ?? isOpen;
  const onOpenChange = setControlledOpen ?? setIsOpen;

  const { mutate: createNote, isPending } = api.notes.createNote.useMutation({
    onSuccess: (note) => {
      // Reset form
      setTitle("");
      setFolderId(undefined);
      // Close dialog
      onOpenChange(false);
      // Invalidate directory query to refresh note list
      utils.notes.getDirectory.invalidate();
      // Show success message
      toast.success("Note created successfully");
      // Redirect to the new note
      router.push(`/notes/${note.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to create note: ${error.message}`);
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
    if (!title.trim()) {
      toast.error("Please enter a note title");
      return;
    }
    createNote({ title, folderId });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Note Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter note title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="folder">Folder (Optional)</Label>
            <Select value={folderId} onValueChange={setFolderId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a folder" />
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
