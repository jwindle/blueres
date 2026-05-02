'use client';

import { useEffect, useState } from 'react';
import type { MediaAtUri } from '@/lib/types';

function parseAtUri(atUri: string) {
  const match = atUri.match(/^at:\/\/([^/]+)\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  return { did: match[1], collection: match[2], rkey: match[3] };
}

function bskyCdnUrl(did: string, cid: string) {
  return `https://cdn.bsky.app/img/feed_fullsize/plain/${did}/${cid}@jpeg`;
}

export function MediaAtUriItem({ media }: { media: MediaAtUri }) {
  const { atUri, title, caption } = media;
  const [content, setContent] = useState<React.ReactNode>(null);

  useEffect(() => {
    if (!atUri) return;
    const parsed = parseAtUri(atUri);
    if (!parsed) return;

    const { did, collection, rkey } = parsed;
    const endpoint = `https://public.api.bsky.app/xrpc/com.atproto.repo.getRecord?repo=${encodeURIComponent(did)}&collection=${encodeURIComponent(collection)}&rkey=${encodeURIComponent(rkey)}`;

    fetch(endpoint)
      .then(r => r.json())
      .then(data => {
        const embed = data?.value?.embed;
        if (!embed) return;

        const embedType: string = embed.$type ?? '';

        if (embedType.startsWith('app.bsky.embed.images')) {
          const first = embed.images?.[0];
          const cid: string | undefined = first?.image?.ref?.$link;
          if (!cid) return;
          const imgUrl = bskyCdnUrl(did, cid);
          setContent(
            <div>
              <a href={`https://bsky.app/profile/${did}/post/${rkey}`} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt={first.alt ?? caption ?? title ?? ''} className="max-h-48 rounded object-cover" />
              </a>
              {caption && <p className="mt-1 text-xs text-fg-muted text-center">{caption}</p>}
            </div>
          );
        } else if (embedType.startsWith('app.bsky.embed.video')) {
          // Bluesky video is HLS — link out to the post rather than embed
          setContent(
            <div>
              <a
                href={`https://bsky.app/profile/${did}/post/${rkey}`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-blue-600 hover:underline"
              >
                {title ?? 'View video on Bluesky'}
              </a>
              {caption && <p className="mt-1 text-xs text-fg-muted text-center">{caption}</p>}
            </div>
          );
        }
      })
      .catch(() => {
        const parsed2 = parseAtUri(atUri);
        if (!parsed2) return;
        setContent(
          <div>
            <a
              href={`https://bsky.app/profile/${parsed2.did}/post/${parsed2.rkey}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {title ?? 'View on Bluesky'}
            </a>
          </div>
        );
      });
  }, [atUri, title, caption]);

  if (!atUri) return null;
  return <>{content}</>;
}
