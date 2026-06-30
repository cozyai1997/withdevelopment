import Link from "next/link";
import type { Board, Post } from "@/lib/types";
import { boards } from "@/lib/site";

function formatDate(value: string | null) {
  if (!value) {
    return "공개 예정";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function BoardList({ board, posts }: { board: Board; posts: Post[] }) {
  const boardInfo = boards[board];

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p className="eyebrow">{boardInfo.label}</p>
        <h2>아직 공개된 게시글이 없습니다</h2>
        <p className="lead">게시판 구조는 준비되어 있으며, 운영 승인 후 콘텐츠가 공개됩니다.</p>
      </div>
    );
  }

  return (
    <div className="board-list">
      {posts.map((post) => (
        <article className="board-item" key={post.id}>
          <div className="board-item__meta">
            <span className="badge">{boardInfo.label}</span>
            <span>{formatDate(post.published_at ?? post.created_at)}</span>
          </div>
          <h2>
            <Link href={`${boardInfo.href}/${post.slug}`}>{post.title}</Link>
          </h2>
          {post.excerpt ? <p>{post.excerpt}</p> : null}
          <Link className="text-link" href={`${boardInfo.href}/${post.slug}`}>
            자세히 보기
          </Link>
        </article>
      ))}
    </div>
  );
}

export function PostArticle({ board, post }: { board: Board; post: Post }) {
  const boardInfo = boards[board];

  return (
    <article className="article">
      <div className="board-item__meta">
        <span className="badge">{boardInfo.label}</span>
        <span>{formatDate(post.published_at ?? post.created_at)}</span>
      </div>
      {post.excerpt ? <p className="lead">{post.excerpt}</p> : null}
      <div className="article__body">{post.content}</div>
    </article>
  );
}
