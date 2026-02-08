import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/jobs/', '/login', '/register', '/upload'],
      },
    ],
    sitemap: 'https://pexible.de/sitemap.xml',
  }
}
