import { notFound } from "next/navigation";
import { updatePost } from "@/app/admin/posts/actions";
import { PostForm } from "@/components/post-form";
import { getAdminPost } from "@/lib/posts";

type EditPostPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const post = await getAdminPost(id);

  if (!post) {
    notFound();
  }

  const action = updatePost.bind(null, post.id);

  return (
    <section className="admin-panel">
      <p className="eyebrow">EDIT</p>
      <h1>게시글 수정</h1>
      <PostForm post={post} action={action} submitLabel="수정 저장" />
    </section>
  );
}
