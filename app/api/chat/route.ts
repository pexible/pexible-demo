import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import bcrypt from 'bcryptjs'
import { getUsers, saveUsers, getSearches, saveSearches, getResults, type User, type Search } from '@/lib/storage'

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      create_account: tool({
        description: 'Erstellt einen neuen Account mit allen gesammelten Daten',
        parameters: z.object({
          email: z.string().email(),
          password: z.string().min(8),
          first_name: z.string().min(2),
          job_title: z.string().min(3),
          postal_code: z.string().regex(/^\d{5}$/)
        }),
        execute: async (params) => {
          try {
            const usersData = await getUsers()
            
            // Check if email exists
            if (usersData.users.find(u => u.email === params.email)) {
              return { success: false, error: 'Email bereits registriert' }
            }

            // Create user
            const user: User = {
              id: nanoid(),
              email: params.email,
              password_hash: await bcrypt.hash(params.password, 10),
              first_name: params.first_name,
              created_at: new Date().toISOString()
            }
            
            usersData.users.push(user)
            await saveUsers(usersData)

            // Create search
            const searchesData = await getSearches()
            const search: Search = {
              id: nanoid(),
              user_id: user.id,
              job_title: params.job_title,
              postal_code: params.postal_code,
              status: 'pending',
              paid: false,
              total_results: 0,
              created_at: new Date().toISOString()
            }
            
            searchesData.searches.push(search)
            await saveSearches(searchesData)

            return {
              success: true,
              user_id: user.id,
              search_id: search.id,
              message: `Account erstellt! Deine Suche-ID: ${search.id}`
            }
          } catch (error) {
            return { success: false, error: 'Fehler beim Erstellen des Accounts' }
          }
        }
      }),

      check_results: tool({
        description: 'Prüft ob Ergebnisse für eine Search-ID vorhanden sind',
        parameters: z.object({
          search_id: z.string()
        }),
        execute: async ({ search_id }) => {
          try {
            const searchesData = await getSearches()
            const search = searchesData.searches.find(s => s.id === search_id)
            
            if (!search) {
              return { found: false, error: 'Suche nicht gefunden' }
            }

            const resultsData = await getResults()
            const searchResults = resultsData.results.filter(r => r.search_id === search_id)
            
            if (searchResults.length === 0) {
              return {
                found: false,
                status: search.status,
                message: 'Ergebnisse werden noch verarbeitet. Bitte warten...'
              }
            }

            const freemiumResults = searchResults.slice(0, 3)
            const paidResults = searchResults.slice(3)

            return {
              found: true,
              paid: search.paid,
              total_results: searchResults.length,
              freemium_results: freemiumResults.map(r => ({
                company: r.company_name,
                title: r.job_title,
                url: r.job_url
              })),
              locked_count: paidResults.length
            }
          } catch (error) {
            return { found: false, error: 'Fehler beim Abrufen der Ergebnisse' }
          }
        }
      }),

      create_payment: tool({
        description: 'Erstellt einen Stripe Payment Link für €49',
        parameters: z.object({
          search_id: z.string()
        }),
        execute: async ({ search_id }) => {
          // In Demo: Simuliere Zahlung direkt
          try {
            const searchesData = await getSearches()
            const searchIndex = searchesData.searches.findIndex(s => s.id === search_id)
            
            if (searchIndex === -1) {
              return { success: false, error: 'Suche nicht gefunden' }
            }

            // Für Demo: Direkt auf paid setzen
            searchesData.searches[searchIndex].paid = true
            await saveSearches(searchesData)

            const resultsData = await getResults()
            const allResults = resultsData.results
              .filter(r => r.search_id === search_id)
              .map(r => ({
                company: r.company_name,
                title: r.job_title,
                url: r.job_url,
                description: r.description
              }))

            return {
              success: true,
              message: 'Zahlung erfolgreich! (Demo-Modus)',
              all_results: allResults
            }
          } catch (error) {
            return { success: false, error: 'Fehler bei der Zahlung' }
          }
        }
      })
    },
    system: `Du bist der pexible Job-Makler - ein freundlicher, professioneller AI-Agent, der Menschen bei der Jobsuche hilft.

DEIN PROZESS:
1. Begrüße den Nutzer freundlich und erkläre, dass du ihm hilfst, passende Jobs zu finden
2. Sammle folgende Informationen im Gespräch (natürlich, nicht wie ein Formular):
   - Welche Stelle sucht die Person? (job_title)
   - In welcher Region? (postal_code - 5-stellig)
   - Vorname (first_name)
   - Email (email)
   - Passwort für den Account (password - mindestens 8 Zeichen)

3. Wenn du ALLE Daten hast, rufe create_account() auf

4. Nach erfolgreicher Account-Erstellung:
   - Erkläre, dass die Suche jetzt läuft
   - Nutze check_results() mit der erhaltenen search_id
   - Wenn Ergebnisse da sind, zeige die 3 Freemium-Treffer

5. Biete an, alle Ergebnisse für €49 freizuschalten
   - Bei Zustimmung: create_payment() aufrufen
   - Zeige dann ALLE Ergebnisse an

WICHTIG:
- Sei conversational, nicht roboterhaft
- Validiere Eingaben (PLZ muss 5 Ziffern sein, Email muss @ enthalten, etc.)
- Wenn Daten fehlen, frage freundlich nach
- Formatiere Ergebnisse übersichtlich mit Firmennamen und Links
- Bei Freemium: Weise darauf hin, dass noch X weitere Treffer verfügbar sind`
  })

  return result.toDataStreamResponse()
}
