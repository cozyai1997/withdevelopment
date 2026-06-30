import { Fragment } from "react";
import type { LucideIcon } from "lucide-react";
import { CalendarCheck, CheckSquare, ChevronRight, Handshake, MessageCircle, Search, ShieldCheck, Truck } from "lucide-react";
import { contactWorkflowContent, type ContactWorkflowIcon } from "@/lib/contact-workflow";
import styles from "../contact-page.module.css";

const workflowIcons: Record<ContactWorkflowIcon, LucideIcon> = {
  search: Search,
  handshake: Handshake,
  calendar: CalendarCheck,
  truck: Truck,
  check: CheckSquare,
};

export function ContactWorkflowSection() {
  const content = contactWorkflowContent;

  return (
    <section className={styles.workflow} aria-labelledby="contact-workflow-title">
      <div className={styles.inner}>
        {/* Page copy is managed in src/lib/contact-workflow.ts for easy editing. */}
        <div className={styles.intro}>
          <p className="eyebrow">{content.intro.eyebrow}</p>
          <h1 id="contact-workflow-title">
            {content.intro.titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className={styles.description}>
            {content.intro.descriptionLines.map((line, index) => (
              <Fragment key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </Fragment>
            ))}
          </p>
        </div>

        <div className={styles.tag} aria-hidden="true">
          <strong>{content.tag.title}</strong>
          <span>{content.tag.description}</span>
        </div>

        <div className={styles.hub}>
          <MessageCircle aria-hidden="true" />
          <strong>{content.hub.title}</strong>
          <p>{content.hub.description}</p>
        </div>

        <div className={styles.rail} aria-hidden="true" />

        <ol className={styles.steps}>
          {content.steps.map(({ title, description, icon }, index) => {
            const Icon = workflowIcons[icon];

            return (
              <li key={title}>
                <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.iconDisc}>
                  <Icon aria-hidden="true" />
                </span>
                <strong>{title}</strong>
                <p>{description}</p>
                {index < content.steps.length - 1 ? (
                  <span className={styles.arrow} aria-hidden="true">
                    <ChevronRight />
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>

        <div className={styles.safety}>
          <ShieldCheck aria-hidden="true" />
          <strong>{content.safety.title}</strong>
          <span>{content.safety.description}</span>
        </div>
      </div>
    </section>
  );
}
