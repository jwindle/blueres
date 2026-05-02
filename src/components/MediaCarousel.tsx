'use client';

import { useState } from 'react';
import type { Media, MediaUrl, MediaAtUri } from '@/lib/types';
import { MediaUrlItem } from './MediaUrlItem';
import { MediaAtUriItem } from './MediaAtUriItem';

function MediaItem({ media }: { media: Media }) {
  if (media.$type === 'org.blueres.resume.resume#mediaUrl') {
    return <MediaUrlItem media={media as MediaUrl} />;
  }
  if (media.$type === 'org.blueres.resume.resume#mediaAtUri') {
    return <MediaAtUriItem media={media as MediaAtUri} />;
  }
  return null;
}

export function MediaCarousel({ items }: { items: Media[] }) {
  const [index, setIndex] = useState(0);
  if (!items.length) return null;

  const clamped = Math.min(index, items.length - 1);

  return (
    <div className="mt-3 flex flex-col items-center">
      <MediaItem media={items[clamped]} />
      {items.length > 1 && (
        <div className="mt-1 flex items-center gap-2 text-xs text-fg-muted print:hidden">
          <button
            onClick={() => setIndex(i => Math.max(0, i - 1))}
            disabled={clamped === 0}
            className="disabled:opacity-30 hover:text-fg"
          >
            ←
          </button>
          <span>{clamped + 1} / {items.length}</span>
          <button
            onClick={() => setIndex(i => Math.min(items.length - 1, i + 1))}
            disabled={clamped === items.length - 1}
            className="disabled:opacity-30 hover:text-fg"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
