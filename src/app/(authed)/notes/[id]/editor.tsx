"use client";

import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { BlockquoteToolbar } from "@/components/toolbars/blockquote";
import { BoldToolbar } from "@/components/toolbars/bold";
import { BulletListToolbar } from "@/components/toolbars/bullet-list";
import { CodeToolbar } from "@/components/toolbars/code";
import { CodeBlockToolbar } from "@/components/toolbars/code-block";
import { HardBreakToolbar } from "@/components/toolbars/hard-break";
import { HorizontalRuleToolbar } from "@/components/toolbars/horizontal-rule";
import { ItalicToolbar } from "@/components/toolbars/italic";
import { OrderedListToolbar } from "@/components/toolbars/ordered-list";
import { RedoToolbar } from "@/components/toolbars/redo";
import { StrikeThroughToolbar } from "@/components/toolbars/strikethrough";
import { ToolbarProvider } from "@/components/toolbars/toolbar-provider";
import { UndoToolbar } from "@/components/toolbars/undo";
import { SaveStatus } from "@/components/toolbars/save-status";
import { EditorContent, type Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { ColorHighlightToolbar } from "@/components/toolbars/color-and-highlight";
import { useDebouncedCallback } from "use-debounce";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import { Trash2Icon } from "lucide-react";

const extensions = [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: "list-decimal pl-4",
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: "list-disc pl-4",
      },
    },
    code: {
      HTMLAttributes: {
        class: "bg-accent rounded-md p-1",
      },
    },
    horizontalRule: {
      HTMLAttributes: {
        class: "my-2",
      },
    },
    codeBlock: {
      HTMLAttributes: {
        class: "bg-primary text-primary-foreground p-2 text-sm rounded-md",
      },
    },
    heading: {
      levels: [1, 2, 3, 4],
      HTMLAttributes: {
        class: "tiptap-heading",
      },
    },
  }),
  TextStyle,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
];

export function TiptapEditor({ content }: { content?: string }) {
  const params = useParams();
  const router = useRouter();
  const utils = api.useUtils();
  const noteId = params.id as string;
  const { mutate: updateNote, isPending } = api.notes.update.useMutation({});
  const { mutate: deleteNote } = api.notes.delete.useMutation({
    onSuccess: () => {
      // Invalidate directory query to refresh folder/note list
      utils.notes.getDirectory.invalidate();
      router.push("/");
    },
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const debouncedSave = useDebouncedCallback(async (html: string) => {
    try {
      await updateNote({
        id: noteId,
        content: html,
      });
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save:", error);
    }
  }, 1000);

  const editor = useEditor({
    extensions: extensions as Extension[],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedSave(html);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border h-full w-full relative rounded-md overflow-hidden pb-3">
      <div className="flex w-full items-center py-2 px-2 justify-between border-b sticky top-0 left-0 bg-background z-20">
        <ToolbarProvider editor={editor}>
          <div className="flex items-center gap-2">
            <UndoToolbar />
            <RedoToolbar />
            <Separator orientation="vertical" className="h-7" />
            <ColorHighlightToolbar />
            <BoldToolbar />
            <ItalicToolbar />
            <StrikeThroughToolbar />
            <BulletListToolbar />
            <OrderedListToolbar />
            <CodeToolbar />
            <CodeBlockToolbar />
            <HorizontalRuleToolbar />
            <BlockquoteToolbar />
            <HardBreakToolbar />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="text-destructive"
              title="delete"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2Icon />
            </Button>
            <SaveStatus isSaving={isPending} lastSaved={lastSaved} />
          </div>

          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Note</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this note? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteNote({ id: noteId });
                    setShowDeleteDialog(false);
                  }}
                >
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </ToolbarProvider>
      </div>
      <div
        onClick={() => {
          editor?.chain().focus().run();
        }}
        className="cursor-text h-full bg-background"
      >
        <EditorContent className="*:outline-none h-full p-4" editor={editor} />
      </div>
    </div>
  );
}
