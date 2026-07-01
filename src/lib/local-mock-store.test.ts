import { mkdtemp, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createLocalMockStore } from "./local-mock-store";
import type { PostStatus } from "./types";
import type { validatePostFields } from "./validation";

type PostFields = ReturnType<typeof validatePostFields>;

function fields(overrides: Partial<PostFields> = {}): PostFields {
  return {
    board: "cases",
    status: "published",
    title: "테스트 시공",
    slug: "test-case",
    excerpt: "테스트 요약",
    content: "<p>테스트 본문</p>",
    case_category: "완전 철거",
    case_location: "서울",
    case_area: "30평",
    case_cost: "협의",
    video_url: null,
    ...overrides,
  };
}

function imageFile(name = "작업 전.png", type = "image/png") {
  return new File([new Uint8Array([137, 80, 78, 71])], name, { type });
}

async function tempRoot() {
  return mkdtemp(path.join(tmpdir(), "withdevelopment-local-mock-"));
}

async function exists(filePath: string) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

describe("local mock store", () => {
  it("persists posts and exposes only published posts publicly", async () => {
    const store = createLocalMockStore(await tempRoot());

    const draft = await store.createPost(fields({ slug: "draft-case", status: "draft" as PostStatus }));
    const published = await store.createPost(fields({ slug: "published-case", status: "published" }));

    expect((await store.listAdminPosts()).map((post) => post.id)).toEqual([published.id, draft.id]);
    expect((await store.listPublishedPosts("cases")).map((post) => post.slug)).toEqual(["published-case"]);
    expect(await store.getPublishedPost("cases", "draft-case")).toBeNull();
    expect((await store.getAdminPost(draft.id))?.status).toBe("draft");

    const saved = JSON.parse(await readFile(store.databasePath, "utf8")) as { posts: unknown[] };
    expect(saved.posts).toHaveLength(2);
  });

  it("stores, reorders, deletes, and serves local case images", async () => {
    const store = createLocalMockStore(await tempRoot());
    const post = await store.createPost(fields({ slug: "image-case" }), {
      imageFiles: [imageFile("작업 전.png"), imageFile("작업 후.jpg", "image/jpeg")],
    });

    expect(post.images).toHaveLength(2);
    expect(post.images[0].storage_path).toMatch(/^mock\/case-images\//);
    expect(await exists(store.resolveImageFilePath(post.images[0].storage_path))).toBe(true);

    const deletedImagePath = store.resolveImageFilePath(post.images[1].storage_path);
    const updated = await store.updatePost(post.id, fields({ slug: "image-case-updated", title: "수정 시공" }), {
      orderedImageIds: [post.images[1].id, post.images[0].id],
      deleteImageIds: [post.images[1].id],
      imageFiles: [imageFile("추가.png")],
    });

    expect(updated.images).toHaveLength(2);
    expect(updated.images.map((image) => image.sort_order)).toEqual([0, 1]);
    expect(updated.images[0].id).toBe(post.images[0].id);
    expect(updated.images[1].storage_path).toMatch(/^mock\/case-images\//);
    expect(await exists(deletedImagePath)).toBe(false);

    const keptImagePath = store.resolveImageFilePath(updated.images[0].storage_path);
    const addedImagePath = store.resolveImageFilePath(updated.images[1].storage_path);
    await store.deletePost(post.id);

    expect(await store.getAdminPost(post.id)).toBeNull();
    expect(await exists(keptImagePath)).toBe(false);
    expect(await exists(addedImagePath)).toBe(false);
  });
});
