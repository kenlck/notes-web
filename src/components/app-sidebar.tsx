"use client";

import * as React from "react";
import { ChevronRight, File, Folder, FolderPlusIcon, PlusSquareIcon } from "lucide-react";
import { CreateFolderDialog } from "@/components/create-folder-dialog";
import { CreateNoteDialog } from "@/components/create-note-dialog";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "./ui/button";
import Link from "next/link";

interface Note {
  id: string;
  title: string | null;
  content: string | null;
  path: string | null;
}

interface Folder {
  id: string;
  name: string | null;
  notes: Note[];
  children: Folder[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: directory } = api.notes.getDirectory.useQuery();
  const router = useRouter();
  const { mutate } = api.notes.updateLastOpened.useMutation({
    onSuccess: (data) => {
      router.push(`/notes/${data.id}`);
    },
  });

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex flex-col px-2 py-2">
          <Link href="/" className="font-bold text-2xl">
            Notes
          </Link>
          <div className="flex flex-row items-center gap-2 justify-between">
            <CreateNoteDialog
              folders={directory?.folders ?? []}
              trigger={
                <Button className="flex-1">
                  <PlusSquareIcon className="mr-2 h-4 w-4" /> New Note
                </Button>
              }
            />
            <CreateFolderDialog
              folders={directory?.folders ?? []}
              trigger={
                <Button variant="outline">
                  <FolderPlusIcon />
                </Button>
              }
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Root Notes Section */}
        {directory?.rootNotes && directory.rootNotes.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Notes</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {directory.rootNotes.map((note) => (
                  <SidebarMenuButton
                    key={note.id}
                    className="cursor-pointer"
                    onClick={() => mutate({ noteId: note.id })}
                  >
                    <File />
                    {note.title || "Untitled Note"}
                  </SidebarMenuButton>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Folders Section */}
        {directory?.folders && directory.folders.length > 0 && (
          <SidebarGroup className="-mt-6">
            {/* <SidebarGroupLabel>Folders</SidebarGroupLabel> */}
            <SidebarGroupContent>
              <SidebarMenu>
                {directory.folders.map((folder) => (
                  <FolderItem key={folder.id} folder={folder} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function FolderItem({ folder }: { folder: Folder }) {
  const router = useRouter();
  const { mutate } = api.notes.updateLastOpened.useMutation({
    onSuccess: (data) => {
      router.push(`/notes/${data.id}`);
    },
  });

  return (
    <SidebarMenuItem>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:first-child]:rotate-90"
        defaultOpen={true}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton>
            <ChevronRight className="transition-transform" />
            <Folder />
            {folder.name || "Untitled Folder"}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {/* Render child folders first */}
            {folder.children.map((childFolder) => (
              <FolderItem key={childFolder.id} folder={childFolder} />
            ))}
            {/* Then render notes */}
            {folder.notes.map((note) => (
              <SidebarMenuButton key={note.id} className="cursor-pointer" onClick={() => mutate({ noteId: note.id })}>
                <File />
                {note.title || "Untitled Note"}
              </SidebarMenuButton>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
