import Link from "next/link";
import { contactWorkflowContent } from "@/lib/contact-workflow";
import { getContactLinks } from "@/lib/site";
import styles from "../contact-page.module.css";

export function ContactActionsSection() {
  const contact = getContactLinks();
  const content = contactWorkflowContent;
  const telHref = contact.tel ? `tel:${contact.tel}` : "#contact-actions";
  const smsHref = contact.sms ? `sms:${contact.sms}` : "#contact-actions";
  const kakaoHref = contact.kakao || "#contact-actions";

  return (
    <section className={`section ${styles.actionsSection}`} id="contact-actions">
      <div className="section__inner grid grid--two">
        <article className="plain-panel">
          <p className="eyebrow">{content.contactActions.eyebrow}</p>
          <h2>{content.contactActions.title}</h2>
          <p>{content.contactActions.description}</p>
          <div className="actions">
            <Link className="button" href={telHref}>
              {content.contactActions.buttons.tel}
            </Link>
            <Link className="button button--ink" href={smsHref}>
              {content.contactActions.buttons.sms}
            </Link>
            <Link className="button button--ink" href={kakaoHref}>
              {content.contactActions.buttons.kakao}
            </Link>
          </div>
        </article>
        <article className="plain-panel">
          <p className="eyebrow">{content.checklist.eyebrow}</p>
          <h2>{content.checklist.title}</h2>
          <ul className="list">
            {content.checklist.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
