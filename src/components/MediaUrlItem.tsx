import type { MediaUrl } from '@/lib/types';

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === 'www.youtube.com' || u.hostname === 'youtube.com') {
      return u.searchParams.get('v');
    }
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1);
    }
  } catch {
    // ignore
  }
  return null;
}

export function MediaUrlItem({ media }: { media: MediaUrl }) {
  const { url, mediaType, title, caption } = media;
  if (!url) return null;

  if (mediaType === 'video') {
    const youtubeId = extractYouTubeId(url);
    if (youtubeId) {
      return (
        <div>
          <div className="aspect-video w-full max-w-lg overflow-hidden rounded">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={title ?? 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          {caption && <p className="mt-1 text-xs text-fg-muted text-center">{caption}</p>}
        </div>
      );
    }
    return (
      <div>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video src={url} controls className="max-w-lg w-full rounded" />
        {caption && <p className="mt-1 text-xs text-fg-muted text-center">{caption}</p>}
      </div>
    );
  }

  return (
    <div>
      <a href={url} target="_blank" rel="noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={caption ?? title ?? ''} className="max-h-48 rounded object-cover" />
      </a>
      {caption && <p className="mt-1 text-xs text-fg-muted text-center">{caption}</p>}
    </div>
  );
}
