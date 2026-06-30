import Link from "next/link";

export default function NotFound() {
  return (
    <section className="page-title">
      <div className="page-title__inner">
        <p className="eyebrow">404</p>
        <h1>페이지를 찾을 수 없습니다</h1>
        <p className="lead">주소가 변경되었거나 아직 공개되지 않은 게시글입니다.</p>
        <div className="actions">
          <Link className="button" href="/">
            홈으로 이동
          </Link>
        </div>
      </div>
    </section>
  );
}
