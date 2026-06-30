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
        <p className="eyebrow">VIDEO POPUP</p>
        <h1>홈 영상 팝업 관리</h1>
        <p>홈페이지 접속 시 노출할 YouTube 영상 URL을 관리합니다.</p>
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
          홈 접속 시 영상 팝업 노출
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
