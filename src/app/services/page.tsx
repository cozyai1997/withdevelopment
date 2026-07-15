import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  ClipboardCheck,
  ClipboardList,
  HardHat,
  House,
  Landmark,
  Search,
} from "lucide-react";
import { CtaRow } from "@/components/cta-row";
import { servicePageContent } from "@/lib/site";

export const metadata: Metadata = {
  title: "서비스",
  description: "구조물 철거, 리모델링 철거, 철거 대관업무, 재개발·재건축구역 철거 서비스를 안내합니다.",
};

type ServiceCardIcon = (typeof servicePageContent.cards)[number]["icon"];
type ProcessIcon = (typeof servicePageContent.processSteps)[number]["icon"];

const serviceIcons: Record<ServiceCardIcon, LucideIcon> = {
  building: Building2,
  house: House,
  document: ClipboardList,
  landmark: Landmark,
};

const processIcons: Record<ProcessIcon, LucideIcon> = {
  search: Search,
  clipboard: ClipboardList,
  file: ClipboardCheck,
  worker: HardHat,
};

export default function ServicesPage() {
  const heroStyle = {
    "--services-hero-image": `url("${servicePageContent.heroImage}")`,
  } as CSSProperties;

  return (
    <div className="services-page">
      <section className="services-hero" style={heroStyle}>
        <div className="services-hero__inner">
          <p className="eyebrow">SERVICES</p>
          <h1>철거 서비스</h1>
          <p className="lead">업무 범위와 진행 절차를 서비스 유형별로 분리해 안내합니다.</p>
        </div>
      </section>

      <section className="services-card-section" aria-label="서비스 유형">
        <div className="services-card-grid">
          {servicePageContent.cards.map((service) => {
            const Icon = serviceIcons[service.icon];

            return (
              <article className="services-card" key={service.slug}>
                <div className="services-card__image" aria-hidden="true">
                  <Image src={service.imageSrc} alt="" fill sizes="(max-width: 768px) 100vw, 260px" />
                </div>
                <div className="services-card__body">
                  <span className="services-card__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="services-card__number">{service.number}</span>
                  <h2>{service.title}</h2>
                  <p>{service.lead}</p>
                  <ul className="services-card__tags" aria-label={`${service.title} 주요 범위`}>
                    {service.tags.map((tag) => (
                      <li key={tag}>{tag}</li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="services-process" aria-labelledby="services-process-title">
        <div className="services-process__inner">
          <div className="services-process__heading">
            <h2 id="services-process-title">철거 진행 절차</h2>
            <p>체계적인 절차로 안전하고 효율적인 철거를 진행합니다.</p>
          </div>
          <ol className="services-process__steps">
            {servicePageContent.processSteps.map((step) => {
              const Icon = processIcons[step.icon];

              return (
                <li key={step.number}>
                  <span className="services-process__icon">
                    <Icon aria-hidden="true" />
                  </span>
                  <span className="services-process__number">{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <CtaRow />

    </div>
  );
}
