import type { Principal } from "@icp-sdk/core/principal";
import type { ExternalBlob } from "../backend";

export type PostType =
  | { original: null }
  | { reply: bigint }
  | { repost: bigint }
  | { quote: bigint };

export interface Post {
  id: bigint;
  author: Principal;
  authorUsername: string;
  authorDisplayName: string;
  authorProfilePictureHash?: ExternalBlob;
  text: string;
  mediaHash?: ExternalBlob;
  mediaType?: string;
  postType: PostType;
  createdAt: bigint;
  editedAt?: bigint;
  likeCount: bigint;
  replyCount: bigint;
  repostCount: bigint;
  isLikedByCurrentUser: boolean;
  isRepostedByCurrentUser: boolean;
}

export interface PaginatedPosts {
  posts: Post[];
  nextCursor?: bigint;
  hasMore: boolean;
}

export interface FollowUserResponse {
  principal: Principal;
  username: string;
  displayName: string;
  profilePictureHash?: ExternalBlob;
}

export interface PaginatedFollows {
  users: FollowUserResponse[];
  nextOffset?: bigint;
  hasMore: boolean;
}

export interface UserProfileResponse {
  principal: Principal;
  username: string;
  displayName: string;
  bio: string;
  profilePictureHash?: ExternalBlob;
  headerImageHash?: ExternalBlob;
  createdAt: bigint;
  updatedAt: bigint;
  followersCount: bigint;
  followingCount: bigint;
  postsCount: bigint;
  isFollowedByCurrentUser: boolean;
  isBlockedByCurrentUser: boolean;
  isMutedByCurrentUser: boolean;
}
