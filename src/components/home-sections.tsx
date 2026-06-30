import Link from "next/link";
import { CalendarCheck, CheckSquare, ChevronRight, Handshake, MessageCircle, Search, ShieldCheck, Truck } from "lucide-react";
import type { Board, Post } from "@/lib/types";
import { boards } from "@/lib/site";

const boardLabels: Record<Board, string> = {
  cases: "시공실적",
  notice: "공지사항",
  resources: "자료실",
};

const boardDescriptions: Record<Board, string> = {
  cases: "지역 단위와 공사 유형 중심으로 공개 가능한 실적을 정리합니다.",
  notice: "운영 공지와 서비스 안내를 게시합니다.",
  resources: "철거 준비 체크리스트와 문의 전 확인사항을 제공합니다.",
};

function formatDate(value: string | null) {
  if (!value) {
    return "공개 예정";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function CaseCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  return (
    <article className={featured ? "case-card case-card--featured" : "case-card"}>
      <div className="case-card__meta">
        <span className="badge">{boardLabels.cases}</span>
        <span>{formatDate(post.published_at ?? post.created_at)}</span>
      </div>
      <h3>
        <Link href={`${boards.cases.href}/${post.slug}`}>{post.title}</Link>
      </h3>
      {post.excerpt ? <p>{post.excerpt}</p> : <p>지역 단위, 공사 유형, 작업 범위를 게시글 요약에 입력해 주세요.</p>}
      <Link className="text-link" href={`${boards.cases.href}/${post.slug}`}>
        자세히 보기
      </Link>
    </article>
  );
}

function EmptyCaseState({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "case-empty case-empty--compact" : "case-empty"}>
      <p className="eyebrow">CASES</p>
      <h3>공개 가능한 시공 실적을 준비 중입니다</h3>
      <p>운영 승인 후 지역 단위와 작업 범위 중심의 실적 카드가 표시됩니다.</p>
      <Link className="text-link" href={boards.cases.href}>
        시공실적 게시판 보기
      </Link>
    </div>
  );
}

export function HomeCaseGallery({ posts, variant = "featured" }: { posts: Post[]; variant?: "rail" | "featured" }) {
  if (posts.length === 0) {
    return <EmptyCaseState compact={variant === "rail"} />;
  }

  if (variant === "rail") {
    return (
      <div className="case-rail" aria-label="최근 시공 실적">
        {posts.slice(0, 4).map((post) => (
          <CaseCard key={post.id} post={post} />
        ))}
      </div>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <div className="case-gallery">
      <CaseCard post={featured} featured />
      <div className="case-gallery__side">
        {rest.slice(0, 4).map((post) => (
          <CaseCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

export function HomeBoardPreview({ board, posts }: { board: Board; posts: Post[] }) {
  const boardInfo = boards[board];
  const label = boardLabels[board];

  return (
    <section className="board-preview">
      <div>
        <p className="eyebrow">{label}</p>
        <h3>{label}</h3>
        <p>{boardDescriptions[board]}</p>
      </div>
      {posts.length === 0 ? (
        <div className="board-preview__empty">
          <p>아직 공개된 게시글이 없습니다.</p>
        </div>
      ) : (
        <div className="board-preview__list">
          {posts.slice(0, 3).map((post) => (
            <Link className="board-preview__item" href={`${boardInfo.href}/${post.slug}`} key={post.id}>
              <span>{formatDate(post.published_at ?? post.created_at)}</span>
              <strong>{post.title}</strong>
            </Link>
          ))}
        </div>
      )}
      <Link className="text-link" href={boardInfo.href}>
        전체 보기
      </Link>
    </section>
  );
}

export function WorkflowSteps() {
  const steps = [
    {
      title: "현장 조건 확인",
      description: "현장 상황 및\n기본 조건 확인",
      Icon: Search,
    },
    {
      title: "작업 범위 협의",
      description: "철거 범위 및\n세부 내용 협의",
      Icon: Handshake,
    },
    {
      title: "일정·안전 계획 수립",
      description: "공사 일정 및\n안전 계획 수립",
      Icon: CalendarCheck,
    },
    {
      title: "철거 진행",
      description: "안전하게 철거 작업\n실시 및 관리",
      Icon: Truck,
    },
    {
      title: "정리 및 후속 안내",
      description: "현장 정리 및\n후속 절차 안내",
      Icon: CheckSquare,
    },
  ];

  return (
    <div className="workflow-showcase">
      <div className="workflow-showcase__tag" aria-hidden="true">
        <strong>문의의 시작</strong>
        <span>빠르고 정확한 대응</span>
      </div>
      <div className="workflow-showcase__hub">
        <MessageCircle className="workflow-showcase__hub-icon" aria-hidden="true" />
        <strong>문의 접수</strong>
        <p>
          문의가 접수되면
          <br />
          전담 담당자가 배정됩니다.
        </p>
      </div>
      <ol className="workflow-steps">
        {steps.map(({ title, description, Icon }, index) => (
          <li key={title}>
            <span className="workflow-steps__number">{String(index + 1).padStart(2, "0")}</span>
            <div className="workflow-steps__icon-wrap">
              <Icon className="workflow-steps__icon" aria-hidden="true" />
            </div>
            <strong>{title}</strong>
            <p>{description}</p>
            {index < steps.length - 1 ? (
              <span className="workflow-steps__arrow" aria-hidden="true">
                <ChevronRight />
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      <div className="workflow-showcase__safety">
        <ShieldCheck aria-hidden="true" />
        <strong>안전 최우선</strong>
        <span>모든 과정은 안전을 최우선으로 하며, 고객 만족을 위해 책임감 있게 진행합니다.</span>
      </div>
    </div>
  );
}
