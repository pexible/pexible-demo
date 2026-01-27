import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import { getUsers, saveUsers, getSearches, saveSearches, type User, type Search } from '@/lib/storage'

export async function POST(req: Request) {
  try {
    const { email, password, first_name, job_title, postal_code } = await req.json()

    // Validate input
    if (!email || !password || !first_name || !job_title || !postal_code) {
      return NextResponse.json(
        { success: false, error: 'Alle Felder sind erforderlich' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Passwort muss mindestens 8 Zeichen haben' },
        { status: 400 }
      )
    }

    if (!/^\d{5}$/.test(postal_code)) {
      return NextResponse.json(
        { success: false, error: 'PLZ muss 5 Ziffern haben' },
        { status: 400 }
      )
    }

    if (!email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Ungültige Email-Adresse' },
        { status: 400 }
      )
    }

    const usersData = await getUsers()

    // Check if email exists
    if (usersData.users.find(u => u.email === email)) {
      return NextResponse.json(
        { success: false, error: 'Email bereits registriert' },
        { status: 400 }
      )
    }

    // Create user
    const user: User = {
      id: nanoid(),
      email,
      password_hash: await bcrypt.hash(password, 10),
      first_name,
      created_at: new Date().toISOString()
    }

    usersData.users.push(user)
    await saveUsers(usersData)

    // Create search
    const searchesData = await getSearches()
    const search: Search = {
      id: nanoid(),
      user_id: user.id,
      job_title,
      postal_code,
      status: 'pending',
      paid: false,
      total_results: 0,
      created_at: new Date().toISOString()
    }

    searchesData.searches.push(search)
    await saveSearches(searchesData)

    return NextResponse.json({
      success: true,
      user_id: user.id,
      search_id: search.id,
      first_name: user.first_name,
      message: `Account erstellt! Deine Suche-ID: ${search.id}`
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
