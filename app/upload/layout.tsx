import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Upload',
  robots: {
    index: false,
    follow: false,
  },
}

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
