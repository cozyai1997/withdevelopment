import type { Metadata } from "next";
import Script from "next/script";
import { FloatingContactButtons } from "@/components/floating-contact-buttons";
import { SiteIntroLoader } from "@/components/site-intro-loader";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl, siteName } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteName} | 철거 서비스`,
    template: `%s | ${siteName}`,
  },
  description: "구조물 철거, 리모델링 철거, 철거 대관업무, 재개발·재건축구역 철거를 안내하는 함께하는개발 공식 사이트입니다.",
  openGraph: {
    title: `${siteName} | 철거 서비스`,
    description: "철거 전문성과 문의 경로를 빠르게 확인할 수 있는 게시판형 사이트입니다.",
    type: "website",
    images: ["/site-visual.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Script id="site-intro-state" strategy="beforeInteractive">
          {`
            (function () {
              var root = document.documentElement;
              var key = "hamkke_site_intro_entered";
              var isAdmin = window.location.pathname.indexOf("/admin") === 0;
              var forceIntro = window.location.search.indexOf("intro_check=") >= 0;
              var hasSeen = false;

              try {
                hasSeen = window.sessionStorage.getItem(key) === "1";
              } catch (error) {
                hasSeen = false;
              }

              root.dataset.siteIntro = isAdmin || (hasSeen && !forceIntro) ? "skip" : "active";
            })();
          `}
        </Script>
        <div className="site-shell">
          <SiteIntroLoader />
          <SiteHeader />
          <main className="site-main">{children}</main>
          <SiteFooter />
          <FloatingContactButtons />
        </div>
      </body>
    </html>
  );
}
