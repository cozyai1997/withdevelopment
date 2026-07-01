import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { CASE_IMAGE_BUCKET, isAllowedCaseImageFile, normalizeCaseImageFileName } from "./post-images";
import type { Board, PostImage, PostWithImages } from "./types";
import type { validatePostFields } from "./validation";

type PostFields = ReturnType<typeof validatePostFields>;

type LocalMockDatabase = {
  posts: PostWithImages[];
};

type ImageSyncOptions = {
  orderedImageIds?: string[];
  deleteImageIds?: string[];
  imageFiles?: File[];
};

const defaultRoot = path.join(process.cwd(), ".local-test-data");

function emptyDatabase(): LocalMockDatabase {
  return { posts: [] };
}

function clonePost(post: PostWithImages): PostWithImages {
  return {
    ...post,
    images: [...post.images].sort(sortImages),
  };
}

function sortImages(a: PostImage, b: PostImage) {
  return a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at);
}

function sortAdminPosts(a: PostWithImages, b: PostWithImages) {
  return b.updated_at.localeCompare(a.updated_at) || b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id);
}

function sortPublishedPosts(a: PostWithImages, b: PostWithImages) {
  const aDate = a.published_at ?? a.created_at;
  const bDate = b.published_at ?? b.created_at;
  return bDate.localeCompare(aDate) || b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id);
}

function nextTimestamp(database: LocalMockDatabase) {
  const existingTimes = database.posts.flatMap((post) => [post.created_at, post.updated_at, post.published_at ?? ""]).filter(Boolean);
  const maxExisting = Math.max(0, ...existingTimes.map((value) => Date.parse(value)));
  return new Date(Math.max(Date.now(), maxExisting + 1)).toISOString();
}

function assertUniqueSlug(database: LocalMockDatabase, fields: PostFields, currentId?: string) {
  const duplicate = database.posts.find((post) => post.id !== currentId && post.board === fields.board && post.slug === fields.slug);

  if (duplicate) {
    throw new Error("게시글을 저장하지 못했습니다. 슬러그 중복 여부를 확인해 주세요.");
  }
}

function safeResolve(root: string, relativePath: string) {
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(root, relativePath);

  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error("로컬 이미지 경로를 확인해 주세요.");
  }

  return resolved;
}

export function createLocalMockStore(root = process.env.LOCAL_MOCK_ROOT || defaultRoot) {
  const resolvedRoot = path.resolve(root);
  const databasePath = path.join(resolvedRoot, "posts.json");
  const imageRoot = path.join(resolvedRoot, "case-images");

  async function ensureStore() {
    await mkdir(imageRoot, { recursive: true });
    await mkdir(path.dirname(databasePath), { recursive: true });
  }

  async function readDatabase(): Promise<LocalMockDatabase> {
    await ensureStore();

    try {
      const content = await readFile(databasePath, "utf8");
      const parsed = JSON.parse(content) as Partial<LocalMockDatabase>;
      return {
        posts: Array.isArray(parsed.posts) ? parsed.posts.map((post) => ({ ...post, images: post.images ?? [] })) : [],
      };
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") {
        return emptyDatabase();
      }

      throw error;
    }
  }

  async function writeDatabase(database: LocalMockDatabase) {
    await ensureStore();
    const tempPath = `${databasePath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
    await rename(tempPath, databasePath);
  }

  function resolveImageFilePath(storagePath: string) {
    if (!storagePath.startsWith("mock/case-images/")) {
      throw new Error("로컬 Mock 이미지 경로가 아닙니다.");
    }

    return safeResolve(resolvedRoot, storagePath.slice("mock/".length));
  }

  function resolveCaseImageAssetPath(segments: string[]) {
    if (segments.length === 0 || segments.some((segment) => !segment || segment === "." || segment === "..")) {
      throw new Error("로컬 이미지 경로를 확인해 주세요.");
    }

    return safeResolve(imageRoot, path.join(...segments));
  }

  async function removeImageFiles(images: PostImage[]) {
    await Promise.all(images.map((image) => rm(resolveImageFilePath(image.storage_path), { force: true }).catch(() => undefined)));
  }

  async function writeImageFiles(postId: string, title: string, files: File[], startOrder: number, now: string): Promise<PostImage[]> {
    if (files.length === 0) {
      return [];
    }

    const postImageRoot = path.join(imageRoot, postId);
    await mkdir(postImageRoot, { recursive: true });

    const images: PostImage[] = [];

    for (const [index, file] of files.entries()) {
      if (!isAllowedCaseImageFile(file)) {
        throw new Error("이미지는 JPG, JPEG, PNG 형식의 10MB 이하 파일만 등록할 수 있습니다.");
      }

      const fileName = `${Date.now()}-${index}-${randomUUID()}-${normalizeCaseImageFileName(file.name)}`;
      const relativePath = path.posix.join("case-images", postId, fileName);
      const filePath = safeResolve(resolvedRoot, relativePath);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(filePath, buffer);

      images.push({
        id: randomUUID(),
        post_id: postId,
        bucket: CASE_IMAGE_BUCKET,
        storage_path: `mock/${relativePath}`,
        alt_text: `${title} 이미지 ${startOrder + index + 1}`,
        sort_order: startOrder + index,
        created_at: now,
        updated_at: now,
      });
    }

    return images;
  }

  async function syncImages(database: LocalMockDatabase, post: PostWithImages, fields: PostFields, options: ImageSyncOptions = {}) {
    if (fields.board !== "cases") {
      await removeImageFiles(post.images);
      return [];
    }

    const deleteImageIds = new Set(options.deleteImageIds ?? []);
    const orderedImageIds = options.orderedImageIds ?? post.images.map((image) => image.id);
    const deletedImages = post.images.filter((image) => deleteImageIds.has(image.id));
    await removeImageFiles(deletedImages);

    const remainingImages = post.images.filter((image) => !deleteImageIds.has(image.id));
    const remainingById = new Map(remainingImages.map((image) => [image.id, image]));
    const orderedExisting = orderedImageIds.flatMap((id) => {
      const image = remainingById.get(id);
      return image ? [image] : [];
    });
    const unorderedExisting = remainingImages.filter((image) => !orderedImageIds.includes(image.id));
    const existingImages = [...orderedExisting, ...unorderedExisting].map((image, index) => ({
      ...image,
      alt_text: image.alt_text || `${fields.title} 이미지 ${index + 1}`,
      sort_order: index,
      updated_at: post.updated_at,
    }));
    const newImages = await writeImageFiles(post.id, fields.title, options.imageFiles ?? [], existingImages.length, nextTimestamp(database));

    return [...existingImages, ...newImages].sort(sortImages);
  }

  return {
    root: resolvedRoot,
    databasePath,
    imageRoot,
    resolveImageFilePath,
    resolveCaseImageAssetPath,

    async listPublishedPosts(board?: Board, limit?: number) {
      const database = await readDatabase();
      const posts = database.posts
        .filter((post) => post.status === "published" && (!board || post.board === board))
        .sort(sortPublishedPosts)
        .map(clonePost);

      return typeof limit === "number" ? posts.slice(0, limit) : posts;
    },

    async getPublishedPost(board: Board, slug: string) {
      const database = await readDatabase();
      const post = database.posts.find((item) => item.board === board && item.slug === slug && item.status === "published");
      return post ? clonePost(post) : null;
    },

    async listAdminPosts() {
      const database = await readDatabase();
      return [...database.posts].sort(sortAdminPosts).map(clonePost);
    },

    async getAdminPost(id: string) {
      const database = await readDatabase();
      const post = database.posts.find((item) => item.id === id);
      return post ? clonePost(post) : null;
    },

    async createPost(fields: PostFields, options: ImageSyncOptions = {}) {
      const database = await readDatabase();
      assertUniqueSlug(database, fields);
      const now = nextTimestamp(database);
      const post: PostWithImages = {
        ...fields,
        id: randomUUID(),
        published_at: fields.status === "published" ? now : null,
        created_by: null,
        updated_by: null,
        created_at: now,
        updated_at: now,
        images: [],
      };

      post.images = fields.board === "cases" ? await writeImageFiles(post.id, fields.title, options.imageFiles ?? [], 0, now) : [];
      database.posts.push(post);
      await writeDatabase(database);
      return clonePost(post);
    },

    async updatePost(id: string, fields: PostFields, options: ImageSyncOptions = {}) {
      const database = await readDatabase();
      const index = database.posts.findIndex((post) => post.id === id);

      if (index < 0) {
        throw new Error("수정할 게시글을 찾지 못했습니다.");
      }

      assertUniqueSlug(database, fields, id);
      const current = database.posts[index];
      const now = nextTimestamp(database);
      const updated: PostWithImages = {
        ...current,
        ...fields,
        published_at: fields.status === "published" ? current.published_at ?? now : null,
        updated_at: now,
      };

      updated.images = await syncImages(database, updated, fields, options);
      database.posts[index] = updated;
      await writeDatabase(database);
      return clonePost(updated);
    },

    async deletePost(id: string) {
      const database = await readDatabase();
      const post = database.posts.find((item) => item.id === id);

      if (!post) {
        return null;
      }

      await removeImageFiles(post.images);
      database.posts = database.posts.filter((item) => item.id !== id);
      await writeDatabase(database);
      return clonePost(post);
    },

    async setPostStatus(id: string, status: "draft" | "published") {
      const database = await readDatabase();
      const post = database.posts.find((item) => item.id === id);

      if (!post) {
        throw new Error("게시글을 찾지 못했습니다.");
      }

      const now = nextTimestamp(database);
      post.status = status;
      post.published_at = status === "published" ? post.published_at ?? now : null;
      post.updated_at = now;
      await writeDatabase(database);
      return clonePost(post);
    },
  };
}

export const localMockStore = createLocalMockStore();
