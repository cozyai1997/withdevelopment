"use client";

import { Headphones, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

const isExternalUrl = (href: string) => /^https?:\/\//.test(href);

const getTelHref = () => {
  const contactTel = process.env.NEXT_PUBLIC_CONTACT_TEL;

  if (!contactTel) {
    return "/contact";
  }

  const normalizedTel = contactTel.replace(/[^\d+]/g, "");
  return `tel:${normalizedTel || contactTel}`;
};

export function FloatingContactButtons() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname === "/contact") {
    return null;
  }

  const kakaoHref = process.env.NEXT_PUBLIC_KAKAO_CHANNEL_URL || "/contact";
  const actions = [
    {
      label: "카톡 채널",
      href: kakaoHref,
      Icon: MessageCircle,
      external: isExternalUrl(kakaoHref),
    },
    {
      label: "1:1 상담",
      href: getTelHref(),
      Icon: Headphones,
      external: false,
    },
  ];

  return (
    <aside className="floating-contact" aria-label="빠른 상담 메뉴">
      {actions.map(({ label, href, Icon, external }) => (
        <a
          aria-label={label}
          className="floating-contact__item"
          href={href}
          key={label}
          rel={external ? "noreferrer" : undefined}
          target={external ? "_blank" : undefined}
        >
          <span className="floating-contact__label">{label}</span>
          <span className="floating-contact__button" aria-hidden="true">
            <Icon className="floating-contact__icon" aria-hidden="true" />
          </span>
        </a>
      ))}
    </aside>
  );
}
