import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — MUST be called to keep session alive
  const { data: { user } } = await supabase.auth.getUser()

  // Redirect unauthenticated users on protected routes
  const pathname = request.nextUrl.pathname
  const isProtected =
    pathname.startsWith('/mein-pex') ||              // unified dashboard requires auth
    pathname.match(/^\/chat\/.+/) ||                 // /chat/{id} but NOT /chat
    pathname.startsWith('/upload') ||
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/api/conversations') ||
    pathname.startsWith('/cv-check/result') ||       // viewing past results requires auth
    pathname.startsWith('/cv-check/optimize') ||     // optimization page requires auth
    pathname.startsWith('/api/cv-check/results') ||  // results API requires auth
    pathname.startsWith('/api/cv-check/download') || // downloads require auth
    pathname.startsWith('/api/cv-check/optimize') || // optimization API requires auth
    pathname.startsWith('/api/cv-check/create-checkout') // checkout requires auth

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    const returnPath = request.nextUrl.pathname + request.nextUrl.search
    url.pathname = '/login'
    url.search = `?redirect=${encodeURIComponent(returnPath)}`
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/mein-pex/:path*', '/chat/:path+', '/upload/:path*', '/api/upload/:path*', '/api/conversations/:path*', '/cv-check/result/:path*', '/cv-check/optimize/:path*', '/api/cv-check/results/:path*', '/api/cv-check/download/:path*', '/api/cv-check/optimize/:path*', '/api/cv-check/create-checkout/:path*'],
}
