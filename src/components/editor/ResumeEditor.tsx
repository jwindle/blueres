'use client';

import { useState } from 'react';
import type { Basics } from '@/lib/types';
import type { SectionConfig } from '@/lib/sections';
import type { ResumeData } from '@/lib/types';
import { BasicsPanel } from './BasicsPanel';
import { CollectionPanel } from './CollectionPanel';
import { ImportPanel } from './ImportPanel';

interface RecordEntry {
  rkey: string;
  value: Record<string, unknown>;
}

interface SectionData {
  section: SectionConfig;
  records: RecordEntry[];
}

interface Props {
  basics: Basics | null;
  sections: SectionData[];
}

export function ResumeEditor({ basics, sections }: Props) {
  const [importedData, setImportedData] = useState<Partial<ResumeData> | null>(null);

  function clearSection(slug: string) {
    if (!importedData) return;
    const next = { ...importedData };
    delete (next as Record<string, unknown>)[slug];
    // If nothing left, clear entirely
    if (Object.keys(next).every(k => !(next as Record<string, unknown>)[k])) {
      setImportedData(null);
    } else {
      setImportedData(next);
    }
  }

  function clearBasics() {
    if (!importedData) return;
    const { basics: _b, ...rest } = importedData;
    void _b;
    const next = rest as Partial<ResumeData>;
    if (Object.keys(next).every(k => !(next as Record<string, unknown>)[k])) {
      setImportedData(null);
    } else {
      setImportedData(next);
    }
  }

  return (
    <div className="space-y-3">
      <ImportPanel onImport={setImportedData} />

      <BasicsPanel
        serverData={basics}
        imported={importedData?.basics ?? undefined}
        onClearImport={clearBasics}
      />

      {sections.map(({ section, records }) => (
        <CollectionPanel
          key={section.slug}
          section={section}
          serverRecords={records}
          imported={(importedData as Record<string, unknown> | null)?.[section.slug] as Record<string, unknown>[] | undefined}
          onClearImport={() => clearSection(section.slug)}
        />
      ))}
    </div>
  );
}
