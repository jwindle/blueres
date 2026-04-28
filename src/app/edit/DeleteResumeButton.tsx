'use client';

interface Props {
  action: () => Promise<void>;
}

export function DeleteResumeButton({ action }: Props) {
  return (
    <form action={action} className="flex">
      <button
        type="submit"
        onClick={e => { if (!confirm('Delete this resume?')) e.preventDefault(); }}
        className="text-xs px-2 py-0.5 rounded border border-line text-red-500"
      >
        Delete
      </button>
    </form>
  );
}
