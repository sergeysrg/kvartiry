import { listSites } from '@/app/lib/quiz';
import { AdminDashboard } from './components/AdminDashboard';

export default async function AdminPage() {
  const sites = await listSites();
  return (
    <AdminDashboard
      sites={sites.map((s) => ({ slug: s.slug, name: s.name }))}
    />
  );
}
