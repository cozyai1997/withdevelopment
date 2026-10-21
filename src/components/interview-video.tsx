import type { PopupVideo } from "@/lib/popup-video";

export function InterviewVideo({ video }: { video: PopupVideo | null }) {
  if (!video) return null;
  return (
    <section className="section section--white section--compact" aria-labelledby="interview-heading">
      <div className="section__inner">
        <div className="section-heading">
          <div><p className="eyebrow">INTERVIEW</p><h2 id="interview-heading">연합뉴스경제TV 인터뷰 영상</h2></div>
          <a className="text-link" href={video.watchUrl} target="_blank" rel="noreferrer">유튜브에서 보기</a>
        </div>
        <div className="interview-video__frame">
          <iframe title="연합뉴스경제TV 인터뷰 영상" src={video.embedUrl} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
        </div>
      </div>
    </section>
  );
}
