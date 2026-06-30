import type { Metadata } from "next";
import { BoardList } from "@/components/board-list";
import { CtaRow } from "@/components/cta-row";
import { boards } from "@/lib/site";
import { listPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: boards.cases.label,
  description: boards.cases.description,
};

export default async function CasesPage() {
  const posts = await listPublishedPosts("cases");

  return (
    <>
      <section className="page-title">
        <div className="page-title__inner">
          <p className="eyebrow">CASES</p>
          <h1>{boards.cases.label}</h1>
          <p className="lead">{boards.cases.description}</p>
        </div>
      </section>
      <section className="section">
        <div className="section__inner">
          <BoardList board="cases" posts={posts} />
        </div>
      </section>
      <CtaRow />
    </>
  );
}
