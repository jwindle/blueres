'use client';

interface Props {
  action: () => Promise<void>;
}

export function DeleteResumeButton({ action }: Props) {
  return (
    <form action={action}>
      <button
        type="submit"
        onClick={e => { if (!confirm('Delete this resume?')) e.preventDefault(); }}
        className="text-sm text-red-500 hover:underline"
      >
        Delete
      </button>
    </form>
  );
}
