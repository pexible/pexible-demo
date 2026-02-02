import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import { getUsers, saveUsers, getSearches, saveSearches, getResults, saveResults, type User, type Search } from '@/lib/storage'
import { generateDemoResults } from '@/lib/demo-data'

export async function POST(req: Request) {
  try {
    const { email, password, first_name, job_title, postal_code } = await req.json()

    if (!email || !password || !first_name) {
      return NextResponse.json(
        { success: false, error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      )
    }

    if (first_name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Name muss mindestens 2 Zeichen haben' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Ungültige Email-Adresse' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Passwort muss mindestens 8 Zeichen haben' },
        { status: 400 }
      )
    }

    const usersData = await getUsers()

    if (usersData.users.find(u => u.email === email)) {
      return NextResponse.json(
        { success: false, error: 'Email bereits registriert' },
        { status: 400 }
      )
    }

    const user: User = {
      id: nanoid(),
      email,
      password_hash: await bcrypt.hash(password, 10),
      first_name: first_name.trim(),
      created_at: new Date().toISOString()
    }

    usersData.users.push(user)
    await saveUsers(usersData)

    // Optionally create search + results (from anonymous chat flow)
    let searchResult = null
    if (job_title && postal_code && /^\d{5}$/.test(postal_code)) {
      const searchId = nanoid()
      const demoResults = generateDemoResults(searchId, job_title, postal_code)

      const search: Search = {
        id: searchId,
        user_id: user.id,
        job_title,
        postal_code,
        status: 'completed',
        paid: false,
        total_results: demoResults.length,
        created_at: new Date().toISOString()
      }

      const searchesData = await getSearches()
      searchesData.searches.push(search)
      await saveSearches(searchesData)

      const resultsData = await getResults()
      resultsData.results.push(...demoResults)
      await saveResults(resultsData)

      searchResult = {
        search_id: searchId,
        total_results: demoResults.length,
      }
    }

    return NextResponse.json({
      success: true,
      user_id: user.id,
      first_name: user.first_name,
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
