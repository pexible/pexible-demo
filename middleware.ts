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
    pathname.match(/^\/chat\/.+/) ||   // /chat/{id} but NOT /chat
    pathname.startsWith('/upload') ||
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/api/conversations')

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/chat/:path+', '/upload/:path*', '/api/upload/:path*', '/api/conversations/:path*'],
}
