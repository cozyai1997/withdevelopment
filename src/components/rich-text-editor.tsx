"use client";

import { useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  UnderlineIcon,
} from "lucide-react";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type RichTextEditorProps = {
  name: string;
  initialContent?: string;
  maxLength?: number;
};

type ToolbarButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

function ToolbarButton({ label, active = false, disabled = false, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      aria-label={label}
      className={active ? "editor-toolbar__button editor-toolbar__button--active" : "editor-toolbar__button"}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ name, initialContent = "", maxLength = 5000 }: RichTextEditorProps) {
  const [html, setHtml] = useState(initialContent);
  const [plainLength, setPlainLength] = useState(0);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: initialContent || "<p></p>",
    editorProps: {
      attributes: {
        class: "editor-content",
      },
    },
    immediatelyRender: false,
    onCreate({ editor: createdEditor }) {
      setPlainLength(createdEditor.getText().length);
    },
    onUpdate({ editor: updatedEditor }) {
      setHtml(updatedEditor.getHTML());
      setPlainLength(updatedEditor.getText().length);
    },
  });

  const setLink = () => {
    if (!editor) {
      return;
    }

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("링크 URL", previousUrl ?? "");

    if (url === null) {
      return;
    }

    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div className="editor-shell">
      <div className="editor-toolbar" aria-label="본문 편집 도구">
        <ToolbarButton
          active={editor?.isActive("bold")}
          disabled={!editor}
          label="굵게"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("italic")}
          disabled={!editor}
          label="기울임"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("underline")}
          disabled={!editor}
          label="밑줄"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("strike")}
          disabled={!editor}
          label="취소선"
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        >
          <Strikethrough />
        </ToolbarButton>
        <span className="editor-toolbar__divider" aria-hidden="true" />
        <ToolbarButton
          active={editor?.isActive("bulletList")}
          disabled={!editor}
          label="글머리 목록"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("orderedList")}
          disabled={!editor}
          label="번호 목록"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered />
        </ToolbarButton>
        <span className="editor-toolbar__divider" aria-hidden="true" />
        <ToolbarButton
          active={editor?.isActive({ textAlign: "left" })}
          disabled={!editor}
          label="왼쪽 정렬"
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive({ textAlign: "center" })}
          disabled={!editor}
          label="가운데 정렬"
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive({ textAlign: "right" })}
          disabled={!editor}
          label="오른쪽 정렬"
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight />
        </ToolbarButton>
        <span className="editor-toolbar__divider" aria-hidden="true" />
        <ToolbarButton active={editor?.isActive("link")} disabled={!editor} label="링크" onClick={setLink}>
          <LinkIcon />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("blockquote")}
          disabled={!editor}
          label="인용"
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        >
          <Quote />
        </ToolbarButton>
        <ToolbarButton
          active={editor?.isActive("code")}
          disabled={!editor}
          label="코드"
          onClick={() => editor?.chain().focus().toggleCode().run()}
        >
          <Code2 />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
      <textarea className="editor-hidden-field" name={name} readOnly required value={html} />
      <div className={plainLength > maxLength ? "field-help field-help--danger" : "field-help"}>
        {plainLength.toLocaleString("ko-KR")} / {maxLength.toLocaleString("ko-KR")}
      </div>
    </div>
  );
}
