import { createServerClient } from '@supabase/ssr'
import { NextResponse,type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => request.cookies.get(name)?.value } }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 1. If trying to access /staff, check if they are actually STAFF
  if (request.nextUrl.pathname.startsWith('/staff')) {
    if (!user) return NextResponse.redirect(new URL('/login', request.url))

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
console.log(user.id);
console.log(profile?.role);
    // if (profile?.role !== 'STAFF') {
    //   return NextResponse.redirect(new URL('/', request.url)) // Send students back to home
    // }
  }

  return response
}

export const config = {
  matcher: ['/staff/:path*', '/checkout/:path*'],
}