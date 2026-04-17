'use client';

import { useEffect, useState } from 'react';
import type { Basics, Profile } from '@/lib/types';
import { saveBasics } from '@/app/edit/actions';
import { SectionPanel } from './SectionPanel';

const inp = 'w-full rounded-lg border border-line-strong px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
const lbl = 'block text-sm font-medium mb-1';

const SENSITIVE_FIELDS = [
  { key: 'email',       label: 'Email' },
  { key: 'phone',       label: 'Phone' },
  { key: 'loc.address', label: 'Street address' },
];

interface Props {
  serverData: Basics | null;
  imported?: Basics;
  onClearImport?: () => void;
}

export function BasicsPanel({ serverData, imported, onClearImport }: Props) {
  // formKey forces the form to remount (resetting defaultValues) on import or refresh
  const [formKey, setFormKey] = useState(0);
  const [defaults, setDefaults] = useState<Basics | null>(serverData);
  const [profiles, setProfiles] = useState<Profile[]>(serverData?.profiles ?? []);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [pending, setPending] = useState<Basics | null>(null);

  const isDirty = imported !== undefined;

  // Apply imported data when it arrives
  useEffect(() => {
    if (imported !== undefined) {
      setDefaults(imported);
      setProfiles(imported?.profiles ?? []);
      setFormKey(k => k + 1);
    }
  }, [imported]);

  function refresh() {
    setDefaults(serverData);
    setProfiles(serverData?.profiles ?? []);
    setFormKey(k => k + 1);
    onClearImport?.();
  }

  function addProfile()    { setProfiles(p => [...p, {}]); }
  function removeProfile(i: number) { setProfiles(p => p.filter((_, idx) => idx !== i)); }
  function updateProfile(i: number, key: keyof Profile, value: string) {
    setProfiles(p => p.map((pr, idx) => idx === i ? { ...pr, [key]: value || undefined } : pr));
  }

  function collectData(fd: FormData): Basics {
    const get = (k: string) => (fd.get(k) as string)?.trim() || undefined;
    return {
      name:    get('name'),
      label:   get('label'),
      image:   get('image'),
      email:   get('email'),
      phone:   get('phone'),
      url:     get('url'),
      summary: get('summary'),
      location: {
        address:     get('loc.address'),
        postalCode:  get('loc.postalCode'),
        city:        get('loc.city'),
        countryCode: get('loc.countryCode'),
        region:      get('loc.region'),
      },
      profiles: profiles.filter(p => p.network || p.username || p.url),
    };
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = collectData(new FormData(e.currentTarget));
    const fd = new FormData(e.currentTarget);
    const sensitiveLabels = SENSITIVE_FIELDS
      .filter(f => (fd.get(f.key) as string)?.trim())
      .map(f => f.label);

    if (sensitiveLabels.length > 0) {
      setPending(data);
    } else {
      doSave(data);
    }
  }

  async function doSave(data: Basics) {
    setPending(null);
    setStatus('saving');
    try {
      await saveBasics(data);
      onClearImport?.();
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  }

  const filledSensitiveLabels = pending
    ? SENSITIVE_FIELDS.filter(f => {
        if (f.key === 'loc.address') return !!pending.location?.address;
        return !!(pending as Record<string, unknown>)[f.key];
      }).map(f => f.label)
    : [];

  return (
    <SectionPanel title="Basics" isDirty={isDirty} onRefresh={refresh}>

      {/* Sensitive-data confirmation */}
      {pending && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
          <p className="font-semibold text-amber-800 mb-1">Heads up — this data will be publicly visible</p>
          <p className="text-amber-700 mb-3">
            Your BlueRes record is stored on your public Bluesky PDS. Anyone can read it.
            You&apos;ve filled in: <strong>{filledSensitiveLabels.join(', ')}</strong>.
          </p>
          <div className="flex gap-2">
            <button onClick={() => doSave(pending)} className="rounded-lg bg-amber-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-amber-700">
              Save anyway
            </button>
            <button onClick={() => setPending(null)} className="rounded-lg border border-amber-200 bg-white px-4 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-50">
              Go back
            </button>
          </div>
        </div>
      )}

      {isDirty && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Imported data — review and save, or ↺ to discard.
        </div>
      )}

      <form key={formKey} onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <F label="Full Name"><input name="name" type="text" defaultValue={defaults?.name} placeholder="Jane Smith" className={inp} /></F>
          <F label="Label"><input name="label" type="text" defaultValue={defaults?.label} placeholder="e.g. Software Engineer" className={inp} /></F>
          <F label="Email"><input name="email" type="email" defaultValue={defaults?.email} placeholder="jane@example.com" className={inp} /></F>
          <F label="Phone"><input name="phone" type="text" defaultValue={defaults?.phone} placeholder="712-117-2923" className={inp} /></F>
          <F label="Website"><input name="url" type="url" defaultValue={defaults?.url} placeholder="https://" className={inp} /></F>
          <F label="Photo URL"><input name="image" type="url" defaultValue={defaults?.image} placeholder="https://" className={inp} /></F>
          <div className="col-span-2">
            <F label="Summary"><textarea name="summary" rows={3} defaultValue={defaults?.summary} placeholder="A short bio about yourself" className={inp} /></F>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-2">Location</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><input name="loc.address" type="text" defaultValue={defaults?.location?.address} placeholder="Address" className={inp} /></div>
            <input name="loc.city" type="text" defaultValue={defaults?.location?.city} placeholder="City" className={inp} />
            <input name="loc.region" type="text" defaultValue={defaults?.location?.region} placeholder="State / Region" className={inp} />
            <input name="loc.postalCode" type="text" defaultValue={defaults?.location?.postalCode} placeholder="Postal Code" className={inp} />
            <input name="loc.countryCode" type="text" defaultValue={defaults?.location?.countryCode} placeholder="Country Code (e.g. US)" maxLength={2} className={inp} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Social Profiles</p>
            <button type="button" onClick={addProfile} className="text-xs text-blue-600 hover:underline">+ Add</button>
          </div>
          {profiles.length === 0 && <p className="text-xs text-gray-400 italic">None added.</p>}
          <div className="space-y-2">
            {profiles.map((p, i) => (
              <div key={i} className="grid grid-cols-3 gap-2 items-center">
                <input type="text" value={p.network ?? ''} onChange={e => updateProfile(i, 'network', e.target.value)} placeholder="Network" className={inp} />
                <input type="text" value={p.username ?? ''} onChange={e => updateProfile(i, 'username', e.target.value)} placeholder="Username" className={inp} />
                <div className="flex gap-1">
                  <input type="url" value={p.url ?? ''} onChange={e => updateProfile(i, 'url', e.target.value)} placeholder="https://" className={`${inp} flex-1`} />
                  <button type="button" onClick={() => removeProfile(i)} className="text-gray-400 hover:text-red-500 px-1 text-lg leading-none">×</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={status === 'saving' || !!pending}
            className={`rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60
              ${status === 'saved' ? 'bg-green-600' : status === 'error' ? 'bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved ✓' : status === 'error' ? 'Error — try again' : 'Save'}
          </button>
        </div>
      </form>
    </SectionPanel>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={lbl}>{label}</label>{children}</div>;
}
