'use client';

import { useState } from 'react';
import type { Media, MediaUrl, MediaAtUri } from '@/lib/types';

export function MediaListInput({ defaultValue, inputClass }: { defaultValue?: Media[]; inputClass: string }) {
  const [items, setItems] = useState<(Media | undefined)[]>(
    defaultValue?.length ? defaultValue : []
  );

  return (
    <div className="space-y-3">
      {items.map((m, i) => (
        <div key={i} className="relative rounded-lg border border-line p-3">
          <button
            type="button"
            onClick={() => setItems(prev => prev.filter((_, idx) => idx !== i))}
            className="absolute right-2 top-2 text-lg leading-none text-fg-muted hover:text-red-500"
          >
            ×
          </button>
          <MediaInput defaultValue={m} inputClass={inputClass} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems(prev => [...prev, undefined])}
        className="text-xs text-blue-600 hover:underline"
      >
        + Add media
      </button>
    </div>
  );
}

interface Props {
  defaultValue?: Media;
  inputClass: string;
}

export function MediaInput({ defaultValue, inputClass }: Props) {
  const isAtUri = defaultValue?.$type === 'org.blueres.resume.resume#mediaAtUri';
  const defUrl = defaultValue?.$type === 'org.blueres.resume.resume#mediaUrl' ? (defaultValue as MediaUrl) : undefined;
  const defAt  = defaultValue?.$type === 'org.blueres.resume.resume#mediaAtUri' ? (defaultValue as MediaAtUri) : undefined;

  const [mode, setMode]           = useState<'url' | 'atUri'>(isAtUri ? 'atUri' : 'url');
  const [url, setUrl]             = useState(defUrl?.url ?? '');
  const [mediaType, setMediaType] = useState<'image' | 'video'>(defUrl?.mediaType ?? 'image');
  const [atUri, setAtUri]         = useState(defAt?.atUri ?? '');
  const [title, setTitle]         = useState(defaultValue?.title ?? '');
  const [caption, setCaption]     = useState(defaultValue?.caption ?? '');

  const hiddenValue = (() => {
    if (mode === 'url' && url.trim()) {
      const obj: MediaUrl = {
        $type: 'org.blueres.resume.resume#mediaUrl',
        url: url.trim(),
        mediaType,
        ...(title.trim()   && { title:   title.trim() }),
        ...(caption.trim() && { caption: caption.trim() }),
      };
      return JSON.stringify(obj);
    }
    if (mode === 'atUri' && atUri.trim()) {
      const obj: MediaAtUri = {
        $type: 'org.blueres.resume.resume#mediaAtUri',
        atUri: atUri.trim(),
        ...(title.trim()   && { title:   title.trim() }),
        ...(caption.trim() && { caption: caption.trim() }),
      };
      return JSON.stringify(obj);
    }
    return '';
  })();

  const radioClass = 'flex items-center gap-1.5 cursor-pointer text-sm';

  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <label className={radioClass}>
          <input type="radio" checked={mode === 'url'} onChange={() => setMode('url')} className="accent-blue-600" />
          URL
        </label>
        <label className={radioClass}>
          <input type="radio" checked={mode === 'atUri'} onChange={() => setMode('atUri')} className="accent-blue-600" />
          Bluesky Post
        </label>
      </div>

      {mode === 'url' ? (
        <div className="space-y-2">
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
          <div className="flex gap-4">
            <label className={radioClass}>
              <input type="radio" checked={mediaType === 'image'} onChange={() => setMediaType('image')} className="accent-blue-600" />
              Image
            </label>
            <label className={radioClass}>
              <input type="radio" checked={mediaType === 'video'} onChange={() => setMediaType('video')} className="accent-blue-600" />
              Video
            </label>
          </div>
        </div>
      ) : (
        <input
          type="text"
          value={atUri}
          onChange={e => setAtUri(e.target.value)}
          placeholder="at://did:plc:.../app.bsky.feed.post/..."
          className={inputClass}
        />
      )}

      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className={inputClass}
        />
        <input
          type="text"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          placeholder="Caption (optional)"
          className={inputClass}
        />
      </div>

      <input type="hidden" name="media" value={hiddenValue} />
    </div>
  );
}
