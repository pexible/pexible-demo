import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/chat/', '/login', '/register', '/upload'],
      },
    ],
    sitemap: 'https://pexible.de/sitemap.xml',
  }
}
