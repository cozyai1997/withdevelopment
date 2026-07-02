import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PostWithImages } from "./types";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  isLocalMockMode: vi.fn(),
  localMockStore: {
    getPublishedPost: vi.fn(),
    listPublishedPosts: vi.fn(),
    listAdminPosts: vi.fn(),
    getAdminPost: vi.fn(),
  },
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

vi.mock("@/lib/local-mock-mode", () => ({
  isLocalMockMode: mocks.isLocalMockMode,
}));

vi.mock("@/lib/local-mock-store", () => ({
  localMockStore: mocks.localMockStore,
}));

import { getPublishedPost } from "./posts";

function post(overrides: Partial<PostWithImages> = {}): PostWithImages {
  return {
    id: "published-id",
    board: "cases",
    title: "공개 시공",
    slug: "published-case",
    excerpt: null,
    content: "<p>본문</p>",
    case_category: "완전 철거",
    case_location: null,
    case_area: null,
    case_cost: null,
    video_url: null,
    status: "published",
    published_at: "2026-06-30T00:00:00.000Z",
    created_by: null,
    updated_by: null,
    created_at: "2026-06-30T00:00:00.000Z",
    updated_at: "2026-06-30T00:00:00.000Z",
    images: [],
    ...overrides,
  };
}

describe("post queries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createSupabaseServerClient.mockResolvedValue(null);
    mocks.isLocalMockMode.mockReturnValue(true);
  });

  it("reads published detail posts from the local mock store when Supabase is not configured", async () => {
    const publishedPost = post();
    mocks.localMockStore.getPublishedPost.mockResolvedValue(publishedPost);

    await expect(getPublishedPost("cases", "published-case")).resolves.toEqual(publishedPost);
    expect(mocks.localMockStore.getPublishedPost).toHaveBeenCalledWith("cases", "published-case");
  });

  it("reads local mock detail posts when the route slug is URI encoded", async () => {
    const publishedPost = post({ slug: "korean-slug" });
    mocks.localMockStore.getPublishedPost.mockResolvedValueOnce(null).mockResolvedValueOnce(publishedPost);

    await expect(getPublishedPost("cases", "%ED%95%9C%EA%B8%80")).resolves.toEqual(publishedPost);
    expect(mocks.localMockStore.getPublishedPost).toHaveBeenNthCalledWith(1, "cases", "%ED%95%9C%EA%B8%80");
    expect(mocks.localMockStore.getPublishedPost).toHaveBeenNthCalledWith(2, "cases", "한글");
  });

  it("keeps unpublished local mock posts hidden from public detail pages", async () => {
    mocks.localMockStore.getPublishedPost.mockResolvedValue(null);

    await expect(getPublishedPost("cases", "draft-case")).resolves.toBeNull();
    expect(mocks.localMockStore.getPublishedPost).toHaveBeenCalledWith("cases", "draft-case");
  });
});
