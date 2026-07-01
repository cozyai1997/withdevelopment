import Link from "next/link";
import Image from "next/image";
import { Building2, ClipboardCheck, Hammer, Landmark } from "lucide-react";
import { CtaRow } from "@/components/cta-row";
import { HomeBoardPreview, HomeCaseGallery, WorkflowSteps } from "@/components/home-sections";
import { QuoteRequestModal } from "@/components/quote-request-modal";
import { RecentCaseSlider } from "@/components/recent-case-slider";
import { VideoPopup } from "@/components/video-popup";
import { getPublicPopupVideo } from "@/lib/popup-video";
import { boards, services, siteName } from "@/lib/site";
import { listPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

const servicePremiumIcons = [Building2, Hammer, ClipboardCheck, Landmark];

export default async function Home() {
  const [casePosts, noticePosts, resourcePosts, popupVideo] = await Promise.all([
    listPublishedPosts("cases", 5),
    listPublishedPosts("notice", 3),
    listPublishedPosts("resources", 3),
    getPublicPopupVideo(),
  ]);

  return (
    <>
      <VideoPopup video={popupVideo} />
      <section className="hero">
        <video className="hero__video" autoPlay muted loop playsInline preload="metadata" poster="/site-visual.svg" aria-hidden="true">
          <source src="/0_Demolition_Construction_1920x1080.mp4" type="video/mp4" />
        </video>
        <div className="hero__inner">
          <div className="hero__copy">
            <div className="hero__brand-lockup" aria-label={siteName}>
              <Image className="hero__brand-mark" src="/brand/hamkke-logo-mark.png" alt="" width={335} height={266} priority />
              <span>WITH DEVELOPMENT</span>
            </div>
            <p className="eyebrow">DEMOLITION SERVICE</p>
            <h1 className="hero-title">
              <span className="hero-title__line">현장을 정확히 비우는</span>
              <span className="hero-title__line">철거 파트너</span>
            </h1>
            <p className="lead">
              구조물, 리모델링, 대관업무, 정비구역 철거까지 현장 조건을 먼저 보고
              <br />
              안전한 작업 흐름을 설계합니다.
            </p>
            <div className="actions">
              <QuoteRequestModal />
              <Link className="button button--light" href="/services">
                서비스 보기
              </Link>
            </div>
            <div className="hero__service-links" aria-label="주요 서비스 바로가기">
              {services.map((service) => (
                <Link href={`/services/${service.slug}`} key={service.slug}>
                  {service.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--white section--compact">
        <div className="section__inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">RECENT CASES</p>
              <h2>최근 시공 실적</h2>
            </div>
            <Link className="text-link" href={boards.cases.href}>
              전체 시공실적 보기
            </Link>
          </div>
          <RecentCaseSlider posts={casePosts} />
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ABOUT</p>
              <h2>현장 조건을 먼저 보는 철거 파트너</h2>
            </div>
            <Link className="text-link" href="/about">
              회사소개 보기
            </Link>
          </div>
          <div className="grid grid--two">
            <article className="plain-panel">
              <h3>업무 원칙</h3>
              <p>현장 조사, 작업 범위, 안전 동선, 공개 가능 정보를 분리해 확인합니다.</p>
            </article>
            <article className="plain-panel">
              <h3>공개 기준</h3>
              <p>시공 실적은 지역 단위와 작업 범위 중심으로 정리하고, 식별 정보는 공개하지 않습니다.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="service-premium" aria-labelledby="services-heading">
        <div className="service-premium__header">
          <div>
            <p className="eyebrow">SERVICES</p>
            <h2 id="services-heading">서비스 요약</h2>
          </div>
          <Link className="text-link" href="/services">
            서비스 전체 보기
          </Link>
        </div>
        <div className="service-premium__grid">
          {services.map((service, index) => {
            const Icon = servicePremiumIcons[index] ?? Building2;

            return (
              <article className="service-premium__panel" key={service.slug}>
                <div className="service-premium__content">
                  <span className="service-premium__icon-box" aria-hidden="true">
                    <Icon className="service-premium__icon" />
                  </span>
                  <p className="service-premium__eyebrow">SERVICE {String(index + 1).padStart(2, "0")}</p>
                  <h3>{service.title}</h3>
                  <p>{service.lead}</p>
                  <ul className="service-premium__points">
                    {service.points.slice(0, 2).map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  <Link className="service-premium__link" href={`/services/${service.slug}`}>
                    상세 보기
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CASE GALLERY</p>
              <h2>시공 실적 갤러리</h2>
            </div>
            <Link className="text-link" href={boards.cases.href}>
              전체 목록 보기
            </Link>
          </div>
          <HomeCaseGallery posts={casePosts} />
        </div>
      </section>

      <section className="section section--ink workflow-section">
        <div className="section__inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">WORKFLOW</p>
              <h2>문의부터 정리까지</h2>
              <p className="workflow-section__lead">
                문의 접수부터 현장 정리 및 후속 안내까지,
                <br />
                체계적인 절차로 안전하고 신속하게 진행됩니다.
              </p>
            </div>
            <Link className="text-link" href="/contact">
              문의 준비하기
            </Link>
          </div>
          <WorkflowSteps />
        </div>
      </section>

      <section className="section section--white">
        <div className="section__inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">BOARD</p>
              <h2>공지사항과 자료실</h2>
            </div>
          </div>
          <div className="preview-grid">
            <HomeBoardPreview board="notice" posts={noticePosts} />
            <HomeBoardPreview board="resources" posts={resourcePosts} />
          </div>
        </div>
      </section>

      <CtaRow />
    </>
  );
}
