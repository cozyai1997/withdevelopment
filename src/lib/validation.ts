import type { Board, PostStatus, ProfileRole } from "@/lib/types";

const boards: Board[] = ["cases", "notice", "resources"];
const statuses: PostStatus[] = ["draft", "published"];
const roles: ProfileRole[] = ["pending", "admin"];

export function readString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function readBoard(formData: FormData): Board {
  const board = readString(formData, "board") as Board;
  if (!boards.includes(board)) {
    throw new Error("게시판 값을 확인해 주세요.");
  }
  return board;
}

export function readStatus(formData: FormData): PostStatus {
  const status = readString(formData, "status") as PostStatus;
  if (!statuses.includes(status)) {
    throw new Error("게시글 상태 값을 확인해 주세요.");
  }
  return status;
}

export function readRole(formData: FormData): ProfileRole {
  const role = readString(formData, "role") as ProfileRole;
  if (!roles.includes(role)) {
    throw new Error("권한 값을 확인해 주세요.");
  }
  return role;
}

export function normalizeSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function validatePostFields(formData: FormData) {
  const board = readBoard(formData);
  const status = readStatus(formData);
  const title = readString(formData, "title");
  const slug = normalizeSlug(readString(formData, "slug") || title);
  const excerpt = readString(formData, "excerpt");
  const content = readString(formData, "content");

  if (!title || !slug || !content) {
    throw new Error("제목, 슬러그, 본문은 필수입니다.");
  }

  return {
    board,
    status,
    title,
    slug,
    excerpt: excerpt || null,
    content,
  };
}
