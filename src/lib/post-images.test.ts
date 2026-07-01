import { describe, expect, it } from "vitest";
import { getCaseImagePublicUrl, isAllowedCaseImageFile, normalizeCaseImageFileName } from "./post-images";

describe("case image helpers", () => {
  it("builds a public storage URL with encoded path segments", () => {
    expect(getCaseImagePublicUrl("posts/123/작업 전.png", "https://example.supabase.co")).toBe(
      "https://example.supabase.co/storage/v1/object/public/case-images/posts/123/%EC%9E%91%EC%97%85%20%EC%A0%84.png",
    );
  });

  it("builds a local mock asset URL for mock storage paths", () => {
    expect(getCaseImagePublicUrl("mock/case-images/post-1/작업 전.png")).toBe(
      "/mock-assets/case-images/post-1/%EC%9E%91%EC%97%85%20%EC%A0%84.png",
    );
  });

  it("normalizes uploaded file names for storage paths", () => {
    expect(normalizeCaseImageFileName("작업 전 사진 (1).JPG")).toBe("작업-전-사진-1.jpg");
  });

  it("accepts only jpeg and png case images up to 10MB", () => {
    expect(isAllowedCaseImageFile({ type: "image/jpeg", size: 10 * 1024 * 1024 })).toBe(true);
    expect(isAllowedCaseImageFile({ type: "image/webp", size: 1024 })).toBe(false);
    expect(isAllowedCaseImageFile({ type: "image/png", size: 10 * 1024 * 1024 + 1 })).toBe(false);
  });
});
