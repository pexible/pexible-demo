import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { getSearches, saveSearches, getResults, type Search } from '@/lib/storage'

export const maxDuration = 30

export async function POST(req: Request) {
  const body = await req.json()
  const { messages } = body

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    maxSteps: 5,
    tools: {
      request_registration: tool({
        description: 'Fordert den Nutzer auf, sich über das sichere Registrierungsformular anzumelden. Wird aufgerufen wenn job_title, postal_code, first_name und email gesammelt wurden.',
        parameters: z.object({
          email: z.string().email(),
          first_name: z.string().min(2),
          job_title: z.string().min(3),
          postal_code: z.string().regex(/^\d{5}$/)
        }),
        execute: async (params) => {
          return {
            action: 'show_registration_modal',
            data: params,
            message: 'Bitte vervollständige deine Registrierung im sicheren Formular.'
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

            if (search.paid) {
              return {
                found: true,
                paid: true,
                total_results: searchResults.length,
                all_results: searchResults.map(r => ({
                  company: r.company_name,
                  title: r.job_title,
                  url: r.job_url,
                  description: r.description
                }))
              }
            }

            const freemiumResults = searchResults.slice(0, 3)
            const paidResults = searchResults.slice(3)

            return {
              found: true,
              paid: false,
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

2. SAMMLE DIE STELLENBEZEICHNUNG (job_title) - SEI SEHR PRÄZISE:
   - Frage zuerst nach dem Berufsfeld/Bereich
   - Bei VAGEN ANTWORTEN wie Branchennamen MUSST du IMMER nachbohren:

     "Finanzwesen/Finance" → "Super! Welche konkrete Position suchst du? Z.B. Controller, Buchhalter, Finanzanalyst, CFO, Steuerberater, Wirtschaftsprüfer?"
     "IT" → "Verstehe! Welche IT-Rolle genau? Z.B. Softwareentwickler, DevOps Engineer, IT-Administrator, Data Scientist, Product Manager, IT-Consultant?"
     "Marketing" → "Interessant! Welcher Marketing-Bereich? Z.B. Marketing Manager, SEO-Spezialist, Content Manager, Social Media Manager, Brand Manager?"
     "Vertrieb/Sales" → "Klasse! Welche Vertriebsposition? Z.B. Account Manager, Sales Manager, Key Account Manager, Vertriebsleiter, Business Development?"
     "HR/Personal" → "Gut! Welche HR-Funktion? Z.B. Recruiter, HR Business Partner, Personalreferent, HR Manager, Talent Acquisition?"
     "Gesundheit" → "Welcher Bereich genau? Z.B. Krankenpfleger, Arzt, Physiotherapeut, Medizinische Fachangestellte, Pflegedienstleitung?"
     "Ingenieur" → "Welche Fachrichtung? Z.B. Maschinenbauingenieur, Elektroingenieur, Bauingenieur, Verfahrenstechniker, Projektingenieur?"

   - Stelle 2-3 Follow-up-Fragen bis du eine EXAKTE Stellenbezeichnung hast
   - Die Stellenbezeichnung muss so spezifisch sein, wie sie auf einer Unternehmenswebsite stehen würde
   - Beispiele für GUTE finale Titel: "Senior Softwareentwickler Java", "Key Account Manager DACH", "Controller mit SAP-Erfahrung"
   - Beispiele für ZU VAGE (nicht akzeptieren): "IT", "Marketing", "irgendwas mit Finanzen"

3. SAMMLE DEN ORT (postal_code) - SEI PRÄZISE:
   - Frage nach dem gewünschten Arbeitsort
   - Bei vagen Antworten wie "Süddeutschland", "Bayern", "Raum Frankfurt" MUSST du nachfragen:
     "In welcher Stadt oder welchem Umkreis genau? Gib mir bitte eine konkrete Stadt oder Postleitzahl."
   - Akzeptiere: 5-stellige PLZ ODER konkreten Stadtnamen (dann schätze die PLZ)
   - Beispiele für Konvertierung:
     "München" → "80331"
     "Berlin" → "10115"
     "Hamburg" → "20095"
     "Frankfurt" → "60311"
     "Köln" → "50667"

4. Sammle persönliche Daten:
   - Vorname (first_name)
   - Email (email)
   - FRAGE NIEMALS NACH DEM PASSWORT IM CHAT!

5. Wenn du job_title, postal_code, first_name und email hast:
   - Rufe request_registration() auf
   - Das öffnet ein sicheres Modal für die Passwort-Eingabe
   - Sage: "Perfekt! Bitte vervollständige jetzt deine Registrierung im sicheren Formular, das sich gerade öffnet."

6. Nach erfolgreicher Registrierung (du erhältst eine search_id):
   - Erkläre, dass die Suche jetzt läuft
   - Nutze check_results() mit der erhaltenen search_id
   - Wenn Ergebnisse da sind, zeige die 3 Freemium-Treffer

7. Biete an, alle Ergebnisse für €49 freizuschalten
   - Bei Zustimmung: create_payment() aufrufen
   - Zeige dann ALLE Ergebnisse an

WICHTIG:
- Sei conversational, nicht roboterhaft
- BEI VAGEN JOB-ANGABEN: IMMER nachbohren mit konkreten Beispielen
- BEI VAGEN ORTSANGABEN: IMMER nach konkreter Stadt/PLZ fragen
- Validiere Eingaben (PLZ muss 5 Ziffern sein, Email muss @ enthalten, etc.)
- Formatiere Ergebnisse übersichtlich mit Firmennamen und Links
- Bei Freemium: Weise darauf hin, dass noch X weitere Treffer verfügbar sind
- NIEMALS nach Passwort im Chat fragen - das wird sicher über das Modal gehandhabt`
  })

  return result.toDataStreamResponse()
}
