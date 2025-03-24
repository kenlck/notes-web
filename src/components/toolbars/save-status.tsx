import { SaveIcon } from "lucide-react";

interface SaveStatusProps {
  isSaving: boolean;
  lastSaved: Date | null;
}

export function SaveStatus({ isSaving, lastSaved }: SaveStatusProps) {
  const formattedTime = lastSaved?.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
      {lastSaved && <SaveIcon className="w-4 h-4" />}
      <span>{isSaving ? "Saving..." : lastSaved ? `Saved at ${formattedTime}` : ""}</span>
    </div>
  );
}
