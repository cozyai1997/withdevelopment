import Link from "next/link";
import { siteName } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <strong>{siteName}</strong>
        <p>공식 연락 채널과 공개 가능한 회사 정보는 운영 승인 후 반영합니다.</p>
        <p>
          <Link className="text-link" href="/privacy">
            개인정보처리방침
          </Link>
          {" · "}
          <Link className="text-link" href="/admin/login">
            관리자
          </Link>
        </p>
      </div>
    </footer>
  );
}
