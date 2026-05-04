import { cn } from "@/lib/utils";

export const MAX_POST_LENGTH = 280;
export const EDIT_DELETE_WINDOW_MS = 15 * 60 * 1000;

export const TAB_TRIGGER_CLASS = cn(
  "relative flex-1 h-auto rounded-none border-0 bg-transparent px-4 py-3 text-muted-foreground shadow-none transition-colors",
  "hover:bg-muted/50 hover:text-foreground",
  "focus-visible:ring-0 focus-visible:outline-none",
  "data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:shadow-none",
  "after:absolute after:bottom-0 after:left-[25%] after:right-[25%] after:h-[3px] after:rounded-full after:bg-primary after:opacity-0 after:transition-opacity",
  "data-[state=active]:after:opacity-100",
);
