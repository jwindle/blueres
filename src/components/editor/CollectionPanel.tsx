'use client';

import { useEffect, useState } from 'react';
import type { SectionConfig } from '@/lib/sections';
import { SectionPanel } from './SectionPanel';
import { RecordCard } from './RecordCard';
import { RecordForm } from './RecordForm';

interface Props {
  section: SectionConfig;
  items: Record<string, unknown>[];
  onSave: (items: Record<string, unknown>[]) => Promise<void>;
  imported?: Record<string, unknown>[];
  onClearImport?: () => void;
}

export function CollectionPanel({ section, items: serverItems, onSave, imported, onClearImport }: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>(serverItems);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [busy, setBusy] = useState(false); // tracks in-flight saves for normal edit mode

  const isDirty = imported !== undefined;

  useEffect(() => {
    if (imported !== undefined) {
      setEditingIndex(null);
      setAddingNew(false);
    }
  }, [imported]);

  function refresh() {
    setItems(serverItems);
    setEditingIndex(null);
    setAddingNew(false);
    onClearImport?.();
  }

  async function handleSaveSection() {
    if (!imported) return;
    setBusy(true);
    try {
      await onSave(imported);
      setItems(imported);
      onClearImport?.();
    } finally {
      setBusy(false);
    }
  }

  function openAdd()             { setAddingNew(true);  setEditingIndex(null); }
  function openEdit(i: number)   { setEditingIndex(i);  setAddingNew(false); }
  function cancelAll()           { setEditingIndex(null); setAddingNew(false); }

  async function handleCreate(fields: Record<string, unknown>) {
    setBusy(true);
    try {
      const next = [...items, fields];
      await onSave(next);
      setItems(next);
      setAddingNew(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(index: number, fields: Record<string, unknown>) {
    setBusy(true);
    try {
      const next = items.map((item, i) => i === index ? fields : item);
      await onSave(next);
      setItems(next);
      setEditingIndex(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(index: number) {
    if (!confirm('Delete this entry?')) return;
    setBusy(true);
    try {
      const next = items.filter((_, i) => i !== index);
      await onSave(next);
      setItems(next);
      if (editingIndex === index) setEditingIndex(null);
    } finally {
      setBusy(false);
    }
  }

  const displayCount = isDirty ? imported!.length : items.length;

  return (
    <SectionPanel title={section.label} count={displayCount} isDirty={isDirty} onRefresh={refresh}>
      <div className="space-y-2">

        {/* ── Import preview mode ── */}
        {isDirty && (
          <>
            {imported!.length === 0 && (
              <p className="text-sm text-gray-400 italic">No entries in import.</p>
            )}
            {imported!.map((item, i) => (
              <ImportPreviewCard key={i} section={section} value={item} />
            ))}
          </>
        )}

        {/* ── Normal edit mode ── */}
        {!isDirty && (
          <>
            {items.map((item, i) =>
              editingIndex === i ? (
                <RecordForm
                  key={i}
                  section={section}
                  defaultValue={item}
                  onSave={fields => handleUpdate(i, fields)}
                  onCancel={cancelAll}
                />
              ) : (
                <RecordCard
                  key={i}
                  section={section}
                  value={item}
                  onEdit={() => openEdit(i)}
                  onDelete={() => handleDelete(i)}
                  disabled={busy}
                />
              ),
            )}

            {addingNew && (
              <RecordForm section={section} onSave={handleCreate} onCancel={cancelAll} />
            )}

            {!addingNew && (
              <button
                type="button"
                onClick={openAdd}
                disabled={busy}
                className="mt-1 inline-block rounded-lg border border-dashed border-line-strong px-4 py-2 text-sm text-fg-muted hover:border-blue-400 hover:text-blue-600 disabled:opacity-40"
              >
                + Add entry
              </button>
            )}
          </>
        )}
      </div>
    </SectionPanel>
  );
}

function ImportPreviewCard({ section, value }: { section: SectionConfig; value: Record<string, unknown> }) {
  const title    = (value[section.titleField] as string)    || '(untitled)';
  const subtitle = section.subtitleField ? (value[section.subtitleField] as string) : undefined;
  const start    = value.startDate as string | undefined;
  const end      = value.endDate   as string | undefined;
  const date     = value.date      as string | undefined;

  return (
    <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3">
      <div className="min-w-0">
        <div className="font-medium truncate">{title}</div>
        <div className="flex gap-3 text-xs text-amber-700/70 mt-0.5">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {(start || end) && <span className="shrink-0">{start ?? ''}{(start || end) ? ' – ' : ''}{end ?? 'Present'}</span>}
          {date && <span className="shrink-0">{date}</span>}
        </div>
      </div>
    </div>
  );
}
