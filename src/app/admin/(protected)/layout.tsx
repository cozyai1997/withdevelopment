import { AdminNav } from "@/components/admin-nav";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdmin();

  return (
    <div className="admin-shell">
      <AdminNav profile={profile} />
      <div className="admin-main">{children}</div>
    </div>
  );
}
