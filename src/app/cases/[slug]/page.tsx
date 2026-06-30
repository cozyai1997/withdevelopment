import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/board-list";
import { CtaRow } from "@/components/cta-row";
import { boards } from "@/lib/site";
import { getPublishedPost } from "@/lib/posts";

type BoardDetailProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BoardDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost("cases", slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt ?? boards.cases.description,
  };
}

export default async function CaseDetailPage({ params }: BoardDetailProps) {
  const { slug } = await params;
  const post = await getPublishedPost("cases", slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <section className="page-title">
        <div className="page-title__inner">
          <p className="eyebrow">{boards.cases.label}</p>
          <h1>{post.title}</h1>
        </div>
      </section>
      <section className="section">
        <div className="section__inner">
          <PostArticle board="cases" post={post} />
        </div>
      </section>
      <CtaRow />
    </>
  );
}
