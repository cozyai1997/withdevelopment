import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CtaRow } from "@/components/cta-row";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "회사소개",
  description: "함께하는개발의 현장 판단 기준과 운영 방향을 안내합니다.",
};

const principles = [
  {
    number: "01",
    title: "현장 해석",
    description: "도면이나 면적만으로 판단하지 않고 구조, 주변 환경, 진입 동선처럼 현장의 실제 변수를 먼저 읽습니다.",
  },
  {
    number: "02",
    title: "범위 정리",
    description: "작업 범위와 제외 범위를 분명히 나누어 견적, 일정, 협의 과정에서 생길 수 있는 혼선을 줄입니다.",
  },
  {
    number: "03",
    title: "기록 관리",
    description: "현장 사진과 시공 기록은 운영에 필요한 기준으로 남기되 공개 화면에는 식별 정보를 남기지 않습니다.",
  },
];

const focusItems = [
  "철거 유형과 현장 성격을 구분해 상담 내용을 빠르게 정리합니다.",
  "이해관계자 협의가 필요한 현장은 일정과 리스크를 함께 검토합니다.",
  "실적 공개 자료는 지역 단위, 공사 유형, 작업 범위 중심으로 정리합니다.",
  "현장마다 다른 폐기물 처리와 후속 안내 기준을 사전에 확인합니다.",
];

const standardItems = [
  {
    title: "상담 기준",
    description: "문의 단계에서는 주소, 면적, 철거 유형처럼 판단에 필요한 최소 정보부터 확인합니다.",
  },
  {
    title: "자료 기준",
    description: "사진과 기록은 현장 설명에 필요한 범위로만 사용하고, 공개 전 비식별 여부를 점검합니다.",
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-hero">
        <video className="about-hero__video" autoPlay muted loop playsInline preload="metadata" poster="/services/hero.png" aria-hidden="true">
          <source src="/0_Demolition_Construction_1920x1080.mp4" type="video/mp4" />
        </video>
        <div className="about-hero__inner">
          <div className="about-hero__copy">
            <div className="about-hero__brand" aria-label={siteName}>
              <Image src="/brand/hamkke-logo-mark.png" alt="" width={335} height={266} priority unoptimized />
              <span>WITH DEVELOPMENT</span>
            </div>
            <p className="eyebrow">ABOUT</p>
            <h1>
              <span>현장을 먼저 이해하고</span>
              <span>안전하게 비우는 회사</span>
            </h1>
            <p className="lead">
              {siteName}은 철거가 필요한 현장의 조건과 이해관계를 먼저 정리하고, 실행 가능한 범위부터 차분하게 안내합니다.
            </p>
            <div className="actions">
              <Link className="button" href="/contact">
                문의하기
              </Link>
              <Link className="button button--light" href="/services">
                서비스 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="about-intro">
        <div className="about-intro__inner">
          <div className="about-intro__heading">
            <p className="eyebrow">COMPANY</p>
            <h2>철거는 비우는 일이지만, 판단 기준은 더 선명해야 합니다.</h2>
          </div>
          <div className="about-intro__copy">
            <p>
              함께하는개발은 현장을 단순 작업 장소가 아니라 구조, 일정, 주변 환경, 협의 조건이 함께 얽힌 공간으로 봅니다.
            </p>
            <p>
              그래서 상담 단계부터 확인할 정보와 공개하지 않을 정보를 나누고, 고객이 다음 결정을 쉽게 내릴 수 있도록 정돈된 기준을
              제공합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="about-principles" aria-labelledby="about-principles-title">
        <div className="about-section-heading">
          <p className="eyebrow">PRINCIPLES</p>
          <h2 id="about-principles-title">판단 기준</h2>
        </div>
        <div className="about-principles__grid">
          {principles.map((item) => (
            <article className="about-principle-card" key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-focus" aria-labelledby="about-focus-title">
        <div className="about-focus__inner">
          <div>
            <p className="eyebrow">WHAT WE ORGANIZE</p>
            <h2 id="about-focus-title">복잡한 현장 조건을 실행 가능한 기준으로 정리합니다.</h2>
          </div>
          <ul className="about-focus__list">
            {focusItems.map((item, index) => (
              <li key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="about-standard">
        <div className="about-standard__inner">
          <div className="about-standard__mark" aria-hidden="true">
            <Image src="/brand/hamkke-logo-mark.png" alt="" width={335} height={266} unoptimized />
          </div>
          <div>
            <p className="eyebrow">BRAND STANDARD</p>
            <h2>기록은 정확하게, 공개는 필요한 만큼만 남깁니다.</h2>
            <div className="about-standard__list">
              {standardItems.map((item) => (
                <article key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaRow />

    </div>
  );
}
