import type { Metadata } from "next";
import { BoardList } from "@/components/board-list";
import { CtaRow } from "@/components/cta-row";
import { boards } from "@/lib/site";
import { listPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: boards.notice.label,
  description: boards.notice.description,
};

export default async function NoticePage() {
  const posts = await listPublishedPosts("notice");

  return (
    <>
      <section className="page-title">
        <div className="page-title__inner">
          <p className="eyebrow">NOTICE</p>
          <h1>{boards.notice.label}</h1>
          <p className="lead">{boards.notice.description}</p>
        </div>
      </section>
      <section className="section">
        <div className="section__inner">
          <BoardList board="notice" posts={posts} />
        </div>
      </section>
      <CtaRow />
    </>
  );
}
