import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/board-list";
import { CtaRow } from "@/components/cta-row";
import { boards } from "@/lib/site";
import { getPublishedPost, listPublishedPosts } from "@/lib/posts";

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
  const [post, casePosts] = await Promise.all([getPublishedPost("cases", slug), listPublishedPosts("cases", 5)]);

  if (!post) {
    notFound();
  }

  const relatedPosts = casePosts.filter((casePost) => casePost.id !== post.id).slice(0, 3);

  return (
    <>
      <section className="case-detail-page">
        <div className="section__inner">
          <PostArticle board="cases" post={post} relatedPosts={relatedPosts} />
        </div>
      </section>
      <CtaRow />
    </>
  );
}
