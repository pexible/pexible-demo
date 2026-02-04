import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateDemoResults } from '@/lib/demo-data'

// Registration endpoint for anonymous chat flow.
// The user is already authenticated via Supabase OTP at this point.
// This route creates/updates their profile and optionally creates search + demo results.
export async function POST(req: Request) {
  try {
    const { first_name, job_title, postal_code } = await req.json()

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Nicht autorisiert. Bitte melde dich zuerst an.' },
        { status: 401 }
      )
    }

    if (!first_name || first_name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Name muss mindestens 2 Zeichen haben' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Update profile with first_name
    await admin
      .from('profiles')
      .update({ first_name: first_name.trim() })
      .eq('id', user.id)

    // Create search + results if job_title and postal_code provided
    let searchResult = null
    if (job_title && postal_code && /^\d{5}$/.test(postal_code)) {
      const searchId = nanoid()
      const demoResults = generateDemoResults(searchId, job_title, postal_code)

      const search = {
        id: searchId,
        user_id: user.id,
        job_title,
        postal_code,
        status: 'completed',
        paid: false,
        total_results: demoResults.length,
        created_at: new Date().toISOString(),
      }

      await admin.from('searches').insert(search)
      await admin.from('results').insert(demoResults)

      searchResult = {
        search_id: searchId,
        total_results: demoResults.length,
      }
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
      first_name: first_name.trim(),
      search: searchResult,
    })
  } catch (error) {
    console.error('Registration error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: `Fehler: ${errorMessage}` },
      { status: 500 }
    )
  }
}
