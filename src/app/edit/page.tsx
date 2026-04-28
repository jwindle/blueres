import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';

export default async function EditPage() {
  const session = await getSession();
  if (session.handle) redirect(`/resumes/${encodeURIComponent(session.handle)}`);
  redirect('/');
}
