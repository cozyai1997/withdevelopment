import Link from "next/link";
import { deletePost, setPostStatus } from "@/app/admin/posts/actions";
import { StatusMessage } from "@/components/status-message";
import { boards } from "@/lib/site";
import { listAdminPosts } from "@/lib/posts";

type AdminPageProps = {
  searchParams: Promise<{ message?: string | string[] }>;
};

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  const posts = await listAdminPosts();

  return (
    <section className="admin-grid">
      <div className="admin-panel">
        <p className="eyebrow">POSTS</p>
        <h1>게시글 관리</h1>
        <StatusMessage message={params.message} />
        <div className="actions">
          <Link className="button" href="/admin/posts/new">
            새 글 작성
          </Link>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <h2>게시글이 없습니다</h2>
          <p>v1은 빈 게시판 구조로 시작합니다.</p>
        </div>
      ) : (
        posts.map((post) => (
          <article className="admin-row" key={post.id}>
            <div>
              <div className="admin-meta">
                <span className="badge">{boards[post.board].label}</span>
                <span>{post.status === "published" ? "공개" : "비공개"}</span>
                <span>{formatDate(post.updated_at)}</span>
              </div>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
            </div>
            <div className="admin-actions">
              <Link className="button button--ink" href={`/admin/posts/${post.id}/edit`}>
                수정
              </Link>
              <form action={setPostStatus}>
                <input type="hidden" name="id" value={post.id} />
                <input type="hidden" name="status" value={post.status === "published" ? "draft" : "published"} />
                <button className="button" type="submit">
                  {post.status === "published" ? "비공개" : "공개"}
                </button>
              </form>
              <form action={deletePost}>
                <input type="hidden" name="id" value={post.id} />
                <button className="button button--light" type="submit">
                  삭제
                </button>
              </form>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
