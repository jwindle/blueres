'use client';

import { useRef, useState } from 'react';
import type { ResumeData } from '@/lib/types';

interface Props {
  onImport: (data: Partial<ResumeData>) => void;
}

type Step = 'closed' | 'input' | 'confirm';

const SECTION_LABELS: [keyof ResumeData, string][] = [
  ['basics',       'Basics'],
  ['work',         'Work experience'],
  ['education',    'Education'],
  ['volunteer',    'Volunteer'],
  ['awards',       'Awards'],
  ['certificates', 'Certificates'],
  ['publications', 'Publications'],
  ['skills',       'Skills'],
  ['languages',    'Languages'],
  ['interests',    'Interests'],
  ['references',   'References'],
  ['projects',     'Projects'],
];

function summarise(data: Partial<ResumeData>): string[] {
  return SECTION_LABELS.flatMap(([key, label]) => {
    const val = data[key];
    if (!val) return [];
    if (Array.isArray(val)) return val.length > 0 ? [`${val.length} ${label.toLowerCase()}`] : [];
    return [label];
  });
}

export function ImportPanel({ onImport }: Props) {
  const [step, setStep] = useState<Step>('closed');
  const [parsed, setParsed] = useState<Partial<ResumeData> | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function parse(text: string) {
    try {
      const data = JSON.parse(text);
      const knownKeys = ['basics','work','education','volunteer','awards',
        'certificates','publications','skills','languages','interests','references','projects'];
      const hasAny = knownKeys.some(k => k in data);
      if (!hasAny) throw new Error('Does not look like a JSON Resume file.');
      setParsed(data);
      setParseError(null);
      setStep('confirm');
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON.');
      setParsed(null);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => parse(reader.result as string);
    reader.readAsText(file);
  }

  function handlePaste(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const text = e.target.value.trim();
    if (!text) { setParsed(null); setParseError(null); return; }
    parse(text);
  }

  function handleConfirm() {
    if (!parsed) return;
    onImport(parsed);
    reset();
  }

  function reset() {
    setStep('closed');
    setParsed(null);
    setParseError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  const summary = parsed ? summarise(parsed) : [];

  if (step === 'closed') {
    return (
      <button
        onClick={() => setStep('input')}
        className="text-sm text-gray-500 hover:text-gray-800 underline underline-offset-2"
      >
        Import JSON Resume
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-surface px-5 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Import JSON Resume</h2>
        <button onClick={reset} className="text-fg-muted hover:text-fg text-lg leading-none">×</button>
      </div>

      {/* Step: input */}
      {step === 'input' && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Upload a file</label>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFile}
              className="block text-sm text-gray-500 file:mr-3 file:rounded-lg file:border file:border-gray-300 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-gray-50"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-fg-muted">
            <div className="flex-1 border-t border-line" /> or paste JSON below <div className="flex-1 border-t border-line" />
          </div>
          <textarea
            rows={6}
            placeholder='{ "basics": { "name": "..." }, "work": [...] }'
            onChange={handlePaste}
            className="w-full rounded-lg border border-line-strong px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {parseError && <p className="text-sm text-red-600">{parseError}</p>}
        </div>
      )}

      {/* Step: confirm */}
      {step === 'confirm' && parsed && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Found in file:</p>
            <ul className="space-y-1">
              {summary.map(s => (
                <li key={s} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-500">
            Each section will show a preview — you can save or discard them individually.
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Preview import
            </button>
            <button
              onClick={reset}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-raised"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
