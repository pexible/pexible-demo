import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import { getUsers, saveUsers, getSearches, saveSearches, getResults, saveResults, type User, type Search, type Result } from '@/lib/storage'

// Demo companies for synthetic results
const DEMO_COMPANIES = [
  { name: 'Siemens AG', domain: 'siemens.com' },
  { name: 'BMW Group', domain: 'bmw.com' },
  { name: 'SAP SE', domain: 'sap.com' },
  { name: 'Deutsche Bank', domain: 'deutsche-bank.de' },
  { name: 'Bosch', domain: 'bosch.com' },
  { name: 'Allianz', domain: 'allianz.com' },
  { name: 'Mercedes-Benz', domain: 'mercedes-benz.com' },
  { name: 'Volkswagen', domain: 'volkswagen.de' },
  { name: 'BASF', domain: 'basf.com' },
  { name: 'Bayer AG', domain: 'bayer.com' },
]

function generateDemoResults(searchId: string, jobTitle: string, postalCode: string): Result[] {
  // Shuffle and pick 7-10 companies
  const shuffled = [...DEMO_COMPANIES].sort(() => Math.random() - 0.5)
  const count = 7 + Math.floor(Math.random() * 4) // 7-10 results

  return shuffled.slice(0, count).map((company, index) => ({
    id: nanoid(),
    search_id: searchId,
    company_name: company.name,
    job_title: jobTitle,
    job_url: `https://careers.${company.domain}/jobs/${nanoid(8)}`,
    description: `${jobTitle} gesucht in ${postalCode}. ${company.name} bietet eine spannende Position mit attraktiven Konditionen.`,
    rank: index + 1
  }))
}

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
      status: 'completed',
      paid: false,
      total_results: 0,
      created_at: new Date().toISOString()
    }

    searchesData.searches.push(search)
    await saveSearches(searchesData)

    // Generate demo results for this search
    const demoResults = generateDemoResults(search.id, job_title, postal_code)
    const resultsData = await getResults()
    resultsData.results.push(...demoResults)
    await saveResults(resultsData)

    // Update search with result count
    search.total_results = demoResults.length
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
