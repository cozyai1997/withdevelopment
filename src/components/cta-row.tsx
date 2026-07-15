import Link from "next/link";
import { ArrowRight, Headphones, MessageCircle } from "lucide-react";
import { getContactLinks } from "@/lib/site";

export function CtaRow() {
  const contact = getContactLinks();
  const kakaoHref = contact.kakao || "/contact";
  const isExternalKakao = /^https?:\/\//.test(kakaoHref);

  return (
    <section className="section floating-cta" aria-label="견적 문의">
      <div className="section__inner">
        <div className="floating-cta__panel">
          <span className="floating-cta__icon" aria-hidden="true">
            <Headphones />
          </span>
          <div className="floating-cta__copy">
            <h2>정확한 견적이 필요하신가요?</h2>
            <p>현장 조건을 먼저 확인하고, 불필요한 비용 없는 정확한 견적을 안내해드립니다.</p>
          </div>
          <div className="floating-cta__actions">
            <Link className="floating-cta__button floating-cta__button--primary" href="/contact">
              무료 견적 문의하기
              <ArrowRight aria-hidden="true" />
            </Link>
            <Link
              className="floating-cta__button floating-cta__button--secondary"
              href={kakaoHref}
              target={isExternalKakao ? "_blank" : undefined}
              rel={isExternalKakao ? "noreferrer" : undefined}
            >
              <MessageCircle aria-hidden="true" />
              톡톡으로 상담하기
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
