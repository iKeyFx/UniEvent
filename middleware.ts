import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROUTES } from '@/lib/constants'

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const isAuthPath = req.nextUrl.pathname.startsWith(ROUTES.login)

  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user && !isAuthPath) {
      return NextResponse.redirect(new URL(ROUTES.login, req.url))
    }
    if (user && isAuthPath) {
      return NextResponse.redirect(new URL(ROUTES.browse, req.url))
    }
  } catch {
    if (!isAuthPath) {
      return NextResponse.redirect(new URL(ROUTES.login, req.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|favicon\\.svg).*)'],
}
