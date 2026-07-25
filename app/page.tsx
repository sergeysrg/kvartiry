import { redirect } from 'next/navigation';
import { getDefaultSlug } from '@/app/lib/quiz';

// Корень «/» ведёт на площадку по умолчанию.
export default async function RootPage() {
  const slug = await getDefaultSlug();
  redirect(`/${slug}`);
}
