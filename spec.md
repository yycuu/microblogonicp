# MicroBlog

## Overview

MicroBlog is a microblogging platform built on the Internet Computer, enabling users to post short text and media updates, interact through likes, replies, reposts, and quotes, follow other users, and discover content via hashtags and search. Users authenticate with Internet Identity for secure, decentralized identity management. The app provides a real-time social experience with personalized feeds, notifications, and user profiles.

## Authentication

- Users authenticate via Internet Identity
- Anonymous access is not permitted for any write operations
- Anonymous users can view the global feed, individual posts, user profiles, and trending hashtags (read-only)
- Authenticated users must create a profile (username, display name) before posting, replying, reposting, or quoting
- User data is isolated by principal — users can only modify their own posts and profile

## Core Features

### Posts

Users can create short text posts with optional media attachments:

- Text: up to 280 characters
- Media: optional image or video attachment (stored via blob storage)
- Posts must contain either text or media (cannot be empty)
- Maximum 10,000 posts per user
- Post types: original, reply, repost, quote

Editing posts:

- Only the post author can edit
- Text-only edits (media cannot be changed)
- Edit window: 15 minutes from creation
- Edited posts display an "(edited)" indicator
- Hashtag index is updated on edit

Deleting posts:

- Only the post author can delete
- Delete window: 15 minutes from creation
- Deleting cleans up: hashtag index, likes, reply/repost tracking indexes
- Decrements the user's post count

### Replies

- Users can reply to any post with text and/or media
- Same 280-character limit and media rules as posts
- Replies are linked to the parent post via `#reply(parentPostId)`
- Reply count is displayed on the parent post
- Replying generates a notification for the parent post author
- Replies are paginated (cursor-based, default 20 per page, max 50)

### Reposts

- Users can repost another user's post (no text/media of their own)
- Duplicate reposts are prevented (one repost per user per post)
- Repost count is displayed on the original post
- Reposting generates a notification for the original post author
- Users can undo a repost, which removes the repost entry and decrements counts
- Cannot repost posts from blocked users (bidirectional)

### Quotes

- Users can quote another user's post with their own text and/or media
- Same 280-character limit and media rules as posts
- Quote text must contain text or media (cannot be empty)
- The quoted post is displayed inline within the quoting post
- Quoting generates a notification for the original post author
- If the quoted post is deleted, "This post is unavailable" is shown

### Likes

- Users can like/unlike any post
- Like count is displayed on each post
- Liking generates a notification for the post author (only on first like, not re-likes)
- Cannot like posts from blocked users (bidirectional)
- Optimistic UI updates for instant feedback

### Hashtags

- Hashtags are extracted from post text using the `#` prefix
- Case-insensitive (stored as lowercase)
- Maximum 10 unique hashtags per post
- Valid characters: alphanumeric and underscores
- Hashtags are clickable in post text and navigate to hashtag search results
- Hashtag index is updated on post creation, edit, and deletion

### Mentions

- Mentions are extracted from post text using the `@` prefix
- Case-insensitive username matching
- Maximum 10 unique mentions per post
- Mentioned users receive a notification
- Mentions are clickable in post text and navigate to the user's profile
- Notifications are not sent to blocked users (bidirectional)

### Trending Hashtags

- Shows hashtags ranked by post count within the last 24 hours
- Default display limit: 10 hashtags
- Refreshes every 60 seconds on the frontend
- Displayed in a "What's happening" panel on desktop

## Feeds

### Home Feed

- Shows posts from users the current user follows, plus the user's own posts
- If the user follows nobody, shows all posts (global fallback)
- Excludes posts from blocked users (bidirectional) and muted users
- Cursor-based pagination (default 20 per page, max 50)
- Auto-refreshes every 15 seconds

### Global Feed (Explore)

- Shows all posts from all users
- Excludes posts from blocked users (bidirectional) for authenticated users
- Available to anonymous users (read-only)
- Cursor-based pagination (default 20 per page, max 50)
- Auto-refreshes every 15 seconds

### User Posts Feed

- Shows all posts by a specific user
- Returns empty results if the profile user has blocked the viewer
- Cursor-based pagination (default 20 per page, max 50)

## User Profiles

### Profile Fields

- Username: required, 3-20 characters, alphanumeric and underscores only, case-insensitive uniqueness
- Display name: required, max 50 characters
- Bio: optional, max 160 characters
- Profile picture: optional image (uploaded via blob storage)
- Header image: optional image (uploaded via blob storage)
- Created at / Updated at timestamps

### Profile Management

- Users can change their username (old mapping is released, new one must be available)
- Profile picture and header image are uploaded separately via direct image selection
- Auto-upload on image selection with progress indicator
- "Edit profile" dialog for username, display name, and bio changes

### Profile Display

- Shows display name, username, bio, join date (formatted as "MMM yyyy")
- Follower count and following count (clickable, navigates to list)
- Post count
- Follow/Unfollow button for other users
- Block/Mute options in dropdown menu
- User's post timeline with infinite scroll

## Social Features

### Following

- Users can follow/unfollow other users
- Cannot follow yourself
- Cannot follow blocked users (bidirectional)
- Following generates a notification for the followed user (only on first follow)
- Following/followers lists are paginated (offset-based, default 20 per page, max 50)
- Blocked users are filtered out of follower/following lists

### Blocking

- Users can block/unblock other users
- Cannot block yourself
- Blocking removes follow relationships in both directions
- Blocked users cannot: view the blocker's posts in feeds, interact with the blocker's posts, follow the blocker
- Bidirectional: if either user has blocked the other, interactions are prevented
- Blocked user's profile shows a "blocked" state with option to view posts or unblock
- Blocked users are filtered from search results and follower/following lists

### Muting

- Users can mute/unmute other users
- Cannot mute yourself
- Muted users' posts are hidden from the home feed only
- Muted users can still appear in the global feed and search results
- Muting does not affect follow relationships

## Notifications

### Notification Types

- Like: someone liked your post
- Reply: someone replied to your post
- Mention: someone mentioned you in a post
- Follow: someone followed you
- Repost: someone reposted your post
- Quote: someone quoted your post

### Notification Behavior

- Self-notifications are suppressed (no notification for your own actions)
- Notifications are not sent to/from blocked users (bidirectional)
- Duplicate notifications are prevented for likes, follows (only on first occurrence)
- Maximum 50 notifications stored per user (oldest are evicted when cap is exceeded)
- Cursor-based pagination (default 20 per page, max 50)
- Unread count badge displayed in sidebar navigation (polled every 30 seconds)
- Individual notifications can be marked as read (on click)
- "Mark all read" bulk action available when unread notifications exist
- Unread notifications have a highlighted background and blue dot indicator

## Search

### Post Search

- Case-insensitive substring search across post text
- Excludes posts from blocked users (bidirectional)
- Cursor-based pagination (default 20 per page, max 50)
- Returns empty results for empty query

### Hashtag Search

- Searches the hashtag index for posts tagged with a specific hashtag
- Case-insensitive matching
- Navigable via `#hashtag` route or clicking a hashtag in post text
- Cursor-based pagination

### User Search

- Case-insensitive substring search across usernames and display names
- Excludes blocked users (bidirectional)
- Returns up to 20 results
- Returns empty results for empty query

### Search UI

- Unified search page with "Posts" and "Users" tabs
- Hashtag queries (prefixed with `#`) automatically route to hashtag results
- Search input in the trending panel sidebar for quick access

## Backend Data Storage

- **userProfiles**: `Map<Principal, UserProfile>` — user profile data
- **usernameToUser**: `Map<Text, Principal>` — lowercase username to principal mapping
- **posts**: `Map<Nat, Post>` — all posts by auto-incrementing ID
- **userPostCounts**: `Map<Principal, Nat>` — per-user post count for cap enforcement
- **following / followers**: `Map<Principal, Map<Principal, Bool>>` — bidirectional follow graph
- **blocks / mutes**: `Map<Principal, Map<Principal, Bool>>` — per-user block and mute lists
- **postLikes**: `Map<Nat, Map<Principal, Bool>>` — per-post like tracking
- **postReplies**: `Map<Nat, Map<Nat, Bool>>` — parent post to reply IDs
- **postReposts**: `Map<Nat, Map<Principal, Bool>>` — per-post repost tracking
- **repostIndex**: `Map<Principal, Map<Nat, Nat>>` — reverse index: user → original post ID → repost post ID
- **hashtagIndex**: `Map<Text, Map<Nat, Bool>>` — hashtag to post IDs
- **userNotifications**: `Map<Principal, Map<Nat, Notification>>` — per-user notifications

All state uses orthogonal persistence (automatic via `var` declarations).

## Backend Operations

- All write operations require Internet Identity authentication (`requireAuth`)
- Media validation ensures `mediaHash` and `mediaType` are provided together, and `mediaType` is either `"image"` or `"video"`
- Post cap enforcement (10,000 posts per user) is checked before creating any post type
- Profile must exist before posting, replying, reposting, or quoting
- Block checks are bidirectional for all interactions (follow, like, reply, repost, quote)
- Errors are raised via `Runtime.trap()` with descriptive messages
- Username availability check is a public query (no auth required)

## User Interface

### Layout

- Three-column layout on desktop: sidebar navigation (240px), main content (flexible), trending panel (320px)
- Mobile: hamburger menu opens sidebar in a sheet overlay, trending panel hidden
- Sticky headers with backdrop blur throughout

### Main Screens

- **Home/Explore**: Tabbed feed with compose box, "Home" (following-based) and "Explore" (global) tabs
- **Post Detail**: Full post view with reply composer and threaded replies
- **Profile**: Header banner, avatar, bio, stats, post timeline with infinite scroll
- **Search**: Search input with "Posts" and "Users" tabs
- **Notifications**: Chronological list with type-specific icons and unread indicators
- **Followers/Following**: Paginated user lists accessible from profile

### Navigation

- Sidebar: Home, Search, Notifications links with active state highlighting
- Notification badge shows unread count (capped at "99+")
- User menu (bottom of sidebar): Profile link, theme toggle (light/dark), logout
- Hash-based routing via TanStack Router

### Interactions

- Post card actions: reply (navigates to post detail), repost/quote (dropdown menu), like (heart with animation)
- Edit/delete available via dropdown menu on own posts within 15-minute window
- Image lightbox on click, video inline with controls
- Media upload with progress percentage overlay
- Keyboard shortcut: Cmd/Ctrl+Enter to submit posts

## Design System

- Light and dark theme support via `next-themes`
- shadcn/ui component library (Avatar, Button, Dialog, DropdownMenu, Input, Skeleton, Tabs, Textarea, Sheet, etc.)
- Sonner toast notifications (bottom-right position)
- Tailwind CSS with custom theme variables
- Relative timestamps via `date-fns` (`formatDistanceToNow`)
- Skeleton loading states for all async content
- Infinite scroll via intersection observer sentinel element
- Optimistic updates for likes, reposts, follows/unfollows

## Error Handling

- **Authentication errors**: "Not authenticated" trap for anonymous callers on protected endpoints
- **Authorization errors**: "Cannot edit/delete another user's post", "Cannot interact with this user" (blocked)
- **Validation errors**: Character limits, empty content, invalid usernames, duplicate reposts, self-follow/block/mute
- **Time window errors**: "Edit/Delete window has expired (15 minutes)"
- **Not found errors**: "Post not found", "Parent post not found", "User not found"
- **Capacity errors**: "Post limit reached (10000 posts max)"
- **Profile errors**: "Must create profile before posting/replying/reposting/quoting", "Username is already taken"
- **Frontend error handling**: All queries render `isError` state, mutations use `onError` with toast notifications, loading states on all async buttons
