import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaRow } from "@/components/cta-row";
import { services } from "@/lib/site";

type ServicePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    return {};
  }

  return {
    title: service.title,
    description: service.lead,
  };
}

export default async function ServiceDetailPage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = services.find((item) => item.slug === slug);

  if (!service) {
    notFound();
  }

  return (
    <>
      <section className="page-title">
        <div className="page-title__inner">
          <p className="eyebrow">SERVICE</p>
          <h1>{service.title}</h1>
          <p className="lead">{service.lead}</p>
        </div>
      </section>
      <section className="section">
        <div className="section__inner grid grid--two">
          <article className="plain-panel">
            <h2>진행 흐름</h2>
            <ul className="list">
              {service.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
          <article className="plain-panel">
            <h2>문의 전 확인사항</h2>
            <p>
              현장 종류, 대략적인 위치 범위, 희망 일정, 공개 가능한 사진 여부를 먼저 정리하면 상담 흐름을 빠르게 잡을 수 있습니다.
            </p>
          </article>
        </div>
      </section>
      <CtaRow />
    </>
  );
}
