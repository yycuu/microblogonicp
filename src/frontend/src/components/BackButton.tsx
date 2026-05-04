import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export function useGoBack() {
  const router = useRouter();
  return () => {
    if (window.history.length > 1) {
      router.history.back();
    } else {
      router.navigate({ to: "/" });
    }
  };
}

interface BackButtonProps {
  className?: string;
  variant?: "ghost" | "link";
  size?: "icon" | "sm" | "default";
  label?: string;
}

export function BackButton({
  className,
  variant = "ghost",
  size = "icon",
  label,
}: BackButtonProps) {
  const goBack = useGoBack();

  if (label) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={goBack}
        className={className}
      >
        <ArrowLeft className="h-4 w-4" />
        {label}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={goBack}
      className={cn("h-8 w-8", className)}
      aria-label="Go back"
    >
      <ArrowLeft className="h-4 w-4" />
    </Button>
  );
}
