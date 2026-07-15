"use client";

import { useRef, useState, type CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  FileText,
  HardHat,
  House,
  MessageCircle,
  Network,
  ShieldCheck,
  Truck,
  UserRoundCheck,
} from "lucide-react";
import {
  contactWorkflowContent,
  type ContactChoiceIcon,
  type ContactEntryIcon,
  type ContactPromiseIcon,
} from "@/lib/contact-workflow";
import { getContactLinks } from "@/lib/site";
import styles from "../contact-page.module.css";

const entryIcons: Record<ContactEntryIcon, LucideIcon> = {
  site: HardHat,
  partner: Network,
};

const promiseIcons: Record<ContactPromiseIcon, LucideIcon> = {
  shield: ShieldCheck,
  process: ClipboardCheck,
  worker: HardHat,
  care: UserRoundCheck,
};

const choiceIcons: Record<ContactChoiceIcon, LucideIcon> = {
  building: Building2,
  document: FileText,
  house: House,
  worker: HardHat,
  truck: Truck,
  handshake: Network,
};

function InquiryChoice({ icon, label, name }: { icon: ContactChoiceIcon; label: string; name: string }) {
  const Icon = choiceIcons[icon];

  return (
    <label className={styles.choice}>
      <input type="checkbox" name={name} value={label} />
      <span>
        <Icon aria-hidden="true" />
        {label}
      </span>
    </label>
  );
}

function FormField({
  label,
  name,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  type?: "text" | "tel" | "email" | "date";
}) {
  return (
    <label className={styles.formLabel}>
      <span>
        {label}
        {required ? <em> *</em> : null}
      </span>
      <input className={styles.input} type={type} name={name} placeholder={placeholder} required={required} />
    </label>
  );
}

export function ContactWorkflowSection() {
  const content = contactWorkflowContent;
  const contact = getContactLinks();
  const telLabel = contact.tel || "공식 번호 준비 중";
  const [activeInquiry, setActiveInquiry] = useState<"site" | "partner">("site");
  const inquiryRef = useRef<HTMLElement | null>(null);
  const heroStyle = {
    "--contact-hero-image": `url("${content.hero.backgroundImage}")`,
  } as CSSProperties;

  function selectInquiry(id: (typeof content.entryCards)[number]["id"]) {
    setActiveInquiry(id === "site-inquiry" ? "site" : "partner");
    requestAnimationFrame(() => {
      inquiryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero} style={heroStyle} aria-labelledby="contact-title">
        <div className={styles.heroInner}>
          <p className="eyebrow">{content.hero.eyebrow}</p>
          <p className={styles.kicker}>{content.hero.kicker}</p>
          <h1 id="contact-title">
            {content.hero.titleLines.map((line, index) => (
              <span key={line} className={index === 1 ? styles.accentLine : undefined}>
                {line}
              </span>
            ))}
          </h1>
          <p className={styles.heroDescription}>
            {content.hero.descriptionLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>

          <div className={styles.entryGrid} aria-label="문의 유형 선택">
            {content.entryCards.map((card) => {
              const Icon = entryIcons[card.icon];
              const isActive = activeInquiry === (card.id === "site-inquiry" ? "site" : "partner");

              return (
                <button
                  className={`${styles.entryCard} ${isActive ? styles.entryCardActive : ""}`}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => selectInquiry(card.id)}
                  key={card.id}
                >
                  <span className={styles.entryIcon}>
                    <Icon aria-hidden="true" />
                  </span>
                  <span className={styles.entryCopy}>
                    <strong>{card.title}</strong>
                    <span>{card.description}</span>
                    <b>
                      {card.cta}
                      <ArrowRight aria-hidden="true" />
                    </b>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.promiseSection} aria-label="함께하는개발 철거 서비스 약속">
        <div className={styles.promiseInner}>
          <h2>함께하는개발이 약속드리는 철거 서비스</h2>
          <div className={styles.promiseGrid}>
            {content.promises.map((promise) => {
              const Icon = promiseIcons[promise.icon];

              return (
                <article className={styles.promiseItem} key={promise.title}>
                  <Icon aria-hidden="true" />
                  <div>
                    <strong>{promise.title}</strong>
                    <p>{promise.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.inquirySection} aria-label="문의 접수 양식" ref={inquiryRef}>
        <div className={`${styles.inquiryGrid} ${styles.inquiryGridSingle}`}>
          {activeInquiry === "site" ? (
          <article className={`${styles.inquiryPanel} ${styles.inquiryPanelGold}`} id="site-inquiry">
            <header className={styles.panelHeader}>
              <span className={styles.panelIcon}>
                <HardHat aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow">{content.siteInquiry.eyebrow}</p>
                <h2>{content.siteInquiry.title}</h2>
                <p>{content.siteInquiry.description}</p>
              </div>
            </header>

            <div className={styles.panelBody}>
              <div className={styles.guideColumn}>
                <h3>{content.siteInquiry.choicesTitle}</h3>
                <div className={styles.choiceGrid}>
                  {content.siteInquiry.choices.map((choice) => (
                    <InquiryChoice icon={choice.icon} label={choice.label} name="siteType" key={choice.label} />
                  ))}
                </div>

                <h3>{content.siteInquiry.checklistTitle}</h3>
                <ul className={styles.checkList}>
                  {content.siteInquiry.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <aside className={styles.callout}>
                  <MessageCircle aria-hidden="true" />
                  <strong>{content.siteInquiry.phoneTitle}</strong>
                  <span>{content.siteInquiry.phoneDescription}</span>
                  <b>{telLabel}</b>
                </aside>
              </div>

              <form className={styles.form} aria-label="현장 문의 입력 양식">
                <FormField label="이름" name="siteName" placeholder="이름을 입력해주세요" required />
                <FormField label="연락처" name="sitePhone" placeholder="연락처를 입력해주세요" required type="tel" />
                <FormField label="현장 주소" name="siteAddress" placeholder="현장 주소를 입력해주세요" />
                <label className={styles.formLabel}>
                  <span>철거 유형</span>
                  <select className={styles.input} name="siteCategory" defaultValue="">
                    <option value="" disabled>
                      선택해주세요
                    </option>
                    {content.siteInquiry.choices.map((choice) => (
                      <option value={choice.label} key={choice.label}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </label>
                <FormField label="예상 면적" name="siteArea" placeholder="예) 100평" />
                <FormField label="희망 일정" name="siteDate" placeholder="희망 일정을 선택해주세요" type="date" />
                <label className={styles.formLabel}>
                  <span>문의 내용</span>
                  <textarea className={`${styles.input} ${styles.textarea}`} name="siteMemo" placeholder="문의 내용을 입력해주세요" />
                </label>
                <label className={styles.formLabel}>
                  <span>사진 첨부</span>
                  <input className={styles.input} type="file" name="siteFile" />
                </label>
                <button className={styles.submitButton} type="button">
                  {content.siteInquiry.submitLabel}
                </button>
              </form>
            </div>
          </article>
          ) : null}
          {activeInquiry === "partner" ? (
          <article className={`${styles.inquiryPanel} ${styles.inquiryPanelBlue}`} id="partner-inquiry">
            <header className={styles.panelHeader}>
              <span className={styles.panelIcon}>
                <Network aria-hidden="true" />
              </span>
              <div>
                <p className="eyebrow">{content.partnerInquiry.eyebrow}</p>
                <h2>{content.partnerInquiry.title}</h2>
                <p>{content.partnerInquiry.description}</p>
              </div>
            </header>

            <div className={styles.panelBody}>
              <div className={styles.guideColumn}>
                <h3>{content.partnerInquiry.choicesTitle}</h3>
                <div className={styles.choiceGrid}>
                  {content.partnerInquiry.choices.map((choice) => (
                    <InquiryChoice icon={choice.icon} label={choice.label} name="partnerType" key={choice.label} />
                  ))}
                </div>

                <h3>{content.partnerInquiry.checklistTitle}</h3>
                <ul className={styles.checkList}>
                  {content.partnerInquiry.checklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <form className={styles.form} aria-label="협력업체 문의 입력 양식">
                <FormField label="회사명" name="companyName" placeholder="회사명을 입력해주세요" required />
                <FormField label="담당자명" name="managerName" placeholder="담당자명을 입력해주세요" required />
                <FormField label="연락처" name="partnerPhone" placeholder="연락처를 입력해주세요" required type="tel" />
                <FormField label="이메일" name="partnerEmail" placeholder="이메일을 입력해주세요" type="email" />
                <label className={styles.formLabel}>
                  <span>협력 분야</span>
                  <select className={styles.input} name="partnerCategory" defaultValue="">
                    <option value="" disabled>
                      선택해주세요
                    </option>
                    {content.partnerInquiry.choices.map((choice) => (
                      <option value={choice.label} key={choice.label}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </label>
                <FormField label="활동 지역" name="partnerRegion" placeholder="예) 서울, 경기, 인천" />
                <FormField label="보유 역량 / 장비" name="partnerCapacity" placeholder="보유한 역량이나 장비를 입력해주세요" />
                <label className={styles.formLabel}>
                  <span>제휴 제안 내용</span>
                  <textarea className={`${styles.input} ${styles.textarea}`} name="partnerMemo" placeholder="제휴 제안 내용을 입력해주세요" />
                </label>
                <label className={styles.formLabel}>
                  <span>회사소개서 첨부</span>
                  <input className={styles.input} type="file" name="partnerFile" />
                </label>
                <button className={`${styles.submitButton} ${styles.submitButtonInk}`} type="button">
                  {content.partnerInquiry.submitLabel}
                </button>
              </form>
            </div>
          </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
