import type { Post } from "@/lib/types";
import { boards } from "@/lib/site";

type PostFormProps = {
  post?: Post;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
};

export function PostForm({ post, action, submitLabel }: PostFormProps) {
  return (
    <form className="form" action={action}>
      <label>
        게시판
        <select className="field" name="board" defaultValue={post?.board ?? "cases"} required>
          {Object.entries(boards).map(([value, board]) => (
            <option key={value} value={value}>
              {board.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        상태
        <select className="field" name="status" defaultValue={post?.status ?? "draft"} required>
          <option value="draft">비공개</option>
          <option value="published">공개</option>
        </select>
      </label>
      <label>
        제목
        <input className="field" name="title" defaultValue={post?.title ?? ""} maxLength={120} required />
      </label>
      <label>
        슬러그
        <input className="field" name="slug" defaultValue={post?.slug ?? ""} maxLength={80} required />
      </label>
      <label>
        요약
        <textarea className="field" name="excerpt" defaultValue={post?.excerpt ?? ""} maxLength={240} />
      </label>
      <label>
        본문
        <textarea className="field" name="content" defaultValue={post?.content ?? ""} required />
      </label>
      <div className="actions">
        <button className="button" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
