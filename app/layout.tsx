import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'pexible - Dein persönlicher KI Job-Makler',
  description: 'Finde Jobs, die andere nicht sehen. Unser KI-Makler durchsucht tausende Karriereseiten direkt und findet versteckte Stellen für dich.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
