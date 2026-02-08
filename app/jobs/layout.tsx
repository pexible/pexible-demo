import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Meine Jobsuchen | pexible',
  robots: {
    index: false,
    follow: false,
  },
}

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
