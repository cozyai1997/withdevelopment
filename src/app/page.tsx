import Link from "next/link";
import Image from "next/image";
import type { CSSProperties } from "react";
import { Building2, ClipboardCheck, Hammer, Landmark } from "lucide-react";
import { CtaRow } from "@/components/cta-row";
import { HomeBoardPreview, WorkflowSteps } from "@/components/home-sections";
import { NaverLocationMap } from "@/components/naver-location-map";
import { QuoteRequestModal } from "@/components/quote-request-modal";
import { RecentCaseSlider } from "@/components/recent-case-slider";
import { VideoPopup } from "@/components/video-popup";
import { getPublicPopupVideo } from "@/lib/popup-video";
import { boards, getLocationContent, servicePageContent, services, siteName } from "@/lib/site";
import { listPublishedPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

const servicePremiumIcons = [Building2, Hammer, ClipboardCheck, Landmark];

export default async function Home() {
  const location = getLocationContent();
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
              <Image className="hero__brand-mark" src="/brand/hamkke-logo-mark.png" alt="" width={335} height={266} priority unoptimized />
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
              <h2>철거 현장을 읽고 정리하는 방식</h2>
            </div>
            <Link className="text-link" href="/about">
              회사소개 보기
            </Link>
          </div>
          <div className="grid grid--two">
            <article className="plain-panel">
              <h3>회사 기준</h3>
              <p>견적보다 먼저 현장의 구조와 협의 조건을 읽고, 필요한 확인 항목을 정리합니다.</p>
            </article>
            <article className="plain-panel">
              <h3>운영 방식</h3>
              <p>상담, 서비스, 실적 기록이 각각 흩어지지 않도록 한 흐름으로 이어 둡니다.</p>
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
            const imageSrc = servicePageContent.cards.find((item) => item.slug === service.slug)?.imageSrc ?? servicePageContent.heroImage;
            const panelStyle = {
              "--service-premium-image": `url("${imageSrc}")`,
            } as CSSProperties;

            return (
              <article className="service-premium__panel" key={service.slug} style={panelStyle}>
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
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section section--ink workflow-section">
        <div className="section__inner">
          <div className="section-heading">
            <div>
              <p className="eyebrow">WORKFLOW</p>
              <h2>
                문의부터 정리까지
                <span>체계적인 철거 프로세스</span>
              </h2>
              <p className="workflow-section__lead">
                문의 접수부터 현장 정리 및 사후 안내까지,
                <br />
                안전과 신속함을 최우선으로 진행합니다.
              </p>
              <ul className="workflow-section__proof" aria-label="철거 프로세스 핵심 가치">
                <li>
                  <strong>안전 최우선</strong>
                  <span>모든 과정 안전관리</span>
                </li>
                <li>
                  <strong>전문 인력 운영</strong>
                  <span>정밀 인력 투입</span>
                </li>
                <li>
                  <strong>신속·정확 대응</strong>
                  <span>체계적 일정 관리</span>
                </li>
              </ul>
            </div>
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

      <section className="section section--ink location-section" aria-labelledby="location-heading">
        <div className="section__inner location-section__inner">
          <div className="location-section__copy">
            <p className="eyebrow">{location.eyebrow}</p>
            <h2 id="location-heading">{location.title}</h2>
            <p>{location.description}</p>
            <dl className="location-section__info">
              <div>
                <dt>주소</dt>
                <dd>{location.address}</dd>
              </div>
              <div>
                <dt>방문 안내</dt>
                <dd>현장 일정으로 부재중일 수 있으니 방문 전 문의를 먼저 남겨주세요.</dd>
              </div>
            </dl>
            <div className="actions">
              <Link className="button" href="/contact">
                문의하기
              </Link>
              {location.naverMapUrl ? (
                <Link className="button button--light" href={location.naverMapUrl} target="_blank" rel="noreferrer">
                  네이버지도 열기
                </Link>
              ) : null}
            </div>
          </div>
          <NaverLocationMap
            address={location.address}
            clientId={location.naverMapClientId}
            lat={location.lat}
            lng={location.lng}
            mapUrl={location.naverMapUrl}
            title={location.title}
          />
        </div>
      </section>

      <CtaRow />
    </>
  );
}
