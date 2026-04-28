import type { Metadata } from 'next'
import './globals.css'
import { ToastContainer } from '@/components/ui'

export const metadata: Metadata = {
  title: 'UniEvents',
  description: 'Campus event management — browse, register, and manage university events',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
