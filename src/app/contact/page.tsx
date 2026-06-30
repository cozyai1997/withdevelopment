import type { Metadata } from "next";
import { contactWorkflowContent } from "@/lib/contact-workflow";
import { ContactActionsSection } from "./_components/contact-actions-section";
import { ContactWorkflowSection } from "./_components/contact-workflow-section";

export const metadata: Metadata = contactWorkflowContent.metadata;

export default function ContactPage() {
  return (
    <>
      <ContactWorkflowSection />
      <ContactActionsSection />
    </>
  );
}
