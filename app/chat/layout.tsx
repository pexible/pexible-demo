import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Job-Makler Chat',
  robots: {
    index: false,
    follow: false,
  },
}

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
