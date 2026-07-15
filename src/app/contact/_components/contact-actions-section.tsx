import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { contactWorkflowContent, type ContactMethodIcon } from "@/lib/contact-workflow";
import { getContactLinks } from "@/lib/site";
import styles from "../contact-page.module.css";

const methodIcons: Record<ContactMethodIcon, LucideIcon> = {
  phone: Phone,
  kakao: MessageCircle,
  sms: Mail,
};

export function ContactActionsSection() {
  const contact = getContactLinks();
  const content = contactWorkflowContent.contactMethods;
  const hrefByIcon: Record<ContactMethodIcon, string> = {
    phone: contact.tel ? `tel:${contact.tel}` : "#contact-methods",
    kakao: contact.kakao || "#contact-methods",
    sms: contact.sms ? `sms:${contact.sms}` : "#contact-methods",
  };
  const valueByIcon: Partial<Record<ContactMethodIcon, string>> = {
    phone: contact.tel || undefined,
    sms: contact.sms || undefined,
  };

  return (
    <section className={styles.methodSection} id="contact-methods" aria-labelledby="contact-method-title">
      <div className={styles.methodInner}>
        <p className="eyebrow">{content.eyebrow}</p>
        <h2 id="contact-method-title">{content.title}</h2>
        <p>{content.description}</p>
        <div className={styles.methodGrid}>
          {content.items.map((item) => {
            const Icon = methodIcons[item.icon];
            const href = hrefByIcon[item.icon];
            const isExternal = item.icon === "kakao" && href.startsWith("http");

            return (
              <Link className={styles.methodCard} href={href} key={item.label} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined}>
                <Icon aria-hidden="true" />
                <span>
                  <strong>{item.label}</strong>
                  <b>{valueByIcon[item.icon] ?? item.value}</b>
                  <small>{item.description}</small>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
