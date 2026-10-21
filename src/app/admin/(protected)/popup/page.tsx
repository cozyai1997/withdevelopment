import { updatePopupVideoSettings } from "@/app/admin/popup/actions";
import { StatusMessage } from "@/components/status-message";
import { DEFAULT_POPUP_VIDEO_URL, getAdminPopupVideoSetting } from "@/lib/popup-video";

type PopupAdminPageProps = {
  searchParams: Promise<{ message?: string | string[] }>;
};

export const dynamic = "force-dynamic";

export default async function PopupAdminPage({ searchParams }: PopupAdminPageProps) {
  const params = await searchParams;
  const setting = await getAdminPopupVideoSetting();

  return (
    <section className="admin-grid">
      <div className="admin-panel">
        <p className="eyebrow">INTERVIEW VIDEO</p>
        <h1>홈 인터뷰 영상 관리</h1>
        <p>홈페이지 본문에 표시할 YouTube 영상 URL을 관리합니다.</p>
        <StatusMessage message={params.message} />
      </div>

      <form className="admin-panel form" action={updatePopupVideoSettings}>
        <label>
          YouTube URL
          <input
            className="field"
            name="youtubeUrl"
            type="url"
            defaultValue={setting?.youtube_url ?? DEFAULT_POPUP_VIDEO_URL}
            placeholder="https://youtu.be/o2ogVKgrCS4"
            required
          />
        </label>
        <label className="check-row">
          <input name="enabled" type="checkbox" defaultChecked={setting?.enabled ?? true} />
          홈 본문에 인터뷰 영상 표시
        </label>
        <div className="actions">
          <button className="button" type="submit">
            저장하기
          </button>
        </div>
      </form>
    </section>
  );
}
