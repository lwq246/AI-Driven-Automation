import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to login — the dashboard layout will handle auth checking
  redirect('/login');
}
