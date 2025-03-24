"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { api } from "@/trpc/react";
import { useParams, usePathname } from "next/navigation";
import React from "react";

export function NotesBreadcrumb() {
  const params = useParams();
  const pathname = usePathname();
  const noteId = params.id as string;
  const { data: note } = api.notes.getNotePath.useQuery(
    {
      noteId: noteId,
    },
    {
      enabled: pathname === `/notes/${noteId}` && !!noteId,
    }
  );

  if (pathname !== `/notes/${noteId}`) {
    return null;
  }
  if (!noteId || !note) {
    return null;
  }

  return (
    <Breadcrumb className="px-4 py-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>/</BreadcrumbPage>
        </BreadcrumbItem>
        {note.path &&
          note.path !== "/" &&
          note.path
            .split("/")
            .filter(Boolean)
            .map((segment: string, index: number) => (
              <React.Fragment key={index}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{segment}</BreadcrumbPage>
                </BreadcrumbItem>
              </React.Fragment>
            ))}
        {note.title && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{note.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
