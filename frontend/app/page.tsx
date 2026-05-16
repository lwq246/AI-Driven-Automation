import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the dashboard feed by default for this hackathon demo
  redirect('/feed');
}
