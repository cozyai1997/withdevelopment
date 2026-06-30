import type { Metadata } from "next";
import Link from "next/link";
import { CtaRow } from "@/components/cta-row";
import { services } from "@/lib/site";

export const metadata: Metadata = {
  title: "서비스",
  description: "구조물 철거, 리모델링 철거, 철거 대관업무, 재개발·재건축구역 철거 서비스를 안내합니다.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="page-title">
        <div className="page-title__inner">
          <p className="eyebrow">SERVICES</p>
          <h1>철거 서비스</h1>
          <p className="lead">업무 범위와 진행 절차를 서비스 유형별로 분리해 안내합니다.</p>
        </div>
      </section>
      <section className="section">
        <div className="section__inner grid grid--two">
          {services.map((service) => (
            <article className="plain-panel" key={service.slug}>
              <p className="eyebrow">SERVICE</p>
              <h2>{service.title}</h2>
              <p>{service.lead}</p>
              <Link className="text-link" href={`/services/${service.slug}`}>
                자세히 보기
              </Link>
            </article>
          ))}
        </div>
      </section>
      <CtaRow />
    </>
  );
}
