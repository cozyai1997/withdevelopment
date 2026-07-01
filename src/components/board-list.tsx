/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock3,
  ClipboardCheck,
  House,
  MapPin,
  MessageCircle,
  Ruler,
} from "lucide-react";
import { CaseImageGallery } from "@/components/case-image-gallery";
import { QuoteRequestModal } from "@/components/quote-request-modal";
import { getCaseImagePublicUrl } from "@/lib/post-images";
import { boards, getContactLinks } from "@/lib/site";
import type { Board, PostWithImages } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

function formatDate(value: string | null) {
  if (!value) {
    return "공개 예정";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function getVideoEmbedUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }

    if (url.hostname.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }

  return null;
}

function CaseCard({ post }: { post: PostWithImages }) {
  const image = post.images[0];
  const imageUrl = getCaseImagePublicUrl(image?.storage_path);

  return (
    <article className="case-board-card">
      <Link className="case-board-card__image" href={`${boards.cases.href}/${post.slug}`}>
        {imageUrl ? <img alt={image?.alt_text ?? post.title} src={imageUrl} /> : <div className="case-placeholder">사진없음</div>}
      </Link>
      <div className="case-board-card__body">
        <div className="case-card__meta">
          <span className="badge">{post.case_category ?? boards.cases.label}</span>
          <span>{formatDate(post.published_at ?? post.created_at)}</span>
        </div>
        <h2>
          <Link href={`${boards.cases.href}/${post.slug}`}>{post.title}</Link>
        </h2>
        {post.excerpt ? <p>{post.excerpt}</p> : null}
        <div className="case-board-card__facts">
          {post.case_location ? <span>{post.case_location}</span> : null}
          {post.case_area ? <span>{post.case_area}</span> : null}
          {post.case_cost ? <span>{post.case_cost}</span> : null}
        </div>
      </div>
    </article>
  );
}

export function BoardList({ board, posts }: { board: Board; posts: PostWithImages[] }) {
  const boardInfo = boards[board];

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p className="eyebrow">{boardInfo.label}</p>
        <h2>아직 공개된 게시글이 없습니다</h2>
        <p className="lead">게시판 구조가 준비되어 있으며, 운영 승인 후 콘텐츠가 공개됩니다.</p>
      </div>
    );
  }

  if (board === "cases") {
    return (
      <div className="case-board-grid">
        {posts.map((post) => (
          <CaseCard key={post.id} post={post} />
        ))}
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

function FactCard({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="case-detail__fact">
      <span className="case-detail__fact-icon" aria-hidden="true">
        <Icon />
      </span>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function SummaryRow({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="case-detail__summary-row">
      <Icon aria-hidden="true" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function PostArticle({
  board,
  post,
  relatedPosts = [],
}: {
  board: Board;
  post: PostWithImages;
  relatedPosts?: PostWithImages[];
}) {
  const boardInfo = boards[board];
  const embedUrl = getVideoEmbedUrl(post.video_url);
  const contact = getContactLinks();

  if (board === "cases") {
    const publishedDate = formatDate(post.published_at ?? post.created_at);
    const locationLabel = post.case_location ?? "현장 확인";
    const areaLabel = post.case_area ?? "현장 확인";
    const buildingTypeLabel = post.case_cost ?? "현장 확인";
    const typeLabel = post.case_category ?? "철거 공사";
    const summaryTitle = `${post.case_location ?? "시공 현장"} 철거 정보`;
    const kakaoHref = contact.kakao || "/contact";
    const isExternalKakao = kakaoHref.startsWith("http");

    return (
      <article className="case-detail">
        <Link className="case-detail__back" href={boards.cases.href}>
          <ArrowLeft aria-hidden="true" />
          목록으로 돌아가기
        </Link>
        <div className="case-detail__shell">
          <div className="case-detail__main">
            <CaseImageGallery images={post.images} title={post.title} />

            <header className="case-detail__intro">
              <div className="case-detail__badges">
                <span className="badge">{typeLabel}</span>
                <span className="badge badge--soft">{locationLabel}</span>
              </div>
              <h1>{post.title}</h1>
              <div className="case-detail__post-meta">
                <span>{locationLabel}</span>
                <span>{publishedDate}</span>
              </div>
              {post.excerpt ? <p className="lead">{post.excerpt}</p> : null}
            </header>

            <section className="case-detail__facts" aria-label="현장 정보">
              <FactCard Icon={Building2} label="공사 유형" value={typeLabel} />
              <FactCard Icon={Ruler} label="면적" value={areaLabel} />
              <FactCard Icon={MapPin} label="지역" value={locationLabel} />
              <FactCard Icon={House} label="건물 유형" value={buildingTypeLabel} />
            </section>

            <section className="case-detail__info-section" aria-labelledby="case-info-heading">
              <div className="case-detail__section-heading">
                <p className="eyebrow">현장 정보</p>
                <h2 id="case-info-heading">{summaryTitle}</h2>
                <p>시공 조건과 진행 정보를 확인해보세요.</p>
              </div>
              <div className="case-detail__media-row">
                {embedUrl ? (
                  <div className="case-detail__video">
                    <iframe allowFullScreen src={embedUrl} title={`${post.title} 동영상`} />
                  </div>
                ) : post.video_url ? (
                  <Link className="case-detail__video-link" href={post.video_url}>
                    동영상 보기
                  </Link>
                ) : (
                  <div className="case-detail__video-link">등록된 동영상이 없습니다.</div>
                )}
              </div>
            </section>

            <section className="case-detail__analysis" aria-labelledby="case-analysis-heading">
              <h2 id="case-analysis-heading">시공 현장 분석</h2>
              <div className="article__body case-detail__body" dangerouslySetInnerHTML={{ __html: post.content }} />
            </section>

            {relatedPosts.length > 0 ? (
              <section className="case-related" aria-labelledby="case-related-heading">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">RELATED</p>
                    <h2 id="case-related-heading">관련 시공실적</h2>
                  </div>
                </div>
                <div className="case-board-grid case-board-grid--related">
                  {relatedPosts.map((relatedPost) => (
                    <CaseCard key={relatedPost.id} post={relatedPost} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="case-detail__sidebar" aria-label="문의 요약">
            <div className="case-detail__summary-card">
              <h2>{summaryTitle}</h2>
              <div className="case-detail__summary-list">
                <SummaryRow Icon={ClipboardCheck} label="공사 유형" value={typeLabel} />
                <SummaryRow Icon={CalendarDays} label="시공 일자" value={publishedDate} />
                <SummaryRow Icon={Clock3} label="공사 소요일" value="상담 후 확정" />
              </div>
              <QuoteRequestModal
                triggerClassName="case-detail__cta case-detail__cta--primary"
                triggerLabel="무료 견적 문의하기"
                triggerVariant="text"
              />
              <Link
                className="case-detail__cta"
                href={kakaoHref}
                rel={isExternalKakao ? "noreferrer" : undefined}
                target={isExternalKakao ? "_blank" : undefined}
              >
                <MessageCircle aria-hidden="true" />
                카카오톡 문의
              </Link>
            </div>
          </aside>
        </div>
      </article>
    );
  }

  return (
    <article className="article">
      <div className="board-item__meta">
        <span className="badge">{boardInfo.label}</span>
        <span>{formatDate(post.published_at ?? post.created_at)}</span>
      </div>
      {post.excerpt ? <p className="lead">{post.excerpt}</p> : null}
      <div className="article__body" dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  );
}
