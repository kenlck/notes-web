"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "@/components/toolbars/toolbar-provider";
import { Type, ChevronDown } from "lucide-react";
import { Level } from "@tiptap/extension-heading";
import React from "react";

interface TextStyle {
  label: string;
  element: React.ElementType;
  level?: Level;
  className: string;
}

const textStyles: TextStyle[] = [
  {
    label: "Normal Text",
    element: "p",
    className: "text-base",
  },
  {
    label: "Heading 1",
    element: "h1",
    level: 1,
    className: "text-4xl font-extrabold",
  },
  {
    label: "Heading 2",
    element: "h2",
    level: 2,
    className: "text-3xl font-bold",
  },
  {
    label: "Heading 3",
    element: "h3",
    level: 3,
    className: "text-2xl font-semibold",
  },
  {
    label: "Heading 4",
    element: "h4",
    level: 4,
    className: "text-xl font-medium",
  },
];

export const TextStyleToolbar = () => {
  const { editor } = useToolbar();

  const handleStyleChange = (level?: Level) => {
    if (!editor) return;

    if (level) {
      editor.chain().focus().toggleHeading({ level }).run();
    } else {
      editor.chain().focus().setParagraph().run();
    }
  };

  if (!editor) {
    return null;
  }

  const isDisabled =
    !editor.can().chain().focus().toggleHeading({ level: 1 }).run() &&
    !editor.can().chain().focus().setParagraph().run();

  const currentLevel = textStyles.find((style) =>
    style.level ? editor.isActive("heading", { level: style.level }) : editor.isActive("paragraph")
  );

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              title="Text style"
              className={cn("h-8 w-fit px-2 flex items-center gap-1", editor.isActive("heading") && "bg-accent")}
              disabled={isDisabled}
            >
              <Type className="h-4 w-4" />
              <span className="text-sm">{currentLevel?.label || "Style"}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Text styles</TooltipContent>
      </Tooltip>

      <DropdownMenuContent align="start" className="w-48">
        {textStyles.map(({ label, element: Element, level, className }) => (
          <DropdownMenuItem
            key={label}
            className={cn(
              "flex items-center h-auto py-2",
              level ? editor.isActive("heading", { level }) && "bg-accent" : editor.isActive("paragraph") && "bg-accent"
            )}
            onClick={() => handleStyleChange(level)}
          >
            <Element className={cn("py-1 m-0 w-full", className)}>{label}</Element>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
