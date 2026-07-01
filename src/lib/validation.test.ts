import { describe, expect, it } from "vitest";
import { validatePostFields } from "./validation";

function makeFormData(values: Record<string, string>) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.set(key, value);
  });

  return formData;
}

describe("validatePostFields", () => {
  it("sanitizes rich text content while preserving allowed formatting", () => {
    const fields = validatePostFields(
      makeFormData({
        board: "cases",
        status: "published",
        title: "강남 사무실 철거",
        slug: "gangnam-office",
        case_category: "인테리어 철거",
        content:
          '<p onclick="alert(1)">본문 <strong>강조</strong> <a href="https://example.com" onmouseover="alert(2)">링크</a></p><script>alert(3)</script>',
      }),
    );

    expect(fields.content).toContain("<strong>강조</strong>");
    expect(fields.content).toContain('<a href="https://example.com">링크</a>');
    expect(fields.content).not.toContain("onclick");
    expect(fields.content).not.toContain("onmouseover");
    expect(fields.content).not.toContain("<script");
  });

  it("reads case-specific metadata for construction result posts", () => {
    const fields = validatePostFields(
      makeFormData({
        board: "cases",
        status: "draft",
        title: "음성 빈집 구조물 해체공사",
        slug: "",
        excerpt: "충북 음성 구조물 해체",
        content: "<p>작업 전후 사진과 시공 내용을 정리합니다.</p>",
        case_category: "구조물 해체",
        case_location: "충청북도 음성군",
        case_area: "55평",
        case_cost: "상가",
        video_url: "https://www.youtube.com/watch?v=test",
      }),
    );

    expect(fields.slug).toBe("음성-빈집-구조물-해체공사");
    expect(fields.case_category).toBe("구조물 해체");
    expect(fields.case_location).toBe("충청북도 음성군");
    expect(fields.case_area).toBe("55평");
    expect(fields.case_cost).toBe("상가");
    expect(fields.video_url).toBe("https://www.youtube.com/watch?v=test");
  });

  it("rejects unknown construction categories", () => {
    expect(() =>
      validatePostFields(
        makeFormData({
          board: "cases",
          status: "draft",
          title: "잘못된 공사 유형",
          slug: "bad-category",
          content: "<p>본문</p>",
          case_category: "없는 공사 유형",
        }),
      ),
    ).toThrow("공사 유형");
  });
});
