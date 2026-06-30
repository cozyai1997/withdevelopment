import type { Metadata } from "next";
import { BoardList } from "@/components/board-list";
import { CtaRow } from "@/components/cta-row";
import { boards } from "@/lib/site";
import { listPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: boards.resources.label,
  description: boards.resources.description,
};

export default async function ResourcesPage() {
  const posts = await listPublishedPosts("resources");

  return (
    <>
      <section className="page-title">
        <div className="page-title__inner">
          <p className="eyebrow">RESOURCES</p>
          <h1>{boards.resources.label}</h1>
          <p className="lead">{boards.resources.description}</p>
        </div>
      </section>
      <section className="section">
        <div className="section__inner">
          <BoardList board="resources" posts={posts} />
        </div>
      </section>
      <CtaRow />
    </>
  );
}
