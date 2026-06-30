import Link from "next/link";
import { getContactLinks } from "@/lib/site";

export function CtaRow() {
  const contact = getContactLinks();
  const telHref = contact.tel ? `tel:${contact.tel}` : "/contact";
  const smsHref = contact.sms ? `sms:${contact.sms}` : "/contact";
  const kakaoHref = contact.kakao || "/contact";

  return (
    <section className="section cta-band">
      <div className="section__inner">
        <div>
          <p className="eyebrow">CONTACT</p>
          <h2>현장 조건을 확인한 뒤 문의를 시작하세요</h2>
        </div>
        <div className="actions">
          <Link className="button button--ink" href={telHref}>
            전화 문의
          </Link>
          <Link className="button button--ink" href={smsHref}>
            문자 문의
          </Link>
          <Link className="button button--light" href={kakaoHref}>
            카카오톡
          </Link>
        </div>
      </div>
    </section>
  );
}
