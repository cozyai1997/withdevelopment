import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const boardListSource = readFileSync(new URL("./board-list.tsx", import.meta.url), "utf8");
const gallerySource = readFileSync(new URL("./case-image-gallery.tsx", import.meta.url), "utf8");

describe("case detail layout source", () => {
  it("uses a reference-style shell with summary, facts, and analysis sections", () => {
    expect(boardListSource).toContain("case-detail__shell");
    expect(boardListSource).toContain("case-detail__summary-card");
    expect(boardListSource).toContain("case-detail__facts");
    expect(boardListSource).toContain("case-detail__analysis");
  });

  it("uses a showcase gallery with a large image and thumbnail grid", () => {
    expect(gallerySource).toContain("case-detail-gallery__grid");
    expect(gallerySource).toContain("case-detail-gallery__main");
    expect(gallerySource).toContain("case-detail-gallery__tile");
  });
});
