"use client";

import { RecentNotes } from "@/app/(authed)/recent-notes";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

export default function Page() {
  return (
    <div className="max-w-4xl w-full mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome to Notes</h1>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>
      <div>
        <RecentNotes />
      </div>
    </div>
  );
}
