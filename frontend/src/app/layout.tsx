import type {Metadata} from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'A/B Testing Demo — Sanity + GrowthBook',
  description: 'End-to-end A/B testing with Sanity, GrowthBook, and Next.js',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        {children}
      </body>
    </html>
  )
}
