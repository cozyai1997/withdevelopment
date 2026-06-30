import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "문의폼 운영 전 개인정보처리방침 자리표시자입니다.",
};

export default function PrivacyPage() {
  return (
    <>
      <section className="page-title">
        <div className="page-title__inner">
          <p className="eyebrow">PRIVACY</p>
          <h1>개인정보처리방침</h1>
          <p className="lead">문의폼 운영 전 최종 문안을 확정하기 위한 자리표시자입니다.</p>
        </div>
      </section>
      <section className="section">
        <div className="section__inner article">
          <p>
            본 페이지는 문의폼 운영 전 개인정보 수집 항목, 보유 기간, 이용 목적, 동의 철회 절차를 확정하기 위한 공간입니다.
            실제 운영 전 법적 검토와 공개 승인 절차를 거쳐 최종 문안을 반영합니다.
          </p>
          <p>현재 버전은 민감한 식별 정보를 포함하지 않습니다.</p>
        </div>
      </section>
    </>
  );
}
