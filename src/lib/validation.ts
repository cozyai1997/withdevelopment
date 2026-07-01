import sanitizeHtml from "sanitize-html";
import { caseCategories, type Board, type CaseCategory, type PostStatus, type ProfileRole } from "./types";

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

export function sanitizePostContent(content: string) {
  return sanitizeHtml(content, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "a",
      "h2",
      "h3",
      "h4",
    ],
    allowedAttributes: {
      a: ["href"],
      h2: ["style"],
      h3: ["style"],
      h4: ["style"],
      p: ["style"],
    },
    allowedStyles: {
      "*": {
        "text-align": [/^left$/, /^center$/, /^right$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowProtocolRelative: false,
    transformTags: {
      b: "strong",
      i: "em",
    },
  }).trim();
}

function readCaseCategory(formData: FormData, board: Board): CaseCategory | null {
  const category = readString(formData, "case_category");

  if (board !== "cases") {
    return null;
  }

  if (!caseCategories.includes(category as CaseCategory)) {
    throw new Error("공사 유형을 확인해 주세요.");
  }

  return category as CaseCategory;
}

function readOptionalUrl(formData: FormData, key: string) {
  const value = readString(formData, key);

  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("invalid protocol");
    }
    return url.toString();
  } catch {
    throw new Error("현장 동영상 URL을 확인해 주세요.");
  }
}

export function validatePostFields(formData: FormData) {
  const board = readBoard(formData);
  const status = readStatus(formData);
  const title = readString(formData, "title");
  const slug = normalizeSlug(readString(formData, "slug") || title);
  const excerpt = readString(formData, "excerpt");
  const content = sanitizePostContent(readString(formData, "content"));
  const contentText = sanitizeHtml(content, { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, "").trim();
  const caseCategory = readCaseCategory(formData, board);

  if (!title || !slug || !contentText) {
    throw new Error("시공 제목, 상세 페이지 주소, 시공 현장 분석은 필수입니다.");
  }

  if (title.length > 100) {
    throw new Error("시공 제목은 최대 100자까지 입력할 수 있습니다.");
  }

  if (excerpt.length > 240) {
    throw new Error("현장 요약은 최대 240자까지 입력할 수 있습니다.");
  }

  if (contentText.length > 5000) {
    throw new Error("시공 현장 분석은 최대 5000자까지 입력할 수 있습니다.");
  }

  return {
    board,
    status,
    title,
    slug,
    excerpt: excerpt || null,
    content,
    case_category: caseCategory,
    case_location: board === "cases" ? readString(formData, "case_location") || null : null,
    case_area: board === "cases" ? readString(formData, "case_area") || null : null,
    case_cost: board === "cases" ? readString(formData, "case_cost") || null : null,
    video_url: board === "cases" ? readOptionalUrl(formData, "video_url") : null,
  };
}
