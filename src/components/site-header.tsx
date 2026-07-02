import Link from "next/link";
import Image from "next/image";
import { publicNav, siteName } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="brand" href="/" aria-label={`${siteName} 홈`}>
          <span className="brand__logo-wrap" aria-hidden="true">
            <Image className="brand__logo" src="/brand/hamkke-logo-mark.png" alt="" width={335} height={266} priority unoptimized />
          </span>
          <span className="brand__name">{siteName}</span>
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          {publicNav.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
