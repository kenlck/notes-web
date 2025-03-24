"use client";

import { RecentNotes } from "@/app/(authed)/recent-notes";

export default function Page() {
  return (
    <div className="max-w-4xl w-full mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome to Notes</h1>
      </div>
      <div>
        <RecentNotes />
      </div>
    </div>
  );
}
