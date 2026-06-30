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
  const post = await getPublishedPost("notice", slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.excerpt ?? boards.notice.description,
  };
}

export default async function NoticeDetailPage({ params }: BoardDetailProps) {
  const { slug } = await params;
  const post = await getPublishedPost("notice", slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <section className="page-title">
        <div className="page-title__inner">
          <p className="eyebrow">{boards.notice.label}</p>
          <h1>{post.title}</h1>
        </div>
      </section>
      <section className="section">
        <div className="section__inner">
          <PostArticle board="notice" post={post} />
        </div>
      </section>
      <CtaRow />
    </>
  );
}
