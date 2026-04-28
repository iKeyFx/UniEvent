import { redirect } from 'next/navigation'

// Root "/" redirects straight into the auth group
export default function RootPage() {
  redirect('/login')
}
