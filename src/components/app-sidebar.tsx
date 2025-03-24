"use client";

import * as React from "react";
import { ChevronRight, File, Folder, FolderPlusIcon, PlusSquareIcon } from "lucide-react";
import { api } from "@/trpc/react";

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

interface Note {
  id: string;
  title: string | null;
  content: string | null;
}

interface Folder {
  id: string;
  name: string | null;
  notes: Note[];
  children: Folder[];
}

interface DirectoryData {
  folders: Folder[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: directory } = api.notes.getDirectory.useQuery();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex flex-col px-2 py-2">
          <h1 className="font-bold text-2xl">Notes</h1>
          <div className="flex flex-row items-center gap-2 justify-between">
            <Button className="flex-1">
              <PlusSquareIcon /> New Note
            </Button>
            <Button variant="outline">
              <FolderPlusIcon />
            </Button>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Folders</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {directory?.folders.map((folder) => (
                <FolderItem key={folder.id} folder={folder} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

function FolderItem({ folder }: { folder: Folder }) {
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
              <SidebarMenuButton key={note.id}>
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
