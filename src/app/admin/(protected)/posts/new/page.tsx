import { createPost } from "@/app/admin/posts/actions";
import { PostForm } from "@/components/post-form";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <section className="admin-panel">
      <p className="eyebrow">CREATE</p>
      <h1>글쓰기</h1>
      <PostForm action={createPost} submitLabel="등록하기" />
    </section>
  );
}
