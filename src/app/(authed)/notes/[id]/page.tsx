import React from "react";
import { db } from "@/lib/prisma";
import { TiptapEditor } from "./editor";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

export default async function Page({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const note = await db.note.findUnique({
    where: {
      id,
    },
    include: {
      folder: true,
    },
  });
  if (!note) {
    return <div>Note not found</div>;
  }
  return (
    <div className="flex-1 h-full w-full flex flex-col">
      {/* <Breadcrumb className="px-4 py-2">
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
      </Breadcrumb> */}
      <TiptapEditor content={note.content ?? ""} />
    </div>
  );
}
