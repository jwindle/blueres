'use client';

import { useState } from 'react';

interface Props {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  isDirty?: boolean;
  onRefresh?: () => void;
  children: React.ReactNode;
}

export function SectionPanel({ title, count, defaultOpen = true, isDirty, onRefresh, children }: Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl border bg-surface overflow-hidden transition-colors ${isDirty ? 'border-amber-300' : 'border-line'}`}>
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-raised transition-colors"
      >
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" title="Unsaved changes" />
          )}
          <span className="font-semibold">{title}</span>
          {count !== undefined && (
            <span className="rounded-full bg-raised px-2 py-0.5 text-xs text-fg-muted">
              {count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isDirty && onRefresh && (
            <span
              role="button"
              title="Discard unsaved changes"
              onClick={e => { e.stopPropagation(); onRefresh(); }}
              className="text-amber-500 hover:text-amber-700 text-base select-none px-1"
            >
              ↺
            </span>
          )}
          <span className="text-fg-muted text-xs">{isOpen ? '▲' : '▼'}</span>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-line px-5 py-4">
          {children}
        </div>
      )}
    </div>
  );
}
