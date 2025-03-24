"use client";

import { useState } from "react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export function RecentNotes() {
  const router = useRouter();
  const { data: recentNotes, isLoading } = api.notes.getRecentNotes.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Notes</h2>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-3 w-1/2 bg-gray-200 rounded mt-2"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!recentNotes?.length) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Notes</h2>
        <Card className="p-4 text-center text-gray-500">No recent notes found</Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Recent Notes</h2>
      <div className="space-y-2">
        {recentNotes.map((note) => (
          <Card
            key={note.id}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => {
              api.notes.updateLastOpened.useMutation().mutate({ noteId: note.id });
              router.push(`/notes/${note.id}`);
            }}
          >
            <h3 className="font-medium">{note.title || "Untitled Note"}</h3>
            <p className="text-sm text-gray-500 truncate mt-1">{note.content || "No content"}</p>
            <div className="text-xs text-gray-400 mt-2">
              {note.folder?.name && <span className="mr-2">In: {note.folder.name}</span>}
              Last opened: {note.lastOpenedAt ? new Date(note.lastOpenedAt).toLocaleDateString() : "Never"}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
