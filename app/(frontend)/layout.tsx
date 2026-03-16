import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Bosco Choice',
  description: 'Вікторина — вибери категорію та відповідай на питання',
  icons: {
    icon: '/icon_bosco.png',
    apple: '/icon_bosco.png',
  },
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body className={`${inter.variable} font-sans antialiased`}>{children}</body>
    </html>
  )
}
