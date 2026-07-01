/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getCaseImagePublicUrl } from "@/lib/post-images";
import { boards } from "@/lib/site";
import type { PostWithImages } from "@/lib/types";

function formatDate(value: string | null) {
  if (!value) {
    return "공개 예정";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function CaseSlide({ post, duplicate = false }: { post: PostWithImages; duplicate?: boolean }) {
  const image = post.images[0];
  const imageUrl = getCaseImagePublicUrl(image?.storage_path);

  return (
    <Link
      aria-hidden={duplicate || undefined}
      className="recent-case-slide"
      href={`${boards.cases.href}/${post.slug}`}
      tabIndex={duplicate ? -1 : undefined}
    >
      <div className="recent-case-slide__image">
        {imageUrl ? <img alt={image?.alt_text ?? post.title} src={imageUrl} /> : <div className="case-placeholder">사진없음</div>}
      </div>
      <div className="recent-case-slide__body">
        <div className="case-card__meta">
          <span className="badge">{post.case_category ?? boards.cases.label}</span>
          <span>{formatDate(post.published_at ?? post.created_at)}</span>
        </div>
        <h3>{post.title}</h3>
        {post.excerpt ? <p>{post.excerpt}</p> : null}
      </div>
    </Link>
  );
}

export function RecentCaseSlider({ posts }: { posts: PostWithImages[] }) {
  const slides = posts.slice(0, 5);

  if (slides.length === 0) {
    return (
      <div className="case-empty case-empty--compact">
        <p className="eyebrow">CASES</p>
        <h3>공개 가능한 시공 실적을 준비 중입니다</h3>
        <p>관리자에서 시공실적 게시글을 공개하면 최근 5개가 자동으로 표시됩니다.</p>
      </div>
    );
  }

  const animatedSlides = slides.length > 1 ? [...slides, ...slides] : slides;

  return (
    <div className="recent-case-slider" aria-label="최근 시공 실적">
      <div className="recent-case-slider__viewport">
        <div className={slides.length > 1 ? "recent-case-slider__track" : "recent-case-slider__track recent-case-slider__track--static"}>
          {animatedSlides.map((post, index) => (
            <CaseSlide duplicate={index >= slides.length} key={`${post.id}-${index}`} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
