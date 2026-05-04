import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";

interface NewPostsIndicatorProps {
  count: number;
  onClick: () => void;
}

export function NewPostsIndicator({ count, onClick }: NewPostsIndicatorProps) {
  if (count <= 0) return null;

  return (
    <div className="sticky top-0 z-10 flex justify-center border-b bg-background/80 py-2 backdrop-blur-sm">
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 rounded-full text-primary shadow-sm"
        onClick={onClick}
      >
        <ArrowUp className="h-3.5 w-3.5" />
        Show {count} new {count === 1 ? "post" : "posts"}
      </Button>
    </div>
  );
}
