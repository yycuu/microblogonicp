import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "../stores/useAppStore";
import { TAB_TRIGGER_CLASS } from "../utils/constants";
import { ComposePost } from "./ComposePost";
import { GlobalFeed } from "./GlobalFeed";
import { HomeFeed } from "./HomeFeed";

export function Feed() {
  const composeMode = useAppStore((s) => s.composeMode);
  const composeQuotedPostId = useAppStore((s) => s.composeQuotedPostId);

  const quotedPostId = composeMode === "quote" ? composeQuotedPostId : null;

  return (
    <Tabs defaultValue="home" className="w-full">
      <TabsList className="sticky top-0 z-10 h-auto w-full rounded-none border-b bg-background/80 p-0 backdrop-blur-sm">
        <TabsTrigger value="home" className={TAB_TRIGGER_CLASS}>
          Home
        </TabsTrigger>
        <TabsTrigger value="explore" className={TAB_TRIGGER_CLASS}>
          Explore
        </TabsTrigger>
      </TabsList>
      <TabsContent value="home" className="mt-0">
        <ComposePost quotedPostId={quotedPostId} />
        <HomeFeed />
      </TabsContent>
      <TabsContent value="explore" className="mt-0">
        <ComposePost quotedPostId={quotedPostId} />
        <GlobalFeed />
      </TabsContent>
    </Tabs>
  );
}
