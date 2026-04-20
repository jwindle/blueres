import type { SectionConfig } from '@/lib/sections';

interface Props {
  section: SectionConfig;
  value: Record<string, unknown>;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function RecordCard({ section, value, onEdit, onDelete, disabled }: Props) {
  const title    = (value[section.titleField] as string) || '(untitled)';
  const subtitle = section.subtitleField ? (value[section.subtitleField] as string) : undefined;
  const start    = value.startDate as string | undefined;
  const end      = value.endDate   as string | undefined;
  const date     = value.date      as string | undefined;

  return (
    <div className="flex items-center justify-between rounded-lg border border-line bg-raised px-4 py-3">
      <div className="min-w-0">
        <div className="font-medium truncate">{title}</div>
        <div className="flex gap-3 text-xs text-fg-muted mt-0.5">
          {subtitle && <span className="truncate">{subtitle}</span>}
          {(start || end) && (
            <span className="shrink-0">
              {start ?? ''}{(start || end) ? ' – ' : ''}{end ?? 'Present'}
            </span>
          )}
          {date && <span className="shrink-0">{date}</span>}
        </div>
      </div>
      <div className="flex gap-3 ml-4 shrink-0">
        <button
          onClick={onEdit}
          disabled={disabled}
          className="text-sm text-blue-600 hover:underline disabled:opacity-40"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          disabled={disabled}
          className="text-sm text-red-500 hover:underline disabled:opacity-40"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
