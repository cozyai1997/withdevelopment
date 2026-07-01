import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const richTextEditorSource = readFileSync(new URL("./rich-text-editor.tsx", import.meta.url), "utf8");

describe("RichTextEditor extensions", () => {
  it("does not register Tiptap extensions already included by StarterKit v3", () => {
    expect(richTextEditorSource).not.toContain("@tiptap/extension-link");
    expect(richTextEditorSource).not.toContain("@tiptap/extension-underline");
  });
});
