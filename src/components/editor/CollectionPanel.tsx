'use client';

import { useEffect, useState } from 'react';
import type { SectionConfig } from '@/lib/sections';
import {
  createCollectionRecord,
  updateCollectionRecord,
  deleteCollectionRecord,
  replaceSection,
} from '@/app/edit/actions';
import { SectionPanel } from './SectionPanel';
import { RecordCard } from './RecordCard';
import { RecordForm } from './RecordForm';

interface RecordEntry {
  rkey: string;
  value: Record<string, unknown>;
}

interface Props {
  section: SectionConfig;
  serverRecords: RecordEntry[];
  imported?: Record<string, unknown>[];  // raw values from JSON Resume, no rkeys
  onClearImport?: () => void;
}

export function CollectionPanel({ section, serverRecords, imported, onClearImport }: Props) {
  const [records, setRecords] = useState<RecordEntry[]>(serverRecords);
  const [editingRkey, setEditingRkey] = useState<string | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [busy, setBusy] = useState(false);

  const isDirty = imported !== undefined;

  // Apply imported data when it arrives
  useEffect(() => {
    if (imported !== undefined) {
      setEditingRkey(null);
      setAddingNew(false);
    }
  }, [imported]);

  function refresh() {
    setRecords(serverRecords);
    setEditingRkey(null);
    setAddingNew(false);
    onClearImport?.();
  }

  async function handleSaveSection() {
    if (!imported) return;
    setBusy(true);
    try {
      const newRecords = await replaceSection(section.nsid, imported);
      setRecords(newRecords);
      onClearImport?.();
    } finally {
      setBusy(false);
    }
  }

  function openAdd()         { setAddingNew(true);  setEditingRkey(null); }
  function openEdit(rkey: string) { setEditingRkey(rkey); setAddingNew(false); }
  function cancelAll()       { setEditingRkey(null); setAddingNew(false); }

  async function handleCreate(fields: Record<string, unknown>) {
    setBusy(true);
    try {
      const rkey = await createCollectionRecord(section.nsid, fields);
      setRecords(prev => [...prev, { rkey, value: fields }]);
      setAddingNew(false);
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(rkey: string, fields: Record<string, unknown>) {
    setBusy(true);
    try {
      await updateCollectionRecord(section.nsid, rkey, fields);
      setRecords(prev => prev.map(r => r.rkey === rkey ? { rkey, value: fields } : r));
      setEditingRkey(null);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(rkey: string) {
    if (!confirm('Delete this entry?')) return;
    setBusy(true);
    try {
      await deleteCollectionRecord(section.nsid, rkey);
      setRecords(prev => prev.filter(r => r.rkey !== rkey));
      if (editingRkey === rkey) setEditingRkey(null);
    } finally {
      setBusy(false);
    }
  }

  // How many items to show in the count badge
  const displayCount = isDirty ? imported!.length : records.length;

  return (
    <SectionPanel title={section.label} count={displayCount} isDirty={isDirty} onRefresh={refresh}>
      <div className="space-y-2">

        {/* ── Import preview mode ── */}
        {isDirty && (
          <>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 mb-3">
              Imported data — save to replace your current entries, or ↺ to discard.
            </div>

            {imported!.length === 0 && (
              <p className="text-sm text-gray-400 italic">No entries in import.</p>
            )}

            {imported!.map((item, i) => (
              <ImportPreviewCard key={i} section={section} value={item} />
            ))}

            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveSection}
                disabled={busy}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {busy ? 'Saving…' : `Save ${imported!.length} ${imported!.length === 1 ? 'entry' : 'entries'}`}
              </button>
              <button
                onClick={refresh}
                disabled={busy}
                className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-raised disabled:opacity-60"
              >
                Discard
              </button>
            </div>
          </>
        )}

        {/* ── Normal edit mode ── */}
        {!isDirty && (
          <>
            {records.map(r =>
              editingRkey === r.rkey ? (
                <RecordForm
                  key={r.rkey}
                  section={section}
                  defaultValue={r.value}
                  onSave={fields => handleUpdate(r.rkey, fields)}
                  onCancel={cancelAll}
                />
              ) : (
                <RecordCard
                  key={r.rkey}
                  section={section}
                  record={r}
                  onEdit={() => openEdit(r.rkey)}
                  onDelete={() => handleDelete(r.rkey)}
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

// Read-only card shown during import preview
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
