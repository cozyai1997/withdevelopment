import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import type { Profile } from "@/lib/types";

export function AdminNav({ profile }: { profile: Profile }) {
  return (
    <header className="admin-header">
      <div className="admin-header__inner">
        <Link className="brand" href="/admin">
          <span className="brand__mark">관</span>
          <span>관리자</span>
        </Link>
        <nav className="admin-nav" aria-label="관리자 메뉴">
          <Link href="/admin">게시글</Link>
          <Link href="/admin/posts/new">작성</Link>
          <Link href="/admin/popup">영상 팝업</Link>
          <Link href="/admin/users">가입자 승인</Link>
          <span>{profile.email}</span>
          <form action={signOut}>
            <button className="button button--light" type="submit">
              로그아웃
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
