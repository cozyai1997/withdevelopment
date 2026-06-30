import { updateUserRole } from "@/app/admin/users/actions";
import { StatusMessage } from "@/components/status-message";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

type UsersPageProps = {
  searchParams: Promise<{ message?: string | string[] }>;
};

export const dynamic = "force-dynamic";

async function listProfiles(): Promise<Profile[]> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,role,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  return data ?? [];
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const params = await searchParams;
  const profiles = await listProfiles();

  return (
    <section className="admin-grid">
      <div className="admin-panel">
        <p className="eyebrow">USERS</p>
        <h1>가입자 승인</h1>
        <p>pending 사용자를 admin으로 변경하면 관리자 기능을 사용할 수 있습니다.</p>
        <StatusMessage message={params.message} />
      </div>

      {profiles.length === 0 ? (
        <div className="empty-state">
          <h2>가입자가 없습니다</h2>
          <p>가입 요청이 생성되면 이곳에 표시됩니다.</p>
        </div>
      ) : (
        profiles.map((profile) => (
          <article className="admin-row" key={profile.id}>
            <div>
              <div className="admin-meta">
                <span className="badge">{profile.role}</span>
                <span>{profile.email}</span>
              </div>
              <p>{profile.id}</p>
            </div>
            <form className="admin-actions" action={updateUserRole}>
              <input type="hidden" name="id" value={profile.id} />
              <select className="field" name="role" defaultValue={profile.role}>
                <option value="pending">pending</option>
                <option value="admin">admin</option>
              </select>
              <button className="button" type="submit">
                권한 저장
              </button>
            </form>
          </article>
        ))
      )}
    </section>
  );
}
