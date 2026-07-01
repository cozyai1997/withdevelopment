import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const postFormSource = readFileSync(new URL("./post-form.tsx", import.meta.url), "utf8");

describe("PostForm server action form", () => {
  it("does not manually set method or encType when action is a function", () => {
    expect(postFormSource).not.toContain(" encType=");
    expect(postFormSource).not.toContain(" method=");
  });
});
