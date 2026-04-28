'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function HandleInput({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const [value, setValue] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const h = value.trim() || placeholder;
    if (h) router.push(`/resumes/${encodeURIComponent(h)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium text-fg-muted">Bluesky handle or DID</span>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-surface"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        View Résumés
      </button>
    </form>
  );
}
