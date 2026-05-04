import {
  Link,
  Outlet,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppLayout } from "./components/AppLayout";
import { Feed } from "./components/Feed";
import { FollowList } from "./components/FollowList";
import { NotificationsPage } from "./components/NotificationsPage";
import { PostDetail } from "./components/PostDetail";
import { ProfilePage } from "./components/ProfilePage";
import { SearchPage } from "./components/SearchPage";

const rootRoute = createRootRoute({
  component: function RootComponent() {
    return (
      <AppLayout>
        <Outlet />
      </AppLayout>
    );
  },
  notFoundComponent: function NotFound() {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <p className="text-4xl font-bold">404</p>
        <p className="text-muted-foreground">This page doesn't exist.</p>
        <Link to="/" className="text-primary hover:underline text-sm">
          Go home
        </Link>
      </div>
    );
  },
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Feed,
});

const postRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "post/$id",
  component: PostDetail,
});

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "search",
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
  }),
  component: SearchPage,
});

const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "notifications",
  component: NotificationsPage,
});

const hashtagRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "hashtag/$tag",
  component: SearchPage,
});

const followersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$username/followers",
  component: function Followers() {
    return <FollowList type="followers" />;
  },
});

const followingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$username/following",
  component: function Following() {
    return <FollowList type="following" />;
  },
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "$username",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  postRoute,
  searchRoute,
  notificationsRoute,
  hashtagRoute,
  followersRoute,
  followingRoute,
  profileRoute, // last — $username catch-all
]);

export const router = createRouter({
  routeTree,
  history: createHashHistory(),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
