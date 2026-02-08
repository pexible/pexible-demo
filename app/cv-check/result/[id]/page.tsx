'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useUser } from '@/lib/hooks/useUser'

interface CvCheckResult {
  id: string
  created_at: string
  original_score: number
  original_score_details: { ats?: number; content?: number } | null
  optimized_score: number
  optimized_score_details: { ats?: number; content?: number } | null
  changes_summary: Array<{ before: string; after: string; reason: string }>
  placeholders: Array<{ location: string; placeholder_text: string; suggestion: string }>
  tips: Array<{ title: string; description: string; category: string; impact: string }>
  status: string
  files_available: boolean
  files_expire_at: string
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22C55E'
  if (score >= 60) return '#EAB308'
  if (score >= 40) return '#F97316'
  return '#EF4444'
}

function ScoreComparison({
  label,
  before,
  after,
}: {
  label: string
  before: number
  after: number
}) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider mb-3">{label}</span>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="text-center">
          <span className="text-xs text-[#9CA3AF] block mb-1">Vorher</span>
          <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: getScoreColor(before) }}>
            {before}
          </span>
        </div>
        <svg className="w-6 h-6 text-[#F5B731]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <div className="text-center">
          <span className="text-xs text-[#9CA3AF] block mb-1">Nachher</span>
          <span className="text-2xl sm:text-3xl font-extrabold" style={{ color: getScoreColor(after) }}>
            {after}
          </span>
        </div>
      </div>
      {after > before && (
        <span className="text-xs text-green-600 font-medium mt-1">+{after - before} Punkte</span>
      )}
    </div>
  )
}

export default function CvCheckResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, isLoading: userLoading } = useUser()
  const [result, setResult] = useState<CvCheckResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login')
    }
  }, [user, userLoading, router])

  useEffect(() => {
    if (!user || !id) return

    async function fetchResult() {
      try {
        const res = await fetch(`/api/cv-check/results/${id}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || 'Ergebnis nicht gefunden.')
          return
        }
        const data: CvCheckResult = await res.json()
        setResult(data)
      } catch {
        setError('Fehler beim Laden des Ergebnisses.')
      } finally {
        setLoading(false)
      }
    }

    fetchResult()
  }, [user, id])

  // Extract two-dimensional scores from result
  const originalAts = result?.original_score_details?.ats ?? result?.original_score ?? 0
  const originalContent = result?.original_score_details?.content ?? 0
  const optimizedAts = result?.optimized_score_details?.ats ?? result?.optimized_score ?? 0
  const optimizedContent = result?.optimized_score_details?.content ?? 0

  return (
    <div className="min-h-screen bg-[#FDF8F0] text-[#1A1A2E]">
      <Navbar />

      <main id="main-content" className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {loading || userLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#E8E0D4] border-t-[#F5B731] rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <div className="bg-red-50 text-red-600 border border-red-200 rounded-xl px-6 py-4 text-sm mb-4 max-w-md mx-auto">
              {error}
            </div>
            <Link href="/cv-check" className="text-[#F5B731] hover:text-[#E8930C] font-medium text-sm">
              Zurück zum Lebenslauf-Check
            </Link>
          </div>
        ) : result ? (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                CV-Optimierung
              </h1>
              <p className="text-sm text-[#9CA3AF]">
                Erstellt am {new Date(result.created_at).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Score Comparison — Two Dimensions */}
            <div className="bg-white rounded-2xl border border-[#E8E0D4]/80 shadow-xl shadow-black/5 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
                <ScoreComparison label="ATS-Score" before={originalAts} after={optimizedAts} />
                <div className="hidden sm:block w-px h-20 bg-[#E8E0D4]" />
                <ScoreComparison label="Inhalts-Score" before={originalContent} after={optimizedContent} />
              </div>
            </div>

            {/* Changes */}
            {result.changes_summary?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-[#1A1A2E] mb-4">Änderungen</h2>
                <div className="space-y-3">
                  {result.changes_summary.slice(0, 5).map((change, i) => (
                    <div key={i} className="bg-white rounded-xl border border-[#E8E0D4]/80 p-4">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-red-500 text-sm shrink-0 mt-0.5">✗</span>
                          <p className="text-sm text-[#4A5568] line-through">{change.before}</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-green-500 text-sm shrink-0 mt-0.5">✓</span>
                          <p className="text-sm text-[#1A1A2E] font-medium">{change.after}</p>
                        </div>
                      </div>
                      <p className="text-xs text-[#9CA3AF] mt-2">{change.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Downloads */}
            <div className="bg-white rounded-2xl border border-[#E8E0D4]/80 shadow-xl shadow-black/5 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-[#1A1A2E] mb-4 text-center">Dokumente</h2>
              {result.files_available ? (
                <>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a
                      href={`/api/cv-check/download/${result.id}/pdf`}
                      className="inline-flex items-center gap-2 bg-[#F5B731] hover:bg-[#E8930C] text-[#1A1A2E] font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                    >
                      PDF herunterladen
                    </a>
                    <a
                      href={`/api/cv-check/download/${result.id}/docx`}
                      className="inline-flex items-center gap-2 bg-[#1A1A2E] hover:bg-[#2D2D44] text-white font-semibold text-sm px-6 py-3 rounded-xl transition-colors"
                    >
                      Word-Dokument herunterladen
                    </a>
                  </div>
                  <p className="text-xs text-[#9CA3AF] text-center mt-3">
                    Verfügbar bis {new Date(result.files_expire_at).toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </>
              ) : (
                <p className="text-center text-sm text-[#9CA3AF]">
                  Die Dateien sind nicht mehr verfügbar. Downloads waren 24 Stunden nach der Optimierung möglich.
                </p>
              )}
            </div>

            {/* Back link */}
            <div className="text-center">
              <Link href="/cv-check" className="text-sm text-[#4A5568] hover:text-[#1A1A2E] transition-colors">
                ← Zurück zum Lebenslauf-Check
              </Link>
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}
