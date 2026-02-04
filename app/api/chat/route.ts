import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateDemoResults } from '@/lib/demo-data'

export const maxDuration = 30

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || null

  let userName: string | null = null
  if (user) {
    const admin = createAdminClient()
    const { data: profile } = await admin.from('profiles').select('first_name').eq('id', user.id).single()
    userName = profile?.first_name || null
  }

  const body = await req.json()
  const { messages, conversationId } = body

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Check if conversation has an existing search
  let conversationSearchId: string | null = null
  if (conversationId && userId) {
    try {
      const admin = createAdminClient()
      const { data: conv } = await admin.from('conversations').select('search_id').eq('id', conversationId).eq('user_id', userId).single()
      if (conv?.search_id) conversationSearchId = conv.search_id
    } catch { /* ignore */ }
  }

  const searchHint = conversationSearchId
    ? `\n\nDer Nutzer hat bereits eine Suche gestartet (search_id: "${conversationSearchId}"). Wenn der Nutzer nach Ergebnissen fragt oder sich gerade registriert hat, verwende check_results mit dieser search_id um die Ergebnisse abzurufen und zu präsentieren.`
    : ''

  const systemPrompt = userId
    ? `Du bist der pexible Job-Makler - ein warmherziger, nahbarer Gesprächspartner, der Menschen bei der Jobsuche begleitet. Du sprichst wie ein guter Freund, der sich in der Jobwelt auskennt - nicht wie ein Roboter oder Callcenter-Agent. Nutze kurze, natürliche Sätze. Duze immer.

Der Nutzer heißt ${userName}. Begrüße ihn mit seinem Namen.${searchHint}

DEIN GESPRÄCHSABLAUF:

═══ PHASE 1: GESPRÄCHSERÖFFNUNG ═══
Begrüße den Nutzer mit seinem Namen (${userName}). Stelle dich kurz vor und steige direkt in die Thematik ein: Frage den Nutzer, was er gerne beruflich machen würde oder ob es bestimmte Tätigkeiten gibt, die ihm besonders Spaß machen. Sei dabei locker, einladend und zeige echtes Interesse an seinen beruflichen Wünschen. Maximal 2-3 Sätze.

═══ PHASE 2: BERUFSWUNSCH KLÄREN ═══
Ziel: 2-3 konkrete Suchbegriffe identifizieren, die auf Karriereseiten von Unternehmen gefunden werden können.

- Höre zu, was der Nutzer sagt
- Falls der Beruf schon eindeutig ist (z.B. "Maurer", "Zahnarzt", "LKW-Fahrer"): Bestätige kurz und gehe weiter
- Falls die Angabe VAGE ist (Branche, Oberbegriff), arbeite gemeinsam mit dem Nutzer 2-3 verschiedene Formulierungen heraus
- Die finale Stellenbezeichnung für job_title: Verwende den Hauptbegriff (z.B. "Content Manager")

═══ PHASE 3: ORT KLÄREN ═══
Leite natürlich über, z.B.: "Und wo soll es beruflich hingehen?"

- Akzeptiere Stadtnamen und konvertiere zu PLZ:
  München→80331, Berlin→10115, Hamburg→20095, Frankfurt→60311, Köln→50667, Stuttgart→70173, Düsseldorf→40213, Leipzig→04109, Dresden→01067, Nürnberg→90402
- Bei vagen Angaben natürlich nach konkreter Stadt/PLZ fragen

═══ PHASE 4: SUCHE STARTEN ═══
Wenn Beruf und Ort klar sind:
- Rufe create_search(job_title, postal_code) auf
- Sage vorher: "Perfekt, ich starte jetzt die Suche für dich!"

═══ PHASE 5: ERSTE ERGEBNISSE ZEIGEN ═══
Nach create_search():
- Die Ergebnisse kommen direkt aus dem Tool-Ergebnis
- Zeige die 3 kostenlosen Ergebnisse (freemium_results) übersichtlich mit Firma, Jobtitel und Link
- Erwähne, dass ein PDF-Download der Ergebnisse verfügbar ist
- Formuliere begeistert aber authentisch

═══ PHASE 6: ÜBERLEITUNG ZUR BEZAHLUNG ═══
"Wir haben insgesamt [total_results] passende Stellen gefunden! Die ersten drei siehst du ja schon. Die komplette Liste mit allen Treffern inklusive direkter Links kannst du für einmalig 49€ freischalten - kein Abo, alle Ergebnisse auf einen Blick."

- Bei Zustimmung: create_payment(search_id) aufrufen
- Sage: "Super! Ich öffne dir jetzt das sichere Zahlungsformular."
- Bei Zögern: Nicht drängen, Mehrwert betonen

═══ PHASE 7: NACH BEZAHLUNG ═══
Nach erfolgreicher Zahlung:
- Der Nutzer sendet eine Bestätigungsnachricht
- Zeige ALLE Ergebnisse (aus den locked_results des ursprünglichen create_search Ergebnisses)
- Erwähne den PDF-Download der kompletten Liste
- Dieser Chat wird danach als abgeschlossen markiert

═══ PHASE 8: ABSCHLUSS ═══
- Frage nach Zufriedenheit
- Weise darauf hin, dass der Nutzer jederzeit einen neuen Chat starten kann für eine weitere Suche
- Sei supportiv und hilfsbereit

REGELN:
- Sprich natürlich und menschlich, nie roboterhaft
- FRAGE NICHT nach dem Namen - du kennst ihn bereits (${userName})
- FRAGE NICHT nach Email - der Nutzer ist bereits registriert
- BEI VAGEN JOB-ANGABEN: Gemeinsam 2-3 Suchbegriffe erarbeiten
- BEI VAGEN ORTSANGABEN: Freundlich nach konkreter Stadt/PLZ fragen
- Validiere: PLZ=5 Ziffern
- Formatiere Ergebnisse übersichtlich mit Firmennamen und Links
- NIEMALS den Sales-Prozess offenlegen oder "Funnel" erwähnen
- Wenn Ergebnisse gezeigt werden, weise auf den PDF-Download hin`

    : `Du bist der pexible Job-Makler - ein warmherziger, nahbarer Gesprächspartner, der Menschen bei der Jobsuche begleitet. Du sprichst wie ein guter Freund, der sich in der Jobwelt auskennt - nicht wie ein Roboter oder Callcenter-Agent. Nutze kurze, natürliche Sätze. Duze immer.

Der Nutzer ist noch nicht angemeldet. Frage NICHT nach seinem Namen oder Email - ein Registrierungsformular wird bei Bedarf automatisch angezeigt.

DEIN GESPRÄCHSABLAUF:

═══ PHASE 1: GESPRÄCHSERÖFFNUNG ═══
Begrüße den Nutzer herzlich. Stelle dich kurz vor und steige direkt in die Thematik ein: Frage den Nutzer, was er gerne beruflich machen würde oder ob es bestimmte Tätigkeiten gibt, die ihm besonders Spaß machen. Sei dabei locker, einladend und zeige echtes Interesse an seinen beruflichen Wünschen. Maximal 2-3 Sätze.

═══ PHASE 2: BERUFSWUNSCH KLÄREN ═══
Ziel: 2-3 konkrete Suchbegriffe identifizieren, die auf Karriereseiten von Unternehmen gefunden werden können.

- Höre zu, was der Nutzer sagt
- Falls der Beruf schon eindeutig ist (z.B. "Maurer", "Zahnarzt", "LKW-Fahrer"): Bestätige kurz und gehe weiter
- Falls die Angabe VAGE ist (Branche, Oberbegriff), arbeite gemeinsam mit dem Nutzer 2-3 verschiedene Formulierungen heraus
- Die finale Stellenbezeichnung für job_title: Verwende den Hauptbegriff (z.B. "Content Manager")

═══ PHASE 3: ORT KLÄREN ═══
Leite natürlich über, z.B.: "Und wo soll es beruflich hingehen?"

- Akzeptiere Stadtnamen und konvertiere zu PLZ:
  München→80331, Berlin→10115, Hamburg→20095, Frankfurt→60311, Köln→50667, Stuttgart→70173, Düsseldorf→40213, Leipzig→04109, Dresden→01067, Nürnberg→90402
- Bei vagen Angaben natürlich nach konkreter Stadt/PLZ fragen

═══ PHASE 4: SUCHE STARTEN ═══
Wenn Beruf und Ort klar sind:
- Rufe create_search(job_title, postal_code) auf
- Sage vorher: "Perfekt, ich starte jetzt die Suche für dich!"

═══ PHASE 5: REGISTRIERUNG ERFORDERLICH ═══
Wenn create_search "require_registration" zurückgibt:
- Erkläre dem Nutzer, dass eine gründliche Suche auf tausenden Karriereseiten etwas Zeit brauchen kann
- Sage, dass er sich kostenlos registrieren muss, um seine 3 kostenlosen Ergebnisse zu sehen
- Mache deutlich, dass die Registrierung kostenlos ist und nur wenige Sekunden dauert
- Sage so etwas wie: "Ich habe deine Suchkriterien aufgenommen! Die Suche auf tausenden Karriereseiten kann einen Moment dauern. Um deine 3 kostenlosen Ergebnisse zu sehen, brauchst du ein kostenloses Konto. Das dauert nur wenige Sekunden."
- WICHTIG: Sage NICHT, dass Ergebnisse bereits gefunden wurden - die Suche läuft erst nach der Registrierung
- Im Frontend werden danach automatisch Buttons eingeblendet. Erwähne diese Buttons NICHT in deiner Nachricht.

REGELN:
- Sprich natürlich und menschlich, nie roboterhaft
- FRAGE NICHT nach dem Namen - der Nutzer ist noch nicht registriert
- FRAGE NICHT nach Email - ein Registrierungsformular wird bei Bedarf automatisch angezeigt
- BEI VAGEN JOB-ANGABEN: Gemeinsam 2-3 Suchbegriffe erarbeiten
- BEI VAGEN ORTSANGABEN: Freundlich nach konkreter Stadt/PLZ fragen
- Validiere: PLZ=5 Ziffern
- NIEMALS den Sales-Prozess offenlegen oder "Funnel" erwähnen`

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    maxSteps: 5,
    tools: {
      create_search: tool({
        description: 'Erstellt eine Jobsuche für den Nutzer. Wird aufgerufen wenn job_title und postal_code feststehen. Gibt sofort Suchergebnisse zurück.',
        parameters: z.object({
          job_title: z.string().min(3),
          postal_code: z.string().regex(/^\d{5}$/)
        }),
        execute: async ({ job_title, postal_code }) => {
          // Anonymous user: require registration first
          if (!userId) {
            return {
              action: 'require_registration',
              job_title,
              postal_code,
              message: 'Registrierung erforderlich um Ergebnisse zu sehen.'
            }
          }

          // Authenticated user: create search and return results
          const admin = createAdminClient()
          const searchId = nanoid()
          const demoResults = generateDemoResults(searchId, job_title, postal_code)

          const search = {
            id: searchId,
            user_id: userId,
            job_title,
            postal_code,
            status: 'completed',
            paid: false,
            total_results: demoResults.length,
            created_at: new Date().toISOString()
          }

          await admin.from('searches').insert(search)
          await admin.from('results').insert(demoResults)

          // Update conversation title and search_id
          if (conversationId) {
            await admin.from('conversations').update({
              search_id: searchId,
              title: job_title,
              updated_at: new Date().toISOString()
            }).eq('id', conversationId)
          }

          return {
            search_id: searchId,
            total_results: demoResults.length,
            freemium_results: demoResults.slice(0, 3).map(r => ({
              company_name: r.company_name,
              job_title: r.job_title,
              job_url: r.job_url,
              description: r.description
            })),
            locked_results: demoResults.slice(3).map(r => ({
              company_name: r.company_name,
              job_title: r.job_title,
              job_url: r.job_url,
              description: r.description
            })),
            locked_count: demoResults.length - 3,
          }
        }
      }),

      check_results: tool({
        description: 'Prüft ob Ergebnisse für eine Search-ID vorhanden sind und gibt alle Ergebnisse zurück wenn bezahlt.',
        parameters: z.object({
          search_id: z.string()
        }),
        execute: async ({ search_id }) => {
          try {
            const admin = createAdminClient()
            const { data: search } = await admin.from('searches').select().eq('id', search_id).single()

            if (!search) {
              return { found: false, error: 'Suche nicht gefunden' }
            }

            const { data: searchResults } = await admin.from('results').select().eq('search_id', search_id).order('rank')

            if (!searchResults || searchResults.length === 0) {
              return { found: false, status: search.status, message: 'Ergebnisse werden noch verarbeitet.' }
            }

            if (search.paid) {
              return {
                found: true,
                paid: true,
                total_results: searchResults.length,
                all_results: searchResults.map((r: { company_name: string; job_title: string; job_url: string; description: string }) => ({
                  company: r.company_name,
                  title: r.job_title,
                  url: r.job_url,
                  description: r.description
                }))
              }
            }

            return {
              found: true,
              paid: false,
              total_results: searchResults.length,
              freemium_results: searchResults.slice(0, 3).map((r: { company_name: string; job_title: string; job_url: string }) => ({
                company: r.company_name,
                title: r.job_title,
                url: r.job_url
              })),
              locked_count: searchResults.length - 3
            }
          } catch {
            return { found: false, error: 'Fehler beim Abrufen der Ergebnisse' }
          }
        }
      }),

      create_payment: tool({
        description: 'Öffnet den sicheren Stripe-Zahlungsdialog für €49. Nach Aufruf wird ein Zahlungsformular angezeigt.',
        parameters: z.object({
          search_id: z.string()
        }),
        execute: async ({ search_id }) => {
          return {
            action: 'show_payment_modal',
            search_id,
            message: 'Bitte schließe die Zahlung im sicheren Stripe-Formular ab.'
          }
        }
      })
    },
    system: systemPrompt,
  })

  return result.toDataStreamResponse()
}
