/**
 * Universal video embed — supports YouTube (id or URL) or direct MP4/WebM.
 * Usage in MDX:
 *   <VideoEmbed youtube="dQw4w9WgXcQ" title="عنوان الفيديو" />
 *   <VideoEmbed src="/videos/tutorial.mp4" poster="/covers/tutorial.jpg" />
 */

type Props =
  | { youtube: string; src?: never; poster?: never; title?: string }
  | { src: string; youtube?: never; poster?: string; title?: string };

function extractYouTubeId(input: string): string {
  const m = input.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  return m ? m[1] : input; // assume raw id
}

export function VideoEmbed(props: Props) {
  if ("youtube" in props && props.youtube) {
    const id = extractYouTubeId(props.youtube);
    return (
      <div className="my-6 aspect-video rounded-2xl overflow-hidden shadow-card">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={props.title || "فيديو"}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }
  if ("src" in props && props.src) {
    return (
      <div className="my-6 rounded-2xl overflow-hidden shadow-card">
        <video
          controls
          preload="metadata"
          poster={props.poster}
          className="w-full h-auto"
        >
          <source src={props.src} />
          متصفحك لا يدعم تشغيل الفيديو.
        </video>
      </div>
    );
  }
  return null;
}
