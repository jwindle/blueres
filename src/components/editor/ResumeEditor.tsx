'use client';

import { useState } from 'react';
import type { Basics, ResumeData, Meta } from '@/lib/types';
import { SECTIONS } from '@/lib/sections';
import { saveResume } from '@/app/edit/actions';
import { BasicsPanel } from './BasicsPanel';
import { CollectionPanel } from './CollectionPanel';
import { ImportPanel } from './ImportPanel';

interface Props {
  rkey: string;
  resume: ResumeData;
  handle: string;
}

const COLLECTION_KEYS = [
  'work', 'education', 'volunteer', 'awards', 'certificates',
  'publications', 'skills', 'languages', 'interests', 'references', 'projects',
] as const;

export function ResumeEditor({ rkey, resume: initialResume, handle }: Props) {
  const [resume, setResume] = useState(initialResume);
  const [title, setTitle] = useState(initialResume.meta?.title ?? '');
  const [importedData, setImportedData] = useState<Partial<ResumeData> | null>(null);
  const [applying, setApplying] = useState(false);

  async function persist(updated: ResumeData) {
    await saveResume(rkey, updated);
  }

  async function updateBasics(basics: Basics) {
    const next = { ...resume, basics };
    setResume(next);
    await persist(next);
  }

  async function updateSection(slug: string, items: Record<string, unknown>[]) {
    const next = { ...resume, [slug]: items };
    setResume(next);
    await persist(next);
  }

  async function handleTitleBlur() {
    const trimmed = title.trim();
    const meta: Meta = { ...resume.meta, title: trimmed || undefined };
    const next = { ...resume, meta };
    setResume(next);
    await persist(next);
  }

  function clearSection(slug: string) {
    if (!importedData) return;
    const next = { ...importedData };
    delete (next as Record<string, unknown>)[slug];
    setImportedData(Object.keys(next).length ? next : null);
  }

  function clearBasics() {
    if (!importedData) return;
    const { basics: _b, ...rest } = importedData;
    void _b;
    setImportedData(Object.keys(rest).length ? rest : null);
  }

  async function applyImport() {
    if (!importedData) return;
    setApplying(true);
    try {
      const next = { ...resume };
      if (importedData.basics !== undefined) next.basics = importedData.basics;
      if (importedData.meta !== undefined) {
        next.meta = { ...importedData.meta };
        setTitle(importedData.meta.title ?? '');
      }
      for (const key of COLLECTION_KEYS) {
        if (importedData[key] !== undefined) {
          (next as Record<string, unknown>)[key] = importedData[key];
        }
      }
      setResume(next);
      setImportedData(null);
      await persist(next);
    } finally {
      setApplying(false);
    }
  }

  const importSummary = importedData ? buildSummary(importedData) : '';

  const inp = 'rounded-lg border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-3">
      {/* Resume title */}
      <div className="rounded-xl border border-line bg-surface px-5 py-4">
        <label className="block text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">
          Resume Title
        </label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="e.g. Software Engineer Resume"
          className={`w-full ${inp}`}
        />
        <p className="mt-1 text-xs text-gray-400">
          Used to distinguish this resume from others. Not shown on the public view.
        </p>
      </div>

      <ImportPanel onImport={setImportedData} />

      {/* Global import action bar */}
      {importedData && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="font-semibold text-amber-800 mb-1">Import ready to apply</p>
          <p className="text-sm text-amber-700 mb-3">
            {importSummary}. Sections marked ↺ will be excluded. Applying replaces those sections in your resume and saves once.
          </p>
          <div className="flex gap-2">
            <button
              onClick={applyImport}
              disabled={applying}
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              {applying ? 'Applying…' : 'Apply import'}
            </button>
            <button
              onClick={() => setImportedData(null)}
              disabled={applying}
              className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-60"
            >
              Discard all
            </button>
          </div>
        </div>
      )}

      <BasicsPanel
        data={resume.basics ?? null}
        onSave={updateBasics}
        imported={importedData?.basics ?? undefined}
        onClearImport={clearBasics}
        handle={handle}
      />

      {SECTIONS.map(section => {
        const raw = (resume as Record<string, unknown>)[section.slug];
        const items = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
        const imported = (importedData as Record<string, unknown> | null)?.[section.slug];
        return (
          <CollectionPanel
            key={section.slug}
            section={section}
            items={items}
            onSave={newItems => updateSection(section.slug, newItems)}
            imported={Array.isArray(imported) ? (imported as Record<string, unknown>[]) : undefined}
            onClearImport={() => clearSection(section.slug)}
          />
        );
      })}
    </div>
  );
}

function buildSummary(data: Partial<ResumeData>): string {
  const parts: string[] = [];
  if (data.meta?.title) parts.push(`title "${data.meta.title}"`);
  if (data.basics) parts.push('Basics');
  const labels: Record<string, string> = {
    work: 'work', education: 'education', volunteer: 'volunteer',
    awards: 'awards', certificates: 'certificates', publications: 'publications',
    skills: 'skills', languages: 'languages', interests: 'interests',
    references: 'references', projects: 'projects',
  };
  for (const key of COLLECTION_KEYS) {
    const arr = data[key];
    if (Array.isArray(arr) && arr.length > 0) {
      parts.push(`${arr.length} ${labels[key]}`);
    }
  }
  return parts.length ? `Found: ${parts.join(', ')}` : 'Nothing to import';
}
