import { Inter } from 'next/font/google'
import { Metadata } from 'next'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

const siteUrl = 'https://pexible.de'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'KI-Jobsuche: Versteckte Stellen finden | pexible',
    template: '%s | pexible',
  },
  description:
    'Finde Jobs, die auf keinem Portal stehen. Der pexible KI-Makler durchsucht tausende Karriereseiten und findet versteckte Stellen in Minuten. Kostenlos starten.',
  keywords: [
    'KI Jobsuche',
    'Versteckter Stellenmarkt',
    'Jobs finden',
    'Karriereseiten durchsuchen',
    'Jobportal Alternative',
    'Stellenangebote',
    'Job-Makler',
  ],
  authors: [{ name: 'pexible' }],
  creator: 'pexible',
  publisher: 'pexible',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: './',
  },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    url: siteUrl,
    siteName: 'pexible',
    title: 'KI-Jobsuche: Versteckte Stellen finden | pexible',
    description:
      'Finde Jobs, die auf keinem Portal stehen. Der pexible KI-Makler durchsucht tausende Karriereseiten und findet versteckte Stellen in Minuten.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'pexible - Dein persoenlicher KI Job-Makler',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KI-Jobsuche: Versteckte Stellen finden | pexible',
    description:
      'Finde Jobs, die auf keinem Portal stehen. Der pexible KI-Makler durchsucht tausende Karriereseiten und findet versteckte Stellen.',
    images: ['/og-image.png'],
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover' as const,
  themeColor: '#FDF8F0',
}

// JSON-LD structured data for Organization + WebSite
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'pexible',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description:
    'KI-gestuetzter Job-Makler, der tausende Karriereseiten durchsucht und versteckte Stellenangebote findet.',
  sameAs: [],
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'pexible',
  url: siteUrl,
  description:
    'Finde Jobs, die auf keinem Portal stehen. KI-gestuetzte Jobsuche auf tausenden Karriereseiten.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/jobs`,
    },
    'query-input': 'required name=search_term_string',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
