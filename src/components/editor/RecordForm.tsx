'use client';

import { useEffect, useRef, useState } from 'react';
import type { SectionConfig, Field } from '@/lib/sections';

interface Props {
  section: SectionConfig;
  defaultValue?: Record<string, unknown>;
  onSave: (fields: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export function RecordForm({ section, defaultValue, onSave, onCancel }: Props) {
  const [status, setStatus] = useState<'idle' | 'saving'>('idle');
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fields = buildFields(section.fields, fd);
    setStatus('saving');
    try {
      await onSave(fields);
    } catch {
      setStatus('idle');
    }
  }

  const inputClass = 'w-full rounded-lg border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <form
      ref={formRef}
      key={defaultValue ? JSON.stringify(defaultValue) : 'new'}
      onSubmit={handleSubmit}
      className="rounded-lg border border-blue-200 bg-blue-50/40 px-4 py-4 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        {section.fields.map(f => (
          <FieldInput
            key={f.key}
            field={f}
            defaultValue={defaultValue?.[f.key]}
            inputClass={inputClass}
          />
        ))}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-line bg-surface px-4 py-1.5 text-sm font-medium hover:bg-raised"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={status === 'saving'}
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {status === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

function FieldInput({
  field,
  defaultValue,
  inputClass,
}: {
  field: Field;
  defaultValue: unknown;
  inputClass: string;
}) {
  const labelClass = 'block text-sm font-medium mb-1';
  const isWide = field.type === 'textarea' || field.type === 'array-lines' || field.type === 'did';

  const input = (() => {
    if (field.type === 'did') {
      return (
        <div>
          <label className={labelClass}>{field.label}</label>
          <DidInput field={field} defaultValue={defaultValue as string | undefined} inputClass={inputClass} />
        </div>
      );
    }
    if (field.type === 'array-lines') {
      const items = Array.isArray(defaultValue) ? (defaultValue as string[]) : [];
      const text = items.length > 0 ? items.map(s => `- ${s}`).join('\n') : '';
      return (
        <div>
          <label className={labelClass}>{field.label}</label>
          {field.description && <p className="text-xs text-gray-400 mb-1">{field.description}</p>}
          <textarea name={field.key} rows={field.rows ?? 3} defaultValue={text} placeholder={field.placeholder} className={inputClass} />
        </div>
      );
    }
    if (field.type === 'textarea') {
      return (
        <div>
          <label className={labelClass}>{field.label}</label>
          <textarea name={field.key} rows={field.rows ?? 3} defaultValue={defaultValue as string} placeholder={field.placeholder} className={inputClass} />
        </div>
      );
    }
    const type = field.type === 'url' ? 'url' : field.type === 'email' ? 'email' : 'text';
    return (
      <div>
        <label className={labelClass}>{field.label}</label>
        <input name={field.key} type={type} defaultValue={defaultValue as string} placeholder={field.placeholder} className={inputClass} />
      </div>
    );
  })();

  return isWide ? <div className="col-span-2">{input}</div> : input;
}

function DidInput({
  field,
  defaultValue,
  inputClass,
}: {
  field: Field;
  defaultValue: string | undefined;
  inputClass: string;
}) {
  // Display value: what the user sees (handle form, e.g. @mit.edu)
  const [display, setDisplay] = useState('');
  // Resolved DID: what gets submitted
  const [resolvedDid, setResolvedDid] = useState(defaultValue ?? '');
  const [resolveStatus, setResolveStatus] = useState<'idle' | 'resolving' | 'ok' | 'error'>('idle');

  // On mount: if we have a stored DID, reverse-resolve it to a handle for display
  useEffect(() => {
    if (!defaultValue) return;
    if (!defaultValue.startsWith('did:')) {
      setDisplay(defaultValue);
      return;
    }
    setResolvedDid(defaultValue);
    fetch(`https://bsky.social/xrpc/com.atproto.repo.describeRepo?repo=${encodeURIComponent(defaultValue)}`)
      .then(r => r.json())
      .then(d => { if (d.handle) setDisplay('@' + d.handle); })
      .catch(() => { setDisplay(defaultValue); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleBlur() {
    const val = display.trim().replace(/^@/, '');
    if (!val) {
      setResolvedDid('');
      setResolveStatus('idle');
      return;
    }
    if (val.startsWith('did:')) {
      setResolvedDid(val);
      setResolveStatus('ok');
      return;
    }
    setResolveStatus('resolving');
    try {
      const res = await fetch(`https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(val)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResolvedDid(data.did);
      setResolveStatus('ok');
    } catch {
      setResolveStatus('error');
    }
  }

  return (
    <>
      <input
        type="text"
        value={display}
        onChange={e => { setDisplay(e.target.value); setResolveStatus('idle'); }}
        onBlur={handleBlur}
        placeholder={field.placeholder}
        className={inputClass}
      />
      <input type="hidden" name={field.key} value={resolvedDid} />
      {resolveStatus === 'resolving' && (
        <p className="text-xs text-gray-400 mt-1">Resolving…</p>
      )}
      {resolveStatus === 'ok' && resolvedDid && (
        <p className="text-xs text-green-600 mt-1">✓ {resolvedDid}</p>
      )}
      {resolveStatus === 'error' && (
        <p className="text-xs text-red-500 mt-1">Handle not found</p>
      )}
    </>
  );
}

function buildFields(fields: Field[], fd: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const f of fields) {
    const raw = fd.get(f.key) as string | null;
    if (!raw?.trim()) continue;
    if (f.type === 'array-lines') {
      const items: string[] = [];
      const lines = raw.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ')) {
          items.push(trimmed.slice(2).trim());
        }
      }
      if (items.length) result[f.key] = items;
    } else {
      result[f.key] = raw.trim();
    }
  }
  return result;
}
