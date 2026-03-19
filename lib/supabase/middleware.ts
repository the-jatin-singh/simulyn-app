import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
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
  })

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthRoute = 
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/signup') || 
    request.nextUrl.pathname.startsWith('/forgot-password') || 
    request.nextUrl.pathname.startsWith('/auth');
  const isUpdatePasswordRoute = request.nextUrl.pathname.startsWith('/update-password');
  const isApiMockRoute = request.nextUrl.pathname.startsWith('/api/mock');
  const publicPaths = ['/', '/terms', '/privacy', '/docs']
  const isPublicRoute = publicPaths.some(p => request.nextUrl.pathname === p || request.nextUrl.pathname.startsWith(p + '/'));
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  if (!user && !isAuthRoute && !isUpdatePasswordRoute && !isApiMockRoute && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && (isAuthRoute || isPublicRoute)) {
      const url = request.nextUrl.clone() 
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
  }

  // Guard /admin — only admin or owner roles allowed
  if (user && isAdminRoute) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || !['admin', 'owner'].includes(profile.role)) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}

