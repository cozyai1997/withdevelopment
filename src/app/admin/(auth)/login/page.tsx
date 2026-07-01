import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn, signUp } from "@/app/admin/actions";
import { StatusMessage } from "@/components/status-message";
import { getCurrentProfile } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isTempAdminEnabled, TEMP_ADMIN_ID, TEMP_ADMIN_PASSWORD } from "@/lib/temp-admin";

type LoginPageProps = {
  searchParams: Promise<{ message?: string | string[] }>;
};

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const profile = await getCurrentProfile();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  return (
    <section className="page-title">
      <div className="page-title__inner">
        <p className="eyebrow">ADMIN</p>
        <h1>관리자 로그인</h1>
        <p className="lead">가입자는 기본 pending 상태이며, 승인된 admin만 게시판을 관리할 수 있습니다.</p>
        <StatusMessage message={params.message} />
        {isTempAdminEnabled() ? <p className="message">임시 관리자 계정: {TEMP_ADMIN_ID} / {TEMP_ADMIN_PASSWORD}</p> : null}
        {!isSupabaseConfigured() ? <p className="message">Supabase 환경변수를 설정하면 로그인과 가입 요청을 사용할 수 있습니다.</p> : null}
        {profile?.role === "pending" ? <p className="message">현재 계정은 승인 대기 상태입니다.</p> : null}
        <div className="grid grid--two">
          <form className="form plain-panel" action={signIn}>
            <h2>로그인</h2>
            <label>
              아이디 또는 이메일
              <input className="field" type="text" name="email" autoComplete="username" required />
            </label>
            <label>
              비밀번호
              <input className="field" type="password" name="password" autoComplete="current-password" required />
            </label>
            <button className="button" type="submit">
              로그인
            </button>
          </form>
          <form className="form plain-panel" action={signUp}>
            <h2>가입 요청</h2>
            <label>
              이메일
              <input className="field" type="email" name="email" autoComplete="email" required />
            </label>
            <label>
              비밀번호
              <input className="field" type="password" name="password" autoComplete="new-password" minLength={8} required />
            </label>
            <button className="button button--light" type="submit">
              가입 요청
            </button>
          </form>
        </div>
        <Link className="text-link" href="/">
          사이트로 돌아가기
        </Link>
      </div>
    </section>
  );
}
