import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TrendingPanel } from "./TrendingPanel";

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Home";
  if (pathname.startsWith("/search")) return "Search";
  if (pathname.startsWith("/hashtag/")) return "Search";
  if (pathname.startsWith("/notifications")) return "Notifications";
  if (pathname.startsWith("/post/")) return "Post";
  return "Profile";
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const routerState = useRouterState();
  const title = getPageTitle(routerState.location.pathname);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 md:flex md:flex-col">
          <AppSidebar />
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-60 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <AppSidebar onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4 md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="-ml-1 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Separator orientation="vertical" className="h-4" />
            <span className="font-semibold">{title}</span>
          </header>

          <div className="flex flex-1">
            <main className="min-w-0 flex-1 md:border-x">{children}</main>
            <TrendingPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
