import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"
export async function createClient() {
    const cookieStore = await cookies();
    return createServerClient(
        // public key
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            // start the cookie configuration
            cookies: {
                getAll() {
                    return cookieStore.getAll()

                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    }

                    catch {
                        // ignore
                    }
                },

            },
        }
    )
}