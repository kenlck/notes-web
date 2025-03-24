import React from "react";
import { db } from "@/lib/prisma";
import { TiptapEditor } from "./editor";

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
      <TiptapEditor content={note.content ?? ""} />
    </div>
  );
}
