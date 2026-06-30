import type { Metadata } from "next";
import { CtaRow } from "@/components/cta-row";
import { siteName } from "@/lib/site";

export const metadata: Metadata = {
  title: "회사소개",
  description: "함께하는개발의 업무 원칙과 철거 서비스 운영 방향을 안내합니다.",
};

export default function AboutPage() {
  return (
    <>
      <section className="page-title">
        <div className="page-title__inner">
          <p className="eyebrow">ABOUT</p>
          <h1>{siteName}</h1>
          <p className="lead">현장 조건을 먼저 확인하고, 공개 가능한 정보만 바탕으로 안전하고 명확한 철거 과정을 안내합니다.</p>
        </div>
      </section>
      <section className="section">
        <div className="section__inner grid grid--two">
          <article className="plain-panel">
            <h2>업무 원칙</h2>
            <ul className="list">
              <li>현장 조사와 작업 범위를 분리해 확인합니다.</li>
              <li>개인정보와 식별 정보는 공개 전 검수합니다.</li>
              <li>서비스 설명은 실제 수행 범위 기준으로 작성합니다.</li>
            </ul>
          </article>
          <article className="plain-panel">
            <h2>브랜드 사용</h2>
            <p>
              공식 로고와 현장 이미지는 비식별 검수가 완료된 자료만 사용합니다. 준비 전까지는 텍스트 로고와 비식별 시각 자료로
              운영합니다.
            </p>
          </article>
        </div>
      </section>
      <CtaRow />
    </>
  );
}
