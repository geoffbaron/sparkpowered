import { JsonLd, SITE_NAME, SITE_URL, url } from "@/lib/seo";

/**
 * A self-hosted how-to video (public/videos). Made by our sister site CamperVolts;
 * every caption was checked against makers' manuals (claims log kept with the video source).
 */
export interface HowToVideoInfo {
  slug: string;
  title: string;
  description: string;
  durationSec: number;
  uploadDate: string;
}

export const SOLAR_TO_BATTERY_VIDEO: HowToVideoInfo = {
  slug: "solar-to-battery",
  title: "Wire solar panels to a battery",
  description:
    "Solar panels to a battery through a charge controller: connect the battery side first, let the controller start up, then connect the panels last, with a fuse on the battery cable and another between the panels and the controller.",
  durationSec: 43,
  uploadDate: "2026-10-26T19:00:00+00:00",
};

export function videoLd(v: HowToVideoInfo) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.title,
    description: v.description,
    thumbnailUrl: [url(`/videos/${v.slug}.jpg`)],
    uploadDate: v.uploadDate,
    contentUrl: url(`/videos/${v.slug}.mp4`),
    duration: `PT${v.durationSec}S`,
    inLanguage: "en-US",
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

export function HowToVideo({ video: v }: { video: HowToVideoInfo }) {
  const src = `/videos/${v.slug}.mp4`;
  return (
    <figure className="my-6 max-w-3xl">
      <JsonLd data={videoLd(v)} />
      <div className="overflow-hidden rounded-xl border border-black/8 bg-[#f4f1ea]">
        <video
          controls
          preload="none"
          playsInline
          poster={`/videos/${v.slug}.jpg`}
          width={1280}
          height={720}
          className="block w-full h-auto aspect-video"
          aria-label={`${v.title} (video, ${v.durationSec} seconds, no narration)`}
        >
          <source src={src} type="video/mp4" />
          Your browser can&apos;t play this video. <a href={src}>Download the MP4</a>.
        </video>
      </div>
      <figcaption className="mt-2 text-sm text-stone-600 leading-relaxed">
        <span className="font-semibold text-ink">{v.title}</span> ({v.durationSec} seconds, captions on screen, no narration). {v.description}{" "}
        Check your own parts&apos; manuals before you wire.
      </figcaption>
    </figure>
  );
}
